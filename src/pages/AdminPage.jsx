import React, { useEffect, useState } from 'react';
import { EmptyState, StatCard } from '../components/Shared';
import { safeImage } from '../data/menu';
import formatPrice from '../utils/formatPrice';

const statuses = ['Received', 'Preparing', 'On the way', 'Delivered', 'Cancelled'];

function PaymentSettingsPanel({ settings, onSave, saving, notify }) {
  const [qrCode, setQrCode] = useState(settings.qrCode);
  const [methods, setMethods] = useState(settings.paymentMethods);
  const [newMethod, setNewMethod] = useState('');

  useEffect(() => {
    setQrCode(settings.qrCode);
    setMethods(settings.paymentMethods);
  }, [settings]);

  const updateMethod = (index, updates) => {
    setMethods((current) => current.map((method, methodIndex) => (
      methodIndex === index ? { ...method, ...updates } : method
    )));
  };

  const selectQr = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      notify('Choose a PNG, JPEG, or WebP image under 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        notify('Could not read the QR image.');
        return;
      }
      setQrCode(reader.result);
    };
    reader.onerror = () => notify('Could not read the QR image.');
    reader.readAsDataURL(file);
  };

  const addMethod = (event) => {
    event.preventDefault();
    const name = newMethod.trim();
    if (!name || name.length > 40 || methods.some((method) => method.name.toLowerCase() === name.toLowerCase())) {
      notify('Enter a unique payment method name under 40 characters.');
      return;
    }
    setMethods((current) => [...current, { name, enabled: true, showQr: false }]);
    setNewMethod('');
  };

  const save = () => onSave({
    qrCode,
    paymentMethods: methods
  });

  return (
    <div className="panel payment-settings">
      <div className="panel-heading"><h2>Checkout payment settings</h2></div>
      <p className="subtle">Upload the QR image customers should scan. Only PNG, JPEG, and WebP files up to 2 MB are accepted.</p>
      <label className="payment-qr-upload">Payment QR image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectQr} /></label>
      {qrCode
        ? <div className="payment-qr-preview"><img src={qrCode} alt="Current restaurant payment QR code" /><button className="table-delete" type="button" onClick={() => setQrCode(null)}>Remove QR image</button></div>
        : <p className="subtle">No uploaded QR image. The Demo QR option will show the demo contact QR instead.</p>}
      <h3>Payment methods</h3>
      <div className="payment-method-list">
        {methods.map((method, index) => (
          <div className="payment-method-row" key={`${method.name}-${index}`}>
            <label>Method name<input aria-label={`Payment method name ${index + 1}`} maxLength="40" value={method.name} onChange={(event) => updateMethod(index, { name: event.target.value })} /></label>
            <label className="payment-method-toggle"><input type="checkbox" checked={method.enabled} onChange={(event) => updateMethod(index, { enabled: event.target.checked })} /> Enabled</label>
            <label className="payment-method-toggle"><input type="checkbox" checked={method.showQr} onChange={(event) => updateMethod(index, { showQr: event.target.checked })} /> Show QR</label>
            <button className="table-delete" type="button" onClick={() => setMethods((current) => current.filter((_, methodIndex) => methodIndex !== index))}>Remove</button>
          </div>
        ))}
      </div>
      <form className="add-category payment-method-add" onSubmit={addMethod}>
        <label>Add payment method<input aria-label="New payment method" maxLength="40" value={newMethod} onChange={(event) => setNewMethod(event.target.value)} placeholder="e.g. Bank transfer" /></label>
        <button className="button button-gold" type="submit">Add method</button>
      </form>
      <button className="button button-gold" type="button" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save payment settings'}</button>
    </div>
  );
}

