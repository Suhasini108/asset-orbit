import React, { useState } from 'react';
import { X, Repeat, Laptop, Calendar, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function LoanerPoolModal({ isOpen, onClose, ticket = null }) {
  const { assets, issueLoaner } = useApp();
  const { currentUser } = useAuth();

  // Find available loaner assets (assets marked Available or designated loaner batch)
  const availableLoaners = assets.filter(a =>
    a.status === 'Available' || (a.batchId && a.batchId.includes('LOANER') && a.status !== 'In Repair')
  );

  const [selectedLoanerId, setSelectedLoanerId] = useState(availableLoaners[0]?.id || '');
  const [borrowerName, setBorrowerName] = useState(ticket?.reporterName || 'Prof. Rajesh Kumar (CSE)');
  const [returnDate, setReturnDate] = useState(() => {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  });
  const [conditionNotes, setConditionNotes] = useState('Excellent condition. Charger, sleeve, and HDMI adapter issued.');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLoanerId) {
      alert('Please select an available standby loaner asset.');
      return;
    }

    issueLoaner(
      selectedLoanerId,
      ticket ? ticket.id : `ADHOC-${Date.now().toString().slice(-4)}`,
      borrowerName,
      returnDate,
      conditionNotes,
      currentUser.name
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#315F50] text-white flex items-center justify-center shadow-md">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assign Temporary Standby Loaner
              </h3>
              <p className="text-xs text-slate-500">
                Issued during asset repair with automated return reminder alerts.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {ticket && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
              <span className="font-bold">Linked to Ticket:</span> {ticket.id} - {ticket.title}
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Primary asset: {ticket.assetName || ticket.assetId} is currently under repair.
              </p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Standby Loaner Laptop / Desktop *
            </label>
            {availableLoaners.length === 0 ? (
              <p className="text-rose-500 font-semibold p-2 bg-rose-50 rounded-lg">
                No available loaners in standby pool. Add an asset with status "Available".
              </p>
            ) : (
              <select
                value={selectedLoanerId}
                onChange={(e) => setSelectedLoanerId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                {availableLoaners.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.id}: {l.name} (SN: {l.serialNumber})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Borrower Name &amp; Department *
            </label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expected Return Date *
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Condition &amp; Handover Checklist Notes
            </label>
            <textarea
              rows={2}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold rounded-xl text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md shadow-[#315F50]/20 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Issue Loaner Asset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
