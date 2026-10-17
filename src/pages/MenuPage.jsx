import React from 'react';
import { FoodCard, EmptyState } from '../components/Shared';
import { starterFoods, safeImage } from '../data/menu';

export default function MenuPage({ foods, categories, filteredFoods, category, setCategory, search, setSearch, onSelectFood, onAddToCart }) {
  return (
    <section className="page-shell">
      <div className="menu-heading"><div><span className="eyebrow">Good things, made fresh</span><h1>Find your favorite</h1><p>Thoughtful ingredients. Made-to-order comfort.</p></div>
        <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu…" aria-label="Search the menu" /></label>
      </div>
      <div className="category-row">{['All', ...categories].map((item) => {
        const image = item === 'All'
          ? starterFoods[0].image
          : foods.find((food) => food.category === item)?.image
            || starterFoods.find((food) => food.category === item)?.image;
        return (
          <button key={item} className={`category-chip${category === item ? ' selected' : ''}`} onClick={() => setCategory(item)}>
            {image && <img src={safeImage(image)} alt="" />}
            <span>{item === 'All' ? 'Everything' : item}</span>
          </button>
        );
      })}</div>
      {filteredFoods.length
        ? <div className="food-grid">{filteredFoods.map((food) => <FoodCard key={food.id} food={food} onSelect={onSelectFood} onAdd={onAddToCart} />)}</div>
        : <EmptyState title="Nothing on the menu just yet" text="Try another category or search." />}
    </section>
  );
}
 