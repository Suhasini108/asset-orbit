import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Shield, Sparkles, Layers, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function ManageSoftwareModal({ isOpen, onClose, onSoftwareAdded }) {
  const { softwareCatalogue, addSoftware } = useApp();
  const { currentUser } = useAuth();

  const [softwareName, setSoftwareName] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('Engineering & Simulation');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [plans, setPlans] = useState([
    {
      id: `plan-cust-1`,
      planName: 'Academic Standard',
      description: 'Campus lab workstation deployment license.',
      price: 15000,
      currency: 'INR',
      billingCycles: ['Yearly'],
      defaultBillingCycle: 'Yearly',
      features: ['Full desktop application features', 'Lab workstations installation', 'Standard updates & support'],
      activeStatus: true
    },
    {
      id: `plan-cust-2`,
      planName: 'Institutional Site License',
      description: 'Department-wide unlimited campus usage.',
      price: 75000,
      currency: 'INR',
      billingCycles: ['Yearly'],
      defaultBillingCycle: 'Yearly',
      features: ['Unlimited campus faculty and student access', 'Central license server', 'Priority support SLA'],
      activeStatus: true
    }
  ]);

  const [newFeatureText, setNewFeatureText] = useState('');
  const [activePlanIdx, setActivePlanIdx] = useState(0);

  if (!isOpen) return null;

  const handleAddPlan = () => {
    const newPlanId = `plan-cust-${Date.now()}`;
    const newPlan = {
      id: newPlanId,
      planName: `Tier ${plans.length + 1} Plan`,
      description: 'Configurable tier description.',
      price: 10000,
      currency: 'INR',
      billingCycles: ['Monthly', 'Yearly'],
      defaultBillingCycle: 'Monthly',
      features: ['Core software functionality', 'Standard technical support'],
      activeStatus: true
    };
    setPlans(prev => [...prev, newPlan]);
    setActivePlanIdx(plans.length);
  };

  const handleRemovePlan = (idxToRemove) => {
    if (plans.length <= 1) {
      alert('A software product must have at least one configured plan.');
      return;
    }
    setPlans(prev => prev.filter((_, i) => i !== idxToRemove));
    if (activePlanIdx >= idxToRemove && activePlanIdx > 0) {
      setActivePlanIdx(activePlanIdx - 1);
    }
  };

  const handlePlanChange = (field, val) => {
    setPlans(prev => prev.map((p, idx) => {
      if (idx === activePlanIdx) {
        return { ...p, [field]: val };
      }
      return p;
    }));
  };

  const handleAddFeatureToActivePlan = (e) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    setPlans(prev => prev.map((p, idx) => {
      if (idx === activePlanIdx) {
        return { ...p, features: [...(p.features || []), newFeatureText.trim()] };
      }
      return p;
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (fIdx) => {
    setPlans(prev => prev.map((p, idx) => {
      if (idx === activePlanIdx) {
        return { ...p, features: p.features.filter((_, i) => i !== fIdx) };
      }
      return p;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!softwareName.trim() || !vendor.trim()) {
      alert('Software Name and Vendor are required.');
      return;
    }
    if (plans.length === 0) {
      alert('Please configure at least one plan.');
      return;
    }

    const newSoftware = {
      id: `soft-cust-${Date.now().toString().slice(-5)}`,
      softwareName: softwareName.trim(),
      vendor: vendor.trim(),
      category,
      website: website.trim() || 'https://www.vendor.com',
      logo: '',
      logoBg: 'bg-emerald-50 text-[#315F50] border-emerald-200',
      description: description.trim() || `${softwareName} enterprise software package.`,
      plans: plans.map((p, i) => ({
        ...p,
        id: p.id || `plan-${Date.now()}-${i}`,
        price: Number(p.price) || 0
      }))
    };

    if (addSoftware) {
      addSoftware(newSoftware, currentUser?.name || 'Admin');
    }

    if (onSoftwareAdded) {
      onSoftwareAdded(newSoftware);
    }

    onClose();
  };

  const currentPlan = plans[activePlanIdx] || plans[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#234937] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <Layers className="w-5 h-5 text-[#A9C7B5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Admin Software &amp; Plan Catalogue Management</span>
                <span className="text-[10px] bg-[#A9C7B5]/25 text-[#A9C7B5] px-2 py-0.5 rounded-full font-bold">
                  Admin Only
                </span>
              </h3>
              <p className="text-xs text-[#A9C7B5]">
                Register new enterprise software products and configure pricing plans dynamically without source code changes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A9C7B5] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* 1. Software Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#315F50] border-b border-[#E5EAE5] pb-1.5 flex items-center justify-between">
              <span>1. Software Product Details</span>
              <span className="text-[10px] text-[#718078] font-normal normal-case">Required fields marked with *</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Software Name *
                </label>
                <input
                  type="text"
                  required
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  placeholder="e.g. Docker Desktop, Figma, AutoCAD"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Vendor / Publisher *
                </label>
                <input
                  type="text"
                  required
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Docker Inc, Figma Inc, Autodesk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                >
                  <option value="Engineering & Simulation">Engineering &amp; Simulation</option>
                  <option value="Productivity & Office">Productivity &amp; Office</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Design & Creative">Design &amp; Creative</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="Entertainment & Media">Entertainment &amp; Media</option>
                  <option value="Communication">Communication</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Official Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.product.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1">
                Product Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this software does and institutional use case..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
              />
            </div>
          </div>

          {/* 2. Configure Plans */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5EAE5] pb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#315F50]">
                2. Configured Plans ({plans.length})
              </h4>
              <button
                type="button"
                onClick={handleAddPlan}
                className="flex items-center space-x-1 text-xs font-bold text-[#315F50] hover:text-[#244B3E] bg-[#E6EFE8] px-3 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Plan</span>
              </button>
            </div>

            {/* Plan selector pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {plans.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePlanIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                    activePlanIdx === idx
                      ? 'bg-[#315F50] text-white shadow-xs'
                      : 'bg-[#F7F8F5] text-[#718078] border border-[#E5EAE5] hover:text-[#172D27]'
                  }`}
                >
                  <span>{p.planName || `Plan ${idx + 1}`}</span>
                  <span className="text-[10px] opacity-80">₹{p.price}</span>
                  {plans.length > 1 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleRemovePlan(idx); }}
                      className="hover:text-rose-300 ml-1"
                      title="Remove plan"
                    >
                      &times;
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active Plan Editor Card */}
            {currentPlan && (
              <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#172D27] mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentPlan.planName}
                      onChange={(e) => handlePlanChange('planName', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#172D27] mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={currentPlan.price}
                      onChange={(e) => handlePlanChange('price', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#172D27] mb-1">
                      Default Billing Cycle
                    </label>
                    <select
                      value={currentPlan.defaultBillingCycle || 'Yearly'}
                      onChange={(e) => handlePlanChange('defaultBillingCycle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172D27] mb-1">
                    Plan Short Description
                  </label>
                  <input
                    type="text"
                    value={currentPlan.description}
                    onChange={(e) => handlePlanChange('description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                  />
                </div>

                {/* Plan Features */}
                <div>
                  <label className="block text-[11px] font-bold text-[#172D27] mb-1">
                    Key Features Included in Plan
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      placeholder="e.g. 50GB cloud storage, Unlimited users, SSO integration..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeatureToActivePlan}
                      className="px-3 py-1.5 rounded-xl bg-[#315F50] text-white text-xs font-bold hover:bg-[#244B3E]"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(currentPlan.features || []).map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5EAE5] text-[11px] font-medium text-[#172D27] flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#315F50]" />
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(fIdx)}
                          className="hover:text-rose-500 ml-1 text-slate-400"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E5EAE5] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#718078] hover:bg-[#F7F8F5] border border-[#E5EAE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Software &amp; Plans to Catalogue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
