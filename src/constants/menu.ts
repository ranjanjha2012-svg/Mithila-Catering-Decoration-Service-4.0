export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export const menuItems: MenuItem[] = [
  {
    id: 'fish-curry-half',
    name: 'Fish Curry half (4 Piece)',
    price: 300,
    image: 'https://i.ibb.co/RxD9gj6/Whats-App-Image-2026-04-04-at-08-47-21.jpg',
    description: 'Authentic Mithila style fish curry with 4 fresh pieces.'
  },
  {
    id: 'fish-curry-full',
    name: 'Fish Curry Full (8 Piece)',
    price: 700,
    image: 'https://i.ibb.co/B56GGMbM/Whats-App-Image-2026-04-04-at-08-44-09.jpg',
    description: 'Authentic Mithila style fish curry with 8 fresh pieces.'
  },
  {
    id: 'fish-curry-family',
    name: 'Fish Curry Family Pack (12 Piece)',
    price: 1050,
    image: 'https://i.ibb.co/Q37wB0cj/Whats-App-Image-2026-04-04-at-08-47-21-1.jpg',
    description: 'Perfect for families! 12 pieces of delicious fish curry.'
  },
  {
    id: 'macch-bhaat',
    name: 'Macch -Bhaat (2 Piece Fish Curry and Rice)',
    price: 350,
    image: 'https://i.ibb.co/k6MSnKDD/Whats-App-Image-2026-04-02-at-12-46-40.jpg',
    description: 'Traditional Maach-Bhaat combo with 2 pieces of fish and steamed rice.'
  },
  {
    id: 'special-fish-curry',
    name: 'Special Fish Curry Silawat wali (8 Piece)',
    price: 800,
    image: 'https://i.ibb.co/B56GGMbM/Whats-App-Image-2026-04-04-at-08-44-09.jpg',
    description: 'Hand-ground spices on Silawat for that extra authentic flavor. 8 pieces.'
  }
];
