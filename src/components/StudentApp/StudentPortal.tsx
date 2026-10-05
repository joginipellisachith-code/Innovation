import React, { useState } from 'react';
import { useMess } from '../../context/MessContext';
import { DynamicQrPass } from './DynamicQrPass';
import { FeedbackModal } from './FeedbackModal';
import {
  Clock,
  Coins,
  Leaf,
  Heart,
  Flame,
  Star,
  Sparkles,
  ChefHat,
  MessageCircle,
  Share2,
  Bookmark,
  Check,
  CheckCircle,
  XCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StudentPortal: React.FC = () => {
  const {
    student,
    mealSessions,
    selectedMealId,
    setSelectedMealId,
    rsvps,
    toggleRsvp,
    setActiveRole,
    scanToken,
    activeToken,
    feedbacks,
  } = useMess();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [dishLikes, setDishLikes] = useState<Record<string, number>>({
    m4: 184, // Shahi Paneer
    m5: 142, // Dal Tadka
    m8: 236, // Gulab Jamun
  });
  const [userLikedDishes, setUserLikedDishes] = useState<Set<string>>(new Set(['m8']));

  const currentMeal = mealSessions.find((m) => m.id === selectedMealId) || mealSessions[1];
  const isSkipped = rsvps[selectedMealId] === true;

  const handleLikeDish = (dishId: string) => {
    setUserLikedDishes((prev) => {
      const next = new Set(prev);
      const isAlready = next.has(dishId);
      if (isAlready) {
        next.delete(dishId);
        setDishLikes((l) => ({ ...l, [dishId]: (l[dishId] || 1) - 1 }));
      } else {
        next.add(dishId);
        setDishLikes((l) => ({ ...l, [dishId]: (l[dishId] || 0) + 1 }));
      }
      return next;
    });
  };

  const handleSimulateScan = () => {
    scanToken(activeToken.tokenId, 'Gate 1 (North Entrance)');
    setActiveRole('KITCHEN_STAFF');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-10">
      {/* Blog Masthead Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-stone-200 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-bold tracking-widest text-amber-800 uppercase mb-1">
            <span>Volume 14 · Issue 28</span>
            <span aria-hidden="true">·</span>
            <span>Hostel Kaveri Dining</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-serif italic">
            The Campus Table
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xl font-sans">
            Daily culinary stories, fresh counter updates, and sustainable dining for residents.
          </p>
        </div>

        {/* Student Rebate Savings Ledger Badge */}
        <div className="flex items-center justify-center sm:justify-end gap-3 bg-amber-50/80 border border-amber-200/80 px-4 py-2.5 rounded-2xl shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs font-serif">
            {student.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="text-left">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase tracking-wider font-mono">
              Mess Fee Rebate
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold font-mono text-amber-950 tabular-nums">
                ${student.rebateBalance.toFixed(2)}
              </span>
              <span className="text-[11px] font-sans text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.2 rounded">
                Saved
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Interactive RSVP Banner with Spring Transition */}
      <motion.div
        layout
        className="bg-white border-2 border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-md shadow-amber-500/5 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Today's RSVP Decision
              </span>
              {currentMeal.isRsvpLocked ? (
                <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              ) : (
                <span className="text-xs font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3 text-emerald-600" /> Deadline: {currentMeal.rsvpDeadline}
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-stone-900 font-serif">
              Will you be joining us for {currentMeal.title}?
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-lg">
              Skipping early lets our chefs adjust pot sizes and prevents food waste. You receive a direct{' '}
              <strong className="text-amber-800 font-bold font-mono">+${currentMeal.rebateAmountPerSkip.toFixed(2)}</strong> credit on your mess bill.
            </p>
          </div>

          {/* Interactive Toggle Switch */}
          <div className="flex items-center gap-2 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200 shrink-0">
            <button
              disabled={currentMeal.isRsvpLocked}
              onClick={() => toggleRsvp(selectedMealId, false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isSkipped
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Attending 😋</span>
            </button>

            <button
              disabled={currentMeal.isRsvpLocked}
              onClick={() => toggleRsvp(selectedMealId, true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSkipped
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Skip (+${currentMeal.rebateAmountPerSkip.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Meal Editions Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {mealSessions.map((session) => {
          const isSelected = session.id === selectedMealId;
          const isMealSkipped = rsvps[session.id] === true;
          return (
            <button
              key={session.id}
              onClick={() => setSelectedMealId(session.id)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              <span>{session.type}</span>
              <span className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-500'
              }`}>
                {isMealSkipped ? 'Skipped' : 'Attending'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Blog Magazine Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editorial Articles & Dish Stories (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Article 1: Chef's Feature Dish Story */}
          <article className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            {/* Tag & Reading Time */}
            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span className="text-amber-700 font-bold uppercase tracking-wider">Chef's Spotlight</span>
              <span>4 min read · Hot Counter</span>
            </div>

            {/* Story Headline */}
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight font-serif italic">
                Shahi Paneer &amp; Dal Tadka: Slow Simmered for the Grand Lunch Buffet
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                By Chef Murthy &amp; the Kaveri Culinary Team
              </p>
            </div>

            {/* Culinary Graphic Card Container */}
            <div className="relative rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 p-6 text-white shadow-md overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col justify-between h-44">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white">
                    Speciality Menu
                  </span>
                  <span className="text-xs font-mono font-bold bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full shadow-xs">
                    Pure Vegetarian
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black font-serif tracking-tight drop-shadow-xs">
                    Cottage Cheese in Rich Cashew &amp; Cardamom Gravy
                  </h3>
                  <p className="text-xs text-amber-100/90 mt-1 line-clamp-2">
                    Simmered for 4 hours with fresh tomatoes, whole aromatic spices, and finished with a swirl of fresh cream.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-amber-100">
                  <span>340 kcal/portion</span>
                  <span>·</span>
                  <span>22g Protein</span>
                  <span>·</span>
                  <span>Zero Preservatives</span>
                </div>
              </div>
            </div>

            {/* Story Excerpt & Recipe Notes */}
            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 font-serif">
              <p>
                "For today's grand lunch, our pantry received 75kg of farm-fresh cottage cheese directly from the dairy cooperative. We've paired it with a slow-tempered yellow dal tadka, aged fragrant basmati jeera rice, and piping hot phulkas right off the iron tawas."
              </p>
              <p className="text-stone-500 text-xs font-sans italic">
                Chef's Tip: Head over to Counter 2 for freshly rolled rotis with a brush of desi ghee.
              </p>
            </div>

            {/* Dish Items Upvote & Macro Carousel */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono block">
                Today's Dish Lineup (Tap ❤️ to Upvote)
              </span>

              <div className="space-y-2.5">
                {currentMeal.menuItems.map((item) => {
                  const likes = dishLikes[item.id] || 42;
                  const isUserLiked = userLikedDishes.has(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-3.5 bg-stone-50/80 hover:bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-bold text-xs text-amber-600 font-mono shrink-0 shadow-2xs">
                          {item.isVeg ? '🌱' : '🍗'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{item.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{item.calories} kcal</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLikeDish(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isUserLiked
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-white text-stone-500 border border-stone-200 hover:text-stone-800'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isUserLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span className="font-mono text-[11px]">{likes}</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Review CTA */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">Tasted this meal already?</span>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs"
              >
                <Star className="w-3.5 h-3.5 fill-amber-900 text-amber-900" />
                <span>Write a Foodie Review</span>
              </button>
            </div>
          </article>

          {/* Article 2: Student Foodie Community Feed */}
          <section className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900 font-serif">Hostelite Reviews &amp; Notes</h3>
              </div>
              <span className="text-xs text-stone-400 font-mono">Live Pulse</span>
            </div>

            <div className="space-y-3">
              {feedbacks.slice(0, 3).map((fb) => (
                <div key={fb.id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{fb.studentName}</span>
                      <span className="text-[10px] text-stone-400 font-mono">Room #{fb.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {fb.comment && <p className="text-stone-600 italic font-serif">"{fb.comment}"</p>}
                  {fb.tags && fb.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {fb.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-white text-stone-600 border border-stone-200 px-2 py-0.5 rounded-full font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Digital Dining Pass & Impact Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <DynamicQrPass onSimulateGateScan={handleSimulateScan} />

          {/* Today's Plate Cleanliness & Community Taste Pulse */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-stone-900 font-serif">
                  Today's Clean Plate Pulse
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                96.8% Eaten Clean
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed">
              <p>
                Our dish return scale recorded only <strong>12 kg plate scrap</strong> from over 840 lunch servings today — proving high student taste approval!
              </p>

              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900 font-mono uppercase tracking-wider block">
                  Top Student Hits Today
                </span>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-stone-800 font-bold">1. Shahi Paneer</span>
                  <span className="text-emerald-700 font-extrabold">97% Liking</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-stone-800 font-bold">2. Gulab Jamun</span>
                  <span className="text-emerald-700 font-extrabold">99% Liking</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-stone-800 font-bold">3. Dal Tadka</span>
                  <span className="text-sky-700 font-extrabold">87% Liking</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 font-sans border-t border-stone-100 flex items-center justify-between">
              <span>Finished your tray?</span>
              <span className="text-emerald-700 font-bold">Zero Food Waste ⭐</span>
            </div>
          </div>

          {/* Environmental & Financial Impact Story Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider font-mono">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Campus Sustainability Impact</span>
            </div>
            <h4 className="text-base font-bold text-stone-900 font-serif">
              How RSVP Skips Saved 154 kg of Grain Today
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              When you skip a meal you won't attend, our kitchen doesn't over-purchase raw basmati or vegetables. Over <strong>$14,200</strong> in unused mess fees are rebated back to hostel residents every semester.
            </p>

            <div className="pt-2 flex items-center justify-between text-xs font-mono text-emerald-800 font-bold border-t border-emerald-200/60">
              <span>Semester Diverted: 3,240 kg</span>
              <span>CO₂ Offset: 8,100 kg</span>
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
};
