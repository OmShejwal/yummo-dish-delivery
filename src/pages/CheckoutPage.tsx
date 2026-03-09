/**
 * CheckoutPage — Delivery address, payment method, and place order.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Wallet, Banknote, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { restaurants } from "@/data/mockData";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { id: "card",   label: "Credit / Debit Card", icon: <CreditCard className="w-5 h-5" /> },
  { id: "paypal", label: "PayPal",              icon: <Wallet className="w-5 h-5" /> },
  { id: "cash",   label: "Cash on Delivery",   icon: <Banknote className="w-5 h-5" /> },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, cartRestaurantId, user, placeOrder } = useApp();

  const [address, setAddress]   = useState(user?.addresses[0] ?? "");
  const [payment, setPayment]   = useState("card");
  const [cardNum, setCardNum]   = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp]   = useState("");
  const [cardCvv, setCardCvv]   = useState("");
  const [notes, setNotes]       = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [placing, setPlacing]   = useState(false);

  const restaurant = restaurants.find((r) => r.id === cartRestaurantId);
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const tax = cartTotal * 0.08;
  const grandTotal = cartTotal + deliveryFee + tax;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = "Please enter a delivery address.";
    if (payment === "card") {
      if (cardNum.replace(/\s/g, "").length < 16) e.cardNum = "Enter a valid 16-digit card number.";
      if (!cardName.trim()) e.cardName = "Cardholder name is required.";
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) e.cardExp = "Format: MM/YY";
      if (cardCvv.length < 3) e.cardCvv = "Enter a valid CVV.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate API
    const order = placeOrder(address, PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? payment);
    setPlacing(false);
    if (order) {
      toast.success("🎉 Order placed successfully!", { description: `Order #${order.id.slice(-4)}` });
      navigate(`/track/${order.id}`);
    }
  };

  if (cart.length === 0) {
    navigate("/");
    return null;
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-base flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-brand" /> Delivery Address
            </h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="addr">Street address *</Label>
                <Input
                  id="addr"
                  placeholder="123 Main Street, Apt 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={errors.address ? "border-destructive" : ""}
                />
                {errors.address && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
              </div>
              {/* Saved addresses */}
              {user && user.addresses.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Saved addresses:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.addresses.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAddress(a)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          address === a ? "border-brand text-brand bg-brand/5" : "border-border hover:border-brand"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="notes">Delivery notes (optional)</Label>
                <Input id="notes" placeholder="Leave at door, ring twice…" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-base flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-brand" /> Payment Method
            </h2>

            {/* Method selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    payment === m.id
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-border hover:border-brand/50 text-muted-foreground"
                  }`}
                >
                  {m.icon}
                  {m.label}
                  {payment === m.id && <Check className="w-3.5 h-3.5 text-brand" />}
                </button>
              ))}
            </div>

            {/* Card details */}
            {payment === "card" && (
              <div className="space-y-3 mt-4 pt-4 border-t border-border animate-slide-up">
                <div>
                  <Label>Card Number *</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNum}
                    maxLength={19}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardNum(v.replace(/(\d{4})/g, "$1 ").trim());
                    }}
                    className={errors.cardNum ? "border-destructive" : ""}
                  />
                  {errors.cardNum && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardNum}</p>}
                </div>
                <div>
                  <Label>Cardholder Name *</Label>
                  <Input placeholder="John Smith" value={cardName} onChange={(e) => setCardName(e.target.value)} className={errors.cardName ? "border-destructive" : ""} />
                  {errors.cardName && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Expiry Date *</Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExp}
                      maxLength={5}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "");
                        if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                        setCardExp(v);
                      }}
                      className={errors.cardExp ? "border-destructive" : ""}
                    />
                    {errors.cardExp && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardExp}</p>}
                  </div>
                  <div>
                    <Label>CVV *</Label>
                    <Input
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      className={errors.cardCvv ? "border-destructive" : ""}
                    />
                    {errors.cardCvv && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cardCvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {payment === "cash" && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mt-3 text-sm text-muted-foreground animate-slide-up">
                💵 Please have exact change ready. Our driver will collect payment on delivery.
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="bg-surface rounded-2xl p-5 shadow-card h-fit sticky top-24">
          <h2 className="font-display text-lg font-bold mb-4">Order Summary</h2>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div key={item.menuItemId} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 mt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span><span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span><span className="text-brand">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-5 gradient-brand text-primary-foreground border-0 shadow-brand h-12 text-base hover:opacity-90"
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin-slow" />
            ) : "Place Order 🎉"}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            By placing your order you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
