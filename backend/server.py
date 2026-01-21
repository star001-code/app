from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== Models ====================

# Client Models
class ClientBase(BaseModel):
    name: str
    phone: Optional[str] = ""
    company: Optional[str] = ""

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Receipt (Wusl) Models
class ReceiptBase(BaseModel):
    date: str
    driver: str
    car: str
    city: str
    note: Optional[str] = ""
    amount: float = 0

class ReceiptCreate(ReceiptBase):
    client_id: str

class Receipt(ReceiptBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"RCPT-{str(uuid.uuid4())[:6].upper()}")
    client_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Payment (Qabd) Models
class PaymentBase(BaseModel):
    date: str
    amount: float = 0
    method: Optional[str] = "نقدي"
    note: Optional[str] = ""

class PaymentCreate(PaymentBase):
    client_id: str

class Payment(PaymentBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"PAY-{str(uuid.uuid4())[:6].upper()}")
    client_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Trash Model
class TrashItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_type: str  # "client", "receipt", "payment"
    data: dict
    deleted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== Client Routes ====================

@api_router.get("/")
async def root():
    return {"message": "شركة الغدير للنقل والتخليص الكمركي API"}

@api_router.get("/clients", response_model=List[Client])
async def get_clients():
    clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    return client

@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate):
    client = Client(**client_data.model_dump())
    doc = client.model_dump()
    await db.clients.insert_one(doc)
    return client

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate):
    existing = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    
    update_data = client_data.model_dump()
    await db.clients.update_one({"id": client_id}, {"$set": update_data})
    
    updated = await db.clients.find_one({"id": client_id}, {"_id": 0})
    return updated

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    
    # Move to trash
    trash_item = TrashItem(item_type="client", data=client)
    await db.trash.insert_one(trash_item.model_dump())
    
    # Delete client and related data
    await db.clients.delete_one({"id": client_id})
    await db.receipts.delete_many({"client_id": client_id})
    await db.payments.delete_many({"client_id": client_id})
    
    return {"message": "تم حذف العميل بنجاح"}

# ==================== Receipt Routes ====================

@api_router.get("/receipts", response_model=List[Receipt])
async def get_all_receipts():
    receipts = await db.receipts.find({}, {"_id": 0}).to_list(1000)
    return receipts

@api_router.get("/clients/{client_id}/receipts", response_model=List[Receipt])
async def get_client_receipts(client_id: str):
    receipts = await db.receipts.find({"client_id": client_id}, {"_id": 0}).to_list(1000)
    return receipts

@api_router.post("/receipts", response_model=Receipt)
async def create_receipt(receipt_data: ReceiptCreate):
    # Verify client exists
    client = await db.clients.find_one({"id": receipt_data.client_id})
    if not client:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    
    receipt = Receipt(**receipt_data.model_dump())
    doc = receipt.model_dump()
    await db.receipts.insert_one(doc)
    return receipt

@api_router.put("/receipts/{receipt_id}", response_model=Receipt)
async def update_receipt(receipt_id: str, receipt_data: ReceiptBase):
    existing = await db.receipts.find_one({"id": receipt_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="الوصل غير موجود")
    
    update_data = receipt_data.model_dump()
    await db.receipts.update_one({"id": receipt_id}, {"$set": update_data})
    
    updated = await db.receipts.find_one({"id": receipt_id}, {"_id": 0})
    return updated

@api_router.delete("/receipts/{receipt_id}")
async def delete_receipt(receipt_id: str):
    receipt = await db.receipts.find_one({"id": receipt_id}, {"_id": 0})
    if not receipt:
        raise HTTPException(status_code=404, detail="الوصل غير موجود")
    
    # Move to trash
    trash_item = TrashItem(item_type="receipt", data=receipt)
    await db.trash.insert_one(trash_item.model_dump())
    
    await db.receipts.delete_one({"id": receipt_id})
    return {"message": "تم حذف الوصل بنجاح"}

# ==================== Payment Routes ====================

@api_router.get("/payments", response_model=List[Payment])
async def get_all_payments():
    payments = await db.payments.find({}, {"_id": 0}).to_list(1000)
    return payments

@api_router.get("/clients/{client_id}/payments", response_model=List[Payment])
async def get_client_payments(client_id: str):
    payments = await db.payments.find({"client_id": client_id}, {"_id": 0}).to_list(1000)
    return payments

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate):
    # Verify client exists
    client = await db.clients.find_one({"id": payment_data.client_id})
    if not client:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    
    payment = Payment(**payment_data.model_dump())
    doc = payment.model_dump()
    await db.payments.insert_one(doc)
    return payment

