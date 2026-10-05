import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  MealSession,
  StudentProfile,
  InventoryItem,
  MealFeedback,
  TimeSlotFootfall,
  RealtimeEvent,
  EntryToken,
  HeadcountStats,
  UserRole,
  DailyMealWastageLog,
  DishLikingAnalysis,
} from '../types/mess';
import {
  INITIAL_STUDENT,
  INITIAL_MEAL_SESSIONS,
  INITIAL_INVENTORY,
  INITIAL_FEEDBACK,
  INITIAL_TIMESLOT_FOOTFALL,
  INITIAL_DAILY_WASTAGE_LOGS,
  INITIAL_DISH_LIKING_ANALYSIS,
} from '../data/initialData';
import { playSuccessChime, playWarningBuzzer, playAlertEmergencyChime } from '../utils/audio';

interface MessContextType {
  activeRole: UserRole | 'ARCHITECTURE';
  setActiveRole: (role: UserRole | 'ARCHITECTURE') => void;
  selectedMealId: string;
  setSelectedMealId: (id: string) => void;
  student: StudentProfile;
  mealSessions: MealSession[];
  rsvps: Record<string, boolean>; // mealSessionId -> true if SKIPPED
  activeToken: EntryToken;
  inventory: InventoryItem[];
  feedbacks: MealFeedback[];
  timeslotData: TimeSlotFootfall[];
  realtimeEvents: RealtimeEvent[];
  dailyWastageLogs: DailyMealWastageLog[];
  dishLikingAnalysis: DishLikingAnalysis[];
  stats: HeadcountStats;
  rollingAverageRating: number;
  emergencyAlert: {
    active: boolean;
    reason: string;
    avgScore: number;
    timestamp: string;
    resolved: boolean;
  } | null;
  // Actions
  toggleRsvp: (mealId: string, skip: boolean) => void;
  scanToken: (tokenString: string, gateId?: string) => { status: 'VERIFIED' | 'DUPLICATE' | 'SKIPPED' | 'INVALID'; message: string; studentName?: string; rollNumber?: string };
  submitFeedback: (rating: number, tags: string[], comment: string) => void;
  acknowledgeEmergencyAlert: () => void;
  restockItem: (itemId: string, amount: number) => void;
  simulateBulkAction: (action: 'SKIP_BATCH' | 'CHECKIN_BATCH' | 'BAD_BATCH' | 'RESET') => void;
  regenerateTokenNonce: () => void;
  logMealPlateScrap: (mealLogId: string, scrapKg: number, potLeftoverKg: number) => void;
}

const MessContext = createContext<MessContextType | undefined>(undefined);

