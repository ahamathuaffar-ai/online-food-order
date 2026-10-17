import React, { useEffect, useState } from 'react';
import { EmptyState, RESTAURANT_PHONE } from '../components/Shared';
import formatPrice from '../utils/formatPrice';

export default function CheckoutPage({ user, cartItems, subtotal, delivery, onSubmit, navigate, paymentSettings }) {
  const enabledMethods = paymentSettings.paymentMethods.filter((method) => method.enabled);
  const [paymentMethod, setPaymentMethod] = useState(enabledMethods[0]?.name || '');
  const selectedMethod = enabledMethods.find((method) => method.name === paymentMethod);
  const showDemoQr = paymentMethod === 'Demo QR' && !paymentSettings.qrCode;

  useEffect(() => {
    if (!enabledMethods.some((method) => method.name === paymentMethod)) {
      setPaymentMethod(enabledMethods[0]?.name || '');
    }
  }, [enabledMethods, paymentMethod]);

  if (!user) return <EmptyState title="Sign in to continue" text="Sign in to finish your order." action="Sign in" onAction={() => navigate('login')} />;
  if (!cartItems.length) return <EmptyState title="Your cart is empty" text="Add something delicious before checking out." action="Browse the menu" onAction={() => navigate('menu')} />;
  return (
    <section className="page-shell"><div className="page-title"><span className="eyebrow">Almost there</span><h1>Make it a lovely night.</h1><p>One last detail and we'll get cooking.</p></div><div className="two-column">
      <form className="panel form-panel" onSubmit={onSubmit}><h2>Delivery details</h2><label>Phone number<input name="phone" type="tel" defaultValue={user.phone || RESTAURANT_PHONE} maxLength="40" required /></label><label>Delivery address<textarea name="address" defaultValue={user.address || ''} maxLength="300" placeholder="Street, building, apartment…" required /></label><label>A note for our kitchen <span className="subtle">(optional)</span><textarea name="note" maxLength="300" placeholder="Allergies, delivery instructions…" /></label><label>Payment method<select name="paymentMethod" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} required>{enabledMethods.map((method) => <option key={method.name}>{method.name}</option>)}</select></label><p className="subtle">Payment is collected at delivery. Online payment is not processed at checkout.</p>{selectedMethod?.showQr && paymentSettings.qrCode && <div className="demo-payment-qr"><strong>Restaurant payment QR</strong><p>Scan this QR with your payment app. Payment processing is not verified by this demo.</p><img src={paymentSettings.qrCode} alt="Restaurant payment QR code" /></div>}{showDemoQr && <div className="demo-payment-qr"><strong>Demo payment QR</strong><p>This demo QR only displays our contact number. It does not start or confirm a payment.</p><img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(RESTAURANT_PHONE)}`} alt={`Demo QR code containing ${RESTAURANT_PHONE}`} /><span>{RESTAURANT_PHONE}</span></div>}{selectedMethod?.showQr && !paymentSettings.qrCode && !showDemoQr && <p className="subtle">The restaurant has not uploaded a QR code yet. Please use another payment option.</p>}<button className="button button-gold button-wide" type="submit">Place order · {formatPrice(subtotal + delivery)}</button></form>
      <div className="panel summary"><h2>Your order</h2>{cartItems.map((line) => <div className="summary-row" key={line.id}><span>{line.quantity} × {line.food.name}</span><strong>{formatPrice(line.food.price * line.quantity)}</strong></div>)}<div className="summary-row"><span>Delivery</span><strong>{formatPrice(delivery)}</strong></div><div className="summary-row summary-total"><span>Total</span><strong>{formatPrice(subtotal + delivery)}</strong></div></div>
    </div></section>
  );
}