@api_router.put("/payments/{payment_id}", response_model=Payment)
async def update_payment(payment_id: str, payment_data: PaymentBase):
    existing = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="القبض غير موجود")
    
    update_data = payment_data.model_dump()
    await db.payments.update_one({"id": payment_id}, {"$set": update_data})
    
    updated = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    return updated

@api_router.delete("/payments/{payment_id}")
async def delete_payment(payment_id: str):
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="القبض غير موجود")
    
    # Move to trash
    trash_item = TrashItem(item_type="payment", data=payment)
    await db.trash.insert_one(trash_item.model_dump())
    
    await db.payments.delete_one({"id": payment_id})
    return {"message": "تم حذف القبض بنجاح"}

# ==================== Account Statement ====================

@api_router.get("/clients/{client_id}/account")
async def get_client_account(client_id: str):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    
    receipts = await db.receipts.find({"client_id": client_id}, {"_id": 0}).to_list(1000)
    payments = await db.payments.find({"client_id": client_id}, {"_id": 0}).to_list(1000)
    
    total_receipts = sum(r.get("amount", 0) for r in receipts)
    total_payments = sum(p.get("amount", 0) for p in payments)
    balance = total_receipts - total_payments
    
    return {
        "client": client,
        "total_receipts": total_receipts,
        "total_payments": total_payments,
        "balance": balance,
        "receipts": receipts,
        "payments": payments
    }

# ==================== Trash Routes ====================

@api_router.get("/trash")
async def get_trash():
    trash = await db.trash.find({}, {"_id": 0}).to_list(1000)
    return trash

@api_router.post("/trash/{trash_id}/restore")
async def restore_from_trash(trash_id: str):
    trash_item = await db.trash.find_one({"id": trash_id}, {"_id": 0})
    if not trash_item:
        raise HTTPException(status_code=404, detail="العنصر غير موجود في السلة")
    
    item_type = trash_item.get("item_type")
    data = trash_item.get("data")
    
    if item_type == "client":
        await db.clients.insert_one(data)
    elif item_type == "receipt":
        await db.receipts.insert_one(data)
    elif item_type == "payment":
        await db.payments.insert_one(data)
    
    await db.trash.delete_one({"id": trash_id})
    return {"message": "تم استرجاع العنصر بنجاح"}

@api_router.delete("/trash/{trash_id}")
async def permanent_delete(trash_id: str):
    result = await db.trash.delete_one({"id": trash_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="العنصر غير موجود في السلة")
    return {"message": "تم الحذف النهائي بنجاح"}

@api_router.delete("/trash")
async def empty_trash():
    await db.trash.delete_many({})
    return {"message": "تم تفريغ السلة بنجاح"}

# ==================== Dashboard Stats ====================

@api_router.get("/stats")
async def get_stats():
    clients_count = await db.clients.count_documents({})
    receipts = await db.receipts.find({}, {"_id": 0, "amount": 1}).to_list(10000)
    payments = await db.payments.find({}, {"_id": 0, "amount": 1}).to_list(10000)
    
    total_receipts = sum(r.get("amount", 0) for r in receipts)
    total_payments = sum(p.get("amount", 0) for p in payments)
    
    return {
        "clients_count": clients_count,
        "receipts_count": len(receipts),
        "payments_count": len(payments),
        "total_receipts": total_receipts,
        "total_payments": total_payments,
        "balance": total_receipts - total_payments
    }

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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
