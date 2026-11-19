import React, { useState } from 'react';
import { Sparkles, DollarSign, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function UnusedLicenseOptimizer() {
  const { subscriptions, reclaimLicense } = useApp();
  const { currentUser, isAuditor } = useAuth();
  const [reclaimedSubs, setReclaimedSubs] = useState({});

  // Subscriptions with inactive seats > 90 days
  const unoptimized = subscriptions.filter(s => (s.inactiveUsers90d || 0) > 0);

  const totalPotentialSavings = subscriptions.reduce((sum, s) => {
    const inactive = Number(s.inactiveUsers90d) || 0;
    const unitCost = Math.round((Number(s.cost) || 0) / (Number(s.totalSeats) || 1));
    return sum + (inactive * unitCost);
  }, 0);

  const handleReclaim = (subId, seats) => {
    if (isAuditor) return;
    reclaimLicense(subId, seats, currentUser.name);
    setReclaimedSubs(prev => ({ ...prev, [subId]: true }));
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>SaaS License Optimizer</span>
            </span>
            <span className="text-xs text-slate-400">• Unused 90-Day Telemetry</span>
          </div>
          <h3 className="text-xl font-extrabold mt-1">
            Idle License Reclaim &amp; Budget Recovery
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            AssetOrbit continuously monitors user login telemetry across campus software suites. Reclaim idle seats to reduce annual licensing overhead.
          </p>
        </div>

        {/* Total Annual Savings Badge */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right min-w-[200px]">
          <span className="text-[10px] uppercase font-bold text-sky-300 block">Total Potential Recovery</span>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">
            ${totalPotentialSavings.toLocaleString()}<span className="text-xs font-normal text-slate-300">/year</span>
          </p>
        </div>
      </div>

      {/* Subscriptions with idle seats list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unoptimized.map((sub) => {
          const unitCost = Math.round(sub.cost / (sub.totalSeats || 1));
          const idleSavings = (sub.inactiveUsers90d || 0) * unitCost;
          const isDone = reclaimedSubs[sub.id];

          return (
            <div
              key={sub.id}
              className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-white truncate">{sub.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    {sub.vendor}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {sub.department} • Total: {sub.totalSeats} seats
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Unused &gt; 90 Days</span>
                    <span className="font-extrabold text-amber-400">{sub.inactiveUsers90d} Seats Idle</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Recoverable Cost</span>
                    <span className="font-extrabold text-emerald-400">+${idleSavings}/yr</span>
                  </div>
                </div>
              </div>

              {!isAuditor && (
                <button
                  disabled={isDone}
                  onClick={() => handleReclaim(sub.id, Math.min(sub.inactiveUsers90d, 15))}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 cursor-default'
                      : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Seats Reclaimed!</span>
                    </>
                  ) : (
                    <>
                      <span>Reclaim {Math.min(sub.inactiveUsers90d, 15)} Inactive Seats</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
