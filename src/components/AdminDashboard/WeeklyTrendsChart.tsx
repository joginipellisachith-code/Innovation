import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingDown,
  DollarSign,
  Leaf,
  CheckCircle2,
} from 'lucide-react';

interface DayTrendData {
  day: string;
  date: string;
  preparedKg: number;
  consumedKg: number;
  savedWasteKg: number;
  wasteRatePercent: number;
  rebatePaidOut: number;
  grainsKg: number;
  lentilsKg: number;
  produceKg: number;
}

const WEEKLY_DATA: DayTrendData[] = [
  {
    day: 'Mon',
    date: 'Sep 29',
    preparedKg: 720,
    consumedKg: 615,
    savedWasteKg: 105,
    wasteRatePercent: 14.6,
    rebatePaidOut: 378,
    grainsKg: 280,
    lentilsKg: 110,
    produceKg: 225,
  },
  {
    day: 'Tue',
    date: 'Sep 30',
    preparedKg: 690,
    consumedKg: 580,
    savedWasteKg: 110,
    wasteRatePercent: 15.9,
    rebatePaidOut: 396,
    grainsKg: 265,
    lentilsKg: 105,
    produceKg: 210,
  },
  {
    day: 'Wed',
    date: 'Oct 01',
    preparedKg: 710,
    consumedKg: 605,
    savedWasteKg: 105,
    wasteRatePercent: 14.8,
    rebatePaidOut: 378,
    grainsKg: 275,
    lentilsKg: 112,
    produceKg: 218,
  },
  {
    day: 'Thu',
    date: 'Oct 02',
    preparedKg: 680,
    consumedKg: 570,
    savedWasteKg: 110,
    wasteRatePercent: 16.2,
    rebatePaidOut: 396,
    grainsKg: 260,
    lentilsKg: 102,
    produceKg: 208,
  },
  {
    day: 'Fri',
    date: 'Oct 03',
    preparedKg: 750,
    consumedKg: 590,
    savedWasteKg: 160,
    wasteRatePercent: 21.3,
    rebatePaidOut: 576,
    grainsKg: 270,
    lentilsKg: 108,
    produceKg: 212,
  },
  {
    day: 'Sat',
    date: 'Oct 04',
    preparedKg: 620,
    consumedKg: 460,
    savedWasteKg: 160,
    wasteRatePercent: 25.8,
    rebatePaidOut: 576,
    grainsKg: 210,
    lentilsKg: 85,
    produceKg: 165,
  },
  {
    day: 'Sun',
    date: 'Today (Live)',
    preparedKg: 650,
    consumedKg: 496,
    savedWasteKg: 154,
    wasteRatePercent: 23.7,
    rebatePaidOut: 554,
    grainsKg: 226,
    lentilsKg: 91,
    produceKg: 179,
  },
];

type ChartViewMode = 'CONSUMPTION_VS_WASTE' | 'FINANCIAL_REBATES' | 'INGREDIENT_BOM';

