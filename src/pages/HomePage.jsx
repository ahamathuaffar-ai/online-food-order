import React from 'react';
import { FoodCard } from '../components/Shared';
import { heroSlides } from '../data/menu';

export default function HomePage({ foods, heroSlide, setHeroSlide, navigate, onSelectFood, onAddToCart }) {
  return (
    <>
      <section className="hero" style={{ '--hero-image': `url("${heroSlides[heroSlide].image}")` }} aria-roledescription="carousel" aria-label="Featured food slideshow">
        <div className="hero-copy">
          <span className="eyebrow">A little moonlight, a lot of flavor</span>
          <h1>Good food.<br /><em>Lovely nights.</em></h1>
          <p>From our kitchen to your doorstep, discover the kind of comfort food that makes every evening a little more special.</p>
          <button className="button button-gold" onClick={() => navigate('menu')}>Explore our menu <span>→</span></button>
          <div className="hero-stats"><div><strong>4.9 / 5</strong><span>From happy diners</span></div><div><strong>25–40 min</strong><span>At your doorstep</span></div></div>
        </div>
        <div className="hero-carousel" aria-label="Slideshow controls">
          <span className="hero-slide-caption">{String(heroSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}<span>{heroSlides[heroSlide].label}</span></span>
          <div className="hero-carousel-controls">
            <button type="button" aria-label="Previous featured food" onClick={() => setHeroSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}>←</button>
            {heroSlides.map((slide, index) => <button type="button" key={slide.label} className={`hero-dot${index === heroSlide ? ' active' : ''}`} aria-label={`Show ${slide.label}`} aria-current={index === heroSlide ? 'true' : undefined} onClick={() => setHeroSlide(index)} />)}
            <button type="button" aria-label="Next featured food" onClick={() => setHeroSlide((current) => (current + 1) % heroSlides.length)}>→</button>
          </div>
        </div>
      </section>
      <section className="section favorites">
        <div className="section-heading"><div><span className="eyebrow">Made for your cravings</span><h2>Tonight's favorites</h2></div><button className="link-button" onClick={() => navigate('menu')}>View the full menu&nbsp; →</button></div>
        <div className="food-grid">{foods.filter((food) => food.popular).slice(0, 8).map((food) => <FoodCard key={food.id} food={food} onSelect={onSelectFood} onAdd={onAddToCart} />)}</div>
      </section>
      <section className="service-strip">
        <div><span className="service-icon">✧</span><span><strong>Freshly made</strong><small>Made to order, every time</small></span></div>
        <div><span className="service-icon">⌁</span><span><strong>Fast delivery</strong><small>At your door in 25–40 min</small></span></div>
        <div><span className="service-icon">♡</span><span><strong>Made with care</strong><small>Good ingredients, great food</small></span></div>
        <div><span className="service-icon">☾</span><span><strong>Late-night comfort</strong><small>Your evening, made better</small></span></div>
      </section>
    </>
  );
}
