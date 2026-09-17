from sqlalchemy import Table, Column, Integer, String, Float, Boolean

from product_db import (
    product_metadata,
    product_engine
)


# =========================
# PRODUCTS TABLE
# =========================

products = Table(
    "products",
    product_metadata,

    Column(
        "id",
        Integer,
        primary_key=True
    ),

    Column(
        "name",
        String,
        nullable=False
    ),

    Column(
        "description",
        String
    ),

    Column(
        "price",
        Float,
        nullable=False
    ),

    Column(
        "quantity",
        Integer,
        nullable=False
    )
)


# =========================
# PURCHASES TABLE
# =========================

purchases = Table(
    "purchases",
    product_metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String, nullable=False),
    Column("product_id", Integer, nullable=True),
    Column("quantity", Integer, nullable=False),
    Column("product_name", String, nullable=False),
    Column("description", String, nullable=False),
    Column("price", Float, nullable=False),
    Column("status", String, nullable=False),
    Column("created_at", String, nullable=False),
    Column("reminder_sent", Boolean, nullable=False)
)


# Create PostgreSQL tables if they don't exist
product_metadata.create_all(product_engine)