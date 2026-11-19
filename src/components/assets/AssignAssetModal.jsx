import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, User, Building2, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function AssignAssetModal({ isOpen, onClose, asset }) {
  const { updateAsset, logActivity, addNotification } = useApp();
  const { registeredEmployees, currentUser } = useAuth();

  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState(
    registeredEmployees && registeredEmployees.length > 0 ? registeredEmployees[0].email : ''
  );
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [deskLocation, setDeskLocation] = useState(asset?.labRoom || asset?.location || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleAssign = (e) => {
    e.preventDefault();
    setSubmitting(true);

    let empName = '';
    let empEmail = '';

    if (isCustom) {
      empName = customName.trim();
      empEmail = customEmail.trim();
    } else {
      const found = (registeredEmployees || []).find(e => e.email === selectedEmployeeEmail);
      if (found) {
        empName = found.name;
        empEmail = found.email;
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

    // Update asset to Assigned
    updateAsset(asset.id, {
      status: 'Assigned',
      assignedTo: empName,
      assignedUser: empName,
      assignedEmail: empEmail,
      location: deskLocation || asset.location,
      statusChangeNote: `Assigned to ${empName} (${empEmail}) by ${currentUser?.name || 'Administrator'}. Notes: ${assignmentNotes || 'N/A'}`
    }, currentUser?.name || 'Administrator');

    addNotification({
      title: `Asset Assigned: ${asset.name}`,
      description: `Equipment allocated to ${empName} (${asset.id}).`,
      type: 'asset_assigned',
      category: 'Asset',
      link: '/assets'
    });

    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E5EAE5] flex items-center justify-between bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#315F50] text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172D27]">
                Assign Asset to Employee
              </h3>
              <p className="text-xs text-[#718078]">
                Allocate available equipment to faculty, staff, or department personnel.
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
        <form onSubmit={handleAssign} className="p-6 space-y-4">
          
          {/* Target Asset Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-[#E6EFE8] border border-[#A9C7B5]/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#315F50] block">
                Target Available Equipment
              </span>
              <span className="text-sm font-black text-[#172D27] block">
                {asset.name}
              </span>
              <span className="text-xs text-[#718078] font-mono">
                Tag: {asset.id} • SN: {asset.serialNumber || 'N/A'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
              Ready to Assign
            </span>
          </div>

          {/* Toggle between Registered Employee vs Custom Entry */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-bold text-[#172D27]">
              Choose Assignee
            </label>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-[11px] font-bold text-[#315F50] hover:underline"
            >
              {isCustom ? '← Select Registered Employee' : '+ Enter Custom Employee'}
            </button>
          </div>

          {!isCustom ? (
            <div>
              <label className="block text-xs font-semibold text-[#718078] mb-1">
                Select Registered Employee Profile *
              </label>
              <select
                value={selectedEmployeeEmail}
                onChange={(e) => setSelectedEmployeeEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
              >
                {(registeredEmployees || []).map((emp) => (
                  <option key={emp.email} value={emp.email}>
                    {emp.name} ({emp.email}) - {emp.department || 'General'}
                  </option>
                ))}
              </select>
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
              placeholder="e.g. CSE Faculty Wing Desk 04"
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
              placeholder="e.g. Assigned for Machine Learning Lab coursework and faculty research."
              className="w-full px-3.5 py-2 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5EAE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#718078] hover:bg-[#F7F8F5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md transition-all flex items-center space-x-2"
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
