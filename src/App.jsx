import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownLeft, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, CreditCard, Download,
  Ellipsis, Filter, LayoutDashboard, Menu, MoreHorizontal, Pencil, Plus, RefreshCcw,
  Search, Settings2, ShieldCheck, Sparkles, Trash2, TrendingUp, Wallet, X,
  Utensils, Bus, ShoppingBag, Receipt, HeartPulse, Clapperboard, Tag, Banknote
} from 'lucide-react';
import './App.css';

const STORAGE_KEY = 'finora_syntecxhub_expenses_v1';
const CATEGORIES = ['Food & Drinks', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];
const CATEGORY_DETAILS = {
  'Food & Drinks': { color: '#8c6ff2', icon: Utensils },
  Transport: { color: '#51b2d9', icon: Bus },
  Shopping: { color: '#eea35e', icon: ShoppingBag },
  Bills: { color: '#e881a8', icon: Receipt },
  Health: { color: '#61bf9f', icon: HeartPulse },
  Entertainment: { color: '#c592d9', icon: Clapperboard },
  Other: { color: '#8993a9', icon: Tag },
  Income: { color: '#40b68c', icon: Banknote }
};
const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'insights', label: 'Insights & reports', icon: BarChart3 }
];

function todayString() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}
function getDateDaysAgo(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - Number(daysAgo));
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
function money(amount) { return `Rs ${Math.round(Number(amount) || 0).toLocaleString('en-PK')}`; }
function readableDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function initialForm() {
  return { title: '', amount: '', type: 'expense', category: 'Food & Drinks', date: todayString(), note: '' };
}
function cachedTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const value = JSON.parse(stored);
    return Array.isArray(value) ? value : null;
  } catch { return null; }
}
function asDemoTransactions(rows) {
  return rows.map(({ daysAgo, ...rest }) => ({ ...rest, date: getDateDaysAgo(daysAgo) }));
}
function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function sortedByDate(list) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function StatCard({ label, amount, icon: Icon, type, info }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} strokeWidth={2.2} /></span></div>
      <div className="stat-money">{money(amount)}</div>
      <div className="stat-foot">{info}</div>
    </div>
  );
}

function CategoryIcon({ category, size = 18 }) {
  const info = CATEGORY_DETAILS[category] ?? CATEGORY_DETAILS.Other;
  const Icon = info.icon;
  return <span className="category-icon" style={{ background: `${info.color}19`, color: info.color }}><Icon size={size} /></span>;
}

function TransactionsTable({ transactions, onEdit, onDelete, showAll, onShowAll }) {
  return (
    <div className="transactions-table-wrap">
      <div className="table-scroll">
        <table className="transactions-table">
          <thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th>Amount</th><th aria-label="Actions"></th></tr></thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="5" className="empty-table">No transactions found. Try changing your filters or adding one.</td></tr>
            ) : transactions.map(item => (
              <tr key={item.id}>
                <td><div className="transaction-name"><CategoryIcon category={item.category} /><span><strong>{item.title}</strong><small>{item.note || (item.type === 'income' ? 'Income' : 'Expense')}</small></span></div></td>
                <td><span className="category-tag">{item.category}</span></td>
                <td className="muted-cell">{readableDate(item.date)}</td>
                <td><strong className={item.type === 'income' ? 'amount-positive' : 'amount-negative'}>{item.type === 'income' ? '+' : '-'}{money(item.amount)}</strong></td>
                <td><div className="row-actions"><button type="button" className="icon-btn" title={`Edit ${item.title}`} aria-label={`Edit ${item.title}`} onClick={() => onEdit(item)}><Pencil size={16} /></button><button type="button" className="icon-btn delete" title={`Delete ${item.title}`} aria-label={`Delete ${item.title}`} onClick={() => onDelete(item.id)}><Trash2 size={16} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && <button className="text-button view-all" onClick={onShowAll}>View all transactions <ArrowRight size={16} /></button>}
    </div>
  );
}

