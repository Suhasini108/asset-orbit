import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  RotateCcw,
  Upload,
  X,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function LossTheftPage() {
  const { lossTheftReports, reportLossTheft, approveLossTheft, recoverAsset, assets } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    incidentDate: new Date().toISOString().slice(0, 10),
    location: 'Main Academic Block Room 102',
    circumstances: '',
    policeFirNumber: '',
    insuranceClaimNumber: '',
    evidenceFileName: null
  });

  const handleOpenReport = () => {
    if (isAuditor) {
      alert('Auditor account has read-only access.');
      return;
    }
    setModalOpen(true);
  };

  const handleSimulateEvidence = () => {
    setFormData(prev => ({ ...prev, evidenceFileName: 'police_fir_official_acknowledgement.pdf' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.assetId) {
      alert('Please select an asset.');
      return;
    }
    const asset = assets.find(a => a.id === formData.assetId);

    reportLossTheft({
      ...formData,
      assetName: asset ? asset.name : 'Unspecified Equipment',
      policeFirNumber: formData.policeFirNumber || `FIR-${Date.now().toString().slice(-5)}`,
      insuranceStatus: formData.insuranceClaimNumber ? 'Claim Lodged ($500 estimated)' : 'Not Filed'
    }, currentUser.name);

    setModalOpen(false);
  };

  const handleApprove = (reportId) => {
    approveLossTheft(reportId, currentUser.role, currentUser.name);
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleRecover = (reportId) => {
    recoverAsset(reportId, currentUser.name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Incident Investigation &amp; Police FIR</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Asset Loss &amp; Theft Reporting Workflow
          </h1>
          <p className="text-xs text-slate-500">
            Multi-tier formal approval (Reporter → Department Head → IT Admin), MDM remote-lock, and insurance claim tracking.
          </p>
        </div>

        {!isAuditor && (
          <button
            onClick={handleOpenReport}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>File Loss / Theft Incident</span>
          </button>
        )}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {lossTheftReports.map((report) => (
          <div
            key={report.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {report.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    {report.status}
                  </span>
                  <span className="text-xs text-slate-400">• Incident Date: {report.incidentDate}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {report.assetName} ({report.assetId})
                </h3>
                <p className="text-xs text-slate-500">
                  Location: {report.location} • Reporter: {report.reporterName}
                </p>
              </div>

              {/* Status Action Buttons */}
              {!isAuditor && (
                <div className="flex items-center space-x-2">
                  {report.status.includes('Pending') && (currentUser.role === 'Department Head' || currentUser.role === 'ITManager or HOD' || currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-sm flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>HOD / Admin Sign-Off</span>
                    </button>
                  )}

                  {report.status !== 'Recovered & Restored' && (
                    <button
                      onClick={() => handleRecover(report.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Mark Recovered</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Circumstances & Police FIR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Circumstances</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1">{report.circumstances}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Police FIR / Report #</span>
                <p className="text-slate-900 dark:text-white font-mono font-semibold mt-1">
                  {report.policeFirNumber || 'Pending Filing'}
                </p>
                {report.evidenceFileName && (
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium block mt-1 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{report.evidenceFileName}</span>
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Insurance Claim Status</span>
                <p className="text-slate-900 dark:text-white font-semibold mt-1">
                  {report.insuranceStatus || 'No insurance claim filed'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Ref: {report.insuranceClaimNumber || 'N/A'}
                </p>
              </div>
            </div>

            {/* Multi-Tier Approval Chain Visualizer */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Approval Progress:</span>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Reporter Filed</span>
                </div>
                <div className={`flex items-center space-x-1.5 font-medium ${
                  report.approvals?.deptHead?.approved
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Dept Head (HOD)</span>
                </div>
                <div className={`flex items-center space-x-1.5 font-medium ${
                  report.approvals?.itAdmin?.approved
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. IT Admin (Deactivated)</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* File Incident Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                File Official Loss / Theft Incident
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Missing Equipment / Asset *
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.filter(a => a.status !== 'Stolen' && a.status !== 'Lost').map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id}: {a.name} ({a.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Date &amp; Location
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Lab or Room location"
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Circumstances of Loss
                </label>
                <textarea
                  rows={2}
                  value={formData.circumstances}
                  onChange={(e) => setFormData(prev => ({ ...prev, circumstances: e.target.value }))}
                  placeholder="Describe when equipment was last seen and circumstances..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Police FIR Number</label>
                  <input
                    type="text"
                    value={formData.policeFirNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, policeFirNumber: e.target.value }))}
                    placeholder="FIR-KA-BLR-2026-XXXX"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Insurance Claim #</label>
                  <input
                    type="text"
                    value={formData.insuranceClaimNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceClaimNumber: e.target.value }))}
                    placeholder="INS-CLAIM-XXXX"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Evidence / FIR Copy</label>
                {formData.evidenceFileName ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                    <span>{formData.evidenceFileName}</span>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, evidenceFileName: null }))}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateEvidence}
                    className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Signed FIR Receipt / Evidence</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
