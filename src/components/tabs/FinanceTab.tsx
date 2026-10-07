"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  Calendar, 
  Tag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

type FinancialRecord = {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  amount: string | number;
  category: string;
  description: string;
  date: string;
  created_at: string;
};

type FinanceSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
};

const EXPENSE_CATEGORIES = [
  'Makanan & Minuman 🍔',
  'Transportasi & Bensin 🛵',
  'Belanja Kebutuhan 🛒',
  'Tagihan & Utilitas 💡',
  'Hiburan & Refreshing 🎮',
  'Kesehatan & Medis 💊',
  'Pendidikan & Kursus 📚',
  'Lain-lain ✨',
];

const INCOME_CATEGORIES = [
  'Gaji & Upah 💼',
  'Bisnis & Penjualan 🛍️',
  'Freelance / Proyek 💻',
  'Investasi & Dividen 📈',
  'Hadiah & Bonus 🎁',
  'Lain-lain ✨',
];

export default function FinanceTab() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({ totalIncome: 0, totalExpense: 0, balance: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchFinances = useCallback(async () => {
    try {
      setLoading(true);
      const url = activeFilter === 'all' ? '/api/finance' : `/api/finance?type=${activeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setRecords(data.records || []);
        setSummary(data.summary || { totalIncome: 0, totalExpense: 0, balance: 0, count: 0 });
      }
    } catch (err) {
      console.error('Fetch finance error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  // Handle Type Change in Form
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numericAmount || numericAmount <= 0) {
      setMessage({ text: 'Masukkan nominal yang valid', type: 'error' });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          category,
          description,
          date,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Catatan keuangan tersimpan!', type: 'success' });
        setAmount('');
        setDescription('');
        setShowAddForm(false);
        fetchFinances();
      } else {
        setMessage({ text: data.error || 'Gagal menyimpan catatan', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan jaringan', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus catatan keuangan ini?')) return;
    try {
      const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords(prev => prev.filter(r => r.id !== id));
        fetchFinances();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Tab Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={24} style={{ color: 'var(--accent)' }} /> Catatan Keuangan
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Kelola pemasukan dan pengeluaran harian Anda dengan rapi
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 18px',
            backgroundColor: showAddForm ? '#f1f1ef' : 'var(--accent)',
            color: showAddForm ? 'var(--foreground)' : 'white',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showAddForm ? 'Tutup Formulir' : (
            <>
              <PlusCircle size={18} /> Tambah Transaksi
            </>
          )}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Saldo */}
        <div style={{
          padding: '18px',
          borderRadius: '12px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Sisa Saldo</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: '700',
            color: summary.balance >= 0 ? 'var(--accent)' : '#dc2626',
            letterSpacing: '-0.02em',
          }}>
            {formatRupiah(summary.balance)}
          </div>
        </div>

        {/* Total Pemasukan */}
        <div style={{
          padding: '18px',
          borderRadius: '12px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Pemasukan</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#16a34a' }}>
            {formatRupiah(summary.totalIncome)}
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div style={{
          padding: '18px',
          borderRadius: '12px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Pengeluaran</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#dc2626' }}>
            {formatRupiah(summary.totalExpense)}
          </div>
        </div>
      </div>

      {/* Add Transaction Form Modal/Card */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: 'var(--foreground)' }}>
            Catat Transaksi Baru
          </h3>

          <form onSubmit={handleAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Type selector */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: type === 'expense' ? '2px solid #dc2626' : '1px solid var(--border)',
                  backgroundColor: type === 'expense' ? '#fee2e2' : 'transparent',
                  color: type === 'expense' ? '#991b1b' : 'var(--text-muted)',
                }}
              >
                <TrendingDown size={18} /> Pengeluaran
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: type === 'income' ? '2px solid #16a34a' : '1px solid var(--border)',
                  backgroundColor: type === 'income' ? '#dcfce7' : 'transparent',
                  color: type === 'income' ? '#166534' : 'var(--text-muted)',
                }}
              >
                <TrendingUp size={18} /> Pemasukan
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Amount Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Nominal (Rp)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Contoh: 50000"
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 42px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
              </div>

              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    fontSize: '0.95rem',
                    color: 'var(--foreground)',
                  }}
                >
                  {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    fontSize: '0.95rem',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                Keterangan / Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Contoh: Makan siang nasi padang bersama teman"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  fontSize: '0.95rem',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '12px 18px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            backgroundColor: activeFilter === 'all' ? 'var(--primary)' : 'var(--card-bg)',
            color: activeFilter === 'all' ? 'white' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Semua ({summary.count})
        </button>
        <button
          onClick={() => setActiveFilter('income')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            backgroundColor: activeFilter === 'income' ? '#16a34a' : 'var(--card-bg)',
            color: activeFilter === 'income' ? 'white' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Pemasukan
        </button>
        <button
          onClick={() => setActiveFilter('expense')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            backgroundColor: activeFilter === 'expense' ? '#dc2626' : 'var(--card-bg)',
            color: activeFilter === 'expense' ? 'white' : 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Pengeluaran
        </button>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Memuat catatan keuangan...
        </div>
      ) : records.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '12px' }}>
            <Wallet size={24} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Belum Ada Catatan Keuangan</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Mulai catat pengeluaran dan pemasukan untuk memantau keuangan Anda.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            + Tambah Catatan Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {records.map(rec => {
            const isIncome = rec.type === 'income';
            return (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isIncome ? '#dcfce7' : '#fee2e2',
                    color: isIncome ? '#16a34a' : '#dc2626',
                    flexShrink: 0,
                  }}>
                    {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--foreground)' }}>
                      {rec.category}
                    </div>
                    {rec.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {rec.description}
                      </p>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      📅 {new Date(rec.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    color: isIncome ? '#16a34a' : '#dc2626',
                    textAlign: 'right',
                  }}>
                    {isIncome ? '+' : '-'}{formatRupiah(rec.amount)}
                  </div>

                  <button
                    onClick={() => handleDelete(rec.id)}
                    title="Hapus catatan"
                    style={{
                      padding: '6px',
                      color: 'var(--text-muted)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
