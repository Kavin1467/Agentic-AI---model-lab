import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function SpendingChart({ historyData, period, onPeriodChange }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!historyData || !historyData.timeline || historyData.timeline.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-dim)' }}>No spending data recorded for this timeframe.</p>
      </div>
    );
  }

  const timeline = historyData.timeline;
  const maxTotal = Math.max(...timeline.map(t => t.total), 1);
  const gridSteps = [1.0, 0.66, 0.33];

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      {/* Header & Timeframe Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <TrendingUp size={20} color="var(--accent-primary)" />
            Spending Velocity & Trends
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Total in period: <strong style={{ color: 'var(--text-main)' }}>${historyData.total_spent.toLocaleString()}</strong> ({historyData.total_transactions} transactions)
          </p>
        </div>

        {/* Timeframe Controls */}
        <div className="pill-group">
          <button
            id="period-daily-btn"
            className={`pill-btn ${period === 'daily' ? 'active' : ''}`}
            onClick={() => onPeriodChange('daily')}
          >
            Last 14 Days
          </button>
          <button
            id="period-weekly-btn"
            className={`pill-btn ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => onPeriodChange('weekly')}
          >
            Last 8 Weeks
          </button>
          <button
            id="period-monthly-btn"
            className={`pill-btn ${period === 'monthly' ? 'active' : ''}`}
            onClick={() => onPeriodChange('monthly')}
          >
            Last 6 Months
          </button>
        </div>
      </div>

      {/* Chart Canvas with Y-Axis Gridlines */}
      <div style={{ position: 'relative', height: '260px', padding: '1rem 0.5rem 0.25rem 2.8rem' }}>
        {/* Background Gridlines & Labels */}
        <div style={{ position: 'absolute', inset: '1rem 0 2rem 0', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {gridSteps.map((step, idx) => {
            const val = Math.round(maxTotal * step);
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                <span style={{ width: '2.5rem', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </span>
                <div style={{ flex: 1, borderTop: '1px dashed rgba(226, 232, 240, 0.7)' }} />
              </div>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
            <span style={{ width: '2.5rem', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              $0
            </span>
            <div style={{ flex: 1, borderTop: '1px solid var(--border-glass)' }} />
          </div>
        </div>

        {/* Bars Container */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px', zIndex: 1 }}>
          {timeline.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.total / maxTotal) * 85));
            const isHovered = hoveredIndex === idx;

            return (
              <div 
                key={item.key || idx} 
                className="chart-bar-col"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="chart-tooltip">
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>${item.total.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.count} items recorded</div>
                    {item.top_expense && (
                      <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2px' }}>
                        Top: {item.top_expense.title} (${item.top_expense.amount.toFixed(2)})
                      </div>
                    )}
                  </div>
                )}

                {/* Bar Element */}
                <div 
                  className="chart-bar"
                  style={{
                    height: `${heightPercent}%`,
                    width: '100%',
                    maxWidth: timeline.length > 10 ? '36px' : '52px',
                    borderRadius: '8px 8px 2px 2px',
                    background: isHovered 
                      ? 'linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)' 
                      : 'linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.28) 100%)',
                    boxShadow: isHovered ? '0 6px 20px rgba(79, 70, 229, 0.35)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                <span className="chart-label" style={{ fontSize: '0.72rem', color: isHovered ? 'var(--accent-primary)' : 'var(--text-dim)', fontWeight: isHovered ? 700 : 500 }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
