import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

const categories = ['Pizza', 'Burgers', 'Pasta', 'Healthy', 'Sides', 'Desserts'].map((name, index) => ({
  _id: `category-${index + 1}`,
  name,
}));
const foodRows = [
  ['Truffle Mushroom Pizza', 'Pizza', 649, 'Wood-fired sourdough, wild mushrooms, mozzarella, and truffle oil.', true],
  ['Smoky BBQ Burger', 'Burgers', 499, 'A grilled patty with smoked cheddar and house BBQ sauce.', true],
  ['Creamy Tuscan Pasta', 'Pasta', 549, 'Silky parmesan cream, sun-dried tomatoes, and fresh basil.', false],
  ['Crispy Garden Bowl', 'Healthy', 429, 'Avocado, quinoa, crisp greens, and lemon tahini.', false],
  ['Golden Chicken Tenders', 'Sides', 349, 'Crunchy buttermilk chicken with peppercorn dip.', true],
  ['Midnight Chocolate Cake', 'Desserts', 299, 'Chocolate sponge layered with silky ganache.', false],
  ['Burrata Margherita', 'Pizza', 699, 'San Marzano tomato, creamy burrata, and basil.', true],
  ['Crispy Chicken Burger', 'Burgers', 469, 'Golden fried chicken, crunchy slaw, pickles, and mayo.', false],
  ['Moonlit Harvest Salad', 'Healthy', 389, 'Seasonal greens, avocado, cherry tomatoes, and lemon.', true],
  ['Garden Pesto Pasta', 'Pasta', 519, 'Fresh basil pesto, parmesan, and toasted pine nuts.', true],
  ['Crispy Golden Fries', 'Sides', 229, 'Hand-cut fries with herbs and signature sauce.', false],
  ['Berry Cloud Cheesecake', 'Desserts', 329, 'Vanilla cheesecake with fresh berries.', true],
];
const foods = foodRows.map(([name, category, price, description, popular], index) => ({
  _id: `food-${index + 1}`,
  name,
  category: categories.find((item) => item.name === category),
  price,
  description,
  image: `/images/${name.toLowerCase().replaceAll(' ', '-')}.jpg`,
  popular,
  available: true,
}));

