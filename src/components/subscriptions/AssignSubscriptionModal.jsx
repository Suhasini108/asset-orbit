import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, ShieldCheck, Mail, Building2, Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';

export default function AssignSubscriptionModal({ isOpen, onClose, subscription }) {
  const { updateSubscription, addNotification } = useApp();
  const { registeredEmployees, currentUser } = useAuth();

  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState(
    registeredEmployees && registeredEmployees.length > 0 ? registeredEmployees[0].email : ''
  );
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [department, setDepartment] = useState(subscription?.department || 'ISE');
  const [seatType, setSeatType] = useState('Faculty Seat (Campuswide License)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !subscription) return null;

  const handleAssign = async (e) => {
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

    const updatedData = {
      assignedEmployee: empName,
      assignedEmail: empEmail,
      owner: empName,
      department: department || 'ISE',
      status: 'Active',
      seatType,
      assignmentDate: new Date().toISOString().split('T')[0],
      notes: `${subscription.notes || ''}\n[${new Date().toISOString().slice(0, 10)}] Assigned to ${empName} (${empEmail}) by ${currentUser?.name || 'Admin'}. Seat: ${seatType}`.trim()
    };

    // Update in AppContext
    if (typeof updateSubscription === 'function') {
      updateSubscription(subscription.id, updatedData);
    }

    // Sync with Backend API
    try {
      await api.put(`/subscriptions/${subscription.id}`, updatedData);
    } catch (err) {
      console.warn('Backend sync failed, state preserved locally:', err);
    }

    addNotification({
      title: `Subscription License Assigned`,
      description: `${subscription.name} assigned to ${empName} (${empEmail}).`,
      type: 'sub_assigned',
      category: 'Subscription',
      link: '/subscriptions'
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
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172D27]">
                Assign Software License to Employee
              </h3>
              <p className="text-xs text-[#718078]">
                Allocate software access to faculty, lab staff, or department personnel.
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

        {/* Subscription Target Banner */}
        <div className="p-4 mx-6 mt-5 rounded-2xl bg-[#F0F4F1] border border-[#CBDCD0] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#315F50]">Target Subscription</span>
            <p className="text-sm font-bold text-[#172D27]">{subscription.name}</p>
            <p className="text-xs text-[#718078]">{subscription.vendor || 'MathWorks'} • {subscription.plan || 'Campuswide Suite'} (₹{Number(subscription.cost || 0).toLocaleString('en-IN')})</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]">
            Active License
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAssign} className="p-6 space-y-4">
          
          {/* Toggle: Registered vs Custom */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                !isCustom ? 'bg-white text-[#172D27] shadow-sm' : 'text-[#718078] hover:text-[#172D27]'
              }`}
            >
              Registered Staff ({registeredEmployees?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                isCustom ? 'bg-white text-[#172D27] shadow-sm' : 'text-[#718078] hover:text-[#172D27]'
              }`}
            >
              Custom Faculty / Employee
            </button>
          </div>

          {!isCustom ? (
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Select Department Employee *
              </label>
              <select
                value={selectedEmployeeEmail}
                onChange={(e) => setSelectedEmployeeEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                required
              >
                {(registeredEmployees || []).map((emp) => (
                  <option key={emp.email} value={emp.email}>
                    {emp.name} — {emp.email} ({emp.department || 'ISE'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                  Employee Email Address *
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. ramesh.kumar@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
                  required
                />
              </div>
            </div>
          )}

          {/* Department Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                Assigned Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
              >
                <option value="ISE">Information Science (ISE)</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="AI&ML">AI & Machine Learning</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="Central Administration">Central Administration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                License / Seat Type
              </label>
              <select
                value={seatType}
                onChange={(e) => setSeatType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
              >
                <option value="Faculty Seat (Campuswide License)">Faculty Dedicated Seat</option>
                <option value="Lab Workstation License">Lab Workstation Pool</option>
                <option value="Research Fellow License">Research Fellow License</option>
                <option value="Student Lab Seat">Student Lab Seat</option>
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-[#172D27] mb-1.5">
              Assignment Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Allocated for Semester 6 Network Simulation Lab & Faculty research."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-[#CBDCD0] text-xs font-medium text-[#172D27] bg-white focus:outline-none focus:border-[#315F50]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5EAE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#718078] hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md shadow-[#315F50]/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Assigning...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
