export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  rating: number;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  created_at?: string;
}

export interface Food {
  id: string;
  title: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  image: string | null;
  rating: number;
  calories: number;
  cook_time: number;
  stock: number;
  featured: boolean;
  is_veg: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spicy_level: number; // 0, 1, 2, 3
  created_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin' | 'delivery';
  reward_points: number;
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // percentage or flat
  expire_date: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: 'received' | 'preparing' | 'cooking' | 'delivery' | 'delivered' | 'cancelled';
  total: number;
  payment_method: 'cod' | 'stripe' | 'sslcommerz' | 'bkash' | 'nagad';
  address: string;
  phone: string;
  notes: string | null;
  discount_applied: number;
  code_used: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_id: string | null;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  food_id: string;
  user_id: string | null;
  client_name: string;
  avatar_url: string | null;
  rating: number;
  comment: string;
  likes: number;
  created_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  food_id: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  active: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}

export interface CartItem {
  food: Food;
  quantity: number;
}
