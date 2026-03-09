/**
 * Navbar — Sticky top navigation for Yummo Dish Delivery.
 * Shows brand logo, search (desktop), cart button, and user menu.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, ChefHat, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";

export default function Navbar() {
  const { user, cartCount, dispatch, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home",      to: "/" },
    { label: "Browse",    to: "/restaurants" },
    { label: "My Orders", to: "/orders" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl gradient-brand shadow-brand">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold text-foreground">
            Yummo
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => dispatch({ type: "TOGGLE_CART", payload: true })}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px] gradient-brand border-0 shadow-brand animate-bounce-in">
                {cartCount}
              </Badge>
            )}
          </Button>

          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="outline" className="mt-1 text-xs capitalize">{user.role}</Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="w-4 h-4 mr-2" /> My Orders
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                {user.role === "vendor" && (
                  <DropdownMenuItem onClick={() => navigate("/vendor")}>
                    <ChefHat className="w-4 h-4 mr-2" /> Vendor Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="gradient-brand text-primary-foreground border-0 shadow-brand hover:opacity-90"
              onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true })}
            >
              Sign In
            </Button>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface animate-slide-up">
          <nav className="container flex flex-col gap-1 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link to="/admin" className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
