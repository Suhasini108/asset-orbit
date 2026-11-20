import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Laptop,
  Crown,
  Calendar,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Plus,
  Bell,
  Box,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Mail,
  Send,
  RotateCcw,
  Wrench,
  RotateCw,
  Building2,
  User,
  Shield,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import HealthSupportModal from '../components/common/HealthSupportModal';

export default function DashboardPage({
  onOpenAddAsset,
  onOpenAddSubscription,
  onOpenSetReminder,
  onOpenEmailBroadcast
}) {
  const { assets, subscriptions, notifications, tickets } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'Admin';
  const isITManager = currentUser?.role === 'IT Manager';
  const isEmployee = currentUser?.role === 'Employee';
  const isManagement = isAdmin || isITManager;

  const [healthSupportOpen, setHealthSupportOpen] = useState(false);
  const [healthSupportTab, setHealthSupportTab] = useState('health');

  // Dynamic user greeting matching prompt instructions
  const greetingName = currentUser?.role === 'Admin' 
    ? 'Admin' 
    : (currentUser?.role === 'IT Manager' 
      ? 'IT Manager' 
      : (currentUser?.name || 'Workspace User'));

  // Engineering Branches definition matching user specifications
  const engineeringBranches = [
    { code: 'CSE', shortName: 'Computer Science', fullName: 'Computer Science & Engineering' },
    { code: 'ISE', shortName: 'Information Science', fullName: 'Information Science & Engineering' },
    { code: 'AI&ML', shortName: 'Artificial Intelligence', fullName: 'Artificial Intelligence & Machine Learning' },
    { code: 'ECE', shortName: 'Electronics & Comm', fullName: 'Electronics & Communication Engineering' },
    { code: 'EEE', shortName: 'Electrical & Electronics', fullName: 'Electrical & Electronics Engineering' },
    { code: 'Mechanical', shortName: 'Mechanical Eng', fullName: 'Mechanical Engineering' },
    { code: 'Civil', shortName: 'Civil Engineering', fullName: 'Civil Engineering' }
  ];

  // Live count per engineering department
  const deptCounts = useMemo(() => {
    const map = {
      'CSE': 0,
      'ISE': 0,
      'AI&ML': 0,
      'ECE': 0,
      'EEE': 0,
      'Mechanical': 0,
      'Civil': 0
    };
    assets.forEach(a => {
      const sub = a.subBranch;
      if (sub && map[sub] !== undefined) {
        map[sub] += 1;
      }
    });
    return map;
  }, [assets]);

  // Employee Assigned Assets Isolation (Strictly personal equipment)
  const employeeAssignedAssets = useMemo(() => {
    const empName = (currentUser?.name || '').toLowerCase().trim();
    const empEmail = (currentUser?.email || '').toLowerCase().trim();
    if (!empName && !empEmail) return [];
    return (assets || []).filter(a => {
      const aTo = (a.assignedTo || '').toLowerCase().trim();
      const aUser = (a.assignedUser || '').toLowerCase().trim();
      const aEmail = (a.assignedEmail || '').toLowerCase().trim();

      const matchesEmail = Boolean(empEmail && aEmail === empEmail);
      const matchesName = Boolean(
        empName && (
          aTo === empName ||
          aUser === empName ||
          (aTo && aTo !== 'unassigned' && (aTo.includes(empName) || empName.includes(aTo))) ||
          (aUser && aUser !== 'unassigned' && (aUser.includes(empName) || empName.includes(aUser)))
        )
      );

      return matchesEmail || matchesName;
    });
  }, [assets, currentUser]);

  // Employee Departmental Subscriptions Isolation
  const employeeSubscriptions = useMemo(() => {
    const empDept = (currentUser?.department || '').toLowerCase().trim();
    const empName = (currentUser?.name || '').toLowerCase().trim();
    const empEmail = (currentUser?.email || '').toLowerCase().trim();
    return (subscriptions || []).filter(s => {
      const sDept = (s.department || '').toLowerCase().trim();
      const sOwner = (s.owner || '').toLowerCase().trim();
      const sAssigned = (s.assignedEmployee || '').toLowerCase().trim();
      const sAssignedEmail = (s.assignedEmail || '').toLowerCase().trim();
      return (empEmail && sAssignedEmail === empEmail) ||
             (empName && sAssigned.includes(empName)) ||
             (empName && sOwner.includes(empName)) ||
             (empDept && sDept === empDept) ||
             sDept === 'all' || sDept === 'campus-wide' || sDept === 'engineering';
    });
  }, [subscriptions, currentUser]);

  // Employee Submitted Tickets
  const employeeTickets = useMemo(() => {
    const empName = (currentUser?.name || '').toLowerCase();
    const empEmail = (currentUser?.email || '').toLowerCase();
    return (tickets || []).filter(t =>
      (t.reporterName && t.reporterName.toLowerCase().includes(empName)) ||
      (t.reporterEmail && t.reporterEmail.toLowerCase() === empEmail)
    );
  }, [tickets, currentUser]);

  const employeePendingTickets = useMemo(() => {
    return employeeTickets.filter(t => t.status === 'Pending Admin Approval' || t.status === 'Open' || t.status === 'In Progress');
  }, [employeeTickets]);

  const employeeUpcomingReturns = useMemo(() => {
    // Scheduled returns or warranty dates
    return employeeAssignedAssets.filter(a => a.warrantyExpiry);
  }, [employeeAssignedAssets]);

  const pendingAdminApprovals = useMemo(() => {
    return (tickets || []).filter(t => t.status === 'Pending Admin Approval');
  }, [tickets]);

  // LIVE METRICS (For Admin & IT Manager)
  const totalAssetsCount = assets.length;

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(s => s.status === 'Active');
  }, [subscriptions]);
  const activeSubscriptionsCount = activeSubscriptions.length;

  const renewalsSoon7Days = useMemo(() => {
    const now = Date.now();
    const in7Days = now + 7 * 24 * 60 * 60 * 1000;
    return activeSubscriptions.filter(s => {
      if (!s.renewalDate) return false;
      const rTime = new Date(s.renewalDate).getTime();
      return rTime >= now - 24 * 60 * 60 * 1000 && rTime <= in7Days;
    });
  }, [activeSubscriptions]);

  const monthlySpend = useMemo(() => {
    let sum = 0;
    activeSubscriptions.forEach(s => {
      const c = parseFloat(s.cost) || 0;
      if (s.billingCycle === 'Monthly') {
        sum += c;
      } else if (s.billingCycle === 'Yearly') {
        sum += Math.round(c / 12);
      } else if (s.billingCycle === 'Quarterly') {
        sum += Math.round(c / 3);
      }
    });
    return sum;
  }, [activeSubscriptions]);

  // ASSETS OVERVIEW DONUT (Forest & Sage Green Theme Palette)
  const assetTypesBreakdown = useMemo(() => {
    let desktops = 0;
    let laptops = 0;
    let ups = 0;
    let projectors = 0;
    let serversAndPrinters = 0;
    let others = 0;

    assets.forEach(a => {
      const name = (a.name || '').toLowerCase();
      const type = (a.type || '').toLowerCase();
      const qty = parseInt(a.quantity, 10) || 1;

      if (type.includes('desktop') || name.includes('thinkcentre') || name.includes('optiplex') || name.includes('vostro 3471') || name.includes('ideacenter') || name.includes('ideacentre') || name.includes('precision') || name.includes('s510')) {
        desktops += qty;
      } else if (type.includes('laptop') || name.includes('laptop') || name.includes('netbook') || name.includes('ideapad') || name.includes('vostro 3568')) {
        laptops += qty;
      } else if (type.includes('server') || type.includes('printer') || name.includes('server') || name.includes('power edge') || name.includes('poweredge') || name.includes('printer') || name.includes('laserjet') || name.includes('scanjet') || name.includes('scanner')) {
        serversAndPrinters += qty;
      } else if (name.includes('ups') || name.includes('apc') || name.includes('liebert') || name.includes('iton')) {
        ups += qty;
      } else if (name.includes('projector') || name.includes('epson')) {
        projectors += qty;
      } else {
        others += qty;
      }
    });

    const segments = [
      { name: 'Desktops', value: desktops, fill: '#315F50', color: 'bg-[#315F50]' },
      { name: 'UPS Units', value: ups, fill: '#244B3E', color: 'bg-[#244B3E]' },
      { name: 'Projectors', value: projectors, fill: '#5C9078', color: 'bg-[#5C9078]' },
      { name: 'Laptops', value: laptops, fill: '#A9C7B5', color: 'bg-[#A9C7B5]' },
      { name: 'Servers & Print', value: serversAndPrinters, fill: '#D3E6DB', color: 'bg-[#D3E6DB]' },
      { name: 'Others', value: others, fill: '#E6EFE8', color: 'bg-[#E6EFE8]' }
    ].filter(s => s.value > 0);

    return segments.length > 0 ? segments : [
      { name: 'Assets', value: assets.length, fill: '#315F50', color: 'bg-[#315F50]' }
    ];
  }, [assets]);

  // SUBSCRIPTION TRENDS
  const trendsData = [
    { month: 'Jun', active: 1, expiring: 0 },
    { month: 'Jul', active: 1, expiring: 0 },
    { month: 'Aug', active: 1, expiring: 0 },
    { month: 'Sep', active: 1, expiring: 0 },
    { month: 'Oct', active: 1, expiring: 0 },
    { month: 'Nov', active: activeSubscriptionsCount > 0 ? activeSubscriptionsCount : 1, expiring: renewalsSoon7Days.length }
  ];

  // UPCOMING RENEWALS LIST (Matching Image 2)
  const upcomingRenewalsList = useMemo(() => {
    const list = [...activeSubscriptions].sort((a, b) => {
      return new Date(a.renewalDate || 0) - new Date(b.renewalDate || 0);
    });

    return list.slice(0, 3).map((sub) => {
      const now = Date.now();
      const rTime = new Date(sub.renewalDate || now).getTime();
      const daysDiff = Math.max(1, Math.round((rTime - now) / (1000 * 60 * 60 * 24)));

      let badgeColor = 'bg-[#F9EBDD] text-[#A2522B]';
      if (daysDiff > 7 && daysDiff <= 30) {
        badgeColor = 'bg-[#FEF3C7] text-[#92400E]';
      } else if (daysDiff > 30) {
        badgeColor = 'bg-[#E6EFE8] text-[#315F50]';
      }

      return {
        id: sub.id,
        name: sub.name,
        costFormatted: `₹${sub.cost?.toLocaleString()} / ${sub.billingCycle === 'Monthly' ? 'month' : 'year'}`,
        dueText: daysDiff > 365 ? 'Active • Yearly' : `Due in ${daysDiff} days`,
        badgeColor,
        logoBg: sub.name.toLowerCase().includes('matlab') ? 'bg-[#d85c18] text-white' :
                sub.name.toLowerCase().includes('microsoft') ? 'bg-[#00a4ef] text-white' :
                'bg-[#315F50] text-white',
        logoInitial: sub.name.slice(0, 1)
      };
    });
  }, [activeSubscriptions]);

  // RECENT ACTIVITY FEED (Dynamically derived from real workspace records)
  const recentActivities = useMemo(() => {
    const list = [];
    if (subscriptions.length > 0) {
      list.push({
        id: 'act-sub-1',
        icon: Crown,
        text: `Active Software: ${subscriptions[0].name} (${subscriptions[0].department || 'ISE'})`,
        time: 'Active',
        color: 'text-[#315F50]'
      });
    }
    const sampleAssets = assets.slice(0, 2);
    sampleAssets.forEach((a, idx) => {
      list.push({
        id: `act-ast-${idx}`,
        icon: Laptop,
        text: `Inventory: ${a.name} (${a.subBranch || 'ISE'} - ${a.quantity ? `${a.quantity} units` : '1 unit'})`,
        time: idx === 0 ? 'Verified' : 'Logged',
        color: 'text-[#244B3E]'
      });
    });
    return list;
  }, [subscriptions, assets]);

  // =========================================================================
  // DEDICATED EMPLOYEE SELF-SERVICE DASHBOARD VIEW (Strictly matching Prompt 10)
  // =========================================================================
  if (isEmployee) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans text-[#172D27]">
        {/* 1. EMPLOYEE WELCOME BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-5 sm:p-7 md:p-9 shadow-xl shadow-[#234937]/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
                  Employee Self-Service Portal
                </span>
                <span className="text-[10px] font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                  Dept: {currentUser?.department || 'Engineering'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <span>Welcome back, {currentUser?.name}!</span>
                <span className="text-xl">🌱</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#d8eee1] font-medium max-w-xl">
                View your assigned institutional hardware, track issue reports, and request repairs or returns for administrative approval.
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => navigate('/tickets')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#A9C7B5] hover:bg-[#96b8a3] text-[#172D27] shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 text-[#172D27]" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. FOUR EMPLOYEE DEDICATED METRIC CARDS (Prompt 10 Requirements) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: My Assigned Assets */}
          <div
            onClick={() => navigate('/assets')}
            className="p-5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#315F50] transition-all group"
            title="Click to view all my assigned assets"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Laptop className="w-5 h-5 text-[#315F50]" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#172D27] group-hover:text-[#315F50] leading-none">
                  {employeeAssignedAssets.length}
                </p>
                <p className="text-xs text-[#718078] font-medium mt-1">
                  My Assigned Assets
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E6EFE8] text-[#315F50] flex items-center justify-center group-hover:bg-[#315F50] group-hover:text-white transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: My Active Subscriptions */}
          <div
            onClick={() => navigate('/subscriptions')}
            className="p-5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#315F50] transition-all group"
            title="Click to view software plans and licenses"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Crown className="w-5 h-5 text-[#315F50]" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#172D27] group-hover:text-[#315F50] leading-none">
                  {employeeSubscriptions.length}
                </p>
                <p className="text-xs text-[#718078] font-medium mt-1">
                  My Active Subscriptions
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E6EFE8] text-[#315F50] flex items-center justify-center group-hover:bg-[#315F50] group-hover:text-white transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: My Pending Requests */}
          <div
            onClick={() => navigate('/tickets')}
            className="p-5 rounded-2xl bg-[#F9EBDD] border border-[#F9EBDD] shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
            title="Click to view my service tickets awaiting Admin approval"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white text-amber-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#172D27] leading-none">
                  {employeePendingTickets.length}
                </p>
                <p className="text-xs text-[#718078] font-medium mt-1">
                  My Pending Requests
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white text-amber-800 flex items-center justify-center group-hover:bg-amber-800 group-hover:text-white transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: My Upcoming Returns / Renewals */}
          <div
            onClick={() => navigate('/assets')}
            className="p-5 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#315F50] transition-all group"
            title="Click to view warranty and return dates"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-[#315F50]" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#172D27] leading-none">
                  {employeeUpcomingReturns.length}
                </p>
                <p className="text-xs text-[#718078] font-medium mt-1">
                  My Upcoming Returns / Renewals
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E6EFE8] text-[#315F50] flex items-center justify-center group-hover:bg-[#315F50] group-hover:text-white transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 3. SECTION 1: MY ASSIGNED EQUIPMENT & DEVICES (Prompt 10) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
                <Laptop className="w-4 h-4 text-[#315F50]" />
                <span>My Assigned Equipment &amp; Devices ({employeeAssignedAssets.length})</span>
              </h3>
              <p className="text-xs text-[#718078] mt-0.5">
                Physical hardware and peripherals registered under your name.
              </p>
            </div>
            <Link
              to="/assets"
              className="text-xs font-bold text-[#315F50] hover:underline flex items-center space-x-1"
            >
              <span>View in Inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {employeeAssignedAssets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F7F9F6] border border-dashed border-[#A9C7B5] text-center space-y-2">
              <Laptop className="w-8 h-8 text-[#A9C7B5] mx-auto" />
              <h4 className="text-sm font-bold text-[#172D27]">No Equipment Currently Allocated</h4>
              <p className="text-xs text-[#718078] max-w-md mx-auto">
                No laptop or desktop is currently assigned to your account. If you require hardware for your department labs, please report a request.
              </p>
              <button
                onClick={() => navigate('/tickets')}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white"
              >
                Request Hardware Allocation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {employeeAssignedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-5 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] hover:border-[#315F50] transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#315F50] bg-[#E6EFE8] px-2 py-0.5 rounded-md">
                        {asset.id}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Assigned
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[#172D27] pt-1">
                      {asset.name}
                    </h4>
                    <p className="text-[11px] text-[#718078]">
                      SN: {asset.serialNumber || 'N/A'} &bull; {asset.subBranch || asset.category}
                    </p>
                    <p className="text-[11px] text-[#718078]">
                      📍 {asset.labRoom || asset.location || 'Department Lab'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5EAE5] flex items-center justify-between">
                    <span 
                      onClick={() => { setHealthSupportTab('health'); setHealthSupportOpen(true); }}
                      className="text-[11px] font-bold text-emerald-700 cursor-pointer hover:underline"
                      title="Click to view full health telemetry and diagnostics"
                    >
                      Health: {asset.healthScore || 95}%
                    </span>
                    <button
                      onClick={() => navigate('/tickets')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#315F50] border border-[#A9C7B5] hover:bg-[#315F50] hover:text-white transition-colors flex items-center space-x-1"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Report Issue</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3.5. SECTION: MY ASSIGNED SOFTWARE LICENSES & CLOUD SUBSCRIPTIONS */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
                <Crown className="w-4 h-4 text-[#315F50]" />
                <span>My Authorized Software Licenses &amp; Subscriptions ({employeeSubscriptions.length})</span>
              </h3>
              <p className="text-xs text-[#718078] mt-0.5">
                Active software tools, cloud computing licenses, and campus-wide entitlements provisioned to your profile.
              </p>
            </div>
            <Link
              to="/subscriptions"
              className="text-xs font-bold text-[#315F50] hover:underline flex items-center space-x-1"
            >
              <span>View All Subscriptions</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {employeeSubscriptions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] text-center space-y-2">
              <Crown className="w-8 h-8 text-[#A9C7B5] mx-auto" />
              <p className="text-xs font-bold text-[#172D27]">No Dedicated Subscriptions Assigned Yet</p>
              <p className="text-[11px] text-[#718078] max-w-sm mx-auto">
                Admin or IT Manager can assign departmental software licenses (like MATLAB Campuswide Suite) to your account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {employeeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate('/subscriptions')}
                  className="p-4 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] hover:border-[#315F50] transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]">
                      {sub.seatType || 'Authorized License'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{sub.status || 'Active'}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[#172D27] group-hover:text-[#315F50] transition-colors">
                      {sub.name || sub.softwareName}
                    </h4>
                    <p className="text-[10px] text-[#718078] mt-0.5">
                      Vendor: <strong className="text-[#172D27]">{sub.vendor || 'Campus License'}</strong> &bull; Dept: {sub.department || 'ISE'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5EAE5] flex items-center justify-between text-[10px] text-[#718078]">
                    <span>Renewal: <strong className="text-[#172D27]">{sub.renewalDate || '2026-12-31'}</strong></span>
                    <span className="text-[#315F50] font-bold group-hover:underline flex items-center space-x-0.5">
                      <span>Details</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. SECTION 2: MY INCIDENT REPORTS & SERVICE REQUESTS */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#315F50]" />
                <span>My Incident Reports &amp; Service Requests ({employeeTickets.length})</span>
              </h3>
              <p className="text-xs text-[#718078] mt-0.5">
                Track status of issues you have submitted for Admin review and resolution.
              </p>
            </div>
            <Link
              to="/tickets"
              className="text-xs font-bold text-[#315F50] hover:underline flex items-center space-x-1"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {employeeTickets.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] text-center text-xs text-[#718078]">
              No active tickets or repair issues reported by you. All assigned devices are in good health.
            </div>
          ) : (
            <div className="space-y-2.5">
              {employeeTickets.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate('/tickets')}
                  className="p-3.5 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] hover:border-[#315F50] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      {ticket.priority?.charAt(0) || 'M'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#172D27]">
                        {ticket.title}
                      </p>
                      <p className="text-[10px] text-[#718078]">
                        Ticket ID: {ticket.id} &bull; Equipment: {ticket.assetName || 'Hardware'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    ticket.status === 'Pending Admin Approval'
                      ? 'bg-amber-100 text-amber-800'
                      : ticket.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. SECTION 3: EMPLOYEE QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/tickets')}
            className="p-5 rounded-2xl bg-white border border-[#E5EAE5] hover:border-[#315F50] transition-all cursor-pointer shadow-xs flex items-center space-x-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172D27]">Report Broken Hardware</h4>
              <p className="text-[11px] text-[#718078]">Submit a ticket for repair authorization</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/subscriptions')}
            className="p-5 rounded-2xl bg-white border border-[#E5EAE5] hover:border-[#315F50] transition-all cursor-pointer shadow-xs flex items-center space-x-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172D27]">Departmental Software</h4>
              <p className="text-[11px] text-[#718078]">View cloud licenses &amp; tools</p>
            </div>
          </div>

          <div
            onClick={() => { setHealthSupportTab('support'); setHealthSupportOpen(true); }}
            className="p-5 rounded-2xl bg-white border border-[#E5EAE5] hover:border-[#315F50] transition-all cursor-pointer shadow-xs flex items-center space-x-3.5"
            title="Click to view Campus IT Support Helpdesk & SLA"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172D27]">Campus IT Support</h4>
              <p className="text-[11px] text-[#718078]">Ext. 4022 &bull; Direct technical help</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // WORKSPACE ADMIN & IT MANAGER DASHBOARD VIEW
  // =========================================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans text-[#172D27]">
      
      {/* 1. WELCOME BANNER (Identical Color Theme as Asset Page) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-5 sm:p-7 md:p-9 shadow-xl shadow-[#234937]/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
                Workspace Dashboard
              </span>
              <button
                type="button"
                onClick={() => { setHealthSupportTab('health'); setHealthSupportOpen(true); }}
                className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full flex items-center space-x-1.5 backdrop-blur-md transition-colors cursor-pointer"
                title="View Live Fleet Health & Helpdesk SLA"
              >
                <Activity className="w-3 h-3 text-[#badcc9]" />
                <span>Health &amp; Support Hub</span>
              </button>
              <button
                onClick={() => { window.location.reload(); }}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-[#badcc9] hover:text-white transition-colors cursor-pointer"
                title="Refresh live dashboard metrics"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Welcome back, {greetingName}!</span>
              <span className="text-xl">🌱</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#d8eee1] font-medium max-w-xl">
              Keep track of your institutional assets and cloud subscriptions all in one place.
            </p>
          </div>

          {/* Right Banner Art Illustration */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Potted Plant SVG */}
            <div className="relative w-12 h-14 hidden sm:flex flex-col items-center justify-end">
              <div className="w-4 h-8 bg-[#84b89c] rounded-full transform -rotate-15 absolute top-1 left-2" />
              <div className="w-4 h-10 bg-white rounded-full absolute top-0" />
              <div className="w-4 h-8 bg-[#badcc9] rounded-full transform rotate-15 absolute top-1 right-2" />
              <div className="w-10 h-7 bg-white/20 backdrop-blur-sm rounded-b-xl border border-white/20 shadow-xs z-10" />
            </div>

            {/* Laptop graphic - hidden on narrow mobile, visible on sm+ */}
            <div className="bg-white/15 backdrop-blur-md p-1.5 rounded-t-xl border border-white/20 shadow-md hidden sm:block">
              <div className="w-24 h-14 bg-[#172D27] rounded-lg flex items-center justify-center text-white">
                <Laptop className="w-6 h-6 text-[#A9C7B5]" />
              </div>
              <div className="w-28 h-1 bg-[#84b89c] rounded-b-sm -mx-2 mt-0.5" />
            </div>

            {/* Calendar card */}
            <div 
              onClick={() => navigate('/renewals')}
              className="bg-white p-2 rounded-xl border border-white/20 shadow-xs hidden sm:block cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="flex items-center space-x-1 text-[9px] font-bold text-[#718078]">
                <Calendar className="w-3 h-3 text-[#315F50]" />
                <span>Renewals</span>
              </div>
              <span className="text-sm font-extrabold text-[#315F50] block mt-0.5">
                {renewalsSoon7Days.length} Due
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Alert for IT Manager Escalations & Incident Reports */}
      {isAdmin && pendingAdminApprovals.length > 0 && (
        <div 
          onClick={() => navigate('/tickets')}
          className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-all animate-in fade-in"
        >
          <div className="flex items-center space-x-3.5">
            <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs sm:text-sm font-black text-[#172D27] block">
                🚨 {pendingAdminApprovals.length} Operational Incident Report{pendingAdminApprovals.length > 1 ? 's' : ''} Awaiting Admin Approval &amp; Action
              </span>
              <span className="text-[11px] text-[#718078]">
                IT Manager and Department staff have dispatched urgent equipment escalation reports. Click to review and approve repair actions.
              </span>
            </div>
          </div>
          <span className="text-xs font-extrabold text-amber-900 bg-amber-200/90 px-3.5 py-1.5 rounded-xl flex items-center space-x-1 shadow-2xs">
            <span>Review Escalations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* 2. TOP 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Assets */}
        <div 
          onClick={() => navigate('/assets?all=true')}
          className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5EAE5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#315F50] transition-all group"
          title="Click to view all assets"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Laptop className="w-5 h-5 text-[#315F50]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#172D27] group-hover:text-[#315F50] transition-colors leading-none">
                {totalAssetsCount}
              </p>
              <p className="text-xs text-[#718078] font-medium mt-1">
                Total Assets
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#E6EFE8] text-[#315F50] flex items-center justify-center group-hover:bg-[#315F50] group-hover:text-white transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Active Subscriptions */}
        <div 
          onClick={() => navigate('/subscriptions')}
          className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5EAE5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#315F50] transition-all group"
          title="Click to view all subscriptions"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 text-[#315F50]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#172D27] group-hover:text-[#315F50] transition-colors leading-none">
                {activeSubscriptionsCount}
              </p>
              <p className="text-xs text-[#718078] font-medium mt-1">
                Active Subscriptions
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#E6EFE8] text-[#315F50] flex items-center justify-center group-hover:bg-[#315F50] group-hover:text-white transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Renewals Due Soon */}
        <div 
          onClick={() => navigate('/renewals')}
          className="p-5 rounded-2xl bg-[#F9EBDD] border border-[#F9EBDD] shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
          title="Click to view renewals schedule"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white text-amber-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#172D27] leading-none">
                {renewalsSoon7Days.length}
              </p>
              <p className="text-xs text-[#718078] font-medium mt-1">
                Renewals Due Soon <span className="text-[10px] text-amber-800 font-bold">(Within 7 days)</span>
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white text-amber-800 flex items-center justify-center group-hover:bg-amber-800 group-hover:text-white transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Monthly Spend */}
        <div 
          onClick={() => navigate('/subscriptions')}
          className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5EAE5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#315F50] transition-all group"
          title="Click to view spend analytics"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-lg font-black text-[#315F50]">₹</span>
            </div>
            <div>
              <p className="text-2xl font-black text-[#172D27] leading-none">
                ₹{monthlySpend.toLocaleString()}
              </p>
              <p className="text-xs text-[#718078] font-medium mt-1">
                Monthly Spend
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#E6EFE8] text-[#315F50] flex items-center justify-center group-hover:bg-[#315F50] group-hover:text-white transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 2.5 DEPARTMENT INVENTORY BREAKDOWN (Strictly matching user screenshot & requirements) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EAE5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#315F50]" />
                <span>Department Inventory Breakdown</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]/40">
                Click count to view assets
              </span>
            </div>
            <p className="text-xs text-[#718078] mt-0.5">
              Click any department count card to filter and view all assets registered for that specific engineering branch.
            </p>
          </div>
          <span className="text-xs text-[#718078] font-medium hidden sm:inline">
            Engineering Branches ({engineeringBranches.length})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {engineeringBranches.map((branch) => {
            const count = deptCounts[branch.code] || 0;
            return (
              <div
                key={branch.code}
                onClick={() => navigate(`/assets?dept=${branch.code}`)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                  count > 0
                    ? 'bg-[#FFFFFF] border-[#A9C7B5] hover:border-[#315F50] hover:shadow-md ring-1 ring-[#315F50]/10'
                    : 'bg-[#F7F8F5] border-[#E5EAE5] hover:border-[#A9C7B5] opacity-80 hover:opacity-100'
                }`}
                title={`Click to view ${count} asset(s) in ${branch.fullName}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#172D27] group-hover:text-[#315F50] transition-colors">
                    {branch.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black transition-colors ${
                    count > 0
                      ? 'bg-[#315F50] text-white shadow-xs'
                      : 'bg-white text-[#718078] border border-[#E5EAE5]'
                  }`}>
                    {count}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[#172D27] truncate" title={branch.fullName}>
                    {branch.shortName}
                  </p>
                  <span className="text-[10px] font-bold text-[#315F50] group-hover:underline flex items-center space-x-1 mt-1">
                    <span>View {count} asset{count !== 1 ? 's' : ''}</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. IT MANAGER EXCLUSIVE: ISSUE OPERATIONAL REPORT TO ADMIN */}
      {isITManager && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#E6EFE8] via-[#eef6f1] to-[#e4f0e7] border-2 border-[#A9C7B5]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#315F50] text-white flex items-center justify-center shadow-md flex-shrink-0 ring-4 ring-[#badcc9]/40">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#315F50] text-white">
                  IT Manager Operational Hub
                </span>
                <span className="text-[10px] font-bold text-[#315F50] bg-white/80 px-2 py-0.5 rounded-md border border-[#A9C7B5]/50">
                  Real-Time Admin Inbox Delivery
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-[#172D27]">
                Issue Operational Report &amp; Emergency Escalation to Admin
              </h4>
              <p className="text-xs text-[#718078] max-w-2xl leading-relaxed">
                When lab equipment encounters issues, warranty claims require escalation, or software licenses are exhausted, dispatch your operational report directly to the Workspace Admin. Sends real-time email dispatches straight to Admin's registered inbox.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEmailBroadcast}
            className="px-5 py-3 rounded-2xl text-xs font-black bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md shadow-[#315F50]/20 transition-all flex items-center justify-center space-x-2 flex-shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Issue Report to Admin</span>
          </button>
        </div>
      )}

      {/* 4. MIDDLE ROW: 3 CARDS (Assets Overview, Subscription Trends, Upcoming Renewals) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Assets Overview */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
              <Laptop className="w-4 h-4 text-[#315F50]" />
              <span>Assets Overview</span>
            </h3>
            <Link
              to="/assets"
              className="text-xs font-bold text-[#315F50] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 items-center gap-2 py-2">
            <div className="relative h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetTypesBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetTypesBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#172D27] leading-none">
                  {totalAssetsCount}
                </span>
                <span className="text-[10px] font-bold text-[#718078] uppercase mt-0.5">
                  Total
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {assetTypesBreakdown.map(item => (
                <div 
                  key={item.name}
                  onClick={() => navigate(`/assets?type=${encodeURIComponent(item.name.toLowerCase())}`)}
                  className="flex items-center justify-between cursor-pointer hover:bg-[#F7F8F5] p-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-[#172D27] font-medium text-xs">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-[#172D27]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Subscription Trends */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
              <Crown className="w-4 h-4 text-[#315F50]" />
              <span>Subscription Trends</span>
            </h3>
            <div className="flex items-center space-x-1 text-xs text-[#718078] font-medium">
              <span>Last 6 Months</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 text-[11px] text-[#718078]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#315F50]" />
              <span className="font-semibold text-[#172D27]">Active</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A9C7B5]" />
              <span className="font-semibold text-[#172D27]">Expiring</span>
            </span>
          </div>

          <div className="h-40 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE5" />
                <XAxis dataKey="month" stroke="#718078" fontSize={10} tickLine={false} />
                <YAxis stroke="#718078" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#315F50"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#315F50' }}
                />
                <Line
                  type="monotone"
                  dataKey="expiring"
                  stroke="#A9C7B5"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#A9C7B5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Upcoming Renewals */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#315F50]" />
              <span>Upcoming Renewals</span>
            </h3>
            <Link
              to="/subscriptions"
              className="text-xs font-bold text-[#315F50] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {upcomingRenewalsList.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/subscriptions')}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#F7F8F5] transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl ${item.logoBg} flex items-center justify-center font-black text-xs shadow-xs`}>
                    {item.logoInitial}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#172D27]">{item.name}</p>
                    <p className="text-[10px] text-[#718078] font-medium">{item.costFormatted}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                  {item.dueText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM ROW: RECENT ACTIVITY & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recent Activity */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
              <span className="text-amber-600 font-bold">⚡</span>
              <span>Recent Activity</span>
            </h3>
            <Link
              to="/reports"
              className="text-xs font-bold text-[#315F50] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#F7F8F5] transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-[#172D27]">
                      {act.text}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#718078] font-medium whitespace-nowrap">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#315F50]" />
              <span>Quick Actions</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            
            {/* Add Asset */}
            <button
              onClick={onOpenAddAsset}
              className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] hover:border-[#315F50] hover:bg-white hover:shadow-md transition-all flex flex-col items-center justify-center space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-white group-hover:bg-[#315F50] group-hover:text-white text-[#315F50] flex items-center justify-center shadow-xs transition-colors">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#172D27] group-hover:text-[#315F50] transition-colors">
                Add Asset
              </span>
            </button>

            {/* Add Subscription */}
            <button
              onClick={onOpenAddSubscription}
              className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] hover:border-[#315F50] hover:bg-white hover:shadow-md transition-all flex flex-col items-center justify-center space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-white group-hover:bg-[#315F50] group-hover:text-white text-[#315F50] flex items-center justify-center shadow-xs transition-colors">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#172D27] group-hover:text-[#315F50] transition-colors">
                Add Subscription
              </span>
            </button>

            {/* Set Reminder */}
            <button
              onClick={onOpenSetReminder}
              className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] hover:border-[#315F50] hover:bg-white hover:shadow-md transition-all flex flex-col items-center justify-center space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-white group-hover:bg-[#315F50] group-hover:text-white text-[#315F50] flex items-center justify-center shadow-xs transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#172D27] group-hover:text-[#315F50] transition-colors">
                Set Reminder
              </span>
            </button>

            {/* View Reports */}
            <button
              onClick={() => navigate('/reports')}
              className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] hover:border-[#315F50] hover:bg-white hover:shadow-md transition-all flex flex-col items-center justify-center space-y-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-white group-hover:bg-[#315F50] group-hover:text-white text-[#315F50] flex items-center justify-center shadow-xs transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#172D27] group-hover:text-[#315F50] transition-colors">
                View Reports
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Health & Support Interactive Modal */}
      <HealthSupportModal
        isOpen={healthSupportOpen}
        onClose={() => setHealthSupportOpen(false)}
        initialTab={healthSupportTab}
      />
    </div>
  );
}
