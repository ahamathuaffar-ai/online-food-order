import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import './App.css';
import SiteLayout from './components/SiteLayout';
import FoodDialogs from './components/FoodDialogs';
import { heroSlides, safeImage } from './data/menu';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const ROUTE_PAGES = {
  '/': 'home',
  '/menu': 'menu',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/orders': 'orders',
  '/profile': 'profile',
  '/admin': 'admin',
  '/login': 'login',
  '/register': 'register',
  '/admin/login': 'admin-login',
};
const PAGE_ROUTES = {
  home: '/',
  menu: '/menu',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  profile: '/profile',
  admin: '/admin',
  login: '/login',
  register: '/register',
  'admin-login': '/admin/login',
};
const pageFromPath = (pathname) => ROUTE_PAGES[pathname] || 'home';

const readSaved = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Unable to load ${key} from local storage.`, error);
    return fallback;
  }
};
const normalizeFood = (food) => ({
  ...food,
  id: food._id || food.id,
  categoryId: typeof food.category === 'object' ? food.category?._id : food.category,
  category: typeof food.category === 'object' ? food.category?.name || '' : food.category || '',
  popular: Boolean(food.popular),
});
const normalizeCategory = (category) => ({ id: category._id || category.id, name: category.name });
const normalizeCart = (cart) => (cart?.items || []).map((item) => ({
  id: item.food?._id || item.food?.id || item.food,
  quantity: item.quantity,
}));
const normalizeOrderStatus = (status) => {
  const value = typeof status === 'string' ? status.trim() : '';
  if (!value) return 'Received';
  const lookup = {
    received: 'Received',
    preparing: 'Preparing',
    'on the way': 'On the way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return lookup[value.toLowerCase()] || value;
};

const normalizeOrder = (order) => ({
  id: order._id || order.id,
  userEmail: order.user?.email || order.userEmail || '',
  customer: order.user?.name || order.customer || '',
  address: order.address,
  paymentMethod: order.paymentMethod || 'Cash on delivery',
  note: order.note || '',
  items: (order.items || []).map((item) => ({
    id: item.food?._id || item.food?.id || item.food,
    name: item.name || item.food?.name || '',
    price: item.price,
    quantity: item.quantity,
  })),
  total: order.totalAmount ?? order.total,
  status: normalizeOrderStatus(order.status),
  createdAt: order.createdAt,
});
const defaultPaymentSettings = {
  qrCode: null,
  paymentMethods: [
    { name: 'Cash on delivery', enabled: true, showQr: false },
    { name: 'UPI', enabled: true, showQr: true },
    { name: 'Card', enabled: true, showQr: false },
    { name: 'Demo QR', enabled: true, showQr: true },
  ],
};
const readToken = () => localStorage.getItem('moonlight-token') || '';

function App() {
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname));
  const [foods, setFoods] = useState([]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [cart, setCart] = useState(() => readSaved('moonlight-cart', []));
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const categories = categoryRecords.map((item) => item.name);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [toast, setToast] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [editingFood, setEditingFood] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [returnPage, setReturnPage] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [orders, setOrders] = useState([]);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(defaultPaymentSettings);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    if (token) localStorage.removeItem('moonlight-cart');
    else localStorage.setItem('moonlight-cart', JSON.stringify(cart));
    localStorage.removeItem('moonlight-user');
    if (token) localStorage.setItem('moonlight-token', token);
    else localStorage.removeItem('moonlight-token');
  }, [cart, token]);

  useEffect(() => {
    let active = true;
    api.getFoods()
      .then((items) => { if (active) setFoods(items.filter((food) => food.available !== false).map(normalizeFood)); })
      .catch((error) => { if (active) notify(`Could not load the menu: ${error.message}`); });
    api.getCategories()
      .then((items) => { if (active) setCategoryRecords(items.map(normalizeCategory)); })
      .catch((error) => { if (active) notify(`Could not load categories: ${error.message}`); });
    api.getPaymentSettings()
      .then((settings) => { if (active) setPaymentSettings(settings); })
      .catch((error) => { if (active) notify(`Could not load payment options: ${error.message}`); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    api.getProfile(token)
      .then((profile) => { if (active) setUser(profile); })
      .catch((error) => {
        if (!active) return;
        setToken('');
        setUser(null);
        notify(`Your session has expired: ${error.message}`);
      });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!token || !userId) return undefined;
    let active = true;
    api.getCart(token)
      .then((result) => { if (active) setCart(normalizeCart(result)); })
      .catch((error) => { if (active) notify(`Could not load your cart: ${error.message}`); });
    return () => { active = false; };
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId || (page !== 'orders' && page !== 'admin')) return undefined;
    let active = true;
    api.getOrders(token, userRole === 'admin')
      .then((items) => { if (active) setOrders(items.map(normalizeOrder)); })
      .catch((error) => { if (active) notify(`Could not load orders: ${error.message}`); });
    return () => { active = false; };
  }, [page, token, userId, userRole]);

  useEffect(() => {
    const listener = (event) => { setPage(event.detail); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.addEventListener('moonlight-page', listener);
    return () => window.removeEventListener('moonlight-page', listener);
  }, []);

  useEffect(() => {
    const syncPageFromPath = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', syncPageFromPath);
    return () => window.removeEventListener('popstate', syncPageFromPath);
  }, []);

  useEffect(() => {
    const route = PAGE_ROUTES[page] || '/';
    if (window.location.pathname !== route) {
      window.history.replaceState(null, '', route);
    }
  }, [page]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (page !== 'home' || reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [page]);

  const filteredFoods = useMemo(() => foods.filter((food) => (
    (category === 'All' || food.category === category)
    && `${food.name} ${food.description} ${food.category}`.toLowerCase().includes(search.toLowerCase())
  )), [foods, category, search]);

  const cartItems = useMemo(() => cart.map((line) => ({
    ...line,
    food: foods.find((food) => food.id === line.id),
  })).filter((line) => line.food), [cart, foods]);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartItems.reduce((sum, line) => sum + line.food.price * line.quantity, 0);
  const delivery = subtotal ? 40 : 0;

  const navigate = (destination) => {
    if (destination === 'orders' && !user) { setAuthMode('login'); setPage('login'); return; }
    if (destination === 'profile' && !user) { setAuthMode('login'); setPage('login'); return; }
    if (destination === 'checkout' && !user) { setAuthMode('login'); setReturnPage('checkout'); setPage('login'); return; }
    if (destination === 'admin' && user?.role !== 'admin') { setAuthMode('admin'); setPage('admin-login'); return; }
    setMobileMenu(false);
    window.history.pushState(null, '', PAGE_ROUTES[destination] || '/');
    setPage(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const notify = (message) => setToast(message);

  const addToCart = async (id) => {
    if (!foods.some((food) => food.id === id)) {
      notify('This item is no longer available. Refresh the menu and try again.');
      return;
    }
    if (token) {
      try {
        const updatedCart = await api.addToCart(token, id);
        setCart(normalizeCart(updatedCart));
      } catch (error) {
        notify(`Could not add this item to your cart: ${error.message}`);
        return;
      }
    } else {
      setCart((current) => {
        const found = current.find((line) => line.id === id);
        return found
          ? current.map((line) => line.id === id ? { ...line, quantity: line.quantity + 1 } : line)
          : [...current, { id, quantity: 1 }];
      });
    }
    notify('Added to your cart.');
  };

  const changeQuantity = async (id, amount) => {
    const currentLine = cart.find((line) => line.id === id);
    if (!currentLine) return;
    const quantity = currentLine.quantity + amount;
    if (token) {
      try {
        const updatedCart = await api.updateCart(token, id, quantity);
        setCart(normalizeCart(updatedCart));
      } catch (error) {
        notify(`Could not update your cart: ${error.message}`);
      }
      return;
    }
    setCart((current) => current.map((line) => line.id === id ? { ...line, quantity } : line).filter((line) => line.quantity > 0));
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim().toLowerCase();
    const password = String(form.get('password'));
    const isRegister = authMode === 'register';
    try {
      const response = isRegister
        ? await api.register({ name: String(form.get('name')).trim(), email, password })
        : await api.login({ email, password });
      if (authMode === 'admin' && response.user.role !== 'admin') {
        notify('This account does not have restaurant admin access.');
        return;
      }

      const guestCart = cart;
      let syncedCart;
      try {
        let serverCart = await api.getCart(response.token);
        for (const item of guestCart) {
          serverCart = await api.addToCart(response.token, item.id, item.quantity);
        }
        syncedCart = normalizeCart(serverCart);
      } catch (error) {
        notify(`Signed in, but your cart could not be synced: ${error.message}`);
      }

      setOrders([]);
      if (syncedCart) setCart(syncedCart);
      setToken(response.token);
      setUser(response.user);
      setPage(response.user.role === 'admin' ? 'admin' : (returnPage || 'home'));
      setReturnPage(null);
      if (!isRegister) notify('Welcome back!');
      else notify('Your account is ready. Welcome to MooNLight!');
    } catch (error) {
      notify(error.message);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = String(form.get('address')).trim();
    const phone = String(form.get('phone')).trim();
    if (!address || !cartItems.length) return;
    try {
      const result = await api.createOrder(token, {
        address,
        phone,
        paymentMethod: String(form.get('paymentMethod')),
        note: String(form.get('note') || '').trim(),
      });
      setOrders((current) => [{
        ...normalizeOrder(result.order),
        userEmail: user.email,
        customer: user.name,
      }, ...current]);
      setCart([]);
      const updatedUser = { ...user, address, phone };
      setUser(updatedUser);
      setPage('orders');
      notify('Order placed. The kitchen is on it!');
    } catch (error) {
      notify(`Could not place your order: ${error.message}`);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated = { ...user, name: String(form.get('name')).trim(), phone: String(form.get('phone')).trim(), address: String(form.get('address')).trim() };
    try {
      setUser(await api.updateProfile(token, updated));
      notify('Your details have been saved.');
    } catch (error) {
      notify(`Could not save your details: ${error.message}`);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const updated = await api.updateOrderStatus(token, id, status);
      setOrders((current) => current.map((order) => order.id === id ? normalizeOrder(updated) : order));
      notify('Order status updated.');
    } catch (error) {
      notify(`Could not update order status: ${error.message}`);
    }
  };

  const cancelOrder = async (id) => {
    setCancellingOrderId(id);
    try {
      const cancelled = await api.cancelOrder(token, id);
      setOrders((current) => current.map((order) => order.id === id ? normalizeOrder(cancelled) : order));
      notify('Your order has been cancelled.');
    } catch (error) {
      notify(`Could not cancel your order: ${error.message}`);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const savePaymentSettings = async (settings) => {
    setSavingPaymentSettings(true);
    try {
      setPaymentSettings(await api.savePaymentSettings(token, settings));
      notify('Payment settings saved.');
    } catch (error) {
      notify(`Could not save payment settings: ${error.message}`);
    } finally {
      setSavingPaymentSettings(false);
    }
  };

  const saveFood = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const categoryRecord = categoryRecords.find((item) => item.name === String(form.get('category')));
    if (!categoryRecord) {
      notify('Choose a category that exists on the menu.');
      return;
    }
    const details = {
      name: String(form.get('name')).trim(),
      category: categoryRecord.id,
      price: Number(form.get('price')),
      description: String(form.get('description')).trim(),
      image: String(form.get('image')).trim() || safeImage(),
      popular: form.has('popular'),
    };
    try {
      const saved = editingFood?.id
        ? await api.updateFood(token, editingFood.id, details)
        : await api.createFood(token, details);
      const updated = { ...normalizeFood(saved), category: categoryRecord.name, categoryId: categoryRecord.id };
      setFoods((current) => editingFood?.id
        ? current.map((food) => food.id === updated.id ? updated : food)
        : [updated, ...current]);
      setEditingFood(null);
      notify(editingFood?.id ? 'Menu item updated.' : 'New food added to the menu.');
    } catch (error) {
      notify(`Could not save the menu item: ${error.message}`);
    }
  };

  const deleteFood = async (food) => {
    try {
      await api.deleteFood(token, food.id);
      setFoods((current) => current.filter((item) => item.id !== food.id));
      notify('Menu item removed.');
    } catch (error) {
      notify(`Could not remove the menu item: ${error.message}`);
    }
  };

  const addCategory = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get('category')).trim();
    if (!name || categoryRecords.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      notify('Enter a new category name.');
      return;
    }
    try {
      const created = await api.createCategory(token, name);
      setCategoryRecords((current) => [...current, normalizeCategory(created)]);
      form.reset();
      notify('Category added.');
    } catch (error) {
      notify(`Could not add the category: ${error.message}`);
    }
  };

  const renameCategory = async (categoryRecord, name) => {
    try {
      const updated = normalizeCategory(await api.updateCategory(token, categoryRecord.id, name));
      setCategoryRecords((current) => current.map((item) => item.id === updated.id ? updated : item));
      setFoods((current) => current.map((food) => food.categoryId === updated.id
        ? { ...food, category: updated.name }
        : food));
      setCategory((current) => current === categoryRecord.name ? updated.name : current);
      notify('Category updated.');
    } catch (error) {
      notify(`Could not update the category: ${error.message}`);
    }
  };

  const deleteCategory = async (categoryRecord) => {
    if (foods.some((food) => food.categoryId === categoryRecord.id || food.category === categoryRecord.name)) {
      notify('Move or remove foods in this category before deleting it.');
      return;
    }
    try {
      await api.deleteCategory(token, categoryRecord.id);
      setCategoryRecords((current) => current.filter((item) => item.id !== categoryRecord.id));
      notify('Category removed.');
    } catch (error) {
      notify(`Could not remove the category: ${error.message}`);
    }
  };

  const signOut = () => {
    setToken('');
    setUser(null);
    setCart([]);
    setOrders([]);
    setPage('home');
    notify('You have signed out.');
  };

  const authPage = <AuthPage authMode={authMode} setAuthMode={setAuthMode} setPage={setPage} onSubmit={handleAuth} />;
  let content;

  if (page === 'home') {
    content = <HomePage foods={foods} heroSlide={heroSlide} setHeroSlide={setHeroSlide} navigate={navigate} onSelectFood={setSelectedFood} onAddToCart={addToCart} />;
  } else if (page === 'menu') {
    content = <MenuPage foods={foods} categories={categories} filteredFoods={filteredFoods} category={category} setCategory={setCategory} search={search} setSearch={setSearch} onSelectFood={setSelectedFood} onAddToCart={addToCart} />;
  } else if (page === 'login' || page === 'register' || page === 'admin-login') {
    content = authPage;
  } else if (page === 'cart') {
    content = <CartPage cartItems={cartItems} itemCount={itemCount} subtotal={subtotal} delivery={delivery} navigate={navigate} changeQuantity={changeQuantity} />;
  } else if (page === 'checkout') {
    content = !user
      ? authPage
      : cartItems.length
        ? <CheckoutPage user={user} cartItems={cartItems} subtotal={subtotal} delivery={delivery} onSubmit={placeOrder} paymentSettings={paymentSettings} />
        : <CartPage cartItems={cartItems} itemCount={itemCount} subtotal={subtotal} delivery={delivery} navigate={navigate} changeQuantity={changeQuantity} />;
  } else if (page === 'orders') {
    content = user ? <OrdersPage user={user} orders={orders} navigate={navigate} onCancelOrder={cancelOrder} cancellingOrderId={cancellingOrderId} /> : authPage;
  } else if (page === 'profile') {
    content = user ? <ProfilePage user={user} onSave={saveProfile} onSignOut={signOut} /> : authPage;
  } else if (page === 'admin') {
    content = user?.role === 'admin'
      ? <AdminPage orders={orders} foods={foods} categories={categories} categoryRecords={categoryRecords} adminTab={adminTab} setAdminTab={setAdminTab} onSignOut={signOut} onEditFood={setEditingFood} onDeleteFood={deleteFood} onAddCategory={addCategory} onRenameCategory={renameCategory} onDeleteCategory={deleteCategory} onUpdateOrderStatus={updateOrderStatus} paymentSettings={paymentSettings} onSavePaymentSettings={savePaymentSettings} savingPaymentSettings={savingPaymentSettings} notify={notify} />
      : authPage;
  } else {
    content = <HomePage foods={foods} heroSlide={heroSlide} setHeroSlide={setHeroSlide} navigate={navigate} onSelectFood={setSelectedFood} onAddToCart={addToCart} />;
  }

  return (
    <SiteLayout
      page={page}
      user={user}
      itemCount={itemCount}
      mobileMenu={mobileMenu}
      toast={toast}
      onNavigate={navigate}
      onToggleMobileMenu={() => setMobileMenu((open) => !open)}
      onAdmin={() => { setAuthMode('admin'); setPage(user?.role === 'admin' ? 'admin' : 'admin-login'); }}
    >
      {content}
      <FoodDialogs selectedFood={selectedFood} setSelectedFood={setSelectedFood} editingFood={editingFood} setEditingFood={setEditingFood} categories={categories} onAddToCart={addToCart} onSaveFood={saveFood} />
    </SiteLayout>
  );
}

export default App;