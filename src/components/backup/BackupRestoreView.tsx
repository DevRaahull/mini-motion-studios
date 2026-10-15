import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Info,
  Clock,
  HardDrive
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { generateBackupJson, validateBackupFile, BackupValidationResult, exportToCsv, downloadBlob } from '../../lib/exportUtils';
import { formatDate, formatDateTime } from '../../lib/formatters';

export const BackupRestoreView: React.FC = () => {
  const { settings, items, purchases, sales, expenses, restoreBackup } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1-Click JSON Backup Download
  const handleDownloadBackup = () => {
    try {
      const allSaleItems = sales.flatMap(s => s.items || []);
      const jsonStr = generateBackupJson(
        settings,
        items,
        purchases,
        sales,
        allSaleItems,
        [], // local movements
        expenses
      );
      const filename = `SEVEN_STAR_JWELS_BACKUP_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      downloadBlob(jsonStr, filename, 'application/json');

      setStatusMessage({
        type: 'success',
        text: `Complete JSON backup downloaded successfully (${filename}). Store it safely on your Google Drive or local drive.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to generate backup: ${err.message || 'Unknown error'}`
      });
    }
  };

  // CSV Dump of All Business Tables
  const handleExportAllCsv = () => {
    // Items
    exportToCsv(
      `Items_Export_${new Date().toISOString().slice(0, 10)}`,
      ['ID', 'Name', 'SKU', 'Category', 'Stock', 'Purchase Rate', 'Default Sale Rate', 'Is Archived'],
      items.map(i => [i.id, i.name, i.sku || '', i.category, i.current_stock, i.purchase_rate, i.default_sale_rate, i.is_archived ? 'YES' : 'NO'])
    );
    // Purchases
    exportToCsv(
      `Purchases_Inward_Export_${new Date().toISOString().slice(0, 10)}`,
      ['Invoice #', 'Date', 'Supplier', 'GSTIN', 'Payment Status', 'Taxable (₹)', 'GST (₹)', 'Grand Total (₹)', 'Amount Paid (₹)', 'Amount Due (₹)'],
      purchases.map(p => [p.supplier_invoice_number, p.purchase_date, p.supplier_name, p.supplier_gstin || '', p.payment_status, p.total_taxable, p.total_gst, p.grand_total, p.amount_paid, p.amount_due])
    );
    // Sales
    exportToCsv(
      `Sales_Export_${new Date().toISOString().slice(0, 10)}`,
      ['Invoice #', 'Date', 'Buyer', 'Buyer GSTIN', 'Payment Status', 'Total Taxable (₹)', 'GST (₹)', 'Grand Total (₹)', 'Received (₹)', 'Due (₹)', 'Status'],
      sales.map(s => [s.invoice_number, s.sale_date, s.customer_name || '', s.buyer_gstin || '', s.payment_status || 'Paid', s.total_taxable || 0, s.total_gst || 0, s.grand_total || (s as any).total_amount, s.amount_received || 0, s.amount_due || 0, s.status])
    );
    // Expenses
    exportToCsv(
      `Expenses_Export_${new Date().toISOString().slice(0, 10)}`,
      ['Date', 'Title', 'Category', 'Amount (₹)', 'Payment Method', 'Notes'],
      expenses.map(e => [e.expense_date, e.title, e.category, e.amount, e.payment_method, e.notes || ''])
    );

    setStatusMessage({
      type: 'success',
      text: 'Exported Items, Purchases, Sales, and Expenses as individual CSV spreadsheets.'
    });
  };

  // Handle Backup File Upload & Validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateBackupFile(content);
      setValidationResult(result);

      if (!result.isValid) {
        setStatusMessage({
          type: 'error',
          text: `Invalid Backup File: ${result.error}`
        });
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore with Confirmation
  const handleConfirmRestore = async () => {
    if (!validationResult || !validationResult.parsedData) return;

    setIsRestoring(true);
    setStatusMessage(null);

    try {
      const res = await restoreBackup(validationResult.parsedData);
      setStatusMessage({
        type: 'success',
        text: res.message || 'Data restored successfully!'
      });
      setValidationResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Restoration failed: ${err.message || 'Unknown error'}`
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E2B45]">
        <h2 className="text-xl lg:text-2xl font-serif font-bold text-gold-gradient tracking-wide">
          Backup, Export & Disaster Recovery
        </h2>
        <p className="text-xs text-[#AAB4C5] mt-0.5">
          Safeguard your business records with zero-cost JSON & CSV backups and verified point-in-time restores.
        </p>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle size={18} className="shrink-0 text-rose-400" />
          )}
          <span className="flex-1 font-medium">{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: DOWNLOAD BACKUPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Full JSON Backup */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#D6B36A]/10 border border-[#D6B36A]/30 flex items-center justify-center text-[#D6B36A] mb-4">
              <Database size={24} />
            </div>
            <h3 className="font-semibold text-base text-[#F5F3EE]">Download Complete Backup (.json)</h3>
            <p className="text-xs text-[#AAB4C5] leading-relaxed mt-2">
              Exports all inventory items, purchase rates, historical sales, line items, expenses, and business settings into a validated JSON file.
            </p>
            <div className="mt-4 p-3 bg-[#0B1220] rounded-lg border border-[#1E2B45] text-[11px] text-[#7A8699] space-y-1">
              <div>&bull; Current Items in Backup: <strong className="text-[#F5F3EE]">{items.length}</strong></div>
              <div>&bull; Purchases Inward: <strong className="text-[#F5F3EE]">{purchases.length}</strong></div>
              <div>&bull; Wholesale Invoices: <strong className="text-[#F5F3EE]">{sales.length}</strong></div>
              <div>&bull; Operating Expenses: <strong className="text-[#F5F3EE]">{expenses.length}</strong></div>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#D6B36A] hover:bg-[#c9a356] text-[#0B1220] rounded-xl text-xs font-bold shadow-md transition active:scale-95"
          >
            <Download size={16} strokeWidth={2.5} />
            <span>Download .JSON Backup File</span>
          </button>
        </div>

        {/* CSV Spreadsheets Export */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#60A5FA] mb-4">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-semibold text-base text-[#F5F3EE]">Export Spreadsheets (.csv)</h3>
            <p className="text-xs text-[#AAB4C5] leading-relaxed mt-2">
              Exports separate Excel / Google Sheets compatible CSV files for Items catalog, Sales ledger, and Expenses for your accountant or tax advisor.
            </p>
            <div className="mt-4 p-3 bg-[#0B1220] rounded-lg border border-[#1E2B45] text-[11px] text-[#7A8699] space-y-1">
              <div>&bull; Universal CSV format openable in MS Excel & LibreOffice</div>
              <div>&bull; Preserves exact Indian Rupee amounts and timestamps</div>
            </div>
          </div>

          <button
            onClick={handleExportAllCsv}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#16233B] hover:bg-[#1E2E4A] border border-[#1E2B45] text-[#D6B36A] rounded-xl text-xs font-semibold shadow transition active:scale-95"
          >
            <Download size={16} />
            <span>Export CSV Spreadsheets</span>
          </button>
        </div>

        {/* Project Architecture & Interview Guide TXT */}
        <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D6B36A] mb-4">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-base text-[#F5F3EE]">Project & Interview Guide (.txt)</h3>
            <p className="text-xs text-[#AAB4C5] leading-relaxed mt-2">
              Ready-to-download text file containing complete architecture, ₹0 budget proof, technical challenges, database schema, COGS formulas, and interview Q&A.
            </p>
            <div className="mt-4 p-3 bg-[#0B1220] rounded-lg border border-[#1E2B45] text-[11px] text-[#7A8699] space-y-1">
              <div>&bull; Plain text format openable on any phone or laptop</div>
              <div>&bull; Includes 30-sec pitch, tech stack & interview FAQ</div>
            </div>
          </div>

          <a
            href="/SEVEN_STAR_JWELS_PROJECT_DETAILS.txt"
            download="SEVEN_STAR_JWELS_PROJECT_DETAILS.txt"
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#D6B36A] to-[#B08E46] hover:from-[#c9a356] hover:to-[#9a7b38] text-[#0B1220] rounded-xl text-xs font-bold shadow-md transition active:scale-95 text-center"
          >
            <Download size={16} strokeWidth={2.5} />
            <span>Download Project Details (.txt)</span>
          </a>
        </div>
      </div>

      {/* SECTION 2: RESTORE DATA */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#581C87]/40 text-[#C084FC] border border-[#581C87]/60">
            <Upload size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-base text-[#F5F3EE]">Restore from Backup File</h3>
            <p className="text-xs text-[#AAB4C5]">
              Upload a previously downloaded SEVEN STAR JWELS JSON backup file to restore records.
            </p>
          </div>
        </div>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-[#1E2B45] hover:border-[#D6B36A]/50 rounded-xl p-6 text-center transition bg-[#0B1220]/60">
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            id="backup-upload"
          />
          <label htmlFor="backup-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
            <HardDrive size={32} className="text-[#AAB4C5] mb-1" />
            <p className="text-xs font-medium text-[#F5F3EE]">
              Click to select JSON backup file or drag and drop here
            </p>
            <p className="text-[11px] text-[#7A8699]">
              Only valid SEVEN STAR JWELS schema backup files are accepted
            </p>
          </label>
        </div>

        {/* Pre-Restore Preview Card */}
        {validationResult && validationResult.isValid && validationResult.summary && (
          <div className="p-5 bg-[#0B1220] border-2 border-amber-500/40 rounded-xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle size={18} />
              <h4 className="font-semibold text-xs uppercase tracking-wider">
                Backup File Verified — Review Before Restoration
              </h4>
            </div>

            <p className="text-xs text-[#AAB4C5]">
              The uploaded file is valid. Restoring will update your items, sales, and expenses records.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-[#111B2E] p-3 rounded-lg border border-[#1E2B45]">
              <div>
                <span className="text-[#7A8699]">Items Count:</span>
                <p className="font-bold text-[#F5F3EE] font-mono text-sm mt-0.5">
                  {validationResult.summary.itemsCount}
                </p>
              </div>
              <div>
                <span className="text-[#7A8699]">Purchases Count:</span>
                <p className="font-bold text-[#F5F3EE] font-mono text-sm mt-0.5">
                  {validationResult.summary.purchasesCount || 0}
                </p>
              </div>
              <div>
                <span className="text-[#7A8699]">Sales Invoices:</span>
                <p className="font-bold text-[#F5F3EE] font-mono text-sm mt-0.5">
                  {validationResult.summary.salesCount}
                </p>
              </div>
              <div>
                <span className="text-[#7A8699]">Expenses Count:</span>
                <p className="font-bold text-[#F5F3EE] font-mono text-sm mt-0.5">
                  {validationResult.summary.expensesCount}
                </p>
              </div>
              <div>
                <span className="text-[#7A8699]">Exported Timestamp:</span>
                <p className="font-medium text-[#AAB4C5] text-[11px] mt-0.5">
                  {formatDate(validationResult.summary.exportedAt)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setValidationResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-4 py-2 bg-[#16233B] hover:bg-[#1E2E4A] text-[#F5F3EE] rounded-lg text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleConfirmRestore}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow transition active:scale-95 disabled:opacity-50"
              >
                {isRestoring ? 'Restoring Records...' : 'Confirm and Restore Data'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: FREE-TIER BACKUP POLICY & BEST PRACTICES */}
      <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-6 shadow-sm space-y-4 text-xs text-[#AAB4C5]">
        <div className="flex items-center gap-2 text-[#D6B36A] font-semibold text-sm">
          <Info size={18} />
          <span>Free-Tier Backup Transparency & Recommended Best Practices</span>
        </div>

        <div className="space-y-2 text-[11px] leading-relaxed">
          <p>
            <strong>Supabase Free Plan Automated Backups:</strong> Supabase Free projects include daily logical database backups with 7 days retention managed in the Supabase Dashboard (<span className="font-mono text-slate-300">Project &gt; Database &gt; Backups</span>). However, Supabase free projects pause after 7 days of total database inactivity unless accessed.
          </p>
          <p>
            <strong>Your Zero-Cost Independent Guarantee:</strong> To guarantee permanent ownership of your records with ₹0 cost, download a manual <strong>.JSON Backup</strong> at the end of each business week and store it in your personal Google Drive, OneDrive, or a USB drive.
          </p>
        </div>
      </div>
    </div>
  );
};
