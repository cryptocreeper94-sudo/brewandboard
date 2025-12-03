
import cremaImage from '@assets/generated_images/crema_coffee_roasters_interior.png';
import baristaParlorImage from '@assets/generated_images/barista_parlor_interior.png';
import frothyMonkeyImage from '@assets/generated_images/frothy_monkey_interior.png';
import drugStoreImage from '@assets/generated_images/drug_store_coffee_interior.png';

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
    image: cremaImage,
    location: 'Downtown Nashville',
    rating: 4.9,
    specialty: 'Single Origin Pour Over',
    menu: [
      { id: 'c1', name: 'Seasonal Pour Over', description: 'Ethiopian Yirgacheffe', price: 5.50, category: 'Coffee' },
      { id: 'c2', name: 'Coffee Soda', description: 'Espresso, soda water, orange peel', price: 6.00, category: 'Specialty' },
      { id: 'c3', name: 'Avocado Toast', description: 'Sourdough, radish, chili oil', price: 12.00, category: 'Food' },
      { id: 'c4', name: 'Carafe Service (10 Cups)', description: 'Meeting size freshly brewed coffee', price: 45.00, category: 'Catering' },
    ]
  },
  {
    id: 'barista-parlor',
    name: 'Barista Parlor',
    image: baristaParlorImage,
    location: 'The Gulch',
    rating: 4.8,
    specialty: 'Artisan Espresso',
    menu: [
      { id: 'b1', name: 'Bourbon Vanilla Latte', description: 'House-made vanilla syrup', price: 6.50, category: 'Coffee' },
      { id: 'b2', name: 'Whiskey Caramel', description: 'Signature sweet espresso drink', price: 7.00, category: 'Specialty' },
      { id: 'b3', name: 'Biscuit Sandwich', description: 'Egg, cheese, bacon', price: 9.00, category: 'Food' },
      { id: 'b4', name: 'Pastry Box (Dozen)', description: 'Assorted morning pastries', price: 55.00, category: 'Catering' },
    ]
  },
  {
    id: 'frothy-monkey',
    name: 'Frothy Monkey',
    image: frothyMonkeyImage,
    location: '12 South',
    rating: 4.7,
    specialty: 'Breakfast Blend',
    menu: [
      { id: 'f1', name: 'Monkey Mocha', description: 'Banana syrup, chocolate', price: 6.00, category: 'Specialty' },
      { id: 'f2', name: 'Drip Coffee', description: 'House blend, bottomless option', price: 4.00, category: 'Coffee' },
      { id: 'f3', name: 'Loaded Oatmeal', description: 'Berries, nuts, brown sugar', price: 8.00, category: 'Food' },
      { id: 'f4', name: 'Meeting Traveler', description: '96oz of fresh coffee', price: 35.00, category: 'Catering' },
    ]
  },
  {
    id: 'drug-store',
    name: 'Drug Store Coffee',
    image: drugStoreImage,
    location: 'Noelle Hotel',
    rating: 4.9,
    specialty: 'Premium Experience',
    menu: [
      { id: 'd1', name: 'Cortado', description: 'Equal parts espresso and milk', price: 4.50, category: 'Coffee' },
      { id: 'd2', name: 'Matcha Latte', description: 'Ceremonial grade matcha', price: 6.00, category: 'Tea' },
      { id: 'd3', name: 'Croissant', description: 'Butter croissant', price: 5.00, category: 'Food' },
      { id: 'd4', name: 'Executive Breakfast', description: 'Assorted pastries and fruit', price: 120.00, category: 'Catering' },
    ]
  }
];
