import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import ProductDB, ExpenseDB, CategoryBudgetDB

CATEGORIES = [
    {"name": "Groceries", "color": "#10b981", "icon": "shopping-cart", "limit": 700.0},
    {"name": "Dining Out", "color": "#f59e0b", "icon": "utensils", "limit": 450.0},
    {"name": "Electronics", "color": "#6366f1", "icon": "laptop", "limit": 400.0},
    {"name": "Transportation", "color": "#06b6d4", "icon": "car", "limit": 250.0},
    {"name": "Entertainment", "color": "#ec4899", "icon": "film", "limit": 200.0},
    {"name": "Utilities & Bills", "color": "#8b5cf6", "icon": "zap", "limit": 350.0},
    {"name": "Healthcare", "color": "#ef4444", "icon": "heart-pulse", "limit": 250.0},
    {"name": "Shopping", "color": "#3b82f6", "icon": "shopping-bag", "limit": 500.0},
    {"name": "Subscriptions", "color": "#14b8a6", "icon": "repeat", "limit": 100.0},
]

PRODUCTS_SEED = [
    # Groceries
    {"name": "Organic Almond Milk", "category": "Groceries", "default_price": 4.29, "unit": "bottle", "description": "Unsweetened organic almond milk 64 fl oz", "barcode": "789101112"},
    {"name": "Whole Wheat Sourdough", "category": "Groceries", "default_price": 5.49, "unit": "loaf", "description": "Artisan baked sourdough bread", "barcode": "789101113"},
    {"name": "Avocados (Bag of 5)", "category": "Groceries", "default_price": 6.99, "unit": "pack", "description": "Fresh ripe Hass avocados", "barcode": "789101114"},
    {"name": "Free-Range Large Brown Eggs (18pk)", "category": "Groceries", "default_price": 6.89, "unit": "carton", "description": "Grade A free-range eggs", "barcode": "789101115"},
    {"name": "Organic Greek Yogurt", "category": "Groceries", "default_price": 5.99, "unit": "tub", "description": "Plain whole milk Greek yogurt 32oz", "barcode": "789101116"},
    {"name": "Wild Salmon Fillets", "category": "Groceries", "default_price": 14.99, "unit": "lb", "description": "Fresh wild-caught salmon", "barcode": "789101117"},
    {"name": "Artisanal Espresso Beans", "category": "Groceries", "default_price": 16.50, "unit": "bag", "description": "Dark roast single origin arabica 12oz", "barcode": "789101118"},
    {"name": "Organic Honeycrisp Apples", "category": "Groceries", "default_price": 3.99, "unit": "lb", "description": "Crisp sweet apples", "barcode": "789101119"},
    {"name": "Extra Virgin Olive Oil", "category": "Groceries", "default_price": 18.99, "unit": "bottle", "description": "Cold pressed Italian EVOO 750ml", "barcode": "789101120"},
    {"name": "Sparkling Mineral Water (12pk)", "category": "Groceries", "default_price": 8.49, "unit": "pack", "description": "Lime flavored zero sugar mineral water", "barcode": "789101121"},

    # Dining Out
    {"name": "Handcrafted Flat White", "category": "Dining Out", "default_price": 5.75, "unit": "cup", "description": "Double shot oat flat white", "barcode": "789101122"},
    {"name": "Artisan Avocado Toast & Poached Egg", "category": "Dining Out", "default_price": 14.50, "unit": "plate", "description": "Breakfast cafe special", "barcode": "789101123"},
    {"name": "Salmon Poke Bowl", "category": "Dining Out", "default_price": 18.25, "unit": "bowl", "description": "Fresh salmon with edamame and brown rice", "barcode": "789101124"},
    {"name": "Wood-Fired Neapolitan Pizza", "category": "Dining Out", "default_price": 22.00, "unit": "pizza", "description": "Fresh mozzarella, basil and San Marzano tomatoes", "barcode": "789101125"},
    {"name": "Sushi Omakase Platter", "category": "Dining Out", "default_price": 45.00, "unit": "set", "description": "Chef selection nigiri & sashimi 14pcs", "barcode": "789101126"},
    {"name": "Thai Green Curry Lunch Set", "category": "Dining Out", "default_price": 16.50, "unit": "set", "description": "Coconut curry with jasmine rice and spring rolls", "barcode": "789101127"},

    # Electronics
    {"name": "USB-C Braided Fast Cable (6ft)", "category": "Electronics", "default_price": 19.99, "unit": "item", "description": "100W PD braided durable cable", "barcode": "789101128"},
    {"name": "Noise-Cancelling Wireless Earbuds", "category": "Electronics", "default_price": 149.00, "unit": "item", "description": "ANC earbuds with 30hr battery case", "barcode": "789101129"},
    {"name": "Magnetic Wireless MagSafe Charger", "category": "Electronics", "default_price": 39.99, "unit": "item", "description": "15W fast magnetic charging stand", "barcode": "789101130"},
    {"name": "Ergonomic Mechanical Keyboard", "category": "Electronics", "default_price": 119.00, "unit": "item", "description": "Hot-swappable switches with RGB backlight", "barcode": "789101131"},
    {"name": "Portable SSD 1TB USB 3.2", "category": "Electronics", "default_price": 89.99, "unit": "item", "description": "1050MB/s rugged external solid state drive", "barcode": "789101132"},

    # Transportation
    {"name": "City Metro Monthly Pass", "category": "Transportation", "default_price": 85.00, "unit": "pass", "description": "Unlimited subway and bus travel", "barcode": "789101133"},
    {"name": "Uber Ride to Downtown", "category": "Transportation", "default_price": 24.50, "unit": "trip", "description": "Standard UberX commute", "barcode": "789101134"},
    {"name": "Gasoline Fill-up (12 gal)", "category": "Transportation", "default_price": 42.00, "unit": "tank", "description": "Shell Premium Unleaded", "barcode": "789101135"},
    {"name": "Electric Scooter Rental", "category": "Transportation", "default_price": 6.75, "unit": "trip", "description": "Lime 20 min city ride", "barcode": "789101136"},

    # Entertainment
    {"name": "IMAX Cinema Ticket", "category": "Entertainment", "default_price": 21.50, "unit": "ticket", "description": "Weekend evening screening", "barcode": "789101137"},
    {"name": "Concert Live Ticket", "category": "Entertainment", "default_price": 75.00, "unit": "ticket", "description": "Indie Rock festival entry", "barcode": "789101138"},
    {"name": "Board Game Night Entry", "category": "Entertainment", "default_price": 15.00, "unit": "admission", "description": "Community tabletop gaming lounge", "barcode": "789101139"},

    # Utilities & Bills
    {"name": "Fiber High-Speed Internet 1Gbps", "category": "Utilities & Bills", "default_price": 79.99, "unit": "month", "description": "Monthly fiber broadband", "barcode": "789101140"},
    {"name": "Electric & Gas Utility Bill", "category": "Utilities & Bills", "default_price": 115.40, "unit": "month", "description": "Home clean energy utility", "barcode": "789101141"},
    {"name": "City Water & Waste Utility", "category": "Utilities & Bills", "default_price": 45.20, "unit": "month", "description": "Municipal quarterly billing cycle", "barcode": "789101142"},
    {"name": "Unlimited Mobile Phone Plan", "category": "Utilities & Bills", "default_price": 65.00, "unit": "month", "description": "5G unlimited data + hotspot", "barcode": "789101143"},

    # Healthcare
    {"name": "Prescription Multivitamins", "category": "Healthcare", "default_price": 24.99, "unit": "bottle", "description": "Daily organic vitamins 90 count", "barcode": "789101144"},
    {"name": "Gym & Fitness Club Membership", "category": "Healthcare", "default_price": 59.00, "unit": "month", "description": "Monthly access to gym, sauna & pool", "barcode": "789101145"},
    {"name": "Dental Cleaning & Checkup", "category": "Healthcare", "default_price": 120.00, "unit": "visit", "description": "Bi-annual preventive hygiene appointment", "barcode": "789101146"},

    # Shopping
    {"name": "Merino Wool Crewneck Sweater", "category": "Shopping", "default_price": 89.00, "unit": "item", "description": "Fine gauge 100% Australian merino wool", "barcode": "789101147"},
    {"name": "Running Training Shoes", "category": "Shopping", "default_price": 130.00, "unit": "pair", "description": "Lightweight cushioned road runners", "barcode": "789101148"},
    {"name": "Hardcover Bestseller Book", "category": "Shopping", "default_price": 28.00, "unit": "book", "description": "Latest release in fiction / science", "barcode": "789101149"},

    # Subscriptions
    {"name": "Spotify Premium Family", "category": "Subscriptions", "default_price": 16.99, "unit": "month", "description": "Ad-free hi-res music streaming", "barcode": "789101150"},
    {"name": "Netflix 4K Ultra HD", "category": "Subscriptions", "default_price": 22.99, "unit": "month", "description": "Premium 4-screen streaming plan", "barcode": "789101151"},
    {"name": "Cloud Storage 2TB & Backup", "category": "Subscriptions", "default_price": 9.99, "unit": "month", "description": "Google One 2TB secure storage", "barcode": "789101152"},
    {"name": "AI Assistant Pro Subscription", "category": "Subscriptions", "default_price": 20.00, "unit": "month", "description": "Advanced reasoning & coding assistant", "barcode": "789101153"},
]

