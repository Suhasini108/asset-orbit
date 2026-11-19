import React, { useState, useMemo } from 'react';
import {
  Download,
  Activity,
  Repeat,
  QrCode,
  ShieldAlert,
  Flame,
  FileCheck2,
  Ticket,
  Clock,
  RotateCw,
  Wrench,
  Printer,
  Camera,
  Trash2,
  AlertTriangle,
  Plus,
  Radio,
  FileText,
  CheckCircle2,
  Database,
  Upload,
  Calendar,
  Layers,
  Search,
  Check,
  Building2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
  Award,
  Zap,
  ArrowRight,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../data/templates';
import confetti from 'canvas-confetti';

// Child Smart Tool Modules
import ShadowItDetection from '../components/shadowit/ShadowItDetection';
import BatchPrintQrModal from '../components/assets/BatchPrintQrModal';
import QrScannerModal from '../components/qr/QrScannerModal';

export default function SmartToolsPage({ onSelectAsset, onReportIssue }) {
  const {
    assets,
    subscriptions,
    tickets,
    createTicket,
    updateTicketStatus,
    categories,
    eWasteRecords,
    markAsEWaste,
    lossTheftReports,
    reportLossTheft,
    recoverAsset,
    warrantyClaims,
    submitWarrantyClaim,
    updateWarrantyClaimStatus,
    replacementRequests,
    submitReplacementRequest,
    approveReplacementRequest,
    issueLoaner,
    returnLoaner,
    createFullBackup,
    restoreFromBackup,
    restoreSelective,
    validateBackupIntegrity,
    backupLogs,
    activityLogs,
    updateAsset,
    logActivity
  } = useApp();

  const { currentUser, isAuditor } = useAuth();

  // Active Main Tab:
  // 'lifecycle' | 'assign' | 'qr' | 'risk' | 'exit' | 'incident' | 'procurement' | 'audit' | 'backup'
  const [activeTab, setActiveTab] = useState('lifecycle');

  // Sub-tab toggles for multi-purpose tabs
  const [riskSubTab, setRiskSubTab] = useState('ewaste'); // 'shadow' | 'ewaste'
  const [procurementSubTab, setProcurementSubTab] = useState('replacement'); // 'replacement' | 'warranty'

  // Modal states for QR
  const [printQrModal, setPrintQrModal] = useState(false);
  const [qrScannerModal, setQrScannerModal] = useState(false);

  // -------------------------------------------------------------
  // TAB 1: LIFECYCLE & MAINTENANCE
  // -------------------------------------------------------------
  const [maintenanceForm, setMaintenanceForm] = useState({
    assetId: '',
    downtimeHours: '',
    repairCost: '',
    replacementCost: ''
  });
  const [maintenanceSuccess, setMaintenanceSuccess] = useState(false);

  const warranty60d = useMemo(() => {
    const now = Date.now();
    const in60d = now + 60 * 24 * 60 * 60 * 1000;
    return assets.filter(a => {
      if (!a.warrantyExpiry) return false;
      const t = new Date(a.warrantyExpiry).getTime();
      return t >= now && t <= in60d;
    }).length;
  }, [assets]);

  const warrantyExpired = useMemo(() => {
    const now = Date.now();
    return assets.filter(a => {
      if (!a.warrantyExpiry) return false;
      return new Date(a.warrantyExpiry).getTime() < now;
    }).length;
  }, [assets]);

  const replacementReviewCount = useMemo(() => {
    return assets.filter(a => (a.healthScore || 90) < 60 || a.status === 'In Repair').length;
  }, [assets]);

  const handleMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!maintenanceForm.assetId) return;

    const asset = assets.find(a => a.id === maintenanceForm.assetId);
    if (asset) {
      const newScore = Math.min(100, (asset.healthScore || 85) + 15);
      updateAsset(asset.id, {
        status: 'Available',
        healthScore: newScore,
        statusChangeNote: `Maintenance recorded: ${maintenanceForm.downtimeHours || 0}h downtime, ₹${maintenanceForm.repairCost || 0} repair cost`
      }, currentUser?.name || 'Workspace Admin');

      setMaintenanceSuccess(true);
      setTimeout(() => setMaintenanceSuccess(false), 3000);
      setMaintenanceForm({
        assetId: '',
        downtimeHours: '',
        repairCost: '',
        replacementCost: ''
      });
    }
  };

  // -------------------------------------------------------------
  // TAB 2: TEMPORARY ALLOCATIONS & LOANER POOL
  // -------------------------------------------------------------
  const [loanerForm, setLoanerForm] = useState({
    loanerId: '',
    borrowerName: '',
    department: 'CSE',
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Temporary allocation during lab workstation repair'
  });
  const [loanerSuccess, setLoanerSuccess] = useState(false);

  // Filter available spare pool
  const availableLoanerAssets = useMemo(() => {
    return assets.filter(a => a.status === 'Available');
  }, [assets]);

  // Active temporary loaner assets
  const activeLoanerAllocations = useMemo(() => {
    return assets.filter(a => a.status === 'Assigned' && a.assignedUser && a.assignedUser.includes('Loaner:'));
  }, [assets]);

  const handleDispatchLoaner = (e) => {
    e.preventDefault();
    if (!loanerForm.loanerId || !loanerForm.borrowerName) return;

    updateAsset(loanerForm.loanerId, {
      status: 'Assigned',
      assignedUser: `Loaner: ${loanerForm.borrowerName} (${loanerForm.department})`,
      expectedReturnDate: loanerForm.returnDate,
      statusChangeNote: `Dispatched as loaner to ${loanerForm.borrowerName}. Due: ${loanerForm.returnDate}. Notes: ${loanerForm.notes}`
    }, currentUser?.name || 'Admin');

    setLoanerSuccess(true);
    setTimeout(() => setLoanerSuccess(false), 3000);
    setLoanerForm({
      loanerId: '',
      borrowerName: '',
      department: 'CSE',
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: ''
    });
  };

  const handleReturnLoanerAsset = (assetId) => {
    updateAsset(assetId, {
      status: 'Available',
      assignedUser: 'Lab Available Pool',
      expectedReturnDate: null,
      statusChangeNote: 'Returned from temporary loaner custody to available inventory'
    }, currentUser?.name || 'Admin');
  };

  // -------------------------------------------------------------
  // TAB 4: RISK & E-WASTE MANAGEMENT
  // -------------------------------------------------------------
  const [eWasteForm, setEWasteForm] = useState({
    assetId: '',
    method: 'Certified E-Waste Recycler (CPCB Approved)',
    vendorName: 'Saahas Zero Waste & EcoRecyclers',
    weightKg: '14',
    checklist: {
      nistWipe: true,
      biosReset: true,
      tagsRemoved: true,
      macRevoked: true,
      hodSignoff: true
    }
  });
  const [eWasteSuccess, setEWasteSuccess] = useState(false);

  const handleEWasteSubmit = (e) => {
    e.preventDefault();
    if (!eWasteForm.assetId) return;

    markAsEWaste(eWasteForm.assetId, {
      method: eWasteForm.method,
      vendorName: eWasteForm.vendorName,
      weightKg: Number(eWasteForm.weightKg) || 12,
      wipeMethod: 'NIST SP 800-88 Rev 1 (3-Pass DoD Sanitization)'
    }, currentUser?.name || 'Admin');

    setEWasteSuccess(true);
    setTimeout(() => setEWasteSuccess(false), 3000);
    setEWasteForm({
      assetId: '',
      method: 'Certified E-Waste Recycler (CPCB Approved)',
      vendorName: 'Saahas Zero Waste & EcoRecyclers',
      weightKg: '14',
      checklist: {
        nistWipe: true,
        biosReset: true,
        tagsRemoved: true,
        macRevoked: true,
        hodSignoff: true
      }
    });
  };

  const totalEWasteWeightKg = useMemo(() => {
    return eWasteRecords.reduce((sum, r) => sum + (Number(r.totalWeightKg) || 12), 0);
  }, [eWasteRecords]);

  // -------------------------------------------------------------
  // TAB 5: LOSS & THEFT INCIDENT REPORTING
  // -------------------------------------------------------------
  const [lossForm, setLossForm] = useState({
    assetId: '',
    incidentDate: new Date().toISOString().slice(0, 10),
    location: 'Academic Block 3, CSE Lab-1',
    firNumber: '',
    circumstances: ''
  });
  const [lossSuccess, setLossSuccess] = useState(false);

  const handleLossSubmit = (e) => {
    e.preventDefault();
    if (!lossForm.assetId) return;

    reportLossTheft({
      assetId: lossForm.assetId,
      incidentDate: lossForm.incidentDate,
      location: lossForm.location,
      firNumber: lossForm.firNumber || `FIR-${Math.floor(10000 + Math.random() * 90000)}/2026`,
      circumstances: lossForm.circumstances || 'Hardware unaccounted during lab physical check'
    }, currentUser?.name || 'Admin');

    setLossSuccess(true);
    setTimeout(() => setLossSuccess(false), 3000);
    setLossForm({
      assetId: '',
      incidentDate: new Date().toISOString().slice(0, 10),
      location: '',
      firNumber: '',
      circumstances: ''
    });
  };

  // -------------------------------------------------------------
  // TAB 6: INCIDENT DESK & TICKETS
  // -------------------------------------------------------------
  const [ticketForm, setTicketForm] = useState({
    assetId: '',
    title: '',
    priority: 'High',
    description: '',
    department: 'CSE'
  });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const openTicketsList = useMemo(() => {
    return tickets.filter(t => t.status !== 'Closed');
  }, [tickets]);

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.title.trim()) return;

    const linkedAsset = assets.find(a => a.id === ticketForm.assetId);
    createTicket({
      assetId: ticketForm.assetId || (assets[0]?.id || 'AST-GEN-001'),
      assetName: linkedAsset?.name || 'General Lab Workstation',
      title: ticketForm.title.trim(),
      priority: ticketForm.priority,
      description: ticketForm.description || 'Hardware malfunction reported in lab session.',
      department: ticketForm.department
    }, currentUser?.name || 'Lab In-Charge');

    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 3000);
    setTicketForm({
      assetId: '',
      title: '',
      priority: 'High',
      description: '',
      department: 'CSE'
    });
  };

  // -------------------------------------------------------------
  // TAB 7: PROCUREMENT (REPLACEMENT ENGINE & WARRANTY CLAIMS)
  // -------------------------------------------------------------
  const [warrantyForm, setWarrantyForm] = useState({
    assetId: '',
    vendor: 'Dell Technologies',
    claimNumber: '',
    defectDescription: ''
  });
  const [warrantySuccess, setWarrantySuccess] = useState(false);

  const handleWarrantySubmit = (e) => {
    e.preventDefault();
    if (!warrantyForm.assetId) return;

    const asset = assets.find(a => a.id === warrantyForm.assetId);
    submitWarrantyClaim({
      assetId: warrantyForm.assetId,
      assetName: asset?.name || warrantyForm.assetId,
      vendor: warrantyForm.vendor,
      claimNumber: warrantyForm.claimNumber || `WCR-${Math.floor(100000 + Math.random() * 900000)}`,
      defectDescription: warrantyForm.defectDescription || 'Component failure covered under manufacturer warranty'
    }, currentUser?.name || 'Admin');

    setWarrantySuccess(true);
    setTimeout(() => setWarrantySuccess(false), 3000);
    setWarrantyForm({
      assetId: '',
      vendor: 'Dell Technologies',
      claimNumber: '',
      defectDescription: ''
    });
  };

  // -------------------------------------------------------------
  // TAB 8: AUDIT & RECONCILIATION MODE
  // -------------------------------------------------------------
  const [selectedAuditLab, setSelectedAuditLab] = useState('CSE Lab 1 (Turing Systems & OS)');
  const [auditScanInput, setAuditScanInput] = useState('');
  const [scannedAssetIds, setScannedAssetIds] = useState([]);
  const [auditFeedback, setAuditFeedback] = useState(null);

  const expectedLabAssets = useMemo(() => {
    return assets.filter(a => {
      if (!a.labRoom) return false;
      return a.labRoom.toLowerCase().includes('cse') || a.subBranch === 'CSE';
    });
  }, [assets]);

  const handleAuditScan = (e) => {
    e.preventDefault();
    const tag = auditScanInput.trim().toUpperCase();
    if (!tag) return;

    if (scannedAssetIds.includes(tag)) {
      setAuditFeedback({ status: 'warning', message: `Asset ${tag} already scanned in this audit session.` });
      setAuditScanInput('');
      return;
    }

    const found = assets.find(a => a.id.toUpperCase() === tag || a.serialNumber?.toUpperCase() === tag);
    if (found) {
      setScannedAssetIds(prev => [found.id, ...prev]);
      setAuditFeedback({ status: 'success', message: `✓ Verified: ${found.name} (${found.id})` });
    } else {
      setAuditFeedback({ status: 'error', message: `⚠ Unknown Tag: ${tag} is not in registered inventory.` });
    }
    setAuditScanInput('');
  };

  // -------------------------------------------------------------
  // TAB 9: DATA BACKUP & RESTORATION HUB
  // -------------------------------------------------------------
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [integrityReport, setIntegrityReport] = useState(null);
  const [selectiveOptions, setSelectiveOptions] = useState({
    assets: true,
    subscriptions: true,
    tickets: true,
    ewaste: true,
    categories: true
  });
  const [restoreResult, setRestoreResult] = useState(null);

  const handleDownloadFullBackup = () => {
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
    try { confetti({ particleCount: 40, spread: 50 }); } catch (e) {}
  };

  const handleBackupFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setRestoreJsonText(text);
        const check = validateBackupIntegrity(text);
        setIntegrityReport(check);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!restoreJsonText) return;
    const res = restoreSelective(restoreJsonText, selectiveOptions, currentUser?.name || 'Super Admin');
    setRestoreResult(res);
    if (res.success) {
      try { confetti({ particleCount: 60, spread: 70 }); } catch (e) {}
    }
  };

  const handleExportCsv = () => {
    const headers = ['id', 'name', 'serialNumber', 'category', 'subBranch', 'cost', 'status', 'healthScore'];
    exportToCsv('AssetOrbit_SmartTools_Export', headers, assets);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-7 sm:p-9 shadow-xl shadow-[#234937]/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
              Asset Intelligence &amp; Controls
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>Smart Tools &amp; Controls</span>
              <span className="text-xl">⚙️</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#d8eee1] max-w-xl font-medium leading-relaxed">
              Track lifecycle health, department assignments, printable QR labels, e-waste compliance, loaners, and automated backups.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => setActiveTab('lifecycle')}
              title="Reset to Lifecycle View"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all backdrop-blur-sm shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all backdrop-blur-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION PILLS / TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {[
          { id: 'lifecycle', label: 'Lifecycle & health', icon: Activity },
          { id: 'assign', label: 'Assign / return', icon: Repeat },
          { id: 'qr', label: 'QR & smart search', icon: QrCode },
          { id: 'risk', label: 'Risk & compliance', icon: ShieldAlert },
          { id: 'exit', label: 'Exit & recovery', icon: Flame },
          { id: 'incident', label: 'Incident desk', icon: Ticket, badge: openTicketsList.length },
          { id: 'procurement', label: 'Procurement', icon: RotateCw },
          { id: 'audit', label: 'Audit trail', icon: FileCheck2 },
          { id: 'backup', label: 'Data backup & recovery', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all shadow-xs ${
                isActive
                  ? 'bg-[#315F50] text-white shadow-xs'
                  : 'bg-white text-[#718078] hover:text-[#172D27] border border-[#E5EAE5]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* 3. TAB 1: LIFECYCLE & HEALTH (Matching Images 6 & 7)           */}
      {/* ============================================================= */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">
                Warranty expiring in 60 days
              </span>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {warranty60d}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click to view matching assets
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">
                Warranty already expired
              </span>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {warrantyExpired}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click to view matching assets
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">
                Replacement review
              </span>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {replacementReviewCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click to view recommended replacements
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Device lifecycle &amp; health recommendations
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Transparent rule-based scoring; review before making a purchasing decision.
                </p>
              </div>
              <button 
                onClick={() => {}}
                className="text-xs text-[#315F50] hover:underline font-bold flex items-center space-x-1"
              >
                <span>Refresh analysis</span>
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Asset</th>
                    <th className="py-3 px-3">Age</th>
                    <th className="py-3 px-3">Maintenance</th>
                    <th className="py-3 px-3">Downtime</th>
                    <th className="py-3 px-3">Repair / Replace</th>
                    <th className="py-3 px-3">Health</th>
                    <th className="py-3 px-3">Recommendation</th>
                    <th className="py-3 px-3 text-right">Lifecycle action</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                        Add assets to see lifecycle recommendations.
                      </td>
                    </tr>
                  ) : (
                    assets.slice(0, 10).map((a) => (
                      <tr key={a.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {a.name} <span className="text-[10px] text-slate-400 block font-normal">{a.id}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">1.2 yrs</td>
                        <td className="py-3 px-3 text-slate-500">0 events</td>
                        <td className="py-3 px-3 text-slate-500">0 hrs</td>
                        <td className="py-3 px-3 text-slate-500">₹0 / ₹{a.cost || 55000}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-600">{a.healthScore || 95}/100</span>
                        </td>
                        <td className="py-3 px-3 text-emerald-600 font-semibold">Healthy</td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={() => onSelectAsset && onSelectAsset(a)}
                            className="px-2.5 py-1 rounded-lg bg-[#E6EFE8] text-[#315F50] font-bold text-[11px]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Record Maintenance Form (Matching Image 7) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Record maintenance
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Saving a maintenance event updates lifecycle status and health scoring.
                </p>
              </div>
              <Wrench className="w-5 h-5 text-slate-400" />
            </div>

            {maintenanceSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                Maintenance event saved successfully! Asset status updated.
              </div>
            )}

            <form onSubmit={handleMaintenanceSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                    Choose asset
                  </label>
                  <select
                    value={maintenanceForm.assetId}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, assetId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select asset</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.id}) - {a.subBranch || a.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                    Total downtime hours
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.downtimeHours}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, downtimeHours: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                    Total repair cost (₹)
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.repairCost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, repairCost: e.target.value })}
                    placeholder="e.g. 4500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                    Replacement cost (₹)
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.replacementCost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, replacementCost: e.target.value })}
                    placeholder="e.g. 65000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white font-bold text-xs shadow-md transition-all"
              >
                Save maintenance event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. TAB 2: ASSIGN / RETURN (TEMPORARY ALLOCATIONS & LOANER POOL) */}
      {/* ============================================================= */}
      {activeTab === 'assign' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Active temporary loaners</span>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {activeLoanerAllocations.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Currently in student/faculty custody</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Overdue returns</span>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-rose-600">0</p>
                <p className="text-[11px] text-slate-400 mt-1">Due return date elapsed</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Available loaner pool</span>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-emerald-600">
                  {availableLoanerAssets.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Ready for temporary handover</p>
              </div>
            </div>
          </div>

          {/* Dispatch Loaner Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6EFE8] dark:bg-indigo-950/60 text-[#315F50] flex items-center justify-center font-bold">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Dispatch temporary loaner asset
                </h3>
                <p className="text-xs text-slate-400">
                  Assign a backup laptop or workstation to student/staff during hardware repair with automatic return tracking.
                </p>
              </div>
            </div>

            {loanerSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
                Loaner dispatched successfully! Return date reminder registered.
              </div>
            )}

            <form onSubmit={handleDispatchLoaner} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Select available loaner asset *
                </label>
                <select
                  required
                  value={loanerForm.loanerId}
                  onChange={(e) => setLoanerForm({ ...loanerForm, loanerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select available device</option>
                  {availableLoanerAssets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Custodian / Student name *
                </label>
                <input
                  required
                  placeholder="e.g. Priya Sharma (USN 1RV21CS042)"
                  value={loanerForm.borrowerName}
                  onChange={(e) => setLoanerForm({ ...loanerForm, borrowerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Expected return date *
                </label>
                <input
                  type="date"
                  required
                  value={loanerForm.returnDate}
                  onChange={(e) => setLoanerForm({ ...loanerForm, returnDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white font-bold text-xs shadow-md transition-all"
                >
                  Dispatch loaner
                </button>
              </div>
            </form>
          </div>

          {/* Active Allocations Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Active temporary loaner allocations
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Loaner asset</th>
                    <th className="py-2.5 px-3">Borrower / Student</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Expected return</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoanerAllocations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No active temporary loaner allocations. Dispatch spare devices using the form above.
                      </td>
                    </tr>
                  ) : (
                    activeLoanerAllocations.map(a => (
                      <tr key={a.id} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{a.name} ({a.id})</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{a.assignedUser}</td>
                        <td className="py-3 px-3 text-slate-500">{a.subBranch || 'CSE'}</td>
                        <td className="py-3 px-3 text-[#315F50] font-bold">{a.expectedReturnDate || 'In 7 days'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleReturnLoanerAsset(a.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100"
                          >
                            Swap-back &amp; return
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. TAB 3: QR & SMART SEARCH (Dedicated QR Section)            */}
      {/* ============================================================= */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                QR Code System &amp; Smart Scanner
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate printable label sheets for college lab equipment or scan QR codes using your web camera.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-6 rounded-2xl bg-[#E6EFE8]/60 dark:bg-indigo-950/30 border border-[#A9C7B5]/40 dark:border-indigo-800/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#315F50] text-white flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Batch Print QR Labels Sheet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Print adhesive QR label sticker sheets (A4 2&times;4 or 3&times;6 grid) with college headers for lab computers and departmental hardware.
                </p>
                <button
                  onClick={() => setPrintQrModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Open Print Sheet
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  In-Browser Camera Scanner
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Scan any physical equipment QR tag using your webcam or phone camera to view specs, log maintenance, or verify during semester audits.
                </p>
                <button
                  onClick={() => setQrScannerModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Launch Camera Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. TAB 4: RISK & COMPLIANCE (SHADOW IT & E-WASTE MANAGEMENT)  */}
      {/* ============================================================= */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Sub-tab switcher */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setRiskSubTab('ewaste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                riskSubTab === 'ewaste'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              E-Waste Decommissioning &amp; Green IT
            </button>
            <button
              onClick={() => setRiskSubTab('shadow')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                riskSubTab === 'shadow'
                  ? 'bg-[#315F50] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Zero-Trust Shadow IT Detection
            </button>
          </div>

          {riskSubTab === 'shadow' ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Zero-Trust Shadow IT Detection
              </h3>
              <p className="text-xs text-slate-400">
                Inspect campus network logs and flag unapproved cloud SaaS apps or rogue storage drives.
              </p>
              <ShadowItDetection />
            </div>
          ) : (
            <div className="space-y-6">
              {/* E-Waste Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Landfill Diverted</span>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-2">{totalEWasteWeightKg} kg</p>
                  <p className="text-[11px] text-slate-400 mt-1">E-waste sent to certified recyclers</p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Carbon Offset</span>
                  <p className="text-3xl font-extrabold text-[#315F50] mt-2">{Math.round(totalEWasteWeightKg * 1.8)} kg CO2e</p>
                  <p className="text-[11px] text-slate-400 mt-1">Avoided virgin manufacturing emissions</p>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Disposal Certificates</span>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{eWasteRecords.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Auditable compliance records</p>
                </div>
              </div>

              {/* Decommission Form */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Decommission asset as E-Waste
                    </h3>
                    <p className="text-xs text-slate-400">
                      5-Point NIST SP 800-88 data sanitization protocol with automated disposal certificate generation.
                    </p>
                  </div>
                </div>

                {eWasteSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
                    Asset decommissioned as E-Waste! Disposal certificate generated.
                  </div>
                )}

                <form onSubmit={handleEWasteSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Select hardware asset *
                      </label>
                      <select
                        required
                        value={eWasteForm.assetId}
                        onChange={(e) => setEWasteForm({ ...eWasteForm, assetId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        <option value="">Select asset to retire</option>
                        {assets.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.id}) - {a.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Disposal method
                      </label>
                      <select
                        value={eWasteForm.method}
                        onChange={(e) => setEWasteForm({ ...eWasteForm, method: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Certified E-Waste Recycler (CPCB Approved)">Certified Recycler (CPCB Approved)</option>
                        <option value="Institutional Donation to Rural School">Donation to Rural School</option>
                        <option value="Component Salvage / Lab Spares Harvest">Component Salvage &amp; Spares</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Estimated weight (kg)
                      </label>
                      <input
                        type="number"
                        value={eWasteForm.weightKg}
                        onChange={(e) => setEWasteForm({ ...eWasteForm, weightKg: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* 5-Point NIST Checklist */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                      5-Point NIST SP 800-88 Data Sanitization Checklist:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span>3-Pass cryptographic sanitize overwrite completed</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span>BIOS password cleared &amp; CMOS reset</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span>Campus asset tags &amp; RFID labels removed</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span>MAC address deregistered from campus RADIUS</span>
                      </label>
                      <label className="flex items-center space-x-2 sm:col-span-2">
                        <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                        <span>Countersigned by Department HOD and Lab Technical Superintendent</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Generate E-Waste Decommission Certificate
                  </button>
                </form>
              </div>

              {/* Certificates List */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Disposal certificate tracking log
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
                        <th className="py-2 px-3">Certificate #</th>
                        <th className="py-2 px-3">Asset</th>
                        <th className="py-2 px-3">Disposal method</th>
                        <th className="py-2 px-3">Weight</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eWasteRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                            No e-waste records logged yet. Decommission end-of-life computers above.
                          </td>
                        </tr>
                      ) : (
                        eWasteRecords.map(r => (
                          <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50">
                            <td className="py-3 px-3 font-mono font-bold text-emerald-600">{r.certificateNumber || r.id}</td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{r.assetName || r.assetId}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{r.method}</td>
                            <td className="py-3 px-3 text-slate-500">{r.totalWeightKg || 12} kg</td>
                            <td className="py-3 px-3 text-slate-500">{r.disposalDate || '2026-11-17'}</td>
                            <td className="py-3 px-3 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                Certified
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. TAB 5: EXIT & RECOVERY (LOSS & THEFT INCIDENTS)            */}
      {/* ============================================================= */}
      {activeTab === 'exit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Asset loss &amp; theft reporting workflow
                </h3>
                <p className="text-xs text-slate-400">
                  File official reports with police FIR number, insurance claim tracking, and remote credential revocation.
                </p>
              </div>
            </div>

            {lossSuccess && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 font-bold text-xs">
                Incident report filed! Access credentials locked for linked asset.
              </div>
            )}

            <form onSubmit={handleLossSubmit} className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Select missing asset *
                  </label>
                  <select
                    required
                    value={lossForm.assetId}
                    onChange={(e) => setLossForm({ ...lossForm, assetId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select asset</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.id}) - {a.location || 'Campus'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Incident date *
                  </label>
                  <input
                    type="date"
                    required
                    value={lossForm.incidentDate}
                    onChange={(e) => setLossForm({ ...lossForm, incidentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Location / Lab room
                  </label>
                  <input
                    value={lossForm.location}
                    onChange={(e) => setLossForm({ ...lossForm, location: e.target.value })}
                    placeholder="e.g. CSE Lab 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Police FIR / Diary #
                  </label>
                  <input
                    value={lossForm.firNumber}
                    onChange={(e) => setLossForm({ ...lossForm, firNumber: e.target.value })}
                    placeholder="e.g. FIR-2026/8941"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Circumstances &amp; investigation details
                </label>
                <textarea
                  rows={2}
                  value={lossForm.circumstances}
                  onChange={(e) => setLossForm({ ...lossForm, circumstances: e.target.value })}
                  placeholder="Describe when the equipment was last seen, security footage review, and action taken..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Submit Incident &amp; Lock Device Access
              </button>
            </form>
          </div>

          {/* Loss Reports Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Incident reports log
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Report ID</th>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">FIR Number</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lossTheftReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No loss or incident reports currently open.
                      </td>
                    </tr>
                  ) : (
                    lossTheftReports.map(r => (
                      <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3 px-3 font-mono font-bold text-rose-600">{r.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{r.assetName || r.assetId}</td>
                        <td className="py-3 px-3 text-slate-500">{r.firNumber || 'Pending'}</td>
                        <td className="py-3 px-3 text-amber-600 font-bold">{r.status}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => recoverAsset(r.id, currentUser?.name || 'Admin')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px]"
                          >
                            Mark recovered
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 8. TAB 6: INCIDENT DESK (HELP DESK & SLA MONITORING)          */}
      {/* ============================================================= */}
      {activeTab === 'incident' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6EFE8] dark:bg-indigo-950/60 text-[#315F50] flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Report hardware or software issue
                </h3>
                <p className="text-xs text-slate-400">
                  Open a maintenance ticket with priority SLA policies (Critical 4h, High 8h, Medium 24h, Low 72h).
                </p>
              </div>
            </div>

            {ticketSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
                Ticket logged successfully! Live SLA countdown active.
              </div>
            )}

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Linked asset *
                  </label>
                  <select
                    value={ticketForm.assetId}
                    onChange={(e) => setTicketForm({ ...ticketForm, assetId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">General Lab Workstation</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Issue title *
                  </label>
                  <input
                    required
                    placeholder="e.g. Blue screen error during compiler execution"
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    SLA Priority level
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Critical">Critical (4 Hour SLA - Lab Down)</option>
                    <option value="High">High (8 Hour SLA)</option>
                    <option value="Medium">Medium (24 Hour SLA)</option>
                    <option value="Low">Low (72 Hour SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Issue description &amp; error symptoms
                </label>
                <textarea
                  rows={2}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Describe hardware beeps, software error code, or physical fault..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white font-bold text-xs shadow-md transition-all"
              >
                Log Ticket &amp; Start SLA Timer
              </button>
            </form>
          </div>

          {/* Active Tickets List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Open tickets with live SLA monitoring
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Ticket ID</th>
                    <th className="py-2.5 px-3">Title &amp; Asset</th>
                    <th className="py-2.5 px-3">Priority / SLA</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Guided action</th>
                  </tr>
                </thead>
                <tbody>
                  {openTicketsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        All tickets resolved. 0 open tickets in SLA queue.
                      </td>
                    </tr>
                  ) : (
                    openTicketsList.map(t => (
                      <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3 px-3 font-mono font-bold text-[#315F50]">{t.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 dark:text-white block">{t.title}</span>
                          <span className="text-[10px] text-slate-400">{t.assetName || t.assetId}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            t.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {t.priority} (Active SLA)
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">{t.status}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => updateTicketStatus(t.id, 'Resolved', 'Resolved by Lab Technical Staff')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px]"
                          >
                            Mark resolved
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 9. TAB 7: PROCUREMENT (REPLACEMENT & WARRANTY CLAIMS)         */}
      {/* ============================================================= */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setProcurementSubTab('replacement')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                procurementSubTab === 'replacement'
                  ? 'bg-[#315F50] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Automatic Replacement Engine
            </button>
            <button
              onClick={() => setProcurementSubTab('warranty')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                procurementSubTab === 'warranty'
                  ? 'bg-[#315F50] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Warranty Claim Management
            </button>
          </div>

          {procurementSubTab === 'replacement' ? (
            <div className="space-y-6">
              {/* Rules Cards */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Automatic Asset Replacement Rules Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Flags workstations for replacement based on failure frequency, repair cost vs asset purchase value, or age.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-[#315F50] block">Rule 1</span>
                    <strong className="text-xs text-slate-900 dark:text-white block mt-1">Age &gt; 4 Years</strong>
                    <span className="text-[11px] text-slate-400">Lab hardware refresh cycle</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Rule 2</span>
                    <strong className="text-xs text-slate-900 dark:text-white block mt-1">3+ Maintenance Tickets</strong>
                    <span className="text-[11px] text-slate-400">Repeated hardware instability</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-rose-600 block">Rule 3</span>
                    <strong className="text-xs text-slate-900 dark:text-white block mt-1">Repair Cost &gt; 50%</strong>
                    <span className="text-[11px] text-slate-400">Exceeds asset residual value</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Rule 4</span>
                    <strong className="text-xs text-slate-900 dark:text-white block mt-1">End of Life (EOL)</strong>
                    <span className="text-[11px] text-slate-400">Vendor support discontinued</span>
                  </div>
                </div>
              </div>

              {/* Department Replacement Forecast */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming Capital Replacement Budget Forecast (₹)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Flagged units</th>
                        <th className="py-2.5 px-3">Estimated budget</th>
                        <th className="py-2.5 px-3 text-right">Committee approval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['CSE', 'ISE', 'AI&ML', 'ECE', 'EEE', 'Mechanical', 'Civil'].map(dept => (
                        <tr key={dept} className="border-b border-slate-50 dark:border-slate-800/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{dept} Engineering</td>
                          <td className="py-2.5 px-3 text-slate-500">0 units flagged</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">₹0</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-[10px]">
                              Planned
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Raise Claim Form */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Raise OEM Warranty Claim
                </h3>
                <p className="text-xs text-slate-400">
                  Submit hardware warranty claims directly to Dell, HP, Cisco, or Lenovo with dispatch tracking.
                </p>

                {warrantySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
                    Warranty claim submitted! Case tracking number registered.
                  </div>
                )}

                <form onSubmit={handleWarrantySubmit} className="space-y-4 text-xs pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Select covered asset *
                      </label>
                      <select
                        required
                        value={warrantyForm.assetId}
                        onChange={(e) => setWarrantyForm({ ...warrantyForm, assetId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        <option value="">Select asset</option>
                        {assets.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.id}) - {a.vendor || 'Dell'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Authorized OEM vendor
                      </label>
                      <select
                        value={warrantyForm.vendor}
                        onChange={(e) => setWarrantyForm({ ...warrantyForm, vendor: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Dell Technologies">Dell Technologies</option>
                        <option value="HP Commercial Systems">HP Commercial Systems</option>
                        <option value="Lenovo Enterprise">Lenovo Enterprise</option>
                        <option value="Cisco Networking">Cisco Networking</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                        Vendor claim / Ticket number
                      </label>
                      <input
                        placeholder="e.g. DELL-INC-94812"
                        value={warrantyForm.claimNumber}
                        onChange={(e) => setWarrantyForm({ ...warrantyForm, claimNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Defect details &amp; diagnostic failure code
                    </label>
                    <textarea
                      rows={2}
                      value={warrantyForm.defectDescription}
                      onChange={(e) => setWarrantyForm({ ...warrantyForm, defectDescription: e.target.value })}
                      placeholder="e.g. Motherboard POST failure, memory channel B disabled on boot..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white font-bold text-xs shadow-md transition-all"
                  >
                    Submit OEM Warranty Claim
                  </button>
                </form>
              </div>

              {/* Warranty Claims Log */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active warranty claims tracking
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Claim #</th>
                        <th className="py-2.5 px-3">Asset</th>
                        <th className="py-2.5 px-3">OEM Vendor</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Filed date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warrantyClaims.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                            No active warranty claims filed.
                          </td>
                        </tr>
                      ) : (
                        warrantyClaims.map(c => (
                          <tr key={c.id} className="border-b border-slate-50 dark:border-slate-800/50">
                            <td className="py-3 px-3 font-mono font-bold text-[#315F50]">{c.claimNumber}</td>
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{c.assetName}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{c.vendor}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#315F50] font-bold text-[10px]">
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-slate-400">{c.submittedDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 10. TAB 8: AUDIT TRAIL & PHYSICAL RECONCILIATION              */}
      {/* ============================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6EFE8] dark:bg-purple-950/60 text-[#315F50] flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Semester Physical Audit &amp; Reconciliation Scanner
                </h3>
                <p className="text-xs text-slate-400">
                  Walk through campus departments and scan asset tags to produce instantaneous physical discrepancy reports.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1 text-xs">
                  Choose lab room for audit
                </label>
                <select
                  value={selectedAuditLab}
                  onChange={(e) => setSelectedAuditLab(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="CSE Lab 1 (Turing Systems & OS)">CSE Lab 1 (Turing Systems &amp; OS)</option>
                  <option value="CSE Lab 2 (Lovelace AI & Cloud)">CSE Lab 2 (Lovelace AI &amp; Cloud)</option>
                  <option value="ISE Lab 1 (Network Security & Cloud)">ISE Lab 1 (Network Security &amp; Cloud)</option>
                  <option value="AI&ML Lab (Deep Learning & Neural Nets)">AI&amp;ML Lab (Deep Learning)</option>
                  <option value="ECE Lab 1 (DSP & Microprocessors)">ECE Lab 1 (DSP &amp; Microprocessors)</option>
                  <option value="Mech Lab 1 (CAD/CAM Workstations)">Mech Lab 1 (CAD/CAM Workstations)</option>
                  <option value="Civil Lab (GIS & Structural Analysis)">Civil Lab (GIS &amp; Structural)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <form onSubmit={handleAuditScan} className="space-y-1">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1 text-xs">
                    Scan or type barcode / QR Tag ID:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      placeholder="e.g. AST-CSE-001 or OPT-CSE-7090"
                      value={auditScanInput}
                      onChange={(e) => setAuditScanInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#315F50] text-white font-bold text-xs"
                    >
                      Verify tag
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {auditFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                auditFeedback.status === 'success'
                  ? 'bg-emerald-50 text-emerald-800'
                  : auditFeedback.status === 'warning'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-rose-50 text-rose-800'
              }`}>
                {auditFeedback.message}
              </div>
            )}
          </div>

          {/* Audit Verification Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Expected in Lab</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{expectedLabAssets.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">Registered to {selectedAuditLab.split('(')[0]}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Physically Scanned</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">{scannedAssetIds.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">Confirmed present during walk-through</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Missing / Unverified</span>
              <p className="text-3xl font-extrabold text-amber-600 mt-2">
                {Math.max(0, expectedLabAssets.length - scannedAssetIds.length)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Pending physical verification</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 11. TAB 9: DATA BACKUP & RECOVERY (COLLEGE ADMIN RECOVERY)   */}
      {/* ============================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Health Status Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-[#315F50]/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Database Backup Status: 100% Healthy &amp; Verified
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Continuous Snapshots
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Full cryptographic state backup with selective JSON restoration and integrity verification.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadFullBackup}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Backup (.json)</span>
            </button>
          </div>

          {/* Restore Section with Selective Restore Checkboxes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6EFE8] dark:bg-purple-950/60 text-[#315F50] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Selective Restore from JSON Backup
                </h3>
                <p className="text-xs text-slate-400">
                  Select which database entities to recover from your backup archive.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Upload className="w-6 h-6 mx-auto text-slate-400" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Choose an AssetOrbit JSON backup file to inspect:
              </div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleBackupFileSelect}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#315F50] file:text-white file:font-bold cursor-pointer"
              />
            </div>

            {integrityReport && (
              <div className="p-4 rounded-2xl bg-[#E6EFE8]/50 dark:bg-indigo-950/30 border border-[#A9C7B5]/40 dark:border-indigo-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#172D27] dark:text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Integrity Validation: {integrityReport.summary?.integrityCheck || 'PASSED'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>Timestamp: <b>{new Date(integrityReport.summary.timestamp).toLocaleString()}</b></div>
                  <div>Assets in Archive: <b>{integrityReport.summary.assetCount}</b></div>
                  <div>Subscriptions: <b>{integrityReport.summary.subCount}</b></div>
                  <div>Tickets: <b>{integrityReport.summary.ticketCount}</b></div>
                </div>

                {/* Selective Restore Checkboxes */}
                <div className="pt-2 border-t border-[#A9C7B5]/40 dark:border-indigo-800/60">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Select entities to recover:
                  </span>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <label className="flex items-center space-x-1.5">
                      <input
                        type="checkbox"
                        checked={selectiveOptions.assets}
                        onChange={(e) => setSelectiveOptions({ ...selectiveOptions, assets: e.target.checked })}
                        className="rounded text-[#315F50]"
                      />
                      <span>Hardware Assets</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input
                        type="checkbox"
                        checked={selectiveOptions.subscriptions}
                        onChange={(e) => setSelectiveOptions({ ...selectiveOptions, subscriptions: e.target.checked })}
                        className="rounded text-[#315F50]"
                      />
                      <span>Software Subscriptions</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input
                        type="checkbox"
                        checked={selectiveOptions.tickets}
                        onChange={(e) => setSelectiveOptions({ ...selectiveOptions, tickets: e.target.checked })}
                        className="rounded text-[#315F50]"
                      />
                      <span>Maintenance Tickets</span>
                    </label>
                    <label className="flex items-center space-x-1.5">
                      <input
                        type="checkbox"
                        checked={selectiveOptions.ewaste}
                        onChange={(e) => setSelectiveOptions({ ...selectiveOptions, ewaste: e.target.checked })}
                        className="rounded text-[#315F50]"
                      />
                      <span>E-Waste Certificates</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleExecuteRestore}
                  className="px-4 py-2 rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white font-bold text-xs shadow-md transition-all mt-2"
                >
                  Confirm &amp; Restore Selected Records
                </button>
              </div>
            )}

            {restoreResult && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Restoration complete! Successfully re-hydrated {restoreResult.count} records.</span>
              </div>
            )}
          </div>

          {/* Backup History Log Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Backup history &amp; snapshot logs
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Snapshot ID</th>
                    <th className="py-2.5 px-3">Trigger Type</th>
                    <th className="py-2.5 px-3">File Size</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {(backupLogs || []).map(b => (
                    <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50">
                      <td className="py-3 px-3 font-mono font-bold text-[#315F50]">{b.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{b.type}</td>
                      <td className="py-3 px-3 text-slate-500">{b.sizeKb} KB</td>
                      <td className="py-3 px-3 text-emerald-600 font-bold">{b.status}</td>
                      <td className="py-3 px-3 text-right text-slate-400">{new Date(b.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Global QR Modals */}
      <BatchPrintQrModal
        isOpen={printQrModal}
        onClose={() => setPrintQrModal(false)}
      />

      <QrScannerModal
        isOpen={qrScannerModal}
        onClose={() => setQrScannerModal(false)}
        onSelectAsset={onSelectAsset}
        onReportTicket={onReportIssue}
      />
    </div>
  );
}
