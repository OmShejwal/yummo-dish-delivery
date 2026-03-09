/**
 * AppContext — Global state management for FoodieDash.
 * Manages: authentication, cart, and orders.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { mockUsers, mockOrders, menuItems, restaurants } from "@/data/mockData";
import type { User, Order, MenuItem } from "@/data/mockData";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface AppState {
  /** Currently logged-in user (null = guest) */
  user: User | null;
  /** Cart items */
  cart: CartItem[];
  /** Active restaurant for the current cart (cart is single-restaurant) */
  cartRestaurantId: string | null;
  /** All orders for the current user */
  orders: Order[];
  /** Whether the cart drawer is open */
  cartOpen: boolean;
  /** Auth modal state */
  authModalOpen: boolean;
}

type AppAction =
  | { type: "LOGIN";       payload: User }
  | { type: "LOGOUT" }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QTY";  payload: { menuItemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART"; payload?: boolean }
  | { type: "TOGGLE_AUTH_MODAL"; payload?: boolean }
  | { type: "PLACE_ORDER"; payload: Order }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_ORDERS";  payload: Order[] };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        orders: mockOrders.filter((o) => o.userId === action.payload.id),
        authModalOpen: false,
      };
    case "LOGOUT":
      return { ...state, user: null, orders: [], cart: [], cartRestaurantId: null };

    case "ADD_TO_CART": {
      const incoming = action.payload;
      // If switching restaurants, confirm then clear (handled before dispatch)
      if (state.cartRestaurantId && state.cartRestaurantId !== incoming.restaurantId) {
        return {
          ...state,
          cart: [incoming],
          cartRestaurantId: incoming.restaurantId,
        };
      }
      const existing = state.cart.find((i) => i.menuItemId === incoming.menuItemId);
      return {
        ...state,
        cartRestaurantId: incoming.restaurantId,
        cart: existing
          ? state.cart.map((i) =>
              i.menuItemId === incoming.menuItemId
                ? { ...i, quantity: i.quantity + incoming.quantity }
                : i
            )
          : [...state.cart, incoming],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((i) => i.menuItemId !== action.payload),
        cartRestaurantId:
          state.cart.filter((i) => i.menuItemId !== action.payload).length === 0
            ? null
            : state.cartRestaurantId,
      };

    case "UPDATE_QTY":
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.menuItemId === action.payload.menuItemId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };

    case "CLEAR_CART":
      return { ...state, cart: [], cartRestaurantId: null };

    case "TOGGLE_CART":
      return { ...state, cartOpen: action.payload !== undefined ? action.payload : !state.cartOpen };

    case "TOGGLE_AUTH_MODAL":
      return { ...state, authModalOpen: action.payload !== undefined ? action.payload : !state.authModalOpen };

    case "PLACE_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        cart: [],
        cartRestaurantId: null,
        cartOpen: false,
      };

    case "UPDATE_USER":
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    default:
      return state;
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  user: null,
  cart: [],
  cartRestaurantId: null,
  orders: [],
  cartOpen: false,
  authModalOpen: false,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>;
  // Convenience helpers
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQty: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (address: string, paymentMethod: string) => Order | null;
  cartTotal: number;
  cartCount: number;
  cartRestaurantName: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist cart to sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("foodie-cart");
    if (saved) {
      try {
        const { cart, cartRestaurantId } = JSON.parse(saved);
        cart.forEach((item: CartItem) => dispatch({ type: "ADD_TO_CART", payload: item }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("foodie-cart", JSON.stringify({
      cart: state.cart,
      cartRestaurantId: state.cartRestaurantId,
    }));
  }, [state.cart, state.cartRestaurantId]);

  /** Mock login — matches against mockUsers by email */
  const login = useCallback((email: string, _password: string) => {
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      dispatch({ type: "LOGIN", payload: found });
      return { success: true, message: "Welcome back!" };
    }
    return { success: false, message: "Invalid email or password." };
  }, []);

  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);

  const addToCart = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
  }, []);

  const removeFromCart = useCallback((menuItemId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: menuItemId });
  }, []);

  const updateQty = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: menuItemId });
    } else {
      dispatch({ type: "UPDATE_QTY", payload: { menuItemId, quantity } });
    }
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const placeOrder = useCallback((address: string, paymentMethod: string): Order | null => {
    if (!state.user || state.cart.length === 0) return null;
    const rest = restaurants.find((r) => r.id === state.cartRestaurantId);
    const total = state.cart.reduce((s, i) => s + i.price * i.quantity, 0) + (rest?.deliveryFee ?? 0);
    const order: Order = {
      id: `ord-${Date.now()}`,
      userId: state.user.id,
      restaurantId: state.cartRestaurantId!,
      restaurantName: rest?.name ?? "Restaurant",
      items: state.cart.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      total,
      status: "pending",
      placedAt: new Date().toISOString(),
      estimatedDelivery: rest?.deliveryTime ?? "30-45 min",
      deliveryAddress: address,
      paymentMethod,
    };
    dispatch({ type: "PLACE_ORDER", payload: order });
    return order;
  }, [state.user, state.cart, state.cartRestaurantId]);

  const cartTotal = state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);
  const cartRestaurantName = state.cartRestaurantId
    ? restaurants.find((r) => r.id === state.cartRestaurantId)?.name ?? null
    : null;

  return (
    <AppContext.Provider value={{
      ...state,
      dispatch,
      login,
      logout,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      placeOrder,
      cartTotal,
      cartCount,
      cartRestaurantName,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
