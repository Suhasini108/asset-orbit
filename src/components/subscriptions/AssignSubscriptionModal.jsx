import React, { useState, useMemo, useEffect } from 'react';
import { X, UserPlus, CheckCircle2, ShieldCheck, Mail, Building2, Key, Filter, Shield, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';

export default function AssignSubscriptionModal({ isOpen, onClose, subscription: initialSub }) {
  const { subscriptions = [], updateSubscription, addNotification } = useApp();
  const { registeredEmployees = [], currentUser } = useAuth();

  // Filter ONLY available/active subscriptions
  const now = Date.now();
  const availableSubscriptions = useMemo(() => {
    return (subscriptions || []).filter(s => {
      const isAct = s.status === 'Active' || s.status === 'Available';
      const notExp = !s.renewalDate || new Date(s.renewalDate).getTime() > now;
      return isAct && notExp;
    });
  }, [subscriptions, now]);

  // Selected subscription ID state
  const [selectedSubId, setSelectedSubId] = useState(
    initialSub?.id || (availableSubscriptions[0]?.id || (subscriptions[0]?.id || ''))
  );

  useEffect(() => {
    if (initialSub?.id) {
      setSelectedSubId(initialSub.id);
    } else if (availableSubscriptions.length > 0) {
      setSelectedSubId(availableSubscriptions[0].id);
    }
  }, [initialSub, availableSubscriptions]);

  const targetSubscription = useMemo(() => {
    return subscriptions.find(s => s.id === selectedSubId) || initialSub || subscriptions[0] || null;
  }, [subscriptions, selectedSubId, initialSub]);

  // Verify availability
  const isAvailable = useMemo(() => {
    if (!targetSubscription) return false;
    const isAct = targetSubscription.status === 'Active' || targetSubscription.status === 'Available';
    const notExp = !targetSubscription.renewalDate || new Date(targetSubscription.renewalDate).getTime() > now;
    return isAct && notExp;
  }, [targetSubscription, now]);

  // Category and sub-branches mapping
  const CATEGORIES = [
    {
      id: 'all',
      name: 'All Categories',
      subBranches: []
    },
    {
      id: 'Engineering',
      name: 'Engineering',
      subBranches: ['CSE', 'ISE', 'AI&ML', 'ECE', 'EEE', 'Mechanical', 'Civil']
    },
    {
      id: 'Operations & IT',
      name: 'Operations & IT',
      subBranches: ['IT Center', 'Campus Networking', 'Data Center', 'Audio Visual', 'Campus Security']
    },
    {
      id: 'Administration',
      name: 'Administration',
      subBranches: ['Principal Office', 'Dean Academic', 'Registrar', 'Examination Cell', 'Accounts & Finance']
    },
    {
      id: 'Basic Sciences',
      name: 'Basic Sciences',
      subBranches: ['Physics Lab', 'Chemistry Lab', 'Mathematics Research']
    }
  ];

  // Auto-detect subscription department
  const subDept = targetSubscription?.department || 'ISE';
  const initialCat = subDept === 'Administration' ? 'Administration' 
                   : (['IT Center', 'Operations & IT'].includes(subDept) ? 'Operations & IT' : 'Engineering');
  
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedSubBranch, setSelectedSubBranch] = useState(subDept);

  // Update category and sub-branch when targetSubscription changes
  useEffect(() => {
    if (targetSubscription?.department) {
      const dept = targetSubscription.department;
      setSelectedSubBranch(dept);
      if (['CSE', 'ISE', 'AI&ML', 'ECE', 'EEE', 'Mechanical', 'Civil'].includes(dept)) {
        setSelectedCategory('Engineering');
      } else if (['IT Center', 'Campus Networking', 'Data Center', 'Audio Visual', 'Campus Security'].includes(dept)) {
        setSelectedCategory('Operations & IT');
      } else if (['Principal Office', 'Dean Academic', 'Registrar', 'Examination Cell', 'Accounts & Finance'].includes(dept)) {
        setSelectedCategory('Administration');
      }
    }
  }, [targetSubscription?.id]);

  // Available sub-branches
  const availableSubBranches = useMemo(() => {
    if (selectedCategory === 'all') {
      const allSubs = [];
      CATEGORIES.forEach(c => {
        if (c.subBranches) allSubs.push(...c.subBranches);
      });
      return Array.from(new Set(allSubs));
    }
    const cat = CATEGORIES.find(c => c.name === selectedCategory);
    return cat?.subBranches || [];
  }, [selectedCategory]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return (registeredEmployees || []).filter(emp => {
      const matchesCat = selectedCategory === 'all' || 
                         emp.category === selectedCategory || 
                         (selectedCategory === 'Engineering' && ['CSE', 'ISE', 'AI&ML', 'ECE', 'EEE', 'Mechanical', 'Civil'].includes(emp.department || emp.subBranch));
      
      const matchesSub = selectedSubBranch === 'all' || 
                         emp.subBranch === selectedSubBranch || 
                         emp.department === selectedSubBranch;
      
      return matchesCat && matchesSub;
    });
  }, [registeredEmployees, selectedCategory, selectedSubBranch]);

  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [seatType, setSeatType] = useState('Faculty Dedicated Seat (Campuswide License)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  // Sync selected employee when filtered list changes
  useEffect(() => {
    if (filteredEmployees.length > 0) {
      const stillInList = filteredEmployees.some(e => e.email === selectedEmployeeEmail);
      if (!stillInList) {
        setSelectedEmployeeEmail(filteredEmployees[0].email);
      }
    } else {
      setSelectedEmployeeEmail('');
    }
  }, [filteredEmployees]);

  if (!isOpen || !targetSubscription) return null;

  const currentSelectedEmployee = (registeredEmployees || []).find(e => e.email === selectedEmployeeEmail);

  const handleAssign = (e) => {
    e.preventDefault();
    if (!isAvailable) {
      alert('Cannot assign an expired or inactive subscription. Only available, active subscriptions can be assigned.');
      return;
    }

    setSubmitting(true);

    let empName = '';
    let empEmail = '';
    let empDept = selectedSubBranch !== 'all' ? selectedSubBranch : (targetSubscription.department || 'ISE');

    if (isCustom) {
      empName = customName.trim();
      empEmail = customEmail.trim();
    } else {
      if (currentSelectedEmployee) {
        empName = currentSelectedEmployee.name;
        empEmail = currentSelectedEmployee.email;
        empDept = currentSelectedEmployee.subBranch || currentSelectedEmployee.department || empDept;
      } else {
        empName = selectedEmployeeEmail;
        empEmail = selectedEmployeeEmail;
      }
    }

    if (!empName) {
      alert('Please select or enter an employee name.');
      setSubmitting(false);
      return;
    }

    const updatedData = {
      assignedEmployee: empName,
      assignedEmail: empEmail,
      owner: empName,
      department: empDept,
      status: 'Active',
      seatType,
      assignmentDate: new Date().toISOString().split('T')[0],
      notes: `${targetSubscription.notes || ''}\n[${new Date().toISOString().slice(0, 10)}] Assigned to ${empName} (${empEmail}) in ${empDept} by ${currentUser?.name || 'Admin'} (${currentUser?.role || 'Staff'}). Seat: ${seatType}. Notes: ${notes || 'N/A'}`.trim()
    };

    // 1. Immediately update in local AppContext state (instant reactive feedback)
    if (typeof updateSubscription === 'function') {
      updateSubscription(targetSubscription.id, updatedData);
    }

    // 2. Notification
    addNotification({
      title: `Subscription License Assigned`,
      description: `${targetSubscription.name} assigned to ${empName} (${empDept}) by ${currentUser?.name || 'Management'}.`,
      type: 'sub_assigned',
      category: 'Subscription',
      link: '/subscriptions'
    });

    // 3. Fire-and-forget backend sync in background (non-blocking)
    api.put(`/subscriptions/${targetSubscription.id}`, updatedData).catch(() => {});

    // 4. Visibly change button to Assigned Successfully, then close modal smoothly
    setAssignedSuccess(true);
    setTimeout(() => {
      setSubmitting(false);
      setAssignedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex justify-center items-start">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] flex flex-col max-h-[calc(100vh-2.5rem)] min-h-0 my-auto animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        {/* Pinned Modal Header (Guaranteed NEVER Cut Off) */}
        <div className="px-6 py-4 border-b border-[#E5EAE5] flex items-center justify-between bg-[#F7F8F5] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#315F50] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172D27] leading-tight">
                Assign Available Subscription License
              </h3>
              <p className="text-xs text-[#718078] mt-0.5">
                Authorized for <span className="font-bold text-[#315F50]">Admin</span> &amp; <span className="font-bold text-[#315F50]">IT Manager</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#718078] hover:text-[#172D27] hover:bg-slate-200/60 transition-colors cursor-pointer flex-shrink-0"
            title="Close Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleAssign} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          
          {/* Target Subscription Selector (Only Available Subscriptions Allowed) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#172D27]">
                Select Available Software License *
              </label>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                isAvailable
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {isAvailable ? '🟢 Active & Available' : '🔴 Expired / Inactive (Cannot Assign)'}
              </span>
            </div>

            <select
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-semibold text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
            >
              <optgroup label="Available Active Subscriptions">
                {availableSubscriptions.map(s => (
                  <option key={s.id} value={s.id}>
                    [Active] {s.name} ({s.department || 'Campuswide'}) — Renews: {s.renewalDate || 'Active'}
                  </option>
                ))}
              </optgroup>
              {subscriptions.filter(s => !availableSubscriptions.includes(s)).length > 0 && (
                <optgroup label="Expired / Inactive (Unavailable)">
                  {subscriptions.filter(s => !availableSubscriptions.includes(s)).map(s => (
                    <option key={s.id} value={s.id} disabled>
                      [Unavailable] {s.name} (Expired / Needs Renewal)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* If Inactive / Expired Notice */}
          {!isAvailable && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>
                <strong>Subscription Unavailable:</strong> Only active, unexpired subscriptions can be assigned. Please renew this license first.
              </span>
            </div>
          )}

          {/* Subscription Target Banner */}
          <div className="p-4 rounded-2xl bg-[#F0F4F1] border border-[#CBDCD0] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#315F50] block">
                Target Subscription License
              </span>
              <p className="text-sm font-bold text-[#172D27]">{targetSubscription.name}</p>
              <p className="text-xs text-[#718078]">
                {targetSubscription.vendor || 'MathWorks'} &bull; {targetSubscription.plan || 'Campuswide Suite'} (₹{Number(targetSubscription.cost || 0).toLocaleString('en-IN')})
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]">
              {targetSubscription.seats || 25} Seats Pool
            </span>
          </div>

          {/* Category & Sub-Branch Filter Grid */}
          <div className="p-3 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172D27] flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-[#315F50]" />
                <span>Filter Staff by Category &amp; Sub-Branch</span>
              </span>
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSelectedSubBranch('all'); }}
                className="text-[10px] font-bold text-[#315F50] hover:underline cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
              >
                Show All Staff ({registeredEmployees.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Category Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-[#718078] mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubBranch('all');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBDCD0] text-xs font-semibold text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                >
                  <option value="all">Campus-wide (All Categories &amp; Staff)</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Branch Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-[#718078] mb-1">
                  Sub-Branch / Department
                </label>
                <select
                  value={selectedSubBranch}
                  onChange={(e) => setSelectedSubBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBDCD0] text-xs font-semibold text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                >
                  <option value="all">
                    {selectedCategory === 'all' 
                      ? `All Departments (${registeredEmployees.length} Total Staff)` 
                      : `All Sub-Branches (${availableSubBranches.length})`}
                  </option>
                  {availableSubBranches.map(sb => (
                    <option key={sb} value={sb}>{sb}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Toggle: Registered vs Custom */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-bold text-[#172D27]">
              Choose Assignee ({filteredEmployees.length} Available in this Sub-Branch)
            </label>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-[11px] font-bold text-[#315F50] hover:underline cursor-pointer"
            >
              {isCustom ? '← Select Registered Staff' : '+ Enter Custom Staff'}
            </button>
          </div>

          {!isCustom ? (
            <div className="space-y-2">
              <select
                value={selectedEmployeeEmail}
                onChange={(e) => setSelectedEmployeeEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                required
              >
                {filteredEmployees.length === 0 ? (
                  <option value="">No employees found in this sub-branch</option>
                ) : (
                  filteredEmployees.map((emp) => (
                    <option key={emp.email} value={emp.email}>
                      {emp.name} — {emp.title || 'Staff Member'} ({emp.subBranch || emp.department})
                    </option>
                  ))
                )}
              </select>

              {/* Selected Staff Live Preview Card */}
              {currentSelectedEmployee && (
                <div className="p-3 rounded-2xl bg-[#F0F4F1] border border-[#CBDCD0] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-[#315F50] text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                      {currentSelectedEmployee.avatar || currentSelectedEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-[#172D27] block">
                        {currentSelectedEmployee.name}
                      </span>
                      <span className="text-[10px] text-[#718078] block">
                        {currentSelectedEmployee.title || 'Staff Member'} &bull; {currentSelectedEmployee.subBranch || currentSelectedEmployee.department}
                      </span>
                      <span className="text-[10px] text-[#315F50] font-mono block">
                        {currentSelectedEmployee.email}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#315F50] border border-[#CBDCD0]">
                    Verified
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Hegde"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                  required={isCustom}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Employee Email Address *
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. rajesh.hegde@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                  required={isCustom}
                />
              </div>
            </div>
          )}

          {/* Seat / License Allocation Type */}
          <div>
            <label className="block text-xs font-bold text-[#172D27] mb-1">
              License / Seat Allocation Type
            </label>
            <select
              value={seatType}
              onChange={(e) => setSeatType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
            >
              <option value="Faculty Dedicated Seat (Campuswide License)">Faculty Dedicated Seat (Campuswide License)</option>
              <option value="Lab Workstation Pool License">Lab Workstation Pool License</option>
              <option value="Research Fellow License">Research Fellow License</option>
              <option value="Student Practical Batch License">Student Practical Batch License</option>
            </select>
          </div>

          {/* Handover Remarks */}
          <div>
            <label className="block text-xs font-bold text-[#172D27] mb-1">
              Handover Remarks / Purpose
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Allocated for Machine Learning research, coursework simulations, or faculty compute."
              className="w-full px-3.5 py-2 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
            />
          </div>

          {/* Authorization Notice */}
          <div className="flex items-center space-x-2 text-[11px] text-[#718078] bg-[#F7F8F5] p-2.5 rounded-xl border border-[#E5EAE5]">
            <Shield className="w-4 h-4 text-[#315F50] flex-shrink-0" />
            <span>
              Authorized Assignor: <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role || 'Admin'})
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5EAE5] flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#718078] hover:bg-[#F7F8F5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isAvailable || assignedSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all flex items-center space-x-2 ${
                assignedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : isAvailable 
                  ? 'bg-[#315F50] hover:bg-[#244B3E] cursor-pointer' 
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {assignedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>License Assigned Successfully!</span>
                </>
              ) : submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
