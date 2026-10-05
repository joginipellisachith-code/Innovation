import React from 'react';
import { useMess } from '../../context/MessContext';
import { QrScannerView } from './QrScannerView';
import { BatchAdvisor } from './BatchAdvisor';
import {
  Users,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Leaf,
  History,
  Flame,
} from 'lucide-react';

export const KitchenTerminal: React.FC = () => {
  const {
    stats,
    mealSessions,
    selectedMealId,
    setSelectedMealId,
    realtimeEvents,
    emergencyAlert,
    acknowledgeEmergencyAlert,
  } = useMess();

  const currentMeal = mealSessions.find((m) => m.id === selectedMealId) || mealSessions[1];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Kitchen Emergency Alert Banner (if quality score dropped below 3.0) */}
      {emergencyAlert && emergencyAlert.active && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-rose-800">
                  Kitchen Quality Notice
                </span>
                <span className="text-xs font-mono font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                  Score: {emergencyAlert.avgScore}★
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {emergencyAlert.reason}
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Please check hot water trays and counter seasoning. Flagged at {emergencyAlert.timestamp}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={acknowledgeEmergencyAlert}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors whitespace-nowrap shadow-xs"
            >
              Acknowledge &amp; Notify Chef
            </button>
          </div>
        </div>
      )}

      {/* Terminal Title & Active Meal Session Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Kitchen Counter Operations</h2>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Service Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active Meal: <strong className="text-slate-800 font-semibold">{currentMeal.title}</strong> · Dining Window:{' '}
              <span className="font-mono text-slate-700 font-medium">{currentMeal.timing}</span>
            </p>
          </div>

          {/* Session Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {mealSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedMealId(session.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  session.id === selectedMealId
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {session.type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Headcount Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Enrolled */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Hostel Strength</span>
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {stats.registeredStudents}
          </div>
          <span className="text-[11px] text-slate-500">Total Hostelites</span>
        </div>

        {/* Live Opt-Outs / Skipped */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-2xs bg-gradient-to-b from-white to-emerald-50/20">
          <span className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 mb-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>RSVP Skipped</span>
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
            {stats.optedOutCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold font-mono">
            {Math.round((stats.optedOutCount / stats.registeredStudents) * 100)}% food saved
          </span>
        </div>

        {/* Adjusted Food Prep Target */}
        <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
          <span className="text-xs text-amber-900 font-bold flex items-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Food Prep Target</span>
          </span>
          <div className="text-2xl font-extrabold font-mono text-amber-950 tabular-nums">
            {stats.expectedFootfall}
          </div>
          <span className="text-[11px] text-amber-800 font-medium">Exact portions to cook</span>
        </div>

        {/* Scanned / Checked In */}
        <div className="bg-white border border-sky-200 rounded-2xl p-4 shadow-2xs bg-gradient-to-b from-white to-sky-50/20">
          <span className="text-xs text-sky-800 font-medium flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Turnstile Scanned</span>
          </span>
          <div className="text-2xl font-extrabold font-mono text-sky-800 tabular-nums">
            {stats.checkedInCount}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {stats.percentageAttendance}% already served
          </span>
        </div>

        {/* Remaining Expected in Queue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs col-span-2 md:col-span-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>Pending Arrivals</span>
          </span>
          <div className="text-2xl font-extrabold font-mono text-orange-600 tabular-nums">
            {stats.pendingCount}
          </div>
          <span className="text-[11px] text-slate-500">Remaining students</span>
        </div>
      </div>

      {/* Main Terminal Workspace: Scanner + Batch Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <QrScannerView />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <BatchAdvisor />
        </div>
      </div>

      {/* Recent Turnstile Scan Activity Feed */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Live Turnstile Activity Stream</h3>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Realtime Socket Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
          {realtimeEvents.map((evt) => (
            <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    evt.severity === 'emergency'
                      ? 'bg-rose-500 animate-ping'
                      : evt.severity === 'warning'
                      ? 'bg-amber-500'
                      : evt.severity === 'success'
                      ? 'bg-emerald-500'
                      : 'bg-sky-500'
                  }`}
                />
                <span className="text-slate-800 font-medium">{evt.message}</span>
              </div>
              <span className="font-mono text-slate-400 text-[11px] shrink-0 pl-2">
                {evt.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