let cart;
let orders;
let activeUser;
let paymentSettings;

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = jest.fn();
  cart = [];
  orders = [];
  activeUser = null;
  paymentSettings = {
    qrCode: null,
    paymentMethods: [
      { name: 'Cash on delivery', enabled: true, showQr: false },
      { name: 'UPI', enabled: true, showQr: true },
      { name: 'Card', enabled: true, showQr: false },
      { name: 'Demo QR', enabled: true, showQr: true },
    ],
  };
  global.fetch = jest.fn(async (url, options = {}) => {
    const path = new URL(url, 'http://localhost').pathname;
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    if (path === '/api/foods' && method === 'GET') return jsonResponse(foods);
    if (path === '/api/categories' && method === 'GET') return jsonResponse(categories);
    if (path === '/api/payment-settings' && method === 'GET') return jsonResponse(paymentSettings);
    if (path === '/api/payment-settings' && method === 'PUT') {
      paymentSettings = body;
      return jsonResponse(paymentSettings);
    }
    if (path === '/api/auth/login' && method === 'POST') {
      const isAdmin = body.email === 'admin@moonlight.com';
      activeUser = {
        id: isAdmin ? 'admin-id' : 'customer-id',
        name: isAdmin ? 'MooNLight Admin' : 'Alex Morgan',
        email: body.email,
        role: isAdmin ? 'admin' : 'user',
        phone: '',
        address: '',
      };
      return jsonResponse({ token: 'test-token', user: activeUser });
    }
    if (path === '/api/auth/register' && method === 'POST') {
      activeUser = { id: 'customer-id', ...body, role: 'user', phone: '', address: '' };
      return jsonResponse({ token: 'test-token', user: activeUser }, 201);
    }
    if (path === '/api/auth/profile' && method === 'GET') return jsonResponse(activeUser);
    if (path === '/api/auth/profile' && method === 'PUT') {
      activeUser = { ...activeUser, ...body };
      return jsonResponse(activeUser);
    }
    if (path === '/api/cart' && method === 'GET') return jsonResponse({ items: cart });
    if (path === '/api/cart' && method === 'POST') {
      const existing = cart.find((item) => item.food._id === body.foodId);
      if (existing) existing.quantity += body.quantity;
      else cart.push({ food: foods.find((food) => food._id === body.foodId), quantity: body.quantity });
      return jsonResponse({ items: cart });
    }
    if (path === '/api/cart' && method === 'PUT') {
      if (body.quantity <= 0) cart = cart.filter((item) => item.food._id !== body.foodId);
      else cart.find((item) => item.food._id === body.foodId).quantity = body.quantity;
      return jsonResponse({ items: cart });
    }
    if (path === '/api/orders/my' && method === 'GET') return jsonResponse(orders);
    if (path === '/api/orders' && method === 'GET') return jsonResponse(orders);
    if (path === '/api/orders' && method === 'POST') {
      const order = {
        _id: 'order-1',
        user: activeUser,
        address: body.address,
        phone: body.phone,
        paymentMethod: body.paymentMethod,
        note: body.note,
        items: cart.map(({ food, quantity }) => ({ food: food._id, name: food.name, price: food.price, quantity })),
        totalAmount: cart.reduce((sum, item) => sum + item.food.price * item.quantity, 40),
        status: 'Received',
        createdAt: new Date().toISOString(),
      };
      orders = [order, ...orders];
      cart = [];
      return jsonResponse({ message: 'Order placed successfully', order }, 201);
    }
    const cancelMatch = path.match(/^\/api\/orders\/([^/]+)\/cancel$/);
    if (cancelMatch && method === 'PUT') {
      orders = orders.map((order) => order._id === cancelMatch[1] ? { ...order, status: 'Cancelled' } : order);
      return jsonResponse(orders.find((order) => order._id === cancelMatch[1]));
    }
    const statusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (statusMatch && method === 'PUT') {
      orders = orders.map((order) => order._id === statusMatch[1] ? { ...order, status: body.status } : order);
      return jsonResponse(orders[0]);
    }

    return jsonResponse({ message: 'Not found' }, 404);
  });
});

