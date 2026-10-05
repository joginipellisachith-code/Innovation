import React, { useState } from 'react';
import { useMess } from '../../context/MessContext';
import { QrCode, ScanLine, CheckCircle2, AlertTriangle, XCircle, Camera, Sparkles } from 'lucide-react';

export const QrScannerView: React.FC = () => {
  const { scanToken, activeToken, student } = useMess();
  const [inputToken, setInputToken] = useState<string>('');
  const [selectedGate, setSelectedGate] = useState<string>('Gate 1 (North Entrance)');
  const [scanResult, setScanResult] = useState<{
    status: 'IDLE' | 'VERIFIED' | 'DUPLICATE' | 'SKIPPED' | 'INVALID';
    message: string;
    studentName?: string;
    rollNumber?: string;
  }>({ status: 'IDLE', message: '' });

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;

    const res = scanToken(inputToken, selectedGate);
    setScanResult({
      status: res.status,
      message: res.message,
      studentName: res.studentName,
      rollNumber: res.rollNumber,
    });

    setInputToken('');
  };

  const handleQuickScanStudent = () => {
    const res = scanToken(activeToken.tokenId, selectedGate);
    setScanResult({
      status: res.status,
      message: res.message,
      studentName: res.studentName,
      rollNumber: res.rollNumber,
    });
  };

  const handleQuickScanRandom = () => {
    const randomRoll = `22BCE${Math.floor(1000 + Math.random() * 900)}`;
    const randomToken = `APN-${randomRoll}-LUN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const res = scanToken(randomToken, selectedGate);
    setScanResult({
      status: res.status,
      message: res.message,
      studentName: res.studentName,
      rollNumber: res.rollNumber,
    });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dining Hall Gate Turnstile Scanner</h3>
            <span className="text-xs text-slate-500">Fast barcode &amp; mobile pass validator</span>
          </div>
        </div>

        {/* Gate Selector */}
        <select
          value={selectedGate}
          onChange={(e) => setSelectedGate(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
        >
          <option value="Gate 1 (North Entrance)">Gate 1 (North Entrance)</option>
          <option value="Gate 2 (South Entrance)">Gate 2 (South Entrance)</option>
          <option value="Gate 3 (Dining Hall West)">Gate 3 (Dining Hall West)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Viewfinder Reticle / Camera Simulation */}
        <div className="md:col-span-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center relative overflow-hidden h-64">
          {/* Scanning Reticle Frame */}
          <div className="relative w-44 h-44 bg-white border-2 border-amber-300 rounded-2xl flex items-center justify-center shadow-xs">
            <Camera className="w-9 h-9 text-slate-300" />
            {/* Corner brackets */}
            <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-amber-500 rounded-tl" />
            <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-amber-500 rounded-tr" />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-amber-500 rounded-bl" />
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-amber-500 rounded-br" />

            {/* Laser Line */}
            <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-sm shadow-emerald-400 animate-scan-line" />
          </div>

          <span className="text-[11px] font-mono font-medium text-slate-600 mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Turnstile Ready · High-speed check</span>
          </span>
        </div>

        {/* Verification Result & Quick Actions */}
        <div className="md:col-span-6 space-y-4">
          {/* Result Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              scanResult.status === 'VERIFIED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : scanResult.status === 'DUPLICATE'
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                : scanResult.status === 'SKIPPED'
                ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.status === 'VERIFIED' && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
              {scanResult.status === 'DUPLICATE' && <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />}
              {scanResult.status === 'SKIPPED' && <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
              {scanResult.status === 'IDLE' && <QrCode className="w-6 h-6 text-slate-400 shrink-0" />}

              <div>
                <div className="text-xs font-bold uppercase tracking-wider font-mono">
                  {scanResult.status === 'IDLE' ? 'Turnstile Standby' : `Gate Result: ${scanResult.status}`}
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {scanResult.message || 'Waiting for next student QR pass or tap emulator below.'}
                </div>
                {scanResult.studentName && (
                  <div className="text-xs text-slate-700 mt-1 font-mono font-medium">
                    Student: {scanResult.studentName} ({scanResult.rollNumber})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick 1-Click Scan Triggers */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
              Quick Test Emulators (Tap to Scan)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickScanStudent}
                className="py-2.5 px-3 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan {student.name.split(' ')[0]}'s Pass</span>
              </button>

              <button
                type="button"
                onClick={handleQuickScanRandom}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Scan Next Student</span>
              </button>
            </div>
          </div>

          {/* Manual Token String Input */}
          <form onSubmit={handleScanSubmit} className="pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Scan or paste Token ID (e.g. APN-22BCE1042-LUN...)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white font-mono transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Check
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
