export interface MenuItem {
  id: string;
  name: string;
  price?: number;
  halfPrice?: number;
  fullPrice?: number;
  unit?: string;
  image: string;
  description: string;
  category: string;
}

export const categories = [
  { id: 'chicken', name: 'Non-Veg Main Course (Chicken)', icon: '🍗', slug: 'chicken' },
  { id: 'fish', name: 'Fish', icon: '🐟', slug: 'fish' },
  { id: 'mutton', name: 'Mutton', icon: '🥩', slug: 'mutton' },
  { id: 'egg', name: 'Egg Special', icon: '🥚', slug: 'egg' },
  { id: 'veg', name: 'Veg Main Course', icon: '🥗', slug: 'veg' },
  { id: 'roti', name: 'Roti / Bread', icon: '🍞', slug: 'roti' },
  { id: 'rice', name: 'Rice', icon: '🍚', slug: 'rice' },
  { id: 'starters', name: 'Starters', icon: '🍟', slug: 'starters' },
  { id: 'thali', name: 'Thali', icon: '🍛', slug: 'thali' },
  { id: 'sweets', name: 'Sweet Items', icon: '🍬', slug: 'sweets' },
  { id: 'combo', name: 'Combo', icon: '🧺', slug: 'combo' },
  { id: 'mithilanchal', name: 'Mithilanchal Special', icon: '🌾', slug: 'mithilanchal' },
  { id: 'special-thali', name: 'Special Thali', icon: '⭐', slug: 'special-thali' },
];