test('shows the menu and categories loaded from the backend', async () => {
  render(<App />);
  expect(screen.getAllByText('MooNLight')).toHaveLength(2);
  expect(screen.getByRole('heading', { name: /Good food/i })).toBeInTheDocument();
  expect(await screen.findByText('Truffle Mushroom Pizza')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Call us: 8489671595' })).toHaveAttribute('href', 'tel:8489671595');
  fireEvent.click(screen.getByRole('button', { name: 'Our menu' }));
  expect(screen.getByRole('heading', { name: 'Find your favorite' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Desserts' })).toBeInTheDocument();
  const pizzaCategory = screen.getByRole('button', { name: 'Pizza' });
  expect(pizzaCategory.querySelector('img')).toHaveAttribute('src', '/images/truffle-mushroom-pizza.jpg');
  expect(global.fetch).toHaveBeenCalledWith('/api/foods', expect.any(Object));
});

test('food slideshow changes images and homepage features backend dishes', async () => {
  render(<App />);
  const carousel = screen.getByRole('region', { name: 'Featured food slideshow' });
  expect(carousel.style.getPropertyValue('--hero-image')).toContain('truffle-mushroom-pizza');
  expect(within(carousel).getByText(/Wood-fired truffle mushroom pizza/)).toBeInTheDocument();
  expect(await screen.findByText('Moonlit Harvest Salad')).toBeInTheDocument();
  expect(screen.getByText('Garden Pesto Pasta')).toBeInTheDocument();
  fireEvent.click(within(carousel).getByRole('button', { name: 'Next featured food' }));
  expect(within(carousel).getByText(/Our smoky BBQ burger/)).toBeInTheDocument();
  expect(carousel.style.getPropertyValue('--hero-image')).toContain('smoky-bbq-burger');
});

test('food cards use locally served menu images while the slideshow uses bundled images', async () => {
  render(<App />);
  await screen.findByText('Truffle Mushroom Pizza');
  const foodImages = screen.getAllByRole('img').filter((image) => image.alt && image.alt !== 'MooNLight FOOD');
  expect(foodImages.length).toBeGreaterThanOrEqual(4);
  foodImages.forEach((image) => expect(image.getAttribute('src')).not.toContain('images.unsplash.com'));
  expect(screen.getByRole('region', { name: 'Featured food slideshow' }).style.getPropertyValue('--hero-image')).not.toContain('images.unsplash.com');
});

test('adds menu items to the backend cart and shows checkout total', async () => {
  render(<App />);
  const addButton = await screen.findByRole('button', { name: 'Add Truffle Mushroom Pizza to cart' });
  fireEvent.click(addButton);
  expect(await screen.findByRole('status')).toHaveTextContent('Added to your cart.');
  fireEvent.click(screen.getByRole('button', { name: /Cart/ }));
  expect(screen.getByRole('heading', { name: 'Your cart' })).toBeInTheDocument();
  expect(screen.getAllByText('₹649')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: /Continue to checkout/ }));
  expect(screen.getByLabelText('Email address')).toBeInTheDocument();
});

test('customer signs in, completes checkout, and sees the order from the backend', async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: 'Add Truffle Mushroom Pizza to cart' }));
  fireEvent.click(screen.getByRole('button', { name: /Cart/ }));
  fireEvent.click(screen.getByRole('button', { name: /Continue to checkout/ }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'member@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'MoonUser123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByLabelText('Delivery address')).toBeInTheDocument();
  expect(screen.getByLabelText('Phone number')).toHaveValue('8489671595');
  fireEvent.change(screen.getByLabelText('Delivery address'), { target: { value: '12 Moonlight Lane' } });
  fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: 'Demo QR' } });
  expect(screen.getByRole('img', { name: 'Demo QR code containing 8489671595' })).toHaveAttribute(
    'src',
    expect.stringContaining(encodeURIComponent('8489671595')),
  );
  expect(screen.getByText(/does not start or confirm a payment/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Place order/ }));
  expect(await screen.findByRole('heading', { name: 'My orders' })).toBeInTheDocument();
  expect(await screen.findByText(/Truffle Mushroom Pizza/)).toBeInTheDocument();
  expect(screen.getByText('Payment: Demo QR')).toBeInTheDocument();
  expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/orders', expect.objectContaining({
    method: 'POST',
    body: expect.stringContaining('"paymentMethod":"Demo QR"'),
  }));
});

test('customer can cancel an order that has not started preparing', async () => {
  orders = [{
    _id: 'order-received',
    user: { email: 'member@moonlight.com', name: 'Alex Morgan' },
    address: '12 Moonlight Lane',
    items: [{ food: 'food-1', name: 'Truffle Mushroom Pizza', price: 649, quantity: 1 }],
    totalAmount: 689,
    status: 'Received',
    createdAt: new Date().toISOString(),
  }];

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Sign in/ }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'member@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'MoonUser123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  fireEvent.click(await screen.findByRole('button', { name: 'My orders' }));

  fireEvent.click(await screen.findByRole('button', { name: 'Cancel order' }));
  expect(await screen.findByText('Cancelled')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/orders/order-received/cancel', expect.objectContaining({
    method: 'PUT',
  }));
});

test('customer sees the preparing status for their order from the backend', async () => {
  orders = [{
    _id: 'order-2',
    user: { email: 'member@moonlight.com', name: 'Alex Morgan' },
    address: '12 Moonlight Lane',
    items: [{ food: 'food-1', name: 'Truffle Mushroom Pizza', price: 649, quantity: 1 }],
    totalAmount: 689,
    status: 'Preparing',
    createdAt: new Date().toISOString(),
  }];

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Sign in/ }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'member@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'MoonUser123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  fireEvent.click(await screen.findByRole('button', { name: 'My orders' }));

  expect(await screen.findByRole('heading', { name: 'My orders' })).toBeInTheDocument();
  expect(await screen.findByText('Preparing')).toBeInTheDocument();
  expect(screen.getByText(/Truffle Mushroom Pizza/)).toBeInTheDocument();
});

