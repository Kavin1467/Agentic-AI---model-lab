// In-browser High-Fidelity Financial Data Store for Apex Expense AI
// Provides complete offline/public-demo capability with full persistence in localStorage

const STORAGE_KEYS = {
  EXPENSES: 'apex_expenses_data_v1',
  PRODUCTS: 'apex_products_data_v1',
  CATEGORIES: 'apex_categories_data_v1',
  CHAT: 'apex_chat_history_v1',
  CUSTOM_API: 'apex_custom_api_url',
};

export const INITIAL_CATEGORIES = [
  { id: 1, name: "Groceries", color: "#10b981", icon: "shopping-cart", monthly_limit: 700.0 },
  { id: 2, name: "Dining Out", color: "#f59e0b", icon: "utensils", monthly_limit: 450.0 },
  { id: 3, name: "Electronics", color: "#6366f1", icon: "laptop", monthly_limit: 400.0 },
  { id: 4, name: "Transportation", color: "#06b6d4", icon: "car", monthly_limit: 250.0 },
  { id: 5, name: "Entertainment", color: "#ec4899", icon: "film", monthly_limit: 200.0 },
  { id: 6, name: "Utilities & Bills", color: "#8b5cf6", icon: "zap", monthly_limit: 350.0 },
  { id: 7, name: "Healthcare", color: "#ef4444", icon: "heart-pulse", monthly_limit: 250.0 },
  { id: 8, name: "Shopping", color: "#3b82f6", icon: "shopping-bag", monthly_limit: 500.0 },
  { id: 9, name: "Subscriptions", color: "#14b8a6", icon: "repeat", monthly_limit: 100.0 },
];

export const INITIAL_PRODUCTS = [
  { id: 1, name: "Organic Almond Milk", category: "Groceries", default_price: 4.29, unit: "bottle", description: "Unsweetened organic almond milk 64 fl oz", barcode: "789101112", is_favorite: true },
  { id: 2, name: "Whole Wheat Sourdough", category: "Groceries", default_price: 5.49, unit: "loaf", description: "Artisan baked sourdough bread", barcode: "789101113", is_favorite: false },
  { id: 3, name: "Avocados (Bag of 5)", category: "Groceries", default_price: 6.99, unit: "pack", description: "Fresh ripe Hass avocados", barcode: "789101114", is_favorite: true },
  { id: 4, name: "Free-Range Large Eggs (18pk)", category: "Groceries", default_price: 6.89, unit: "carton", description: "Grade A free-range eggs", barcode: "789101115", is_favorite: true },
  { id: 5, name: "Organic Greek Yogurt", category: "Groceries", default_price: 5.99, unit: "tub", description: "Plain whole milk Greek yogurt 32oz", barcode: "789101116", is_favorite: false },
  { id: 6, name: "Wild Salmon Fillets", category: "Groceries", default_price: 14.99, unit: "lb", description: "Fresh wild-caught salmon", barcode: "789101117", is_favorite: false },
  { id: 7, name: "Artisanal Espresso Beans", category: "Groceries", default_price: 16.50, unit: "bag", description: "Dark roast single origin arabica 12oz", barcode: "789101118", is_favorite: true },
  { id: 8, name: "Handcrafted Flat White", category: "Dining Out", default_price: 5.75, unit: "cup", description: "Double shot oat flat white", barcode: "789101122", is_favorite: true },
  { id: 9, name: "Artisan Avocado Toast & Egg", category: "Dining Out", default_price: 14.50, unit: "plate", description: "Breakfast cafe special with chili flakes", barcode: "789101123", is_favorite: false },
  { id: 10, name: "Salmon Poke Bowl", category: "Dining Out", default_price: 18.25, unit: "bowl", description: "Fresh salmon with edamame and brown rice", barcode: "789101124", is_favorite: true },
  { id: 11, name: "Wood-Fired Margherita Pizza", category: "Dining Out", default_price: 22.00, unit: "pizza", description: "San Marzano tomatoes, fior di latte, basil", barcode: "789101125", is_favorite: false },
  { id: 12, name: "Sushi Omakase Platter", category: "Dining Out", default_price: 45.00, unit: "set", description: "Chef selection nigiri & sashimi 14pcs", barcode: "789101126", is_favorite: false },
  { id: 13, name: "USB-C Braided Fast Cable (6ft)", category: "Electronics", default_price: 19.99, unit: "item", description: "100W PD braided durable cable", barcode: "789101128", is_favorite: false },
  { id: 14, name: "Noise-Cancelling Wireless Earbuds", category: "Electronics", default_price: 149.00, unit: "item", description: "ANC earbuds with 30hr battery case", barcode: "789101129", is_favorite: true },
  { id: 15, name: "Magnetic Fast Charging Stand", category: "Electronics", default_price: 39.99, unit: "item", description: "15W fast magnetic charging stand", barcode: "789101130", is_favorite: false },
  { id: 16, name: "City Metro Monthly Pass", category: "Transportation", default_price: 85.00, unit: "pass", description: "Unlimited subway and bus travel", barcode: "789101133", is_favorite: true },
  { id: 17, name: "Uber Downtown Ride", category: "Transportation", default_price: 24.50, unit: "trip", description: "Standard UberX commute", barcode: "789101134", is_favorite: false },
  { id: 18, name: "Gasoline Fill-up (12 gal)", category: "Transportation", default_price: 42.00, unit: "tank", description: "Premium 93 octane fuel", barcode: "789101135", is_favorite: false },
  { id: 19, name: "IMAX Cinema Ticket", category: "Entertainment", default_price: 21.50, unit: "ticket", description: "Weekend evening screening", barcode: "789101137", is_favorite: false },
  { id: 20, name: "Fiber Internet 1Gbps", category: "Utilities & Bills", default_price: 79.99, unit: "month", description: "Monthly symmetric gigabit broadband", barcode: "789101140", is_favorite: false },
  { id: 21, name: "Clean Energy Electric Bill", category: "Utilities & Bills", default_price: 115.40, unit: "month", description: "Home utility billing cycle", barcode: "789101141", is_favorite: false },
  { id: 22, name: "Gym & Fitness Club Membership", category: "Healthcare", default_price: 59.00, unit: "month", description: "Access to gym, sauna & training studio", barcode: "789101145", is_favorite: true },
  { id: 23, name: "Merino Wool Crewneck", category: "Shopping", default_price: 89.00, unit: "item", description: "Fine gauge Australian merino wool sweater", barcode: "789101147", is_favorite: false },
  { id: 24, name: "Spotify Premium Family", category: "Subscriptions", default_price: 16.99, unit: "month", description: "Lossless ad-free audio streaming", barcode: "789101150", is_favorite: true },
  { id: 25, name: "Netflix 4K Ultra HD", category: "Subscriptions", default_price: 22.99, unit: "month", description: "Premium 4-screen streaming account", barcode: "789101151", is_favorite: true },
  { id: 26, name: "AI Assistant Pro Tier", category: "Subscriptions", default_price: 20.00, unit: "month", description: "Advanced reasoning & autonomous agent tier", barcode: "789101153", is_favorite: true },
];

