import React from 'react';
import { Brand, RESTAURANT_PHONE } from './Shared';

export default function SiteLayout({
  children,
  page,
  user,
  itemCount,
  mobileMenu,
  toast,
  onNavigate,
  onToggleMobileMenu,
  onAdmin,
}) {
  return (
    <div className="app">
      <header className="topbar">
        <Brand />
        <nav className={`main-nav${mobileMenu ? ' nav-open' : ''}`} aria-label="Main navigation">
          <button className={page === 'home' ? 'nav-active' : ''} onClick={() => onNavigate('home')}>Home</button>
          <button className={page === 'menu' ? 'nav-active' : ''} onClick={() => onNavigate('menu')}>Our menu</button>
          {user && <button className={page === 'orders' ? 'nav-active' : ''} onClick={() => onNavigate('orders')}>My orders</button>}
        </nav>
        <div className="top-actions"><button className="account-button" onClick={() => onNavigate(user ? 'profile' : 'login')}><span>♙</span><span>{user ? user.name.split(' ')[0] : 'Sign in'}</span></button><button className="cart-button" onClick={() => onNavigate('cart')}><span aria-hidden="true">♧</span><span>Cart</span><b>{itemCount}</b></button><button className="menu-toggle" onClick={onToggleMobileMenu} aria-label="Toggle navigation">☰</button></div>
      </header>
      <main>{children}</main>
      <footer className="footer"><Brand footer /><div className="footer-details"><p>Made with love, served under the moon. <span>© 2026 MooNLight Food</span></p><a href={`tel:${RESTAURANT_PHONE}`}>Call us: {RESTAURANT_PHONE}</a></div><button className="footer-admin" onClick={onAdmin}>Restaurant admin</button></footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
