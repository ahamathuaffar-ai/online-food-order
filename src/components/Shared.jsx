import React from 'react';
import formatPrice from '../utils/formatPrice';
import { safeImage } from '../data/menu';

export const RESTAURANT_PHONE = '8489671595';

export function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? ' brand-footer' : ''}`} href="#home" onClick={(event) => { event.preventDefault(); window.dispatchEvent(new CustomEvent('moonlight-page', { detail: 'home' })); }}>
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48"><path d="M32.6 33a18.1 18.1 0 0 1-17.8-24A18.2 18.2 0 1 0 39 33c-2.1.5-4.3.5-6.4 0Z" /><path className="star" d="m34 8 1.3 3.4 3.5 1.2-3.5 1.3-1.3 3.4-1.2-3.4-3.4-1.3 3.4-1.2L34 8Z" /></svg>
      </span>
      <span className="brand-word">MooNLight<span>FOOD</span></span>
    </a>
  );
}

export function FoodCard({ food, onSelect, onAdd }) {
  return (
    <article className="food-card" key={food.id}>
      <button className="food-photo" onClick={() => onSelect(food)} aria-label={`View ${food.name}`}>
        <img src={safeImage(food.image)} alt={food.name} loading="lazy" />
        <span className="food-tag">{food.popular ? '✦ Guest favorite' : food.category}</span>
      </button>
      <div className="food-card-content">
        <span className="food-category">{food.category}</span>
        <h3>{food.name}</h3>
        <p>{food.description}</p>
        <div className="food-card-bottom"><strong>{formatPrice(food.price)}</strong><button className="add-button" onClick={() => onAdd(food.id)} aria-label={`Add ${food.name} to cart`}>+</button></div>
      </div>
    </article>
  );
}

export function EmptyState({ title, text, action, onAction }) {
  return <div className="empty-state"><span>☾</span><h2>{title}</h2><p>{text}</p>{action && <button className="button button-gold" onClick={onAction}>{action}</button>}</div>;
}

export function StatusPill({ status }) {
  const value = typeof status === 'string' ? status.trim() : '';
  const normalized = value ? {
    received: 'Received',
    preparing: 'Preparing',
    'on the way': 'On the way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }[value.toLowerCase()] || value : 'Received';
  const label = normalized === 'Received' ? 'Order Confirmed' : normalized;
  return <span className={`status-pill status-${normalized.toLowerCase().replace(/\s+/g, '-')}`}>{label}</span>;
}

export function StatCard({ label, value }) {
  return <div className="stat-card"><small>{label}</small><strong>{value}</strong></div>;
}
