import React, { useState } from 'react';
import {
  Ticket,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  LayoutGrid,
  List,
  Filter,
  DollarSign,
  Repeat,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function TicketsPage({ onOpenCreateTicket, onOpenTicketDetail }) {
  const { tickets, kpis, approveEmployeeTicket, rejectEmployeeTicket } = useApp();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [filterPriority, setFilterPriority] = useState('all');

  const isAdmin = currentUser?.role === 'Admin';
  const isEmployee = currentUser?.role === 'Employee';

  // Strict Employee isolation: Employee only sees issues reported by themselves
  const employeeTickets = (tickets || []).filter(t =>
    (t.reporterName && t.reporterName.toLowerCase().includes((currentUser?.name || '').toLowerCase())) ||
    (t.reporterEmail && t.reporterEmail.toLowerCase() === (currentUser?.email || '').toLowerCase())
  );

  const displayedTickets = isEmployee ? employeeTickets : tickets;

  const filteredTickets = displayedTickets.filter(t => {
    if (filterPriority === 'all') return true;
    return t.priority === filterPriority;
  });

  const pendingApprovals = (tickets || []).filter(t => t.status === 'Pending Admin Approval');

  const handleResetFilters = () => {
    setFilterPriority('all');
    setViewMode('kanban');
  };

  const kanbanColumns = [
    ...(isEmployee ? [{ title: 'Pending Admin Approval', status: 'Pending Admin Approval', color: 'border-amber-400 bg-amber-50/50' }] : []),
    { title: 'Open', status: 'Open', color: 'border-[#A9C7B5] bg-[#E6EFE8]/30' },
    { title: 'Assigned', status: 'Assigned', color: 'border-sky-300 bg-sky-50/30' },
    { title: 'In Progress', status: 'In Progress', color: 'border-amber-300 bg-amber-50/30' },
    { title: 'Waiting for Parts', status: 'Waiting for Parts', color: 'border-orange-300 bg-orange-50/30' },
    { title: 'Resolved & Closed', status: 'Resolved', color: 'border-[#315F50] bg-[#E6EFE8]/50' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-7 sm:p-9 shadow-xl shadow-[#234937]/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-flex items-center space-x-1.5 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-[#badcc9]" />
                <span>{isEmployee ? 'Employee Issue Desk' : 'Live SLA Countdown Timers'}</span>
              </span>
              <span className="text-xs font-bold text-[#badcc9]">
                {isEmployee ? `• ${employeeTickets.length} Issues Reported` : `• ${kpis.slaCompliancePercent}% Compliance Rate`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>{isEmployee ? 'My Reported Issues & Service Requests' : 'Issue Reporting & SLA Resolution Desk'}</span>
              <span className="text-xl">🛠️</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#d8eee1] font-medium max-w-xl leading-relaxed">
              {isEmployee
                ? 'Report equipment defects and track tickets. Reported issues are routed to Admin for approval before scheduling repair.'
                : 'Automated ticket escalation and resolution countdowns (Critical 4h, High 8h, Medium 24h, Low 72h).'}
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all backdrop-blur-sm shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onOpenCreateTicket}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#A9C7B5] hover:bg-[#96b8a3] text-[#172D27] shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Report New Issue</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-white/15 border border-white/25 p-1 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white text-[#234937] shadow-xs' : 'text-white/80 hover:text-white'}`}
                title="Kanban view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-[#234937] shadow-xs' : 'text-white/80 hover:text-white'}`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PENDING EMPLOYEE APPROVALS QUEUE (Admin & IT Manager) */}
      {!isEmployee && pendingApprovals.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-[#172D27]">
                  Pending Operational Issue &amp; Escalation Approvals ({pendingApprovals.length})
                </h3>
                <p className="text-xs text-[#718078]">
                  Operational equipment reports and emergency dispatches from IT Manager and staff awaiting Admin review.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
              Admin Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingApprovals.map(ticket => (
              <div key={ticket.id} className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                      {ticket.reporterRole === 'IT Manager' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]/60">
                          IT Manager Report
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#172D27] mt-1">{ticket.title}</h4>
                    <p className="text-[11px] text-[#718078] line-clamp-2 mt-0.5">{ticket.description}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 whitespace-nowrap">
                    {ticket.priority}
                  </span>
                </div>

                <div className="text-[11px] text-[#718078] border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span>Reporter: <strong>{ticket.reporterName}</strong></span>
                  <span>Equipment: <strong>{ticket.assetName}</strong></span>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for declining:');
                          if (reason) rejectEmployeeTicket(ticket.id, reason, currentUser?.name);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => approveEmployeeTicket(ticket.id, currentUser?.name)}
                        className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs flex items-center space-x-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Schedule Repair</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-xl">
                      Awaiting Admin Approval
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SLA METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#718078] tracking-wider">Critical SLA</span>
          <p className="text-2xl font-black text-rose-600 mt-1 leading-none">4 Hours</p>
          <p className="text-[11px] text-[#718078] mt-1">Response in 30 mins</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#718078] tracking-wider">High SLA</span>
          <p className="text-2xl font-black text-amber-600 mt-1 leading-none">8 Hours</p>
          <p className="text-[11px] text-[#718078] mt-1">Response in 1 hour</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5EAE5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#718078] tracking-wider">Medium SLA</span>
          <p className="text-2xl font-black text-sky-600 mt-1 leading-none">24 Hours</p>
          <p className="text-[11px] text-[#718078] mt-1">Response in 4 hours</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#E6EFE8] border border-[#A9C7B5]/40 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#315F50] tracking-wider">SLA Met Rate</span>
          <p className="text-2xl font-black text-[#315F50] mt-1 leading-none">{kpis.slaCompliancePercent}%</p>
          <p className="text-[11px] text-[#718078] mt-1">Zero unmanaged breaches</p>
        </div>
      </div>

      {/* 3. KANBAN / TABLE VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colTickets = filteredTickets.filter(t =>
              col.status === 'Resolved' ? (t.status === 'Resolved' || t.status === 'Closed') : t.status === col.status
            );

            return (
              <div
                key={col.status}
                className="bg-white rounded-3xl p-4 border border-[#E5EAE5] shadow-xs flex flex-col space-y-3 min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E5EAE5]">
                  <h3 className="font-extrabold text-xs text-[#172D27] uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-[#E6EFE8] text-[#315F50] text-[10px] font-black flex items-center justify-center">
                    {colTickets.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTickets.length === 0 ? (
                    <div className="text-center py-8 text-[#718078] text-[11px]">
                      No tickets
                    </div>
                  ) : (
                    colTickets.map(ticket => {
                      const reportedTime = new Date(ticket.reportedAt).getTime();
                      const targetMs = (ticket.slaTargetHours || 8) * 3600 * 1000;
                      const remainingMs = targetMs - (Date.now() - reportedTime);
                      const remainingHours = Math.max(0, Math.floor(remainingMs / (3600 * 1000)));
                      const isBreached = remainingMs <= 0 && ticket.status !== 'Resolved' && ticket.status !== 'Closed';

                      return (
                        <div
                          key={ticket.id}
                          onClick={() => onOpenTicketDetail && onOpenTicketDetail(ticket)}
                          className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] hover:border-[#315F50] cursor-pointer shadow-xs transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-[#315F50]">
                              {ticket.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                              ticket.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                              'bg-[#E6EFE8] text-[#315F50]'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#172D27] line-clamp-2 group-hover:text-[#315F50] transition-colors">
                            {ticket.title}
                          </h4>

                          <p className="text-[10px] text-[#718078] truncate">
                            {ticket.assetName || ticket.assetId} ({ticket.labRoom})
                          </p>

                          {ticket.loanerAssignedId && (
                            <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-[#315F50] bg-[#E6EFE8] px-2 py-0.5 rounded-full">
                              <Repeat className="w-3 h-3" />
                              <span>Loaner: {ticket.loanerAssignedId}</span>
                            </span>
                          )}

                          {/* Live SLA Countdown */}
                          <div className="pt-2 border-t border-[#E5EAE5] flex items-center justify-between text-[10px]">
                            <span className="text-[#718078]">SLA:</span>
                            <span className={`font-black ${
                              ticket.status === 'Resolved' || ticket.status === 'Closed'
                                ? 'text-[#315F50]'
                                : isBreached
                                ? 'text-rose-600 animate-pulse'
                                : remainingHours < 2
                                ? 'text-amber-600'
                                : 'text-[#315F50]'
                            }`}>
                              {ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'SLA Met' : isBreached ? 'BREACHED' : `${remainingHours}h left`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-[#E5EAE5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F8F5] text-[#718078] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5EAE5]">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Issue Title</th>
                  <th className="py-3 px-4">Asset / Lab</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">SLA Countdown</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE5]">
                {filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => onOpenTicketDetail && onOpenTicketDetail(ticket)}
                    className="hover:bg-[#F7F8F5] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#315F50]">{ticket.id}</td>
                    <td className="py-3.5 px-4 font-bold text-[#172D27] max-w-xs truncate">{ticket.title}</td>
                    <td className="py-3.5 px-4 text-[#718078]">{ticket.assetName || ticket.assetId} ({ticket.labRoom})</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-[#E6EFE8] text-[#315F50]'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172D27]">{ticket.slaTargetHours}h SLA</td>
                    <td className="py-3.5 px-4 font-semibold text-[#172D27]">{ticket.status}</td>
                    <td className="py-3.5 px-4 text-[#718078]">{ticket.assignedTechnician || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
