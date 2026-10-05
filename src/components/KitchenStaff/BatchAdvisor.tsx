import React from 'react';
import { useMess } from '../../context/MessContext';
import { ChefHat, Flame, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';

export const BatchAdvisor: React.FC = () => {
  const { stats } = useMess();

  const pendingStudents = stats.pendingCount;
  const recommendedBatchRotis = Math.round(pendingStudents * 2.2);
  const recommendedRiceKilos = Math.round((pendingStudents * 0.12) * 10) / 10;
  const recommendedDalLiters = Math.round((pendingStudents * 0.14) * 10) / 10;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Kitchen Cooking Advisor</h3>
            <span className="text-xs text-slate-500">Paced batch cooking to prevent stale cold leftovers</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono font-semibold">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Velocity: 14 students/min</span>
        </div>
      </div>

      {/* Real-Time Cooking Quantities Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-amber-800 block">Next Roti Batch</span>
          <span className="text-xl font-extrabold font-mono text-amber-950 tabular-nums">
            {recommendedBatchRotis} rotis
          </span>
          <span className="text-[10px] text-amber-700 font-medium block mt-0.5">Keep 2 tawas running</span>
        </div>

        <div className="bg-sky-50/70 border border-sky-200/70 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-sky-800 block">Basmati Rice Load</span>
          <span className="text-xl font-extrabold font-mono text-sky-950 tabular-nums">
            {recommendedRiceKilos} kg
          </span>
          <span className="text-[10px] text-sky-700 font-medium block mt-0.5">Steam Cooker Tray 2</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-emerald-800 block">Dal Tadka Vat</span>
          <span className="text-xl font-extrabold font-mono text-emerald-950 tabular-nums">
            {recommendedDalLiters} liters
          </span>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Warm simmer at 75°C</span>
        </div>
      </div>

      {/* Batch Schedule Tracker */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1">
          <span>Kitchen Cooking Batches</span>
          <span className="text-[11px] font-mono font-medium text-slate-500">Dynamically RSVP adjusted</span>
        </div>

        {/* Batch 1 */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">Batch 1 (Opening 12:30 PM)</span>
              <span className="text-slate-500 block text-[11px]">300 Portions Prepared</span>
            </div>
          </div>
          <span className="font-mono text-xs text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Completed
          </span>
        </div>

        {/* Batch 2 */}
        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-slate-900">Batch 2 (Mid-Rush 01:00 PM)</span>
              <span className="text-slate-600 block text-[11px]">250 Portions · Serving on Counter</span>
            </div>
          </div>
          <span className="font-mono text-xs text-amber-800 font-bold bg-amber-200/70 px-2.5 py-0.5 rounded-full border border-amber-300">
            Active Serving
          </span>
        </div>

        {/* Batch 3 */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">Batch 3 (Late Arrivals 01:45 PM)</span>
              <span className="text-slate-500 block text-[11px]">
                Target: {Math.max(40, pendingStudents - 180)} portions (RSVP Calculated)
              </span>
            </div>
          </div>
          <span className="font-mono text-xs text-sky-800 font-semibold bg-sky-100 px-2.5 py-0.5 rounded-full">
            Cook at 01:25 PM
          </span>
        </div>
      </div>
    </div>
  );
};
