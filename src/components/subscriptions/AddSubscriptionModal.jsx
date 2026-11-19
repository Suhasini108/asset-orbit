import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Layers,
  CheckCircle2,
  Calendar,
  DollarSign,
  Users,
  Search,
  ExternalLink,
  Plus,
  Sparkles,
  Info,
  Check,
  Building2,
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import ManageSoftwareModal from './ManageSoftwareModal';

export default function AddSubscriptionModal({ isOpen, onClose }) {
  const { softwareCatalogue, addSubscriptionWithPlan, addSubscription } = useApp();
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'Admin';

  // Search and selected software
  const [searchSoftwareQuery, setSearchSoftwareQuery] = useState('');
  const [selectedSoftwareId, setSelectedSoftwareId] = useState('soft-matlab'); // Defaults to MATLAB as requested
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [manageCatalogueOpen, setManageCatalogueOpen] = useState(false);

  // Form Fields (Section E)
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [billingCycle, setBillingCycle] = useState('Yearly');
  const [subscriptionCost, setSubscriptionCost] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [assignedEmployee, setAssignedEmployee] = useState(currentUser?.name || 'Academic Lab In-Charge');
  const [seats, setSeats] = useState(25);
  const [autoRenew, setAutoRenew] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);
  const [errors, setErrors] = useState({});

  // Filter software options based on search query
  const filteredSoftwareList = useMemo(() => {
    if (!softwareCatalogue || softwareCatalogue.length === 0) return [];
    if (!searchSoftwareQuery.trim()) return softwareCatalogue;
    const q = searchSoftwareQuery.toLowerCase();
    return softwareCatalogue.filter(s =>
      s.softwareName.toLowerCase().includes(q) ||
      s.vendor.toLowerCase().includes(q) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  }, [softwareCatalogue, searchSoftwareQuery]);

  // Selected software object
  const selectedSoftware = useMemo(() => {
    if (!softwareCatalogue) return null;
    return softwareCatalogue.find(s => s.id === selectedSoftwareId) || softwareCatalogue[0] || null;
  }, [softwareCatalogue, selectedSoftwareId]);

  // When selected software changes, auto-select its first available plan and populate fields
  useEffect(() => {
    if (selectedSoftware && selectedSoftware.plans && selectedSoftware.plans.length > 0) {
      // Pick first plan or current if still valid
      const existingPlan = selectedSoftware.plans.find(p => p.id === selectedPlanId);
      const planToSelect = existingPlan || selectedSoftware.plans[0];
      setSelectedPlanId(planToSelect.id);
      setSubscriptionCost(planToSelect.price.toString());
      setBillingCycle(planToSelect.defaultBillingCycle || planToSelect.billingCycles?.[0] || 'Yearly');
    }
  }, [selectedSoftwareId, selectedSoftware]);

  // When selected plan changes, update cost and billing cycle
  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan.id);
    setSubscriptionCost(plan.price.toString());
    const cycle = plan.defaultBillingCycle || plan.billingCycles?.[0] || 'Yearly';
    setBillingCycle(cycle);
    if (errors.plan) setErrors(prev => ({ ...prev, plan: null }));
  };

  // Automatically calculate Expiry Date based on Start Date and Billing Cycle
  useEffect(() => {
    if (!startDate) return;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return;

    const exp = new Date(start);
    if (billingCycle === 'Monthly') {
      exp.setMonth(exp.getMonth() + 1);
    } else if (billingCycle === 'Quarterly') {
      exp.setMonth(exp.getMonth() + 3);
    } else if (billingCycle === 'Yearly' || billingCycle === 'Annual') {
      exp.setFullYear(exp.getFullYear() + 1);
    } else if (billingCycle === 'Multi-Year') {
      exp.setFullYear(exp.getFullYear() + 3);
    } else {
      exp.setMonth(exp.getMonth() + 1);
    }

    setExpiryDate(exp.toISOString().slice(0, 10));
  }, [startDate, billingCycle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!selectedSoftware) newErrors.software = 'Please select a software product';
    if (!selectedPlanId) newErrors.plan = 'Please select an available plan';
    if (!subscriptionCost || Number(subscriptionCost) < 0) newErrors.cost = 'Please enter a valid subscription cost';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const currentPlan = selectedSoftware.plans?.find(p => p.id === selectedPlanId);

    const subscriptionPayload = {
      softwareId: selectedSoftware.id,
      softwareName: selectedSoftware.softwareName,
      name: selectedSoftware.softwareName, // backward compatibility
      planId: selectedPlanId,
      planName: currentPlan?.planName || 'Standard',
      plan: currentPlan?.planName || 'Standard',
      vendor: selectedSoftware.vendor,
      category: selectedSoftware.category || 'Productivity',
      billingCycle,
      cost: parseFloat(subscriptionCost),
      currency: currentPlan?.currency || 'INR',
      startDate,
      expiryDate,
      renewalDate: expiryDate,
      licenseCount: parseInt(seats, 10) || 1,
      seats: parseInt(seats, 10) || 1,
      department,
      assignedEmployee: assignedEmployee.trim() || 'Central IT Pool',
      owner: assignedEmployee.trim() || 'Central IT Pool',
      autoRenewal: autoRenew,
      autoRenew,
      reminderDays: parseInt(reminderDays, 10) || 7,
      status: 'Active',
      features: currentPlan?.features || []
    };

    if (addSubscriptionWithPlan) {
      addSubscriptionWithPlan(subscriptionPayload, currentUser?.name || 'Admin');
    } else if (addSubscription) {
      addSubscription(subscriptionPayload, currentUser?.name || 'Admin');
    }

    try {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    onClose();
  };

  const selectedPlan = selectedSoftware?.plans?.find(p => p.id === selectedPlanId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* ========================================================= */}
        {/* SECTION A: MODAL HEADER                                   */}
        {/* ========================================================= */}
        <div className="px-6 py-4.5 bg-[#234937] text-white flex items-center justify-between flex-shrink-0 border-b border-[#1D3B31]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-xs border border-white/15">
              <Layers className="w-5 h-5 text-[#A9C7B5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
                <span>Add Software Subscription</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-[#badcc9] border border-white/20">
                  Enterprise ITAM
                </span>
              </h3>
              <p className="text-xs text-[#d8eee1] font-medium">
                Select an enterprise software product and configure institutional licensing plans with automated renewals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#badcc9] hover:text-white hover:bg-white/10 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-[#172D27]">
          
          {/* ========================================================= */}
          {/* SECTION B: SOFTWARE SEARCH & SELECTED SOFTWARE INFORMATION*/}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#315F50] flex items-center space-x-1.5">
                <span>1. Search &amp; Select Software Product</span>
                <span className="text-rose-500">*</span>
              </label>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setManageCatalogueOpen(true)}
                  className="text-xs font-bold text-[#315F50] hover:text-[#244B3E] hover:underline flex items-center space-x-1 bg-[#E6EFE8] px-2.5 py-1 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Software Product to Catalogue</span>
                </button>
              )}
            </div>

            {/* Search Input Bar & Quick Select Autocomplete */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#718078]" />
              <input
                type="text"
                value={searchSoftwareQuery}
                onChange={(e) => setSearchSoftwareQuery(e.target.value)}
                placeholder="Search software by name (e.g. MATLAB, Microsoft 365, GitHub, Adobe CC, AWS, Netflix, Google Workspace)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] text-xs text-[#172D27] placeholder-[#718078] focus:outline-none focus:border-[#315F50] focus:bg-white shadow-2xs transition-all"
              />
            </div>

            {/* Horizontal Software Badges Quick Selector */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {filteredSoftwareList.map(soft => {
                const isSelected = selectedSoftwareId === soft.id;
                return (
                  <button
                    key={soft.id}
                    type="button"
                    onClick={() => {
                      setSelectedSoftwareId(soft.id);
                      setSearchSoftwareQuery('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#315F50] text-white shadow-xs ring-2 ring-[#315F50]/30'
                        : 'bg-white text-[#718078] border border-[#E5EAE5] hover:border-[#315F50] hover:text-[#172D27]'
                    }`}
                  >
                    <span>{soft.softwareName}</span>
                    <span className="text-[10px] opacity-75">({soft.vendor})</span>
                  </button>
                );
              })}
            </div>

            {/* DYNAMIC SELECTED SOFTWARE INFORMATION CARD (Matching Screenshot 2 Section B) */}
            {selectedSoftware && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center space-x-4">
                  {/* Software Logo */}
                  <div className={`w-14 h-14 rounded-2xl bg-white border border-[#E5EAE5] p-2 flex items-center justify-center shadow-xs flex-shrink-0`}>
                    {selectedSoftware.logo ? (
                      <img
                        src={selectedSoftware.logo}
                        alt={selectedSoftware.softwareName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Layers className="w-7 h-7 text-[#315F50]" />
                    )}
                  </div>

                  {/* Software Details */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="text-base font-extrabold text-[#172D27]">
                        {selectedSoftware.softwareName}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]/40">
                        {selectedSoftware.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#718078]">
                      <span className="font-semibold text-[#172D27]">Vendor:</span> {selectedSoftware.vendor}
                    </p>

                    <p className="text-xs text-[#718078] max-w-2xl leading-relaxed">
                      {selectedSoftware.description}
                    </p>
                  </div>
                </div>

                {/* View Details External Link */}
                <div className="flex-shrink-0 self-start sm:self-auto">
                  <a
                    href={selectedSoftware.website || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#315F50] bg-white border border-[#E5EAE5] hover:border-[#315F50] transition-colors shadow-2xs"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION C & D: AVAILABLE PLANS (DYNAMIC GRID)             */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between border-b border-[#E5EAE5] pb-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#315F50] flex items-center space-x-1.5">
                  <span>2. Available Plans for {selectedSoftware?.softwareName || 'Selected Software'}</span>
                  <span className="text-rose-500">*</span>
                </h4>
                <p className="text-[11px] text-[#718078]">
                  Select an institutional tier. Pricing and billing cycle will automatically sync below.
                </p>
              </div>

              {selectedPlan && (
                <span className="text-xs font-bold text-[#315F50] bg-[#E6EFE8] px-3 py-1 rounded-full border border-[#A9C7B5]/40 hidden sm:inline-block">
                  Selected: <strong className="font-extrabold">{selectedPlan.planName}</strong>
                </span>
              )}
            </div>

            {/* Plan Cards Grid (Responsive, up to 4 across on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {(selectedSoftware?.plans || []).map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group ${
                      isSelected
                        ? 'bg-[#E6EFE8] border-2 border-[#315F50] shadow-sm ring-2 ring-[#315F50]/15'
                        : 'bg-white border border-[#E5EAE5] hover:border-[#315F50]/50 hover:bg-[#F7F8F5]/60 shadow-2xs'
                    }`}
                  >
                    {/* Top Row: Plan Name & Radio Indicator */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-sm font-extrabold text-[#172D27] leading-tight">
                          {plan.planName}
                        </h5>
                        <p className="text-[11px] text-[#718078] mt-0.5 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>

                      {/* Selection Indicator Radio / Check */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#315F50] text-white shadow-xs'
                          : 'border-2 border-[#E5EAE5] group-hover:border-[#315F50]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Price and Billing Frequency */}
                    <div className="pt-2 border-t border-[#E5EAE5]/60">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xl font-black text-[#172D27]">
                          ₹{plan.price?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#718078] font-bold uppercase">
                          / {plan.defaultBillingCycle || plan.billingCycles?.[0] || 'cycle'}
                        </span>
                      </div>
                    </div>

                    {/* Important Features List with Green Checkmarks */}
                    <div className="space-y-1.5 pt-1">
                      {(plan.features || []).slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-[#172D27]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#315F50] flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.plan && (
              <p className="text-xs text-rose-600 font-bold">{errors.plan}</p>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION E: SUBSCRIPTION DETAILS (HORIZONTAL LAYOUT)       */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#315F50] border-b border-[#E5EAE5] pb-2">
              3. Subscription Dates, Commercials &amp; Allocation
            </h4>

            {/* Row 1: Dates & Commercials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Start Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Expiry / Renewal Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-[#718078] mt-0.5 block">
                  Calculated from billing cycle (editable)
                </span>
              </div>

              {/* Subscription Cost (Editable by Admin for negotiated pricing) */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Subscription Cost (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#718078]">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={subscriptionCost}
                    onChange={(e) => setSubscriptionCost(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs font-bold text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-[#718078] mt-0.5 block">
                  Auto-populated from plan (negotiable)
                </span>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Billing Cycle *
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly (Annual)</option>
                  <option value="Multi-Year">Multi-Year (3 Years)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Department, Assigned Employee, Seats & Reminders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {/* Department / Branch */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Department / Branch
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                >
                  <option value="CSE">CSE (Computer Science)</option>
                  <option value="ISE">ISE (Information Science)</option>
                  <option value="AI&ML">AI&amp;ML (Artificial Intelligence)</option>
                  <option value="ECE">ECE (Electronics &amp; Comm)</option>
                  <option value="EEE">EEE (Electrical &amp; Electronics)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Operations & IT">Operations &amp; IT</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              {/* Assigned Employee / Owner */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Assigned Employee / Lab In-Charge
                </label>
                <input
                  type="text"
                  value={assignedEmployee}
                  onChange={(e) => setAssignedEmployee(e.target.value)}
                  placeholder="e.g. Dr. Sejal Naik, HOD CSE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                />
              </div>

              {/* Seats / License Count */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Seats / License Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                />
              </div>

              {/* Renewal Reminder Days */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Renewal Alert Lead Time
                </label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] bg-white shadow-2xs"
                >
                  <option value={7}>7 Days Before Expiry</option>
                  <option value={14}>14 Days Before Expiry</option>
                  <option value={30}>30 Days Before Expiry</option>
                  <option value={60}>60 Days Before Expiry</option>
                </select>
              </div>
            </div>

            {/* Auto Renewal Toggle */}
            <div className="flex items-center space-x-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#315F50]" />
              </label>
              <div>
                <span className="text-xs font-bold text-[#172D27] block">
                  Enable Automated Recurring Renewal
                </span>
                <span className="text-[10px] text-[#718078]">
                  Automatically flag PO requisition when renewal period enters lead time window.
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION F: ACTION BUTTONS                                 */}
          {/* ========================================================= */}
          <div className="pt-4 border-t border-[#E5EAE5] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2 text-xs text-[#718078]">
              <ShieldCheck className="w-4 h-4 text-[#315F50]" />
              <span>Institutional contract compliance &amp; budget ledger verified</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#718078] hover:bg-[#F7F8F5] border border-[#E5EAE5] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subscription</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Admin Catalogue Management Modal */}
      {manageCatalogueOpen && (
        <ManageSoftwareModal
          isOpen={manageCatalogueOpen}
          onClose={() => setManageCatalogueOpen(false)}
          onSoftwareAdded={(newSoftware) => {
            setSelectedSoftwareId(newSoftware.id);
            setManageCatalogueOpen(false);
          }}
        />
      )}
    </div>
  );
}
