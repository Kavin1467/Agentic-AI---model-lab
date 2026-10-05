from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models import ProductDB, ExpenseDB, ProductCreate, ProductUpdate, ProductOut

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    favorite_only: bool = False,
    sort_by: str = Query("name", pattern="^(name|price_asc|price_desc|newest)$"),
    db: Session = Depends(get_db)
):
    query = db.query(ProductDB)

    if search:
        s = f"%{search}%"
        query = query.filter(
            (ProductDB.name.ilike(s)) |
            (ProductDB.description.ilike(s)) |
            (ProductDB.barcode.ilike(s))
        )

    if category and category.lower() != "all":
        query = query.filter(ProductDB.category == category)

    if favorite_only:
        query = query.filter(ProductDB.is_favorite == True)

    if sort_by == "price_asc":
        query = query.order_by(ProductDB.default_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(ProductDB.default_price.desc())
    elif sort_by == "newest":
        query = query.order_by(desc(ProductDB.created_at))
    else:
        query = query.order_by(ProductDB.name.asc())

    return query.all()


@router.post("", response_model=ProductOut)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    # Check if duplicate name in same category
    existing = db.query(ProductDB).filter(
        func.lower(ProductDB.name) == product_in.name.lower().strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A product with this name already exists")

    new_prod = ProductDB(
        name=product_in.name.strip(),
        category=product_in.category,
        default_price=round(product_in.default_price, 2),
        unit=product_in.unit or "item",
        description=product_in.description,
        barcode=product_in.barcode,
        is_favorite=product_in.is_favorite or False
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod


@router.get("/{product_id}")
def get_product_details(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Purchase statistics for this product
    past_expenses = db.query(ExpenseDB).filter(ExpenseDB.product_id == product_id).order_by(desc(ExpenseDB.date)).all()
    total_spent = sum(e.amount for e in past_expenses)
    total_units = sum(e.quantity for e in past_expenses)

    price_history = [
        {
            "date": e.date.strftime("%Y-%m-%d"),
            "unit_price": e.unit_price,
            "merchant": e.merchant
        }
        for e in past_expenses[:10]
    ]

    return {
        "product": ProductOut.model_validate(product),
        "total_times_bought": len(past_expenses),
        "total_units_bought": round(total_units, 2),
        "total_amount_spent": round(total_spent, 2),
        "average_unit_price": round(total_spent / total_units, 2) if total_units > 0 else product.default_price,
        "price_history": price_history,
        "recent_purchases": [
            {
                "id": e.id,
                "date": e.date.strftime("%Y-%m-%d"),
                "amount": e.amount,
                "merchant": e.merchant,
                "notes": e.notes
            }
            for e in past_expenses[:5]
        ]
    }


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "name" and value:
            value = value.strip()
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Detach product from expenses so expenses remain intact
    db.query(ExpenseDB).filter(ExpenseDB.product_id == product_id).update({"product_id": None})
    db.delete(product)
    db.commit()
    return {"status": "success", "message": f"Product '{product.name}' deleted successfully"}