test('customer sees Delivered instead of Preparing after admin completes the order', async () => {
  orders = [{
    _id: 'order-3',
    user: { email: 'member@moonlight.com', name: 'Alex Morgan' },
    address: '12 Moonlight Lane',
    items: [{ food: 'food-1', name: 'Truffle Mushroom Pizza', price: 649, quantity: 1 }],
    totalAmount: 689,
    status: 'Delivered',
    createdAt: new Date().toISOString(),
  }];

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Restaurant admin' }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'admin@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByRole('heading', { name: 'Good evening, chef.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Orders' }));
  fireEvent.change(await screen.findByRole('combobox', { name: 'Update order status for Alex Morgan' }), { target: { value: 'Delivered' } });
  expect(await screen.findByText('Order status updated.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  fireEvent.click(screen.getByRole('button', { name: /Sign in/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Customer sign in' }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'member@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'MoonUser123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  fireEvent.click(await screen.findByRole('button', { name: 'My orders' }));

  expect(await screen.findByText('Delivered')).toBeInTheDocument();
  expect(screen.queryByText('Preparing')).not.toBeInTheDocument();
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/order-3/status', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ status: 'Delivered' }),
    }));
  });
});

test('admin can sign in and view menu items returned from the backend', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Restaurant admin' }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'admin@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByRole('heading', { name: 'Good evening, chef.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Manage food' }));
  expect(screen.getByRole('heading', { name: 'Your menu' })).toBeInTheDocument();
  expect(within(screen.getByRole('table')).getByText('Truffle Mushroom Pizza')).toBeInTheDocument();
});

test('admin can add and save a checkout payment option', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Restaurant admin' }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'admin@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await screen.findByRole('heading', { name: 'Good evening, chef.' });
  fireEvent.click(screen.getByRole('button', { name: 'Payments' }));

  const qrFile = new File(['sample qr image'], 'restaurant-qr.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Payment QR image'), { target: { files: [qrFile] } });
  await waitFor(() => expect(screen.getByRole('img', { name: 'Current restaurant payment QR code' })).toHaveAttribute(
    'src',
    expect.stringContaining('data:image/png;base64,'),
  ));
  fireEvent.change(screen.getByLabelText('New payment method'), { target: { value: 'Bank transfer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add method' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save payment settings' }));

  expect(await screen.findByText('Payment settings saved.')).toBeInTheDocument();
  expect(paymentSettings.qrCode).toContain('data:image/png;base64,');
  expect(paymentSettings.paymentMethods).toContainEqual({
    name: 'Bank transfer',
    enabled: true,
    showQr: false,
  });
  expect(global.fetch).toHaveBeenCalledWith('/api/payment-settings', expect.objectContaining({
    method: 'PUT',
  }));
});

test('admin order table hides the database order ID', async () => {
  orders = [{
    _id: 'very-long-database-order-id',
    user: { email: 'member@moonlight.com', name: 'Alex Morgan' },
    address: '12 Moonlight Lane',
    items: [{ food: 'food-1', name: 'Truffle Mushroom Pizza', price: 649, quantity: 1 }],
    totalAmount: 689,
    status: 'Received',
    createdAt: new Date().toISOString(),
  }];

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Restaurant admin' }));
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'admin@moonlight.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByRole('heading', { name: 'Good evening, chef.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Orders' }));

  const table = screen.getByRole('table');
  expect(within(table).getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
  expect(within(table).getByRole('columnheader', { name: 'Payment' })).toBeInTheDocument();
  expect(within(table).getByText('Cash on delivery')).toBeInTheDocument();
  expect(within(table).queryByText('very-long-database-order-id')).not.toBeInTheDocument();
  expect(within(table).getByText('Alex Morgan')).toBeInTheDocument();
});
