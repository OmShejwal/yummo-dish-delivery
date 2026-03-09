# Frontend Integration Guide

This guide explains how to integrate the Yummo Backend API with your React/TypeScript frontend.

## API Base URL

```typescript
const API_BASE_URL = "http://localhost:8000/api/v1";
```

For production:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api.yummodelivery.com/api/v1";
```

## Authentication Flow

### 1. Register User

```typescript
async function registerUser(userData: {
  email: string;
  username: string;
  password: string;
  full_name: string;
  role: "customer" | "vendor" | "admin";
}) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem("accessToken", data.access_token);
  localStorage.setItem("refreshToken", data.refresh_token);
  
  return data;
}
```

### 2. Login User

```typescript
async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  localStorage.setItem("accessToken", data.access_token);
  localStorage.setItem("refreshToken", data.refresh_token);
  
  return data;
}
```

### 3. Protected API Requests

```typescript
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  // Handle token expiration
  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request
      return authenticatedFetch(url, options);
    }
    // Redirect to login
    window.location.href = "/login";
  }
  
  return response;
}
```

### 4. Refresh Token

```typescript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${refreshToken}`,
      "Content-Type": "application/json",
    },
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("accessToken", data.access_token);
    return true;
  }
  
  return false;
}
```

## API Endpoints Usage

### Get Current User

```typescript
async function getCurrentUser() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/auth/me`
  );
  return response.json();
}
```

### Restaurant Management

#### List Restaurants

```typescript
interface RestaurantListParams {
  skip?: number;
  limit?: number;
  city?: string;
  cuisine_type?: string;
  min_rating?: number;
}

async function listRestaurants(params: RestaurantListParams = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.skip) queryParams.append("skip", params.skip.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.city) queryParams.append("city", params.city);
  if (params.cuisine_type) queryParams.append("cuisine_type", params.cuisine_type);
  if (params.min_rating) queryParams.append("min_rating", params.min_rating.toString());
  
  const response = await fetch(
    `${API_BASE_URL}/restaurants/?${queryParams}`
  );
  return response.json();
}
```

#### Get Restaurant Details

```typescript
async function getRestaurant(restaurantId: string) {
  const response = await fetch(
    `${API_BASE_URL}/restaurants/${restaurantId}`
  );
  return response.json();
}
```

### Orders

#### Create Order

```typescript
interface OrderItem {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

interface CreateOrderRequest {
  restaurant_id: string;
  items: OrderItem[];
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  special_instructions?: string;
  payment_method?: string;
}

async function createOrder(orderData: CreateOrderRequest) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/orders/`,
    {
      method: "POST",
      body: JSON.stringify(orderData),
    }
  );
  return response.json();
}
```

#### Get User Orders

```typescript
async function getUserOrders(status?: string, skip: number = 0, limit: number = 10) {
  const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
  if (status) params.append("status", status);
  
  const response = await authenticatedFetch(
    `${API_BASE_URL}/orders/?${params}`
  );
  return response.json();
}
```

#### Track Order

```typescript
async function trackOrder(orderId: string) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/orders/${orderId}/tracking`
  );
  return response.json();
}
```

### Payments

#### Create Payment Intent

```typescript
async function createPaymentIntent(orderId: string, amount: number) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/payments/create-intent`,
    {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        amount,
        currency: "usd",
      }),
    }
  );
  return response.json();
}
```

#### Complete Payment with Stripe

```typescript
import { loadStripe } from "@stripe/js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-js";

function PaymentForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const handlePayment = async () => {
    // Create payment intent
    const { client_secret } = await createPaymentIntent(orderId, amount);
    
    // Confirm payment
    const result = await stripe!.confirmCardPayment(client_secret, {
      payment_method: {
        card: elements!.getElement(CardElement)!,
      },
    });
    
    if (result.paymentIntent?.status === "succeeded") {
      console.log("Payment successful!");
      // Redirect to order confirmation
    }
  };
  
  return (
    <div>
      <CardElement />
      <button onClick={handlePayment}>Pay ${amount.toFixed(2)}</button>
    </div>
  );
}
```

## React Hooks Examples

### useAuth Hook

```typescript
import { useState, useEffect } from "react";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  async function fetchCurrentUser() {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err);
      logout();
    } finally {
      setLoading(false);
    }
  }
  
  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }
  
  return { user, loading, error, logout };
}
```

### useOrders Hook

```typescript
function useOrders(status?: string) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchOrders();
  }, [status]);
  
  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await getUserOrders(status);
      setOrders(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  
  return { orders, loading, error, refetch: fetchOrders };
}
```

### useRestaurants Hook

```typescript
function useRestaurants(params?: RestaurantListParams) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchRestaurants();
  }, [params]);
  
  async function fetchRestaurants() {
    try {
      setLoading(true);
      const data = await listRestaurants(params);
      setRestaurants(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  
  return { restaurants, loading, error, refetch: fetchRestaurants };
}
```

## Error Handling

```typescript
async function makeRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await authenticatedFetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}
```

## TypeScript Types

```typescript
// User
interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  role: "customer" | "vendor" | "admin";
  address?: string;
  city?: string;
  postal_code?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

// Restaurant
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  preparation_time: number;
}

interface Restaurant {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  cuisine_types: string[];
  rating: number;
  reviews_count: number;
  address: string;
  city: string;
  delivery_fee: number;
  min_order_value: number;
  menu_items?: MenuItem[];
}

// Order
interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    price: number;
  }>;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_address: string;
  payment_status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

// Token Response
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
```

## CORS Configuration

The backend is already configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)

For production, update `BACKEND_CORS_ORIGINS` in `.env`.

## WebSocket Support (Future)

The API currently uses polling for order tracking. For real-time updates:

```typescript
// Coming soon: WebSocket integration
const ws = new WebSocket(
  `ws://localhost:8000/api/v1/orders/${orderId}/stream?token=${token}`
);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log("Order update:", update);
};
```

## Rate Limiting

The API allows:
- 100 requests per minute per IP
- 1 request per second per authenticated user

Handle rate limiting:
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get("Retry-After");
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
}
```

---

**Need help?** Check the API documentation at http://localhost:8000/docs
