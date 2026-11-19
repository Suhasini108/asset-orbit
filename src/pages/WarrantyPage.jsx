import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function WarrantyPage() {
  const { warrantyClaims, setWarrantyClaims, assets, vendors } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    vendorId: 'VND-001',
    claimNumber: `DELL-RMA-${Math.floor(100000 + Math.random() * 900000)}`,
    issueDescription: 'Failed hardware component requiring on-site warranty replacement.'
  });

  // Calculate 90/30/7-day alerts
  const now = Date.now();
  const expiring90Days = assets.filter(a => {
    const expiry = new Date(a.warrantyExpiry).getTime();
    const days = Math.floor((expiry - now) / (24 * 3600 * 1000));
    return days >= 0 && days <= 90;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.assetId) return;

    const asset = assets.find(a => a.id === formData.assetId);
    const vendor = vendors.find(v => v.id === formData.vendorId);

    const newClaim = {
      id: `CLM-${Date.now().toString().slice(-4)}`,
      assetId: formData.assetId,
      assetName: asset ? asset.name : 'Hardware Asset',
      vendorId: formData.vendorId,
      vendorName: vendor ? vendor.name : 'OEM Vendor',
      claimNumber: formData.claimNumber,
      status: 'Submitted',
      issueDescription: formData.issueDescription,
      dateRaised: new Date().toISOString().slice(0, 10),
      expectedResolution: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      timeline: [
        { date: new Date().toISOString().slice(0, 10), event: 'Claim Raised with Vendor', note: 'Dispatch ticket logged' }
      ]
    };

    setWarrantyClaims(prev => [newClaim, ...prev]);
    setModalOpen(false);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleUpdateStatus = (claimId, newStatus) => {
    if (isAuditor) return;
    setWarrantyClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: newStatus,
          timeline: [...(c.timeline || []), { date: new Date().toISOString().slice(0, 10), event: `Status updated to ${newStatus}` }]
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>OEM Vendor SLA Tracking</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Warranty Claim Management &amp; Expiry Sentinel
          </h1>
          <p className="text-xs text-slate-500">
            Proactive 90/30/7-day warranty expiration alerts, vendor RMA dispatch numbers, and component replacement tracking.
          </p>
        </div>

        {!isAuditor && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Warranty Claim</span>
          </button>
        )}
      </div>

      {/* Expiry Alerts Banner (90/30/7 days) */}
      <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Expiring Warranty Warning Radar ({expiring90Days.length} Assets within 90 Days)
            </h3>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Schedule OEM Extended Coverage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {expiring90Days.map(a => (
            <div key={a.id} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 text-xs">
              <span className="font-bold text-slate-900 dark:text-white truncate block">{a.name}</span>
              <p className="text-[11px] text-slate-500">{a.id} • {a.subBranch}</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">Expires: {a.warrantyExpiry}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">
          Active Vendor Warranty Claims ({warrantyClaims.length})
        </h3>

        <div className="space-y-3">
          {warrantyClaims.map(claim => (
            <div
              key={claim.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {claim.claimNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    {claim.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {claim.assetName} ({claim.assetId})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor: <span className="font-semibold text-slate-700 dark:text-slate-300">{claim.vendorName}</span> • Raised: {claim.dateRaised}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {claim.issueDescription}
                </p>
              </div>

              {!isAuditor && (
                <div className="flex items-center space-x-2">
                  <select
                    value={claim.status}
                    onChange={(e) => handleUpdateStatus(claim.id, e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved by OEM</option>
                    <option value="Replaced">Replaced &amp; Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Raise OEM Warranty Claim
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Equipment under Warranty *
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id}: {a.name} ({a.subBranch} • Exp: {a.warrantyExpiry})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">OEM Vendor</label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Claim / RMA Tracking #</label>
                <input
                  type="text"
                  value={formData.claimNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, claimNumber: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fault Description</label>
                <textarea
                  rows={3}
                  value={formData.issueDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDescription: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Dispatch Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
