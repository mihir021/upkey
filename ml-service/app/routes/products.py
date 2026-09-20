from fastapi import APIRouter, HTTPException, Query
from app.services.product_service import product_service

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
def get_all_products():
    return product_service.get_all_products()

@router.get("/search")
def search_products(q: str = Query(..., min_length=1)):
    return product_service.search_products(q)

@router.get("/{product_id}")
def get_product(product_id: str):
    product = product_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
