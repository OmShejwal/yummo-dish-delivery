/**
 * API service for restaurant operations
 */

const API_BASE = 'http://localhost:8000/api/v1';

export interface Restaurant {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  cuisine_types: string[];
  rating: number;
  reviews_count: number;
  address: string;
  city: string;
  phone: string;
  email: string;
  delivery_fee: number;
  min_order_value: number;
  is_active: boolean;
  created_at: string;
  menu_items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  preparation_time: number;
  dietary_info?: string[];
  created_at: string;
}

export interface CreateRestaurantData {
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  cuisine_types: string[];
  address: string;
  city: string;
  phone: string;
  email: string;
  opening_hours: Record<string, { open: string; close: string }>;
  delivery_fee: number;
  min_order_value: number;
}

export interface CreateMenuItemData {
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  preparation_time: number;
  dietary_info?: string[];
}

class RestaurantService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getRestaurants(params?: {
    skip?: number;
    limit?: number;
    city?: string;
    cuisine_type?: string;
    min_rating?: number;
  }): Promise<Restaurant[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.city) queryParams.append('city', params.city.toString());
    if (params?.cuisine_type) queryParams.append('cuisine_type', params.cuisine_type);
    if (params?.min_rating) queryParams.append('min_rating', params.min_rating.toString());

    const response = await fetch(`${API_BASE}/restaurants?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    return response.json();
  }

  async getRestaurant(id: string): Promise<Restaurant> {
    const response = await fetch(`${API_BASE}/restaurants/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurant');
    }

    return response.json();
  }

  async createRestaurant(data: CreateRestaurantData): Promise<Restaurant> {
    const response = await fetch(`${API_BASE}/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create restaurant');
    }

    return response.json();
  }

  async updateRestaurant(id: string, data: Partial<CreateRestaurantData>): Promise<Restaurant> {
    const response = await fetch(`${API_BASE}/restaurants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update restaurant');
    }

    return response.json();
  }

  async addMenuItem(restaurantId: string, data: CreateMenuItemData): Promise<MenuItem> {
    const response = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add menu item');
    }

    return response.json();
  }

  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const restaurant = await this.getRestaurant(restaurantId);
    return restaurant.menu_items || [];
  }
}

export const restaurantService = new RestaurantService();