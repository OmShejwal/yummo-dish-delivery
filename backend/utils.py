"""Utility functions for the application"""
from typing import List, Optional
from datetime import datetime, timedelta
import re


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Simple validation - adjust based on requirements
    pattern = r'^\+?1?\d{9,15}$'
    return re.match(pattern, phone.replace('-', '').replace(' ', '')) is not None


def calculate_delivery_time(
    distance_km: float,
    traffic_factor: float = 1.0,
) -> int:
    """Calculate estimated delivery time in minutes"""
    # Average speed: 25 km/h in city
    base_time = (distance_km / 25) * 60
    estimated_time = base_time * traffic_factor
    # Add preparation time buffer (30 minutes)
    return int(estimated_time + 30)


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format amount as currency string"""
    if currency == "USD":
        return f"${amount:.2f}"
    elif currency == "EUR":
        return f"€{amount:.2f}"
    else:
        return f"{amount:.2f} {currency}"


def parse_opening_hours(hours_dict: dict) -> dict:
    """Parse and validate opening hours"""
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    parsed = {}
    
    for day in days:
        if day in hours_dict:
            hours = hours_dict[day]
            if "open" in hours and "close" in hours:
                parsed[day] = hours
    
    return parsed


def is_restaurant_open(opening_hours: dict, current_time: datetime = None) -> bool:
    """Check if restaurant is currently open"""
    if not current_time:
        current_time = datetime.now()
    
    day_name = current_time.strftime("%A").lower()
    
    if day_name not in opening_hours:
        return False
    
    hours = opening_hours[day_name]
    open_time = datetime.strptime(hours["open"], "%H:%M").time()
    close_time = datetime.strptime(hours["close"], "%H:%M").time()
    
    current_hour = current_time.time()
    return open_time <= current_hour <= close_time


def calculate_tax(amount: float, tax_rate: float = 0.1) -> float:
    """Calculate tax on amount"""
    return round(amount * tax_rate, 2)


def generate_order_number() -> str:
    """Generate unique order number"""
    import random
    import string
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_suffix}"


def paginate_results(
    items: List,
    skip: int = 0,
    limit: int = 10,
) -> tuple[List, int]:
    """Paginate list of items"""
    total = len(items)
    paginated = items[skip : skip + limit]
    return paginated, total


def search_restaurants(
    restaurants: List,
    query: str = None,
    filters: dict = None,
) -> List:
    """Search restaurants by name and apply filters"""
    result = restaurants
    
    if query:
        query_lower = query.lower()
        result = [
            r for r in result
            if query_lower in r.get("name", "").lower()
            or query_lower in r.get("description", "").lower()
        ]
    
    if filters:
        if filters.get("city"):
            result = [r for r in result if r.get("city") == filters["city"]]
        
        if filters.get("cuisine_type"):
            result = [
                r for r in result
                if filters["cuisine_type"] in r.get("cuisine_types", [])
            ]
        
        if filters.get("min_rating"):
            result = [
                r for r in result
                if r.get("rating", 0) >= filters["min_rating"]
            ]
    
    return result


def calculate_order_summary(
    items: List,
    delivery_fee: float = 0.0,
    tax_rate: float = 0.1,
) -> dict:
    """Calculate order summary with totals"""
    subtotal = sum(item.get("price", 0) * item.get("quantity", 0) for item in items)
    tax = calculate_tax(subtotal, tax_rate)
    total = subtotal + delivery_fee + tax
    
    return {
        "subtotal": round(subtotal, 2),
        "tax": round(tax, 2),
        "delivery_fee": round(delivery_fee, 2),
        "total": round(total, 2),
        "item_count": sum(item.get("quantity", 0) for item in items),
    }


def get_week_dates(start_date: datetime = None) -> dict:
    """Get dates for current week"""
    if not start_date:
        start_date = datetime.now()
    
    # Get Monday of current week
    monday = start_date - timedelta(days=start_date.weekday())
    
    return {
        "monday": monday,
        "tuesday": monday + timedelta(days=1),
        "wednesday": monday + timedelta(days=2),
        "thursday": monday + timedelta(days=3),
        "friday": monday + timedelta(days=4),
        "saturday": monday + timedelta(days=5),
        "sunday": monday + timedelta(days=6),
    }
