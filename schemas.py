from pydantic import BaseModel, Field


class UserCreate(BaseModel):

    username: str

    password: str = Field(
        min_length=6,
        max_length=72
    )


class UserLogin(BaseModel):

    username: str

    password: str = Field(
        min_length=6,
        max_length=72
    )


class ProductCreate(BaseModel):

    name: str

    description: str

    price: float

    quantity: int


class PurchaseCreate(BaseModel):

    username: str

    product_name: str

    description: str

    price: float

    quantity: int