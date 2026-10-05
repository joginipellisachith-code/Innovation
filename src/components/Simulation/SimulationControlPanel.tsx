import React from 'react';
import { useMess } from '../../context/MessContext';
import { X, Sparkles, UserMinus, QrCode, AlertTriangle, RotateCcw, Activity } from 'lucide-react';

interface SimulationControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationControlPanel: React.FC<SimulationControlPanelProps> = ({ isOpen, onClose }) => {
  const { simulateBulkAction, realtimeEvents, stats, rollingAverageRating } = useMess();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Campus Live Simulator</h3>
              <p className="text-xs text-slate-500">
                Trigger mock real-time events to see instant headcount and kitchen updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Quick Bar */}
        <div className="grid grid-cols-3 gap-2.5 my-4 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/70 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] font-sans font-medium">Expected Headcount</span>
            <span className="font-bold text-amber-900 text-sm tabular-nums">{stats.expectedFootfall}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans font-medium">Scanned at Gates</span>
            <span className="font-bold text-sky-800 text-sm tabular-nums">{stats.checkedInCount}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans font-medium">Quality Rating</span>
            <span className={`font-bold text-sm tabular-nums ${rollingAverageRating < 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {rollingAverageRating.toFixed(1)}★
            </span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="space-y-3 mb-4">
          {/* Action 1: Bulk RSVP Skip */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserMinus className="w-4 h-4 text-emerald-600" />
                <span>Simulate 25 Students Skipping Lunch</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simulates 25 hostel students opting out. Instantly drops kitchen prep target &amp; saves raw ingredients.
              </p>
            </div>
            <button
              onClick={() => simulateBulkAction('SKIP_BATCH')}
              className="px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all whitespace-nowrap shadow-xs active:scale-95"
            >
              Trigger Skip (+25)
            </button>
          </div>

          {/* Action 2: Bulk Gate Check-in */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-sky-600" />
                <span>Simulate Turnstile Rush (+35 Scans)</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simulates 35 students walking in with dynamic QR passes. Increments checked-in count and plays chime.
              </p>
            </div>
            <button
              onClick={() => simulateBulkAction('CHECKIN_BATCH')}
              className="px-3.5 py-2 text-xs font-bold text-sky-950 bg-sky-300 hover:bg-sky-200 rounded-xl transition-all whitespace-nowrap shadow-xs active:scale-95"
            >
              Check-in (+35)
            </button>
          </div>

          {/* Action 3: Trigger Bad Food Quality Alert */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Trigger Cold Food Quality Siren</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Injects low 1★ and 2★ reviews for cold food, dropping average below 3.0 stars and alerting kitchen staff.
              </p>
            </div>
            <button
              onClick={() => simulateBulkAction('BAD_BATCH')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all whitespace-nowrap shadow-xs active:scale-95"
            >
              Fire Siren (&lt;3★)
            </button>
          </div>
        </div>

        {/* Live WebSocket Event Bus Log */}
        <div className="flex-1 min-h-[130px] flex flex-col overflow-hidden bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pb-2 border-b border-slate-200">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Realtime WebSocket Stream</span>
            </span>
            <span className="text-emerald-700 font-semibold">Connected (0ms Latency)</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pt-1 text-xs">
            {realtimeEvents.slice(0, 8).map((evt) => (
              <div key={evt.id} className="py-1.5 flex items-center justify-between">
                <span className="text-slate-700 truncate pr-2 font-medium">{evt.message}</span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{evt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => simulateBulkAction('RESET')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Baseline</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
