import React, { useState, useMemo } from 'react';
import { useMess } from '../../context/MessContext';
import {
  Scale,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChefHat,
  ThumbsDown,
  Award,
  Bell,
  Sliders,
  Mail,
  Send,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WasteDetectionService, DEFAULT_WASTE_THRESHOLD_CONFIG } from '../../services/wasteDetectionService';
import { WasteThresholdConfig, WasteIncidentAlert } from '../../types/mess';

export const FoodWastageLikingTracker: React.FC = () => {
  const { dailyWastageLogs, dishLikingAnalysis, logMealPlateScrap } = useMess();
  const [selectedLogId, setSelectedLogId] = useState<string>(dailyWastageLogs[1]?.id || 'w_lunch_today');
  const [isWeighModalOpen, setIsWeighModalOpen] = useState<boolean>(false);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState<boolean>(false);
  const [scrapInput, setScrapInput] = useState<number>(12);
  const [potInput, setPotInput] = useState<number>(12);
  const [thresholdConfig, setThresholdConfig] = useState<WasteThresholdConfig>(DEFAULT_WASTE_THRESHOLD_CONFIG);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());

  const activeLog = dailyWastageLogs.find((l) => l.id === selectedLogId) || dailyWastageLogs[0];

  // Evaluate automatic waste anomalies across all daily logs using the backend detection service
  const detectedAlerts: WasteIncidentAlert[] = useMemo(() => {
    const list: WasteIncidentAlert[] = [];
    dailyWastageLogs.forEach((log) => {
      const alert = WasteDetectionService.evaluateMealWaste(log, thresholdConfig);
      if (alert && !dismissedAlertIds.has(alert.mealSessionId)) {
        list.push(alert);
      }
    });
    return list;
  }, [dailyWastageLogs, thresholdConfig, dismissedAlertIds]);

  const activeAlert = detectedAlerts[0] || null;

  const handleOpenWeighModal = (logId: string) => {
    const target = dailyWastageLogs.find((l) => l.id === logId);
    if (target) {
      setSelectedLogId(logId);
      setScrapInput(target.studentPlateScrapKg);
      setPotInput(target.unservedPotLeftoverKg);
      setIsWeighModalOpen(true);
    }
  };

  const handleSaveWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    logMealPlateScrap(selectedLogId, Number(scrapInput), Number(potInput));
    setIsWeighModalOpen(false);
  };

  const handleDismissAlert = (mealSessionId: string) => {
    setDismissedAlertIds((prev) => new Set(prev).add(mealSessionId));
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-7">
      {/* Automated Threshold Violation Notification Banner (if breached) */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-3xl border-2 shadow-xs space-y-3 ${
              activeAlert.severity === 'CRITICAL'
                ? 'bg-rose-50 border-rose-400 text-rose-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeAlert.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Automated Waste Threshold Alert [{activeAlert.severity}]
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                      {activeAlert.date} · {activeAlert.mealType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold mt-0.5">{activeAlert.triggerReason}</h4>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDismissAlert(activeAlert.mealSessionId)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-stone-100 rounded-xl transition-colors border border-current shadow-2xs"
                >
                  Acknowledge Alert
                </button>
              </div>
            </div>

            {/* Root Cause & Multi-Channel Dispatch Info */}
            <div className="p-3.5 bg-white/90 rounded-2xl border border-current/20 text-xs space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-bold text-stone-900 shrink-0 font-mono text-[11px] uppercase">Diagnosis:</span>
                <span className="text-stone-700 leading-relaxed font-serif italic">{activeAlert.rootCauseAnalysis}</span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-current/10">
                <span className="font-bold text-amber-800 shrink-0 font-mono text-[11px] uppercase">Chef Action:</span>
                <span className="text-stone-800 font-medium">{activeAlert.actionRecommendation}</span>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-stone-500 font-mono gap-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span>Dispatched to: {activeAlert.dispatchedTo} &amp; Kitchen Terminals</span>
                </span>
                <span className="font-bold text-rose-700">Financial Loss: ${activeAlert.estimatedFinancialLoss}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header: Editorial Wastage & Student Taste Correlation */}
      <div className="flex flex-col md:flex-row md:items-start justify-between pb-5 border-b border-stone-100 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
              Kitchen Intelligence · Taste &amp; Waste Analytics
            </span>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Threshold Monitor Active
            </span>
          </div>
          <h3 className="text-xl font-black text-stone-900 tracking-tight font-serif italic">
            Daily Food Wastage &amp; Student Taste Preferences
          </h3>
          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed font-sans">
            By analyzing <strong>turnstile entry footfall</strong> alongside <strong>post-meal plate scrap weigh-ins</strong>, our system automatically deciphers student food liking, identifies unpopular recipes, and isolates temperature defects before food is wasted.
          </p>
        </div>

        {/* Quick Config Button & Aggregate Clean Plate Score */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsConfigDrawerOpen(!isConfigDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors border border-stone-200 shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-600" />
            <span>Threshold Rules</span>
          </button>

          <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-white p-3 rounded-2xl border border-emerald-200/80 shadow-2xs shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-mono uppercase font-bold block">
                Today's Clean Rate
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black font-mono text-emerald-800 tabular-nums">
                  {activeLog.plateClearanceRate}%
                </span>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1 py-0.2 rounded">
                  Clean
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Configuration Drawer (Collapsible) */}
      <AnimatePresence>
        {isConfigDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                  Automated Waste Threshold Alert Policies
                </h4>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                Triggers WebSocket &amp; Email on breach
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Max Plate Scrap %
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="5"
                    max="40"
                    step="1"
                    value={thresholdConfig.maxPlateScrapPct}
                    onChange={(e) => setThresholdConfig({ ...thresholdConfig, maxPlateScrapPct: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                  />
                  <span className="font-mono text-stone-500 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Max Pot Leftover %
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="5"
                    max="30"
                    step="1"
                    value={thresholdConfig.maxPotLeftoverPct}
                    onChange={(e) => setThresholdConfig({ ...thresholdConfig, maxPotLeftoverPct: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                  />
                  <span className="font-mono text-stone-500 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Max Weight Limit (kg)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="15"
                    max="100"
                    step="5"
                    value={thresholdConfig.maxTotalWasteKg}
                    onChange={(e) => setThresholdConfig({ ...thresholdConfig, maxTotalWasteKg: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                  />
                  <span className="font-mono text-stone-500 font-bold">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Financial Loss Limit ($)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="20"
                    max="200"
                    step="5"
                    value={thresholdConfig.maxLossDollars}
                    onChange={(e) => setThresholdConfig({ ...thresholdConfig, maxLossDollars: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                  />
                  <span className="font-mono text-stone-500 font-bold">$</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 font-mono border-t border-stone-200/80">
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alerts auto-sent to: {thresholdConfig.notificationEmail}</span>
              </span>
              <span className="text-emerald-700 font-bold">Policy Saved &amp; Evaluated in Real-Time</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-Quadrant Diagnostic Explainer: How Inflow + Wastage Predicts Taste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Quadrant 1: Campus Hit */}
        <div className="p-3.5 rounded-2xl border bg-emerald-50/70 border-emerald-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Hit</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full">
              Score: 90-100
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-snug">
            High Inflow + Near Zero Plate Scrap (&lt;5%). Students finish every bite. (e.g. Shahi Paneer, Gulab Jamun)
          </p>
        </div>

        {/* Quadrant 2: Balanced Staple */}
        <div className="p-3.5 rounded-2xl border bg-sky-50/70 border-sky-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Crowd Favorite</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full">
              Score: 75-89
            </span>
          </div>
          <p className="text-[11px] text-sky-800 leading-snug">
            Steady attendance + low scrap (&lt;8%). Reliable everyday nutrition staple. (e.g. Dal Tadka, Jeera Rice)
          </p>
        </div>

        {/* Quadrant 3: Under Review / Prep Issue */}
        <div className="p-3.5 rounded-2xl border bg-amber-50/70 border-amber-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Under Review</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full">
              Score: 60-74
            </span>
          </div>
          <p className="text-[11px] text-amber-800 leading-snug">
            High Inflow but Moderate Plate Scrap (10-20%). Students took food but left portions due to salt or coldness.
          </p>
        </div>

        {/* Quadrant 4: Disliked Recipe */}
        <div className="p-3.5 rounded-2xl border bg-rose-50/70 border-rose-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-900 flex items-center gap-1">
              <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
              <span>Needs Recipe Tweak</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full">
              Score: &lt;60
            </span>
          </div>
          <p className="text-[11px] text-rose-800 leading-snug">
            Low Inflow / High RSVP Skips + Heavy Plate Scrap (&gt;25%). Clear student distaste. (e.g. Aloo Baingan)
          </p>
        </div>
      </div>

      {/* Dish-by-Dish Food Liking & Plate Scrap Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-amber-700" />
            <h4 className="text-sm font-bold text-stone-900 font-serif">
              Dish-by-Dish Taste Acceptance Matrix (Current Menu Rotation)
            </h4>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">
            Derived from 840+ meal returns
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {dishLikingAnalysis.map((dish) => {
            const isHit = dish.verdict === 'CAMPUS_HIT';
            const isWarning = dish.verdict === 'NEEDS_RECIPE_TWEAK';
            const isReview = dish.verdict === 'UNDER_REVIEW';

            return (
              <motion.div
                key={dish.id}
                whileHover={{ y: -2 }}
                className={`p-4 rounded-2xl border transition-all ${
                  isHit
                    ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300'
                    : isWarning
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : isReview
                    ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                    : 'bg-stone-50/60 border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">{dish.dishName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold bg-white text-stone-600 border border-stone-200">
                        {dish.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono mt-0.5 block">
                      {dish.estimatedPortionsServed} portions served
                    </span>
                  </div>

                  {/* Liking Score Gauge */}
                  <div className="text-right">
                    <span
                      className={`text-base font-black font-mono tabular-nums block ${
                        isHit
                          ? 'text-emerald-700'
                          : isWarning
                          ? 'text-rose-600'
                          : isReview
                          ? 'text-amber-700'
                          : 'text-sky-700'
                      }`}
                    >
                      {dish.likingScore}/100
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider block font-sans text-stone-400">
                      Liking Score
                    </span>
                  </div>
                </div>

                {/* Metric Bars */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-200/60 text-[11px] font-mono my-2">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Inflow Attendance</span>
                    <span className="font-bold text-stone-800">{dish.inflowEngagementPct}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Plate Scrap Waste</span>
                    <span
                      className={`font-bold ${
                        dish.plateWastePct > 20
                          ? 'text-rose-600'
                          : dish.plateWastePct > 10
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {dish.plateWastePct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Taste Rating</span>
                    <span className="font-bold text-stone-800 flex items-center gap-0.5">
                      <span>{dish.averageRating}★</span>
                    </span>
                  </div>
                </div>

                {/* Chef Diagnosis & Action */}
                <p className="text-xs text-stone-600 leading-snug italic font-serif">
                  "{dish.chefDiagnosis}"
                </p>
                <div className="mt-2 text-[11px] font-sans font-medium text-amber-900 bg-white/80 p-2 rounded-xl border border-stone-200/60 flex items-center gap-1.5">
                  <span className="font-bold text-amber-700 uppercase tracking-wider text-[9px] font-mono">Action:</span>
                  <span>{dish.suggestedAction}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Daily Meal Wastage Weigh-In Log */}
      <div className="space-y-4 pt-3 border-t border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Daily Meal Scrap &amp; Leftover Weigh-in Records</span>
            </h4>
            <span className="text-xs text-stone-500">
              Kitchen scale measurements recorded after meal window closes
            </span>
          </div>

          <button
            onClick={() => handleOpenWeighModal(activeLog.id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Update Plate Scrap Scale Reading</span>
          </button>
        </div>

        {/* Meal Sessions Wastage Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-mono text-[11px]">
                <th className="pb-2.5 font-bold uppercase">Session &amp; Date</th>
                <th className="pb-2.5 font-bold uppercase text-right">Cooked (kg)</th>
                <th className="pb-2.5 font-bold uppercase text-right">Consumed (kg)</th>
                <th className="pb-2.5 font-bold uppercase text-right text-amber-800">Pot Leftover</th>
                <th className="pb-2.5 font-bold uppercase text-right text-rose-700">Plate Scrap</th>
                <th className="pb-2.5 font-bold uppercase text-right text-emerald-700">RSVP Saved</th>
                <th className="pb-2.5 font-bold uppercase text-right">Clean Rate</th>
                <th className="pb-2.5 font-bold uppercase text-right">Taste Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {dailyWastageLogs.map((log) => {
                const isSelected = log.id === selectedLogId;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50/50 font-medium' : 'hover:bg-stone-50'
                    }`}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{log.mealType}</span>
                        <span className="text-[10px] text-stone-400 font-mono">({log.date})</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-stone-800">{log.cookedWeightKg} kg</td>
                    <td className="py-3 text-right font-mono text-stone-800">{log.consumedWeightKg} kg</td>
                    <td className="py-3 text-right font-mono text-amber-800 font-bold">{log.unservedPotLeftoverKg} kg</td>
                    <td className="py-3 text-right font-mono text-rose-600 font-bold">{log.studentPlateScrapKg} kg</td>
                    <td className="py-3 text-right font-mono text-emerald-700 font-extrabold">+{log.rsvpPreemptedSavedKg} kg</td>
                    <td className="py-3 text-right font-mono font-bold text-stone-900">{log.plateClearanceRate}%</td>
                    <td className="py-3 text-right">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold inline-block ${
                          log.verdict === 'CAMPUS_HIT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.verdict === 'BALANCED'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.verdict === 'CAMPUS_HIT'
                          ? '🌟 Campus Hit'
                          : log.verdict === 'BALANCED'
                          ? '👍 Balanced'
                          : '⚠️ Disliked'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weigh Station Modal */}
      {isWeighModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <h4 className="text-base font-bold text-stone-900 font-serif">
                  Record Kitchen Scrap Scale Reading
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                {activeLog.mealType}
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Weigh the dish disposal bins and unserved pot stock to calculate today's plate clearance and evaluate threshold limits.
            </p>

            <form onSubmit={handleSaveWeighIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Student Plate Scrap Disposal (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="150"
                  value={scrapInput}
                  onChange={(e) => setScrapInput(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Food thrown into the plate cleaning conveyor bin.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Unserved Kitchen Pot Leftover (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="150"
                  value={potInput}
                  onChange={(e) => setPotInput(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Food left inside cooking pots (eligible for evening pantry redistribution).
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsWeighModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs"
                >
                  Save Weigh-in &amp; Evaluate Thresholds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
