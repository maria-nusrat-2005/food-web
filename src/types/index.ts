export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string; // 'burger', 'drinks', 'coffee'
  image_url: string | null;
  rating: number;
  created_at?: string;
}

export interface Review {
  id: string;
  client_name: string;
  avatar_url: string | null;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
