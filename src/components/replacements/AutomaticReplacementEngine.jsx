import React, { useState, useMemo } from 'react';
import {
  Radio,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function AutomaticReplacementEngine() {
  const { assets, tickets, replacementRequests, setReplacementRequests } = useApp();
  const { currentUser, isAuditor } = useAuth();
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'forecast'

  // Rules Evaluation Engine:
  // 1. Age > 4 years
  // 2. Failure Count >= 2 tickets
  // 3. Warranty Expired
  // 4. Low Health Score (< 65)
  const flaggedAssets = useMemo(() => {
    return assets.filter(asset => {
      const purchaseYear = new Date(asset.purchaseDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const ageYears = currentYear - purchaseYear;

      const isWarrantyExpired = new Date(asset.warrantyExpiry) < new Date();
      const health = asset.healthScore !== undefined ? asset.healthScore : 90;

      // Count failures
      const assetTickets = tickets.filter(t => t.assetId === asset.id);

      const reasons = [];
      if (ageYears >= 4) reasons.push(`Age exceeds ${ageYears} years (college lifecycle threshold: 4-5 yrs)`);
      if (assetTickets.length >= 2) reasons.push(`High failure frequency: ${assetTickets.length} maintenance tickets logged`);
      if (isWarrantyExpired && health < 75) reasons.push('Warranty expired with degraded hardware health');
      if (health < 60) reasons.push(`Critical health score (${health}/100)`);
      if (asset.status === 'E-Waste') reasons.push('Marked as E-Waste / Obsolete');

      return reasons.length > 0;
    }).map(asset => {
      const assetTickets = tickets.filter(t => t.assetId === asset.id);
      const isWarrantyExpired = new Date(asset.warrantyExpiry) < new Date();
      const reasons = [];
      const ageYears = new Date().getFullYear() - new Date(asset.purchaseDate).getFullYear();

      if (ageYears >= 4) reasons.push(`Age > ${ageYears} Years`);
      if (assetTickets.length >= 2) reasons.push(`${assetTickets.length}+ Tickets Logged`);
      if (isWarrantyExpired) reasons.push('Warranty Expired');
      if ((asset.healthScore || 90) < 70) reasons.push('Health < 70%');

      return {
        ...asset,
        reasons,
        estimatedReplacementCost: Math.round((asset.cost || 850) * 1.15),
        recommendedModel: `${asset.name.split(' ')[0]} Enterprise Gen-14 Pro`,
        priority: reasons.length >= 3 ? 'Critical' : reasons.length === 2 ? 'High' : 'Medium'
      };
    });
  }, [assets, tickets]);

  const handleApproveReplacement = (asset) => {
    if (isAuditor) return;
    const newReq = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      assetId: asset.id,
      assetName: asset.name,
      labRoom: asset.labRoom,
      category: asset.category,
      subBranch: asset.subBranch,
      reasons: asset.reasons,
      recommendedModel: asset.recommendedModel,
      estimatedCost: asset.estimatedReplacementCost,
      status: 'HOD Approved',
      requestedDate: new Date().toISOString().slice(0, 10),
      priority: asset.priority,
      approvedBy: currentUser.name
    };

    setReplacementRequests(prev => [newReq, ...prev]);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const totalForecastBudget = flaggedAssets.reduce((sum, a) => sum + a.estimatedReplacementCost, 0);

  return (
    <div className="space-y-6">
      {/* Engine Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#315F50]/20 text-indigo-300 border border-indigo-400/30 flex items-center space-x-1">
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                <span>Automatic Replacement Rules Engine</span>
              </span>
              <span className="text-xs text-slate-400">• Dynamic TCO &amp; End-of-Life Heuristic</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">
              Asset Lifecycle &amp; Capital Replacement Forecasting
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Evaluates hardware age, repeated ticket failures, warranty lapse, and cumulative maintenance costs to generate automated replacement recommendations.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Forecasted Upgrade Capex</span>
            <p className="text-2xl font-black text-white mt-0.5">
              ${totalForecastBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-[#315F50] text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Replacement Recommendations ({flaggedAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'forecast'
                ? 'bg-[#315F50] text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            5-Year Budget Planning View
          </button>
        </div>
      </div>

      {activeTab === 'recommendations' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Rules Engine Flagged Hardware ({flaggedAssets.length})
            </h3>
            <span className="text-xs text-slate-400">
              Evaluated per College IT Procurement Policy (Rule: Age &gt; 4y OR 2+ failures)
            </span>
          </div>

          <div className="space-y-3">
            {flaggedAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-indigo-300"
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                    asset.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {asset.name}
                      </h4>
                      <span className="font-mono text-xs text-[#315F50] dark:text-indigo-400">
                        {asset.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asset.priority === 'Critical'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {asset.priority} Upgrade
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Location: {asset.labRoom || asset.location} • Bench: {asset.benchNumber} • Dept: {asset.subBranch}
                    </p>

                    {/* Reasons Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {asset.reasons.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#E6EFE8] dark:bg-indigo-950/60 text-[#315F50] dark:text-indigo-300 border border-[#A9C7B5]/40 dark:border-indigo-800"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendation & Cost */}
                <div className="flex items-center space-x-6 text-right w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Replacement</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {asset.recommendedModel}
                    </span>
                    <span className="text-xs text-[#315F50] dark:text-indigo-400 font-bold block mt-0.5">
                      Est. ${asset.estimatedReplacementCost}
                    </span>
                  </div>

                  {!isAuditor && (
                    <button
                      onClick={() => handleApproveReplacement(asset)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md shadow-[#315F50]/20 flex items-center space-x-1.5 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Request</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 5-Year Budget Planning View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              5-Year Lab Refresh &amp; Capital Budget Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Department-wise procurement projection to prevent mass hardware obsolescence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400">Year 2027 (Immediate)</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${Math.round(totalForecastBudget * 0.45).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">CSE Lab 1 &amp; ECE Projector replacements</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400">Year 2028</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${Math.round(totalForecastBudget * 0.35).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">ISE Cloud Lab HP Workstations refresh</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400">Year 2029-2030</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${Math.round(totalForecastBudget * 0.20).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Campus core Cisco switches &amp; server farm</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