export const WeeklyTrendsChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('CONSUMPTION_VS_WASTE');

  const totalPrepared = WEEKLY_DATA.reduce((acc, d) => acc + d.preparedKg, 0);
  const totalConsumed = WEEKLY_DATA.reduce((acc, d) => acc + d.consumedKg, 0);
  const totalSavedKg = WEEKLY_DATA.reduce((acc, d) => acc + d.savedWasteKg, 0);
  const totalRebatesPaid = WEEKLY_DATA.reduce((acc, d) => acc + d.rebatePaidOut, 0);
  const avgEfficiency = ((totalSavedKg / totalPrepared) * 100).toFixed(1);
  const co2AvoidedKg = (totalSavedKg * 2.5).toFixed(0);

  // Clean, high-contrast light Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xl text-xs font-sans min-w-[210px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
          <span className="font-bold text-slate-900">{label}</span>
          <span className="text-[10px] text-slate-500 font-mono">Week 40</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600">{entry.name}</span>
              </div>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {entry.name.includes('$') || entry.name.toLowerCase().includes('rebate')
                  ? `$${entry.value}`
                  : entry.name.includes('%')
                  ? `${entry.value}%`
                  : `${entry.value} kg`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header and View Mode Segmented Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Weekly Food Consumption &amp; Waste Mitigation Trends
              </h3>
              <span className="text-xs text-slate-500">
                Audited 7-day dining hall volume and student RSVP diversion impact
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('CONSUMPTION_VS_WASTE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              viewMode === 'CONSUMPTION_VS_WASTE'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Volume (kg)
          </button>
          <button
            onClick={() => setViewMode('FINANCIAL_REBATES')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              viewMode === 'FINANCIAL_REBATES'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Waste % &amp; Rebates ($)
          </button>
          <button
            onClick={() => setViewMode('INGREDIENT_BOM')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              viewMode === 'INGREDIENT_BOM'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Ingredient BOM
          </button>
        </div>
      </div>

      {/* Metric Callout Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
          <span className="text-slate-500 block text-[11px] font-medium">Total Cooked Volume</span>
          <span className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
            {totalPrepared.toLocaleString()} kg
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">7-Day Kitchen Total</span>
        </div>

        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5">
          <span className="text-sky-800 block text-[11px] font-semibold">Total Consumed</span>
          <span className="text-lg font-extrabold font-mono text-sky-950 tabular-nums">
            {totalConsumed.toLocaleString()} kg
          </span>
          <span className="text-[10px] text-sky-700 block mt-0.5">Checked-in Students</span>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5">
          <span className="text-emerald-800 block text-[11px] font-bold flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Waste Diverted</span>
          </span>
          <span className="text-lg font-extrabold font-mono text-emerald-950 tabular-nums">
            {totalSavedKg.toLocaleString()} kg
          </span>
          <span className="text-[10px] text-emerald-700 block mt-0.5 font-bold">
            {avgEfficiency}% diversion rate
          </span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
          <span className="text-amber-800 block text-[11px] font-bold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Rebates Paid Out</span>
          </span>
          <span className="text-lg font-extrabold font-mono text-amber-950 tabular-nums">
            ${totalRebatesPaid.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-700 block mt-0.5">Student Mess Credits</span>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 col-span-2 lg:col-span-1">
          <span className="text-purple-800 block text-[11px] font-semibold">CO₂ Emissions Cut</span>
          <span className="text-lg font-extrabold font-mono text-purple-950 tabular-nums">
            {co2AvoidedKg} kg
          </span>
          <span className="text-[10px] text-purple-700 block mt-0.5">Carbon Offset Equiv</span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'CONSUMPTION_VS_WASTE' ? (
            <ComposedChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} unit="kg" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="consumedKg" name="Consumed Food (kg)" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="savedWasteKg" name="Waste Prevented by RSVP (kg)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Line
                type="monotone"
                dataKey="preparedKg"
                name="Prepared Baseline (kg)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          ) : viewMode === 'FINANCIAL_REBATES' ? (
            <ComposedChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                unit="%"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                unit="$"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="right"
                dataKey="rebatePaidOut"
                name="Mess Rebate Disbursed ($)"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="wasteRatePercent"
                name="Food Waste Prevention Rate (%)"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} unit="kg" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="grainsKg" name="Grains & Rice (kg)" stackId="a" fill="#eab308" maxBarSize={36} />
              <Bar dataKey="lentilsKg" name="Lentils & Dal (kg)" stackId="a" fill="#f97316" maxBarSize={36} />
              <Bar
                dataKey="produceKg"
                name="Fresh Produce & Dairy (kg)"
                stackId="a"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Key Insight Footer Note */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Friday &amp; Weekend Opt-outs surge by +48% as hostelites dine off-campus.</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Batch forecasting saves hostel fund ~$14,200/semester
        </span>
      </div>
    </div>
  );
};
