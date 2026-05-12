import urllib.parse
import uuid
from typing import Optional

class PaymentService:
    def __init__(self, upi_id: str, merchant_name: str):
        self.upi_id = upi_id
        self.merchant_name = merchant_name

    def generate_upi_intent(self, amount: float, order_id: str, note: Optional[str] = None) -> dict:
        """
        Generates a standard UPI Intent URL for mobile apps
        """
        if not note:
            note = f"Payment for Order #{order_id}"
            
        params = {
            "pa": self.upi_id,
            "pn": self.merchant_name,
            "am": f"{amount:.2f}",
            "cu": "INR",
            "tn": note,
            "tr": order_id # Transaction Reference
        }
        
        query = urllib.parse.urlencode(params)
        intent_url = f"upi://pay?{query}"
        
        return {
            "intent_url": intent_url,
            "qr_data": intent_url, # For QR generation in frontend
            "order_id": order_id,
            "amount": amount
        }

    def verify_transaction(self, upi_ref: str) -> bool:
        """
        In a real production environment with a Payment Gateway (Razorpay/Cashfree),
        this would call their API to verify the status.
        For direct UPI, we still rely on admin verification but prepare for API.
        """
        # TODO: Integrate with Razorpay/PhonePe Business API
        return True

# Initialize with production values or placeholders
payment_service = PaymentService(
    upi_id="kandadicharantej21@ybl", 
    merchant_name="QuickBite Production"
)
