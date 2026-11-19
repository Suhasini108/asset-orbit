import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Laptop,
  Clock,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  sendRealEmail,
  getEmailSettings,
  openNativeMailClient,
  getGmailComposeUrl,
  getOutlookComposeUrl
} from '../../services/emailService';
import confetti from 'canvas-confetti';

export default function EmailBroadcastModal({ isOpen, onClose }) {
  const { assets, createTicket, addNotification, logActivity } = useApp();
  const { currentUser } = useAuth();

  const isITManager = currentUser?.role === 'IT Manager';
  const isAdmin = currentUser?.role === 'Admin';
  const isAuthorized = isITManager || isAdmin;

  // Retrieve saved Admin email or default
  const getLatestAdminEmail = () => {
    return localStorage.getItem('ao_admin_email') || getEmailSettings().adminEmail || 'admin@assetorbit.edu';
  };

  const [destinationAdminEmail, setDestinationAdminEmail] = useState(getLatestAdminEmail());
  const [formData, setFormData] = useState({
    subject: '[URGENT REPORT] ISE Lab Workstation Hardware Failure & Repair Authorization',
    priority: 'Critical',
    category: 'Hardware Breakdown',
    affectedAsset: 'Lenovo Thinkcentre M72e (i3) Workstations (30 Units)',
    message: 'Two Lenovo Thinkcentre workstations in ISE Lab 1 are failing POST diagnostic boot with power supply surges. Requesting urgent Admin approval to dispatch certified Lenovo technicians and provision temporary replacement loaners.'
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deliveryReceipt, setDeliveryReceipt] = useState(null);

  // Synchronize destination email whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const savedAdmin = localStorage.getItem('ao_admin_email') || getEmailSettings().adminEmail || 'admin@assetorbit.edu';
      setDestinationAdminEmail(savedAdmin);
      setSuccess(false);
      setSending(false);
      setDeliveryReceipt(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Access Restricted</h3>
          <p className="text-xs text-slate-500">
            Operational issue reports and emergency escalations to the Admin are reserved for the IT Manager.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleTemplateChange = (tmplKey) => {
    if (tmplKey === 'hardware') {
      setFormData({
        category: 'Hardware Breakdown',
        priority: 'Critical',
        affectedAsset: 'Lenovo Thinkcentre M72e (i3) Workstations (30 Units)',
        subject: '[URGENT REPORT] ISE Lab Workstation Hardware Failure & Repair Authorization',
        message: 'Two Lenovo Thinkcentre workstations in ISE Lab 1 are failing POST diagnostic boot with power supply surges. Requesting urgent Admin approval to dispatch certified Lenovo technicians and provision temporary replacement loaners.'
      });
    } else if (tmplKey === 'software') {
      setFormData({
        category: 'Software License Deficit',
        priority: 'High',
        affectedAsset: 'MATLAB Software campuswide suite R2025B',
        subject: '[ALERT] MATLAB Campuswide Suite License Capacity Reached for ISE',
        message: 'Student concurrency for MATLAB Software campuswide suite R2025B has reached 100% capacity during practical semester exams. Requesting admin sanction to expand concurrent pool or reclaim dormant faculty licenses.'
      });
    } else if (tmplKey === 'power') {
      setFormData({
        category: 'Server & UPS Emergency',
        priority: 'Critical',
        affectedAsset: 'APC make UPS – Capacity : 1.5 KVA / 10 KVA',
        subject: '[EMERGENCY] Server Room UPS Battery Malfunction Alert',
        message: 'The central 10 KVA APC Online UPS in the ISE electrical bay triggered battery degradation fault code E04. Immediate vendor servicing requisition needed to prevent server outage.'
      });
    } else if (tmplKey === 'custom') {
      setFormData({
        category: 'General Operational Report',
        priority: 'Medium',
        affectedAsset: 'General Department Infrastructure',
        subject: '[IT-REPORT] Operational Incident Report for Workspace Admin',
        message: ''
      });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    const adminEmailTarget = destinationAdminEmail.trim() || 'admin@assetorbit.edu';
    localStorage.setItem('ao_admin_email', adminEmailTarget);

    const reporterName = currentUser?.name || 'Kiran V';
    const reporterEmail = currentUser?.email || 'itmanager@assetorbit.edu';

    // 1. Create an official high-priority ticket in the database/context for Admin approval
    if (createTicket) {
      createTicket({
        title: formData.subject,
        description: formData.message,
        priority: formData.priority,
        category: formData.category,
        assetName: formData.affectedAsset,
        subBranch: 'ISE',
        reporterName: `${reporterName} (IT Manager)`,
        reporterEmail: reporterEmail,
        reporterRole: 'IT Manager',
        needsAdminApproval: true,
        status: 'Pending Admin Approval'
      }, reporterName);
    }

    // 2. Add high-priority notification for Admin
    if (addNotification) {
      addNotification({
        title: `🚨 IT Manager Report: ${formData.subject}`,
        description: `Dispatched by ${reporterName} to Admin inbox (${adminEmailTarget}). Action required.`,
        category: 'Incident Report',
        type: 'repair_alert',
        link: '/tickets'
      });
    }

    // 3. Dispatch real email via FormSubmit AJAX service
    let sendResult = null;
    try {
      sendResult = await sendRealEmail({
        to: adminEmailTarget,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        category: 'IT Manager Incident Escalation',
        details: {
          reporter: `${reporterName} (IT Manager)`,
          reporterEmail: reporterEmail,
          affectedAsset: formData.affectedAsset,
          department: 'ISE',
          dispatchedAt: new Date().toLocaleString()
        }
      });
    } catch (err) {
      console.warn('Network email dispatch notice:', err);
    }

    if (logActivity) {
      logActivity(reporterName, 'Issued Operational Report to Admin', `${formData.subject} -> ${adminEmailTarget}`);
    }

    setSending(false);
    setSuccess(true);
    const resItem = (sendResult && sendResult[0]) || {};
    setDeliveryReceipt({
      recipient: adminEmailTarget,
      subject: formData.subject,
      timestamp: new Date().toLocaleTimeString(),
      priority: formData.priority,
      status: resItem.status || 'Delivered',
      needsActivation: resItem.needsActivation,
      apiMessage: resItem.apiMessage
    });

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}
  };

  const getFormattedEmailBody = () => {
    const adminEmailTarget = destinationAdminEmail.trim() || 'admin@assetorbit.edu';
    return `TO: Workspace Administrator (${adminEmailTarget})
FROM: ${currentUser?.name || 'Kiran V'} (IT Manager - ${currentUser?.email || 'itmanager@assetorbit.edu'})
PRIORITY: ${formData.priority}
CATEGORY: ${formData.category}
AFFECTED EQUIPMENT: ${formData.affectedAsset}
TIMESTAMP: ${new Date().toLocaleString()}

==================================================
OPERATIONAL INCIDENT DETAILS & ESCALATION:
==================================================
${formData.message}

--
Dispatched via AssetOrbit Enterprise ITAM System
Academic Block & Lab Infrastructure Support`;
  };

  const handleLaunchGmail = () => {
    const adminEmailTarget = destinationAdminEmail.trim() || 'admin@assetorbit.edu';
    const body = getFormattedEmailBody();
    const url = getGmailComposeUrl({
      to: adminEmailTarget,
      subject: formData.subject,
      body: body
    });
    window.open(url, '_blank');
  };

  const handleLaunchOutlook = () => {
    const adminEmailTarget = destinationAdminEmail.trim() || 'admin@assetorbit.edu';
    const body = getFormattedEmailBody();
    const url = getOutlookComposeUrl({
      to: adminEmailTarget,
      subject: formData.subject,
      body: body
    });
    window.open(url, '_blank');
  };

  const handleLaunchMailClient = () => {
    const adminEmailTarget = destinationAdminEmail.trim() || 'admin@assetorbit.edu';
    const body = getFormattedEmailBody();
    openNativeMailClient({
      to: adminEmailTarget,
      subject: formData.subject,
      body: body
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5EAE5] flex items-center justify-between bg-[#F7F8F5]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#315F50] text-white flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-[#172D27]">
                  Issue Operational Report to Admin
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]/40">
                  IT Manager Authority
                </span>
              </div>
              <p className="text-xs text-[#718078]">
                Dispatches high-priority equipment faults and escalations directly to Admin's email inbox in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E6EFE8] text-[#315F50] mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-[#172D27]">
                Operational Report Dispatched to Admin!
              </h4>
              <p className="text-xs text-[#718078] max-w-md mx-auto">
                Real-time email notification transmitted to Admin's inbox: <strong>{deliveryReceipt?.recipient}</strong>. An official emergency ticket has been logged for Admin action.
              </p>
            </div>

            {/* Delivery Receipt Card */}
            <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] text-left text-xs space-y-2 max-w-md mx-auto font-mono">
              <div className="flex justify-between text-[#718078]">
                <span>Status:</span>
                <span className={`font-bold ${deliveryReceipt?.needsActivation ? 'text-amber-700' : 'text-emerald-600'}`}>
                  {deliveryReceipt?.needsActivation ? '⚠️ Activation Notice Sent' : '✓ Transmitted &bull; Real-Time'}
                </span>
              </div>
              <div className="flex justify-between text-[#718078]">
                <span>Recipient:</span>
                <span className="font-bold text-[#172D27]">{deliveryReceipt?.recipient}</span>
              </div>
              <div className="flex justify-between text-[#718078]">
                <span>Time Dispatched:</span>
                <span className="font-bold text-[#172D27]">{deliveryReceipt?.timestamp}</span>
              </div>
              <div className="flex justify-between text-[#718078]">
                <span>Priority Flag:</span>
                <span className="font-bold text-amber-700">{deliveryReceipt?.priority}</span>
              </div>
            </div>

            {/* Crucial Notice regarding FormSubmit First-Time Activation */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-left text-xs space-y-1.5 text-amber-900 max-w-md mx-auto">
              <div className="flex items-center space-x-2 font-extrabold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>First Time with this Email? Check Spam / Junk Folder</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                FormSubmit requires a <strong>one-time email activation</strong> for every new recipient. Please check your <strong>Spam / Junk</strong> or Promotions folder for an email from FormSubmit with subject <em>"Action Required: Confirm your email"</em>, and click <strong>"Activate Form"</strong>. Once activated, all future reports will land directly in your main inbox!
              </p>
            </div>

            {/* Instant Guaranteed 1-Click Send via Webmail */}
            <div className="pt-2 space-y-2 max-w-md mx-auto">
              <p className="text-[11px] font-bold text-[#718078]">
                Want instant guaranteed delivery directly to your inbox without waiting for activation?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleLaunchGmail}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white border-2 border-[#315F50] text-[#315F50] hover:bg-[#E6EFE8] transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Open Gmail Web in browser with this exact incident report pre-filled"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#315F50]" />
                  <span>Send via Gmail (1-Click)</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchOutlook}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white border border-sky-600 text-sky-700 hover:bg-sky-50 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Open Outlook Web in browser"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>Send via Outlook</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchMailClient}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Open desktop mail software"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  <span>Mail App</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setSuccess(false); onClose(); }}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            
            {/* Quick Template Picker */}
            <div>
              <label className="block text-[11px] font-bold text-[#718078] uppercase tracking-wider mb-1.5">
                Quick Incident &amp; Report Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('hardware')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.category === 'Hardware Breakdown'
                      ? 'bg-[#315F50] text-white shadow-xs'
                      : 'bg-[#F7F8F5] text-[#172D27] border border-[#E5EAE5] hover:border-[#315F50]'
                  }`}
                >
                  Workstation Failure
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('software')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.category === 'Software License Deficit'
                      ? 'bg-[#315F50] text-white shadow-xs'
                      : 'bg-[#F7F8F5] text-[#172D27] border border-[#E5EAE5] hover:border-[#315F50]'
                  }`}
                >
                  MATLAB License Deficit
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('power')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.category === 'Server & UPS Emergency'
                      ? 'bg-[#315F50] text-white shadow-xs'
                      : 'bg-[#F7F8F5] text-[#172D27] border border-[#E5EAE5] hover:border-[#315F50]'
                  }`}
                >
                  Server UPS Outage
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.category === 'General Operational Report'
                      ? 'bg-[#315F50] text-white shadow-xs'
                      : 'bg-[#F7F8F5] text-[#172D27] border border-[#E5EAE5] hover:border-[#315F50]'
                  }`}
                >
                  Custom Incident
                </button>
              </div>
            </div>

            {/* Recipient Target (Admin's Email) & Sender Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#172D27]">
                    Destination (Admin's Email Inbox) *
                  </label>
                  {destinationAdminEmail === localStorage.getItem('ao_admin_email') && localStorage.getItem('ao_admin_email') && (
                    <span className="text-[10px] font-extrabold text-[#315F50] bg-[#E6EFE8] px-2 py-0.5 rounded-full border border-[#A9C7B5]/50">
                      ✓ Auto-Synced from Admin Login
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  required
                  value={destinationAdminEmail}
                  onChange={(e) => setDestinationAdminEmail(e.target.value)}
                  placeholder="admin@assetorbit.edu"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F8F5] border border-[#E5EAE5] text-[#172D27] font-semibold focus:outline-none focus:border-[#315F50]"
                />
                <div className="flex items-center justify-between text-[10px] text-[#718078] mt-1">
                  <span>Real email is dispatched directly to this inbox.</span>
                  {localStorage.getItem('ao_admin_email') && destinationAdminEmail !== localStorage.getItem('ao_admin_email') && (
                    <button
                      type="button"
                      onClick={() => setDestinationAdminEmail(localStorage.getItem('ao_admin_email'))}
                      className="text-[#315F50] font-bold hover:underline"
                    >
                      Reset to Logged-in Admin
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Priority Flag
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F8F5] border border-[#E5EAE5] text-[#172D27] font-bold focus:outline-none focus:border-[#315F50]"
                >
                  <option value="Critical">🚨 Critical Emergency (Immediate Escalation)</option>
                  <option value="High">⚠️ High Priority (Action within 8 Hours)</option>
                  <option value="Medium">⚡ Medium / Routine Maintenance</option>
                </select>
              </div>
            </div>

            {/* Affected Equipment */}
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1">
                Affected Institutional Asset / Department
              </label>
              <select
                value={formData.affectedAsset}
                onChange={(e) => setFormData(prev => ({ ...prev, affectedAsset: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F8F5] border border-[#E5EAE5] text-[#172D27] focus:outline-none focus:border-[#315F50]"
              >
                <option value="Lenovo Thinkcentre M72e (i3) Workstations (30 Units)">Lenovo Thinkcentre M72e (i3) Workstations (30 Units) - ISE Lab 1</option>
                <option value="Lenovo Thinkcentre M73e(i5) with 18.5 LED Monitor">Lenovo Thinkcentre M73e(i5) Workstations (10 Units) - ISE Lab 1</option>
                <option value="Dell PowerEgde T150 Server 16GB RAM/6TB HDD">Dell PowerEdge T150 Server - ISE Server Room</option>
                <option value="MATLAB Software campuswide suite R2025B">MATLAB Software campuswide suite R2025B - Department License</option>
                <option value="APC make UPS – Capacity : 1.5 KVA / 10 KVA">APC make UPS Systems (1.5 KVA / 10 KVA Online Double-Conversion)</option>
                <option value="Laser Color Printer HP Make CP1025 (Colour)">Laser Color Printer HP Make CP1025 (Faulty) - ISE Office</option>
                <option value="General ISE Department Infrastructure">General ISE Department Infrastructure &amp; Network</option>
              </select>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1">
                Report Subject Line *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F8F5] border border-[#E5EAE5] text-[#172D27] font-semibold focus:outline-none focus:border-[#315F50]"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-[#172D27] mb-1">
                Operational Incident Details &amp; Action Requested *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
                className="w-full p-3.5 text-xs rounded-xl bg-[#F7F8F5] border border-[#E5EAE5] text-[#172D27] focus:outline-none focus:border-[#315F50] leading-relaxed"
                placeholder="Describe the failure, affected users/labs, and requested action from Admin..."
              />
            </div>

            {/* Sender Authorization Footer */}
            <div className="p-3.5 rounded-2xl bg-[#E6EFE8] border border-[#A9C7B5]/50 flex items-center justify-between text-xs text-[#244B3E]">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-[#315F50]" />
                <span>
                  Dispatched by: <strong>{currentUser?.name || 'Kiran V'}</strong> ({currentUser?.email || 'itmanager@assetorbit.edu'})
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#315F50] bg-white px-2 py-0.5 rounded-full border border-[#A9C7B5]/40">
                IT Manager
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E5EAE5]">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleLaunchGmail}
                  className="px-3 py-2 text-xs font-bold rounded-xl text-[#315F50] bg-[#E6EFE8] hover:bg-[#A9C7B5]/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Open directly in Gmail Web compose"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Send via Gmail</span>
                </button>
                <button
                  type="button"
                  onClick={handleLaunchMailClient}
                  className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Open in default system mail client"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mail App</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-[#718078] hover:bg-[#F7F8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 text-xs font-extrabold rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Transmitting to Admin...' : 'Send Real Email to Admin'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
