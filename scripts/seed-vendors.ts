import { db } from '../server/db';
import { vendors, menuItems } from '../shared/schema';
import { sql } from 'drizzle-orm';

interface VendorSeed {
  name: string;
  description: string;
  address: string;
  neighborhood: string;
  imageUrl?: string;
  rating: string;
  minimumOrder: string;
  isNationalChain?: boolean;
  menu: Array<{
    name: string;
    description?: string;
    category: string;
    price: string;
  }>;
}

const VENDORS: VendorSeed[] = [
  // =====================
  // NATIONAL CHAINS
  // =====================
  {
    name: "Starbucks",
    description: "World's largest coffeehouse chain. Premium coffee, espresso drinks, teas, and pastries. Consistent quality for large corporate orders.",
    address: "Multiple Nashville Locations",
    neighborhood: "Citywide",
    rating: "4.3",
    minimumOrder: "35.00",
    isNationalChain: true,
    menu: [
      // Hot Coffee
      { name: "Pike Place Roast", description: "Smooth, well-rounded blend", category: "Hot Coffee", price: "2.95" },
      { name: "Blonde Roast", description: "Light, mellow, flavorful", category: "Hot Coffee", price: "2.95" },
      { name: "Dark Roast", description: "Bold, robust, smoky", category: "Hot Coffee", price: "2.95" },
      { name: "Decaf Pike Place", description: "Smooth decaffeinated blend", category: "Hot Coffee", price: "2.95" },
      { name: "Clover Brewed Reserve", description: "Small-batch premium coffee", category: "Hot Coffee", price: "4.45" },
      
      // Espresso Drinks
      { name: "Caffè Latte", description: "Espresso with steamed milk", category: "Espresso", price: "4.95" },
      { name: "Cappuccino", description: "Espresso with foamed milk", category: "Espresso", price: "4.95" },
      { name: "Caramel Macchiato", description: "Vanilla, steamed milk, espresso, caramel", category: "Espresso", price: "5.75" },
      { name: "White Chocolate Mocha", description: "Espresso, white chocolate, steamed milk", category: "Espresso", price: "5.95" },
      { name: "Caffè Mocha", description: "Espresso, mocha sauce, steamed milk, whipped cream", category: "Espresso", price: "5.45" },
      { name: "Flat White", description: "Ristretto shots with steamed whole milk", category: "Espresso", price: "5.25" },
      { name: "Caffè Americano", description: "Espresso shots with hot water", category: "Espresso", price: "3.95" },
      { name: "Espresso", description: "Rich, pure espresso shot", category: "Espresso", price: "2.45" },
      { name: "Espresso Macchiato", description: "Espresso with foam dollop", category: "Espresso", price: "2.75" },
      { name: "Pumpkin Spice Latte", description: "Signature fall favorite with pumpkin and spices", category: "Espresso", price: "6.45" },
      
      // Cold Drinks
      { name: "Iced Coffee", description: "Freshly brewed, chilled, sweetened", category: "Cold Drinks", price: "3.75" },
      { name: "Cold Brew", description: "Slow-steeped for 20 hours", category: "Cold Drinks", price: "4.25" },
      { name: "Nitro Cold Brew", description: "Cold brew infused with nitrogen", category: "Cold Drinks", price: "4.95" },
      { name: "Vanilla Sweet Cream Cold Brew", description: "Cold brew with vanilla sweet cream", category: "Cold Drinks", price: "5.25" },
      { name: "Iced Caramel Macchiato", description: "Vanilla, milk, espresso, caramel over ice", category: "Cold Drinks", price: "5.95" },
      { name: "Iced White Chocolate Mocha", description: "White mocha, milk, espresso over ice", category: "Cold Drinks", price: "6.25" },
      
      // Frappuccinos
      { name: "Caramel Frappuccino", description: "Blended caramel coffee drink", category: "Frappuccino", price: "5.95" },
      { name: "Mocha Frappuccino", description: "Blended mocha coffee drink", category: "Frappuccino", price: "5.95" },
      { name: "Java Chip Frappuccino", description: "Mocha sauce, Frappuccino chips, coffee", category: "Frappuccino", price: "6.25" },
      { name: "Vanilla Bean Crème Frappuccino", description: "Vanilla bean, milk, ice blended", category: "Frappuccino", price: "5.45" },
      { name: "Strawberry Crème Frappuccino", description: "Strawberry purée blended with milk", category: "Frappuccino", price: "5.45" },
      
      // Tea
      { name: "Chai Tea Latte", description: "Black tea with spices, steamed milk", category: "Tea", price: "4.95" },
      { name: "Matcha Green Tea Latte", description: "Matcha powder with steamed milk", category: "Tea", price: "5.45" },
      { name: "London Fog Tea Latte", description: "Earl Grey, vanilla, steamed milk", category: "Tea", price: "4.75" },
      { name: "Iced Passion Tango Tea", description: "Herbal tea with tropical flavors", category: "Tea", price: "3.45" },
      { name: "Iced Green Tea", description: "Refreshing green tea over ice", category: "Tea", price: "3.25" },
      
      // Food - Breakfast
      { name: "Bacon, Gouda & Egg Sandwich", description: "Applewood bacon, Gouda, egg on croissant", category: "Breakfast", price: "5.95" },
      { name: "Sausage, Cheddar & Egg Sandwich", description: "Sausage patty, cheddar, egg on English muffin", category: "Breakfast", price: "5.45" },
      { name: "Spinach, Feta & Egg White Wrap", description: "Egg whites, spinach, feta, tomatoes", category: "Breakfast", price: "5.75" },
      { name: "Double-Smoked Bacon, Cheddar & Egg Sandwich", description: "Thick bacon, cheddar, egg on croissant", category: "Breakfast", price: "6.45" },
      { name: "Impossible Breakfast Sandwich", description: "Plant-based sausage, cage-free egg, cheddar", category: "Breakfast", price: "6.95" },
      
      // Food - Pastries
      { name: "Butter Croissant", description: "Flaky, buttery French pastry", category: "Pastries", price: "3.75" },
      { name: "Chocolate Croissant", description: "Croissant with chocolate filling", category: "Pastries", price: "4.25" },
      { name: "Blueberry Muffin", description: "Classic muffin with blueberries", category: "Pastries", price: "3.45" },
      { name: "Banana Nut Bread", description: "Moist banana bread with walnuts", category: "Pastries", price: "4.25" },
      { name: "Cheese Danish", description: "Flaky pastry with cream cheese", category: "Pastries", price: "3.95" },
      { name: "Cinnamon Roll", description: "Warm cinnamon roll with frosting", category: "Pastries", price: "4.75" },
      { name: "Cake Pop", description: "Chocolate or birthday cake pop", category: "Pastries", price: "3.25" },
      
      // Catering Boxes
      { name: "Coffee Traveler (96oz)", description: "12 cups of fresh Pike Place coffee", category: "Catering", price: "22.95" },
      { name: "Assorted Pastry Box (12)", description: "Dozen assorted pastries", category: "Catering", price: "32.00" },
      { name: "Assorted Breakfast Sandwich Box (6)", description: "Six assorted breakfast sandwiches", category: "Catering", price: "34.00" },
    ]
  },
  
  {
    name: "Dutch Bros Coffee",
    description: "Drive-thru coffee chain known for friendly service and customizable drinks. Over 80 drink combinations with energy drinks and smoothies.",
    address: "Multiple Nashville Locations",
    neighborhood: "Citywide",
    rating: "4.6",
    minimumOrder: "30.00",
    isNationalChain: true,
    menu: [
      // Signature Drinks
      { name: "Golden Eagle", description: "Breve with vanilla and caramel", category: "Signature", price: "5.25" },
      { name: "Annihilator", description: "Chocolate macadamia nut breve", category: "Signature", price: "5.25" },
      { name: "Kicker", description: "Irish cream breve", category: "Signature", price: "5.00" },
      { name: "Caramelizer", description: "Caramel mocha breve", category: "Signature", price: "5.25" },
      { name: "Picture Perfect", description: "White chocolate, vanilla, chocolate milk", category: "Signature", price: "5.25" },
      { name: "Double Rainbro", description: "Strawberry and peach Rebel energy", category: "Signature", price: "5.50" },
      { name: "Aftershock", description: "Raspberry truffle mocha", category: "Signature", price: "5.25" },
      { name: "911", description: "Six shots of espresso, Irish cream, breve", category: "Signature", price: "6.25" },
      
      // Classic Espresso
      { name: "Dutch Latte", description: "Espresso with steamed milk", category: "Espresso", price: "4.50" },
      { name: "Dutch Mocha", description: "Espresso, chocolate, steamed milk", category: "Espresso", price: "4.75" },
      { name: "Americano", description: "Espresso with hot water", category: "Espresso", price: "3.50" },
      { name: "Breve", description: "Espresso with half-and-half", category: "Espresso", price: "5.00" },
      { name: "White Coffee Latte", description: "Light roast espresso, smooth and mild", category: "Espresso", price: "5.00" },
      { name: "Oat Milk Latte", description: "Espresso with oat milk", category: "Espresso", price: "5.25" },
      
      // Cold Brew
      { name: "Cold Brew", description: "Smooth, slow-steeped cold brew", category: "Cold Drinks", price: "4.25" },
      { name: "Nitro Cold Brew", description: "Cold brew with creamy nitrogen infusion", category: "Cold Drinks", price: "5.00" },
      { name: "Salted Caramel Cold Brew", description: "Cold brew with salted caramel cold foam", category: "Cold Drinks", price: "5.50" },
      
      // Dutch Freeze (Blended)
      { name: "Mocha Freeze", description: "Blended mocha frappe", category: "Freeze", price: "5.50" },
      { name: "Caramel Freeze", description: "Blended caramel frappe", category: "Freeze", price: "5.50" },
      { name: "Cookies & Cream Freeze", description: "Oreo blended frappe", category: "Freeze", price: "5.75" },
      { name: "Cotton Candy Freeze", description: "Sweet cotton candy blended drink", category: "Freeze", price: "5.50" },
      { name: "Unicorn Blood Freeze", description: "Strawberry, white chocolate, coconut", category: "Freeze", price: "5.75" },
      
      // Rebels (Energy Drinks)
      { name: "Original Rebel", description: "Dutch Bros energy drink", category: "Rebel Energy", price: "4.50" },
      { name: "Blue Rebel", description: "Blue raspberry energy", category: "Rebel Energy", price: "4.50" },
      { name: "Peach Rebel", description: "Peach energy drink", category: "Rebel Energy", price: "4.75" },
      { name: "Strawberry Rebel", description: "Strawberry energy drink", category: "Rebel Energy", price: "4.75" },
      { name: "Electric Berry Rebel", description: "Berry blast energy", category: "Rebel Energy", price: "4.75" },
      { name: "Tropical Rebel", description: "Passion fruit mango energy", category: "Rebel Energy", price: "4.75" },
      
      // Smoothies
      { name: "Strawberry Banana Smoothie", description: "Classic fruit smoothie", category: "Smoothies", price: "5.25" },
      { name: "Mango Smoothie", description: "Tropical mango blend", category: "Smoothies", price: "5.25" },
      { name: "Acai Smoothie", description: "Antioxidant acai berry", category: "Smoothies", price: "5.75" },
      
      // Tea
      { name: "Chai Tea Latte", description: "Spiced chai with steamed milk", category: "Tea", price: "4.50" },
      { name: "London Fog", description: "Earl Grey, vanilla, steamed milk", category: "Tea", price: "4.50" },
      { name: "Iced Green Tea", description: "Refreshing green tea", category: "Tea", price: "3.50" },
      { name: "Passion Fruit Tea", description: "Fruit-infused herbal tea", category: "Tea", price: "3.75" },
      
      // Snacks
      { name: "Dutch Muffin Top", description: "Brown butter muffin top", category: "Snacks", price: "3.00" },
      { name: "Granola Bar", description: "Oat and honey bar", category: "Snacks", price: "2.50" },
    ]
  },
  
  {
    name: "Dunkin'",
    description: "America's favorite coffee and donut chain. Fast, reliable service perfect for large office orders. Donuts, bagels, and breakfast sandwiches.",
    address: "Multiple Nashville Locations",
    neighborhood: "Citywide",
    rating: "4.2",
    minimumOrder: "25.00",
    isNationalChain: true,
    menu: [
      // Hot Coffee
      { name: "Original Blend Coffee", description: "Signature smooth coffee", category: "Hot Coffee", price: "2.49" },
      { name: "Dunkin' Midnight Dark Roast", description: "Bold, dark roasted coffee", category: "Hot Coffee", price: "2.49" },
      { name: "Decaf Coffee", description: "Smooth decaffeinated blend", category: "Hot Coffee", price: "2.49" },
      
      // Espresso
      { name: "Latte", description: "Espresso with steamed milk", category: "Espresso", price: "4.59" },
      { name: "Cappuccino", description: "Espresso with foamed milk", category: "Espresso", price: "4.59" },
      { name: "Americano", description: "Espresso with hot water", category: "Espresso", price: "3.29" },
      { name: "Mocha Latte", description: "Espresso, chocolate, steamed milk", category: "Espresso", price: "4.99" },
      { name: "Caramel Swirl Latte", description: "Latte with caramel swirl", category: "Espresso", price: "5.19" },
      { name: "Pumpkin Spice Latte", description: "Fall favorite with pumpkin flavors", category: "Espresso", price: "5.49" },
      
      // Cold Drinks
      { name: "Iced Coffee", description: "Fresh brewed, served over ice", category: "Cold Drinks", price: "3.29" },
      { name: "Cold Brew", description: "Smooth, slow-steeped", category: "Cold Drinks", price: "3.99" },
      { name: "Iced Latte", description: "Espresso with cold milk over ice", category: "Cold Drinks", price: "4.79" },
      { name: "Frozen Coffee", description: "Blended iced coffee", category: "Cold Drinks", price: "4.49" },
      { name: "Refreshers", description: "Fruit-flavored energy drinks", category: "Cold Drinks", price: "3.99" },
      
      // Donuts
      { name: "Glazed Donut", description: "Classic glazed ring", category: "Donuts", price: "1.49" },
      { name: "Boston Kreme", description: "Filled with custard, chocolate topped", category: "Donuts", price: "1.79" },
      { name: "Chocolate Frosted", description: "Chocolate frosted ring", category: "Donuts", price: "1.49" },
      { name: "Strawberry Frosted", description: "Strawberry frosted with sprinkles", category: "Donuts", price: "1.49" },
      { name: "Jelly Filled", description: "Filled with jelly", category: "Donuts", price: "1.79" },
      { name: "Blueberry Cake", description: "Blueberry cake donut", category: "Donuts", price: "1.79" },
      { name: "Apple Fritter", description: "Apple-filled fritter", category: "Donuts", price: "2.29" },
      { name: "Cruller", description: "Light twisted pastry", category: "Donuts", price: "1.79" },
      
      // Breakfast
      { name: "Bacon, Egg & Cheese", description: "On croissant, bagel, or English muffin", category: "Breakfast", price: "5.49" },
      { name: "Sausage, Egg & Cheese", description: "On croissant, bagel, or English muffin", category: "Breakfast", price: "5.49" },
      { name: "Hash Browns (6)", description: "Crispy hash brown bites", category: "Breakfast", price: "2.79" },
      { name: "Wake-Up Wrap", description: "Egg and cheese in a tortilla", category: "Breakfast", price: "2.99" },
      { name: "Bagel with Cream Cheese", description: "Toasted bagel with spread", category: "Breakfast", price: "3.49" },
      
      // Munchkins
      { name: "Munchkins (10)", description: "Assorted donut holes", category: "Snacks", price: "4.79" },
      { name: "Munchkins (25)", description: "Assorted donut holes box", category: "Snacks", price: "9.99" },
      { name: "Munchkins (50)", description: "Large assorted donut holes", category: "Catering", price: "15.99" },
      
      // Catering
      { name: "Box O' Joe (10 cups)", description: "10 cups of fresh coffee", category: "Catering", price: "19.99" },
      { name: "Dozen Donuts", description: "12 assorted donuts", category: "Catering", price: "14.99" },
      { name: "Half Dozen Donuts", description: "6 assorted donuts", category: "Catering", price: "8.99" },
    ]
  },
  
  {
    name: "Panera Bread",
    description: "Bakery-café chain with quality coffee, pastries, and breakfast items. Great for meetings needing food alongside beverages.",
    address: "Multiple Nashville Locations",
    neighborhood: "Citywide",
    rating: "4.4",
    minimumOrder: "40.00",
    isNationalChain: true,
    menu: [
      // Coffee
      { name: "Light Roast Coffee", description: "Smooth, light-bodied", category: "Hot Coffee", price: "2.79" },
      { name: "Dark Roast Coffee", description: "Bold, full-bodied", category: "Hot Coffee", price: "2.79" },
      { name: "Hazelnut Coffee", description: "Flavored light roast", category: "Hot Coffee", price: "2.79" },
      { name: "Decaf Coffee", description: "Smooth decaf blend", category: "Hot Coffee", price: "2.79" },
      
      // Espresso
      { name: "Caffè Latte", description: "Espresso with steamed milk", category: "Espresso", price: "4.99" },
      { name: "Cappuccino", description: "Espresso with foamed milk", category: "Espresso", price: "4.99" },
      { name: "Caramel Latte", description: "Espresso with caramel and milk", category: "Espresso", price: "5.49" },
      { name: "Mocha", description: "Espresso, chocolate, steamed milk", category: "Espresso", price: "5.49" },
      { name: "Vanilla Latte", description: "Espresso with vanilla and milk", category: "Espresso", price: "5.49" },
      { name: "Chai Tea Latte", description: "Spiced chai with steamed milk", category: "Espresso", price: "4.99" },
      
      // Cold Drinks
      { name: "Iced Coffee", description: "Fresh brewed over ice", category: "Cold Drinks", price: "3.29" },
      { name: "Cold Brew", description: "Slow-steeped smooth coffee", category: "Cold Drinks", price: "3.99" },
      { name: "Frozen Mocha", description: "Blended chocolate coffee", category: "Cold Drinks", price: "5.79" },
      { name: "Frozen Caramel", description: "Blended caramel coffee", category: "Cold Drinks", price: "5.79" },
      { name: "Strawberry Lemon Mint Charged Lemonade", description: "Energizing lemonade", category: "Cold Drinks", price: "4.29" },
      { name: "Mango Yuzu Citrus Charged Lemonade", description: "Tropical energizing lemonade", category: "Cold Drinks", price: "4.29" },
      
      // Pastries
      { name: "Bear Claw", description: "Almond-filled pastry", category: "Pastries", price: "3.79" },
      { name: "Cheese Pastry", description: "Flaky cream cheese pastry", category: "Pastries", price: "3.49" },
      { name: "Cinnamon Roll", description: "Iced cinnamon pastry", category: "Pastries", price: "4.29" },
      { name: "Blueberry Muffin", description: "Fresh blueberry muffin", category: "Pastries", price: "3.49" },
      { name: "Chocolate Chip Muffin", description: "Chocolate chip studded", category: "Pastries", price: "3.49" },
      { name: "Croissant", description: "Buttery French pastry", category: "Pastries", price: "3.29" },
      { name: "Chocolate Croissant", description: "Croissant with chocolate", category: "Pastries", price: "3.79" },
      { name: "Pecan Braid", description: "Sweet pecan-filled pastry", category: "Pastries", price: "4.49" },
      
      // Breakfast
      { name: "Bacon, Egg & Cheese on Ciabatta", description: "Premium breakfast sandwich", category: "Breakfast", price: "7.49" },
      { name: "Sausage, Egg & Cheese on Ciabatta", description: "Hearty breakfast sandwich", category: "Breakfast", price: "7.49" },
      { name: "Avocado, Egg & Spinach on Sprouted Grain", description: "Healthy breakfast option", category: "Breakfast", price: "7.99" },
      { name: "Steel Cut Oatmeal", description: "With fresh strawberries and pecans", category: "Breakfast", price: "5.29" },
      { name: "Greek Yogurt Parfait", description: "With granola and berries", category: "Breakfast", price: "5.79" },
      
      // Bagels
      { name: "Plain Bagel with Cream Cheese", description: "Classic with spread", category: "Bagels", price: "3.49" },
      { name: "Everything Bagel with Cream Cheese", description: "Seasoned bagel with spread", category: "Bagels", price: "3.49" },
      { name: "Cinnamon Crunch Bagel", description: "Sweet cinnamon topping", category: "Bagels", price: "3.69" },
      { name: "Asiago Cheese Bagel", description: "Topped with asiago", category: "Bagels", price: "3.69" },
      
      // Catering
      { name: "Coffee To-Go (8-10 cups)", description: "Fresh brewed coffee for groups", category: "Catering", price: "19.99" },
      { name: "Assorted Pastry Box (13)", description: "Baker's dozen pastries", category: "Catering", price: "39.99" },
      { name: "Bagel Bundle (13)", description: "Dozen bagels with cream cheese", category: "Catering", price: "34.99" },
    ]
  },
  
  // =====================
  // NASHVILLE LOCAL FAVORITES
  // =====================
  {
    name: "Crema Coffee Roasters",
    description: "Nashville's premier specialty roaster. Award-winning single-origin coffees and house-made pastries in a modern industrial space.",
    address: "15 Hermitage Ave, Nashville, TN 37210",
    neighborhood: "Downtown Nashville",
    rating: "4.8",
    minimumOrder: "35.00",
    menu: [
      { name: "Drip Coffee", description: "Rotating single-origin", category: "Coffee", price: "3.50" },
      { name: "Pour Over", description: "Hand-poured single origin", category: "Coffee", price: "5.00" },
      { name: "Cold Brew", description: "Slow-steeped 24 hours", category: "Coffee", price: "4.50" },
      { name: "Espresso", description: "Double shot", category: "Espresso", price: "3.00" },
      { name: "Cortado", description: "Espresso with steamed milk", category: "Espresso", price: "4.00" },
      { name: "Cappuccino", description: "Espresso with foamed milk", category: "Espresso", price: "4.50" },
      { name: "Latte", description: "Espresso with steamed milk", category: "Espresso", price: "5.00" },
      { name: "Mocha", description: "Espresso, chocolate, steamed milk", category: "Espresso", price: "5.50" },
      { name: "Vanilla Latte", description: "Latte with house vanilla", category: "Espresso", price: "5.50" },
      { name: "Honey Lavender Latte", description: "Nashville favorite signature drink", category: "Signature", price: "6.00" },
      { name: "Maple Oat Latte", description: "Oat milk with maple syrup", category: "Signature", price: "6.00" },
      { name: "Chai Latte", description: "House-spiced chai", category: "Tea", price: "5.00" },
      { name: "Matcha Latte", description: "Ceremonial grade matcha", category: "Tea", price: "5.50" },
      { name: "Almond Croissant", description: "Fresh-baked with almond cream", category: "Pastries", price: "4.50" },
      { name: "Pain au Chocolat", description: "Chocolate croissant", category: "Pastries", price: "4.00" },
      { name: "Blueberry Scone", description: "House-made with fresh berries", category: "Pastries", price: "3.75" },
      { name: "Avocado Toast", description: "On house sourdough", category: "Food", price: "9.00" },
    ]
  },
  
  {
    name: "Barista Parlor",
    description: "Nashville's coolest coffee destination. Vintage motorcycles, exposed brick, and exceptional espresso in multiple unique locations.",
    address: "519 Gallatin Ave, Nashville, TN 37206",
    neighborhood: "East Nashville",
    rating: "4.7",
    minimumOrder: "35.00",
    menu: [
      { name: "Batch Brew", description: "Fresh drip coffee", category: "Coffee", price: "3.25" },
      { name: "Pour Over", description: "Hand-poured specialty", category: "Coffee", price: "5.50" },
      { name: "Cold Brew", description: "Smooth and strong", category: "Coffee", price: "4.75" },
      { name: "Nitro Cold Brew", description: "Creamy nitrogen-infused", category: "Coffee", price: "5.50" },
      { name: "Espresso", description: "House blend double shot", category: "Espresso", price: "3.25" },
      { name: "Macchiato", description: "Espresso with foam", category: "Espresso", price: "3.75" },
      { name: "Cortado", description: "Equal parts espresso and milk", category: "Espresso", price: "4.25" },
      { name: "Flat White", description: "Ristretto with microfoam", category: "Espresso", price: "4.75" },
      { name: "Cappuccino", description: "Traditional Italian style", category: "Espresso", price: "4.75" },
      { name: "Latte", description: "Smooth and creamy", category: "Espresso", price: "5.25" },
      { name: "Mocha", description: "Espresso with chocolate", category: "Espresso", price: "5.75" },
      { name: "Americano", description: "Espresso with hot water", category: "Espresso", price: "3.50" },
      { name: "Honey Cinnamon Latte", description: "Signature Nashville drink", category: "Signature", price: "6.25" },
      { name: "Brown Sugar Oat Latte", description: "Oat milk with brown sugar", category: "Signature", price: "6.25" },
      { name: "Chai Latte", description: "House-blended spices", category: "Tea", price: "5.25" },
      { name: "Matcha Latte", description: "Premium Japanese matcha", category: "Tea", price: "5.75" },
      { name: "Morning Bun", description: "Cinnamon sugar pastry", category: "Pastries", price: "4.25" },
      { name: "Chocolate Chip Cookie", description: "Giant house-baked", category: "Pastries", price: "3.50" },
    ]
  },
  
  {
    name: "Frothy Monkey",
    description: "Nashville-born coffeehouse with full breakfast and lunch menus. Local favorite for business meetings with hearty food options.",
    address: "2509 12th Ave S, Nashville, TN 37204",
    neighborhood: "12 South",
    rating: "4.6",
    minimumOrder: "40.00",
    menu: [
      { name: "House Coffee", description: "Frothy blend drip", category: "Coffee", price: "3.00" },
      { name: "Cold Brew", description: "Smooth 18-hour steep", category: "Coffee", price: "4.25" },
      { name: "Nitro Cold Brew", description: "Creamy nitrogen pour", category: "Coffee", price: "5.00" },
      { name: "Espresso", description: "Double shot", category: "Espresso", price: "3.00" },
      { name: "Americano", description: "Espresso with water", category: "Espresso", price: "3.50" },
      { name: "Latte", description: "Classic espresso with milk", category: "Espresso", price: "4.75" },
      { name: "Cappuccino", description: "Foamy espresso drink", category: "Espresso", price: "4.75" },
      { name: "Mocha", description: "Chocolate espresso drink", category: "Espresso", price: "5.25" },
      { name: "Vanilla Latte", description: "Sweet vanilla espresso", category: "Espresso", price: "5.25" },
      { name: "Caramel Latte", description: "Caramel espresso drink", category: "Espresso", price: "5.25" },
      { name: "Monkey Mocha", description: "Banana and chocolate espresso", category: "Signature", price: "5.75" },
      { name: "Lavender Latte", description: "Floral espresso drink", category: "Signature", price: "5.75" },
      { name: "Chai Latte", description: "Spiced chai with milk", category: "Tea", price: "4.75" },
      { name: "London Fog", description: "Earl Grey with vanilla and milk", category: "Tea", price: "4.75" },
      { name: "Hot Tea", description: "Selection of loose leaf", category: "Tea", price: "3.25" },
      { name: "Avocado Toast", description: "Smashed avocado on sourdough", category: "Food", price: "10.00" },
      { name: "Breakfast Burrito", description: "Eggs, cheese, peppers, salsa", category: "Food", price: "11.00" },
      { name: "Acai Bowl", description: "Fresh berries and granola", category: "Food", price: "12.00" },
      { name: "Bagel with Cream Cheese", description: "House bagel with spread", category: "Pastries", price: "4.50" },
      { name: "Blueberry Muffin", description: "Fresh-baked daily", category: "Pastries", price: "3.75" },
      { name: "Banana Bread", description: "Moist house-made", category: "Pastries", price: "4.00" },
    ]
  },
  
  {
    name: "Humphreys Street Coffee",
    description: "Social enterprise coffee shop training refugees and immigrants. Exceptional coffee with global influences and a meaningful mission.",
    address: "2801 Humphreys St, Nashville, TN 37211",
    neighborhood: "Wedgewood-Houston",
    rating: "4.9",
    minimumOrder: "30.00",
    menu: [
      { name: "Pour Over", description: "Single-origin hand-poured", category: "Coffee", price: "5.00" },
      { name: "Drip Coffee", description: "Fresh brewed batch", category: "Coffee", price: "3.25" },
      { name: "Cold Brew", description: "Smooth cold steep", category: "Coffee", price: "4.50" },
      { name: "Espresso", description: "Double shot", category: "Espresso", price: "3.00" },
      { name: "Cortado", description: "Espresso with equal milk", category: "Espresso", price: "4.00" },
      { name: "Flat White", description: "Silky microfoam", category: "Espresso", price: "4.50" },
      { name: "Latte", description: "Smooth espresso milk", category: "Espresso", price: "5.00" },
      { name: "Cappuccino", description: "Traditional foamed", category: "Espresso", price: "4.50" },
      { name: "Mocha", description: "Chocolate espresso", category: "Espresso", price: "5.50" },
      { name: "Cardamom Latte", description: "Middle Eastern inspired", category: "Signature", price: "5.75" },
      { name: "Rose Latte", description: "Floral and sweet", category: "Signature", price: "5.75" },
      { name: "Saffron Latte", description: "Exotic golden milk espresso", category: "Signature", price: "6.25" },
      { name: "Chai Latte", description: "House spice blend", category: "Tea", price: "5.00" },
      { name: "Matcha Latte", description: "Japanese green tea", category: "Tea", price: "5.50" },
      { name: "Baklava", description: "House-made Mediterranean pastry", category: "Pastries", price: "4.50" },
      { name: "Croissant", description: "Butter croissant", category: "Pastries", price: "3.75" },
    ]
  },
  
  {
    name: "Steadfast Coffee",
    description: "Precision coffee in a minimalist space. Pour-overs and espresso crafted with scientific precision for coffee purists.",
    address: "603 Taylor St, Nashville, TN 37208",
    neighborhood: "Germantown",
    rating: "4.8",
    minimumOrder: "35.00",
    menu: [
      { name: "Filter Coffee", description: "Batch brew rotating origin", category: "Coffee", price: "3.50" },
      { name: "Pour Over - V60", description: "Hand-poured precision", category: "Coffee", price: "5.50" },
      { name: "Pour Over - Chemex", description: "Clean bright pour over", category: "Coffee", price: "6.00" },
      { name: "Cold Brew", description: "24-hour steep", category: "Coffee", price: "4.75" },
      { name: "Flash Brew", description: "Japanese iced coffee", category: "Coffee", price: "5.00" },
      { name: "Espresso", description: "Precise double shot", category: "Espresso", price: "3.50" },
      { name: "Americano", description: "Espresso with water", category: "Espresso", price: "4.00" },
      { name: "Macchiato", description: "Espresso with foam dot", category: "Espresso", price: "3.75" },
      { name: "Cortado", description: "4oz espresso and milk", category: "Espresso", price: "4.25" },
      { name: "Flat White", description: "6oz with microfoam", category: "Espresso", price: "4.75" },
      { name: "Cappuccino", description: "Traditional 6oz", category: "Espresso", price: "4.75" },
      { name: "Latte", description: "8oz or 12oz available", category: "Espresso", price: "5.25" },
      { name: "Mocha", description: "Espresso with house chocolate", category: "Espresso", price: "5.75" },
      { name: "Matcha Latte", description: "Ceremonial grade", category: "Tea", price: "5.50" },
      { name: "Hojicha Latte", description: "Roasted green tea latte", category: "Tea", price: "5.50" },
    ]
  },
  
  // =====================
  // JUICE & SMOOTHIE BARS
  // =====================
  {
    name: "Juice Bar Nashville",
    description: "Fresh cold-pressed juices and smoothies. Health-focused options perfect for wellness-minded meetings and corporate events.",
    address: "2203 Bandywood Dr, Nashville, TN 37215",
    neighborhood: "Green Hills",
    rating: "4.7",
    minimumOrder: "35.00",
    menu: [
      // Juices
      { name: "Green Machine", description: "Kale, spinach, apple, cucumber, lemon", category: "Fresh Juice", price: "8.50" },
      { name: "Citrus Sunrise", description: "Orange, grapefruit, lemon, ginger", category: "Fresh Juice", price: "7.50" },
      { name: "Beet It", description: "Beet, carrot, apple, ginger", category: "Fresh Juice", price: "8.00" },
      { name: "Carrot Gold", description: "Carrot, apple, turmeric, ginger", category: "Fresh Juice", price: "7.50" },
      { name: "Celery Cleanse", description: "Pure celery juice", category: "Fresh Juice", price: "7.00" },
      { name: "Mean Green", description: "Cucumber, celery, kale, apple, lemon", category: "Fresh Juice", price: "8.50" },
      { name: "Immunity Shot", description: "Ginger, turmeric, lemon, cayenne", category: "Wellness Shots", price: "4.50" },
      { name: "Wheatgrass Shot", description: "Fresh wheatgrass", category: "Wellness Shots", price: "4.00" },
      
      // Smoothies
      { name: "Acai Bowl", description: "Acai, banana, berries, granola", category: "Bowls", price: "12.00" },
      { name: "Pitaya Bowl", description: "Dragon fruit, mango, coconut", category: "Bowls", price: "12.00" },
      { name: "Green Smoothie", description: "Spinach, banana, mango, almond milk", category: "Smoothies", price: "9.00" },
      { name: "Berry Blast", description: "Mixed berries, banana, almond milk", category: "Smoothies", price: "8.50" },
      { name: "Tropical Paradise", description: "Mango, pineapple, coconut", category: "Smoothies", price: "8.50" },
      { name: "Peanut Butter Power", description: "Banana, peanut butter, oat milk, protein", category: "Smoothies", price: "9.50" },
      { name: "Chocolate Dream", description: "Cacao, banana, almond butter, dates", category: "Smoothies", price: "9.50" },
      
      // Add-ons
      { name: "Protein Boost", description: "Add plant protein", category: "Add-ons", price: "2.00" },
      { name: "Collagen Boost", description: "Add collagen peptides", category: "Add-ons", price: "2.50" },
      { name: "CBD Oil", description: "Add CBD for calm", category: "Add-ons", price: "5.00" },
    ]
  },
  
  // =====================
  // BOBA TEA
  // =====================
  {
    name: "Kung Fu Tea",
    description: "Popular bubble tea chain with hundreds of combinations. Perfect for trendy meetings and younger teams.",
    address: "2525 West End Ave, Nashville, TN 37203",
    neighborhood: "Midtown",
    rating: "4.5",
    minimumOrder: "30.00",
    isNationalChain: true,
    menu: [
      // Milk Tea
      { name: "Classic Milk Tea", description: "Traditional black milk tea with tapioca", category: "Milk Tea", price: "5.50" },
      { name: "Thai Milk Tea", description: "Sweet Thai tea with boba", category: "Milk Tea", price: "5.75" },
      { name: "Taro Milk Tea", description: "Purple taro root milk tea", category: "Milk Tea", price: "5.75" },
      { name: "Oolong Milk Tea", description: "Roasted oolong with milk", category: "Milk Tea", price: "5.50" },
      { name: "Jasmine Milk Tea", description: "Floral jasmine with milk", category: "Milk Tea", price: "5.50" },
      { name: "Honey Milk Tea", description: "Sweetened with honey", category: "Milk Tea", price: "5.75" },
      { name: "Cocoa Cream", description: "Chocolate milk tea", category: "Milk Tea", price: "5.75" },
      
      // Fruit Tea
      { name: "Passion Fruit Green Tea", description: "Tropical fruit tea", category: "Fruit Tea", price: "5.25" },
      { name: "Mango Green Tea", description: "Sweet mango infusion", category: "Fruit Tea", price: "5.25" },
      { name: "Peach Oolong", description: "Peach flavored oolong", category: "Fruit Tea", price: "5.25" },
      { name: "Lychee Green Tea", description: "Sweet lychee flavor", category: "Fruit Tea", price: "5.25" },
      { name: "Strawberry Green Tea", description: "Fresh strawberry", category: "Fruit Tea", price: "5.25" },
      
      // Slush
      { name: "Mango Slush", description: "Frozen mango drink", category: "Slush", price: "6.25" },
      { name: "Strawberry Slush", description: "Frozen strawberry", category: "Slush", price: "6.25" },
      { name: "Taro Slush", description: "Frozen taro drink", category: "Slush", price: "6.25" },
      { name: "Oreo Slush", description: "Cookies and cream frozen", category: "Slush", price: "6.50" },
      
      // Toppings
      { name: "Extra Boba", description: "Add more tapioca pearls", category: "Toppings", price: "0.75" },
      { name: "Coconut Jelly", description: "Add coconut jelly", category: "Toppings", price: "0.75" },
      { name: "Aloe Vera", description: "Add aloe cubes", category: "Toppings", price: "0.75" },
      { name: "Pudding", description: "Add egg pudding", category: "Toppings", price: "0.75" },
      { name: "Cheese Foam", description: "Add salted cheese foam", category: "Toppings", price: "1.25" },
    ]
  },
  
  // =====================
  // DONUTS
  // =====================
  {
    name: "Five Daughters Bakery",
    description: "Nashville's famous 100-layer donuts. Artisan pastries using heritage grains and local ingredients. Instagram-worthy treats.",
    address: "1110 Caruthers Ave, Nashville, TN 37204",
    neighborhood: "12 South",
    rating: "4.8",
    minimumOrder: "35.00",
    menu: [
      // 100 Layer Donuts
      { name: "Vanilla Bean Glaze 100 Layer", description: "Signature croissant-donut hybrid", category: "100 Layer Donuts", price: "5.75" },
      { name: "Chocolate Sea Salt 100 Layer", description: "Dark chocolate with flaky salt", category: "100 Layer Donuts", price: "5.95" },
      { name: "Maple Bacon 100 Layer", description: "Maple glaze with candied bacon", category: "100 Layer Donuts", price: "6.25" },
      { name: "Lemon Blueberry 100 Layer", description: "Citrus glaze with fresh berries", category: "100 Layer Donuts", price: "6.25" },
      { name: "Cinnamon Sugar 100 Layer", description: "Classic cinnamon coating", category: "100 Layer Donuts", price: "5.75" },
      { name: "Cookies & Cream 100 Layer", description: "Vanilla with Oreo crumbles", category: "100 Layer Donuts", price: "6.25" },
      { name: "Salted Caramel 100 Layer", description: "Caramel with sea salt", category: "100 Layer Donuts", price: "5.95" },
      { name: "Seasonal Special 100 Layer", description: "Ask about current flavor", category: "100 Layer Donuts", price: "6.50" },
      
      // Paleo Donuts (GF)
      { name: "Chocolate Paleo Donut", description: "Grain-free chocolate", category: "Paleo Donuts", price: "5.50" },
      { name: "Vanilla Paleo Donut", description: "Grain-free vanilla glaze", category: "Paleo Donuts", price: "5.50" },
      { name: "Maple Paleo Donut", description: "Grain-free maple glaze", category: "Paleo Donuts", price: "5.50" },
      
      // Drinks
      { name: "Drip Coffee", description: "Local roaster", category: "Coffee", price: "3.00" },
      { name: "Cold Brew", description: "Smooth cold steep", category: "Coffee", price: "4.00" },
      { name: "Latte", description: "Espresso with steamed milk", category: "Coffee", price: "4.75" },
      { name: "Hot Chocolate", description: "Rich house chocolate", category: "Other", price: "4.00" },
      
      // Catering
      { name: "Dozen 100 Layer Donuts", description: "12 assorted signature donuts", category: "Catering", price: "65.00" },
      { name: "Half Dozen 100 Layer", description: "6 assorted signature donuts", category: "Catering", price: "34.00" },
    ]
  },
  
  {
    name: "Fox's Donut Den",
    description: "Nashville institution since 1974. Classic old-school donuts at unbeatable prices. Cash favorite for authentic donut runs.",
    address: "3900 Hillsboro Pike, Nashville, TN 37215",
    neighborhood: "Green Hills",
    rating: "4.6",
    minimumOrder: "20.00",
    menu: [
      { name: "Glazed Donut", description: "Classic glazed ring", category: "Donuts", price: "1.25" },
      { name: "Chocolate Glazed", description: "Chocolate covered ring", category: "Donuts", price: "1.50" },
      { name: "Maple Glazed", description: "Maple frosted ring", category: "Donuts", price: "1.50" },
      { name: "Chocolate Iced", description: "Chocolate icing ring", category: "Donuts", price: "1.50" },
      { name: "Strawberry Iced", description: "Pink strawberry icing", category: "Donuts", price: "1.50" },
      { name: "Cake Donut", description: "Dense cake-style", category: "Donuts", price: "1.25" },
      { name: "Blueberry Cake", description: "Blueberry cake donut", category: "Donuts", price: "1.75" },
      { name: "Apple Fritter", description: "Large apple fritter", category: "Donuts", price: "2.50" },
      { name: "Cinnamon Roll", description: "Fresh cinnamon roll", category: "Donuts", price: "2.25" },
      { name: "Cream Filled", description: "Bavarian cream filled", category: "Donuts", price: "1.75" },
      { name: "Jelly Filled", description: "Strawberry jelly filled", category: "Donuts", price: "1.75" },
      { name: "Long John - Chocolate", description: "Bar donut with chocolate", category: "Donuts", price: "1.75" },
      { name: "Long John - Maple", description: "Bar donut with maple", category: "Donuts", price: "1.75" },
      { name: "Donut Holes (Dozen)", description: "12 assorted holes", category: "Donuts", price: "3.50" },
      { name: "Coffee", description: "Fresh drip coffee", category: "Coffee", price: "1.50" },
      { name: "Dozen Donuts", description: "12 assorted donuts", category: "Catering", price: "13.00" },
      { name: "Two Dozen Donuts", description: "24 assorted donuts", category: "Catering", price: "24.00" },
    ]
  },
  
  // =====================
  // BREAKFAST SPOTS
  // =====================
  {
    name: "Biscuit Love",
    description: "Nashville's beloved breakfast destination. Famous biscuits and Southern breakfast perfect for morning meetings.",
    address: "316 11th Ave S, Nashville, TN 37203",
    neighborhood: "The Gulch",
    rating: "4.7",
    minimumOrder: "50.00",
    menu: [
      // Biscuits
      { name: "The Gertie", description: "Fried boneless chicken, pickles, honey mustard", category: "Biscuit Sandwiches", price: "11.00" },
      { name: "The Princess", description: "Fried chicken, hot sauce, pickles", category: "Biscuit Sandwiches", price: "12.00" },
      { name: "The Lily", description: "Fried green tomato, goat cheese, jam", category: "Biscuit Sandwiches", price: "10.00" },
      { name: "The East Nasty", description: "Fried chicken, cheddar, sausage gravy", category: "Biscuit Sandwiches", price: "13.00" },
      { name: "The Lindstrom", description: "Country ham, redeye gravy, biscuit", category: "Biscuit Sandwiches", price: "11.00" },
      { name: "Gravy Flight", description: "3 biscuits with 3 gravies", category: "Biscuits", price: "14.00" },
      { name: "Plain Biscuit", description: "House buttermilk biscuit", category: "Biscuits", price: "3.00" },
      { name: "Biscuit with Jam", description: "With house preserves", category: "Biscuits", price: "4.00" },
      
      // Breakfast
      { name: "Bonuts", description: "Biscuit donuts with lemon mascarpone", category: "Sweets", price: "9.00" },
      { name: "French Toast", description: "Brioche with seasonal fruit", category: "Sweets", price: "12.00" },
      
      // Drinks
      { name: "Drip Coffee", description: "Nashville roasted", category: "Coffee", price: "3.50" },
      { name: "Cold Brew", description: "Smooth cold steep", category: "Coffee", price: "4.50" },
      { name: "Latte", description: "Espresso with milk", category: "Coffee", price: "5.00" },
      { name: "Fresh OJ", description: "Squeezed orange juice", category: "Juice", price: "4.50" },
      { name: "Apple Juice", description: "Fresh pressed", category: "Juice", price: "4.00" },
      
      // Catering
      { name: "Biscuit Box (6)", description: "Half dozen plain biscuits", category: "Catering", price: "16.00" },
      { name: "Biscuit Box (12)", description: "Dozen plain biscuits", category: "Catering", price: "30.00" },
      { name: "Jam Sampler", description: "3 house-made jams", category: "Catering", price: "12.00" },
    ]
  },
];

