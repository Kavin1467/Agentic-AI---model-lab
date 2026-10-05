# Apex Expense AI — Full-Stack Intelligent Expense Tracker

A full-stack personal finance application built with **React**, **Python FastAPI AI Agent**, and **Flutter**, pre-loaded with a rich dataset of **500+ realistic expenses** spanning 6 months, comprehensive **Product Catalog Management (CRUD)**, **Daily, Weekly, and Monthly spending history**, and an **Autonomous AI Financial Advisor**.

---

## 🏗️ Architecture & Features

```
d:\Projects\Agentic AI model lab\
├── backend/                   # Python FastAPI AI Agent Backend
│   ├── app/
│   │   ├── main.py            # FastAPI app with CORS middleware
│   │   ├── database.py        # SQLite Engine & SQLAlchemy Session
│   │   ├── models.py          # Products, Expenses, Categories, Chat DB & Pydantic models
│   │   ├── seed_data.py       # Realistic 548+ expenses & 42 products generator
│   │   ├── agent.py           # Intelligent Financial Agent (Gemini API + local heuristic fallback)
│   │   └── routers/
│   │       ├── expenses.py    # Daily/Weekly/Monthly history, stats, and CRUD
│   │       ├── products.py    # Product catalog with price history & full CRUD
│   │       ├── chat.py        # AI Chatbot endpoint with memory
│   │       └── seed.py        # On-demand dataset re-seeding endpoint
│   ├── requirements.txt
│   └── run.py                 # Runs API on http://localhost:8001
│
├── frontend-react/            # Modern React Web Application (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpendingChart.jsx   # Interactive velocity bar chart & category distribution
│   │   │   ├── ProductManager.jsx  # Products table, search, Add/Edit/Delete modals, price tracking
│   │   │   ├── ExpenseHistory.jsx  # Transactions ledger with filtering & edit/delete
│   │   │   ├── ChatbotDrawer.jsx   # AI Advisor chatbot with instant chips & markdown rendering
│   │   │   └── AddExpenseModal.jsx # Log expense with product auto-fill or custom entry
│   │   ├── api/client.js           # Unified API client
│   │   ├── index.css               # Glassmorphic dark design system with Outfit & Plus Jakarta fonts
│   │   └── App.jsx                 # Main layout and tab navigation
│   └── index.html
│
└── mobile_flutter/            # Flutter Cross-Platform Client (Android / iOS / Web / Desktop)
    ├── lib/
    │   ├── data/
    │   │   ├── models/models.dart           # Clean Dart domain models
    │   │   └── services/api_service.dart    # HTTP client with Android emulator IP support
    │   └── main.dart                        # Material 3 Dark UI: Dashboard, Products, Ledger, AI Chat
    └── pubspec.yaml
```

---

## 🚀 Quick Start Guide

### 1. Backend (FastAPI AI Agent)
The backend is already running on `http://localhost:8001`.
If you ever need to restart it manually:
```bash
cd backend
.\venv\Scripts\python.exe run.py
```
- API Docs: `http://localhost:8001/docs`
- Health check: `http://localhost:8001/api/health`

### 2. React Web Dashboard
The web app is already running on `http://localhost:5173`.
To run manually:
```bash
cd frontend-react
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 3. Flutter Mobile Client
To launch the Flutter client:
```bash
cd mobile_flutter
flutter run
```
You can select Windows Desktop, Chrome Web, or an Android/iOS emulator.

---

## 🌟 Key Highlights

1. **Light Theme Minimalism + Glassmorphism**:
   - Ultra-clean aesthetic with airy layout, frosted translucent cards (`backdrop-filter: blur(20px)`), subtle slate borders, and diffused drop-shadows.
   - High readability charcoal and slate typography (`#0f172a` and `#475569`).
   - Integrated **Sun / Moon theme switcher** in the web header for instant toggling between Light and Dark glassmorphism.
   - Matching Material 3 Light Minimalist theme in the Flutter cross-platform mobile client.

2. **Large Realistic Dataset**: Pre-seeded with 548+ real-world transactions distributed across 180 days (6 months) in 9 categories (Groceries, Dining Out, Electronics, Transportation, Utilities, Healthcare, Shopping, Subscriptions, Entertainment).
2. **Product Catalog Management (CRUD)**:
   - Add new products with unit price, standard measurement, category, barcode, and favorite star.
   - Edit existing products.
   - Delete products (detaches safely from past expense records).
   - Real-time search and category filtering.
   - Price tracking: inspect price fluctuation and purchase frequency for any item.
3. **Multi-Timeframe Spending History**:
   - Switch effortlessly between **Daily**, **Weekly**, and **Monthly** timeframes.
   - Interactive bar chart with hover tooltips showing total amount, transaction counts, and highest purchase.
   - Top category distribution breakdown.
4. **AI Financial Advisor (Chatbot)**:
   - Supports live **Google Gemini Flash API** (enter key in UI or set `GEMINI_API_KEY`).
   - Built-in **intelligent heuristic financial reasoning engine** that runs tool queries against the live SQLite database if no API key is provided.
   - Answers questions on weekly spending comparisons, budget limit breaches, top expense items, and personalized savings advice.
