import React, { useState, useMemo, useEffect } from 'react';
import { X, UserPlus, CheckCircle2, User, Building2, MapPin, Shield, Layers, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';

export default function AssignAssetModal({ isOpen, onClose, asset }) {
  const { updateAsset, addNotification } = useApp();
  const { registeredEmployees = [], currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'Admin';
  const isITManager = currentUser?.role === 'IT Manager';

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
  const initialCategory = asset?.category || (asset?.subBranch ? 'Engineering' : 'all');
  const initialSubBranch = asset?.subBranch || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubBranch, setSelectedSubBranch] = useState(initialSubBranch);

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
  const [deskLocation, setDeskLocation] = useState(asset?.labRoom || asset?.location || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync selected employee when filtered list changes
  useEffect(() => {
    if (filteredEmployees.length > 0) {
      // If previous selection is still in list, keep it; else select first
      const stillInList = filteredEmployees.some(e => e.email === selectedEmployeeEmail);
      if (!stillInList) {
        setSelectedEmployeeEmail(filteredEmployees[0].email);
      }
    } else {
      setSelectedEmployeeEmail('');
    }
  }, [filteredEmployees]);

  if (!isOpen || !asset) return null;

  const currentSelectedEmployee = (registeredEmployees || []).find(e => e.email === selectedEmployeeEmail);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let empName = '';
    let empEmail = '';
    let empDept = selectedSubBranch !== 'all' ? selectedSubBranch : (asset.subBranch || asset.category || 'General');

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
      location: deskLocation || asset.location,
      subBranch: asset.subBranch || empDept,
      statusChangeNote: `Assigned to ${empName} (${empEmail}) in ${empDept} by ${currentUser?.name || 'Admin'} (${currentUser?.role || 'Staff'}). Notes: ${assignmentNotes || 'N/A'}`
    };

    // 1. Update in local state via AppContext
    updateAsset(asset.id, updatedData, currentUser?.name || 'Administrator');

    // 2. Sync with backend API
    try {
      await api.post(`/assets/${asset.id}/assign`, {
        employeeName: empName,
        employeeEmail: empEmail,
        location: deskLocation || asset.location,
        notes: assignmentNotes
      });
    } catch (err) {
      console.warn('Backend sync failed, saved locally in context:', err);
    }

    addNotification({
      title: `Asset Assigned: ${asset.name}`,
      description: `Equipment allocated to ${empName} (${empDept}) by ${currentUser?.name || 'Management'}.`,
      type: 'asset_assigned',
      category: 'Asset',
      link: '/assets'
    });

    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E5EAE5] flex items-center justify-between bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#315F50] text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172D27]">
                Assign Asset to Department Employee
              </h3>
              <p className="text-xs text-[#718078]">
                Authorized for <span className="font-bold text-[#315F50]">Admin</span> &amp; <span className="font-bold text-[#315F50]">IT Manager</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#718078] hover:text-[#172D27] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAssign} className="p-6 space-y-4">
          
          {/* Target Asset Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-[#E6EFE8] border border-[#A9C7B5]/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#315F50] block">
                Target Equipment
              </span>
              <span className="text-sm font-black text-[#172D27] block">
                {asset.name}
              </span>
              <span className="text-xs text-[#718078] font-mono">
                Tag: {asset.id} • {asset.subBranch || asset.category || 'General'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {asset.status === 'Assigned' ? 'Reassigning' : 'Ready to Assign'}
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
                className="text-[10px] font-bold text-[#315F50] hover:underline"
              >
                Reset Filters
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
                  <option value="all">All Sub-Branches ({availableSubBranches.length})</option>
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
              Choose Assignee ({filteredEmployees.length} Available)
            </label>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-[11px] font-bold text-[#315F50] hover:underline cursor-pointer"
            >
              {isCustom ? '← Select Registered Employee' : '+ Enter Custom Employee'}
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
                      {emp.name} — {emp.title || 'Staff'} ({emp.subBranch || emp.department})
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

          {/* Assignment Notes */}
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
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5EAE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#718078] hover:bg-[#F7F8F5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Assigning...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
