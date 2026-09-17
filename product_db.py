import os
from dotenv import load_dotenv

from sqlalchemy import create_engine, MetaData
from databases import Database

load_dotenv()

PRODUCT_DATABASE_URL = os.getenv("PRODUCT_DATABASE_URL")

product_database = Database(PRODUCT_DATABASE_URL)
product_metadata = MetaData()
product_engine = create_engine(PRODUCT_DATABASE_URL)