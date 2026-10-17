import trufflePizzaImage from '../images/truffle-mushroom-pizza.jpg';
import bbqBurgerImage from '../images/smoky-bbq-burger.jpg';
import tuscanPastaImage from '../images/creamy-tuscan-pasta.jpg';
import gardenBowlImage from '../images/crispy-garden-bowl.jpg';
import chickenTendersImage from '../images/golden-chicken-tenders.jpg';
import chocolateCakeImage from '../images/midnight-chocolate-cake.jpg';
import burrataPizzaImage from '../images/burrata-margherita.jpg';
import crispyChickenBurgerImage from '../images/crispy-chicken-burger.jpg';
import harvestSaladImage from '../images/moonlit-harvest-salad.jpg';
import pestoPastaImage from '../images/garden-pesto-pasta.jpg';
import friesImage from '../images/crispy-golden-fries.jpg';
import cheesecakeImage from '../images/berry-cloud-cheesecake.jpg';

export const starterFoods = [
  { id: 'food-1', name: 'Truffle Mushroom Pizza', category: 'Pizza', price: 649, description: 'Wood-fired sourdough, wild mushrooms, mozzarella, and a drizzle of truffle oil.', image: trufflePizzaImage, popular: true },
  { id: 'food-2', name: 'Smoky BBQ Burger', category: 'Burgers', price: 499, description: 'A juicy grilled patty with smoked cheddar, caramelized onion, and house BBQ sauce.', image: bbqBurgerImage, popular: true },
  { id: 'food-3', name: 'Creamy Tuscan Pasta', category: 'Pasta', price: 549, description: 'Silky parmesan cream, sun-dried tomatoes, fresh basil, and ribbons of pasta.', image: tuscanPastaImage, popular: false },
  { id: 'food-4', name: 'Crispy Garden Bowl', category: 'Healthy', price: 429, description: 'A bright bowl of avocado, quinoa, crisp greens, and lemon tahini dressing.', image: gardenBowlImage, popular: false },
  { id: 'food-5', name: 'Golden Chicken Tenders', category: 'Sides', price: 349, description: 'Crunchy buttermilk chicken with a side of creamy peppercorn dip.', image: chickenTendersImage, popular: true },
  { id: 'food-6', name: 'Midnight Chocolate Cake', category: 'Desserts', price: 299, description: 'Deep chocolate sponge layered with silky ganache and a pinch of sea salt.', image: chocolateCakeImage, popular: false },
  { id: 'food-7', name: 'Burrata Margherita', category: 'Pizza', price: 699, description: 'San Marzano tomato, creamy burrata, basil, and extra virgin olive oil.', image: burrataPizzaImage, popular: true },
  { id: 'food-8', name: 'Crispy Chicken Burger', category: 'Burgers', price: 469, description: 'Golden fried chicken, crunchy slaw, pickles, and tangy house-made mayo.', image: crispyChickenBurgerImage, popular: false },
  { id: 'food-9', name: 'Moonlit Harvest Salad', category: 'Healthy', price: 389, description: 'Seasonal greens, ripe avocado, cherry tomatoes, and a bright lemon dressing.', image: harvestSaladImage, popular: true },
  { id: 'food-10', name: 'Garden Pesto Pasta', category: 'Pasta', price: 519, description: 'Fresh basil pesto, parmesan, toasted pine nuts, and tender pasta.', image: pestoPastaImage, popular: true },
  { id: 'food-11', name: 'Crispy Golden Fries', category: 'Sides', price: 229, description: 'Hand-cut golden fries with herbs and our signature dipping sauce.', image: friesImage, popular: false },
  { id: 'food-12', name: 'Berry Cloud Cheesecake', category: 'Desserts', price: 329, description: 'Creamy vanilla cheesecake with fresh berries and a buttery crumb.', image: cheesecakeImage, popular: true },
];

export const heroSlides = [
  { image: starterFoods[0].image, label: 'Wood-fired truffle mushroom pizza' },
  { image: starterFoods[1].image, label: 'Our smoky BBQ burger' },
  { image: starterFoods[2].image, label: 'Creamy Tuscan pasta' },
  { image: starterFoods[8].image, label: 'Fresh moonlit harvest salad' },
];

export const safeImage = (image) => image || harvestSaladImage;
