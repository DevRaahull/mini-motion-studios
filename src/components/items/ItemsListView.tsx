import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Archive,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Item } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { exportToCsv } from '../../lib/exportUtils';
import { ItemFormModal } from './ItemFormModal';
import { StockAdjustModal } from './StockAdjustModal';

interface ItemsListViewProps {
  openCreateModal: () => void;
}

export const ItemsListView: React.FC<ItemsListViewProps> = ({ openCreateModal }) => {
  const { items, archiveOrDeleteItem } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived'>('all');

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<Item | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Item | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.category) set.add(i.category); });
    return Array.from(set);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Archived filter
      if (stockStatusFilter === 'archived') {
        if (!item.is_archived) return false;
      } else {
        if (item.is_archived) return false;

        if (stockStatusFilter === 'in_stock' && item.current_stock <= 0) return false;
        if (stockStatusFilter === 'low_stock' && (item.current_stock <= 0 || item.current_stock > item.low_stock_threshold)) return false;
        if (stockStatusFilter === 'out_of_stock' && item.current_stock > 0) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSku = item.sku?.toLowerCase().includes(q);
        const matchesCat = item.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCat) return false;
      }

      return true;
    });
  }, [items, stockStatusFilter, categoryFilter, searchQuery]);

  // Overall metrics
  const activeItems = useMemo(() => items.filter(i => !i.is_archived), [items]);
  const totalValuation = useMemo(() => {
    return activeItems.reduce((sum, i) => sum + (i.current_stock * i.purchase_rate), 0);
  }, [activeItems]);
  const lowStockCount = useMemo(() => {
    return activeItems.filter(i => i.current_stock <= i.low_stock_threshold).length;
  }, [activeItems]);

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Item Name',
      'SKU / Code',
      'Category',
      'Stock Quantity',
      'Low Stock Threshold',
      'Purchase Rate (₹)',
      'Default Sale Rate (₹)',
      'Total Asset Valuation (₹)',
      'Status'
    ];

    const rows = filteredItems.map(i => [
      i.name,
      i.sku || '',
      i.category,
      i.current_stock,
      i.low_stock_threshold,
      i.purchase_rate.toFixed(2),
      i.default_sale_rate.toFixed(2),
      (i.current_stock * i.purchase_rate).toFixed(2),
      i.is_archived ? 'Archived' : i.current_stock <= 0 ? 'Out of Stock' : i.current_stock <= i.low_stock_threshold ? 'Low Stock' : 'In Stock'
    ]);

    exportToCsv(`Inventory_Stock_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleDeleteOrArchive = async () => {
    if (!deleteConfirmation) return;
    try {
      await archiveOrDeleteItem(deleteConfirmation.id);
      setDeleteConfirmation(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45]">
        <div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
            Items & Inventory Management
          </h2>
          <p className="text-xs text-[#AAB4C5] mt-0.5">
            Manage catalogue, purchase costs, sale rates, and real-time stock balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#D6B36A] rounded-lg text-xs font-semibold shadow transition active:scale-95"
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-lg text-xs font-bold shadow-md transition active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/40 text-[#60A5FA] flex items-center justify-center shrink-0 border border-[#1E3A8A]/60">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs text-[#AAB4C5]">Active Inventory Products</p>
            <p className="text-lg font-bold text-[#F5F3EE] font-mono mt-0.5">{activeItems.length}</p>
          </div>
        </div>

        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#78350F]/40 text-[#FBBF24] flex items-center justify-center shrink-0 border border-[#78350F]/60">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-xs text-[#AAB4C5]">Low-Stock Alerts</p>
            <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">{lowStockCount} items</p>
          </div>
        </div>

        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#064E3B]/40 text-[#34D399] flex items-center justify-center shrink-0 border border-[#064E3B]/60">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xs text-[#AAB4C5]">Total Inventory Valuation (Cost)</p>
            <p className="text-lg font-bold text-[#D6B36A] font-mono mt-0.5">{formatCurrency(totalValuation)}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search items by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition placeholder-[#7A8699]"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8699]" />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="md:col-span-3">
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition cursor-pointer"
            >
              <option value="all">All Active Stock</option>
              <option value="in_stock">In Stock Only</option>
              <option value="low_stock">Low Stock (≤ Threshold)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
              <option value="archived">Archived Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0E1729] border-b border-[#1E2B45] text-[#7A8699] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-medium">Item Details</th>
                <th className="py-3.5 px-4 font-medium">Category</th>
                <th className="py-3.5 px-4 font-medium text-center">Available Stock</th>
                <th className="py-3.5 px-4 font-medium text-center">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Purchase Rate</th>
                <th className="py-3.5 px-4 font-medium text-right">Default Sale Rate</th>
                <th className="py-3.5 px-4 font-medium text-right">Total Valuation</th>
                <th className="py-3.5 px-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2B45]/50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7A8699]">
                    No inventory items match the current search & filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.current_stock <= item.low_stock_threshold && item.current_stock > 0;
                  const isOut = item.current_stock <= 0;
                  const lineValuation = item.current_stock * item.purchase_rate;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#16233B]/60 transition ${item.is_archived ? 'opacity-60 bg-slate-900/40' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#F5F3EE]">{item.name}</div>
                        {item.sku && (
                          <div className="text-[10px] text-[#AAB4C5] font-mono mt-0.5">
                            SKU: {item.sku}
                          </div>
                        )}
                        {item.description && (
                          <div className="text-[10px] text-[#7A8699] truncate max-w-xs mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#AAB4C5] whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-[#0B1220] border border-[#1E2B45] rounded text-[11px]">
                          {item.category || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold whitespace-nowrap">
                        <span className={`text-sm ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-[#F5F3EE]'}`}>
                          {item.current_stock}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.is_archived ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Archived
                          </span>
                        ) : isOut ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Low Stock (≤ {item.low_stock_threshold})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[#AAB4C5] whitespace-nowrap">
                        {formatCurrency(item.purchase_rate)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-[#F5F3EE] whitespace-nowrap">
                        {formatCurrency(item.default_sale_rate)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D6B36A] whitespace-nowrap">
                        {formatCurrency(lineValuation)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Adjust Stock */}
                          {!item.is_archived && (
                            <button
                              onClick={() => setAdjustingItem(item)}
                              className="p-1.5 text-[#AAB4C5] hover:text-[#D6B36A] hover:bg-[#16233B] rounded-lg transition"
                              title="Adjust Stock Quantity"
                            >
                              <SlidersHorizontal size={15} />
                            </button>
                          )}

                          {/* Edit Item */}
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-[#AAB4C5] hover:text-[#F5F3EE] hover:bg-[#16233B] rounded-lg transition"
                            title="Edit Item Details"
                          >
                            <Edit size={15} />
                          </button>

                          {/* Safe Delete / Archive */}
                          {!item.is_archived && (
                            <button
                              onClick={() => setDeleteConfirmation(item)}
                              className="p-1.5 text-[#AAB4C5] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete or Archive Item"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <ItemFormModal
          itemToEdit={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <StockAdjustModal
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
        />
      )}

      {/* Safe Delete / Archive Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111B2E] border border-[#1E2B45] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#F5F3EE]">Archive / Delete Item</h3>
                <p className="text-xs text-[#AAB4C5]">{deleteConfirmation.name}</p>
              </div>
            </div>

            <p className="text-xs text-[#AAB4C5] leading-relaxed">
              If this item has existing sales history, it will be safely <strong>Archived</strong> so past financial calculations and invoices remain 100% accurate. If it has never been sold, it will be deleted permanently.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] text-[#F5F3EE] rounded-lg text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrArchive}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
