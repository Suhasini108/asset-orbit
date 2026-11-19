import React, { useMemo } from 'react';
import {
  Download,
  Wallet,
  Package,
  Building2,
  FileText,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCsv } from '../data/templates';

export default function ReportsPage() {
  const { assets, subscriptions, categories } = useApp();

  // Metrics calculation
  const totalAssetValue = useMemo(() => {
    return assets.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
  }, [assets]);

  const annualRecurringCost = useMemo(() => {
    const monthly = subscriptions.reduce((sum, s) => {
      const c = Number(s.cost) || 0;
      if (s.billingCycle === 'yearly' || s.billingCycle === 'Annual') {
        return sum + Math.round(c / 12);
      }
      return sum + c;
    }, 0);
    return monthly * 12;
  }, [subscriptions]);

  const unassignedCount = useMemo(() => {
    return assets.filter(a => a.status === 'Available' || !a.assignedUser).length;
  }, [assets]);

  const representedDepts = useMemo(() => {
    const set = new Set();
    assets.forEach(a => {
      if (a.subBranch) set.add(a.subBranch);
      else if (a.category) set.add(a.category);
    });
    return set.size;
  }, [assets]);

  // Dept counts
  const deptCounts = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      const key = a.subBranch || a.category || 'General';
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [assets]);

  const handleExportCsv = () => {
    const headers = ['id', 'name', 'category', 'subBranch', 'cost', 'status', 'purchaseDate'];
    exportToCsv('AssetOrbit_Reports_Analytics', headers, assets);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. HERO BANNER (Identical Color Theme as Asset Page) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-7 sm:p-9 shadow-xl shadow-[#234937]/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
                Executive Reports
              </span>
              <button
                onClick={() => { window.location.reload(); }}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-[#badcc9] hover:text-white transition-colors"
                title="Refresh report analytics"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>Reports &amp; Analytics</span>
              <span className="text-xl">📊</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#d8eee1] max-w-xl leading-relaxed">
              A clear executive view of total institutional asset value and annual recurring subscription expenditure.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all backdrop-blur-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Asset Value */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718078]">
              Total Asset Value
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#172D27] leading-none">
              ₹{totalAssetValue.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#718078] mt-2 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#315F50] inline-block" />
              <span>Recorded purchase value</span>
            </p>
          </div>
        </div>

        {/* Annual Recurring Cost */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718078]">
              Annual Recurring Cost
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#172D27] leading-none">
              ₹{annualRecurringCost.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#718078] mt-2 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#315F50] inline-block" />
              <span>Monthly spend &times; 12</span>
            </p>
          </div>
        </div>

        {/* Unassigned Assets */}
        <div className="p-5 rounded-3xl bg-[#F9EBDD] border border-[#F9EBDD] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">
              Unassigned Assets
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white text-amber-800 flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#172D27] leading-none">
              {unassignedCount}
            </p>
            <p className="text-[11px] text-amber-900 mt-2 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-700 inline-block" />
              <span>Available for allocation</span>
            </p>
          </div>
        </div>

        {/* Departments */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718078]">
              Active Departments
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-[#172D27] leading-none">
              {representedDepts}
            </p>
            <p className="text-[11px] text-[#718078] mt-2 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#315F50] inline-block" />
              <span>Represented in institutional inventory</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. MID ROW: Assets by Department & Subscription Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Assets by department */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
            <div>
              <h3 className="text-sm font-extrabold text-[#172D27]">
                Assets by Department
              </h3>
              <p className="text-xs text-[#718078]">
                Equipment distribution across campus laboratories &amp; branches
              </p>
            </div>
            <span className="text-xs font-bold text-[#315F50] bg-[#E6EFE8] px-2.5 py-1 rounded-full">
              {Object.keys(deptCounts).length} Branches
            </span>
          </div>

          <div className="py-2">
            {Object.keys(deptCounts).length === 0 ? (
              <p className="text-xs text-center text-[#718078] py-8">No asset data available.</p>
            ) : (
              <div className="space-y-2.5">
                {Object.keys(deptCounts).map(dept => (
                  <div key={dept} className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] hover:border-[#315F50] transition-colors">
                    <span className="font-bold text-xs text-[#172D27]">{dept}</span>
                    <span className="font-extrabold text-xs text-[#315F50] bg-white px-2.5 py-1 rounded-xl border border-[#E5EAE5] shadow-xs">
                      {deptCounts[dept]} assets
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Subscription cost breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
            <div>
              <h3 className="text-sm font-extrabold text-[#172D27]">
                Subscription Cost Breakdown
              </h3>
              <p className="text-xs text-[#718078]">
                Monthly equivalent spend by software license
              </p>
            </div>
            <span className="text-xs font-bold text-[#315F50] bg-[#E6EFE8] px-2.5 py-1 rounded-full">
              {subscriptions.length} Services
            </span>
          </div>

          <div className="py-2">
            {subscriptions.length === 0 ? (
              <p className="text-xs text-center text-[#718078] py-8">No active subscription data available.</p>
            ) : (
              <div className="space-y-2.5">
                {subscriptions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] hover:border-[#315F50] transition-colors">
                    <div>
                      <span className="font-bold text-xs text-[#172D27] block">{s.name}</span>
                      <span className="text-[10px] text-[#718078]">{s.billingCycle} • {s.category || 'Software'}</span>
                    </div>
                    <span className="font-extrabold text-xs text-[#315F50] bg-white px-2.5 py-1 rounded-xl border border-[#E5EAE5] shadow-xs">
                      ₹{s.cost}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM FOOTNOTE CONTAINER */}
      <div className="p-5 rounded-3xl bg-[#E6EFE8] border border-[#A9C7B5]/40 shadow-xs flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#315F50] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-[#172D27]">
            Institutional Inventory Integrity Verified
          </h4>
          <p className="text-xs text-[#718078] leading-relaxed">
            All calculations are generated live from AssetOrbit records. Periodic backups and CSV ledger exports maintain a verified institutional audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}
