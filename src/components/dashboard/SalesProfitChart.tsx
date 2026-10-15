import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Sale } from '../../types';
import { formatCurrency } from '../../lib/formatters';

interface SalesProfitChartProps {
  sales: Sale[];
}

interface MonthlyData {
  monthKey: string;
  label: string;
  sales: number;
  profit: number;
}

export const SalesProfitChart: React.FC<SalesProfitChartProps> = ({ sales }) => {
  const [period, setPeriod] = useState<'3' | '6' | '12'>('6');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group sales by month
  const chartData = useMemo(() => {
    const numMonths = parseInt(period, 10);
    const result: MonthlyData[] = [];
    const now = new Date();

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      result.push({
        monthKey,
        label,
        sales: 0,
        profit: 0
      });
    }

    // Populate data from completed sales
    sales.forEach(s => {
      if (s.status !== 'completed') return;
      const saleDate = new Date(s.sale_date);
      const saleKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;

      const target = result.find(r => r.monthKey === saleKey);
      if (target) {
        target.sales += s.total_amount;
        target.profit += s.gross_profit;
      }
    });

    return result;
  }, [sales, period]);

  // Find max value for scaling
  const maxValue = useMemo(() => {
    let max = 1000;
    chartData.forEach(d => {
      if (d.sales > max) max = d.sales;
      if (d.profit > max) max = d.profit;
    });
    // Round up to nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil((max * 1.15) / magnitude) * magnitude;
  }, [chartData]);

  // Y-axis ticks
  const yTicks = [maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0];

  return (
    <div className="bg-[#111B2E] border border-[#1E2B45] rounded-xl p-5 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="text-[#D6B36A]">
            <BarChart3 size={20} />
          </div>
          <h3 className="font-semibold text-[#F5F3EE] text-base tracking-wide">
            Sales vs Gross Profit
          </h3>
        </div>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          aria-label="Filter chart period"
          className="bg-[#16233B] border border-[#1E2B45] text-xs text-[#AAB4C5] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D6B36A]/50 transition cursor-pointer"
        >
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">This Year (12 Mo)</option>
        </select>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 min-h-[220px] flex relative pt-2">
        {/* Y-Axis scale */}
        <div className="flex flex-col justify-between text-[11px] text-[#7A8699] pr-3 select-none pb-7">
          {yTicks.map((val, idx) => (
            <span key={idx} className="leading-none text-right font-mono">
              ₹ {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            </span>
          ))}
        </div>

        {/* Bars Container */}
        <div className="flex-1 flex flex-col">
          {/* Grid lines and bars */}
          <div className="flex-1 relative flex items-end justify-between gap-2 border-b border-[#1E2B45]/80 pb-0.5">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-[#1E2B45]/40 w-full h-0"></div>
              <div className="border-b border-[#1E2B45]/40 w-full h-0"></div>
              <div className="border-b border-[#1E2B45]/40 w-full h-0"></div>
              <div className="border-b border-[#1E2B45]/40 w-full h-0"></div>
            </div>

            {/* Monthly Bar Pairs */}
            {chartData.map((d, index) => {
              const salesHeightPct = Math.min(100, Math.max(4, (d.sales / maxValue) * 100));
              const profitHeightPct = Math.min(100, Math.max(4, (d.profit / maxValue) * 100));
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={d.monthKey}
                  className="flex-1 h-full flex flex-col justify-end items-center relative group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-14 bg-[#070C16] border border-[#1E2B45] text-xs rounded-lg px-2.5 py-1.5 shadow-xl z-20 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                      <div className="font-semibold text-[#F5F3EE] mb-0.5">{d.label}</div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-blue-400">Sales: {formatCurrency(d.sales)}</span>
                        <span className="text-[#D6B36A]">Profit: {formatCurrency(d.profit)}</span>
                      </div>
                    </div>
                  )}

                  {/* Dual Bars */}
                  <div className="flex items-end gap-1.5 w-full max-w-[48px] justify-center h-full">
                    {/* Sales Bar (Blue) */}
                    <div
                      style={{ height: `${salesHeightPct}%` }}
                      className="w-1/2 bg-[#3B82F6] hover:bg-[#60A5FA] rounded-t-sm transition-all duration-300"
                    />
                    {/* Gross Profit Bar (Gold) */}
                    <div
                      style={{ height: `${profitHeightPct}%` }}
                      className="w-1/2 bg-[#D6B36A] hover:bg-[#E6CA85] rounded-t-sm transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Month Labels */}
          <div className="flex justify-between pt-2.5">
            {chartData.map((d) => (
              <span
                key={d.monthKey}
                className="flex-1 text-center text-[11px] text-[#AAB4C5] font-medium truncate px-0.5"
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#1E2B45]/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
          <span className="text-[#AAB4C5]">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D6B36A]"></span>
          <span className="text-[#AAB4C5]">Gross Profit</span>
        </div>
      </div>
    </div>
  );
};
