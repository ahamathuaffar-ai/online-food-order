import React from 'react';
import { EmptyState } from '../components/Shared';
import { safeImage } from '../data/menu';
import formatPrice from '../utils/formatPrice';

export default function CartPage({ cartItems, itemCount, subtotal, delivery, navigate, changeQuantity }) {
  return (
    <section className="page-shell">
      <div className="page-title"><span className="eyebrow">The good stuff</span><h1>Your cart</h1><p>{itemCount} delicious {itemCount === 1 ? 'thing' : 'things'}, coming right up.</p></div>
      {!cartItems.length ? <EmptyState title="It's a little empty in here" text="Find something delicious and make tonight special." action="Browse the menu" onAction={() => navigate('menu')} /> :
        <div className="two-column"><div className="panel"><h2>Your picks</h2>{cartItems.map((line) => <div className="cart-line" key={line.id}>
          <img src={safeImage(line.food.image)} alt="" /><div className="cart-product"><strong>{line.food.name}</strong><small>{formatPrice(line.food.price)} each</small><div className="quantity-control"><button onClick={() => changeQuantity(line.id, -1)} aria-label="Decrease quantity">−</button><span>{line.quantity}</span><button onClick={() => changeQuantity(line.id, 1)} aria-label="Increase quantity">+</button><button className="remove-button" onClick={() => changeQuantity(line.id, -line.quantity)}>Remove</button></div></div><strong>{formatPrice(line.food.price * line.quantity)}</strong>
        </div>)}<button className="link-button keep-shopping" onClick={() => navigate('menu')}>← Keep exploring</button></div>
          <div className="panel summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="summary-row"><span>Delivery</span><strong>{formatPrice(delivery)}</strong></div><div className="summary-row summary-total"><span>Total</span><strong>{formatPrice(subtotal + delivery)}</strong></div><button className="button button-gold button-wide" onClick={() => navigate('checkout')}>Continue to checkout&nbsp; →</button><small>Delivery fee is confirmed with your order.</small></div>
        </div>}
    </section>
  );
}
