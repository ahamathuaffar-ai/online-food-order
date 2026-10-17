import React from 'react';

export default function AuthPage({ authMode, setAuthMode, setPage, onSubmit }) {
  const isAdmin = authMode === 'admin';
  const isRegister = authMode === 'register';
  return (
    <section className="auth-page"><form className="auth-card" onSubmit={onSubmit}>
      <span className="eyebrow">{isAdmin ? 'Restaurant admin' : 'MooNLight Food'}</span>
      <h1>{isAdmin ? 'Welcome back, chef.' : isRegister ? 'Your table is waiting.' : 'Good to see you again.'}</h1>
      <p>{isAdmin ? 'Sign in to manage your menu and keep orders moving.' : isRegister ? 'Create an account for a smoother, moonlit kind of dinner.' : 'Sign in to pick up where your cravings left off.'}</p>
      {isRegister && <label>Your name<input name="name" autoComplete="name" maxLength="80" required /></label>}
      <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : 1} required /></label>
      <button className="button button-gold button-wide" type="submit">{isRegister ? 'Create my account' : 'Sign in'}</button>
      {!isRegister && !isAdmin && <div className="demo-hint">Your account is securely managed by the restaurant service. Restaurant administrator access is provided by your site owner.</div>}
      <p className="auth-switch">{isAdmin ? <>Customer account? <button type="button" className="inline-link" onClick={() => { setAuthMode('login'); setPage('login'); }}>Customer sign in</button></> : isRegister ? <>Already have an account? <button type="button" className="inline-link" onClick={() => { setAuthMode('login'); setPage('login'); }}>Sign in</button></> : <>New to MooNLight? <button type="button" className="inline-link" onClick={() => { setAuthMode('register'); setPage('register'); }}>Create an account</button></>}</p>
    </form></section>
  );
}
