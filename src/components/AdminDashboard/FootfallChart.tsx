import React from 'react';
import { useMess } from '../../context/MessContext';
import { BarChart3, TrendingUp } from 'lucide-react';

export const FootfallChart: React.FC = () => {
  const { timeslotData, stats } = useMess();

  const maxVal = Math.max(...timeslotData.map((d) => Math.max(d.expected, d.actual)), 250);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Dining Hall Turnstile Velocity</h3>
            <span className="text-xs text-slate-500">Expected vs Actual Check-in count by 15-minute intervals</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-200" />
            <span className="text-slate-500">Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-amber-800 font-bold">Actual Scanned</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="pt-6 pb-2">
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {timeslotData.map((slot) => {
            const expectedHeightPercent = Math.round((slot.expected / maxVal) * 100);
            const actualHeightPercent = Math.round((slot.actual / maxVal) * 100);
            const isOngoing = slot.slot === '01:30';

            return (
              <div key={slot.slot} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-mono px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap pointer-events-none z-10">
                    <div>Expected: {slot.expected}</div>
                    <div className="text-amber-400 font-bold">Scanned: {slot.actual}</div>
                  </div>

                  {/* Expected Bar */}
                  <div
                    style={{ height: `${expectedHeightPercent}%` }}
                    className="w-1/2 bg-slate-100 rounded-t-lg transition-all group-hover:bg-slate-200"
                  />

                  {/* Actual Bar */}
                  <div
                    style={{ height: `${actualHeightPercent}%` }}
                    className={`w-1/2 rounded-t-lg transition-all ${
                      isOngoing
                        ? 'bg-amber-400 ring-2 ring-amber-300 animate-pulse'
                        : slot.actual > 0
                        ? 'bg-amber-500'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* X-Axis Label */}
                <span className={`text-[11px] font-mono mt-2 block font-medium ${
                  isOngoing ? 'text-amber-800 font-extrabold' : 'text-slate-500'
                }`}>
                  {slot.slot}
                </span>
                {isOngoing && (
                  <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-tight bg-emerald-100 px-1 rounded">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>Peak Rush: 01:00 PM – 01:15 PM (240 students)</span>
        </span>
        <span className="text-slate-600 font-mono">
          Attendance Fulfillment: <strong className="text-slate-900">{stats.percentageAttendance}%</strong>
        </span>
      </div>
    </div>
  );
};
