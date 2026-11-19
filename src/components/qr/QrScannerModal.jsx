import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wrench,
  CheckSquare,
  ArrowRightLeft,
  Sparkles,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export default function QrScannerModal({ isOpen, onClose, onSelectAsset, onReportTicket }) {
  const { assets, updateAsset } = useApp();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedAsset, setScannedAsset] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [auditSuccessMsg, setAuditSuccessMsg] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedAsset(null);
      setManualInput('');
      setAuditSuccessMsg('');
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera API not accessible in this environment. Use simulated scanner below.');
      }
    } catch (err) {
      setCameraError('Camera permission denied or camera not found. Use simulated quick-scan below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSimulateScan = (assetId) => {
    const asset = assets.find(a => a.id === assetId || a.serialNumber === assetId);
    if (asset) {
      triggerScanFound(asset);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const query = manualInput.trim().toLowerCase();
    const asset = assets.find(a =>
      a.id.toLowerCase() === query ||
      a.serialNumber.toLowerCase() === query ||
      (a.benchNumber && a.benchNumber.toLowerCase().includes(query))
    );
    if (asset) {
      triggerScanFound(asset);
    } else {
      alert(`No asset found matching "${manualInput}". Try e.g. AST-CSE-001`);
    }
  };

  const triggerScanFound = (asset) => {
    setScannedAsset(asset);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleVerifyInAudit = () => {
    if (!scannedAsset) return;
    setAuditSuccessMsg(`Asset ${scannedAsset.id} verified and matched with ${scannedAsset.labRoom}!`);
    setTimeout(() => setAuditSuccessMsg(''), 4000);
  };

  const handleToggleCheckInOut = () => {
    if (!scannedAsset) return;
    const newStatus = scannedAsset.status === 'Available' ? 'Assigned' : 'Available';
    updateAsset(scannedAsset.id, {
      status: newStatus,
      assignedUser: newStatus === 'Available' ? 'Unassigned Pool' : 'Lab Practical Batch'
    });
    setScannedAsset(prev => ({ ...prev, status: newStatus }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                In-Browser QR &amp; Barcode Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Point camera at asset QR label or simulate instant scan from department registry.
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

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Viewfinder Window */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border-2 border-slate-800 shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <ScanLine className="w-12 h-12 mx-auto text-sky-500 animate-pulse mb-3" />
                <p className="text-xs font-semibold text-slate-300">Camera Viewfinder Ready</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  {cameraError || 'Allow camera permission or use the one-click simulated scanner below.'}
                </p>
              </div>
            )}

            {/* Scanning Overlay Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-sky-400/80 rounded-2xl relative animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-sky-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-sky-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-sky-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-sky-400" />
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Quick Simulated Scan & Barcode Input */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Simulate Quick Scan (Instant Test)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {assets.slice(0, 4).map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleSimulateScan(a.id)}
                  className="p-2 rounded-xl text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-400 transition-all text-xs"
                >
                  <p className="font-bold text-sky-600 dark:text-sky-400 truncate">{a.id}</p>
                  <p className="text-[10px] text-slate-500 truncate">{a.name.split(' ')[0]} • {a.subBranch}</p>
                </button>
              ))}
            </div>

            {/* Manual Serial Search Form */}
            <form onSubmit={handleManualSubmit} className="flex items-center space-x-2 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Or enter Asset ID / Serial (e.g. AST-CSE-001)"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
              >
                Scan Tag
              </button>
            </form>
          </div>

          {/* Scanned Asset Result Card */}
          {scannedAsset && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-indigo-50/70 dark:from-sky-950/40 dark:to-indigo-950/30 border-2 border-sky-400/60 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      MATCH CONFIRMED
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                      {scannedAsset.id}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {scannedAsset.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Serial: {scannedAsset.serialNumber} • Location: {scannedAsset.labRoom || scannedAsset.location} • {scannedAsset.benchNumber}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Health Score</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {scannedAsset.healthScore || 90}%
                  </span>
                </div>
              </div>

              {auditSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{auditSuccessMsg}</span>
                </div>
              )}

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-sky-200/60 dark:border-sky-800/60">
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectAsset) onSelectAsset(scannedAsset);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-white flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onReportTicket) onReportTicket(scannedAsset);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-rose-600 dark:text-rose-400 flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Wrench className="w-3.5 h-3.5 text-rose-500" />
                  <span>Report Ticket</span>
                </button>

                <button
                  onClick={handleVerifyInAudit}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Audit Verify</span>
                </button>

                <button
                  onClick={handleToggleCheckInOut}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-[#315F50] dark:text-indigo-400 flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#315F50]" />
                  <span>{scannedAsset.status === 'Available' ? 'Check-Out' : 'Check-In'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