export const menuItems: MenuItem[] = [
  // Chicken
  { id: 'c1', category: 'chicken', name: 'Chicken Curry (8 Piece)', price: 550, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', description: 'Traditional chicken curry with 8 pieces.' },
  { id: 'c2', category: 'chicken', name: 'Chicken Curry (4 Piece)', price: 300, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Traditional chicken curry with 4 pieces.' },
  { id: 'c3', category: 'chicken', name: 'Chicken Curry (1 Kg)', price: 900, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800', description: 'Bulk pack of traditional chicken curry.' },
  { id: 'c4', category: 'chicken', name: 'Butter Chicken', halfPrice: 350, fullPrice: 650, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', description: 'Creamy and rich butter chicken.' },
  { id: 'c5', category: 'chicken', name: 'Butter Chicken (1 Kg)', price: 950, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', description: 'Bulk pack of butter chicken.' },
  { id: 'c6', category: 'chicken', name: 'Kadhai Chicken', halfPrice: 350, fullPrice: 650, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', description: 'Spicy kadhai chicken with bell peppers.' },
  { id: 'c7', category: 'chicken', name: 'Chicken Special Curry (1 Kg)', price: 950, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', description: 'Our chef special chicken curry.' },
  { id: 'c8', category: 'chicken', name: 'Chicken Fry Kaleji (Half)', price: 350, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', description: 'Fried chicken liver.' },
  { id: 'c9', category: 'chicken', name: 'Chicken Fry', price: 60, unit: 'Piece', image: 'https://images.unsplash.com/photo-1562607394-59013bb10287?auto=format&fit=crop&q=80&w=800', description: 'Crispy fried chicken piece.' },
  { id: 'c10', category: 'chicken', name: 'Chicken Pota Kaleji', halfPrice: 350, fullPrice: 700, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800', description: 'Chicken gizzard and liver mix.' },
  { id: 'c11', category: 'chicken', name: 'Chicken Kabab', halfPrice: 350, fullPrice: 700, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800', description: 'Succulent chicken kababs.' },
  { id: 'c12', category: 'chicken', name: 'Chicken Fry Rice', halfPrice: 200, fullPrice: 400, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800', description: 'Flavorful chicken fried rice.' },

  // Fish
  { id: 'f1', category: 'fish', name: 'Special Fish Curry', halfPrice: 350, fullPrice: 700, image: 'https://i.ibb.co/B56GGMbM/Whats-App-Image-2026-04-04-at-08-44-09.jpg', description: 'Authentic Mithila style fish curry.' },
  { id: 'f2', category: 'fish', name: 'Special Fish Curry (1 Kg)', price: 1000, image: 'https://i.ibb.co/Q37wB0cj/Whats-App-Image-2026-04-04-at-08-47-21-1.jpg', description: 'Bulk pack of special fish curry.' },
  { id: 'f3', category: 'fish', name: 'Fish Fry', price: 50, unit: 'Piece', image: 'https://i.ibb.co/RxD9gj6/Whats-App-Image-2026-04-04-at-08-47-21.jpg', description: 'Crispy fried fish piece.' },
  { id: 'f4', category: 'fish', name: 'Fish Masala Curry (Half)', price: 350, image: 'https://i.ibb.co/B56GGMbM/Whats-App-Image-2026-04-04-at-08-44-09.jpg', description: 'Spicy fish masala curry.' },

  // Mutton
  { id: 'm1', category: 'mutton', name: 'Special Mutton Curry (1 Kg)', price: 1850, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Premium mutton curry bulk pack.' },
  { id: 'm2', category: 'mutton', name: 'Special Mutton Curry (4 Piece)', price: 500, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Mutton curry with 4 pieces.' },
  { id: 'm3', category: 'mutton', name: 'Special Mutton Curry (8 Piece)', price: 950, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Mutton curry with 8 pieces.' },
  { id: 'm4', category: 'mutton', name: 'Special Mutton Keema Kaleji', halfPrice: 550, fullPrice: 1000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Mutton mince and liver specialty.' },
  { id: 'm5', category: 'mutton', name: 'Mutton Chusta', price: 150, unit: 'Piece', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Traditional mutton chusta.' },
  { id: 'm6', category: 'mutton', name: 'Mutton Peti (Full)', price: 750, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Mutton peti full portion.' },
  { id: 'm7', category: 'mutton', name: 'Mutton Paya', halfPrice: 550, fullPrice: 1100, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Slow cooked mutton paya.' },
  { id: 'm8', category: 'mutton', name: 'Mutton Curry Family Pack', price: 1600, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Perfect for families.' },

  // Egg
  { id: 'e1', category: 'egg', name: 'Egg Omelette', price: 200, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800', description: 'Fluffy egg omelette.' },
  { id: 'e2', category: 'egg', name: 'Egg Burji', price: 220, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800', description: 'Spiced scrambled eggs.' },
  { id: 'e3', category: 'egg', name: 'Egg Curry', halfPrice: 180, fullPrice: 350, image: 'https://images.unsplash.com/photo-1591381733773-370444e144d8?auto=format&fit=crop&q=80&w=800', description: 'Classic egg curry.' },
  { id: 'e4', category: 'egg', name: 'Egg Curry Family Pack', price: 500, image: 'https://images.unsplash.com/photo-1591381733773-370444e144d8?auto=format&fit=crop&q=80&w=800', description: 'Egg curry for the whole family.' },
  { id: 'e5', category: 'egg', name: 'Egg Half Fry', price: 30, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800', description: 'Perfectly cooked half fry.' },

  // Veg
  { id: 'v1', category: 'veg', name: 'Matar Paneer', halfPrice: 180, fullPrice: 380, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Paneer and peas in tomato gravy.' },
  { id: 'v2', category: 'veg', name: 'Shahi Paneer', halfPrice: 200, fullPrice: 400, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Royal paneer in creamy gravy.' },
  { id: 'v3', category: 'veg', name: 'Paneer Butter Masala', halfPrice: 220, fullPrice: 410, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Rich and buttery paneer.' },
  { id: 'v4', category: 'veg', name: 'Kadhai Paneer', halfPrice: 250, fullPrice: 450, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Spicy kadhai paneer.' },
  { id: 'v5', category: 'veg', name: 'Mix Veg', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Assorted vegetables in spices.' },
  { id: 'v6', category: 'veg', name: 'Aloo Gobhi', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Potato and cauliflower dry curry.' },
  { id: 'v7', category: 'veg', name: 'Aloo Parwal', halfPrice: 180, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Potato and pointed gourd.' },
  { id: 'v8', category: 'veg', name: 'Aloo Matar', halfPrice: 150, fullPrice: 250, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Potato and peas curry.' },
  { id: 'v9', category: 'veg', name: 'Palak Paneer', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Paneer in spinach gravy.' },
  { id: 'v10', category: 'veg', name: 'Baigan Bari', halfPrice: 150, fullPrice: 250, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Eggplant with sun-dried lentil dumplings.' },
  { id: 'v11', category: 'veg', name: 'Aloo Kathal', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Potato and jackfruit curry.' },
  { id: 'v12', category: 'veg', name: 'Kaju Keema', halfPrice: 350, fullPrice: 650, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Cashew based vegetarian mince.' },
  { id: 'v13', category: 'veg', name: 'Paneer Makhan', halfPrice: 250, fullPrice: 450, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Creamy paneer makhani.' },
  { id: 'v14', category: 'veg', name: 'Aloo Bhujia', halfPrice: 150, fullPrice: 250, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Crispy potato fries.' },
  { id: 'v15', category: 'veg', name: 'Aloo Bhindi Masala', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Potato and okra masala.' },
  { id: 'v16', category: 'veg', name: 'Aloo Bhindi Bhujia', halfPrice: 225, fullPrice: 400, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Potato and okra dry fry.' },
  { id: 'v17', category: 'veg', name: 'Aloo Shimla', halfPrice: 225, fullPrice: 450, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Potato and capsicum.' },
  { id: 'v18', category: 'veg', name: 'Special Dal Fry', halfPrice: 180, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Chef special tempered lentils.' },
  { id: 'v19', category: 'veg', name: 'Arhar Dal Tadka', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Pigeon pea lentils with tempering.' },
  { id: 'v20', category: 'veg', name: 'Chana Dal Tadka', halfPrice: 180, fullPrice: 300, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Bengal gram lentils with tempering.' },
  { id: 'v21', category: 'veg', name: 'Dal Makhani', halfPrice: 200, fullPrice: 400, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Slow cooked black lentils.' },
  { id: 'v22', category: 'veg', name: 'Radi Pakoda', halfPrice: 180, fullPrice: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Lentil dumplings in gravy.' },
  { id: 'v23', category: 'veg', name: 'Tarua (Pakoda)', halfPrice: 400, fullPrice: 700, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Mithila style assorted fritters.' },
  { id: 'v24', category: 'veg', name: 'O Ka Sabji', halfPrice: 250, fullPrice: 450, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Special traditional vegetable.' },
  { id: 'v25', category: 'veg', name: 'Chole Masala', halfPrice: 225, fullPrice: 410, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Spiced chickpeas.' },
  { id: 'v26', category: 'veg', name: 'Rajma Masala', halfPrice: 240, fullPrice: 425, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Kidney beans in tomato gravy.' },
  { id: 'v27', category: 'veg', name: 'Soya Chap Masala', halfPrice: 240, fullPrice: 410, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Soya chunks in spicy gravy.' },
  { id: 'v28', category: 'veg', name: 'Aloo Pind', halfPrice: 120, fullPrice: 220, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Traditional potato preparation.' },

  // Roti
  { id: 'r1', category: 'roti', name: 'Tawa Roti', price: 12, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Fresh tawa roti.' },
  { id: 'r2', category: 'roti', name: 'Tawa Butter Roti', price: 16, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Buttery tawa roti.' },
  { id: 'r3', category: 'roti', name: 'Tandoori Roti', price: 15, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Clay oven baked roti.' },
  { id: 'r4', category: 'roti', name: 'Plain Paratha (Tikona)', price: 21, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Triangular plain paratha.' },
  { id: 'r5', category: 'roti', name: 'Aloo Paratha', price: 50, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Stuffed potato paratha.' },
  { id: 'r6', category: 'roti', name: 'Payaz Paratha', price: 55, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Stuffed onion paratha.' },
  { id: 'r7', category: 'roti', name: 'Paneer Paratha', price: 80, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Stuffed paneer paratha.' },
  { id: 'r8', category: 'roti', name: 'Puri', price: 10, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Deep fried puffed bread.' },
  { id: 'r9', category: 'roti', name: 'Kachori', price: 15, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Spiced fried bread.' },
  { id: 'r10', category: 'roti', name: 'Bedami Puri', price: 25, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Lentil stuffed fried bread.' },
  { id: 'r11', category: 'roti', name: 'Laccha Paratha', price: 40, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Layered paratha.' },
  { id: 'r12', category: 'roti', name: 'Butter Naan', price: 60, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Soft and buttery naan.' },
  { id: 'r13', category: 'roti', name: 'Dal Puri', price: 40, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Lentil stuffed puri.' },
  { id: 'r14', category: 'roti', name: 'Matar Bharat Puri', price: 20, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589113744320-99097500041d?auto=format&fit=crop&q=80&w=800', description: 'Peas stuffed puri.' },

  // Rice
  { id: 'ri1', category: 'rice', name: 'Plain Boiled Rice', halfPrice: 100, fullPrice: 180, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=800', description: 'Steamed white rice.' },
  { id: 'ri2', category: 'rice', name: 'Fried Rice', halfPrice: 120, fullPrice: 200, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800', description: 'Vegetable fried rice.' },
  { id: 'ri3', category: 'rice', name: 'Jeera Rice', halfPrice: 125, fullPrice: 220, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=800', description: 'Cumin tempered rice.' },
  { id: 'ri4', category: 'rice', name: 'Matar Pulao', halfPrice: 150, fullPrice: 275, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=800', description: 'Rice cooked with green peas.' },
  { id: 'ri5', category: 'rice', name: 'Veg Biryani', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800', description: 'Fragrant vegetable biryani.' },
  { id: 'ri6', category: 'rice', name: 'Veg Biryani Family Pack', price: 550, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800', description: 'Veg biryani for the family.' },
  { id: 'ri7', category: 'rice', name: 'Chicken Biryani', halfPrice: 250, fullPrice: 450, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800', description: 'Authentic chicken biryani.' },
  { id: 'ri8', category: 'rice', name: 'Egg + Chicken Fry Rice', halfPrice: 300, fullPrice: 550, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800', description: 'Egg and chicken fried rice.' },

  // Starters
  { id: 's1', category: 'starters', name: 'Chole Bhature (2 Piece)', price: 140, image: 'https://images.unsplash.com/photo-1626132646529-500637532537?auto=format&fit=crop&q=80&w=800', description: 'Classic chole bhature.' },
  { id: 's2', category: 'starters', name: 'Chole Bhature', price: 220, image: 'https://images.unsplash.com/photo-1626132646529-500637532537?auto=format&fit=crop&q=80&w=800', description: 'Large portion of chole bhature.' },
  { id: 's3', category: 'starters', name: 'Chura Fry with Peanut', price: 150, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Flattened rice fry with peanuts.' },
  { id: 's4', category: 'starters', name: 'Peanut with Moong Masala', price: 150, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Peanut and moong snack.' },
  { id: 's5', category: 'starters', name: 'Chicken Kabab Fry', price: 80, unit: 'Piece', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800', description: 'Fried chicken kabab piece.' },
  { id: 's6', category: 'starters', name: 'Chicken Fry', price: 160, unit: 'Plate', image: 'https://images.unsplash.com/photo-1562607394-59013bb10287?auto=format&fit=crop&q=80&w=800', description: 'Plate of crispy fried chicken.' },
  { id: 's7', category: 'starters', name: 'Veg Chowmin', halfPrice: 120, fullPrice: 220, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800', description: 'Vegetable stir-fried noodles.' },
  { id: 's8', category: 'starters', name: 'Chicken Chowmin', halfPrice: 150, fullPrice: 280, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800', description: 'Chicken stir-fried noodles.' },
  { id: 's9', category: 'starters', name: 'Egg + Chicken Chowmin', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800', description: 'Egg and chicken noodles.' },
  { id: 's10', category: 'starters', name: 'Chicken Malai Tikka', halfPrice: 220, fullPrice: 380, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800', description: 'Creamy chicken tikka.' },
  { id: 's11', category: 'starters', name: 'French Fry', halfPrice: 220, fullPrice: 350, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800', description: 'Crispy french fries.' },
  { id: 's12', category: 'starters', name: 'Chilly Potato (Full)', price: 75, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800', description: 'Spicy chilly potato.' },
  { id: 's13', category: 'starters', name: 'Pav Bhaji', price: 180, unit: 'Plate', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800', description: 'Classic pav bhaji.' },
  { id: 's14', category: 'starters', name: 'Veg Momos (6 Piece)', price: 120, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800', description: 'Steamed veg momos.' },
  { id: 's15', category: 'starters', name: 'Veg Momos (12 Piece)', price: 225, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800', description: 'Large pack of veg momos.' },
  { id: 's16', category: 'starters', name: 'Chicken Momos (6 Piece)', price: 140, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800', description: 'Steamed chicken momos.' },
  { id: 's17', category: 'starters', name: 'Chicken Momos (12 Piece)', price: 230, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800', description: 'Large pack of chicken momos.' },
  { id: 's18', category: 'starters', name: 'Special Paneer Pizza (Small)', price: 380, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800', description: 'Delicious paneer pizza.' },
  { id: 's19', category: 'starters', name: 'Special Veg Sandwich', price: 140, unit: 'Piece', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800', description: 'Hearty veg sandwich.' },
  { id: 's20', category: 'starters', name: 'Burger', price: 80, unit: 'Piece', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800', description: 'Classic veg burger.' },
  { id: 's21', category: 'starters', name: 'Paneer Tikka', halfPrice: 200, fullPrice: 350, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800', description: 'Grilled paneer tikka.' },
  { id: 's22', category: 'starters', name: 'Malai Paneer Tikka', halfPrice: 225, fullPrice: 410, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800', description: 'Creamy paneer tikka.' },

  // Thali
  { id: 't1', category: 'thali', name: 'Simple Veg Thali', price: 110, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Standard veg thali.' },
  { id: 't2', category: 'thali', name: 'Special Veg Thali', price: 180, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Premium veg thali.' },
  { id: 't3', category: 'thali', name: 'Special Chicken Thali', price: 250, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Chicken curry thali.' },
  { id: 't4', category: 'thali', name: 'Special Fish Thali', price: 300, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Fish curry thali.' },
  { id: 't5', category: 'thali', name: 'Special Mutton Thali', price: 350, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Mutton curry thali.' },
  { id: 't6', category: 'thali', name: 'With Sabji Thali', price: 100, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Simple thali with sabji.' },
  { id: 't7', category: 'thali', name: 'Family Veg Thali', price: 450, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Veg thali for the family.' },

  // Sweets
  { id: 'sw1', category: 'sweets', name: 'Gulab Jamun', price: 35, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', description: 'Sweet syrup soaked dumplings.' },
  { id: 'sw2', category: 'sweets', name: 'Sponge Rasgulla', price: 50, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', description: 'Soft and spongy rasgulla.' },
  { id: 'sw3', category: 'sweets', name: 'Bihari Rasgulla', price: 35, unit: 'Piece', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', description: 'Traditional Bihari rasgulla.' },
  { id: 'sw4', category: 'sweets', name: 'Moong Dal Halwa', price: 100, unit: 'Bowl', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', description: 'Rich moong dal halwa.' },
  { id: 'sw5', category: 'sweets', name: 'Suji Halwa', price: 80, unit: 'Bowl', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', description: 'Semolina halwa.' },
  { id: 'sw6', category: 'sweets', name: 'Sebai', price: 80, unit: 'Bowl', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', description: 'Sweet vermicelli kheer.' },
  { id: 'sw7', category: 'sweets', name: 'Makhana Kheer', price: 150, unit: 'Bowl', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800', description: 'Fox nut kheer.' },

  // Combo
  { id: 'co1', category: 'combo', name: 'Maach Bhaat', price: 350, image: 'https://i.ibb.co/k6MSnKDD/Whats-App-Image-2026-04-02-at-12-46-40.jpg', description: 'Traditional fish and rice combo.' },
  { id: 'co2', category: 'combo', name: 'Chicken Chawal', price: 300, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800', description: 'Chicken curry and rice combo.' },
  { id: 'co3', category: 'combo', name: 'Meat Bhaat', price: 400, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'Mutton curry and rice combo.' },
  { id: 'co4', category: 'combo', name: 'Anda Curry with Rice', price: 300, image: 'https://images.unsplash.com/photo-1591381733773-370444e144d8?auto=format&fit=crop&q=80&w=800', description: 'Egg curry and rice combo.' },

  // Mithilanchal
  { id: 'ms1', category: 'mithilanchal', name: 'Chura Dahi', price: 250, unit: 'Plate', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Flattened rice with curd.' },
  { id: 'ms2', category: 'mithilanchal', name: 'Dal Pithi', price: 300, unit: 'Plate', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Traditional lentil dumplings.' },
  { id: 'ms3', category: 'mithilanchal', name: 'Samosa Chaat', price: 250, unit: 'Plate', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce7d?auto=format&fit=crop&q=80&w=800', description: 'Crushed samosas with toppings.' },
  { id: 'ms4', category: 'mithilanchal', name: 'Chole Samosa', price: 120, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce7d?auto=format&fit=crop&q=80&w=800', description: 'Samosa served with chickpeas.' },
  { id: 'ms5', category: 'mithilanchal', name: 'Murhi – Kachri with Aloo Chop', price: 125, unit: 'Plate', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Puffed rice with fritters.' },
  { id: 'ms6', category: 'mithilanchal', name: 'Special Pakode', price: 140, unit: 'Plate', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Assorted special fritters.' },
  { id: 'ms7', category: 'mithilanchal', name: 'Bori + Bhat', price: 150, unit: 'Plate', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Traditional sun-dried lentil dumplings and rice.' },
  { id: 'ms8', category: 'mithilanchal', name: 'Small Fish Curry', price: 300, unit: 'Plate', image: 'https://i.ibb.co/RxD9gj6/Whats-App-Image-2026-04-04-at-08-47-21.jpg', description: 'Small fish specialty curry.' },
  { id: 'ms9', category: 'mithilanchal', name: 'Litti Chokha (4 Piece)', price: 160, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Traditional Bihari litti chokha.' },
  { id: 'ms10', category: 'mithilanchal', name: 'Special Bihari Thali', price: 180, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Authentic Bihari thali.' },

  // Special Thali
  { id: 'st1', category: 'special-thali', name: 'Special Mithilanchal Thali', price: 499, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Our grand Mithila thali.' },
  { id: 'st2', category: 'special-thali', name: 'Special Bulk Thali', price: 90, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: '3 Roti + Rice + Sabji + Dal + Salad.' },
];
