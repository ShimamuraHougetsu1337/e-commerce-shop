import { MenuProps } from 'antd';

export interface Product {
  id: number;
  title: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, title: 'Bose QuietComfort 45', price: 329, oldPrice: 399, rating: 5, reviews: 120, badge: 'Sale' },
  { id: 2, title: 'Sony Alpha a7 IV Mirrorless', price: 2498, rating: 4.5, reviews: 85, badge: 'New' },
  { id: 3, title: 'Apple Watch Series 9', price: 399, rating: 4, reviews: 200 },
  { id: 4, title: 'Samsung Galaxy Tab S9', price: 799, rating: 5, reviews: 45 },
  { id: 5, title: 'LG C3 65-inch OLED TV', price: 1599, oldPrice: 1999, rating: 4.5, reviews: 310, badge: '-20%' },
  { id: 6, title: 'Nintendo Switch OLED', price: 349, rating: 5, reviews: 520 },
  { id: 7, title: 'DJI Mini 4 Pro Drone', price: 959, rating: 4.5, reviews: 75 },
  { id: 8, title: 'Logitech MX Master 3S', price: 99, rating: 5, reviews: 900 },
];

export const MOCK_CATEGORIES_HERO = [
  { name: 'Phones', color: '#e8f4fd', icon: '📱' },
  { name: 'Computer', color: '#fcf0f5', icon: '💻' },
  { name: 'Smart Watch', color: '#edf7ed', icon: '⌚' },
  { name: 'Camera', color: '#fff4e5', icon: '📷' },
  { name: 'Headphones', color: '#f3e5f5', icon: '🎧' },
  { name: 'Gaming', color: '#e8eaf6', icon: '🎮' },
];

export const MENU_CATEGORIES: MenuProps['items'] = [
  { key: '1', label: 'Smartphones' },
  { key: '2', label: 'Laptops' },
  { key: '3', label: 'Smart Watches' },
  { key: '4', label: 'Accessories' },
];
