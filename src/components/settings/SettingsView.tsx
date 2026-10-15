import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { getSupabaseConfig, resetSupabaseClient } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useAppData();

  const [businessName, setBusinessName] = useState(settings.business_name || 'SEVEN STAR JWELS');
  const [hindiHeader, setHindiHeader] = useState(settings.hindi_header || '॥ श्री ॥');
  const [tagline, setTagline] = useState(settings.tagline || 'Jewellery Inventory & Accounting');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '₹');
  const [lowStockThreshold, setLowStockThreshold] = useState((settings.low_stock_threshold || 5).toString());
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoice_prefix || 'SSJ-');
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState(settings.address || '');
  const [stateName, setStateName] = useState(settings.state || 'Maharashtra');
  const [gstNumber, setGstNumber] = useState(settings.business_gstin || settings.gst_number || '');
  const [defaultGstRate, setDefaultGstRate] = useState((settings.default_gst_rate || 3).toString());
  const [invoiceNotes, setInvoiceNotes] = useState(settings.invoice_notes || '');

  // Supabase runtime config
  const currentSupabase = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState(currentSupabase.key);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateSettings({
        business_name: businessName.trim() || 'SEVEN STAR JWELS',
        hindi_header: hindiHeader.trim() || '॥ श्री ॥',
        tagline: tagline.trim() || 'Jewellery Inventory & Accounting',
        currency_symbol: currencySymbol.trim() || '₹',
        low_stock_threshold: parseFloat(lowStockThreshold) || 5,
        invoice_prefix: invoicePrefix.trim() || 'SSJ-',
        phone: phone.trim(),
        address: address.trim(),
        state: stateName.trim(),
        business_gstin: gstNumber.trim(),
        gst_number: gstNumber.trim(),
        default_gst_rate: parseFloat(defaultGstRate) || 3,
        invoice_notes: invoiceNotes.trim()
      });

      // Save Supabase runtime settings to localStorage if provided
      if (typeof window !== 'undefined') {
        if (supabaseUrl.trim() && supabaseKey.trim()) {
          localStorage.setItem('SSJ_SUPABASE_URL', supabaseUrl.trim());
          localStorage.setItem('SSJ_SUPABASE_ANON_KEY', supabaseKey.trim());
          resetSupabaseClient();
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E2B45]">
        <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
          Business & Application Settings
        </h2>
        <p className="text-xs text-[#AAB4C5] mt-0.5">
          Configure business branding, invoice format, default alerts, and cloud synchronization.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="font-semibold">Settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: BUSINESS BRANDING */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider flex items-center gap-2">
            <Building2 size={16} />
            <span>Store Identity & Header Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Display Text at Top Centre (Hindi Header) *
              </label>
              <input
                type="text"
                required
                value={hindiHeader}
                onChange={(e) => setHindiHeader(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-sm text-[#D6B36A] font-semibold text-center focus:outline-none focus:border-[#D6B36A] transition"
              />
              <span className="text-[10px] text-[#7A8699]">Must display: ॥ श्री ॥</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-sm text-[#F5F3EE] font-serif font-bold uppercase tracking-wider focus:outline-none focus:border-[#D6B36A] transition"
              />
              <span className="text-[10px] text-[#7A8699]">Must display: SEVEN STAR JWELS</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: INVOICE CONFIGURATION & PRINTING */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider flex items-center gap-2">
            <Receipt size={16} />
            <span>Printed Invoice Details & Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
              <span className="text-[10px] text-[#7A8699]">e.g. SSJ-</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Default Low-Stock Alert
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Shop Address (Printed on bill)
              </label>
              <input
                type="text"
                placeholder="Shop No., Market, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                State (Place of Supply)
              </label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                GST / Trade License No. (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono uppercase focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Default GST Rate (%)
              </label>
              <select
                value={defaultGstRate}
                onChange={(e) => setDefaultGstRate(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              >
                <option value="3">3% (Standard Jewellery GST)</option>
                <option value="0">0% (Nil / Exempt)</option>
                <option value="1.5">1.5%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Invoice Footer Terms & Return Policy
              </label>
              <textarea
                rows={2}
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg p-2.5 text-xs text-[#F5F3EE] focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CLOUD DATABASE CONNECTION (SUPABASE FREE TIER) */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#D6B36A] uppercase tracking-wider flex items-center gap-2">
              <Database size={16} />
              <span>Multi-Device Cloud Sync (Supabase PostgreSQL)</span>
            </h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              currentSupabase.isConfigured
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {currentSupabase.isConfigured ? 'Cloud Sync Connected' : 'Running in Local Storage Mode'}
            </span>
          </div>

          <p className="text-xs text-[#AAB4C5] leading-relaxed">
            To synchronize your jewellery inventory, sales, and accounts between your Windows laptop and mobile phone with <strong>₹0 ongoing cost</strong>, create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#D6B36A] underline">supabase.com</a> and paste your Project URL and Anon Public Key below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAB4C5] mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E2B45] rounded-lg px-3 py-2 text-xs text-[#F5F3EE] font-mono focus:outline-none focus:border-[#D6B36A] transition"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 size={16} strokeWidth={2.5} />
            <span>{isSaving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