export const MessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole | 'ARCHITECTURE'>('STUDENT');
  const [selectedMealId, setSelectedMealId] = useState<string>('meal_lunch_today');
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT);
  const [mealSessions] = useState<MealSession[]>(INITIAL_MEAL_SESSIONS);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({
    meal_breakfast_today: false,
    meal_lunch_today: false,
    meal_snacks_today: false,
    meal_dinner_today: false,
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [feedbacks, setFeedbacks] = useState<MealFeedback[]>(INITIAL_FEEDBACK);
  const [timeslotData, setTimeslotData] = useState<TimeSlotFootfall[]>(INITIAL_TIMESLOT_FOOTFALL);
  const [claimedTokens, setClaimedTokens] = useState<Set<string>>(new Set(['APN-SAMPLE-OLD']));
  const [dailyWastageLogs, setDailyWastageLogs] = useState<DailyMealWastageLog[]>(INITIAL_DAILY_WASTAGE_LOGS);
  const [dishLikingAnalysis, setDishLikingAnalysis] = useState<DishLikingAnalysis[]>(INITIAL_DISH_LIKING_ANALYSIS);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([
    {
      id: 'ev-init-1',
      type: 'GATE_CHECKIN',
      message: 'Gate-1: Student check-in verified (Roll 22BCE1029)',
      timestamp: '12:54 PM',
      severity: 'info',
    },
    {
      id: 'ev-init-2',
      type: 'RSVP_SKIP',
      message: 'Student opted out of Lunch (Earned $1.80 rebate)',
      timestamp: '12:45 PM',
      severity: 'info',
    },
  ]);

  // Base metrics for currently selected active meal
  const [baseOptedOut, setBaseOptedOut] = useState<number>(342);
  const [checkedInCount, setCheckedInCount] = useState<number>(412);
  const [tokenNonce, setTokenNonce] = useState<string>(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  // Active Emergency Alert State
  const [emergencyAlert, setEmergencyAlert] = useState<{
    active: boolean;
    reason: string;
    avgScore: number;
    timestamp: string;
    resolved: boolean;
  } | null>({
    active: false,
    reason: 'Lunch quality score dropped below 3.0 threshold (Lukewarm Dal reported at Counter 2)',
    avgScore: 2.8,
    timestamp: '01:04 PM',
    resolved: false,
  });

  // Calculate current meal session object
  const currentMeal = useMemo(() => {
    return mealSessions.find((m) => m.id === selectedMealId) || mealSessions[1];
  }, [mealSessions, selectedMealId]);

  // Compute live headcount stats
  const stats: HeadcountStats = useMemo(() => {
    const totalEnrolled = currentMeal.baseEnrollment;
    // Current student's RSVP adds to opted-out if skipped
    const isCurrentStudentSkipped = rsvps[selectedMealId] === true;
    const totalOptedOut = baseOptedOut + (isCurrentStudentSkipped ? 1 : 0);
    const expected = Math.max(0, totalEnrolled - totalOptedOut);
    const checked = Math.min(expected, checkedInCount);
    const pending = Math.max(0, expected - checked);
    const percentageAttendance = expected > 0 ? Math.round((checked / expected) * 100) : 0;
    
    // Average food waste prevention calculations
    const rawFoodSavedKg = parseFloat((totalOptedOut * 0.45).toFixed(1));
    const costSavedFunds = parseFloat((totalOptedOut * currentMeal.estimatedCostPerMeal * 0.72).toFixed(2));

    return {
      registeredStudents: totalEnrolled,
      optedOutCount: totalOptedOut,
      expectedFootfall: expected,
      checkedInCount: checked,
      pendingCount: pending,
      percentageAttendance,
      mealsSavedCount: totalOptedOut,
      rawFoodSavedKg,
      costSavedFunds,
    };
  }, [currentMeal, rsvps, selectedMealId, baseOptedOut, checkedInCount]);

  // Compute rolling average rating
  const rollingAverageRating = useMemo(() => {
    if (feedbacks.length === 0) return 5.0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return parseFloat((sum / feedbacks.length).toFixed(1));
  }, [feedbacks]);

  // Dynamic token generation for the logged-in student
  const activeToken: EntryToken = useMemo(() => {
    const isSkipped = rsvps[selectedMealId] === true;
    const expiry = new Date(Date.now() + 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const code = `APN-${student.rollNumber.replace(/[^a-zA-Z0-9]/g, '')}-${currentMeal.type.slice(0, 3)}-${tokenNonce}`;

    return {
      tokenId: code,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      roomNumber: student.roomNumber,
      mealType: currentMeal.type,
      mealSessionId: currentMeal.id,
      validDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiresAt: expiry,
      nonce: tokenNonce,
      hmacSignature: `sha256:7f9a2b${tokenNonce.toLowerCase()}c49e`,
      status: isSkipped ? 'SKIPPED' : claimedTokens.has(code) ? 'CLAIMED' : 'VALID',
    };
  }, [student, currentMeal, tokenNonce, rsvps, selectedMealId, claimedTokens]);

  // Rotating Token Nonce effect every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenNonce(Math.random().toString(36).substring(2, 8).toUpperCase());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const regenerateTokenNonce = useCallback(() => {
    setTokenNonce(Math.random().toString(36).substring(2, 8).toUpperCase());
  }, []);

  // Helper to append real-time events
  const addRealtimeEvent = useCallback((event: Omit<RealtimeEvent, 'id'>) => {
    const newEvent: RealtimeEvent = {
      ...event,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setRealtimeEvents((prev) => [newEvent, ...prev.slice(0, 49)]); // keep last 50
  }, []);

  // RSVP Skip / Opt-in Toggle
  const toggleRsvp = useCallback((mealId: string, skip: boolean) => {
    const meal = mealSessions.find((m) => m.id === mealId);
    if (!meal) return;

    if (meal.isRsvpLocked) {
      alert(`RSVP is locked for ${meal.title} because the preparation cutoff has passed.`);
      return;
    }

    setRsvps((prev) => {
      const prevVal = !!prev[mealId];
      if (prevVal === skip) return prev;

      // Update student metrics
      if (skip) {
        setStudent((s) => ({
          ...s,
          rebateBalance: parseFloat((s.rebateBalance + meal.rebateAmountPerSkip).toFixed(2)),
          mealsSkippedThisMonth: s.mealsSkippedThisMonth + 1,
          foodSavedKg: parseFloat((s.foodSavedKg + 0.45).toFixed(2)),
        }));
        addRealtimeEvent({
          type: 'RSVP_SKIP',
          message: `${student.name} (Room ${student.roomNumber}) skipped ${meal.type}. Rebate +$${meal.rebateAmountPerSkip.toFixed(2)} credited.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'info',
        });
      } else {
        setStudent((s) => ({
          ...s,
          rebateBalance: Math.max(0, parseFloat((s.rebateBalance - meal.rebateAmountPerSkip).toFixed(2))),
          mealsSkippedThisMonth: Math.max(0, s.mealsSkippedThisMonth - 1),
          foodSavedKg: Math.max(0, parseFloat((s.foodSavedKg - 0.45).toFixed(2))),
        }));
        addRealtimeEvent({
          type: 'RSVP_OPTIN',
          message: `${student.name} opted back into ${meal.type}. Kitchen headcount incremented.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'info',
        });
      }

      return {
        ...prev,
        [mealId]: skip,
      };
    });
  }, [mealSessions, student, addRealtimeEvent]);

  // Kitchen Gate Token Scanner
  const scanToken = useCallback((tokenString: string, gateId = 'GATE-1') => {
    const trimmed = tokenString.trim().toUpperCase();

    // Check if token corresponds to skipped meal
    const isCurrentStudentToken = trimmed.includes(student.rollNumber.replace(/[^a-zA-Z0-9]/g, ''));
    if (isCurrentStudentToken && rsvps[selectedMealId] === true) {
      playWarningBuzzer();
      addRealtimeEvent({
        type: 'DUPLICATE_ALERT',
        message: `DENIED: ${student.name} (${student.rollNumber}) skipped this meal. Entry disallowed.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: 'warning',
      });
      return {
        status: 'SKIPPED' as const,
        message: 'Student opted out of this meal. Food not budgeted.',
        studentName: student.name,
        rollNumber: student.rollNumber,
      };
    }

    // Check if already claimed
    if (claimedTokens.has(trimmed)) {
      playWarningBuzzer();
      addRealtimeEvent({
        type: 'DUPLICATE_ALERT',
        message: `DUPLICATE ATTEMPT: Token ${trimmed} has already been claimed!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: 'warning',
      });
      return {
        status: 'DUPLICATE' as const,
        message: 'Token was already claimed! Duplicate entry flagged.',
        studentName: isCurrentStudentToken ? student.name : 'Enrolled Student',
        rollNumber: isCurrentStudentToken ? student.rollNumber : trimmed,
      };
    }

    // Valid check-in
    setClaimedTokens((prev) => new Set(prev).add(trimmed));
    setCheckedInCount((c) => c + 1);
    playSuccessChime();

    const verifiedName = isCurrentStudentToken ? student.name : 'Aarav Mehta';
    const verifiedRoll = isCurrentStudentToken ? student.rollNumber : '22BCE1180';

    addRealtimeEvent({
      type: 'GATE_CHECKIN',
      message: `${gateId}: Validated ${verifiedName} (${verifiedRoll}). Entry approved.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: 'success',
    });

    // Increment ongoing time slot actual count
    setTimeslotData((prev) => {
      const copy = [...prev];
      if (copy[4]) {
        copy[4] = { ...copy[4], actual: copy[4].actual + 1 };
      }
      return copy;
    });

    return {
      status: 'VERIFIED' as const,
      message: 'Token verified successfully. Welcome to mess!',
      studentName: verifiedName,
      rollNumber: verifiedRoll,
    };
  }, [student, rsvps, selectedMealId, claimedTokens, addRealtimeEvent]);

  // Submit Feedback
  const submitFeedback = useCallback((rating: number, tags: string[], comment: string) => {
    const isAlert = rating < 3;
    const newFeedback: MealFeedback = {
      id: `fb-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      roomNumber: student.roomNumber,
      mealType: currentMeal.type,
      rating,
      tags,
      comment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAlert,
      resolutionStatus: isAlert ? 'ALERT_ACTIVE' : 'RESOLVED',
    };

    setFeedbacks((prev) => {
      const updated = [newFeedback, ...prev];
      // Compute new average
      const avg = updated.reduce((a, b) => a + b.rating, 0) / updated.length;
      if (avg < 3.0 || isAlert) {
        playAlertEmergencyChime();
        setEmergencyAlert({
          active: true,
          reason: isAlert
            ? `Critical Quality Flag from Room ${student.roomNumber}: "${tags.join(', ') || comment || 'Food complaint'}"`
            : `Average rating dropped to ${avg.toFixed(1)}/5.0!`,
          avgScore: parseFloat(avg.toFixed(1)),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resolved: false,
        });
      }
      return updated;
    });

    addRealtimeEvent({
      type: isAlert ? 'FEEDBACK_ALERT' : 'GATE_CHECKIN',
      message: isAlert
        ? `⚠️ EMERGENCY ALERT: 1/2★ review logged by ${student.name}: "${comment || tags.join(', ')}"`
        : `New ${rating}★ feedback submitted for ${currentMeal.type}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: isAlert ? 'emergency' : 'info',
    });
  }, [student, currentMeal, addRealtimeEvent]);

  // Acknowledge Emergency Alert
  const acknowledgeEmergencyAlert = useCallback(() => {
    setEmergencyAlert((prev) => prev ? { ...prev, active: false, resolved: true } : null);
    addRealtimeEvent({
      type: 'FEEDBACK_ALERT',
      message: 'Mess Manager acknowledged quality alert. Kitchen sous-chef notified.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: 'info',
    });
  }, [addRealtimeEvent]);

  // Restock inventory item
  const restockItem = useCallback((itemId: string, amount: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentStockKg: item.currentStockKg + amount,
              lastUpdated: 'Just now',
            }
          : item
      )
    );
    addRealtimeEvent({
      type: 'STOCK_REORDER',
      message: `Restocked ${amount}kg of ${itemId.replace('ing_', '')}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: 'info',
    });
  }, [addRealtimeEvent]);

  // Fast Bulk Simulation for live testing
  const simulateBulkAction = useCallback((action: 'SKIP_BATCH' | 'CHECKIN_BATCH' | 'BAD_BATCH' | 'RESET') => {
    switch (action) {
      case 'SKIP_BATCH': {
        setBaseOptedOut((prev) => prev + 25);
        addRealtimeEvent({
          type: 'RSVP_SKIP',
          message: 'Simulation: 25 students submitted RSVP Skip via mobile app.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'info',
        });
        break;
      }
      case 'CHECKIN_BATCH': {
        setCheckedInCount((prev) => prev + 35);
        playSuccessChime();
        addRealtimeEvent({
          type: 'GATE_CHECKIN',
          message: 'Simulation: 35 students checked in at Gate 1 & 2 via dynamic QR.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'success',
        });
        setTimeslotData((prev) => {
          const copy = [...prev];
          if (copy[4]) copy[4] = { ...copy[4], actual: copy[4].actual + 35 };
          return copy;
        });
        break;
      }
      case 'BAD_BATCH': {
        const dummyBadReviews: MealFeedback[] = [
          {
            id: `sim-bad-${Date.now()}-1`,
            studentId: 'std_sim_1',
            studentName: 'Vikram Seth',
            roomNumber: '204',
            mealType: 'LUNCH',
            rating: 1,
            tags: ['Food was cold', 'Rotis are hard'],
            comment: 'Food served at line 3 is completely cold and rotis are stiff.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAlert: true,
            resolutionStatus: 'ALERT_ACTIVE',
          },
          {
            id: `sim-bad-${Date.now()}-2`,
            studentId: 'std_sim_2',
            studentName: 'Deepa Roy',
            roomNumber: '512',
            mealType: 'LUNCH',
            rating: 2,
            tags: ['Too Salty', 'Slow Dal Refill'],
            comment: 'Gravy was overly salty and queue was delayed 15 minutes.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAlert: true,
            resolutionStatus: 'ALERT_ACTIVE',
          },
        ];
        setFeedbacks((prev) => [...dummyBadReviews, ...prev]);
        playAlertEmergencyChime();
        setEmergencyAlert({
          active: true,
          reason: 'CRITICAL ALERT: Rolling average dropped to 2.4/5.0! Multiple reports of cold food at Counter 3.',
          avgScore: 2.4,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resolved: false,
        });
        addRealtimeEvent({
          type: 'FEEDBACK_ALERT',
          message: '🚨 CRITICAL ALERT: Quality average dipped below 3.0! Admin sirens active.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'emergency',
        });
        break;
      }
      case 'RESET': {
        setBaseOptedOut(342);
        setCheckedInCount(412);
        setRsvps({
          meal_breakfast_today: false,
          meal_lunch_today: false,
          meal_snacks_today: false,
          meal_dinner_today: false,
        });
        setFeedbacks(INITIAL_FEEDBACK);
        setInventory(INITIAL_INVENTORY);
        setTimeslotData(INITIAL_TIMESLOT_FOOTFALL);
        setEmergencyAlert(null);
        setClaimedTokens(new Set(['APN-SAMPLE-OLD']));
        addRealtimeEvent({
          type: 'GATE_CHECKIN',
          message: 'System state reset to baseline benchmark parameters.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: 'info',
        });
        break;
      }
    }
  }, [addRealtimeEvent]);

  const logMealPlateScrap = useCallback((mealLogId: string, scrapKg: number, potLeftoverKg: number) => {
    setDailyWastageLogs((prev) =>
      prev.map((log) => {
        if (log.id === mealLogId) {
          const totalEaten = Math.max(1, log.cookedWeightKg - potLeftoverKg - scrapKg);
          const clearanceRate = parseFloat(((totalEaten / (totalEaten + scrapKg)) * 100).toFixed(1));
          const isLowWaste = clearanceRate >= 94;
          return {
            ...log,
            studentPlateScrapKg: scrapKg,
            unservedPotLeftoverKg: potLeftoverKg,
            consumedWeightKg: totalEaten,
            plateClearanceRate: clearanceRate,
            verdict: isLowWaste ? 'CAMPUS_HIT' : clearanceRate >= 88 ? 'BALANCED' : 'DISLIKED_RECIPE',
          };
        }
        return log;
      })
    );
    addRealtimeEvent({
      type: 'GATE_CHECKIN',
      message: `Kitchen logged plate scale weigh-in: ${scrapKg}kg scrap, ${potLeftoverKg}kg pot leftover.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: 'info',
    });
  }, [addRealtimeEvent]);

  return (
    <MessContext.Provider
      value={{
        activeRole,
        setActiveRole,
        selectedMealId,
        setSelectedMealId,
        student,
        mealSessions,
        rsvps,
        activeToken,
        inventory,
        feedbacks,
        timeslotData,
        realtimeEvents,
        dailyWastageLogs,
        dishLikingAnalysis,
        stats,
        rollingAverageRating,
        emergencyAlert,
        toggleRsvp,
        scanToken,
        submitFeedback,
        acknowledgeEmergencyAlert,
        restockItem,
        simulateBulkAction,
        regenerateTokenNonce,
        logMealPlateScrap,
      }}
    >
      {children}
    </MessContext.Provider>
  );
};

export const useMess = () => {
  const context = useContext(MessContext);
  if (!context) {
    throw new Error('useMess must be used within a MessProvider');
  }
  return context;
};
