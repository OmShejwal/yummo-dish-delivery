from fastapi import APIRouter, HTTPException, status, Depends, Request
from schemas import PaymentIntentResponse, PaymentIntentRequest
from security import get_current_user
from database import get_database
from config import get_settings
from models import OrderStatus, PaymentStatus
from bson import ObjectId
from datetime import datetime
import stripe

router = APIRouter(prefix="/payments", tags=["Payments"])
settings = get_settings()

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    payment_data: PaymentIntentRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Create a Stripe payment intent"""
    orders_collection = db["orders"]
    
    try:
        order = await orders_collection.find_one(
            {"_id": ObjectId(payment_data.order_id)}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Verify ownership
    if str(order["user_id"]) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Check if already paid
    if order["payment_status"] == PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order already paid"
        )
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(order["total"] * 100),  # Convert to cents
            currency=payment_data.currency,
            metadata={
                "order_id": payment_data.order_id,
                "user_id": current_user.user_id,
            },
        )
        
        # Update order with Stripe payment ID
        await orders_collection.update_one(
            {"_id": ObjectId(payment_data.order_id)},
            {
                "$set": {
                    "stripe_payment_id": intent.id,
                    "payment_status": PaymentStatus.PENDING,
                    "updated_at": datetime.utcnow(),
                }
            },
        )
        
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            publishable_key=settings.STRIPE_PUBLISHABLE_KEY,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/webhook")
async def handle_payment_webhook(request: Request, db=Depends(get_database)):
    """Handle Stripe webhook events"""
    orders_collection = db["orders"]
    
    try:
        # Construct the event - verify signature
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_SECRET_KEY,  # Use your webhook signing secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle payment_intent.succeeded event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        order_id = payment_intent["metadata"].get("order_id")
        
        if order_id:
            # Update order payment status
            await orders_collection.update_one(
                {"_id": ObjectId(order_id)},
                {
                    "$set": {
                        "payment_status": PaymentStatus.COMPLETED,
                        "status": OrderStatus.CONFIRMED,
                        "updated_at": datetime.utcnow(),
                    }
                },
            )
    
    # Handle payment_intent.payment_failed event
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        order_id = payment_intent["metadata"].get("order_id")
        
        if order_id:
            # Update order payment status
            await orders_collection.update_one(
                {"_id": ObjectId(order_id)},
                {
                    "$set": {
                        "payment_status": PaymentStatus.FAILED,
                        "updated_at": datetime.utcnow(),
                    }
                },
            )
    
    return {"status": "success"}


@router.post("/refund/{order_id}")
async def refund_payment(
    order_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Refund an order"""
    orders_collection = db["orders"]
    
    try:
        order = await orders_collection.find_one(
            {"_id": ObjectId(order_id)}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Verify ownership
    if str(order["user_id"]) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Check if payment was made
    if not order.get("stripe_payment_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No payment to refund"
        )
    
    try:
        # Refund the Stripe payment
        stripe.Refund.create(
            payment_intent=order["stripe_payment_id"],
        )
        
        # Update order status
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "payment_status": PaymentStatus.REFUNDED,
                    "status": OrderStatus.CANCELLED,
                    "updated_at": datetime.utcnow(),
                }
            },
        )
        
        return {"status": "refunded", "order_id": order_id}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
