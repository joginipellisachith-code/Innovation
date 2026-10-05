/**
 * Backend Service: Automated Food Wastage Anomaly Detection & Notification Engine
 * Analyzes daily consumption & scrap logs, compares against configured thresholds,
 * correlates with taste ratings, and dispatches automated alerts to the mess manager.
 */

import { DailyMealWastageLog, WasteThresholdConfig, WasteIncidentAlert } from '../types/mess';

export const DEFAULT_WASTE_THRESHOLD_CONFIG: WasteThresholdConfig = {
  maxPlateScrapPct: 10.0, // Alert if student plate return scrap > 10%
  maxPotLeftoverPct: 8.0,  // Alert if kitchen unserved leftover > 8%
  maxTotalWasteKg: 35.0,   // Alert if total meal waste > 35 kg
  maxLossDollars: 50.0,    // Alert if financial loss > $50.00
  notificationEmail: 'mess-manager@university.edu',
  enablePushAlerts: true,
  enableSousChefDispatch: true,
};

export class WasteDetectionService {
  /**
   * Evaluates a daily meal wastage record against threshold policies.
   * Returns an active WasteIncidentAlert if thresholds are breached, or null if nominal.
   */
  public static evaluateMealWaste(
    log: DailyMealWastageLog,
    config: WasteThresholdConfig = DEFAULT_WASTE_THRESHOLD_CONFIG
  ): WasteIncidentAlert | null {
    const totalServed = log.consumedWeightKg + log.studentPlateScrapKg;
    const plateScrapPct = totalServed > 0
      ? parseFloat(((log.studentPlateScrapKg / totalServed) * 100).toFixed(1))
      : 0;
    
    const potLeftoverPct = log.cookedWeightKg > 0
      ? parseFloat(((log.unservedPotLeftoverKg / log.cookedWeightKg) * 100).toFixed(1))
      : 0;

    const totalWasteKg = parseFloat((log.studentPlateScrapKg + log.unservedPotLeftoverKg).toFixed(1));
    const estimatedLossDollars = parseFloat((totalWasteKg * 1.85).toFixed(2)); // ~$1.85 / kg blended food cost
    const co2WastedKg = parseFloat((totalWasteKg * 2.5).toFixed(1)); // ~2.5 kg CO2e per kg cooked meal waste

    // Breach evaluation criteria
    const isScrapBreached = plateScrapPct > config.maxPlateScrapPct;
    const isPotLeftoverBreached = potLeftoverPct > config.maxPotLeftoverPct;
    const isTotalWeightBreached = totalWasteKg > config.maxTotalWasteKg;
    const isFinancialLossBreached = estimatedLossDollars > config.maxLossDollars;

    if (!isScrapBreached && !isPotLeftoverBreached && !isTotalWeightBreached && !isFinancialLossBreached) {
      return null; // Waste is within acceptable operational tolerance
    }

    // Determine Incident Severity Level
    let severity: 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'ELEVATED';
    if (plateScrapPct >= 20 || totalWasteKg >= 50 || estimatedLossDollars >= 100) {
      severity = 'CRITICAL';
    } else if (plateScrapPct >= 14 || totalWasteKg >= 38) {
      severity = 'HIGH';
    }

    // Determine Root Cause via Taste & Inflow Correlation
    let rootCause = '';
    let recommendation = '';
    const reasons: string[] = [];

    if (isScrapBreached) {
      reasons.push(`Plate scrap reached ${plateScrapPct}% (threshold: ${config.maxPlateScrapPct}%)`);
    }
    if (isPotLeftoverBreached) {
      reasons.push(`Unserved pot leftovers reached ${potLeftoverPct}% (threshold: ${config.maxPotLeftoverPct}%)`);
    }
    if (isTotalWeightBreached) {
      reasons.push(`Total food lost ${totalWasteKg}kg exceeded ${config.maxTotalWasteKg}kg limit`);
    }
    if (isFinancialLossBreached) {
      reasons.push(`Direct hostel fund loss was $${estimatedLossDollars.toFixed(2)} (limit: $${config.maxLossDollars.toFixed(2)})`);
    }

    if (log.tasteRatingAvg < 3.2 && isScrapBreached) {
      rootCause = `Taste/Quality Defect: Students arrived at the counter but left substantial food (${log.studentPlateScrapKg}kg) on return trays. Correlates with low taste score (${log.tasteRatingAvg}★) and reviews citing cold food/sub-optimal seasoning.`;
      recommendation = 'Hold debrief with Sous-Chef on spice balances and verify steam-table holding temperatures (75°C min). Consider replacing recipe on next rotation.';
    } else if (isPotLeftoverBreached && !isScrapBreached) {
      rootCause = `Kitchen Over-Preparation: High unserved food remaining in pots (${log.unservedPotLeftoverKg}kg) despite clean plates (${log.plateClearanceRate}% clearance). Suggests kitchen batch preparation exceeded RSVP attendance forecast.`;
      recommendation = 'Calibrate batch cooking advisor. Downscale Batch 3 prep buffer from 15% to 5% based on dynamic student turnstile velocity.';
    } else {
      rootCause = `Combined Plate Scrap & Pot Surplus: Total meal loss of ${totalWasteKg}kg with ${plateScrapPct}% plate disposal. Food volume exceeded consumption appetite.`;
      recommendation = 'Inspect portion serving sizes (standardize ladle size to 120g) and review attendance drop-off patterns.';
    }

    const triggerReason = reasons.join(' · ');

    return {
      id: `alert-waste-${Date.now()}`,
      mealSessionId: log.id,
      mealType: log.mealType,
      date: log.date,
      severity,
      triggerReason,
      plateScrapKg: log.studentPlateScrapKg,
      plateScrapPct,
      potLeftoverKg: log.unservedPotLeftoverKg,
      totalWasteKg,
      estimatedFinancialLoss: estimatedLossDollars,
      co2WastedKg,
      rootCauseAnalysis: rootCause,
      actionRecommendation: recommendation,
      dispatchedTo: config.notificationEmail,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acknowledged: false,
    };
  }

  /**
   * Simulates dispatching the alert over multi-channel webhooks (Email, SMS, Push, WebSocket).
   */
  public static dispatchNotification(alert: WasteIncidentAlert): {
    channelsDispatched: string[];
    logPreview: string;
  } {
    const channels = ['WebSocket: manager_room', 'WebSocket: kitchen_room', `Email: ${alert.dispatchedTo}`];
    if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
      channels.push('SMS: Head Chef Emergency Line (+1-555-MESS-OPS)');
      channels.push('FCM Push: Mess Manager Mobile App');
    }

    const logPreview = `[AUTOMATED WASTE DISPATCH] Severity: ${alert.severity} | Meal: ${alert.mealType} | Waste: ${alert.totalWasteKg}kg | Loss: $${alert.estimatedFinancialLoss} | Rec: "${alert.actionRecommendation.slice(0, 80)}..."`;

    return {
      channelsDispatched: channels,
      logPreview,
    };
  }
}
