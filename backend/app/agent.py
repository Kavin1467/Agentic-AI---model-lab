import os
import re
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from .models import ExpenseDB, ProductDB, CategoryBudgetDB

class FinancialAIAgent:
    """
    Intelligent Financial Agent supporting:
    - Gemini API when GEMINI_API_KEY is available
    - Built-in heuristic intelligence with deep SQL aggregation & tool execution when offline or keyless
    """

    def __init__(self, db: Session, user_api_key: Optional[str] = None):
        self.db = db
        self.api_key = user_api_key or os.getenv("GEMINI_API_KEY")

    def query_spending_stats(self, days: int = 30, category: Optional[str] = None) -> Dict[str, Any]:
        """Aggregate total spending, count, average, and category breakdown."""
        since_date = datetime.utcnow() - timedelta(days=days)
        q = self.db.query(ExpenseDB).filter(ExpenseDB.date >= since_date)
        if category:
            q = q.filter(ExpenseDB.category.ilike(f"%{category}%"))
        
        expenses = q.all()
        total_amount = sum(e.amount for e in expenses)
        count = len(expenses)
        avg = round(total_amount / count, 2) if count > 0 else 0.0

        # Category breakdown
        cat_map: Dict[str, float] = {}
        for e in expenses:
            cat_map[e.category] = cat_map.get(e.category, 0.0) + e.amount
        
        sorted_cats = sorted([{"category": k, "amount": round(v, 2)} for k, v in cat_map.items()], key=lambda x: x["amount"], reverse=True)

        return {
            "period_days": days,
            "total_spent": round(total_amount, 2),
            "transaction_count": count,
            "average_transaction": avg,
            "categories": sorted_cats
        }

    def get_top_expenses(self, limit: int = 5, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get the highest expense items."""
        q = self.db.query(ExpenseDB)
        if category:
            q = q.filter(ExpenseDB.category.ilike(f"%{category}%"))
        top = q.order_by(desc(ExpenseDB.amount)).limit(limit).all()
        return [
            {
                "id": e.id,
                "title": e.title,
                "amount": e.amount,
                "category": e.category,
                "date": e.date.strftime("%Y-%m-%d"),
                "merchant": e.merchant
            }
            for e in top
        ]

    def get_budget_status(self) -> List[Dict[str, Any]]:
        """Compare current month spending against category limits."""
        now = datetime.utcnow()
        first_of_month = datetime(now.year, now.month, 1)

        budgets = self.db.query(CategoryBudgetDB).all()
        results = []

        for b in budgets:
            spent = self.db.query(func.sum(ExpenseDB.amount)).filter(
                and_(
                    ExpenseDB.category == b.category,
                    ExpenseDB.date >= first_of_month
                )
            ).scalar() or 0.0

            percent = round((spent / b.monthly_limit) * 100, 1) if b.monthly_limit > 0 else 0
            results.append({
                "category": b.category,
                "limit": b.monthly_limit,
                "spent": round(spent, 2),
                "remaining": round(max(0, b.monthly_limit - spent), 2),
                "percent_used": percent,
                "is_overbudget": spent > b.monthly_limit,
                "color": b.color
            })

        return sorted(results, key=lambda x: x["percent_used"], reverse=True)

    def get_weekly_comparison(self) -> Dict[str, Any]:
        """Compare this week's spending with last week."""
        now = datetime.utcnow()
        start_this_week = now - timedelta(days=7)
        start_last_week = now - timedelta(days=14)

        spent_this_week = self.db.query(func.sum(ExpenseDB.amount)).filter(
            ExpenseDB.date >= start_this_week
        ).scalar() or 0.0

        spent_last_week = self.db.query(func.sum(ExpenseDB.amount)).filter(
            and_(
                ExpenseDB.date >= start_last_week,
                ExpenseDB.date < start_this_week
            )
        ).scalar() or 0.0

        diff = spent_this_week - spent_last_week
        pct_change = round((diff / spent_last_week) * 100, 1) if spent_last_week > 0 else 0.0

        return {
            "this_week": round(spent_this_week, 2),
            "last_week": round(spent_last_week, 2),
            "difference": round(diff, 2),
            "percent_change": pct_change,
            "status": "higher" if diff > 0 else "lower"
        }

    async def execute_agent(self, user_message: str) -> Dict[str, Any]:
        """
        Processes user query using Gemini API if key is available,
        otherwise uses the rich intelligent heuristic agent with complete DB tooling.
        """
        clean_msg = user_message.lower().strip()

        # Gather real-time context from the DB
        month_stats = self.query_spending_stats(days=30)
        week_stats = self.query_spending_stats(days=7)
        weekly_comp = self.get_weekly_comparison()
        budgets = self.get_budget_status()
        top_overall = self.get_top_expenses(limit=5)
        all_products_count = self.db.query(ProductDB).count()
        total_tx_count = self.db.query(ExpenseDB).count()

        # If Gemini API Key is available, invoke Gemini Flash API
        if self.api_key:
            try:
                system_prompt = (
                    "You are 'Apex Financial Agent', a sophisticated personal finance AI advisor integrated into the user's Expense Tracker app. "
                    "You have direct real-time access to the user's spending data and product catalog. "
                    "Provide clear, crisp, insightful, and motivating responses in clean GitHub markdown. "
                    "Include numbers, specific categories, comparisons, and actionable budgeting tips whenever relevant.\n\n"
                    f"Current Real-Time Context:\n"
                    f"- Total recorded transactions: {total_tx_count}\n"
                    f"- Products in catalog: {all_products_count}\n"
                    f"- Past 30 Days Spending: ${month_stats['total_spent']} across {month_stats['transaction_count']} transactions.\n"
                    f"- Top Category (30d): {month_stats['categories'][0]['category'] if month_stats['categories'] else 'N/A'} (${month_stats['categories'][0]['amount'] if month_stats['categories'] else 0})\n"
                    f"- Past 7 Days Spending: ${week_stats['total_spent']} (vs last week: ${weekly_comp['last_week']}, change: {weekly_comp['percent_change']}%)\n"
                    f"- Budgets at Risk/Over: {[b['category'] + f' ({b['percent_used']}%)' for b in budgets if b['percent_used'] >= 80]}\n"
                    f"- Top 3 Single Purchases: {[e['title'] + f' (${e['amount']})' for e in top_overall[:3]]}\n"
                )

                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
                payload = {
                    "contents": [
                        {"role": "user", "parts": [{"text": f"{system_prompt}\n\nUser Question: {user_message}"}]}
                    ]
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(gemini_url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text:
                            return {
                                "reply": text,
                                "suggested_actions": [
                                    "Show weekly spending breakdown",
                                    "Which categories are over budget?",
                                    "What are my highest expenses?",
                                    "How to save 15% next month?"
                                ],
                                "data_summary": {
                                    "total_spent_30d": month_stats["total_spent"],
                                    "total_spent_7d": week_stats["total_spent"],
                                    "weekly_change_pct": weekly_comp["percent_change"]
                                },
                                "chart_data": {
                                    "labels": [c["category"] for c in month_stats["categories"][:5]],
                                    "values": [c["amount"] for c in month_stats["categories"][:5]]
                                }
                            }
            except Exception as e:
                # Log and fallback smoothly
                print(f"Gemini API invocation error: {e}. Falling back to internal intelligent agent.")

        # --- Built-in Intelligent Financial Agent Fallback ---
        return self._heuristic_agent_response(
            clean_msg, 
            month_stats, 
            week_stats, 
            weekly_comp, 
            budgets, 
            top_overall,
            total_tx_count=total_tx_count,
            all_products_count=all_products_count
        )

    def _heuristic_agent_response(
        self,
        clean_msg: str,
        month_stats: Dict[str, Any],
        week_stats: Dict[str, Any],
        weekly_comp: Dict[str, Any],
        budgets: List[Dict[str, Any]],
        top_overall: List[Dict[str, Any]],
        total_tx_count: int = 548,
        all_products_count: int = 42
    ) -> Dict[str, Any]:
        """Natural Language Understanding & financial reasoning engine."""

        # 0. What is this project / Who are you / Overview
        if any(w in clean_msg for w in ["what is this project", "what is this app", "about this project", "who are you", "what can you do", "help", "about"]):
            reply = (
                "### 🚀 Apex Expense AI — Agentic Financial Lab\n\n"
                "**Apex Expense AI** is a modern personal finance and expense analytics platform designed with autonomous agent intelligence:\n\n"
                f"- **📊 Real-Time Analytics**: Multi-timeframe velocity tracking across **daily (14d)**, **weekly (8w)**, and **monthly (6m)** periods.\n"
                f"- **🏷️ Product Catalog**: Full CRUD to manage {all_products_count} products with unit prices, categories, and direct expense logging.\n"
                f"- **💳 Financial Ledger**: Live dataset of {total_tx_count} verified transactions with merchants, payment methods, and category tags.\n"
                f"- **🤖 Autonomous AI Agent**: Real-time spending audits, budget threshold checks, and personalized cost-cutting strategies.\n"
                f"- **📱 Cross-Platform Ecosystem**: React Light Glassmorphic Web Dashboard + Flutter Mobile/Desktop client.\n\n"
                "Ask me about any category, your weekly burn rate, or budget optimization!"
            )
            return {
                "reply": reply,
                "suggested_actions": [
                    "How much did I spend this week?",
                    "How much did I spend this month for Groceries?",
                    "Which categories are over budget?",
                    "What are my highest expenses?"
                ]
            }

        # 1. Category specific query (e.g., "groceries", "dining", "transportation")
        # Checked before generic month/week to handle "How much did I spend this month for Groceries?"
        known_cats = ["groceries", "dining out", "dining", "electronics", "transportation", "entertainment", "utilities", "healthcare", "shopping", "subscriptions"]
        matched_cat = next((c for c in known_cats if c in clean_msg), None)
        if matched_cat:
            cat_name = "Dining Out" if matched_cat in ["dining", "dining out"] else matched_cat.title()
            days = 7 if any(w in clean_msg for w in ["week", "7 days"]) else 30
            period_label = "Past 7 Days" if days == 7 else "Past 30 Days (This Month)"
            cat_stats = self.query_spending_stats(days=days, category=cat_name)
            top_cat_items = self.get_top_expenses(limit=4, category=cat_name)

            reply = (
                f"### 🛒 Spending in **{cat_name}** ({period_label})\n\n"
                f"- **Total Spent**: **${cat_stats['total_spent']:,.2f}**\n"
                f"- **Transactions**: **{cat_stats['transaction_count']} purchases**\n"
                f"- **Average Ticket**: **${cat_stats['average_transaction']:,.2f}** per transaction\n\n"
            )
            if top_cat_items:
                reply += f"#### Recent Notable Purchases in {cat_name}:\n"
                for item in top_cat_items:
                    reply += f"- **{item['title']}**: ${item['amount']:,.2f} (*{item['merchant']}* on {item['date']})\n"

            return {
                "reply": reply,
                "suggested_actions": [
                    f"How to cut {cat_name} costs?",
                    "Which categories are over budget?",
                    "Show monthly spending overview"
                ],
                "data_summary": cat_stats
            }

        # 1. Weekly spending queries
        if any(w in clean_msg for w in ["week", "weekly", "last 7 days"]):
            diff_text = f"an increase of +{weekly_comp['difference']}" if weekly_comp['difference'] > 0 else f"a decrease of -${abs(weekly_comp['difference'])}"
            reply = (
                f"### 📊 Weekly Spending Analysis\n\n"
                f"Over the **past 7 days**, you have spent **${week_stats['total_spent']:,.2f}** across **{week_stats['transaction_count']} transactions**.\n\n"
                f"- **Comparison with previous week**: Last week was **${weekly_comp['last_week']:,.2f}**, representing {diff_text} (**{weekly_comp['percent_change']:+}%**).\n"
                f"- **Average purchase**: **${week_stats['average_transaction']:,.2f}** per transaction.\n\n"
                f"#### Top Categories This Week:\n"
            )
            for c in week_stats["categories"][:4]:
                pct = round((c["amount"] / week_stats["total_spent"]) * 100, 1) if week_stats["total_spent"] > 0 else 0
                reply += f"- **{c['category']}**: ${c['amount']:,.2f} ({pct}%)\n"

            return {
                "reply": reply,
                "suggested_actions": [
                    "Compare with monthly spending",
                    "Which category is highest?",
                    "Check budget limits"
                ],
                "data_summary": week_stats,
                "chart_data": {
                    "labels": [c["category"] for c in week_stats["categories"][:5]],
                    "values": [c["amount"] for c in week_stats["categories"][:5]]
                }
            }

        # 2. Monthly spending queries
        if any(w in clean_msg for w in ["month", "monthly", "30 days"]):
            top_cat = month_stats["categories"][0] if month_stats["categories"] else {"category": "None", "amount": 0}
            reply = (
                f"### 🗓️ Monthly Spending Overview (Past 30 Days)\n\n"
                f"You have spent **${month_stats['total_spent']:,.2f}** in the past 30 days across **{month_stats['transaction_count']} transactions**.\n\n"
                f"- **Primary Driver**: **{top_cat['category']}** accounts for **${top_cat['amount']:,.2f}** ({round((top_cat['amount']/month_stats['total_spent'])*100, 1)}% of total).\n"
                f"- **Daily Average**: ~**${round(month_stats['total_spent']/30, 2):,.2f} / day**.\n\n"
                f"#### Breakdown by Category:\n"
            )
            for c in month_stats["categories"][:5]:
                reply += f"- **{c['category']}**: ${c['amount']:,.2f}\n"

            return {
                "reply": reply,
                "suggested_actions": [
                    "Show budget alerts",
                    "Top 5 single purchases",
                    "How can I cut dining out costs?"
                ],
                "data_summary": month_stats,
                "chart_data": {
                    "labels": [c["category"] for c in month_stats["categories"][:6]],
                    "values": [c["amount"] for c in month_stats["categories"][:6]]
                }
            }

        # 3. Budget & Alerts
        if any(w in clean_msg for w in ["budget", "alert", "limit", "overbudget", "warning"]):
            over = [b for b in budgets if b["percent_used"] >= 100]
            warning = [b for b in budgets if 80 <= b["percent_used"] < 100]
            healthy = [b for b in budgets if b["percent_used"] < 80]

            reply = "### 🎯 Monthly Category Budget Status\n\n"
            if over:
                reply += "⚠️ **Over Budget Categories:**\n"
                for b in over:
                    reply += f"- **{b['category']}**: ${b['spent']:,.2f} / ${b['limit']:,.2f} (**{b['percent_used']}%** used! Over by ${b['spent'] - b['limit']:,.2f})\n"
                reply += "\n"
            
            if warning:
                reply += "⚡ **Approaching Limit (>= 80%):**\n"
                for b in warning:
                    reply += f"- **{b['category']}**: ${b['spent']:,.2f} / ${b['limit']:,.2f} ({b['percent_used']}% used, **${b['remaining']:,.2f} remaining**)\n"
                reply += "\n"

            reply += "✅ **Well Managed Categories:**\n"
            for b in healthy[:3]:
                reply += f"- **{b['category']}**: ${b['spent']:,.2f} of ${b['limit']:,.2f} ({b['percent_used']}%)\n"

            return {
                "reply": reply,
                "suggested_actions": [
                    "Show top expenses",
                    "How to reduce overbudget spending?",
                    "Check weekly velocity"
                ],
                "data_summary": {"over_count": len(over), "warning_count": len(warning)},
                "chart_data": {
                    "labels": [b["category"] for b in budgets[:6]],
                    "values": [b["percent_used"] for b in budgets[:6]]
                }
            }

        # 4. Highest / Top / Largest expenses
        if any(w in clean_msg for w in ["highest", "largest", "biggest", "top expense", "most expensive"]):
            reply = "### 🏆 Your Top 5 Largest Recorded Expenses\n\n"
            for idx, e in enumerate(top_overall, start=1):
                reply += f"{idx}. **{e['title']}** — **${e['amount']:,.2f}**\n   - *Category*: {e['category']} | *Merchant*: {e['merchant']} | *Date*: {e['date']}\n"
            
            reply += "\n💡 **Advisor Note**: Recurring high ticket items like electronics and dental care represent non-monthly spikes. Consider setting aside an emergency sinking fund."
            return {
                "reply": reply,
                "suggested_actions": [
                    "Show spending breakdown for Electronics",
                    "Check monthly budget",
                    "List my products"
                ],
                "data_summary": {"top_expenses": top_overall}
            }


        # 6. Savings / Advice / Tips
        if any(w in clean_msg for w in ["save", "saving", "advice", "tip", "cut", "reduce", "recommend"]):
            top_cats = month_stats["categories"][:2]
            reply = (
                "### 💡 Personalized Financial Recommendations\n\n"
                f"Based on your recent spending habits, here are 3 high-impact opportunities to save:\n\n"
                f"1. **Audit {top_cats[0]['category']}** (Currently **${top_cats[0]['amount']:,.2f}** / mo):\n"
                f"   - Setting a weekly grocery meal-plan or shopping with a list can reduce impulsive add-ons by **15–20%**, potentially saving **${round(top_cats[0]['amount'] * 0.18, 2)}** next month.\n\n"
                f"2. **Cap Dining Out & Coffee Runs** (Currently **${top_cats[1]['amount'] if len(top_cats) > 1 else 0:,.2f}** / mo):\n"
                f"   - Switching 2 restaurant dinners to home-cooked meals per week can save approximately **$120–$160/month**.\n\n"
                f"3. **Subscription Review**:\n"
                f"   - You have active automated renewals. Check if you have unused streaming or cloud services that can be paused.\n"
            )
            return {
                "reply": reply,
                "suggested_actions": [
                    "Check budget limits",
                    "Show weekly progress",
                    "Top 5 expenses"
                ]
            }

        # Default intelligent response
        return {
            "reply": (
                f"### 👋 Hello! I'm your AI Expense & Financial Advisor\n\n"
                f"I continuously monitor your **{total_tx_count} recorded expenses** and **{all_products_count} product catalog items**.\n\n"
                f"**Quick Snapshot**:\n"
                f"- **Past 7 Days**: ${week_stats['total_spent']:,.2f} ({weekly_comp['percent_change']:+}% vs prior week)\n"
                f"- **Past 30 Days**: ${month_stats['total_spent']:,.2f}\n"
                f"- **Top Spending Area**: {month_stats['categories'][0]['category'] if month_stats['categories'] else 'N/A'}\n\n"
                f"Feel free to ask me questions like:\n"
                f"- *'How much did I spend on groceries this week?'*\n"
                f"- *'Which categories are exceeding budget?'*\n"
                f"- *'Show my biggest expenses last month'* \n"
                f"- *'Give me advice to cut my spending'* "
            ),
            "suggested_actions": [
                "How much did I spend this week?",
                "Which categories are over budget?",
                "What are my highest expenses?",
                "Show monthly spending overview"
            ],
            "data_summary": {
                "total_tx": total_tx_count,
                "spent_7d": week_stats["total_spent"],
                "spent_30d": month_stats["total_spent"]
            }
        }
