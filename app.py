from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from passlib.context import CryptContext
from fastapi.staticfiles import StaticFiles

from db import database, metadata, engine
from models import users

from schemas import (
    UserLogin,
    UserCreate,
    ProductCreate,
    PurchaseCreate
)

from product_db import product_database
from product_models import products, purchases


# =========================
# APP
# =========================

app = FastAPI()

app.mount(
    "/frontend",
    StaticFiles(directory="frontend"),
    name="frontend"
)


# =========================
# SQLITE DATABASE
# =========================

metadata.create_all(engine)


# =========================
# PASSWORD
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================
# STARTUP
# =========================

@app.on_event("startup")
async def startup():

    await database.connect()

    await product_database.connect()


# =========================
# SHUTDOWN
# =========================

@app.on_event("shutdown")
async def shutdown():

    await database.disconnect()

    await product_database.disconnect()


# =========================
# REGISTER
# =========================

@app.post("/register")
async def register(user: UserCreate):

    query = users.select().where(
        users.c.username == user.username
    )

    existing_user = await database.fetch_one(query)

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="user already exists"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    query = users.insert().values(
        username=user.username,
        password=hashed_password
    )

    await database.execute(query)

    return {
        "message": "user created successfully"
    }


# =========================
# LOGIN
# =========================

@app.post("/login")
async def login(user: UserLogin):

    query = users.select().where(
        users.c.username == user.username
    )

    existing_user = await database.fetch_one(query)

    if not existing_user:

        raise HTTPException(
            status_code=400,
            detail="invalid username or password"
        )

    if not pwd_context.verify(
        user.password,
        existing_user["password"]
    ):

        raise HTTPException(
            status_code=400,
            detail="invalid username or password"
        )

    return {
        "message": "login successful"
    }


# =========================
# GET PRODUCTS
# =========================

@app.get("/products")
async def get_products():

    query = products.select()

    return await product_database.fetch_all(query)


# =========================
# ADD PRODUCT
# =========================

@app.post("/products")
async def add_product(product: ProductCreate):

    query = products.insert().values(
        name=product.name,
        description=product.description,
        price=product.price,
        quantity=product.quantity
    )

    await product_database.execute(query)

    return {
        "message": "product added successfully"
    }


# =========================
# UPDATE PRODUCT
# =========================

@app.put("/products/{product_id}")
async def update_product(
    product_id: int,
    product: ProductCreate
):

    check_query = (
        products
        .select()
        .where(
            products.c.id == product_id
        )
    )

    existing_product = await product_database.fetch_one(
        check_query
    )

    if not existing_product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    query = (
        products
        .update()
        .where(
            products.c.id == product_id
        )
        .values(
            name=product.name,
            description=product.description,
            price=product.price,
            quantity=product.quantity
        )
    )

    await product_database.execute(query)

    return {
        "message": "product updated successfully"
    }


# =========================
# CREATE NEW ITEM PURCHASE
# =========================

@app.post("/purchases")
async def create_purchase(
    purchase: PurchaseCreate
):

    query = purchases.insert().values(
        username=purchase.username,
        product_id=None,
        product_name=purchase.product_name,
        description=purchase.description,
        price=purchase.price,
        quantity=purchase.quantity,
        status="Pending",
        reminder_sent=False
    )

    purchase_id = await product_database.execute(query)

    return {
        "message": "purchase request created",
        "purchase_id": purchase_id,
        "status": "Pending"
    }



# =========================
# CHECK OVERDUE PURCHASES
# =========================

@app.get("/purchases/overdue")
async def get_overdue_purchases():

    query = purchases.select().where(
        (purchases.c.status == "Pending")
        &
        (purchases.c.reminder_sent == False)
        &
        (
            purchases.c.created_at
            <=
            text("CURRENT_TIMESTAMP - INTERVAL '20 days'")
        )
    )

    overdue_purchases = await product_database.fetch_all(query)

    for purchase in overdue_purchases:

        update_query = (
            purchases
            .update()
            .where(
                purchases.c.id == purchase["id"]
            )
            .values(
                reminder_sent=True
            )
        )

        await product_database.execute(update_query)

    return overdue_purchases



# =========================
# GET PURCHASE STATUS
# =========================

@app.get("/purchases")
async def get_purchases():

    query = (
        purchases
        .select()
        .order_by(
            purchases.c.id.desc()
        )
    )

    return await product_database.fetch_all(query)


# =========================
# MARK PURCHASE AS ARRIVED
# =========================

@app.put("/purchases/{purchase_id}/arrived")
async def mark_purchase_arrived(
    purchase_id: int
):

    # Check if purchase exists
    check_query = (
        purchases
        .select()
        .where(
            purchases.c.id == purchase_id
        )
    )

    existing_purchase = await product_database.fetch_one(
        check_query
    )

    if not existing_purchase:

        raise HTTPException(
            status_code=404,
            detail="Purchase not found"
        )

    # Change Pending → Arrived
    update_query = (
        purchases
        .update()
        .where(
            purchases.c.id == purchase_id
        )
        .values(
            status="Arrived"
        )
    )

    await product_database.execute(update_query)

    return {
        "message": "purchase marked as arrived",
        "status": "Arrived"
    }

# =========================
# DELETE PURCHASE
# =========================

@app.delete("/purchases/{purchase_id}")
async def delete_purchase(
    purchase_id: int
):

    # Check if purchase exists
    check_query = (
        purchases
        .select()
        .where(
            purchases.c.id == purchase_id
        )
    )

    existing_purchase = await product_database.fetch_one(
        check_query
    )

    if not existing_purchase:

        raise HTTPException(
            status_code=404,
            detail="Purchase not found"
        )

    # Delete purchase
    delete_query = (
        purchases
        .delete()
        .where(
            purchases.c.id == purchase_id
        )
    )

    await product_database.execute(delete_query)

    return {
        "message": "purchase deleted successfully"
    }