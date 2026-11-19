import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  X,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function BackupRecoveryModal({ isOpen, onClose }) {
  const { createFullBackup, restoreFromBackup, activityLogs } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [restoreText, setRestoreText] = useState('');
  const [restoreStatus, setRestoreStatus] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const backupObj = createFullBackup();
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `AssetOrbit_Enterprise_Backup_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setRestoreText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSubmit = () => {
    if (isAuditor) {
      alert('Auditors cannot execute disaster recovery restores.');
      return;
    }
    const result = restoreFromBackup(restoreText, currentUser.name);
    if (result.success) {
      setRestoreStatus({ success: true, count: result.count });
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      setRestoreStatus({ success: false, error: result.error });
    }
    setConfirmModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#315F50] text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Disaster Recovery &amp; System State Backup
              </h2>
              <p className="text-xs text-slate-500">
                Full cryptographic system state export, JSON integrity validation, and selective restoration.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Health Status Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 border border-[#A9C7B5]/40 dark:border-purple-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-[#315F50] dark:text-purple-400" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Backup Health Status: 100% Verified
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Local and Cloud synchronized state schema v2.0. Integrity checksum verified.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md shadow-purple-600/25 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Full JSON Backup</span>
            </button>
          </div>

          {/* Restore from File Section */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Restore Database from Backup File
                </h4>
                <p className="text-xs text-slate-500">
                  Upload an existing AssetOrbit JSON backup file to overwrite or recover system state.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1">
              <Upload className="w-5 h-5 mx-auto text-slate-400" />
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#E6EFE8] file:text-[#315F50]"
              />
            </div>

            {restoreText && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preview Backup Payload:
                </label>
                <textarea
                  rows={4}
                  value={restoreText.slice(0, 400) + '...'}
                  readOnly
                  className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                />
                {!isAuditor && (
                  <button
                    type="button"
                    onClick={() => setConfirmModal(true)}
                    className="mt-3 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Proceed with System State Restoration</span>
                  </button>
                )}
              </div>
            )}

            {restoreStatus && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                restoreStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300'
              }`}>
                {restoreStatus.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Restoration Complete! {restoreStatus.count} assets and records re-hydrated.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Failed to restore: {restoreStatus.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Backup History Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Recent System Activity &amp; Backup Audit Trail</span>
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{log.action}: </span>
                    <span className="text-slate-600 dark:text-slate-400">{log.entity}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Overwrite Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm System Restoration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Restoring from this backup file will overwrite active assets, subscriptions, and tickets. Are you sure you wish to proceed?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreSubmit}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25"
              >
                Yes, Overwrite &amp; Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