function AdminOrdersTable({ orders, onUpdateStatus }) {
  return (
    <div className="table-wrap"><table><thead><tr><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><small>{new Date(order.createdAt).toLocaleDateString()}</small></td><td>{order.customer}<small className="table-sub">{order.userEmail}</small></td><td>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</td><td>{formatPrice(order.total)}</td><td>{order.paymentMethod || 'Cash on delivery'}</td><td><select value={order.status} onChange={(event) => onUpdateStatus(order.id, event.target.value)} aria-label={`Update order status for ${order.customer}`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>
  );
}

export default function AdminPage({
  orders,
  foods,
  categories,
  categoryRecords,
  adminTab,
  setAdminTab,
  onSignOut,
  onEditFood,
  onDeleteFood,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  paymentSettings,
  onSavePaymentSettings,
  savingPaymentSettings,
  notify,
}) {
  const revenue = orders.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0);
  const handleRenameCategory = (item) => {
    const replacement = window.prompt('Rename category', item.name);
    if (replacement === null) return;
    const name = replacement.trim();
    if (!name || name.length > 40 || categoryRecords.some((existing) => existing.id !== item.id && existing.name.toLowerCase() === name.toLowerCase())) {
      notify('Enter a unique category name under 40 characters.');
      return;
    }
    onRenameCategory(item, name);
  };

  return (
    <section className="page-shell admin-shell"><div className="page-title"><span className="eyebrow">Restaurant workspace</span><h1>Good evening, chef.</h1><p>Everything you need to keep the good food coming.</p></div>
      <div className="admin-tabs">{[['dashboard', 'Overview'], ['foods', 'Manage food'], ['categories', 'Categories'], ['orders', 'Orders'], ['payments', 'Payments']].map(([id, label]) => <button key={id} className={adminTab === id ? 'active' : ''} onClick={() => setAdminTab(id)}>{label}</button>)}<button className="admin-logout" onClick={onSignOut}>Sign out</button></div>
      {adminTab === 'dashboard' && <><div className="stats-grid"><StatCard label="Total orders" value={orders.length} /><StatCard label="Menu items" value={foods.length} /><StatCard label="Categories" value={categories.length} /><StatCard label="Order revenue" value={formatPrice(revenue)} /></div><div className="panel"><div className="panel-heading"><h2>Latest orders</h2><button className="link-button" onClick={() => setAdminTab('orders')}>Manage all orders →</button></div>{orders.length ? <AdminOrdersTable orders={orders.slice(0, 5)} onUpdateStatus={onUpdateOrderStatus} /> : <EmptyState title="No orders yet" text="New customer orders will appear here." />}</div></>}
      {adminTab === 'foods' && <div className="panel"><div className="panel-heading"><h2>Your menu</h2><button className="button button-gold" onClick={() => onEditFood({})}>+ Add food item</button></div>{foods.length ? <div className="table-wrap"><table><thead><tr><th>Food</th><th>Category</th><th>Price</th><th>Favorite</th><th>Actions</th></tr></thead><tbody>{foods.map((food) => <tr key={food.id}><td><img className="table-food-image" src={safeImage(food.image)} alt="" />{food.name}</td><td>{food.category}</td><td>{formatPrice(food.price)}</td><td>{food.popular ? 'Yes' : '—'}</td><td><button className="table-action" onClick={() => onEditFood(food)}>Edit</button><button className="table-delete" onClick={() => { if (window.confirm(`Remove ${food.name} from the menu?`)) onDeleteFood(food); }}>Delete</button></td></tr>)}</tbody></table></div> : <EmptyState title="Your menu is ready for something new" text="Add your first food item above." />}</div>}
      {adminTab === 'categories' && <div className="panel"><div className="panel-heading"><h2>Food categories</h2></div><form className="add-category" onSubmit={onAddCategory}><label>Add a category<input name="category" maxLength="40" placeholder="e.g. Soups" required /></label><button className="button button-gold" type="submit">Add category</button></form><div className="category-admin-list">{categoryRecords.map((item) => <div className="category-admin-row" key={item.id}><strong>{item.name}</strong><div><button className="table-action" onClick={() => handleRenameCategory(item)}>Rename</button><button className="table-delete" onClick={() => onDeleteCategory(item)}>Remove</button></div></div>)}</div></div>}
      {adminTab === 'orders' && <div className="panel"><div className="panel-heading"><h2>All orders</h2></div>{orders.length ? <AdminOrdersTable orders={orders} onUpdateStatus={onUpdateOrderStatus} /> : <EmptyState title="No orders yet" text="New customer orders will appear here." />}</div>}
      {adminTab === 'payments' && <PaymentSettingsPanel settings={paymentSettings} onSave={onSavePaymentSettings} saving={savingPaymentSettings} notify={notify} />}
    </section>
  );
}
