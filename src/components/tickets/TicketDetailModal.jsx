import React, { useState } from 'react';
import {
  X,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Wrench,
  DollarSign,
  Star,
  Repeat,
  Plus,
  Send,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function TicketDetailModal({ isOpen, onClose, ticket, onOpenLoanerModal }) {
  const { updateTicketStatus, assets } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [technician, setTechnician] = useState(ticket?.assignedTechnician || 'Kiran V (Hardware Tech)');
  const [newStatus, setNewStatus] = useState(ticket?.status || 'In Progress');
  const [checklist, setChecklist] = useState(ticket?.checklist || []);
  const [newNote, setNewNote] = useState('');
  const [action, setAction] = useState(ticket?.resolutionAction || 'Repaired (In-House)');
  const [summary, setSummary] = useState(ticket?.resolutionSummary || '');
  const [partsCost, setPartsCost] = useState(ticket?.costs?.parts || 0);
  const [laborCost, setLaborCost] = useState(ticket?.costs?.labor || 0);
  const [rating, setRating] = useState(ticket?.satisfactionRating || 5);

  if (!isOpen || !ticket) return null;

  // Toggle checklist items
  const handleToggleCheck = (index) => {
    if (isAuditor) return;
    const updated = [...checklist];
    updated[index].done = !updated[index].done;
    setChecklist(updated);
  };

  // Add note
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim() || isAuditor) return;
    const notes = [...(ticket.notes || [])];
    notes.push({
      author: currentUser.name,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      text: newNote.trim()
    });
    updateTicketStatus(ticket.id, ticket.status, { note: newNote.trim() }, currentUser.name);
    setNewNote('');
  };

  // Save Resolution
  const handleSaveResolution = () => {
    updateTicketStatus(ticket.id, newStatus, {
      action,
      summary,
      costs: { parts: parseFloat(partsCost) || 0, labor: parseFloat(laborCost) || 0 },
      rating: newStatus === 'Resolved' || newStatus === 'Closed' ? rating : null,
      checklist
    }, currentUser.name);

    if (newStatus === 'Resolved') {
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
    onClose();
  };

  // SLA Calculation
  const reportedTime = new Date(ticket.reportedAt).getTime();
  const now = Date.now();
  const targetMs = (ticket.slaTargetHours || 8) * 3600 * 1000;
  const elapsedMs = now - reportedTime;
  const remainingMs = targetMs - elapsedMs;
  const remainingHours = Math.max(0, Math.floor(remainingMs / (3600 * 1000)));
  const remainingMins = Math.max(0, Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000)));
  const isBreached = remainingMs <= 0 && ticket.status !== 'Resolved' && ticket.status !== 'Closed';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {ticket.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                  ticket.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {ticket.priority} Priority
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {ticket.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {ticket.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SLA Countdown Timer Card */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isBreached
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300 animate-pulse'
              : remainingHours < 2
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
          }`}>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  SLA Target: {ticket.slaTargetHours} Hours ({ticket.priority} Tier)
                </p>
                <p className="text-xs">
                  {isBreached
                    ? 'SLA Target Breached! Auto-escalated to Department Head & IT Director.'
                    : `Active Countdown: ${remainingHours}h ${remainingMins}m remaining before breach warning.`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold">
                {ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'SLA Met' : `${remainingHours}h ${remainingMins}m`}
              </span>
            </div>
          </div>

          {/* Ticket Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporter</span>
              <span className="font-semibold text-slate-900 dark:text-white">{ticket.reporterName || 'Lab Assistant'}</span>
              <span className="text-slate-400 block text-[10px]">{ticket.reporterRole}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Linked Asset</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block">{ticket.assetName || ticket.assetId}</span>
              <span className="text-slate-400 block text-[10px]">{ticket.labRoom || 'Main Lab'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Tech</span>
              <span className="font-semibold text-slate-900 dark:text-white">{technician}</span>
              <span className="text-emerald-600 dark:text-emerald-400 block text-[10px]">On-Site Active</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description &amp; Problem Statement
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {ticket.description}
            </div>
          </div>

          {/* Troubleshooting Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Technician Guided Checklist</span>
              <span className="text-[10px] font-normal text-slate-500">
                {checklist.filter(c => c.done).length} / {checklist.length} Completed
              </span>
            </h4>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => handleToggleCheck(idx)}
                  className={`p-2.5 rounded-xl border flex items-center space-x-3 transition-colors cursor-pointer text-xs ${
                    item.done
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className={item.done ? 'line-through text-slate-400' : 'font-medium'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Loaner Asset Linking */}
          {ticket.loanerAssignedId ? (
            <div className="p-4 rounded-2xl bg-[#E6EFE8] dark:bg-indigo-950/40 border border-[#A9C7B5]/40 dark:border-indigo-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Repeat className="w-5 h-5 text-[#315F50]" />
                <div>
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">
                    Temporary Loaner Issued: {ticket.loanerAssignedId}
                  </span>
                  <p className="text-[11px] text-[#315F50] dark:text-indigo-400">
                    Faculty/Student allocated loaner laptop during repair. Auto swap-back will prompt on ticket resolution.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            !isAuditor && onOpenLoanerModal && (
              <button
                type="button"
                onClick={() => onOpenLoanerModal(ticket)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 hover:bg-[#E6EFE8] dark:hover:bg-indigo-950/30 text-[#315F50] dark:text-indigo-400 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Repeat className="w-4 h-4" />
                <span>Issue Standby Loaner Asset to User During Repair</span>
              </button>
            )
          )}

          {/* Admin Guided Resolution & Costs */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resolution Outcome &amp; Cost Tracking
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Update Ticket Status
                </label>
                <select
                  disabled={isAuditor}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Parts">Waiting for Parts</option>
                  <option value="Resolved">Resolved (Completed)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Action
                </label>
                <select
                  disabled={isAuditor}
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Repaired (In-House)">Repaired (In-House Tech)</option>
                  <option value="Parts Swapped">Spare Parts Swapped</option>
                  <option value="Vendor Warranty Claim Raised">Vendor Warranty RMA Claim Raised</option>
                  <option value="Replaced by New Asset">Replaced by New Equipment</option>
                  <option value="Loaner Issued">Loaner Unit Dispatched</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Parts Cost ($)</label>
                <input
                  disabled={isAuditor}
                  type="number"
                  value={partsCost}
                  onChange={(e) => setPartsCost(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Labor Cost ($)</label>
                <input
                  disabled={isAuditor}
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Resolution Summary &amp; Root Cause Explanation
              </label>
              <textarea
                disabled={isAuditor}
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Explain what was fixed, parts replaced, and verification tests run..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Satisfaction Rating */}
            {(newStatus === 'Resolved' || newStatus === 'Closed') && (
              <div className="flex items-center space-x-3 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  User Confirmation &amp; Rating:
                </span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isAuditor}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes & Audit Trail */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Technician Notes &amp; Audit Trail
            </h4>
            <div className="space-y-2 mb-3">
              {(ticket.notes || []).map((n, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{n.author}</span>
                    <span>{n.date}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{n.text}</p>
                </div>
              ))}
            </div>

            {!isAuditor && (
              <form onSubmit={handleAddNote} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal technician note or troubleshooting update..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-900 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Close
            </button>
            {!isAuditor && (
              <button
                type="button"
                onClick={handleSaveResolution}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Ticket Updates</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
