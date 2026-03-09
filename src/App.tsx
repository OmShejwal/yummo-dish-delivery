import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";

import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";

import Index from "./pages/Index";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import VendorPage from "./pages/VendorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner richColors position="top-right" />
        <BrowserRouter>
          <Navbar />
          <CartDrawer />
          <AuthModal />
          <main>
            <Routes>
              <Route path="/"                    element={<Index />} />
              <Route path="/restaurants"         element={<Index />} />
              <Route path="/restaurant/:id"      element={<RestaurantPage />} />
              <Route path="/cart"                element={<CartPage />} />
              <Route path="/checkout"            element={<CheckoutPage />} />
              <Route path="/track/:id"           element={<OrderTrackingPage />} />
              <Route path="/orders"              element={<OrdersPage />} />
              <Route path="/profile"             element={<ProfilePage />} />
              <Route path="/admin"               element={<AdminDashboard />} />
              <Route path="/vendor"              element={<VendorPage />} />
              <Route path="*"                    element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
