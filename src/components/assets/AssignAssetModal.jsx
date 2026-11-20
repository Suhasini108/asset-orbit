import React, { useState, useMemo, useEffect } from 'react';
import { X, UserPlus, CheckCircle2, User, Building2, MapPin, Shield, Layers, Filter, Laptop, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';

export default function AssignAssetModal({ isOpen, onClose, asset: initialAsset }) {
  const { assets = [], updateAsset, addNotification } = useApp();
  const { registeredEmployees = [], currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'Admin';
  const isITManager = currentUser?.role === 'IT Manager';

  // Target Asset State (allows selecting from all available assets or switching)
  const [selectedAssetId, setSelectedAssetId] = useState(initialAsset?.id || (assets[0]?.id || ''));

  useEffect(() => {
    if (initialAsset?.id) {
      setSelectedAssetId(initialAsset.id);
    } else if (assets.length > 0) {
      // Prefer first available asset
      const firstAvail = assets.find(a => a.status === 'Available' || a.status === 'Unassigned');
      setSelectedAssetId(firstAvail ? firstAvail.id : assets[0].id);
    }
  }, [initialAsset, assets]);

  const targetAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || initialAsset || assets[0] || null;
  }, [assets, selectedAssetId, initialAsset]);

  // Available categories & sub-branches
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

  // Auto-detect asset category & sub-branch
  const initialCategory = targetAsset?.category || (targetAsset?.subBranch ? 'Engineering' : 'all');
  const initialSubBranch = targetAsset?.subBranch || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubBranch, setSelectedSubBranch] = useState(initialSubBranch);

  // Update category/sub-branch filter when targetAsset changes
  useEffect(() => {
    if (targetAsset) {
      if (targetAsset.category && targetAsset.category !== 'all') {
        setSelectedCategory(targetAsset.category);
      }
      if (targetAsset.subBranch && targetAsset.subBranch !== 'all') {
        setSelectedSubBranch(targetAsset.subBranch);
      }
    }
  }, [targetAsset?.id]);

  // Available sub-branches based on selected category
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

  // Filtered employees list based on category & sub-branch selection
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
  const [deskLocation, setDeskLocation] = useState(targetAsset?.labRoom || targetAsset?.location || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  // Sync desk location when target asset changes
  useEffect(() => {
    if (targetAsset) {
      setDeskLocation(targetAsset.labRoom || targetAsset.location || '');
    }
  }, [targetAsset?.id]);

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

  if (!isOpen || !targetAsset) return null;

  const currentSelectedEmployee = (registeredEmployees || []).find(e => e.email === selectedEmployeeEmail);
  const isAvailableAsset = targetAsset.status === 'Available' || targetAsset.status === 'Unassigned';

  const handleAssign = (e) => {
    e.preventDefault();
    setSubmitting(true);

    let empName = '';
    let empEmail = '';
    let empDept = selectedSubBranch !== 'all' ? selectedSubBranch : (targetAsset.subBranch || targetAsset.category || 'General');

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
      status: 'Assigned',
      assignedTo: empName,
      assignedUser: empName,
      assignedEmail: empEmail,
      location: deskLocation || targetAsset.location,
      subBranch: targetAsset.subBranch || empDept,
      statusChangeNote: `Assigned to ${empName} (${empEmail}) in ${empDept} by ${currentUser?.name || 'Admin'} (${currentUser?.role || 'Staff'}). Notes: ${assignmentNotes || 'N/A'}`
    };

    // 1. Immediately update in local state via AppContext (instant reactive feedback)
    updateAsset(targetAsset.id, updatedData, currentUser?.name || 'Administrator');

    // 2. Notification
    addNotification({
      title: `Asset Assigned: ${targetAsset.name}`,
      description: `Equipment allocated to ${empName} (${empDept}) by ${currentUser?.name || 'Management'}.`,
      type: 'asset_assigned',
      category: 'Asset',
      link: '/assets'
    });

    // 3. Fire-and-forget backend sync in background (non-blocking, never freezes the button)
    api.post(`/assets/${targetAsset.id}/assign`, {
      assignee: empName,
      employeeName: empName,
      employeeEmail: empEmail,
      location: deskLocation || targetAsset.location,
      notes: assignmentNotes
    }).catch(() => {});

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
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172D27] leading-tight">
                Assign Asset to Department Employee
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
          
          {/* Target Equipment Selector (Allows choosing any available asset) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#172D27] flex items-center space-x-1.5">
                <Laptop className="w-3.5 h-3.5 text-[#315F50]" />
                <span>Select Equipment to Assign *</span>
              </label>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                isAvailableAsset 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {isAvailableAsset ? '🟢 Available in Pool' : `🟡 Reassigning (was ${targetAsset.assignedTo || targetAsset.assignedUser})`}
              </span>
            </div>

            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-semibold text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
            >
              <optgroup label="Available Equipment (Ready to Assign)">
                {assets.filter(a => a.status === 'Available' || a.status === 'Unassigned').map(a => (
                  <option key={a.id} value={a.id}>
                    [Available] {a.id} — {a.name} ({a.subBranch || a.category})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Currently Assigned Equipment (Reassign)">
                {assets.filter(a => a.status === 'Assigned').map(a => (
                  <option key={a.id} value={a.id}>
                    [Assigned to {a.assignedTo || a.assignedUser}] {a.id} — {a.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Assets">
                {assets.filter(a => a.status !== 'Available' && a.status !== 'Unassigned' && a.status !== 'Assigned').map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.status}] {a.id} — {a.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Target Asset Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-[#E6EFE8] border border-[#A9C7B5]/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#315F50] block">
                Selected Asset Model
              </span>
              <span className="text-sm font-black text-[#172D27] block">
                {targetAsset.name}
              </span>
              <span className="text-xs text-[#718078] font-mono">
                Tag: {targetAsset.id} &bull; {targetAsset.subBranch || targetAsset.category || 'General'} &bull; SN: {targetAsset.serialNumber || 'N/A'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white text-[#315F50] border border-[#A9C7B5]">
              ₹{Number(targetAsset.cost || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Category & Sub-Branch Filter Grid */}
          <div className="p-3 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172D27] flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-[#315F50]" />
                <span>Filter Staff by Department &amp; Sub-Branch</span>
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

          {/* Toggle between Registered Employee vs Custom Entry */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-bold text-[#172D27]">
              Choose Assignee ({filteredEmployees.length} Available in this Sub-Branch)
            </label>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-[11px] font-bold text-[#315F50] hover:underline cursor-pointer"
            >
              {isCustom ? '← Select Registered Staff' : '+ Enter Custom Employee'}
            </button>
          </div>

          {!isCustom ? (
            <div className="space-y-2">
              <select
                value={selectedEmployeeEmail}
                onChange={(e) => setSelectedEmployeeEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] bg-white focus:outline-none focus:border-[#315F50] font-medium"
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

              {/* Selected Employee Live Preview Card */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#718078] mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required={isCustom}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Vikram Naik"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#718078] mb-1">
                  Employee Email Address *
                </label>
                <input
                  type="email"
                  required={isCustom}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. employee@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>
            </div>
          )}

          {/* Desk / Lab Location */}
          <div>
            <label className="block text-xs font-bold text-[#172D27] mb-1">
              Desk / Pod / Lab Location
            </label>
            <input
              type="text"
              value={deskLocation}
              onChange={(e) => setDeskLocation(e.target.value)}
              placeholder="e.g. ISE Lab 1 / Faculty Desk 04"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
            />
          </div>

          {/* Allocation Notes */}
          <div>
            <label className="block text-xs font-bold text-[#172D27] mb-1">
              Allocation Notes / Handover Remarks
            </label>
            <textarea
              rows="2"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="e.g. Assigned for lab coursework, research projects, or official institutional duties."
              className="w-full px-3.5 py-2 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
            />
          </div>

          {/* Authorization Notice */}
          <div className="flex items-center space-x-2 text-[11px] text-[#718078] bg-[#F7F8F5] p-2.5 rounded-xl border border-[#E5EAE5]">
            <Shield className="w-4 h-4 text-[#315F50] flex-shrink-0" />
            <span>
              Authorized Assignor: <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role || 'Admin'})
            </span>
          </div>

          {/* Action Buttons */}
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
              disabled={submitting || assignedSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-2 cursor-pointer ${
                assignedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-[#315F50] hover:bg-[#244B3E] text-white shadow-[#315F50]/20'
              }`}
            >
              {assignedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Assigned Successfully!</span>
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