MERCHANTS_MAP = {
    "Groceries": ["Trader Joe's", "Whole Foods Market", "Costco Wholesale", "Kroger", "Local Farmers Market"],
    "Dining Out": ["Blue Bottle Coffee", "Sweetgreen", "Chipotle", "Nobu Ramen", "Local Trattoria", "Shake Shack"],
    "Electronics": ["Apple Store", "Best Buy", "Amazon", "B&H Photo Video", "Anker Direct"],
    "Transportation": ["Uber", "Lyft", "MTA Transit", "Shell Oil", "Chevron", "Lime Scooters"],
    "Entertainment": ["AMC Theatres", "Live Nation", "Steam", "Nintendo eShop", "Criterion Channel"],
    "Utilities & Bills": ["National Grid", "ConEdison", "Verizon Fios", "AT&T Mobility", "City Water Authority"],
    "Healthcare": ["CVS Pharmacy", "Walgreens", "Equinox Fitness", "One Medical", "City Dental"],
    "Shopping": ["Uniqlo", "Nordstrom", "Nike Flagship", "Patagonia", "Target", "Barnes & Noble"],
    "Subscriptions": ["Netflix Inc.", "Spotify AB", "Google Cloud", "Apple Services", "OpenAI / Claude"]
}

def seed_database_if_empty(db: Session, force: bool = False):
    existing_expenses_count = db.query(ExpenseDB).count()
    if existing_expenses_count > 100 and not force:
        return {"status": "already_seeded", "count": existing_expenses_count}

    if force:
        db.query(ExpenseDB).delete()
        db.query(ProductDB).delete()
        db.query(CategoryBudgetDB).delete()
        db.commit()

    # 1. Seed Categories & Budgets
    for cat in CATEGORIES:
        budget = CategoryBudgetDB(
            category=cat["name"],
            monthly_limit=cat["limit"],
            color=cat["color"],
            icon=cat["icon"]
        )
        db.add(budget)
    db.commit()

    # 2. Seed Products
    created_products = []
    for p_data in PRODUCTS_SEED:
        product = ProductDB(
            name=p_data["name"],
            category=p_data["category"],
            default_price=p_data["default_price"],
            unit=p_data.get("unit", "item"),
            description=p_data.get("description"),
            barcode=p_data.get("barcode"),
            is_favorite=random.random() < 0.25
        )
        db.add(product)
        created_products.append(product)
    db.commit()

    # Map products by category
    products_by_category = {}
    for p in created_products:
        products_by_category.setdefault(p.category, []).append(p)

    # 3. Seed Large Dataset of Expenses (Over 600 transactions across 180 days)
    # Target date: 2026-10-05 (today in system)
    end_date = datetime(2026, 10, 5, 18, 0, 0)
    start_date = end_date - timedelta(days=180) # 6 months back

    expenses_to_add = []
    random.seed(42) # Consistent realistic dataset

    current_day = start_date
    while current_day <= end_date:
        # Determine number of transactions for this day
        # Weekends have more dining/groceries/shopping
        is_weekend = current_day.weekday() >= 5
        daily_tx_count = random.randint(2, 5) if is_weekend else random.randint(1, 4)

        # Monthly recurring bills on the 1st, 5th, or 15th
        day_of_month = current_day.day
        if day_of_month == 1:
            # Subscriptions
            sub_prods = products_by_category.get("Subscriptions", [])
            for sub_p in sub_prods:
                expenses_to_add.append(
                    ExpenseDB(
                        product_id=sub_p.id,
                        title=sub_p.name,
                        category="Subscriptions",
                        amount=sub_p.default_price,
                        quantity=1.0,
                        unit_price=sub_p.default_price,
                        date=current_day.replace(hour=8, minute=0),
                        payment_method="Credit Card",
                        merchant=random.choice(MERCHANTS_MAP["Subscriptions"]),
                        notes="Auto-renew monthly subscription"
                    )
                )

        if day_of_month == 15:
            # Utilities
            util_prods = products_by_category.get("Utilities & Bills", [])
            for u_p in util_prods:
                amt = round(u_p.default_price * random.uniform(0.9, 1.15), 2)
                expenses_to_add.append(
                    ExpenseDB(
                        product_id=u_p.id,
                        title=u_p.name,
                        category="Utilities & Bills",
                        amount=amt,
                        quantity=1.0,
                        unit_price=amt,
                        date=current_day.replace(hour=10, minute=30),
                        payment_method="Bank Transfer",
                        merchant=random.choice(MERCHANTS_MAP["Utilities & Bills"]),
                        notes="Monthly utility bill"
                    )
                )

        # Regular daily expenses
        for _ in range(daily_tx_count):
            # Select weighted category (Groceries and Dining Out are most frequent)
            cat_choices = [
                "Groceries", "Dining Out", "Transportation", "Shopping",
                "Entertainment", "Healthcare", "Electronics"
            ]
            weights = [0.30, 0.25, 0.18, 0.12, 0.08, 0.04, 0.03]
            selected_cat = random.choices(cat_choices, weights=weights, k=1)[0]

            available_prods = products_by_category.get(selected_cat, [])
            if not available_prods:
                continue

            product = random.choice(available_prods)
            # Variations in quantity or price
            qty = 1.0
            if selected_cat == "Groceries":
                qty = float(random.choice([1, 1, 2, 2, 3]))
            elif selected_cat == "Dining Out" and is_weekend:
                qty = float(random.choice([1, 2]))

            price_jitter = random.uniform(0.95, 1.05)
            unit_price = round(product.default_price * price_jitter, 2)
            amount = round(unit_price * qty, 2)

            hour = random.randint(8, 22)
            minute = random.choice([0, 15, 30, 45])
            tx_time = current_day.replace(hour=hour, minute=minute)

            merchant = random.choice(MERCHANTS_MAP.get(selected_cat, ["Local Merchant"]))
            payment_methods = ["Credit Card", "Apple Pay", "Debit Card", "Cash"]
            payment = random.choices(payment_methods, weights=[0.6, 0.25, 0.1, 0.05], k=1)[0]

            expenses_to_add.append(
                ExpenseDB(
                    product_id=product.id,
                    title=f"{product.name}{' x' + str(int(qty)) if qty > 1 else ''}",
                    category=selected_cat,
                    amount=amount,
                    quantity=qty,
                    unit_price=unit_price,
                    date=tx_time,
                    payment_method=payment,
                    merchant=merchant,
                    notes=f"Purchased at {merchant}"
                )
            )

        current_day += timedelta(days=1)

    # Bulk insert in batches
    db.bulk_save_objects(expenses_to_add)
    db.commit()

    total_expenses = db.query(ExpenseDB).count()
    total_products = db.query(ProductDB).count()
    return {
        "status": "seeded_successfully",
        "expenses_count": total_expenses,
        "products_count": total_products,
        "categories_count": len(CATEGORIES)
    }
