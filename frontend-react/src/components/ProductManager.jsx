import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Star, Tag, History, Check, X, ShoppingCart } from 'lucide-react';
import { api } from '../api/client';

export default function ProductManager({ products, categories, onProductChange, onQuickLogExpense }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Detail Modal State
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0]?.category || 'Groceries',
    default_price: '',
    unit: 'item',
    description: '',
    barcode: '',
    is_favorite: false
  });

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.category || 'Groceries',
      default_price: '',
      unit: 'item',
      description: '',
      barcode: '',
      is_favorite: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      default_price: product.default_price,
      unit: product.unit || 'item',
      description: product.description || '',
      barcode: product.barcode || '',
      is_favorite: product.is_favorite || false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${name}" from your product catalog?`)) {
      try {
        await api.deleteProduct(id);
        onProductChange();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  const handleToggleFavorite = async (product, e) => {
    e.stopPropagation();
    try {
      await api.updateProduct(product.id, { is_favorite: !product.is_favorite });
      onProductChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.default_price) {
      alert('Please fill in product name and price');
      return;
    }

    try {
      const payload = {
        ...formData,
        default_price: parseFloat(formData.default_price)
      };

      if (isEditing && currentProduct) {
        await api.updateProduct(currentProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setIsModalOpen(false);
      onProductChange();
    } catch (err) {
      alert(err.message || 'Error saving product');
    }
  };

  const viewProductDetails = async (product) => {
    setIsLoadingDetail(true);
    try {
      const details = await api.getProductDetails(product.id);
      setSelectedProductDetail(details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Filter & Sort Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.includes(search));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesFavorite = !favoriteOnly || p.is_favorite;
    return matchesSearch && matchesCategory && matchesFavorite;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.default_price - b.default_price;
    if (sortBy === 'price_desc') return b.default_price - a.default_price;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="glass-panel">
      {/* Header & Controls */}
      <div className="toolbar-section">
        <div>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Tag size={22} color="var(--accent-primary)" />
            Product Catalog & Item Tracking
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage recurring products, standard prices, and view spending history per product.
          </p>
        </div>

        <button id="add-product-btn" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="toolbar-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
        <div className="search-box">
          <Search size={18} color="var(--text-dim)" />
          <input
            id="product-search-input"
            type="text"
            className="search-input"
            placeholder="Search products by name or barcode..."
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
            id="product-category-filter"
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id || c.category} value={c.category}>{c.category}</option>
            ))}
          </select>

          <select
            id="product-sort-select"
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <button
            id="product-favorite-filter-btn"
            className={`btn btn-secondary btn-sm ${favoriteOnly ? 'btn-primary' : ''}`}
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Star size={15} fill={favoriteOnly ? '#fff' : 'none'} />
            Favorites
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="custom-table-wrap" style={{ marginTop: '1rem' }}>
        <table className="custom-table" id="products-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Fav</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Standard Price</th>
              <th>Unit</th>
              <th>Barcode / SKU</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr 
                  key={p.id} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => viewProductDetails(p)}
                >
                  <td onClick={(e) => handleToggleFavorite(p, e)}>
                    <Star
                      size={18}
                      color={p.is_favorite ? 'var(--accent-amber)' : 'var(--text-dim)'}
                      fill={p.is_favorite ? 'var(--accent-amber)' : 'none'}
                      style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{p.description}</div>
                    )}
                  </td>
                  <td>
                    <span className="tag-badge" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                    ${p.default_price.toFixed(2)}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {p.unit}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {p.barcode || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        title="Log Expense"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickLogExpense(p);
                        }}
                      >
                        <ShoppingCart size={14} color="var(--accent-secondary)" />
                      </button>
                      <button
                        title="Edit Product"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => openEditModal(p, e)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        title="Delete Product"
                        className="btn btn-danger btn-sm"
                        onClick={(e) => handleDelete(p.id, p.name, e)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  id="product-modal-name"
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Organic Almond Milk"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    id="product-modal-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c.id || c.category} value={c.category}>{c.category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Price ($) *</label>
                  <input
                    id="product-modal-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    required
                    placeholder="4.99"
                    value={formData.default_price}
                    onChange={(e) => setFormData({ ...formData, default_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Unit of Measure</label>
                  <input
                    id="product-modal-unit"
                    type="text"
                    className="form-input"
                    placeholder="e.g. bottle, item, kg, pack"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Barcode / SKU</label>
                  <input
                    id="product-modal-barcode"
                    type="text"
                    className="form-input"
                    placeholder="Optional barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Brand</label>
                <textarea
                  id="product-modal-description"
                  className="form-textarea"
                  rows="2"
                  placeholder="Brand, size, or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input
                  type="checkbox"
                  id="product-modal-fav"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                />
                <label htmlFor="product-modal-fav" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Mark as Favorite / Regularly Purchased Item
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button id="product-modal-submit-btn" type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail & Price History Modal */}
      {selectedProductDetail && (
        <div className="modal-overlay" onClick={() => setSelectedProductDetail(null)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selectedProductDetail.product.name}
                </h3>
                <span className="tag-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  {selectedProductDetail.product.category}
                </span>
              </div>
              <button onClick={() => setSelectedProductDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Quick Stats for Product */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid var(--border-glass)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Times Bought</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{selectedProductDetail.total_times_bought}</div>
              </div>
              <div style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid var(--border-glass)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Spent</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>${selectedProductDetail.total_amount_spent.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid var(--border-glass)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Avg Unit Price</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>${selectedProductDetail.average_unit_price.toFixed(2)}</div>
              </div>
            </div>

            {/* Price History List */}
            <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              <History size={16} color="var(--accent-primary)" />
              Recent Purchase & Price History
            </h4>

            {selectedProductDetail.price_history && selectedProductDetail.price_history.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedProductDetail.price_history.map((hist, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(241, 245, 249, 0.7)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{hist.date} • {hist.merchant || 'Store'}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>${hist.unit_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No purchase history recorded yet for this product.</p>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const p = selectedProductDetail.product;
                  setSelectedProductDetail(null);
                  onQuickLogExpense(p);
                }}
              >
                <ShoppingCart size={15} /> Log New Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
