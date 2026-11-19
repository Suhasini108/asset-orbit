import React, { useState } from 'react';
import {
  Repeat,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Plus,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import LoanerPoolModal from '../components/loaners/LoanerPoolModal';
import confetti from 'canvas-confetti';

export default function LoanersPage() {
  const { assets, returnLoaner } = useApp();
  const { currentUser, isAuditor } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Filter loaners
  const loanerAssets = assets.filter(a =>
    (a.batchId && a.batchId.includes('LOANER')) || a.name.toLowerCase().includes('loaner') || a.assignedUser?.includes('Temp')
  );

  const activeLoans = loanerAssets.filter(a => a.status === 'Assigned');
  const availableStandby = loanerAssets.filter(a => a.status === 'Available');

  const handleReturn = (loanerId) => {
    if (isAuditor) return;
    returnLoaner(loanerId, null, currentUser.name);
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6EFE8] text-[#315F50] dark:bg-indigo-950 dark:text-indigo-300 border border-[#A9C7B5]/40 dark:border-indigo-800 flex items-center space-x-1">
              <Repeat className="w-3.5 h-3.5 text-[#315F50]" />
              <span>Standby Equipment Allocation</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Temporary Asset Allocation &amp; Loaner Pool
          </h1>
          <p className="text-xs text-slate-500">
            Allocate temporary replacement laptops when lab systems or faculty PCs go for repair, with automated return reminders.
          </p>
        </div>

        {!isAuditor && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md shadow-[#315F50]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Standby Loaner</span>
          </button>
        )}
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Standby Units</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{loanerAssets.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#315F50] dark:text-indigo-400">Currently Checked Out</span>
          <p className="text-2xl font-black text-[#315F50] dark:text-indigo-400 mt-1">{activeLoans.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Available in Pool</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{availableStandby.length}</p>
        </div>
      </div>

      {/* Active Loans Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">
          Active Equipment Checkouts &amp; Auto Swap-Back
        </h3>

        {activeLoans.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No loaners currently checked out. All standby units are ready in the pool.
          </div>
        ) : (
          <div className="space-y-3">
            {activeLoans.map(loaner => (
              <div
                key={loaner.id}
                className="p-4 rounded-2xl border border-[#A9C7B5]/40 dark:border-indigo-900/60 bg-[#E6EFE8]/20 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#E6EFE8] text-[#315F50] dark:bg-indigo-950 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {loaner.name} ({loaner.id})
                    </h4>
                    <p className="text-xs text-[#315F50] dark:text-indigo-300 font-medium mt-0.5">
                      Borrower: {loaner.assignedUser}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Expected Return Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{loaner.expectedReturnDate || 'Next Monday'}</span>
                    </p>
                  </div>
                </div>

                {!isAuditor && (
                  <button
                    onClick={() => handleReturn(loaner.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Return &amp; Swap-Back</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <LoanerPoolModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
