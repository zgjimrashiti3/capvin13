export interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

export interface AuthResponse {
  access_token: string;
  user: { id: string; username: string };
}

export interface User {
  id: string;
  username: string;
}
