import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { api } from '../api/client';

export default function AddExpenseModal({ isOpen, onClose, categories, products, preselectedProduct, onSuccess }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.category || 'Groceries');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProductId(preselectedProduct.id);
      setTitle(preselectedProduct.name);
      setCategory(preselectedProduct.category);
      setUnitPrice(preselectedProduct.default_price);
      setAmount((preselectedProduct.default_price * quantity).toFixed(2));
    }
  }, [preselectedProduct]);

  if (!isOpen) return null;

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    if (!productId) return;
    const prod = products.find(p => p.id === parseInt(productId));
    if (prod) {
      setTitle(prod.name);
      setCategory(prod.category);
      setUnitPrice(prod.default_price);
      setAmount((prod.default_price * quantity).toFixed(2));
    }
  };

  const handleQuantityChange = (qty) => {
    const q = parseFloat(qty) || 1;
    setQuantity(q);
    if (unitPrice) {
      setAmount((parseFloat(unitPrice) * q).toFixed(2));
    }
  };

  const handleUnitPriceChange = (price) => {
    setUnitPrice(price);
    const p = parseFloat(price) || 0;
    setAmount((p * quantity).toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      alert('Please provide title and amount');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        category,
        amount: parseFloat(amount),
        quantity: parseFloat(quantity) || 1,
        unit_price: parseFloat(unitPrice) || parseFloat(amount),
        payment_method: paymentMethod,
        merchant: merchant.trim() || null,
        notes: notes.trim() || null,
        product_id: selectedProductId ? parseInt(selectedProductId) : null,
        date: date ? new Date(date).toISOString() : new Date().toISOString()
      };

      await api.createExpense(payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to record expense');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" />
            Record New Spending
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick Select from Products */}
          <div className="form-group">
            <label className="form-label">Pick from Product Catalog (Optional)</label>
            <select
              id="expense-product-picker"
              className="form-select"
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
            >
              <option value="">— Or type custom expense below —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.default_price.toFixed(2)} / {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Title *</label>
            <input
              id="expense-modal-title"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Weekly Grocery Run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                id="expense-modal-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id || c.category} value={c.category}>{c.category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Amount ($) *</label>
              <input
                id="expense-modal-amount"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                required
                placeholder="25.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                step="1"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="Unit price"
                value={unitPrice}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Merchant / Store</label>
              <input
                id="expense-modal-merchant"
                type="text"
                className="form-input"
                placeholder="Store or Vendor name"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="Tag, purpose, or location..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="expense-modal-submit-btn" type="submit" className="btn btn-primary">
              Log Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
