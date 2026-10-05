/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessProvider, useMess } from './context/MessContext';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentApp/StudentPortal';
import { KitchenTerminal } from './components/KitchenStaff/KitchenTerminal';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { CodeHub } from './components/Architecture/CodeHub';
import { SimulationControlPanel } from './components/Simulation/SimulationControlPanel';

function MainAppContent() {
  const { activeRole, setActiveRole } = useMess();
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Navbar onOpenSimulation={() => setIsSimulationOpen(true)} />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {activeRole === 'STUDENT' && <StudentPortal />}
        {activeRole === 'KITCHEN_STAFF' && <KitchenTerminal />}
        {(activeRole === 'MESS_MANAGER' || activeRole === 'ADMIN') && <AdminDashboard />}
        {activeRole === 'ARCHITECTURE' && <CodeHub />}
      </main>

      {/* Simulation Control Drawer */}
      <SimulationControlPanel
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />

      {/* Clean Campus Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Annapurna Campus Dining</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time College Mess Management &amp; Food Wastage Mitigation</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono font-medium">
            <button
              onClick={() => setActiveRole('STUDENT')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Student App
            </button>
            <button
              onClick={() => setActiveRole('KITCHEN_STAFF')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Kitchen Counter
            </button>
            <button
              onClick={() => setActiveRole('MESS_MANAGER')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Manager Insights
            </button>
            <button
              onClick={() => setActiveRole('ARCHITECTURE')}
              className="hover:text-amber-800 transition-colors text-amber-600 font-bold"
            >
              SQL &amp; Backend Code
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MessProvider>
      <MainAppContent />
    </MessProvider>
  );
}