function TrendChart({ data }) {
  const maxValue = Math.max(1, ...data.map(d => Math.max(d.income, d.expense)));
  return (
    <div className="trend-chart">
      <div className="trend-gridlines"><span>{money(maxValue)}</span><span>{money(maxValue * .75)}</span><span>{money(maxValue * .5)}</span><span>{money(maxValue * .25)}</span><span>Rs 0</span></div>
      <div className="trend-bars">
        {data.map(month => (
          <div className="month-group" key={month.key} title={`${month.label}: Income ${money(month.income)} · Expenses ${money(month.expense)}`}>
            <div className="month-bars"><div className="vertical-bar income-bar" style={{ height: `${Math.max(month.income > 0 ? 4 : 0, (month.income / maxValue) * 100)}%` }} /><div className="vertical-bar expense-bar" style={{ height: `${Math.max(month.expense > 0 ? 4 : 0, (month.expense / maxValue) * 100)}%` }} /></div>
            <span className="month-label">{month.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpendingCategories({ categories }) {
  const total = categories.reduce((sum, item) => sum + item.amount, 0);
  let start = 0;
  const stops = categories.map(item => {
    const end = start + item.amount / (total || 1) * 100;
    const result = `${item.color} ${start}% ${end}%`;
    start = end;
    return result;
  });
  return (
    <div className="spending-categories">
      <div className="donut-container"><div className="donut" style={{ background: total ? `conic-gradient(${stops.join(', ')})` : '#eaecf3' }}><div className="donut-center"><small>Total expenses</small><strong>{money(total)}</strong></div></div></div>
      <div className="category-legend">
        {categories.length === 0 ? <p className="empty-state">No spending in this period.</p> : categories.slice(0, 6).map(category => (
          <div className="legend-row" key={category.name}><div className="legend-name"><i style={{ background: category.color }} />{category.name}</div><strong>{Math.round(category.amount / total * 100)}%</strong></div>
        ))}
      </div>
    </div>
  );
}

function TransactionForm({ form, setForm, editingId, onClose, onSubmit, titleRef, error }) {
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
        <div className="modal-header"><div><span className="eyebrow">TRANSACTION DETAILS</span><h2 id="modal-heading">{editingId ? 'Edit transaction' : 'Add a transaction'}</h2></div><button className="icon-btn" type="button" onClick={onClose} aria-label="Close"><X size={21} /></button></div>
        <form onSubmit={onSubmit}>
          <div className="type-switch"><button type="button" className={form.type === 'expense' ? 'chosen' : ''} onClick={() => setForm(prev => ({ ...prev, type: 'expense', category: CATEGORIES.includes(prev.category) ? prev.category : 'Food & Drinks' }))}><ArrowUpRight size={17} /> Expense</button><button type="button" className={form.type === 'income' ? 'chosen income-selected' : ''} onClick={() => setForm(prev => ({ ...prev, type: 'income', category: 'Income' }))}><ArrowDownLeft size={17} /> Income</button></div>
          <div className="form-field"><label htmlFor="transaction-title">Title</label><input ref={titleRef} id="transaction-title" type="text" maxLength="60" placeholder="e.g. Coffee and breakfast" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div className="form-field"><label htmlFor="transaction-amount">Amount (PKR)</label><input id="transaction-amount" type="number" inputMode="decimal" min="0.01" step="0.01" max="999999999" placeholder="e.g. 1200" value={form.amount} onChange={e => set('amount', e.target.value)} required /></div>
          <div className="form-two-fields"><div className="form-field"><label htmlFor="transaction-category">Category</label><select id="transaction-category" disabled={form.type === 'income'} value={form.category} onChange={e => set('category', e.target.value)}>{(form.type === 'income' ? ['Income'] : CATEGORIES).map(cat => <option key={cat}>{cat}</option>)}</select></div><div className="form-field"><label htmlFor="transaction-date">Date</label><input id="transaction-date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required /></div></div>
          <div className="form-field"><label htmlFor="transaction-note">Note <span className="optional">(optional)</span></label><textarea id="transaction-note" maxLength="160" rows="3" placeholder="Add a short description" value={form.note} onChange={e => set('note', e.target.value)} /></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-footer"><button className="button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button-primary" type="submit"><Check size={17} />{editingId ? 'Save changes' : 'Add transaction'}</button></div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  // Requirement 1: useState manages form inputs and expense data.
  const [expenses, setExpenses] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState('loading');
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Requirement 2: useRef manages autofocus on the input when modal opens.
  const titleRef = useRef(null);

  // Requirement 3: useEffect fetches actual JSON data through a local mock endpoint.
  useEffect(() => {
    let cancelled = false;
    const fetchMockApi = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}mock-expenses.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Mock API status ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.expenses)) throw new Error('Invalid mock API response');
        if (cancelled) return;
        const saved = cachedTransactions();
        setExpenses(saved !== null ? saved : asDemoTransactions(data.expenses));
        setApiStatus('connected');
      } catch (error) {
        if (cancelled) return;
        setExpenses(cachedTransactions() ?? []);
        setApiStatus('offline');
        setNotice('Could not reach the mock API. Saved transactions are still available.');
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    fetchMockApi();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }
    catch { setNotice('Browser storage is disabled: changes may not persist after a refresh.'); }
  }, [expenses, loaded]);

  useEffect(() => {
    if (isFormOpen) titleRef.current?.focus();
  }, [isFormOpen]);

  useEffect(() => {
    const handleEscape = event => { if (event.key === 'Escape') setIsFormOpen(false); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Requirement 4: useMemo avoids recalculating filtered rows and statistics unnecessarily.
  const filteredExpenses = useMemo(() => {
    const now = todayString();
    const after30 = getDateDaysAgo(30);
    const after90 = getDateDaysAgo(90);
    const monthStart = `${now.slice(0, 7)}-01`;
    return sortedByDate(expenses.filter(item => {
      const matchesSearch = `${item.title} ${item.note} ${item.category}`.toLowerCase().includes(query.toLowerCase().trim());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesPeriod = period === 'all' || (period === 'month' ? item.date >= monthStart && item.date <= now : period === '30' ? item.date >= after30 && item.date <= now : item.date >= after90 && item.date <= now);
      return matchesSearch && matchesType && matchesCategory && matchesPeriod;
    }));
  }, [expenses, period, typeFilter, categoryFilter, query]);

  const totals = useMemo(() => filteredExpenses.reduce((result, item) => {
    if (item.type === 'income') result.income += Number(item.amount);
    else result.expense += Number(item.amount);
    return result;
  }, { income: 0, expense: 0 }), [filteredExpenses]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const periods = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return { key, label: date.toLocaleDateString('en-US', { month: 'short' }), income: 0, expense: 0 };
    });
    expenses.forEach(item => {
      const month = periods.find(row => item.date.startsWith(row.key));
      if (month) month[item.type] += Number(item.amount);
    });
    return periods;
  }, [expenses]);

  const categoryData = useMemo(() => {
    const map = new Map();
    filteredExpenses.filter(item => item.type === 'expense').forEach(item => map.set(item.category, (map.get(item.category) || 0) + Number(item.amount)));
    return [...map].map(([name, amount]) => ({ name, amount, color: (CATEGORY_DETAILS[name] ?? CATEGORY_DETAILS.Other).color })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // Requirement 5: useCallback memoizes functions passed to transaction child components.
  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(initialForm());
    setFormError('');
    setIsFormOpen(true);
  }, []);
  const openEdit = useCallback(item => {
    setEditingId(item.id);
    setForm({ title: item.title, amount: String(item.amount), category: item.category, type: item.type, date: item.date, note: item.note || '' });
    setFormError('');
    setIsFormOpen(true);
  }, []);
  const deleteTransaction = useCallback(id => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    setExpenses(previous => previous.filter(item => item.id !== id));
    setNotice('Transaction deleted.');
  }, []);

  const submitTransaction = event => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || amount > 999999999 || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      setFormError('Please enter a valid title, positive amount and date.');
      return;
    }
    const next = { id: editingId || makeId(), title: form.title.trim(), amount, type: form.type, category: form.type === 'income' ? 'Income' : form.category, date: form.date, note: form.note.trim() };
    setExpenses(previous => editingId ? previous.map(item => item.id === editingId ? next : item) : [next, ...previous]);
    setNotice(editingId ? 'Transaction updated successfully.' : 'Transaction added successfully.');
    setIsFormOpen(false);
  };

  const exportCsv = () => {
    const fields = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Note'];
    const rows = filteredExpenses.map(item => [item.date, item.title, item.type, item.category, item.amount, item.note]);
    const csv = [fields, ...rows].map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'finora-transactions.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('CSV export created.');
  };

  const resetDemo = async () => {
    if (!window.confirm('Replace your existing transactions with demo data?')) return;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}mock-expenses.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      if (!Array.isArray(data.expenses)) throw new Error('Invalid data');
      setExpenses(asDemoTransactions(data.expenses));
      setQuery(''); setPeriod('all'); setTypeFilter('all'); setCategoryFilter('all');
      setNotice('Demo data restored.');
      setApiStatus('connected');
    } catch { setNotice('Failed to reload demo data. Please check the local mock API.'); }
  };

  const handleTab = nextTab => { setActiveTab(nextTab); setSidebarOpen(false); };
  const isOverview = activeTab === 'overview';
  const balance = totals.income - totals.expense;

  return (
    <div className="app-shell">
      {sidebarOpen && <button type="button" className="sidebar-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-emblem"><Wallet size={23} /></div><div>finora<span>.</span><small>SMART MONEY MANAGER</small></div></div>
        <div className="menu-label">MAIN MENU</div>
        <nav aria-label="Main navigation">{TABS.map(tab => { const Icon = tab.icon; return <button key={tab.id} className={`nav-link ${activeTab === tab.id ? 'active' : ''}`} type="button" onClick={() => handleTab(tab.id)}><Icon size={19} /><span>{tab.label}</span>{activeTab === tab.id && <span className="nav-active-dot" />}</button>; })}</nav>
        <div className="sidebar-bottom"><div className="mini-guide"><div className="guide-icon"><Sparkles size={19} /></div><strong>Build better habits</strong><p>Keep all your income and expenses organised in one place.</p><button type="button" onClick={openCreate}>Add your first entry <ArrowRight size={14} /></button></div><div className="sidebar-user"><div className="avatar">S</div><div><strong>Intern Project</strong><small>Syntecxhub · Week 1</small></div><ShieldCheck size={17} className="user-badge" /></div></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="topbar-left"><button type="button" className="mobile-menu icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={23} /></button><span className="breadcrumb">Workspace</span><ChevronRight size={15} /><strong>{TABS.find(tab => tab.id === activeTab)?.label}</strong></div><div className="topbar-right"><span className={`api-pill ${apiStatus}`}><span className="status-dot" />{apiStatus === 'loading' ? 'Loading mock API' : apiStatus === 'connected' ? 'Mock API connected' : 'Offline mode'}</span><div className="top-avatar">S</div></div></header>
        <div className="page-inner">
          <section className="page-heading"><div><div className="eyebrow">YOUR FINANCIAL WORKSPACE</div><h1>{isOverview ? 'Dashboard overview' : activeTab === 'transactions' ? 'All transactions' : 'Spending insights'} <span className="heading-spark">✳</span></h1><p>{isOverview ? 'A clear view of your money, all in one place.' : activeTab === 'transactions' ? 'Find, organise and edit all of your money activity.' : 'Understand your spending patterns at a glance.'}</p></div><div className="heading-actions"><button className="button-secondary export-btn" type="button" onClick={exportCsv}><Download size={17} /> Export CSV</button><button className="button-primary" type="button" onClick={openCreate}><Plus size={18} strokeWidth={2.6} /> Add transaction</button></div></section>
          {notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={15}/></button></div>}
          <section className="filters" aria-label="Filter transactions"><div className="filter-left"><div className="filter-label"><Filter size={16} /> Filters</div><label className="select-wrap"><CalendarDays size={17} /><select aria-label="Period" value={period} onChange={event => setPeriod(event.target.value)}><option value="all">All time</option><option value="month">This month</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><ChevronDown size={15}/></label><label className="select-wrap"><select aria-label="Transaction type" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select><ChevronDown size={15}/></label>{activeTab === 'transactions' && <label className="select-wrap"><select aria-label="Category" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}><option value="all">All categories</option><option value="Income">Income</option>{CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}</select><ChevronDown size={15}/></label>}</div><label className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search transactions..." aria-label="Search transactions" /></label></section>
          <section className="summary-cards" aria-label="Financial summary"><div className="balance-card"><div className="balance-decoration deco-one" /><div className="balance-decoration deco-two" /><div className="balance-top"><span>Total balance</span><Wallet size={22} /></div><strong>{money(balance)}</strong><div className="balance-bottom"><span><span className="circle-check"><Check size={12}/></span> {filteredExpenses.length} transactions</span><span>PKR <ArrowUpRight size={14}/></span></div></div><StatCard label="Total income" amount={totals.income} type="income" icon={ArrowDownLeft} info="Money received in this period" /><StatCard label="Total expenses" amount={totals.expense} type="expenses" icon={ArrowUpRight} info="Money spent in this period" /></section>
          {(activeTab === 'overview' || activeTab === 'insights') && <section className="analytics-grid"><div className="panel"><div className="panel-heading"><div><h2>Cash flow</h2><p>Income vs expenses over the last 6 months</p></div><div className="chart-legend"><span><i className="legend-income" />Income</span><span><i className="legend-expense" />Expenses</span></div></div><TrendChart data={monthlyData}/></div><div className="panel categories-panel"><div className="panel-heading"><div><h2>Spending breakdown</h2><p>By category · selected filters</p></div><span className="panel-chip">Expenses</span></div><SpendingCategories categories={categoryData} /></div></section>}
          {activeTab === 'insights' && <section className="insight-strip"><div className="insight-tile"><span>Savings rate</span><strong>{totals.income > 0 ? `${Math.round((totals.income - totals.expense) / totals.income * 100)}%` : '—'}</strong><p>Balance as a share of income</p></div><div className="insight-tile"><span>Largest spending category</span><strong className="insight-category">{categoryData[0]?.name ?? '—'}</strong><p>{categoryData[0] ? money(categoryData[0].amount) : 'No spending recorded'}</p></div><div className="insight-tile"><span>Transactions shown</span><strong>{filteredExpenses.length}</strong><p>Matches selected filters</p></div></section>}
          {(activeTab === 'overview' || activeTab === 'transactions') && <section className="panel transactions-panel"><div className="panel-heading transactions-heading"><div><h2>{isOverview ? 'Recent transactions' : 'Transaction history'}</h2><p>{loaded ? `${filteredExpenses.length} transaction${filteredExpenses.length === 1 ? '' : 's'} match your filters` : 'Loading transaction data...'}</p></div><div className="table-heading-right">{!isOverview && <button type="button" className="reset-button" onClick={resetDemo}><RefreshCcw size={15} /> Reset demo data</button>}</div></div><TransactionsTable transactions={isOverview ? filteredExpenses.slice(0, 6) : filteredExpenses} onEdit={openEdit} onDelete={deleteTransaction} showAll={!isOverview} onShowAll={() => setActiveTab('transactions')} /></section>}
          <footer className="footer"><span>Finora · Syntecxhub Internship Project</span><span>Built with React + Vite <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>
      {isFormOpen && <TransactionForm form={form} setForm={setForm} editingId={editingId} onClose={() => setIsFormOpen(false)} onSubmit={submitTransaction} titleRef={titleRef} error={formError} />}
    </div>
  );
}
