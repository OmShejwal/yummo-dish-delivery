/**
 * CreateRestaurantPage — Form for vendors to create new restaurants.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { restaurantService, type CreateRestaurantData } from "@/lib/restaurantApi";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const COMMON_CUISINES = [
  'Italian', 'Chinese', 'Japanese', 'Indian', 'Mexican', 'American',
  'Thai', 'Korean', 'Vietnamese', 'French', 'Mediterranean', 'Fast Food'
];

export default function CreateRestaurantPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRestaurantData>({
    name: '',
    description: '',
    logo_url: '',
    banner_url: '',
    cuisine_types: [],
    address: '',
    city: '',
    phone: '',
    email: '',
    opening_hours: DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { open: '09:00', close: '22:00' }
    }), {}),
    delivery_fee: 2.99,
    min_order_value: 15.00,
  });

  const handleInputChange = (field: keyof CreateRestaurantData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisine_types: prev.cuisine_types.includes(cuisine)
        ? prev.cuisine_types.filter(c => c !== cuisine)
        : [...prev.cuisine_types, cuisine]
    }));
  };

  const handleHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [type]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== 'vendor') {
      toast.error('Only vendors can create restaurants');
      return;
    }

    if (formData.cuisine_types.length === 0) {
      toast.error('Please select at least one cuisine type');
      return;
    }

    try {
      setLoading(true);
      const restaurant = await restaurantService.createRestaurant(formData);
      toast.success('Restaurant created successfully!');
      navigate('/vendor');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'vendor') {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">🚫</p>
        <p className="font-semibold text-lg">Access denied</p>
        <p className="text-muted-foreground">Only vendors can create restaurants</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" onClick={() => navigate('/vendor')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-display">Create Restaurant</h1>
          <p className="text-muted-foreground mt-1">Set up your restaurant profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Bella Napoli"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your restaurant, specialties, and what makes it unique..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@restaurant.com"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="New York"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Cuisine Types */}
        <Card>
          <CardHeader>
            <CardTitle>Cuisine Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COMMON_CUISINES.map((cuisine) => (
                <Button
                  key={cuisine}
                  type="button"
                  variant={formData.cuisine_types.includes(cuisine) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCuisineToggle(cuisine)}
                  className={formData.cuisine_types.includes(cuisine) ? "gradient-brand text-primary-foreground border-0" : ""}
                >
                  {cuisine}
                </Button>
              ))}
            </div>
            {formData.cuisine_types.length > 0 && (
              <div className="mt-4">
                <Label>Selected cuisines:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.cuisine_types.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary">
                      {cuisine}
                      <button
                        type="button"
                        onClick={() => handleCuisineToggle(cuisine)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_fee">Delivery Fee ($)</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delivery_fee}
                  onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="min_order_value">Minimum Order ($)</Label>
                <Input
                  id="min_order_value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_order_value}
                  onChange={(e) => handleInputChange('min_order_value', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <Label className="w-20 capitalize">{day}:</Label>
                  <Input
                    type="time"
                    value={formData.opening_hours[day].open}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={formData.opening_hours[day].close}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="w-32"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="banner_url">Banner Image URL</Label>
              <Input
                id="banner_url"
                type="url"
                value={formData.banner_url}
                onChange={(e) => handleInputChange('banner_url', e.target.value)}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/vendor')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 gradient-brand text-primary-foreground border-0"
          >
            {loading ? 'Creating...' : 'Create Restaurant'}
          </Button>
        </div>
      </form>
    </div>
  );
}