import React from 'react';
import { useMess } from '../../context/MessContext';
import { FootfallChart } from './FootfallChart';
import { WeeklyTrendsChart } from './WeeklyTrendsChart';
import { FoodWastageLikingTracker } from './FoodWastageLikingTracker';
import { FeedbackAlertStream } from './FeedbackAlertStream';
import { InventoryLinkage } from './InventoryLinkage';
import { Leaf, DollarSign, Award, Users, AlertTriangle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { stats, rollingAverageRating, emergencyAlert, acknowledgeEmergencyAlert } = useMess();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner Alert (if alert active) */}
      {emergencyAlert && emergencyAlert.active && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-rose-800 uppercase">Emergency Food Quality Alert</span>
              <p className="text-xs text-rose-950 font-bold mt-0.5">{emergencyAlert.reason}</p>
            </div>
          </div>
          <button
            onClick={acknowledgeEmergencyAlert}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shrink-0 shadow-xs"
          >
            Mark Resolved
          </button>
        </div>
      )}

      {/* Top Level Mess Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Food Waste Prevented */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Food Waste Diverted</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
            {stats.rawFoodSavedKg} kg
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-700 font-bold font-mono">+{stats.mealsSavedCount} meals</span>
            <span>saved from garbage today</span>
          </div>
        </div>

        {/* Financial Savings */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Mess Budget Saved</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-900 tabular-nums">
            ${stats.costSavedFunds.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>Direct credit to student rebate fund</span>
          </div>
        </div>

        {/* Quality Rating */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Student Satisfaction</span>
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {rollingAverageRating.toFixed(1)} / 5.0
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span className={`font-semibold ${rollingAverageRating >= 3.5 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {rollingAverageRating >= 3.5 ? 'Nominal Quality' : '⚠️ Alert: Below 3.0'}
            </span>
          </div>
        </div>

        {/* RSVP Engagement Rate */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">RSVP Optimization</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-900 tabular-nums">
            {Math.round((stats.optedOutCount / stats.registeredStudents) * 100)}%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>Of student body pre-booked attendance</span>
          </div>
        </div>
      </div>

      {/* Daily Food Wastage & Taste Acceptance Intelligence */}
      <FoodWastageLikingTracker />

      {/* Weekly Trends & Waste Mitigation Data Visualization Component (Recharts) */}
      <WeeklyTrendsChart />

      {/* Real-time Footfall Velocity Curve */}
      <FootfallChart />

      {/* Split Grid: Inventory Linkage + Live Feedback Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <InventoryLinkage />
        </div>
        <div className="lg:col-span-5">
          <FeedbackAlertStream />
        </div>
      </div>
    </div>
  );
};

