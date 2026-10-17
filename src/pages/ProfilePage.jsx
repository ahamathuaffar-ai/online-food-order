import React from 'react';

export default function ProfilePage({ user, onSave, onSignOut }) {
  return (
    <section className="page-shell"><div className="page-title"><span className="eyebrow">Your details</span><h1>My profile</h1><p>Keep your delivery details up to date.</p></div><form className="panel profile-form" onSubmit={onSave}><label>Name<input name="name" defaultValue={user.name} maxLength="80" required /></label><label>Email<input value={user.email} disabled /></label><label>Phone number<input name="phone" type="tel" defaultValue={user.phone || ''} maxLength="40" /></label><label>Default delivery address<textarea name="address" defaultValue={user.address || ''} maxLength="300" /></label><button className="button button-gold" type="submit">Save my details</button><button className="link-button signout-link" type="button" onClick={onSignOut}>Sign out</button></form></section>
  );
}
