export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';

export type UserRole = 'STUDENT' | 'KITCHEN_STAFF' | 'MESS_MANAGER' | 'ADMIN';

export type TokenStatus = 'VALID' | 'CLAIMED' | 'EXPIRED' | 'SKIPPED';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  roomNumber: string;
  hostelBlock: string;
  email: string;
  mealPlan: string;
  rebateBalance: number; // in USD or INR equivalent
  mealsSkippedThisMonth: number;
  foodSavedKg: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  calories: number;
  description: string;
}

export interface IngredientRecipe {
  ingredientId: string;
  name: string;
  portionPerStudentGrams: number; // grams or ml per person
  unit: string;
}

export interface MealSession {
  id: string;
  type: MealType;
  title: string;
  timing: string;
  startTime: string; // e.g., "12:30"
  endTime: string;   // e.g., "14:30"
  rsvpDeadline: string; // e.g., "09:00"
  isRsvpLocked: boolean;
  activeStatus: 'UPCOMING' | 'ACTIVE' | 'CLOSED';
  menuItems: MenuItem[];
  recipes: IngredientRecipe[];
  baseEnrollment: number;
  estimatedCostPerMeal: number;
  rebateAmountPerSkip: number;
}

export interface EntryToken {
  tokenId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  roomNumber: string;
  mealType: MealType;
  mealSessionId: string;
  validDate: string;
  expiresAt: string;
  nonce: string;
  hmacSignature: string;
  status: TokenStatus;
  claimedAt?: string;
  gateScanned?: string;
}

export interface MealFeedback {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  mealType: MealType;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  timestamp: string;
  isAlert: boolean; // if rating < 3.0
  resolutionStatus: 'PENDING' | 'ALERT_ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  managerNote?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Grains' | 'Lentils' | 'Dairy' | 'Produce' | 'Oils & Spices';
  currentStockKg: number;
  minThresholdKg: number;
  costPerKg: number;
  unit: string;
  lastUpdated: string;
}

export interface HeadcountStats {
  registeredStudents: number;
  optedOutCount: number;
  expectedFootfall: number;
  checkedInCount: number;
  pendingCount: number;
  percentageAttendance: number;
  mealsSavedCount: number;
  rawFoodSavedKg: number;
  costSavedFunds: number;
}

export interface TimeSlotFootfall {
  slot: string; // "12:30", "12:45", etc.
  expected: number;
  actual: number;
}

export interface RealtimeEvent {
  id: string;
  type: 'RSVP_SKIP' | 'RSVP_OPTIN' | 'GATE_CHECKIN' | 'DUPLICATE_ALERT' | 'FEEDBACK_ALERT' | 'STOCK_REORDER';
  message: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'emergency';
}

export interface DailyMealWastageLog {
  id: string;
  mealType: MealType;
  date: string;
  cookedWeightKg: number;
  consumedWeightKg: number;
  unservedPotLeftoverKg: number; // food left in cooking pots
  studentPlateScrapKg: number;   // food thrown into plate disposal bin by students
  rsvpPreemptedSavedKg: number;  // food not cooked because students skipped early
  attendanceInflow: number;      // how many attended vs base
  plateClearanceRate: number;    // % eaten vs taken (e.g. 96%)
  tasteRatingAvg: number;        // e.g. 4.4
  verdict: 'CAMPUS_HIT' | 'BALANCED' | 'HIGH_WASTE_RISK' | 'DISLIKED_RECIPE';
}

export interface DishLikingAnalysis {
  id: string;
  dishName: string;
  category: string;
  estimatedPortionsServed: number;
  inflowEngagementPct: number;    // 0 to 100%
  plateWastePct: number;          // % of dish left on plates
  averageRating: number;          // 1 to 5 stars
  likingScore: number;            // 0 to 100 composite index
  verdict: 'CAMPUS_HIT' | 'CROWD_FAVORITE' | 'UNDER_REVIEW' | 'NEEDS_RECIPE_TWEAK';
  chefDiagnosis: string;
  suggestedAction: string;
}

export interface WasteThresholdConfig {
  maxPlateScrapPct: number;       // default 10%
  maxPotLeftoverPct: number;      // default 8%
  maxTotalWasteKg: number;        // default 35 kg
  maxLossDollars: number;         // default $50.00
  notificationEmail: string;
  enablePushAlerts: boolean;
  enableSousChefDispatch: boolean;
}

export interface WasteIncidentAlert {
  id: string;
  mealSessionId: string;
  mealType: MealType;
  date: string;
  severity: 'ELEVATED' | 'HIGH' | 'CRITICAL';
  triggerReason: string;
  plateScrapKg: number;
  plateScrapPct: number;
  potLeftoverKg: number;
  totalWasteKg: number;
  estimatedFinancialLoss: number;
  co2WastedKg: number;
  rootCauseAnalysis: string;
  actionRecommendation: string;
  dispatchedTo: string;
  timestamp: string;
  acknowledged: boolean;
}


