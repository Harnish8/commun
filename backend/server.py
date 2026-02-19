from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Payment Log Models
class PaymentLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    user_name: str
    group_id: str
    group_name: str
    amount: str
    payment_type: str  # 'subscription' or 'renewal'
    payment_status: str  # 'completed', 'pending', 'failed'
    payment_method: str  # 'mock_payment' for now
    subscription_start_date: datetime
    subscription_end_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentLogCreate(BaseModel):
    user_id: str
    user_email: str
    user_name: str
    group_id: str
    group_name: str
    amount: str
    payment_type: str
    payment_method: str = "mock_payment"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Community Sharing App API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Payment Log Endpoints
@api_router.post("/payments", response_model=PaymentLog)
async def create_payment_log(input: PaymentLogCreate):
    """Log a payment transaction (for mock payments)"""
    now = datetime.utcnow()
    payment_log = PaymentLog(
        user_id=input.user_id,
        user_email=input.user_email,
        user_name=input.user_name,
        group_id=input.group_id,
        group_name=input.group_name,
        amount=input.amount,
        payment_type=input.payment_type,
        payment_status="completed",
        payment_method=input.payment_method,
        subscription_start_date=now,
        subscription_end_date=now + timedelta(days=30),
        created_at=now
    )
    await db.payments.insert_one(payment_log.dict())
    return payment_log

@api_router.get("/payments", response_model=List[PaymentLog])
async def get_all_payments():
    """Get all payment logs (for admin)"""
    payments = await db.payments.find().sort("created_at", -1).to_list(1000)
    return [PaymentLog(**payment) for payment in payments]

@api_router.get("/payments/user/{user_id}", response_model=List[PaymentLog])
async def get_user_payments(user_id: str):
    """Get payment history for a specific user"""
    payments = await db.payments.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return [PaymentLog(**payment) for payment in payments]

@api_router.get("/payments/group/{group_id}", response_model=List[PaymentLog])
async def get_group_payments(group_id: str):
    """Get payment history for a specific group"""
    payments = await db.payments.find({"group_id": group_id}).sort("created_at", -1).to_list(100)
    return [PaymentLog(**payment) for payment in payments]

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
