import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Calendar, ShoppingBag, 
  Bot, RefreshCw, Plus, Tag, ArrowUpRight, ArrowDownRight, Layers, CheckCircle,
  Sun, Moon
} from 'lucide-react';
import { api } from './api/client';
import SpendingChart from './components/SpendingChart';
import ProductManager from './components/ProductManager';
import ExpenseHistory from './components/ExpenseHistory';
import ChatbotDrawer from './components/ChatbotDrawer';
import AddExpenseModal from './components/AddExpenseModal';

export default function App() {
  const [theme, setTheme] = useState('light'); // Default: Light theme minimalism
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'expenses' | 'ai-chat'
  const [historyPeriod, setHistoryPeriod] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'

  // Data states
  const [stats, setStats] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [preselectedProduct, setPreselectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState('');

  const handleAskAdvisor = (prompt) => {
    setInitialChatPrompt(prompt);
    setActiveTab('ai-chat');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    loadHistory(historyPeriod);
  }, [historyPeriod]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, histRes, prodsRes, expsRes, catsRes] = await Promise.all([
        api.getStats(),
        api.getHistory(historyPeriod),
        api.getProducts(),
        api.getExpenses({ limit: 150 }),
        api.getCategories()
      ]);
      setStats(statsRes);
      setHistoryData(histRes);
      setProducts(prodsRes);
      setExpenses(expsRes);
      setCategories(catsRes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async (period) => {
    try {
      const hist = await api.getHistory(period);
      setHistoryData(hist);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleRefresh = async () => {
    await loadAllData();
    showNotify('Data refreshed from live database');
  };

  const handleReseed = async () => {
    if (window.confirm('Reset database and re-seed 500+ realistic expenses and products across 6 months?')) {
      try {
        await api.reseedDatabase();
        await loadAllData();
        showNotify('Successfully re-seeded 500+ realistic expense transactions!');
      } catch (err) {
        alert(err.message || 'Failed to re-seed');
      }
    }
  };

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleQuickLogExpense = (product) => {
    setPreselectedProduct(product);
    setIsAddExpenseOpen(true);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'modalIn 0.2s ease-out'
        }}>
          <CheckCircle size={18} />
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon-wrap">
              <DollarSign size={24} color="#fff" />
            </div>
            <div className="logo-text">
              <h1>Apex Expense AI</h1>
              <span className="logo-badge">AGENTIC FINANCIAL LAB</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              id="nav-tab-overview"
              className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <TrendingUp size={16} /> Overview
            </button>

            <button
              id="nav-tab-products"
              className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Tag size={16} /> Products ({products.length})
            </button>

            <button
              id="nav-tab-expenses"
              className={`nav-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              <Calendar size={16} /> Spendings ({stats?.total_transactions || expenses.length})
            </button>

            <button
              id="nav-tab-ai-chat"
              className={`nav-tab-btn ${activeTab === 'ai-chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-chat')}
            >
              <Bot size={16} /> AI Advisor
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions">
            <button
              id="btn-toggle-theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="btn btn-secondary btn-sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {theme === 'light' ? <Moon size={15} color="#475569" /> : <Sun size={15} color="#f59e0b" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>

            <button
              id="btn-reseed-data"
              title="Reseed 500+ records"
              className="btn btn-secondary btn-sm"
              onClick={handleReseed}
            >
              <RefreshCw size={14} /> Reseed Dataset
            </button>

            <button
              id="btn-header-add-expense"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setPreselectedProduct(null);
                setIsAddExpenseOpen(true);
              }}
            >
              <Plus size={16} /> Log Expense
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* KPI Metrics Banner */}
        {stats && (
          <div className="stats-grid">
            {/* Today */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-title">Today's Spending</span>
                <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <DollarSign size={18} color="var(--accent-primary)" />
                </div>
              </div>
              <div className="stat-value">${stats.today_spend.toFixed(2)}</div>
              <div className="stat-meta">
                <span>Avg Daily Burn: <strong>${stats.daily_average_30d.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Past 7 Days */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-title">Past 7 Days (Weekly)</span>
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                  <TrendingUp size={18} color="var(--accent-secondary)" />
                </div>
              </div>
              <div className="stat-value">${stats.spent_7d.toFixed(2)}</div>
              <div className="stat-meta">
                {stats.weekly_diff_pct > 0 ? (
                  <span className="badge-trend-up">
                    <ArrowUpRight size={13} style={{ display: 'inline' }} /> +{stats.weekly_diff_pct}%
                  </span>
                ) : (
                  <span className="badge-trend-down">
                    <ArrowDownRight size={13} style={{ display: 'inline' }} /> {stats.weekly_diff_pct}%
                  </span>
                )}
                <span>vs previous week</span>
              </div>
            </div>

            {/* Past 30 Days */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-title">Past 30 Days (Monthly)</span>
                <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
                  <Calendar size={18} color="var(--accent-rose)" />
                </div>
              </div>
              <div className="stat-value">${stats.spent_30d.toFixed(2)}</div>
              <div className="stat-meta">
                <span>Top Category: <strong>{stats.top_category}</strong> (${stats.top_category_amount})</span>
              </div>
            </div>

            {/* Total Dataset Volume */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-title">All-Time Recorded</span>
                <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
                  <Layers size={18} color="var(--accent-cyan)" />
                </div>
              </div>
              <div className="stat-value">${stats.total_spend.toLocaleString()}</div>
              <div className="stat-meta">
                <span>{stats.total_transactions} transactions • {products.length} products</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Overview & Multi-Timeframe Analytics */}
        {activeTab === 'overview' && (
          <div className="dashboard-grid">
            {/* Left Primary Column (65%): Chart + Recent Spendings */}
            <div className="dashboard-main-col">
              <SpendingChart
                historyData={historyData}
                period={historyPeriod}
                onPeriodChange={setHistoryPeriod}
              />

              {/* Latest Recorded Spendings */}
              <div className="glass-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>Latest Recorded Spendings</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing recent purchases from your financial ledger</p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('expenses')}>
                    View All ({stats?.total_transactions || 0})
                  </button>
                </div>

                <div className="custom-table-wrap">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Item / Title</th>
                        <th>Category</th>
                        <th>Merchant</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 8).map(exp => (
                        <tr key={exp.id}>
                          <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            {exp.date ? new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{exp.title}</td>
                          <td>
                            <span className="tag-badge" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', border: '1px solid rgba(79, 70, 229, 0.18)' }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{exp.merchant || '—'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', textAlign: 'right' }}>
                            ${exp.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column (35%): Category Breakdown + Budgets + AI Widget */}
            <div className="dashboard-sidebar-col">
              {/* Category Breakdown Card */}
              {historyData && historyData.category_breakdown && (
                <div className="glass-panel">
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    <Layers size={18} color="var(--accent-secondary)" />
                    Category Breakdown
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Top spending distribution in this period
                  </p>

                  <div className="category-list">
                    {historyData.category_breakdown.slice(0, 6).map((cat, idx) => {
                      const colors = ['#4f46e5', '#059669', '#d97706', '#e11d48', '#0284c7', '#7c3aed'];
                      const color = colors[idx % colors.length];
                      const pct = Math.round((cat.total / (historyData.total_spent || 1)) * 100);

                      return (
                        <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                              {cat.category}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              ${cat.total.toLocaleString()} <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>({pct}%)</span>
                            </span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: 'rgba(226, 232, 240, 0.7)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* AI Advisor Prompt Box */}
              <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(236, 72, 153, 0.03))', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={18} color="#fff" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Apex AI Financial Advisor</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Real-Time Autonomous Agent</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Instant financial intelligence on velocity trends, budget health, and savings.
                </p>

                {/* Quick Interactive Prompt Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.9rem' }}>
                  {[
                    "How much did I spend this week?",
                    "Which categories are over budget?",
                    "What are my highest expenses?"
                  ].map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      className="btn btn-secondary btn-sm"
                      style={{ 
                        textAlign: 'left', 
                        fontSize: '0.78rem', 
                        justifyContent: 'flex-start',
                        padding: '0.45rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(79, 70, 229, 0.15)',
                        color: 'var(--text-main)'
                      }}
                      onClick={() => handleAskAdvisor(prompt)}
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>

                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%' }}
                  onClick={() => setActiveTab('ai-chat')}
                >
                  <Bot size={15} /> Open Full AI Advisor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Manager (CRUD) */}
        {activeTab === 'products' && (
          <ProductManager
            products={products}
            categories={categories}
            onProductChange={loadAllData}
            onQuickLogExpense={handleQuickLogExpense}
          />
        )}

        {/* Tab 3: Spending History (Full Ledger & CRUD) */}
        {activeTab === 'expenses' && (
          <ExpenseHistory
            expenses={expenses}
            categories={categories}
            products={products}
            onExpenseChange={loadAllData}
            onOpenAddExpense={() => {
              setPreselectedProduct(null);
              setIsAddExpenseOpen(true);
            }}
          />
        )}

        {/* Tab 4: AI Financial Advisor Chatbot */}
        {activeTab === 'ai-chat' && (
          <ChatbotDrawer 
            initialPrompt={initialChatPrompt}
            onPromptHandled={() => setInitialChatPrompt('')}
          />
        )}
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        products={products}
        preselectedProduct={preselectedProduct}
        onSuccess={() => {
          loadAllData();
          showNotify('Expense logged successfully!');
        }}
      />
    </div>
  );
}
