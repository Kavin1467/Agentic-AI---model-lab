from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from ..database import get_db
from ..models import ExpenseDB, ProductDB, CategoryBudgetDB, ExpenseCreate, ExpenseUpdate, ExpenseOut

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("", response_model=List[ExpenseOut])
def get_expenses(
    category: Optional[str] = None,
    search: Optional[str] = None,
    timeframe: Optional[str] = "all", # all, daily, weekly, monthly
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(ExpenseDB)

    if category and category.lower() != "all":
        query = query.filter(ExpenseDB.category == category)

    if search:
        s = f"%{search}%"
        query = query.filter(
            (ExpenseDB.title.ilike(s)) |
            (ExpenseDB.merchant.ilike(s)) |
            (ExpenseDB.notes.ilike(s))
        )

    now = datetime.utcnow()
    if timeframe == "daily":
        start_of_day = datetime(now.year, now.month, now.day)
        query = query.filter(ExpenseDB.date >= start_of_day)
    elif timeframe == "weekly":
        start_of_week = now - timedelta(days=7)
        query = query.filter(ExpenseDB.date >= start_of_week)
    elif timeframe == "monthly":
        start_of_month = now - timedelta(days=30)
        query = query.filter(ExpenseDB.date >= start_of_month)

    if start_date:
        try:
            sd = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.filter(ExpenseDB.date >= sd)
        except Exception:
            pass

    if end_date:
        try:
            ed = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            query = query.filter(ExpenseDB.date <= ed)
        except Exception:
            pass

    return query.order_by(desc(ExpenseDB.date)).offset(offset).limit(limit).all()


@router.get("/history")
def get_spending_history(
    period: str = Query("weekly", pattern="^(daily|weekly|monthly)$"),
    months_back: int = Query(6, ge=1, le=12),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated spending grouped by Day, Week, or Month
    with top category breakdowns and trends.
    """
    now = datetime.utcnow()
    if period == "daily":
        since_date = now - timedelta(days=14)
    elif period == "weekly":
        since_date = now - timedelta(days=8 * 7) # last 8 weeks
    else: # monthly
        since_date = now - timedelta(days=6 * 30) # last 6 months

    expenses = db.query(ExpenseDB).filter(ExpenseDB.date >= since_date).order_by(ExpenseDB.date.asc()).all()

    grouped_data = {}
    category_totals = {}
    merchant_totals = {}
    grand_total = 0.0

    for exp in expenses:
        grand_total += exp.amount

        # Category accumulation
        category_totals[exp.category] = category_totals.get(exp.category, 0.0) + exp.amount
        if exp.merchant:
            merchant_totals[exp.merchant] = merchant_totals.get(exp.merchant, 0.0) + exp.amount

        # Determine grouping key
        if period == "daily":
            # Group by YYYY-MM-DD
            group_key = exp.date.strftime("%Y-%m-%d")
            display_label = exp.date.strftime("%b %d")
        elif period == "weekly":
            year, week, _ = exp.date.isocalendar()
            group_key = f"{year}-W{week:02d}"
            # Find the Monday of that week
            display_label = exp.date.strftime("%b %d")
        else: # monthly
            group_key = exp.date.strftime("%Y-%m")
            display_label = exp.date.strftime("%b %Y")

        if group_key not in grouped_data:
            grouped_data[group_key] = {
                "key": group_key,
                "label": display_label,
                "total": 0.0,
                "count": 0,
                "categories": {},
                "top_expense": {"title": exp.title, "amount": exp.amount}
            }

        grouped_data[group_key]["total"] += exp.amount
        grouped_data[group_key]["count"] += 1
        cat_dict = grouped_data[group_key]["categories"]
        cat_dict[exp.category] = cat_dict.get(exp.category, 0.0) + exp.amount

        if exp.amount > grouped_data[group_key]["top_expense"]["amount"]:
            grouped_data[group_key]["top_expense"] = {"title": exp.title, "amount": exp.amount}

    # Format output items
    timeline = []
    for k in sorted(grouped_data.keys()):
        item = grouped_data[k]
        item["total"] = round(item["total"], 2)
        item["categories"] = [{"category": c, "amount": round(a, 2)} for c, a in item["categories"].items()]
        item["categories"].sort(key=lambda x: x["amount"], reverse=True)
        timeline.append(item)

    sorted_categories = sorted(
        [{"category": c, "total": round(t, 2)} for c, t in category_totals.items()],
        key=lambda x: x["total"],
        reverse=True
    )

    sorted_merchants = sorted(
        [{"merchant": m, "total": round(t, 2)} for m, t in merchant_totals.items()],
        key=lambda x: x["total"],
        reverse=True
    )[:8]

    return {
        "period": period,
        "total_spent": round(grand_total, 2),
        "total_transactions": len(expenses),
        "timeline": timeline,
        "category_breakdown": sorted_categories,
        "top_merchants": sorted_merchants
    }


@router.get("/stats")
def get_expense_stats(db: Session = Depends(get_db)):
    """Computes high level KPIs for Dashboard summary."""
    now = datetime.utcnow()
    start_today = datetime(now.year, now.month, now.day)
    start_7d = now - timedelta(days=7)
    start_14d = now - timedelta(days=14)
    start_30d = now - timedelta(days=30)
    start_60d = now - timedelta(days=60)

    # Today
    today_spend = db.query(func.sum(ExpenseDB.amount)).filter(ExpenseDB.date >= start_today).scalar() or 0.0

    # 7 Days (this week) vs prior 7 Days
    spent_7d = db.query(func.sum(ExpenseDB.amount)).filter(ExpenseDB.date >= start_7d).scalar() or 0.0
    spent_prev_7d = db.query(func.sum(ExpenseDB.amount)).filter(
        and_(ExpenseDB.date >= start_14d, ExpenseDB.date < start_7d)
    ).scalar() or 0.0
    weekly_diff_pct = round(((spent_7d - spent_prev_7d) / spent_prev_7d) * 100, 1) if spent_prev_7d > 0 else 0.0

    # 30 Days (this month) vs prior 30 Days
    spent_30d = db.query(func.sum(ExpenseDB.amount)).filter(ExpenseDB.date >= start_30d).scalar() or 0.0
    spent_prev_30d = db.query(func.sum(ExpenseDB.amount)).filter(
        and_(ExpenseDB.date >= start_60d, ExpenseDB.date < start_30d)
    ).scalar() or 0.0
    monthly_diff_pct = round(((spent_30d - spent_prev_30d) / spent_prev_30d) * 100, 1) if spent_prev_30d > 0 else 0.0

    # All time
    total_spend = db.query(func.sum(ExpenseDB.amount)).scalar() or 0.0
    total_tx_count = db.query(ExpenseDB).count()
    daily_average_30d = round(spent_30d / 30, 2)

    # Top spending category in 30d
    top_cat_result = db.query(
        ExpenseDB.category, func.sum(ExpenseDB.amount).label("cat_total")
    ).filter(ExpenseDB.date >= start_30d).group_by(ExpenseDB.category).order_by(desc("cat_total")).first()

    top_category = top_cat_result[0] if top_cat_result else "N/A"
    top_category_amount = round(top_cat_result[1], 2) if top_cat_result else 0.0

    return {
        "today_spend": round(today_spend, 2),
        "spent_7d": round(spent_7d, 2),
        "weekly_diff_pct": weekly_diff_pct,
        "spent_30d": round(spent_30d, 2),
        "monthly_diff_pct": monthly_diff_pct,
        "total_spend": round(total_spend, 2),
        "total_transactions": total_tx_count,
        "daily_average_30d": daily_average_30d,
        "top_category": top_category,
        "top_category_amount": top_category_amount
    }


@router.post("", response_model=ExpenseOut)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    tx_date = expense_in.date or datetime.utcnow()
    unit_price = expense_in.unit_price or (expense_in.amount / expense_in.quantity if expense_in.quantity else expense_in.amount)

    # Check if tied to existing product
    if expense_in.product_id:
        product = db.query(ProductDB).filter(ProductDB.id == expense_in.product_id).first()
        if product:
            # Optionally update product price to latest
            product.default_price = unit_price

    new_expense = ExpenseDB(
        product_id=expense_in.product_id,
        title=expense_in.title,
        category=expense_in.category,
        amount=round(expense_in.amount, 2),
        quantity=expense_in.quantity or 1.0,
        unit_price=round(unit_price, 2),
        date=tx_date,
        payment_method=expense_in.payment_method or "Credit Card",
        merchant=expense_in.merchant,
        notes=expense_in.notes
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.query(ExpenseDB).filter(ExpenseDB.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)

    # Recalculate if unit price / quantity changed
    if "quantity" in update_data or "unit_price" in update_data:
        if expense.quantity and expense.unit_price:
            expense.amount = round(expense.quantity * expense.unit_price, 2)

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(ExpenseDB).filter(ExpenseDB.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"status": "success", "message": f"Expense {expense_id} deleted successfully"}


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(CategoryBudgetDB).all()
    return [
        {
            "id": c.id,
            "category": c.category,
            "monthly_limit": c.monthly_limit,
            "color": c.color,
            "icon": c.icon
        }
        for c in categories
    ]
