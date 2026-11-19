import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  Download,
  Calendar,
  Clock,
  Sparkles,
  PackageOpen,
  Trash2,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../data/templates';
import AddSubscriptionModal from '../components/subscriptions/AddSubscriptionModal';

export default function SubscriptionsPage({ initialTab = 'all' }) {
  const { subscriptions, deleteSubscription } = useApp();
  const { currentUser } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isRenewalsRoute = location.pathname === '/renewals' || searchParams.get('tab') === 'renewals' || initialTab === 'renewals';

  const isAdmin = currentUser?.role === 'Admin';
  const isITManager = currentUser?.role === 'IT Manager';
  const isManagement = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager';
  const isEmployee = currentUser?.role === 'Employee';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [renewalFilter, setRenewalFilter] = useState(isRenewalsRoute ? '30days' : 'all'); // 'all' | '7days' | '30days' | '90days' | 'autorenew'
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (isRenewalsRoute && renewalFilter === 'all') {
      setRenewalFilter('30days');
    }
  }, [isRenewalsRoute]);

  // Calculate monthly recurring cost
  const monthlyCost = useMemo(() => {
    return subscriptions.reduce((sum, s) => {
      const c = Number(s.cost) || 0;
      if (s.billingCycle === 'yearly' || s.billingCycle === 'Yearly') {
        return sum + Math.round(c / 12);
      }
      return sum + c;
    }, 0);
  }, [subscriptions]);

  // Renewals in 30 days count
  const renewalsIn30DaysCount = useMemo(() => {
    const now = Date.now();
    const in30d = now + 30 * 24 * 60 * 60 * 1000;
    return subscriptions.filter(s => {
      if (!s.renewalDate) return false;
      const rDate = new Date(s.renewalDate).getTime();
      return rDate >= now - 24 * 60 * 60 * 1000 && rDate <= in30d;
    }).length;
  }, [subscriptions]);

  // Renewals in 7 days count
  const renewalsIn7DaysCount = useMemo(() => {
    const now = Date.now();
    const in7d = now + 7 * 24 * 60 * 60 * 1000;
    return subscriptions.filter(s => {
      if (!s.renewalDate) return false;
      const rDate = new Date(s.renewalDate).getTime();
      return rDate >= now - 24 * 60 * 60 * 1000 && rDate <= in7d;
    }).length;
  }, [subscriptions]);

  // Renewals in 90 days count
  const renewalsIn90DaysCount = useMemo(() => {
    const now = Date.now();
    const in90d = now + 90 * 24 * 60 * 60 * 1000;
    return subscriptions.filter(s => {
      if (!s.renewalDate) return false;
      const rDate = new Date(s.renewalDate).getTime();
      return rDate >= now - 24 * 60 * 60 * 1000 && rDate <= in90d;
    }).length;
  }, [subscriptions]);

  // Reset all filters (Refresher Icon)
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedCycle('all');
    setRenewalFilter('all');
    setSearchParams({});
  };

  const filteredSubs = useMemo(() => {
    const now = Date.now();
    const in7d = now + 7 * 24 * 60 * 60 * 1000;
    const in30d = now + 30 * 24 * 60 * 60 * 1000;
    const in90d = now + 90 * 24 * 60 * 60 * 1000;

    return subscriptions.filter(s => {
      // RBAC: If requester is Employee, restrict strictly to their department or assigned software
      if (isEmployee) {
        const empDept = (currentUser?.department || '').toLowerCase();
        const empName = (currentUser?.name || '').toLowerCase();
        const empEmail = (currentUser?.email || '').toLowerCase();
        const sDept = (s.department || '').toLowerCase();
        const sOwner = (s.owner || '').toLowerCase();
        const sAssigned = (s.assignedEmployee || '').toLowerCase();
        const sAssignedEmail = (s.assignedEmail || '').toLowerCase();

        const matchesEmployee = sDept === empDept || sDept === 'all' || sDept === 'engineering' ||
                                sOwner.includes(empName) || sAssigned.includes(empName) ||
                                sAssignedEmail === empEmail;
        if (!matchesEmployee) return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.softwareName && s.softwareName.toLowerCase().includes(q)) ||
        (s.owner && s.owner.toLowerCase().includes(q)) ||
        (s.assignedEmployee && s.assignedEmployee.toLowerCase().includes(q)) ||
        (s.vendor && s.vendor.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchesCycle = selectedCycle === 'all' || s.billingCycle?.toLowerCase() === selectedCycle.toLowerCase();

      // Renewal filter
      let matchesRenewal = true;
      if (renewalFilter !== 'all') {
        const rTime = s.renewalDate ? new Date(s.renewalDate).getTime() : 0;
        if (renewalFilter === '7days') {
          matchesRenewal = rTime >= now - 24 * 60 * 60 * 1000 && rTime <= in7d;
        } else if (renewalFilter === '30days') {
          matchesRenewal = rTime >= now - 24 * 60 * 60 * 1000 && rTime <= in30d;
        } else if (renewalFilter === '90days') {
          matchesRenewal = rTime >= now - 24 * 60 * 60 * 1000 && rTime <= in90d;
        } else if (renewalFilter === 'autorenew') {
          matchesRenewal = s.autoRenewal === true || s.autoRenew === true;
        }
      }

      return matchesSearch && matchesStatus && matchesCycle && matchesRenewal;
    });
  }, [subscriptions, searchQuery, selectedStatus, selectedCycle, renewalFilter]);

  const handleExportCsv = () => {
    const headers = ['id', 'name', 'vendor', 'plan', 'billingCycle', 'cost', 'seats', 'renewalDate', 'owner', 'department'];
    exportToCsv(isRenewalsRoute ? 'AssetOrbit_Renewals_Schedule' : 'AssetOrbit_Subscriptions_Export', headers, filteredSubs);
  };

  const handleDeleteSub = (subId, subName) => {
    if (!isAdmin) {
      alert('Permission Denied: Only Workspace Admins have authority to delete subscription records.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete subscription "${subName}" (${subId})?`)) {
      deleteSubscription(subId, currentUser?.name || 'Admin');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans text-[#172D27]">
      
      {/* 1. HERO BANNER (Identical Color & Theme as Asset Page) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-7 sm:p-9 shadow-xl shadow-[#234937]/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
              {isRenewalsRoute ? 'Renewals & Expiry Radar' : 'Subscription Management'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>{isRenewalsRoute ? 'Subscription Renewals Schedule' : 'Software & Subscriptions'}</span>
              <span className="text-xl">{isRenewalsRoute ? '⏰' : '💼'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#d8eee1] max-w-xl leading-relaxed">
              {isRenewalsRoute
                ? 'Track upcoming expiration dates, lead times, and automated renewal authorizations across all college software licenses.'
                : 'Keep software plans, departmental licenses, owners, and recurring renewal costs organized.'}
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

            {isManagement && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#234937] transition-all shadow-md"
              >
                <Plus className="w-4 h-4 text-[#234937]" />
                <span>Add subscription</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. TOP 3 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Subscriptions / Department Licenses */}
        <div
          onClick={() => { setSelectedStatus('Active'); setRenewalFilter('all'); }}
          className="p-5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#315F50] transition-all group"
          title="Click to view all active subscriptions"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718078] group-hover:text-[#315F50]">
              {isEmployee ? 'Department Software Licenses' : 'Active Subscriptions • click to filter'}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#315F50]" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-[#172D27] group-hover:text-[#315F50]">
              {filteredSubs.length}
            </p>
            <p className="text-[11px] text-[#718078] mt-1">
              {isEmployee
                ? `Authorized software licenses for ${currentUser?.department || 'Engineering'}`
                : `of ${subscriptions.length} total services registered`}
            </p>
          </div>
        </div>

        {/* Monthly Recurring Cost (Admin/IT Manager) or License Status (Employee) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718078]">
              {isEmployee ? 'License Entitlement' : 'Monthly Recurring Cost'}
            </span>
            <span className="text-xs font-bold text-[#315F50] bg-[#E6EFE8] px-2 py-0.5 rounded-full">
              {isEmployee ? 'Authorized' : 'Normalized'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-[#172D27]">
              {isEmployee ? '100% Active' : `₹${monthlyCost.toLocaleString()}`}
            </p>
            <p className="text-[11px] text-[#718078] mt-1">
              {isEmployee
                ? 'Campus academic & research license tier'
                : 'Yearly plans normalized to monthly equivalent'}
            </p>
          </div>
        </div>

        {/* Renewals in 30 days (Interactive) or Helpdesk Contact (Employee) */}
        <div
          onClick={() => !isEmployee && setRenewalFilter('30days')}
          className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all group ${
            isEmployee
              ? 'bg-[#E6EFE8] border-[#A9C7B5]/40'
              : renewalFilter === '30days'
              ? 'bg-[#F9EBDD] border-amber-400 ring-2 ring-amber-300/40 cursor-pointer'
              : 'bg-[#F9EBDD] border-[#F9EBDD] hover:border-amber-400 cursor-pointer'
          }`}
          title={isEmployee ? 'Contact IT support for software assistance' : 'Click to view subscriptions renewing within 30 days'}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172D27]">
              {isEmployee ? 'IT Helpdesk Support' : 'Renewals in 30 Days • click to view'}
            </span>
            <Clock className={`w-4 h-4 ${isEmployee ? 'text-[#315F50]' : 'text-amber-800'}`} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-[#172D27]">
              {isEmployee ? 'Ext. 4022' : renewalsIn30DaysCount}
            </p>
            <p className="text-[11px] text-[#718078] mt-1 font-semibold flex items-center space-x-1">
              <span>{isEmployee ? 'itdesk@assetorbit.edu • Room 301' : `${renewalsIn7DaysCount} due within 7 days`}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. CLICKABLE RENEWALS BUTTON FILTERS BAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#315F50] uppercase tracking-wider flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-[#315F50]" />
            <span>Renewal Period Filters</span>
          </span>
          {renewalFilter !== 'all' && (
            <span className="text-xs font-bold text-[#315F50] bg-[#E6EFE8] px-2.5 py-0.5 rounded-full">
              Filter Active: {renewalFilter.toUpperCase()}
            </span>
          )}
        </div>

        {/* CLICKABLE BUTTONS FOR RENEWALS DASHBOARD (Fully working & clickable) */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Subscriptions', count: subscriptions.length },
            { id: '7days', label: 'Due in 7 Days (Urgent)', count: renewalsIn7DaysCount, urgent: true },
            { id: '30days', label: 'Due in 30 Days', count: renewalsIn30DaysCount },
            { id: '90days', label: 'Due in 90 Days', count: renewalsIn90DaysCount },
            { id: 'autorenew', label: 'Auto-Renew Active', count: subscriptions.filter(s => s.autoRenew || s.autoRenewal).length }
          ].map(btn => {
            const isActive = renewalFilter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setRenewalFilter(btn.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#315F50] text-white shadow-xs ring-2 ring-[#315F50]/20'
                    : btn.urgent
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    : 'bg-white text-[#718078] border border-[#E5EAE5] hover:border-[#315F50] hover:text-[#172D27]'
                }`}
              >
                <span>{btn.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : btn.urgent
                    ? 'bg-rose-200 text-rose-900'
                    : 'bg-[#F7F8F5] text-[#718078]'
                }`}>
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FILTER SEARCH & SELECTORS BAR WITH REFRESHER ICON */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#718078]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search software by name (e.g. MATLAB, Netflix, GitHub), vendor, owner, department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] placeholder-[#718078] focus:outline-none focus:border-[#315F50] shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] shadow-xs"
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Billing Cycle Dropdown */}
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] shadow-xs"
          >
            <option value="all">All billing cycles</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
          </select>

          {/* Refresher Icon to Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-[#718078] hover:text-[#315F50] hover:border-[#315F50] transition-colors shadow-2xs flex-shrink-0 flex items-center space-x-1.5"
            title="Reset all filters to default"
          >
            <RotateCcw className="w-4 h-4 text-[#315F50]" />
            <span className="text-xs font-bold text-[#172D27] hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 5. MAIN SUBSCRIPTIONS INVENTORY CONTAINER */}
      <div className="bg-white rounded-3xl border border-[#E5EAE5] shadow-xs overflow-hidden">
        
        <div className="p-6 border-b border-[#E5EAE5] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#172D27]">
              {isRenewalsRoute ? 'Upcoming Subscription Renewals & Contracts' : 'Software & Service Subscriptions'}
            </h3>
            <p className="text-xs text-[#718078] mt-0.5">
              Showing {filteredSubs.length} of {subscriptions.length} registered software plans
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#718078] bg-[#F7F8F5] px-3 py-1 rounded-full border border-[#E5EAE5]">
            {filteredSubs.length} records
          </span>
        </div>

        {filteredSubs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs">
              <PackageOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#172D27]">
                No subscriptions matched current filter criteria
              </p>
              <p className="text-xs text-[#718078] mt-1 max-w-sm">
                Try resetting filters using the reset icon above, or register a new plan by clicking "+ Add subscription".
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] text-white hover:bg-[#244B3E]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] text-[11px] font-bold uppercase tracking-wider text-[#718078] border-b border-[#E5EAE5]">
                <tr>
                  <th className="py-3.5 px-6">Software &amp; Plan</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Billing Cycle</th>
                  <th className="py-3.5 px-4">Total Seats</th>
                  <th className="py-3.5 px-4">Cost</th>
                  <th className="py-3.5 px-4">Renewal Date</th>
                  <th className="py-3.5 px-4">Department / In-Charge</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE5]">
                {filteredSubs.map(sub => {
                  const now = Date.now();
                  const rTime = sub.renewalDate ? new Date(sub.renewalDate).getTime() : 0;
                  const daysLeft = Math.ceil((rTime - now) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 7;

                  return (
                    <tr key={sub.id} className="hover:bg-[#F7F8F5] transition-colors">
                      {/* Software & Plan */}
                      <td className="py-3.5 px-6 font-bold text-[#172D27]">
                        <span className="block text-sm font-extrabold text-[#172D27]">
                          {sub.softwareName || sub.name}
                        </span>
                        <span className="inline-block text-[10px] text-[#315F50] bg-[#E6EFE8] px-2 py-0.5 rounded-md font-bold mt-0.5">
                          {sub.planName || sub.plan || 'Standard Tier'}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="py-3.5 px-4 text-[#718078] font-medium">
                        {sub.vendor || 'MathWorks'}
                      </td>

                      {/* Billing Cycle */}
                      <td className="py-3.5 px-4 capitalize text-[#172D27]">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6EFE8] text-[#315F50]">
                          {sub.billingCycle}
                        </span>
                      </td>

                      {/* Total Seats */}
                      <td className="py-3.5 px-4 text-[#172D27] font-semibold">
                        {sub.licenseCount || sub.seats || sub.totalSeats || 1} seats
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 font-black text-[#172D27]">
                        ₹{sub.cost?.toLocaleString()}
                      </td>

                      {/* Renewal Date */}
                      <td className="py-3.5 px-4 text-[#172D27]">
                        <span className="block font-bold">{sub.renewalDate || sub.expiryDate}</span>
                        {daysLeft > 0 ? (
                          <span className={`text-[10px] font-bold ${isUrgent ? 'text-rose-600' : 'text-amber-700'}`}>
                            {daysLeft} days remaining
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600">
                            Renewal Due / Overdue
                          </span>
                        )}
                      </td>

                      {/* Department / In-Charge */}
                      <td className="py-3.5 px-4 text-[#718078]">
                        <span className="font-bold text-xs text-[#172D27] block">{sub.department || 'CSE'}</span>
                        <span className="text-[10px] text-[#718078]">{sub.assignedEmployee || sub.owner}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right space-x-2">
                        {isAdmin ? (
                          <button
                            onClick={() => handleDeleteSub(sub.id, sub.name || sub.softwareName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Admin Authority: Delete Subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
