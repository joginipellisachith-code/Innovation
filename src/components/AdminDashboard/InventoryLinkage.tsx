import React, { useState } from 'react';
import { useMess } from '../../context/MessContext';
import { Package, Plus, Scale } from 'lucide-react';

export const InventoryLinkage: React.FC = () => {
  const { inventory, stats, mealSessions, selectedMealId, restockItem } = useMess();
  const [restockModalItem, setRestockModalItem] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);

  const currentMeal = mealSessions.find((m) => m.id === selectedMealId) || mealSessions[1];

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockModalItem) {
      restockItem(restockModalItem, restockAmount);
      setRestockModalItem(null);
      setRestockAmount(50);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automated Raw Material Inventory Linkage</h3>
            <span className="text-xs text-slate-500">
              Auto-calculated recipe deduction for {stats.expectedFootfall} RSVP attendees
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono font-bold">
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>Raw Food Saved Today: {stats.rawFoodSavedKg} kg</span>
        </div>
      </div>

      {/* Recipe Ingredient Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
              <th className="pb-2.5 font-bold uppercase">Ingredient</th>
              <th className="pb-2.5 font-bold uppercase">Portion / Student</th>
              <th className="pb-2.5 font-bold uppercase text-right">Prep Target</th>
              <th className="pb-2.5 font-bold uppercase text-right text-emerald-700">Saved from Waste</th>
              <th className="pb-2.5 font-bold uppercase text-right">Current Stock</th>
              <th className="pb-2.5 font-bold uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentMeal.recipes.map((recipe) => {
              const invItem = inventory.find((i) => i.id === recipe.ingredientId);
              const totalNeededKg = ((recipe.portionPerStudentGrams * stats.expectedFootfall) / 1000).toFixed(1);
              const savedKg = ((recipe.portionPerStudentGrams * stats.optedOutCount) / 1000).toFixed(1);
              const isLowStock = invItem ? invItem.currentStockKg < invItem.minThresholdKg : false;

              return (
                <tr key={recipe.ingredientId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 block">{recipe.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Category: {invItem?.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-700 font-medium">
                    {recipe.portionPerStudentGrams} {recipe.unit}
                  </td>
                  <td className="py-3 text-right font-mono text-amber-900 font-bold tabular-nums">
                    {totalNeededKg} kg
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-700 font-extrabold tabular-nums">
                    +{savedKg} kg
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`font-mono text-xs font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                        {invItem?.currentStockKg.toFixed(0)} / {invItem?.minThresholdKg} kg
                      </span>
                      <span className={`text-[10px] font-mono font-medium ${isLowStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isLowStock ? '⚠️ Low Threshold' : 'Nominal'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setRestockModalItem(recipe.ingredientId)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3 h-3 text-slate-500" />
                      <span>Restock</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Restock Dialog Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h4 className="text-base font-extrabold text-slate-900 mb-1">Restock Supplies</h4>
            <p className="text-xs text-slate-500 mb-4">
              Add bulk bags or containers to the central college storehouse.
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Restock (kg/liters)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xs"
                >
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
