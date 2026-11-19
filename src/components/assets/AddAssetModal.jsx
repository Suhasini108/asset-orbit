import React, { useState } from 'react';
import { X, Box, Plus, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function AddAssetModal({ isOpen, onClose, initialLab = null }) {
  const { categories, addAsset } = useApp();
  const { currentUser } = useAuth();

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
    status: 'Assigned',
    assignedUser: initialLab ? `${initialLab.dept} Student Practical Batch` : 'Department Pool'
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const selectedCategoryObj = categories.find(c => c.name === formData.category) || categories[0];
  const subBranches = (selectedCategoryObj?.subBranches || ['General']).filter(
    sb => sb !== 'Data Science' && sb !== 'Cyber Security'
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const selectedCategoryObj = categories.find(c => c.name === value) || categories[0];
      const validSubBranches = (selectedCategoryObj?.subBranches || ['General']).filter(
        sb => sb !== 'Data Science' && sb !== 'Cyber Security'
      );
      setFormData(prev => ({
        ...prev,
        category: value,
        subBranch: validSubBranches[0] || 'General'
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
      status: formData.status,
      assignedUser: formData.assignedUser
    };

    addAsset(assetPayload, parseInt(formData.quantity, 10), currentUser?.name || 'Workspace Admin');
    onClose();
  };

  const qty = parseInt(formData.quantity, 10) || 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0f1424] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#234937] text-white flex items-center justify-center shadow-md">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Provision New Asset
              </h3>
              <p className="text-xs text-slate-400">
                Register workstations or lab equipment with instant batch generation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quantity Batch Banner */}
          <div className="p-4 rounded-2xl bg-[#E6EFE8]/60 dark:bg-indigo-950/30 border border-[#A9C7B5]/40/80 dark:border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-[#234937]" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Quantity Batch Field
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter quantity &gt; 1 to auto-generate individual records with unique sequential QR tags.
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
                className="w-20 px-3 py-1.5 rounded-xl text-center text-sm font-bold bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-[#234937] dark:text-indigo-300 focus:ring-2 focus:ring-[#315F50]"
              />
            </div>
          </div>

          {qty > 1 && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                Batch Mode Active: Entering {qty} units will generate individual asset records linked under one batch.
              </span>
            </div>
          )}

          {/* Section 1: Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Asset Model / Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dell OptiPlex 7090 Tower"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#234937]"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Base Serial Number / Tag *
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g. OPT-CSE-7091"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#234937]"
              />
              {errors.serialNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.serialNumber}</p>}
            </div>
          </div>

          {/* Section 2: Department, Sub-Branch & Lab Room */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#234937]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sub-Branch / Department
              </label>
              <select
                name="subBranch"
                value={formData.subBranch}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#234937]"
              >
                {subBranches.map(sb => (
                  <option key={sb} value={sb}>{sb}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lab Room / Space
              </label>
              <input
                type="text"
                name="labRoom"
                value={formData.labRoom}
                onChange={handleChange}
                placeholder="e.g. CSE Lab 1 (Turing)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#234937]"
              />
            </div>
          </div>

          {/* Section 3: Cost, Warranty & Status (Vendor removed; Lost & Stolen removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Purchase Cost (₹) *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#234937]"
              />
              {errors.cost && <p className="text-[11px] text-rose-500 mt-1">{errors.cost}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Warranty Expiry
              </label>
              <input
                type="date"
                name="warrantyExpiry"
                value={formData.warrantyExpiry}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="Assigned">Assigned (Active)</option>
                <option value="Available">Available (Pool)</option>
                <option value="In Repair">In Repair</option>
                <option value="Retired">Retired</option>
                <option value="E-Waste">E-Waste</option>
              </select>
            </div>
          </div>

          {/* Section 4: Bench & User Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Bench / Pod Location
              </label>
              <input
                type="text"
                name="benchNumber"
                value={formData.benchNumber}
                onChange={handleChange}
                placeholder="e.g. Bench 01"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned User / Department Pool
              </label>
              <input
                type="text"
                name="assignedUser"
                value={formData.assignedUser}
                onChange={handleChange}
                placeholder="e.g. CSE Practical Batch"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#234937] hover:bg-[#1a382a] text-white shadow-md shadow-[#234937]/25 transition-all flex items-center space-x-2"
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
