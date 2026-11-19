import React, { useState, useEffect } from 'react';
import { X, Edit3, CheckCircle2, Box, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function EditAssetModal({ isOpen, onClose, asset }) {
  const { categories, updateAsset, logActivity } = useApp();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Engineering',
    subBranch: 'CSE',
    labRoom: '',
    benchNumber: '',
    serialNumber: '',
    cost: '',
    status: 'Available',
    assignedTo: '',
    location: '',
    warrantyExpiry: ''
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        category: asset.category || 'Engineering',
        subBranch: asset.subBranch || 'CSE',
        labRoom: asset.labRoom || '',
        benchNumber: asset.benchNumber || '',
        serialNumber: asset.serialNumber || '',
        cost: asset.cost !== undefined ? asset.cost : '',
        status: asset.status || 'Available',
        assignedTo: asset.assignedTo || asset.assignedUser || '',
        location: asset.location || '',
        warrantyExpiry: asset.warrantyExpiry || ''
      });
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const selectedCategoryObj = categories.find(c => c.name === formData.category) || categories[0];
  const subBranches = (selectedCategoryObj?.subBranches || ['General']).filter(
    sb => sb !== 'Data Science' && sb !== 'Cyber Security'
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const catObj = categories.find(c => c.name === value) || categories[0];
      const validSub = (catObj?.subBranches || ['General']).filter(
        sb => sb !== 'Data Science' && sb !== 'Cyber Security'
      );
      setFormData(prev => ({
        ...prev,
        category: value,
        subBranch: validSub[0] || 'General'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalAssignedTo = formData.assignedTo.trim();
    let finalStatus = formData.status;

    // If status is set to Available / Unassigned, clear assigned employee
    if (finalStatus === 'Available' || finalStatus === 'Unassigned') {
      finalAssignedTo = '';
      finalStatus = 'Available';
    } else if (finalStatus === 'Assigned' && !finalAssignedTo) {
      finalAssignedTo = 'Department Faculty Pool';
    }

    updateAsset(asset.id, {
      name: formData.name.trim(),
      category: formData.category,
      subBranch: formData.subBranch,
      labRoom: formData.labRoom.trim(),
      benchNumber: formData.benchNumber.trim(),
      serialNumber: formData.serialNumber.trim(),
      cost: parseFloat(formData.cost) || 0,
      status: finalStatus,
      assignedTo: finalAssignedTo,
      assignedUser: finalAssignedTo || 'Unassigned',
      location: formData.location.trim(),
      warrantyExpiry: formData.warrantyExpiry
    }, currentUser?.name || 'Administrator');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E5EAE5] flex items-center justify-between bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#315F50] text-white flex items-center justify-center shadow-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172D27]">
                Edit Asset Specifications &amp; Status
              </h3>
              <p className="text-xs text-[#718078]">
                Authority: {currentUser?.role} ({currentUser?.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#718078] hover:text-[#172D27] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Asset Name / Model *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Serial Number *
              </label>
              <input
                type="text"
                required
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Department / Sub-Branch
              </label>
              <select
                name="subBranch"
                value={formData.subBranch}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
              >
                {subBranches.map(sb => (
                  <option key={sb} value={sb}>{sb}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Lab Room / Space
              </label>
              <input
                type="text"
                name="labRoom"
                value={formData.labRoom}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Purchase Cost (₹)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
              />
            </div>

            {/* Status Dropdown including Retired, Unassigned, Assigned, InRepair, Faulty */}
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Asset Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
              >
                <option value="Available">Available (Unassigned Pool)</option>
                <option value="Assigned">Assigned (Active)</option>
                <option value="InRepair">InRepair (Under Maintenance)</option>
                <option value="Faulty">Faulty (Hardware Defect)</option>
                <option value="Retired">Retired (Decommissioned)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Warranty Expiry
              </label>
              <input
                type="date"
                name="warrantyExpiry"
                value={formData.warrantyExpiry}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Assigned Employee / User
              </label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                placeholder={formData.status === 'Available' ? 'Unassigned' : 'e.g. Vikram Naik'}
                disabled={formData.status === 'Available'}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] ${
                  formData.status === 'Available' ? 'bg-slate-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Location Details
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5EAE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#718078] hover:bg-[#F7F8F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
