import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Activity, LifeBuoy, Wrench, ShieldCheck, CheckCircle2, 
  AlertTriangle, Phone, Mail, MapPin, Clock, ArrowRight, Laptop, Cpu, BatteryCharging 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function HealthSupportModal({ isOpen, onClose, initialTab = 'health' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const { assets = [], tickets = [] } = useApp();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const totalAssetsCount = assets.length || 38;
  const inRepairCount = assets.filter(a => a.status === 'In Repair' || a.status === 'Faulty').length;
  const healthyCount = totalAssetsCount - inRepairCount;
  const overallHealthPct = Math.round((healthyCount / (totalAssetsCount || 1)) * 100);

  const pendingTickets = tickets.filter(t => t.status !== 'Resolved').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] flex flex-col max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5EAE5] bg-[#F7F8F5] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#315F50] text-white flex items-center justify-center shadow-md">
              {activeTab === 'health' ? <Activity className="w-5 h-5" /> : <LifeBuoy className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172D27]">
                Dashboard Health &amp; IT Support
              </h3>
              <p className="text-xs text-[#718078]">
                Real-time system telemetry, device diagnostics, and institutional helpdesk.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#718078] hover:text-[#172D27] hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 border-b border-[#E5EAE5] flex space-x-3 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`pb-3 px-3 text-xs font-extrabold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'health'
                ? 'border-[#315F50] text-[#315F50]'
                : 'border-transparent text-[#718078] hover:text-[#172D27]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. System &amp; Equipment Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`pb-3 px-3 text-xs font-extrabold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'border-[#315F50] text-[#315F50]'
                : 'border-transparent text-[#718078] hover:text-[#172D27]'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>2. IT Helpdesk &amp; Support</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {activeTab === 'health' ? (
            <div className="space-y-4">
              {/* Short Summary Banner */}
              <div className="p-4 rounded-2xl bg-[#E6EFE8] border border-[#A9C7B5]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#315F50] block">
                    Institutional Fleet Status
                  </span>
                  <h4 className="text-lg font-black text-[#172D27]">
                    Overall Health Score: {overallHealthPct}%
                  </h4>
                  <p className="text-xs text-[#718078] mt-0.5">
                    {healthyCount} out of {totalAssetsCount} verified devices operating in optimal condition.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white text-[#315F50] font-black flex items-center justify-center text-base shadow-sm">
                  {overallHealthPct}%
                </div>
              </div>

              {/* What Appears Explanation Box */}
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] space-y-2">
                <span className="text-xs font-bold text-[#172D27] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#315F50]"></span>
                  <span>What appears in Health:</span>
                </span>
                <p className="text-xs text-[#718078] leading-relaxed">
                  Every asset displays an individual <strong>Health Score</strong> (80–100% Optimal, 60–79% Fair, &lt;60% Critical/Degraded), warranty expiry indicators, diagnostic telemetry (battery cycles, thermal status, SSD life), and hardware condition notes (Working, In Repair, or Pending Replacement).
                </p>
              </div>

              {/* What is its Use Explanation Box */}
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] space-y-2">
                <span className="text-xs font-bold text-[#172D27] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>What is its use:</span>
                </span>
                <p className="text-xs text-[#718078] leading-relaxed">
                  <strong>Prevents downtime &amp; breakdowns:</strong> IT Managers and Admins track degrading computers before exams or practical classes fail. Employees can verify their assigned laptop’s certified health or quickly report a degraded machine before it causes data loss.
                </p>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#172D27] block">Optimal Units</span>
                    <span className="text-[11px] text-[#718078]">{healthyCount} Units (98%)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#172D27] block">Fair / Review</span>
                    <span className="text-[11px] text-[#718078]">Minor Servicing</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#172D27] block">In Repair</span>
                    <span className="text-[11px] text-[#718078]">{inRepairCount} Machine{inRepairCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Helpdesk Contact Banner */}
              <div className="p-4 rounded-2xl bg-[#234937] text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9]">
                      Institutional IT Service Desk
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-0.5">
                      Campus IT Support &amp; Maintenance Helpdesk
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/20 text-[#badcc9] border border-white/20">
                    Active SLA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#d8eee1]">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#badcc9]" />
                    <span>Academic Block, Room 301</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-[#badcc9]" />
                    <span>Hotline: Ext. 4022</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#badcc9]" />
                    <span>itdesk@assetorbit.edu</span>
                  </div>
                </div>
              </div>

              {/* What Appears Explanation Box */}
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] space-y-2">
                <span className="text-xs font-bold text-[#172D27] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#315F50]"></span>
                  <span>What appears in Support:</span>
                </span>
                <p className="text-xs text-[#718078] leading-relaxed">
                  Support displays the institutional IT contact channels (Room 301, Ext. 4022), the <strong>Incident &amp; Maintenance Ticket Log</strong>, ticket approval statuses (Pending Admin Approval, In Progress, Resolved), and guaranteed response SLAs (Critical &lt; 2h, Standard &lt; 24h).
                </p>
              </div>

              {/* What is its Use Explanation Box */}
              <div className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] space-y-2">
                <span className="text-xs font-bold text-[#172D27] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>What is its use:</span>
                </span>
                <p className="text-xs text-[#718078] leading-relaxed">
                  <strong>Fast resolution for hardware &amp; software issues:</strong> Employees report broken displays, lab PC crashes, or software license errors with photos. IT Managers inspect the issue, and Admins approve replacement or repair workflows directly.
                </p>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/tickets');
                  }}
                  className="w-full sm:w-auto flex-1 px-4 py-3 rounded-2xl text-xs font-extrabold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Report Broken Hardware / Raise Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/tickets');
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold bg-[#F7F8F5] hover:bg-[#E6EFE8] text-[#172D27] border border-[#E5EAE5] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>View All Requests ({pendingTickets} Active)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5EAE5] bg-[#F7F8F5] flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-[#718078]">
            Signed in as: <strong>{currentUser?.name || 'User'}</strong> ({currentUser?.role})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-[#172D27] border border-[#E5EAE5] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
