import React from 'react';
import { useMess } from '../../context/MessContext';
import { Star, ShieldAlert } from 'lucide-react';

export const FeedbackAlertStream: React.FC = () => {
  const { feedbacks, rollingAverageRating, emergencyAlert, acknowledgeEmergencyAlert } = useMess();

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedbacks.forEach((f) => {
    if (f.rating >= 1 && f.rating <= 5) {
      counts[f.rating as 1 | 2 | 3 | 4 | 5]++;
    }
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Student Reviews &amp; Quality Stream</h3>
            <span className="text-xs text-slate-500">Live student sentiment with &lt;3★ automatic alert sirens</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
          <span className="text-sm font-extrabold font-mono text-amber-900 tabular-nums">
            {rollingAverageRating.toFixed(1)}
          </span>
          <span className="text-xs text-amber-700 font-semibold font-mono">/ 5.0</span>
        </div>
      </div>

      {/* Emergency Siren Banner if Alert Triggered */}
      {emergencyAlert && emergencyAlert.active && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider font-mono">
                Immediate Quality Action Needed
              </div>
              <p className="text-xs text-rose-900 mt-0.5 font-bold">{emergencyAlert.reason}</p>
              <span className="text-[11px] text-rose-700 font-mono mt-1 block">
                Logged at: {emergencyAlert.timestamp} · Escalated to Sous-Chef
              </span>
            </div>
          </div>
          <button
            onClick={acknowledgeEmergencyAlert}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shrink-0 shadow-xs"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Rating Breakdown Bars */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = counts[stars as 1 | 2 | 3 | 4 | 5];
          const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
          return (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-8 font-bold font-mono text-slate-600">{stars}★</span>
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full rounded-full ${
                    stars >= 4 ? 'bg-amber-400' : stars === 3 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                />
              </div>
              <span className="w-12 text-right font-mono text-slate-500 text-[11px] font-medium tabular-nums">
                {count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* Live Stream of Student Reviews */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className={`p-3.5 rounded-2xl border text-xs transition-all ${
              fb.isAlert
                ? 'bg-rose-50/60 border-rose-200'
                : 'bg-slate-50/60 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{fb.studentName}</span>
                <span className="text-[11px] font-mono text-slate-500 font-medium">Room #{fb.roomNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= fb.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="font-mono text-slate-400 text-[10px] ml-1">{fb.timestamp}</span>
              </div>
            </div>

            {fb.comment && <p className="text-slate-700 text-xs mb-2 italic">"{fb.comment}"</p>}

            {/* Tags */}
            {fb.tags && fb.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {fb.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                      fb.isAlert
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-white text-slate-600 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
