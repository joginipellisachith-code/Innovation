import React from 'react';
import { useMess } from '../context/MessContext';
import { UserRole } from '../types/mess';
import { BookOpen, ChefHat, BarChart3, Code2, AlertTriangle, Sparkles, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  onOpenSimulation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSimulation }) => {
  const { activeRole, setActiveRole, emergencyAlert } = useMess();

  const navItems: { role: UserRole | 'ARCHITECTURE'; label: string; icon: React.ReactNode }[] = [
    { role: 'STUDENT', label: 'Dining Journal', icon: <BookOpen className="w-4 h-4" /> },
    { role: 'KITCHEN_STAFF', label: 'Chef Counter', icon: <ChefHat className="w-4 h-4" /> },
    { role: 'MESS_MANAGER', label: 'Impact & Trends', icon: <BarChart3 className="w-4 h-4" /> },
    { role: 'ARCHITECTURE', label: 'System Schemas', icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FCFAF7]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand: Editorial Magazine Masthead */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/25">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-stone-900 block leading-tight font-serif italic">
                Annapurna
              </span>
              <span className="text-[11px] font-sans font-semibold tracking-wider text-amber-800 uppercase block">
                The Campus Food Journal
              </span>
            </div>
          </div>

          {/* Navigation Links with Motion sliding pill */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/70">
            {navItems.map((item) => {
              const isActive = activeRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => setActiveRole(item.role)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
                    isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navTabIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-stone-200/80"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Zone: Simulation Trigger & Alerts */}
          <div className="flex items-center gap-2.5">
            {emergencyAlert && emergencyAlert.active && (
              <button
                onClick={() => setActiveRole('MESS_MANAGER')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Chef Alert:</span>
                <span className="font-mono">{emergencyAlert.avgScore}★</span>
              </button>
            )}

            <button
              onClick={onOpenSimulation}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-stone-800 bg-amber-100/80 hover:bg-amber-200/70 border border-amber-300/80 rounded-xl transition-all shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Simulate Events</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-stone-200/60 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const isActive = activeRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => setActiveRole(item.role)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-600 bg-stone-100 border border-stone-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
