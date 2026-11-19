import React from 'react';
import { TrendingUp, AlertTriangle, Layers, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PriceHikeTracker() {
  const { subscriptions } = useApp();

  // Filter subscriptions that have had price increases or price history
  const hikedSubs = subscriptions.filter(s => {
    if (!s.previousCost) return false;
    return Number(s.cost) > Number(s.previousCost);
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              <span>Price Hike Detection Sentinel</span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            Vendor Renewal Cost Jump Alerts &amp; Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Automatically compares invoice and renewal quotes against historical agreements to flag unexpected price inflation.
          </p>
        </div>
      </div>

      {hikedSubs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          No recent price hikes detected across vendor agreements.
        </div>
      ) : (
        <div className="space-y-4">
          {hikedSubs.map((sub) => {
            const oldCost = Number(sub.previousCost);
            const newCost = Number(sub.cost);
            const diff = newCost - oldCost;
            const percent = (((diff) / oldCost) * 100).toFixed(1);

            return (
              <div
                key={sub.id}
                className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300 flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sub.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center space-x-1">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>+{percent}% Hike</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Vendor: <span className="font-semibold text-slate-700 dark:text-slate-200">{sub.vendor}</span> • Dept: {sub.department}
                    </p>
                    {sub.priceHikeHistory && sub.priceHikeHistory.length > 0 && (
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium mt-1">
                        Note: {sub.priceHikeHistory[sub.priceHikeHistory.length - 1].note || 'Vendor license rate revision'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-rose-200 dark:border-rose-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous Rate</span>
                    <span className="text-xs text-slate-400 line-through font-mono">
                      ${oldCost.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Current Quote</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      ${newCost.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Yearly Budget Impact</span>
                    <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                      +${diff.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
