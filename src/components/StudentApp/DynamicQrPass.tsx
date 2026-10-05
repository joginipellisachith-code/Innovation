import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useMess } from '../../context/MessContext';
import { QrCode, RefreshCw, ShieldCheck, Clock, CheckCircle2, Sparkles, Coffee, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DynamicQrPassProps {
  onSimulateGateScan?: () => void;
}

export const DynamicQrPass: React.FC<DynamicQrPassProps> = ({ onSimulateGateScan }) => {
  const { activeToken, student, rsvps, selectedMealId, mealSessions, regenerateTokenNonce } = useMess();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [showQrExpanded, setShowQrExpanded] = useState<boolean>(true);

  const currentMeal = mealSessions.find((m) => m.id === selectedMealId) || mealSessions[1];
  const isSkipped = rsvps[selectedMealId] === true;

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 60-second countdown for rotating security nonce
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          regenerateTokenNonce();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [regenerateTokenNonce]);

  // Generate QR code on canvas whenever token changes
  useEffect(() => {
    if (!canvasRef.current || isSkipped) return;

    const qrPayload = JSON.stringify({
      code: activeToken.tokenId,
      studentId: activeToken.studentId,
      roll: activeToken.rollNumber,
      meal: activeToken.mealType,
      expiresAt: activeToken.expiresAt,
      sig: activeToken.hmacSignature,
    });

    QRCode.toCanvas(
      canvasRef.current,
      qrPayload,
      {
        width: 170,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) console.error('QR render error', err);
      }
    );
  }, [activeToken, isSkipped]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm overflow-hidden relative"
    >
      {/* Top Banner: University Pass Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block leading-tight font-serif">
              Hostel Kaveri Dining Pass
            </span>
            <span className="text-[10px] text-stone-400 font-mono tracking-tight">
              AY 2026-27 · Valid Resident
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/70 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>{currentTimeStr || '12:30:00 PM'}</span>
        </span>
      </div>

      {/* Main Pass Container: Styled as an Apple Wallet / Campus ID Keycard */}
      <div className="py-4">
        {isSkipped ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full py-8 px-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 flex flex-col items-center justify-center text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 shadow-2xs">
              <Coffee className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900 font-serif">Meal Opted Out</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-[220px]">
              You chose to skip {currentMeal.title}. Enjoy your time out!
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-800 bg-white border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>+${currentMeal.rebateAmountPerSkip.toFixed(2)} Credited to Mess Bill</span>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Elegant Digital Card Frame */}
            <div className="w-full bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
              {/* Card Background watermark */}
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-sm font-serif">
                    {student.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight font-serif">
                      {student.name}
                    </span>
                    <span className="text-[10px] text-amber-300/90 font-mono">
                      {student.rollNumber} · Room {student.roomNumber}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Pass Active</span>
                </span>
              </div>

              {/* QR Container */}
              <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-inner relative">
                <canvas ref={canvasRef} className="block w-40 h-40 rounded" />
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-scan-line pointer-events-none" />
              </div>

              {/* Refreshing Security Nonce */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-stone-300">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Refreshes in <strong className="text-amber-300">{secondsRemaining}s</strong></span>
                </span>
                <span className="text-stone-400">Gate: All Turnstiles</span>
              </div>
            </div>

            {/* Test Gate Scanner Trigger */}
            {onSimulateGateScan && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSimulateGateScan}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm shadow-amber-400/20"
              >
                <QrCode className="w-4 h-4 text-stone-900" />
                <span>Test Turnstile Check-in</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Footer Notes */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-mono">
        <span>Token: {activeToken.tokenId}</span>
        <span className="text-emerald-700 font-medium">Secured with HMAC</span>
      </div>
    </motion.div>
  );
};
