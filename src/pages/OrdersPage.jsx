import React from 'react';
import { EmptyState, StatusPill } from '../components/Shared';
import formatPrice from '../utils/formatPrice';

export default function OrdersPage({ user, orders, navigate, onCancelOrder, cancellingOrderId }) {
  if (!user) return <EmptyState title="Sign in to view your orders" text="Your orders will be here after signing in." action="Sign in" onAction={() => navigate('login')} />;
  const visibleOrders = orders.filter((order) => user.role === 'admin' || order.userEmail === user.email);
  return (
    <section className="page-shell"><div className="page-title"><span className="eyebrow">A little something to look forward to</span><h1>{user.role === 'admin' ? 'All orders' : 'My orders'}</h1><p>All your MooNLight moments, in one place.</p></div>
      {visibleOrders.length ? <div className="orders-list">{visibleOrders.map((order) => <article className="order-card" key={order.id}><div className="order-head"><div><strong>Order {order.id}</strong><small>{new Date(order.createdAt).toLocaleString()} · Delivering to {order.address}</small></div><StatusPill status={order.status} /></div>{user.role === 'admin' && <p className="order-customer">Customer: {order.customer} · {order.userEmail}</p>}<p className="order-items">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(' · ')}</p><p className="order-payment">Payment: {order.paymentMethod || 'Cash on delivery'}</p><div className="order-foot"><span>{order.items.length} item{order.items.length === 1 ? '' : 's'}</span><strong>{formatPrice(order.total)}</strong></div>{user.role !== 'admin' && order.status === 'Received' && <button className="button button-cancel-order" type="button" disabled={cancellingOrderId === order.id} onClick={() => onCancelOrder(order.id)}>{cancellingOrderId === order.id ? 'Cancelling…' : 'Cancel order'}</button>}</article>)}</div>
        : <EmptyState title="Your next favorite is waiting" text="Your orders will show up here after your first checkout." action="Explore the menu" onAction={() => navigate('menu')} />}
    </section>
  );
}