async function seedVendors() {
  console.log('🌱 Starting vendor and menu seed...\n');
  
  // Clear existing data
  console.log('Clearing existing menu items...');
  await db.delete(menuItems);
  console.log('Clearing existing vendors...');
  await db.delete(vendors);
  
  let vendorCount = 0;
  let menuItemCount = 0;
  
  for (const vendorData of VENDORS) {
    // Insert vendor
    const [vendor] = await db.insert(vendors).values({
      name: vendorData.name,
      description: vendorData.description,
      address: vendorData.address,
      neighborhood: vendorData.neighborhood,
      imageUrl: vendorData.imageUrl,
      rating: vendorData.rating,
      minimumOrder: vendorData.minimumOrder,
      isActive: true,
    }).returning();
    
    vendorCount++;
    console.log(`✅ Added vendor: ${vendor.name} (${vendorData.menu.length} items)`);
    
    // Insert menu items
    for (const item of vendorData.menu) {
      await db.insert(menuItems).values({
        vendorId: vendor.id,
        name: item.name,
        description: item.description || null,
        category: item.category,
        price: item.price,
        isAvailable: true,
      });
      menuItemCount++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`🎉 SEED COMPLETE!`);
  console.log(`   Vendors: ${vendorCount}`);
  console.log(`   Menu Items: ${menuItemCount}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

seedVendors()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
