import React, { useState } from 'react';
import { X, Ticket, Upload, AlertCircle, Plus, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function CreateTicketModal({ isOpen, onClose, initialAsset = null }) {
  const { assets, createTicket } = useApp();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: initialAsset ? `Issue on ${initialAsset.name} (${initialAsset.benchNumber || initialAsset.id})` : '',
    description: '',
    assetId: initialAsset ? initialAsset.id : '',
    category: 'Hardware Failure',
    priority: 'Critical',
    photoUrl: null
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSimulatedPhoto = () => {
    // Simulated upload of evidence photo
    setFormData(prev => ({
      ...prev,
      photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e293b"/><text x="50%" y="50%" fill="%2394a3b8" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14">Lab Diagnostic Screenshot Uploaded</text></svg>'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedAsset = assets.find(a => a.id === formData.assetId);
    const isEmployee = currentUser?.role === 'Employee';

    createTicket({
      title: formData.title.trim(),
      description: formData.description.trim(),
      assetId: formData.assetId || null,
      assetName: selectedAsset ? selectedAsset.name : 'Unlinked Equipment',
      labRoom: selectedAsset ? selectedAsset.labRoom : 'Department Helpdesk',
      category: formData.category,
      priority: formData.priority,
      photoUrl: formData.photoUrl,
      reporterName: currentUser?.name || 'Staff Member',
      reporterEmail: currentUser?.email || 'staff@college.edu',
      reporterRole: currentUser?.role || 'Employee'
    }, currentUser?.name || 'Staff Member');

    onClose();
  };

  const isEmployee = currentUser?.role === 'Employee';
  const employeeAssets = isEmployee
    ? assets.filter(a =>
        (a.assignedTo && a.assignedTo.toLowerCase().includes((currentUser?.name || '').toLowerCase())) ||
        (a.assignedUser && a.assignedUser.toLowerCase().includes((currentUser?.name || '').toLowerCase())) ||
        (a.assignedEmail && a.assignedEmail.toLowerCase() === (currentUser?.email || '').toLowerCase())
      )
    : assets;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Report IT Issue / Ticket
              </h2>
              <p className="text-xs text-slate-500">
                Logged with automatic SLA countdown timer based on priority.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. CSE Lab 1 - System 04 RAM Crash during OS Lab"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority &amp; SLA Target
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="Critical">Critical (4h SLA Target)</option>
                <option value="High">High (8h SLA Target)</option>
                <option value="Medium">Medium (24h SLA Target)</option>
                <option value="Low">Low (72h SLA Target)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isEmployee ? 'My Assigned Equipment *' : 'Linked Asset / System'}
              </label>
              <select
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">{isEmployee ? '-- Select Assigned Equipment --' : '-- None / General Facility --'}</option>
                {employeeAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.id}: {a.name} ({a.benchNumber || a.subBranch || 'Assigned'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEmployee && (
            <div className="p-2.5 rounded-xl bg-[#E6EFE8] border border-[#A9C7B5] text-[11px] text-[#315F50] font-medium flex items-center space-x-2">
              <span className="font-bold">📋 Workflow:</span>
              <span>Your issue will be submitted to Workspace Admin for approval before scheduling repair.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Hardware Failure">Hardware Failure (RAM / SSD / Motherboard)</option>
              <option value="Operating System / Crash">Operating System / Kernel Crash / BlueScreen</option>
              <option value="Networking / LAN">Networking / Switch Port / Wi-Fi Drop</option>
              <option value="Audio Visual / Projector">Audio Visual / Projector Lamp</option>
              <option value="Software License Error">Software License / Activation Error</option>
              <option value="Peripheral / Monitor">Peripheral / Keyboard / Mouse / Monitor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description &amp; Symptoms *
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe error messages, steps to reproduce, or diagnostic beeps..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
          </div>

          {/* Photo attachment simulation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Diagnostic Photo / Screenshot
            </label>
            {formData.photoUrl ? (
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <Image className="w-5 h-5 text-emerald-600" />
                <span className="flex-1 truncate">diagnostic_screen_capture.png (Attached)</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, photoUrl: null }))}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulatedPhoto}
                className="w-full py-3 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 hover:border-amber-400 hover:text-amber-500 transition-colors flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo / Capture Crash Screen</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Ticket &amp; Start SLA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
