export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Shop {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  specialty: string;
  type: 'coffee' | 'smoothie' | 'both';
  menu: Product[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  pin: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Only', role: 'Founder', initials: 'O', pin: '1111' },
  { id: '2', name: 'Pete', role: 'Finance Manager', initials: 'P', pin: '1234' },
  { id: '3', name: 'Brian', role: 'Regional VP', initials: 'B', pin: '2345' },
  { id: '4', name: 'Megan', role: 'General Manager', initials: 'M', pin: '3456' },
  { id: '5', name: 'Brooke K', role: 'HR Manager', initials: 'BK', pin: '4567' },
  { id: '6', name: 'Jay', role: 'Purchasing Manager', initials: 'J', pin: '5678' },
  { id: '7', name: 'AJ', role: 'Warehouse Manager', initials: 'AJ', pin: '6789' },
];

export const COFFEE_SHOPS: Shop[] = [
  {
    id: 'crema',
    name: 'Crema Coffee Roasters',
    image: '/attached_assets/generated_images/crema_coffee_roasters_interior.png',
    location: 'Downtown Nashville',
    rating: 4.9,
    specialty: 'Single Origin Pour Over',
    type: 'coffee',
    menu: [
      { id: 'c1', name: 'Seasonal Pour Over', description: 'Ethiopian Yirgacheffe', price: 5.50, category: 'Coffee' },
      { id: 'c2', name: 'Coffee Soda', description: 'Espresso, soda water, orange peel', price: 6.00, category: 'Specialty' },
      { id: 'c3', name: 'Iced Americano', description: 'Double shot over ice', price: 4.50, category: 'Coffee' },
      { id: 'c4', name: 'Honey Lavender Latte', description: 'Local honey, lavender syrup', price: 6.50, category: 'Specialty' },
      { id: 'c5', name: 'Fruit Refresher', description: 'Passion fruit, mango, green tea', price: 5.50, category: 'Fruit Drinks' },
      { id: 'c6', name: 'Avocado Toast', description: 'Sourdough, radish, chili oil', price: 12.00, category: 'Food' },
      { id: 'c7', name: 'Carafe Service (10 Cups)', description: 'Meeting size freshly brewed coffee', price: 45.00, category: 'Catering' },
      { id: 'c8', name: 'Assorted Pastry Box (12)', description: 'Croissants, muffins, scones', price: 48.00, category: 'Catering' },
    ]
  },
  {
    id: 'barista-parlor',
    name: 'Barista Parlor',
    image: '/attached_assets/generated_images/barista_parlor_interior.png',
    location: 'The Gulch',
    rating: 4.8,
    specialty: 'Artisan Espresso',
    type: 'coffee',
    menu: [
      { id: 'b1', name: 'Bourbon Vanilla Latte', description: 'House-made vanilla syrup', price: 6.50, category: 'Coffee' },
      { id: 'b2', name: 'Whiskey Caramel', description: 'Signature sweet espresso drink', price: 7.00, category: 'Specialty' },
      { id: 'b3', name: 'Cold Brew', description: '24-hour steeped, smooth finish', price: 5.00, category: 'Coffee' },
      { id: 'b4', name: 'Matcha Lemonade', description: 'Ceremonial matcha, fresh lemon', price: 6.00, category: 'Fruit Drinks' },
      { id: 'b5', name: 'Berry Hibiscus Refresher', description: 'Mixed berries, hibiscus tea', price: 5.50, category: 'Fruit Drinks' },
      { id: 'b6', name: 'Biscuit Sandwich', description: 'Egg, cheese, bacon', price: 9.00, category: 'Food' },
      { id: 'b7', name: 'Pastry Box (Dozen)', description: 'Assorted morning pastries', price: 55.00, category: 'Catering' },
      { id: 'b8', name: 'Coffee Bar Setup', description: 'Full service for 20 people', price: 150.00, category: 'Catering' },
    ]
  },
  {
    id: 'frothy-monkey',
    name: 'Frothy Monkey',
    image: '/attached_assets/generated_images/frothy_monkey_interior.png',
    location: '12 South',
    rating: 4.7,
    specialty: 'Breakfast Blend',
    type: 'both',
    menu: [
      { id: 'f1', name: 'Monkey Mocha', description: 'Banana syrup, chocolate', price: 6.00, category: 'Specialty' },
      { id: 'f2', name: 'Drip Coffee', description: 'House blend, bottomless option', price: 4.00, category: 'Coffee' },
      { id: 'f3', name: 'Tropical Smoothie', description: 'Mango, pineapple, coconut milk', price: 7.00, category: 'Smoothies' },
      { id: 'f4', name: 'Berry Blast Smoothie', description: 'Strawberry, blueberry, banana', price: 7.00, category: 'Smoothies' },
      { id: 'f5', name: 'Green Machine', description: 'Spinach, banana, almond butter', price: 7.50, category: 'Smoothies' },
      { id: 'f6', name: 'Fresh Squeezed OJ', description: 'Made to order', price: 5.00, category: 'Fruit Drinks' },
      { id: 'f7', name: 'Loaded Oatmeal', description: 'Berries, nuts, brown sugar', price: 8.00, category: 'Food' },
      { id: 'f8', name: 'Meeting Traveler', description: '96oz of fresh coffee', price: 35.00, category: 'Catering' },
      { id: 'f9', name: 'Smoothie Bar (20 servings)', description: 'Build your own smoothie station', price: 120.00, category: 'Catering' },
    ]
  },
  {
    id: 'drug-store',
    name: 'Drug Store Coffee',
    image: '/attached_assets/generated_images/drug_store_coffee_interior.png',
    location: 'Noelle Hotel',
    rating: 4.9,
    specialty: 'Premium Experience',
    type: 'coffee',
    menu: [
      { id: 'd1', name: 'Cortado', description: 'Equal parts espresso and milk', price: 4.50, category: 'Coffee' },
      { id: 'd2', name: 'Matcha Latte', description: 'Ceremonial grade matcha', price: 6.00, category: 'Tea' },
      { id: 'd3', name: 'Citrus Cold Brew', description: 'Orange zest infused', price: 6.00, category: 'Specialty' },
      { id: 'd4', name: 'Lavender Lemonade', description: 'House-made, refreshing', price: 5.00, category: 'Fruit Drinks' },
      { id: 'd5', name: 'Croissant', description: 'Butter croissant', price: 5.00, category: 'Food' },
      { id: 'd6', name: 'Executive Breakfast', description: 'Assorted pastries and fruit', price: 120.00, category: 'Catering' },
      { id: 'd7', name: 'Premium Coffee Service', description: 'White glove for 15 guests', price: 175.00, category: 'Catering' },
    ]
  },
  {
    id: 'steadfast',
    name: 'Steadfast Coffee',
    image: '/attached_assets/generated_images/crema_coffee_roasters_interior.png',
    location: 'East Nashville',
    rating: 4.8,
    specialty: 'Direct Trade Roasting',
    type: 'coffee',
    menu: [
      { id: 'st1', name: 'House Espresso', description: 'Rich, balanced blend', price: 4.00, category: 'Coffee' },
      { id: 'st2', name: 'Oat Milk Latte', description: 'Creamy oat milk, espresso', price: 6.00, category: 'Coffee' },
      { id: 'st3', name: 'Nitro Cold Brew', description: 'Creamy nitrogen-infused', price: 5.50, category: 'Coffee' },
      { id: 'st4', name: 'Chai Latte', description: 'House-spiced chai', price: 5.50, category: 'Tea' },
      { id: 'st5', name: 'Lemon Ginger Tea', description: 'Fresh and soothing', price: 4.50, category: 'Tea' },
      { id: 'st6', name: 'Breakfast Burrito', description: 'Eggs, cheese, peppers', price: 10.00, category: 'Food' },
      { id: 'st7', name: 'Office Carafe (12 cups)', description: 'Fresh brewed for meetings', price: 50.00, category: 'Catering' },
    ]
  },
  {
    id: 'dose',
    name: 'Dose Coffee',
    image: '/attached_assets/generated_images/barista_parlor_interior.png',
    location: 'Berry Hill',
    rating: 4.6,
    specialty: 'Quick Service Excellence',
    type: 'coffee',
    menu: [
      { id: 'do1', name: 'Classic Latte', description: 'Perfect espresso balance', price: 5.00, category: 'Coffee' },
      { id: 'do2', name: 'Caramel Macchiato', description: 'Vanilla, caramel drizzle', price: 5.50, category: 'Specialty' },
      { id: 'do3', name: 'Iced Mocha', description: 'Chocolate, espresso, milk', price: 5.50, category: 'Coffee' },
      { id: 'do4', name: 'Strawberry Acai Refresher', description: 'Light and fruity', price: 5.00, category: 'Fruit Drinks' },
      { id: 'do5', name: 'Protein Smoothie', description: 'Banana, peanut butter, protein', price: 7.50, category: 'Smoothies' },
      { id: 'do6', name: 'Quick Bite Box', description: 'Muffin, fruit, yogurt', price: 8.00, category: 'Food' },
      { id: 'do7', name: 'Team Coffee Box', description: '10 cups + cream & sugar', price: 40.00, category: 'Catering' },
    ]
  },
  {
    id: 'humphreys',
    name: 'Humphreys Street Coffee',
    image: '/attached_assets/generated_images/frothy_monkey_interior.png',
    location: 'Wedgewood-Houston',
    rating: 4.7,
    specialty: 'Neighborhood Vibes',
    type: 'both',
    menu: [
      { id: 'h1', name: 'House Drip', description: 'Rotating single origin', price: 3.50, category: 'Coffee' },
      { id: 'h2', name: 'Honey Oat Latte', description: 'Sweet and creamy', price: 6.00, category: 'Specialty' },
      { id: 'h3', name: 'Iced Tea', description: 'Sweet or unsweet', price: 3.00, category: 'Tea' },
      { id: 'h4', name: 'Peach Mango Smoothie', description: 'Fresh fruit blend', price: 6.50, category: 'Smoothies' },
      { id: 'h5', name: 'Açaí Bowl', description: 'Topped with granola, fruit', price: 10.00, category: 'Food' },
      { id: 'h6', name: 'Bagel & Schmear', description: 'Cream cheese, your choice', price: 5.00, category: 'Food' },
      { id: 'h7', name: 'Brunch Catering', description: 'Coffee + pastries for 15', price: 85.00, category: 'Catering' },
    ]
  },
  {
    id: 'smoothie-king',
    name: 'Smoothie King',
    image: '/attached_assets/generated_images/drug_store_coffee_interior.png',
    location: 'Multiple Nashville Locations',
    rating: 4.5,
    specialty: 'Fitness & Wellness Smoothies',
    type: 'smoothie',
    menu: [
      { id: 'sk1', name: 'Hulk (Strawberry)', description: 'Weight gain blend', price: 7.99, category: 'Smoothies' },
      { id: 'sk2', name: 'Lean1 Vanilla', description: 'Meal replacement smoothie', price: 7.49, category: 'Smoothies' },
      { id: 'sk3', name: 'Gladiator Chocolate', description: '45g protein power', price: 8.49, category: 'Smoothies' },
      { id: 'sk4', name: 'Caribbean Way', description: 'Strawberry, banana, papaya', price: 6.99, category: 'Smoothies' },
      { id: 'sk5', name: 'Pineapple Surf', description: 'Tropical pineapple blend', price: 6.99, category: 'Smoothies' },
      { id: 'sk6', name: 'Immune Builder', description: 'Vitamin C, zinc boost', price: 7.49, category: 'Smoothies' },
      { id: 'sk7', name: 'Angel Food', description: 'Light and fruity', price: 6.49, category: 'Smoothies' },
      { id: 'sk8', name: 'Team Fuel Pack (10)', description: '10 medium smoothies', price: 65.00, category: 'Catering' },
      { id: 'sk9', name: 'Wellness Bar Setup', description: 'Smoothie bar for 20', price: 140.00, category: 'Catering' },
    ]
  },
  {
    id: 'tropical-smoothie',
    name: 'Tropical Smoothie Cafe',
    image: '/attached_assets/generated_images/crema_coffee_roasters_interior.png',
    location: 'Green Hills',
    rating: 4.4,
    specialty: 'Tropical Flavors & Wraps',
    type: 'both',
    menu: [
      { id: 'ts1', name: 'Sunrise Sunset', description: 'Strawberry, pineapple, mango', price: 6.49, category: 'Smoothies' },
      { id: 'ts2', name: 'Bahama Mama', description: 'Strawberry, pineapple, coconut', price: 6.49, category: 'Smoothies' },
      { id: 'ts3', name: 'Detox Island Green', description: 'Spinach, kale, mango, banana', price: 6.99, category: 'Smoothies' },
      { id: 'ts4', name: 'Peanut Butter Cup', description: 'Chocolate, peanut butter', price: 6.99, category: 'Smoothies' },
      { id: 'ts5', name: 'Acai Berry Boost', description: 'Acai, blueberry, strawberry', price: 7.29, category: 'Smoothies' },
      { id: 'ts6', name: 'Fresh Lemonade', description: 'Made fresh daily', price: 3.99, category: 'Fruit Drinks' },
      { id: 'ts7', name: 'Chicken Caesar Wrap', description: 'Grilled chicken, romaine', price: 9.99, category: 'Food' },
      { id: 'ts8', name: 'Meeting Smoothie Bundle', description: '12 smoothies mixed', price: 72.00, category: 'Catering' },
    ]
  },
  {
    id: 'jamba',
    name: 'Jamba',
    image: '/attached_assets/generated_images/barista_parlor_interior.png',
    location: 'Cool Springs',
    rating: 4.3,
    specialty: 'Classic Smoothies & Bowls',
    type: 'smoothie',
    menu: [
      { id: 'j1', name: 'Strawberry Wild', description: 'Strawberry, apple juice', price: 6.29, category: 'Smoothies' },
      { id: 'j2', name: 'Mango-a-Go-Go', description: 'Mango, pineapple sherbet', price: 6.59, category: 'Smoothies' },
      { id: 'j3', name: 'Razzmatazz', description: 'Raspberry, strawberry, banana', price: 6.59, category: 'Smoothies' },
      { id: 'j4', name: 'Orange Dream Machine', description: 'Orange sherbet, vanilla', price: 6.29, category: 'Smoothies' },
      { id: 'j5', name: 'Protein Berry Workout', description: 'Whey protein, berries', price: 7.49, category: 'Smoothies' },
      { id: 'j6', name: 'Açaí Primo Bowl', description: 'Açaí, strawberry, banana', price: 9.49, category: 'Bowls' },
      { id: 'j7', name: 'Fresh Squeezed OJ', description: 'Made to order', price: 4.99, category: 'Fruit Drinks' },
      { id: 'j8', name: 'Office Fuel Pack', description: '8 smoothies + snacks', price: 58.00, category: 'Catering' },
    ]
  },
  {
    id: 'just-love',
    name: 'Just Love Coffee Cafe',
    image: '/attached_assets/generated_images/frothy_monkey_interior.png',
    location: 'Franklin',
    rating: 4.6,
    specialty: 'Community & Great Coffee',
    type: 'both',
    menu: [
      { id: 'jl1', name: 'Love Latte', description: 'Signature house latte', price: 5.50, category: 'Coffee' },
      { id: 'jl2', name: 'Frozen Mocha', description: 'Blended chocolate coffee', price: 6.00, category: 'Specialty' },
      { id: 'jl3', name: 'Nashville Hot Latte', description: 'Spicy cayenne kick', price: 6.00, category: 'Specialty' },
      { id: 'jl4', name: 'Berry Blast Smoothie', description: 'Mixed berry goodness', price: 6.50, category: 'Smoothies' },
      { id: 'jl5', name: 'Peanut Butter Banana', description: 'Classic combo', price: 6.50, category: 'Smoothies' },
      { id: 'jl6', name: 'Chicken Salad Sandwich', description: 'House recipe', price: 10.00, category: 'Food' },
      { id: 'jl7', name: 'Board Meeting Package', description: 'Coffee, pastries, fruit for 12', price: 95.00, category: 'Catering' },
    ]
  },
  {
    id: 'eighth-son',
    name: '8th & Roast',
    image: '/attached_assets/generated_images/drug_store_coffee_interior.png',
    location: 'Berry Hill',
    rating: 4.8,
    specialty: 'Small Batch Roasting',
    type: 'coffee',
    menu: [
      { id: 'er1', name: 'Espresso', description: 'Double shot perfection', price: 3.50, category: 'Coffee' },
      { id: 'er2', name: 'Cappuccino', description: 'Traditional Italian style', price: 5.00, category: 'Coffee' },
      { id: 'er3', name: 'Affogato', description: 'Espresso over gelato', price: 6.50, category: 'Specialty' },
      { id: 'er4', name: 'Chai Tea Latte', description: 'Spiced and creamy', price: 5.50, category: 'Tea' },
      { id: 'er5', name: 'Fresh Fruit Cup', description: 'Seasonal selection', price: 5.00, category: 'Food' },
      { id: 'er6', name: 'Artisan Toast', description: 'Avocado or almond butter', price: 8.00, category: 'Food' },
      { id: 'er7', name: 'Roaster\'s Choice Carafe', description: '12 cups premium roast', price: 55.00, category: 'Catering' },
    ]
  },
];

export const SERVICE_FEE_PERCENT = 0.15;
export const DELIVERY_COORDINATION_FEE = 5.00;

export const SUBSCRIPTION_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfect for small teams with occasional meetings',
    features: [
      '10 orders per month',
      'Standard 2-hour lead time',
      'Email support',
      '1 user account',
      '10% service fee discount'
    ],
    serviceFeeDiscount: 0.10,
    ordersIncluded: 10,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    description: 'For growing businesses with regular client meetings',
    features: [
      '50 orders per month',
      'Priority scheduling',
      'Phone support',
      '5 user accounts',
      '50% service fee discount',
      'Free delivery coordination'
    ],
    serviceFeeDiscount: 0.50,
    ordersIncluded: 50,
    freeDelivery: true,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'Unlimited access for large organizations',
    features: [
      'Unlimited orders',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Unlimited users',
      'No service fees',
      'Priority white-glove delivery'
    ],
    serviceFeeDiscount: 1.0,
    ordersIncluded: -1,
    freeDelivery: true,
  }
];