const MERCHANTS = {
  "Groceries": ["Trader Joe's", "Whole Foods Market", "Costco Wholesale", "Kroger", "Local Farmers Market"],
  "Dining Out": ["Blue Bottle Coffee", "Sweetgreen", "Chipotle", "Nobu Ramen", "Local Trattoria", "Shake Shack"],
  "Electronics": ["Apple Store", "Best Buy", "Amazon", "B&H Photo Video", "Anker Direct"],
  "Transportation": ["Uber", "Lyft", "MTA Transit", "Shell Oil", "Chevron"],
  "Entertainment": ["AMC Theatres", "Live Nation", "Steam", "Nintendo eShop"],
  "Utilities & Bills": ["National Grid", "ConEdison", "Verizon Fios", "AT&T Mobility"],
  "Healthcare": ["CVS Pharmacy", "Walgreens", "Equinox Fitness", "One Medical"],
  "Shopping": ["Uniqlo", "Nordstrom", "Nike Flagship", "Patagonia", "Target"],
  "Subscriptions": ["Netflix Inc.", "Spotify AB", "Google One", "Apple Services", "Anthropic / OpenAI"]
};

// Generate realistic transactions across last 180 days
function generateSeedExpenses(products) {
  const expenses = [];
  let nextId = 1;
  const now = new Date();
  
  // Seed dates from 180 days ago up to today
  for (let d = 180; d >= 0; d--) {
    const currentDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayOfMonth = currentDate.getDate();

    // 1st of month: Subscriptions
    if (dayOfMonth === 1) {
      const subs = products.filter(p => p.category === 'Subscriptions');
      for (const s of subs) {
        const subDate = new Date(currentDate);
        subDate.setHours(8, 0, 0, 0);
        expenses.push({
          id: nextId++,
          product_id: s.id,
          title: s.name,
          category: 'Subscriptions',
          amount: s.default_price,
          quantity: 1,
          unit_price: s.default_price,
          date: subDate.toISOString(),
          payment_method: 'Credit Card',
          merchant: MERCHANTS['Subscriptions'][s.id % MERCHANTS['Subscriptions'].length],
          notes: 'Auto-renew monthly subscription'
        });
      }
    }

    // 15th of month: Utilities
    if (dayOfMonth === 15) {
      const utils = products.filter(p => p.category === 'Utilities & Bills');
      for (const u of utils) {
        const utilDate = new Date(currentDate);
        utilDate.setHours(10, 30, 0, 0);
        const variation = 0.95 + (Math.sin(d + u.id) * 0.1);
        const amt = Math.round(u.default_price * variation * 100) / 100;
        expenses.push({
          id: nextId++,
          product_id: u.id,
          title: u.name,
          category: 'Utilities & Bills',
          amount: amt,
          quantity: 1,
          unit_price: amt,
          date: utilDate.toISOString(),
          payment_method: 'Bank Transfer',
          merchant: MERCHANTS['Utilities & Bills'][u.id % MERCHANTS['Utilities & Bills'].length],
          notes: 'Monthly utility bill'
        });
      }
    }

    // Regular daily transactions
    const txCount = isWeekend ? 3 : 2;
    for (let i = 0; i < txCount; i++) {
      // Pick category with realistic weights
      const cats = ['Groceries', 'Dining Out', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare'];
      const cat = cats[(d * 3 + i) % cats.length];
      const catProducts = products.filter(p => p.category === cat);
      if (catProducts.length === 0) continue;

      const prod = catProducts[(d * 7 + i) % catProducts.length];
      const txDate = new Date(currentDate);
      txDate.setHours(11 + i * 4, (i * 19) % 60, 0, 0);

      const qty = (cat === 'Groceries' && prod.unit === 'lb') ? 2 : 1;
      const totalAmt = Math.round(prod.default_price * qty * 100) / 100;
      const merchantsList = MERCHANTS[cat] || ['Merchant'];
      const merchant = merchantsList[(d + i) % merchantsList.length];

      expenses.push({
        id: nextId++,
        product_id: prod.id,
        title: prod.name,
        category: cat,
        amount: totalAmt,
        quantity: qty,
        unit_price: prod.default_price,
        date: txDate.toISOString(),
        payment_method: i % 2 === 0 ? 'Credit Card' : (i % 3 === 0 ? 'Apple Pay' : 'Debit Card'),
        merchant: merchant,
        notes: `Regular ${cat.toLowerCase()} purchase`
      });
    }
  }

  // Sort descending by date
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
}

class InBrowserStore {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      const prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
      const seeded = generateSeedExpenses(prods);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seeded));
    }

    this.initialized = true;
  }

  reset() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    const seeded = generateSeedExpenses(INITIAL_PRODUCTS);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seeded));
    localStorage.removeItem(STORAGE_KEYS.CHAT);
    return { count: seeded.length };
  }

  getCategories() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  }

  getProducts(params = {}) {
    this.init();
    let prods = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    if (params.category && params.category !== 'all') {
      prods = prods.filter(p => p.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    return prods;
  }

  createProduct(data) {
    this.init();
    const prods = this.getProducts();
    const newId = prods.length > 0 ? Math.max(...prods.map(p => p.id || 0)) + 1 : 1;
    const newProduct = {
      id: newId,
      name: data.name,
      category: data.category,
      default_price: parseFloat(data.default_price) || 0,
      unit: data.unit || 'item',
      description: data.description || '',
      barcode: data.barcode || '',
      is_favorite: !!data.is_favorite
    };
    prods.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
    return newProduct;
  }

  updateProduct(id, data) {
    this.init();
    const prods = this.getProducts();
    const idx = prods.findIndex(p => p.id === parseInt(id));
    if (idx === -1) throw new Error('Product not found');
    prods[idx] = { ...prods[idx], ...data, id: parseInt(id) };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
    return prods[idx];
  }

  deleteProduct(id) {
    this.init();
    let prods = this.getProducts();
    prods = prods.filter(p => p.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
    return { success: true };
  }

  getExpenses(params = {}) {
    this.init();
    let expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');

    if (params.category && params.category !== 'all') {
      expenses = expenses.filter(e => e.category.toLowerCase() === params.category.toLowerCase());
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      expenses = expenses.filter(e => 
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.merchant && e.merchant.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    const now = new Date();
    if (params.timeframe === 'daily') {
      const todayStr = now.toISOString().slice(0, 10);
      expenses = expenses.filter(e => e.date.slice(0, 10) === todayStr);
    } else if (params.timeframe === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      expenses = expenses.filter(e => new Date(e.date) >= weekAgo);
    } else if (params.timeframe === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      expenses = expenses.filter(e => new Date(e.date) >= monthAgo);
    }

    const limit = parseInt(params.limit) || 150;
    const offset = parseInt(params.offset) || 0;
    return expenses.slice(offset, offset + limit);
  }

  createExpense(data) {
    this.init();
    const expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id || 0)) + 1 : 1;
    const newExpense = {
      id: newId,
      product_id: data.product_id || null,
      title: data.title,
      category: data.category,
      amount: parseFloat(data.amount) || 0,
      quantity: parseFloat(data.quantity) || 1,
      unit_price: parseFloat(data.unit_price) || parseFloat(data.amount) || 0,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      payment_method: data.payment_method || 'Credit Card',
      merchant: data.merchant || 'Direct Purchase',
      notes: data.notes || ''
    };
    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return newExpense;
  }

  updateExpense(id, data) {
    this.init();
    const expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
    const idx = expenses.findIndex(e => e.id === parseInt(id));
    if (idx === -1) throw new Error('Expense not found');
    expenses[idx] = { ...expenses[idx], ...data, id: parseInt(id) };
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return expenses[idx];
  }

  deleteExpense(id) {
    this.init();
    let expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
    expenses = expenses.filter(e => e.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return { success: true };
  }

  getStats() {
    this.init();
    const expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
    const categories = this.getCategories();
    const now = new Date();

    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const start14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start60d = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    let todaySpend = 0;
    let spent7d = 0;
    let spentPrev7d = 0;
    let spent30d = 0;
    let spentPrev30d = 0;
    let totalSpend = 0;
    const cat30d = {};

    for (const exp of expenses) {
      const d = new Date(exp.date);
      const amt = Number(exp.amount) || 0;
      totalSpend += amt;

      if (d >= startToday) todaySpend += amt;
      if (d >= start7d) spent7d += amt;
      else if (d >= start14d) spentPrev7d += amt;

      if (d >= start30d) {
        spent30d += amt;
        cat30d[exp.category] = (cat30d[exp.category] || 0) + amt;
      } else if (d >= start60d) {
        spentPrev30d += amt;
      }
    }

    const weeklyDiffPct = spentPrev7d > 0 ? Math.round(((spent7d - spentPrev7d) / spentPrev7d) * 1000) / 10 : 0;
    const monthlyDiffPct = spentPrev30d > 0 ? Math.round(((spent30d - spentPrev30d) / spentPrev30d) * 1000) / 10 : 0;

    let topCategory = 'None';
    let topCategoryAmount = 0;
    for (const [c, a] of Object.entries(cat30d)) {
      if (a > topCategoryAmount) {
        topCategoryAmount = a;
        topCategory = c;
      }
    }

    const totalLimit = categories.reduce((sum, c) => sum + (c.monthly_limit || 0), 0);
    const overallBudgetPct = totalLimit > 0 ? Math.round((spent30d / totalLimit) * 1000) / 10 : 0;

    const categoryBudgets = categories.map(cat => {
      const spent = cat30d[cat.name] || 0;
      const limit = cat.monthly_limit || 500;
      const pct = Math.round((spent / limit) * 1000) / 10;
      return {
        category: cat.name,
        monthly_limit: limit,
        spent_30d: Math.round(spent * 100) / 100,
        percentage_used: pct,
        is_over_budget: spent > limit,
        color: cat.color,
        icon: cat.icon
      };
    });

    return {
      today_spend: Math.round(todaySpend * 100) / 100,
      spent_7d: Math.round(spent7d * 100) / 100,
      spent_prev_7d: Math.round(spentPrev7d * 100) / 100,
      weekly_diff_pct: weeklyDiffPct,
      spent_30d: Math.round(spent30d * 100) / 100,
      spent_prev_30d: Math.round(spentPrev30d * 100) / 100,
      monthly_diff_pct: monthlyDiffPct,
      total_spend: Math.round(totalSpend * 100) / 100,
      total_transactions: expenses.length,
      daily_average_30d: Math.round((spent30d / 30) * 100) / 100,
      top_category: topCategory,
      top_category_amount: Math.round(topCategoryAmount * 100) / 100,
      overall_budget_percentage: overallBudgetPct,
      category_budgets: categoryBudgets
    };
  }

  getHistory(period = 'weekly') {
    this.init();
    const expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
    const now = new Date();

    let sinceDate;
    if (period === 'daily') {
      sinceDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    } else if (period === 'weekly') {
      sinceDate = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000); // 8 weeks
    } else {
      sinceDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); // 6 months
    }

    const filtered = expenses.filter(e => new Date(e.date) >= sinceDate);
    const groups = {};
    const catTotals = {};
    const merchantTotals = {};
    let grandTotal = 0;

    for (const exp of filtered) {
      const d = new Date(exp.date);
      const amt = Number(exp.amount) || 0;
      grandTotal += amt;
      catTotals[exp.category] = (catTotals[exp.category] || 0) + amt;
      if (exp.merchant) {
        merchantTotals[exp.merchant] = (merchantTotals[exp.merchant] || 0) + amt;
      }

      let key;
      let label;
      if (period === 'daily') {
        key = d.toISOString().slice(0, 10);
        label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'weekly') {
        const weekNum = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
        key = `week_${weekNum}`;
        const day = d.getDate();
        label = `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      if (!groups[key]) {
        groups[key] = { label, total: 0, count: 0, categories: {} };
      }
      groups[key].total += amt;
      groups[key].count += 1;
      groups[key].categories[exp.category] = (groups[key].categories[exp.category] || 0) + amt;
    }

    const timeline = Object.keys(groups).sort().map(k => ({
      key: k,
      label: groups[k].label,
      total: Math.round(groups[k].total * 100) / 100,
      count: groups[k].count,
      categories: Object.fromEntries(
        Object.entries(groups[k].categories).map(([c, v]) => [c, Math.round(v * 100) / 100])
      )
    }));

    const sortedCats = Object.entries(catTotals)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
        percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.total - a.total);

    const sortedMerchants = Object.entries(merchantTotals)
      .map(([merchant, total]) => ({
        merchant,
        total: Math.round(total * 100) / 100
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return {
      period,
      total_spent: Math.round(grandTotal * 100) / 100,
      total_transactions: filtered.length,
      timeline,
      category_breakdown: sortedCats,
      top_merchants: sortedMerchants
    };
  }

  // Intelligent Financial Analyst Chat engine
  async sendChatMessage(message, apiKey = null) {
    this.init();
    const stats = this.getStats();
    const expenses = this.getExpenses({ limit: 50 });
    const categories = this.getCategories();

    // If custom API key provided, attempt Gemini API directly
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are Apex Financial Agent, an intelligent personal finance AI.
User Financial Summary:
- 30-Day Total Spending: $${stats.spent_30d} (vs prior $${stats.spent_prev_30d}, ${stats.monthly_diff_pct}% change)
- 7-Day Spending: $${stats.spent_7d}
- Daily Average: $${stats.daily_average_30d}
- Top Category: ${stats.top_category} ($${stats.top_category_amount})
- Overall Budget Used: ${stats.overall_budget_percentage}%
Recent Transactions: ${JSON.stringify(expenses.slice(0, 8).map(e => ({ t: e.title, c: e.category, a: e.amount, d: e.date.slice(0,10) })))}

User Query: "${message}"

Give a concise, actionable, and formatted financial advisory response using markdown bullet points and bold amounts.`
                }]
              }]
            })
          }
        );
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const replyText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return {
              reply: replyText,
              suggested_actions: [
                "Review category limits",
                "Show breakdown for top merchant",
                "How to save 15% next month?"
              ]
            };
          }
        }
      } catch (err) {
        console.warn('Direct Gemini call fallback:', err);
      }
    }

    // High quality conversational heuristics engine based on actual live data
    const q = message.toLowerCase();
    let reply = '';
    const suggested = [];

    if (q.includes('week') || q.includes('7 day') || q.includes('recent')) {
      reply = `### 📅 7-Day Spending Analysis\n\n` +
        `Over the past week, you spent **$${stats.spent_7d}**.\n\n` +
        `- **Trend:** ${stats.weekly_diff_pct >= 0 ? '📈 Up' : '📉 Down'} **${Math.abs(stats.weekly_diff_pct)}%** compared to the prior 7 days ($${stats.spent_prev_7d}).\n` +
        `- **Daily Pace:** Averaging **$${Math.round((stats.spent_7d / 7) * 100) / 100}/day**.\n` +
        `- **Top Category:** **${stats.top_category}** represents the bulk of recent volume.\n\n` +
        `💡 *Recommendation:* Keeping your discretionary dining & shopping under $40/day for the next 3 days will return your weekly trend to target.`;
      suggested.push("Which categories are over budget?", "Show monthly spending overview", "What are my highest expenses?");
    } else if (q.includes('over budget') || q.includes('limit') || q.includes('budget')) {
      const overList = stats.category_budgets.filter(b => b.is_over_budget);
      if (overList.length > 0) {
        reply = `### ⚠️ Budget Alert: Over-Limit Categories\n\n` +
          `You have **${overList.length} categories** exceeding their 30-day thresholds:\n\n` +
          overList.map(b => `- **${b.category}:** Spent **$${b.spent_30d}** of **$${b.monthly_limit}** limit (**${b.percentage_used}%** utilized)`).join('\n') +
          `\n\n💡 *Action Plan:* Consider pausing optional purchases in **${overList[0].category}** for the remainder of this cycle.`;
      } else {
        reply = `### ✅ Great Financial Health!\n\n` +
          `None of your categories are currently over their 30-day budget limits. You have utilized **${stats.overall_budget_percentage}%** of your total monthly budget.\n\n` +
          `- **Highest utilization:** **${stats.top_category}** at $${stats.top_category_amount}.\n` +
          `- **Total 30-day spending:** **$${stats.spent_30d}**.`;
      }
      suggested.push("How much did I spend this week?", "Show monthly spending overview", "How to cut grocery & dining costs?");
    } else if (q.includes('highest') || q.includes('top') || q.includes('big') || q.includes('expensive')) {
      const sorted = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
      reply = `### 💎 Top 5 Largest Recorded Expenses\n\n` +
        sorted.map((e, idx) => `${idx + 1}. **${e.title}** (${e.category}) — **$${e.amount}** at *${e.merchant}* on ${new Date(e.date).toLocaleDateString()}`).join('\n') +
        `\n\n💡 *Note:* Fixed recurring costs like rent or utilities represent major single entries, while high-frequency dining transactions add up quickly.`;
      suggested.push("How much did I spend this week?", "Which categories are over budget?", "How to cut grocery & dining costs?");
    } else if (q.includes('cut') || q.includes('save') || q.includes('reduce') || q.includes('grocer') || q.includes('dining')) {
      reply = `### 💡 3 Tactical Ways to Optimize Spending\n\n` +
        `1. **Dining Consolidation:** Replace 2 takeout orders/week ($36+) with prepared batch meals to save **~$150/month**.\n` +
        `2. **Subscription Audit:** Review recurring plans in your **Subscriptions** category ($${stats.category_budgets.find(c => c.category === 'Subscriptions')?.spent_30d || '45'}) to cancel unused services.\n` +
        `3. **Bulk Staple Purchasing:** Leverage warehouse pricing for pantry items in **Groceries** to trim unit prices by 15-20%.\n\n` +
        `Estimated monthly savings potential: **$240 – $320**.`;
      suggested.push("Show monthly spending overview", "How much did I spend this week?", "Which categories are over budget?");
    } else {
      reply = `### 📊 Monthly Financial Intelligence Overview\n\n` +
        `Here is your live financial snapshot:\n\n` +
        `- **30-Day Spending:** **$${stats.spent_30d}** (${stats.monthly_diff_pct >= 0 ? '+' : ''}${stats.monthly_diff_pct}% vs prior cycle)\n` +
        `- **Daily Average:** **$${stats.daily_average_30d}/day**\n` +
        `- **Primary Expense Category:** **${stats.top_category}** ($${stats.top_category_amount})\n` +
        `- **Total Transactions Tracked:** **${stats.total_transactions}**\n\n` +
        `What area would you like to explore deeper?`;
      suggested.push("How much did I spend this week?", "Which categories are over budget?", "What are my highest expenses?");
    }

    return {
      reply,
      suggested_actions: suggested
    };
  }

  getChatHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT) || '[]');
  }

  saveChatMessage(message) {
    const history = this.getChatHistory();
    history.push(message);
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(history.slice(-30)));
  }

  clearChatHistory() {
    localStorage.removeItem(STORAGE_KEYS.CHAT);
    return { success: true };
  }
}

export const mockStore = new InBrowserStore();
