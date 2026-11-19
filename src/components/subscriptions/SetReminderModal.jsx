import React, { useState } from 'react';
import { X, Bell, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function SetReminderModal({ isOpen, onClose }) {
  const { subscriptions, addNotification } = useApp();
  const { currentUser } = useAuth();

  const [selectedSub, setSelectedSub] = useState(subscriptions[0]?.name || 'Netflix');
  const [daysBefore, setDaysBefore] = useState('3');
  const [note, setNote] = useState('Review budget & confirm renewal');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    addNotification({
      title: `Renewal reminder set for ${selectedSub}`,
      description: `Notification scheduled for ${daysBefore} days before renewal. Note: "${note}"`,
      type: 'renewal_soon',
      category: 'Subscription',
      link: '/subscriptions'
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#f6f9f6]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#234937] text-white flex items-center justify-center shadow-md">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1b3527]">
                Set Renewal Reminder
              </h3>
              <p className="text-[11px] text-slate-500">
                Schedule proactive email &amp; in-app alerts before automatic charges.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Reminder Successfully Scheduled!
            </p>
            <p className="text-xs text-slate-500">
              You will receive an alert {daysBefore} days prior to the {selectedSub} billing date.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Service / Subscription
              </label>
              <select
                value={selectedSub}
                onChange={(e) => setSelectedSub(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#234937]"
              >
                {subscriptions.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} (₹{s.cost} • Renews {s.renewalDate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reminder Notice Time
              </label>
              <select
                value={daysBefore}
                onChange={(e) => setDaysBefore(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#234937]"
              >
                <option value="1">1 day before renewal</option>
                <option value="3">3 days before renewal (Recommended for monthly)</option>
                <option value="7">7 days before renewal (Recommended)</option>
                <option value="14">14 days before renewal</option>
                <option value="30">30 days before renewal (For yearly contracts)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Reminder Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Audit unused seats before renewal"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#234937]"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#234937] hover:bg-[#1a382a] text-white shadow-md transition-all"
              >
                Set Reminder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
