import React, { useState } from 'react';
import { Plus, Search, Calendar, CreditCard, Edit2, Trash2, X, Filter } from 'lucide-react';
import { api } from '../api/client';

export default function ExpenseHistory({ expenses, categories, products, onExpenseChange, onOpenAddExpense }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');

  // Edit Expense State
  const [editingExpense, setEditingExpense] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    amount: '',
    quantity: 1,
    unit_price: '',
    payment_method: 'Credit Card',
    merchant: '',
    notes: '',
    date: ''
  });

  const openEdit = (exp) => {
    setEditingExpense(exp);
    setEditFormData({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      quantity: exp.quantity || 1,
      unit_price: exp.unit_price || exp.amount,
      payment_method: exp.payment_method || 'Credit Card',
      merchant: exp.merchant || '',
      notes: exp.notes || '',
      date: exp.date ? exp.date.substring(0, 10) : ''
    });
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete expense record "${title}"?`)) {
      try {
        await api.deleteExpense(id);
        onExpenseChange();
      } catch (err) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      const payload = {
        ...editFormData,
        amount: parseFloat(editFormData.amount),
        quantity: parseFloat(editFormData.quantity) || 1,
        unit_price: parseFloat(editFormData.unit_price) || parseFloat(editFormData.amount)
      };
      if (editFormData.date) {
        payload.date = new Date(editFormData.date).toISOString();
      }
      await api.updateExpense(editingExpense.id, payload);
      setEditingExpense(null);
      onExpenseChange();
    } catch (err) {
      alert(err.message || 'Failed to update expense');
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase()) ||
      (exp.merchant && exp.merchant.toLowerCase().includes(search.toLowerCase())) ||
      (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass-panel">
      {/* Header & Controls */}
      <div className="toolbar-section">
        <div>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={22} color="var(--accent-secondary)" />
            Spending History & Ledger
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Viewing {filteredExpenses.length} transactions recorded in your dataset.
          </p>
        </div>

        <button id="add-expense-btn" className="btn btn-primary" onClick={onOpenAddExpense}>
          <Plus size={18} /> Record New Expense
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
        <div className="search-box">
          <Search size={18} color="var(--text-dim)" />
          <input
            id="expense-search-input"
            type="text"
            className="search-input"
            placeholder="Search by title, merchant, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            id="expense-category-filter"
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id || c.category} value={c.category}>{c.category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="custom-table-wrap" style={{ marginTop: '1rem' }}>
        <table className="custom-table" id="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense Title</th>
              <th>Category</th>
              <th>Merchant</th>
              <th>Method</th>
              <th>Qty</th>
              <th>Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                  No expenses found matching current filters.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => {
                const dateStr = exp.date ? new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                return (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {dateStr}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{exp.title}</div>
                      {exp.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{exp.notes}</div>
                      )}
                    </td>
                    <td>
                      <span className="tag-badge" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {exp.merchant || '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CreditCard size={13} /> {exp.payment_method}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {exp.quantity > 1 ? exp.quantity : '1'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          title="Edit Expense"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(exp)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          title="Delete Expense"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(exp.id, exp.title)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="modal-overlay" onClick={() => setEditingExpense(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Expense Record</h3>
              <button onClick={() => setEditingExpense(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Expense Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c.id || c.category} value={c.category}>{c.category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Total Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    required
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Merchant / Store</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Trader Joe's, Uber, etc."
                    value={editFormData.merchant}
                    onChange={(e) => setEditFormData({ ...editFormData, merchant: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={editFormData.payment_method}
                    onChange={(e) => setEditFormData({ ...editFormData, payment_method: e.target.value })}
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Additional context..."
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingExpense(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
