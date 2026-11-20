import React, { useState, useMemo, useEffect } from 'react';
import { X, Box, Plus, Layers, AlertCircle, CheckCircle2, User, Building2, MapPin, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function AddAssetModal({ isOpen, onClose, initialLab = null }) {
  const { categories, addAsset } = useApp();
  const { registeredEmployees = [], currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: initialLab ? `Dell OptiPlex 7090 Tower (${initialLab.dept} Lab)` : 'Dell OptiPlex 7090 Tower',
    category: 'Engineering',
    subBranch: initialLab ? initialLab.dept : 'CSE',
    labRoom: initialLab ? initialLab.name : 'CSE Lab 1 (Turing)',
    benchNumber: 'Bench 01',
    serialNumber: `OPT-${initialLab ? initialLab.dept : 'CSE'}-${Math.floor(1000 + Math.random() * 9000)}`,
    quantity: 1,
    vendor: 'Institutional Supply',
    purchaseDate: new Date().toISOString().slice(0, 10),
    cost: 55000,
    salvageValue: 5000,
    usefulLifeYears: 5,
    warrantyExpiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    location: initialLab ? `${initialLab.room}, Academic Block` : 'Main Academic Block Room 301',
    status: 'Available', // default to Available or Assigned
    assignedTo: '',
    assignedUser: 'Unassigned Pool',
    assignedEmail: ''
  });

  const [assignDirectly, setAssignDirectly] = useState(false);
  const [selectedEmpEmail, setSelectedEmpEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedCategoryObj = categories.find(c => c.name === formData.category) || categories[0];
  const subBranches = (selectedCategoryObj?.subBranches || ['General']).filter(
    sb => sb !== 'Data Science' && sb !== 'Cyber Security'
  );

  // Filtered employees for the currently selected sub-branch / department
  const filteredEmployees = useMemo(() => {
    return (registeredEmployees || []).filter(emp => {
      const matchesCat = formData.category === 'all' || 
                         emp.category === formData.category || 
                         (formData.category === 'Engineering' && ['CSE', 'ISE', 'AI&ML', 'ECE', 'EEE', 'Mechanical', 'Civil'].includes(emp.department || emp.subBranch));
      
      const matchesSub = formData.subBranch === 'all' || 
                         emp.subBranch === formData.subBranch || 
                         emp.department === formData.subBranch;
      
      return matchesCat && matchesSub;
    });
  }, [registeredEmployees, formData.category, formData.subBranch]);

  // Set default selected employee when filtered list updates
  useEffect(() => {
    if (filteredEmployees.length > 0) {
      const stillIn = filteredEmployees.some(e => e.email === selectedEmpEmail);
      if (!stillIn) setSelectedEmpEmail(filteredEmployees[0].email);
    } else {
      setSelectedEmpEmail('');
    }
  }, [filteredEmployees]);

  if (!isOpen) return null;

  const currentEmp = (registeredEmployees || []).find(e => e.email === selectedEmpEmail);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const selCat = categories.find(c => c.name === value) || categories[0];
      const validSubs = (selCat?.subBranches || ['General']).filter(
        sb => sb !== 'Data Science' && sb !== 'Cyber Security'
      );
      setFormData(prev => ({
        ...prev,
        category: value,
        subBranch: validSubs[0] || 'General'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Asset model name is required';
    if (!formData.cost || formData.cost <= 0) newErrors.cost = 'Valid purchase cost is required';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Base serial number is required';
    if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let finalStatus = formData.status;
    let finalAssignedTo = '';
    let finalAssignedEmail = '';

    if (assignDirectly) {
      finalStatus = 'Assigned';
      if (isCustom) {
        finalAssignedTo = customName.trim() || 'Department Faculty';
        finalAssignedEmail = customEmail.trim() || '';
      } else if (currentEmp) {
        finalAssignedTo = currentEmp.name;
        finalAssignedEmail = currentEmp.email;
      } else {
        finalAssignedTo = selectedEmpEmail || 'Department Faculty';
        finalAssignedEmail = selectedEmpEmail || '';
      }
    } else if (finalStatus === 'Available') {
      finalAssignedTo = '';
      finalAssignedEmail = '';
    }

    const assetPayload = {
      name: formData.name.trim(),
      category: formData.category,
      subBranch: formData.subBranch,
      labRoom: formData.labRoom,
      benchNumber: formData.benchNumber,
      serialNumber: formData.serialNumber.trim(),
      vendor: formData.vendor || 'Institutional Supply',
      purchaseDate: formData.purchaseDate,
      cost: parseFloat(formData.cost),
      salvageValue: parseFloat(formData.salvageValue) || 0,
      usefulLifeYears: parseInt(formData.usefulLifeYears, 10) || 5,
      warrantyExpiry: formData.warrantyExpiry,
      location: formData.location,
      status: finalStatus,
      assignedTo: finalAssignedTo,
      assignedUser: finalAssignedTo || (finalStatus === 'Available' ? 'Unassigned Pool' : 'Department Pool'),
      assignedEmail: finalAssignedEmail
    };

    addAsset(assetPayload, parseInt(formData.quantity, 10), currentUser?.name || 'Workspace Admin');
    onClose();
  };

  const qty = parseInt(formData.quantity, 10) || 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0f1424] rounded-3xl shadow-2xl border border-[#E5EAE5] dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        {/* Pinned Modal Header (Guaranteed NEVER Cut Off) */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#234937] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Provision New Asset &amp; Assign
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Register equipment for any department and optionally allocate directly to an employee.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
            title="Close Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Quantity Batch Banner */}
          <div className="p-4 rounded-2xl bg-[#E6EFE8]/60 dark:bg-indigo-950/30 border border-[#A9C7B5]/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-[#234937]" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Quantity Batch Field
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter quantity &gt; 1 to auto-generate individual sequential QR tags.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Qty:
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                max="100"
                value={formData.quantity}
                onChange={handleChange}
                className="w-20 px-3 py-1.5 rounded-xl text-center text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#234937] focus:ring-2 focus:ring-[#315F50]"
              />
            </div>
          </div>

          {/* Section 1: Department & Sub-Branch Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Branch / Department *
              </label>
              <select
                name="subBranch"
                value={formData.subBranch}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                {subBranches.map(sb => (
                  <option key={sb} value={sb}>{sb}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Model & Serial Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Asset Model Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. HP ProDesk 600 G6"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Base Serial Number *
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g. SN-HP-2026-001"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {errors.serialNumber && <p className="text-[10px] text-rose-500 mt-1">{errors.serialNumber}</p>}
            </div>
          </div>

          {/* Section 3: Cost & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cost (₹) *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vendor
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === 'Assigned') setAssignDirectly(true);
                  if (e.target.value === 'Available') setAssignDirectly(false);
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="Available">Available (In Pool)</option>
                <option value="Assigned">Assigned (Active)</option>
                <option value="In Repair">In Repair</option>
              </select>
            </div>
          </div>

          {/* Section 4: Employee Assignment Toggle & Fields */}
          <div className="p-4 rounded-2xl bg-[#F7F9F6] dark:bg-slate-900 border border-[#CBDCD0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assignDirectly"
                  checked={assignDirectly}
                  onChange={(e) => {
                    setAssignDirectly(e.target.checked);
                    if (e.target.checked) setFormData(prev => ({ ...prev, status: 'Assigned' }));
                  }}
                  className="w-4 h-4 text-[#315F50] rounded focus:ring-[#315F50] cursor-pointer"
                />
                <label htmlFor="assignDirectly" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                  Assign this new asset directly to an employee in {formData.subBranch}
                </label>
              </div>
              {assignDirectly && (
                <button
                  type="button"
                  onClick={() => setIsCustom(!isCustom)}
                  className="text-[10px] font-bold text-[#315F50] hover:underline"
                >
                  {isCustom ? '← Pick Registered Staff' : '+ Custom Staff'}
                </button>
              )}
            </div>

            {assignDirectly && (
              <div className="space-y-2.5 pt-1">
                {!isCustom ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Select {formData.subBranch} Staff Member ({filteredEmployees.length} available)
                    </label>
                    <select
                      value={selectedEmpEmail}
                      onChange={(e) => setSelectedEmpEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                    >
                      {filteredEmployees.length === 0 ? (
                        <option value="">No staff in {formData.subBranch} — select custom or general</option>
                      ) : (
                        filteredEmployees.map(emp => (
                          <option key={emp.email} value={emp.email}>
                            {emp.name} — {emp.title || 'Staff'} ({emp.subBranch || emp.department})
                          </option>
                        ))
                      )}
                    </select>

                    {currentEmp && (
                      <div className="mt-2 p-2.5 rounded-xl bg-[#E6EFE8] border border-[#A9C7B5]/60 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#172D27]">
                          👤 {currentEmp.name} ({currentEmp.email})
                        </span>
                        <span className="text-[10px] font-bold text-[#315F50]">
                          {currentEmp.title}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Employee Full Name *
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Vikram Naik"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Employee Email *
                      </label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="e.g. employee@college.edu"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lab Room / Department Wing
              </label>
              <input
                type="text"
                name="labRoom"
                value={formData.labRoom}
                onChange={handleChange}
                placeholder="e.g. Room 204, Academic Block"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Desk / Bench Number
              </label>
              <input
                type="text"
                name="benchNumber"
                value={formData.benchNumber}
                onChange={handleChange}
                placeholder="e.g. Bench 01"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pinned Modal Actions Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#234937] hover:bg-[#1a382a] text-white shadow-md shadow-[#234937]/25 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{qty > 1 ? `Provision ${qty} Assets in Batch` : 'Save Asset Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
