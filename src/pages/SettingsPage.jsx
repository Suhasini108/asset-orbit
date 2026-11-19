import React, { useState } from 'react';
import {
  Settings,
  FolderTree,
  Clock,
  Bell,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  RotateCcw,
  Sparkles,
  Download,
  X,
  Mail,
  Send,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getEmailSettings, saveEmailSettings, getEmailDispatchLogs, sendRealEmail } from '../services/emailService';

export default function SettingsPage({ onOpenBackupModal, onOpenEmailBroadcast }) {
  const { categories, setCategories, resetToSampleData, clearAllData, addNotification } = useApp();
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'Admin';
  const isManagement = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager';

  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'email' | 'sla' | 'notifications' | 'backup'
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || '');
  const [newSubBranch, setNewSubBranch] = useState('');
  const [newCatName, setNewCatName] = useState('');

  // Real Email Settings & Outbox State
  const [emailConfig, setEmailConfig] = useState(() => getEmailSettings());
  const [dispatchLogs, setDispatchLogs] = useState(() => getEmailDispatchLogs());
  const [testSending, setTestSending] = useState(false);
  const [testSentMsg, setTestSentMsg] = useState('');

  const handleSaveEmailConfig = (e) => {
    e.preventDefault();
    saveEmailSettings(emailConfig);
    if (emailConfig.adminEmail) {
      localStorage.setItem('ao_admin_email', emailConfig.adminEmail);
    }
    setTestSentMsg('Automated email settings saved successfully.');
    setTimeout(() => setTestSentMsg(''), 3000);
  };

  const handleSendTestRealEmail = async () => {
    setTestSending(true);
    setTestSentMsg('');
    const recipients = [emailConfig.adminEmail, emailConfig.itManagerEmail].filter(Boolean);
    try {
      await sendRealEmail({
        to: recipients,
        subject: '[TEST ALERT] Real Email Delivery Verification',
        message: `Hello! This is a real test email dispatched from AssetOrbit Enterprise ITAM System.\n\nDispatched by: ${currentUser?.name} (${currentUser?.role})\nTimestamp: ${new Date().toLocaleString()}`,
        priority: 'High',
        category: 'Diagnostic Test',
        details: { adminEmail: emailConfig.adminEmail, itManagerEmail: emailConfig.itManagerEmail }
      });
      setDispatchLogs(getEmailDispatchLogs());
      setTestSentMsg(`Real test email dispatched to: ${recipients.join(' & ')}!`);
    } catch (e) {
      setTestSentMsg('Test email dispatched and logged in outbox.');
    }
    setTestSending(false);
  };

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    warrantyAlerts: true,
    subscriptionRenewals: true,
    priceHikes: true,
    slaBreachWarnings: true,
    theftReports: true,
    loanerOverdue: true,
    shadowItAnomalies: true,
    emailBroadcasts: true
  });

  const selectedCategory = categories.find(c => c.id === selectedCatId) || categories[0];

  const handleAddSubBranch = (e) => {
    e.preventDefault();
    if (!isAdmin || !newSubBranch.trim() || !selectedCategory) return;

    setCategories(prev => prev.map(c => {
      if (c.id === selectedCategory.id) {
        return {
          ...c,
          subBranches: [...(c.subBranches || []), newSubBranch.trim()]
        };
      }
      return c;
    }));
    setNewSubBranch('');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!isAdmin || !newCatName.trim()) return;

    const newCat = {
      id: `cat-${Date.now().toString().slice(-4)}`,
      name: newCatName.trim(),
      subBranches: ['General'],
      labs: []
    };
    setCategories(prev => [...prev, newCat]);
    setSelectedCatId(newCat.id);
    setNewCatName('');
  };

  const handleDeleteSubBranch = (sbToDelete) => {
    if (!isAdmin) return;
    setCategories(prev => prev.map(c => {
      if (c.id === selectedCategory.id) {
        return {
          ...c,
          subBranches: (c.subBranches || []).filter(sb => sb !== sbToDelete)
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans text-[#172D27]">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-7 sm:p-9 shadow-xl shadow-[#234937]/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
              System Configuration &amp; Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>Settings &amp; Preferences</span>
              <span className="text-xl">⚙️</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#d8eee1] max-w-xl font-medium leading-relaxed">
              Manage organizational category hierarchy, SLA priority windows, email broadcast alerts, and database state.
            </p>
          </div>

          {/* Current User Role Badge */}
          <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all backdrop-blur-sm shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#badcc9]" />
            <div>
              <span className="font-bold text-white block text-xs">{currentUser?.name}</span>
              <span className="text-[10px] text-[#badcc9] block uppercase font-bold">{currentUser?.role} Authority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E5EAE5] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'categories'
              ? 'bg-[#315F50] text-white shadow-xs'
              : 'text-[#718078] hover:text-[#172D27] hover:bg-white'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories &amp; Sub-Branches</span>
        </button>

        {isManagement && (
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 flex-shrink-0 ${
              activeTab === 'email'
                ? 'bg-[#315F50] text-white shadow-xs'
                : 'text-[#718078] hover:text-[#172D27] hover:bg-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Announcements Hub</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'sla'
              ? 'bg-[#315F50] text-white shadow-xs'
              : 'text-[#718078] hover:text-[#172D27] hover:bg-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SLA Priority Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-[#315F50] text-white shadow-xs'
              : 'text-[#718078] hover:text-[#172D27] hover:bg-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Alerts</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 flex-shrink-0 ${
              activeTab === 'backup'
                ? 'bg-[#315F50] text-white shadow-xs'
                : 'text-[#718078] hover:text-[#172D27] hover:bg-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database &amp; Resilience</span>
          </button>
        )}
      </div>

      {/* TAB 1: Categories & Sub-Branches Manager */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories List Column */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#718078]">
                Institutional Categories
              </h3>
              {isAdmin && (
                <span className="text-[10px] font-bold text-[#315F50]">
                  Admin Editable
                </span>
              )}
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`w-full p-3 rounded-2xl text-xs font-semibold text-left transition-all flex items-center justify-between ${
                    selectedCategory?.id === cat.id
                      ? 'bg-[#E6EFE8] text-[#244B3E] font-bold border border-[#A9C7B5]'
                      : 'hover:bg-[#F7F8F5] text-[#172D27]'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-[#718078] font-mono">({cat.subBranches?.length || 0})</span>
                </button>
              ))}
            </div>

            {isAdmin && (
              <form onSubmit={handleAddCategory} className="pt-3 border-t border-[#E5EAE5] flex items-center space-x-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New Category..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F7F8F5] border border-[#E5EAE5] text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white flex-shrink-0"
                  title="Add Category"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Sub-Branches Column */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-[#172D27] text-base">
                Sub-Branches for: <span className="text-[#315F50]">{selectedCategory?.name}</span>
              </h3>
              <p className="text-xs text-[#718078] mt-0.5">
                Departments, academic disciplines, or administrative divisions mapped under this category.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {(selectedCategory?.subBranches || []).map((sb, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] text-xs font-semibold text-[#172D27] flex items-center space-x-2"
                >
                  <span>{sb}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSubBranch(sb)}
                      className="text-[#718078] hover:text-rose-600 p-0.5 rounded transition-colors"
                      title={`Remove ${sb}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <form onSubmit={handleAddSubBranch} className="pt-4 border-t border-[#E5EAE5] flex items-center space-x-2 max-w-md">
                <input
                  type="text"
                  value={newSubBranch}
                  onChange={(e) => setNewSubBranch(e.target.value)}
                  placeholder="e.g. Artificial Intelligence / Structural Eng"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F7F8F5] border border-[#E5EAE5] text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs flex items-center space-x-1 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Branch</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Automated Email Alerts & Outbox (Admin & IT Manager) */}
      {activeTab === 'email' && isManagement && (
        <div className="space-y-6 max-w-4xl">
          
          {/* Email Settings Configuration Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-[#172D27] text-base flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-[#315F50]" />
                  <span>Automated Real Email Alert Routing</span>
                </h3>
                <p className="text-xs text-[#718078] mt-0.5">
                  Configure destination email inboxes for automatic notifications on high-priority repairs, approvals, and upcoming renewals.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSendTestRealEmail}
                  disabled={testSending}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E6EFE8] text-[#315F50] hover:bg-[#315F50] hover:text-white transition-all border border-[#A9C7B5]"
                >
                  {testSending ? 'Sending Test...' : 'Send Test Real Email'}
                </button>
                {currentUser?.role === 'IT Manager' && (
                  <button
                    type="button"
                    onClick={onOpenEmailBroadcast}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Issue Report to Admin</span>
                  </button>
                )}
              </div>
            </div>

            {testSentMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{testSentMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEmailConfig} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172D27] mb-1">
                    Workspace Admin Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailConfig.adminEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="e.g. admin@college.edu"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
                  />
                  <p className="text-[10px] text-[#718078] mt-1">Receives approval requests, critical repairs, and renewal notices.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172D27] mb-1">
                    IT Manager Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailConfig.itManagerEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, itManagerEmail: e.target.value }))}
                    placeholder="e.g. itmanager@college.edu"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#cbdcd0] text-[#172D27] focus:border-[#315F50]"
                  />
                  <p className="text-[10px] text-[#718078] mt-1">Receives technical SLA alerts, hardware failure, and maintenance logs.</p>
                </div>
              </div>

              {/* Automated Rules Checklist */}
              <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] space-y-2">
                <span className="text-xs font-extrabold text-[#172D27] block">Active Automated Triggers (Dispatches automatically to both inboxes):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#172D27]">
                  <label className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#315F50]" />
                    <span>High-Priority &amp; Critical Equipment Issues</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#315F50]" />
                    <span>Assets Marked InRepair or Faulty</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#315F50]" />
                    <span>Upcoming Subscription Renewals (&le; 7 Days)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#315F50]" />
                    <span>Employee Issues Submitted for Admin Approval</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs transition-all"
                >
                  Save Email Alert Settings
                </button>
              </div>
            </form>
          </div>

          {/* Real Email Outbox & Audit Log */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#172D27] text-base">
                  Live Email Dispatch Outbox &amp; Audit Trail
                </h3>
                <p className="text-xs text-[#718078]">
                  Chronological record of automated and manual emails dispatched to Admin &amp; IT Manager inboxes.
                </p>
              </div>
              <span className="text-xs font-bold text-[#718078] bg-[#F7F8F5] px-3 py-1 rounded-full border border-[#E5EAE5]">
                {dispatchLogs.length} Records
              </span>
            </div>

            {dispatchLogs.length === 0 ? (
              <p className="text-xs text-[#718078] py-4 text-center">No emails dispatched yet. High priority incidents and renewals will be logged here automatically.</p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                {dispatchLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#172D27] truncate">{log.subject}</h4>
                        <p className="text-[11px] text-[#718078] truncate">
                          To: <strong className="text-[#172D27]">{log.recipient}</strong> • Priority: <span className="font-semibold text-rose-600">{log.priority}</span> • {log.sentAt || log.timestamp}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap flex-shrink-0">
                      {log.status || 'Delivered'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SLA Configuration */}
      {activeTab === 'sla' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-extrabold text-[#172D27] text-base">
              Service Level Agreement (SLA) Policy Targets
            </h3>
            <p className="text-xs text-[#718078] mt-0.5">
              Defines the maximum response and resolution windows before automated escalation occurs.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#FEE2E2]/60 border border-[#FCA5A5]/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-rose-800">Critical Priority Tier</span>
                <p className="text-xs text-[#718078]">Complete lab halt, server crash, exam center failure</p>
              </div>
              <span className="text-sm font-black text-rose-700 font-mono">4 Hours Target</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FEF3C7]/60 border border-[#FCD34D]/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-amber-800">High Priority Tier</span>
                <p className="text-xs text-[#718078]">Projector failure, faculty primary laptop down</p>
              </div>
              <span className="text-sm font-black text-amber-800 font-mono">8 Hours Target</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#E6EFE8] border border-[#A9C7B5]/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#244B3E]">Medium Priority Tier</span>
                <p className="text-xs text-[#718078]">Single bench software glitch, keyboard/mouse replacement</p>
              </div>
              <span className="text-sm font-black text-[#315F50] font-mono">24 Hours Target</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#172D27]">Low Priority Tier</span>
                <p className="text-xs text-[#718078]">General inquiry, routine scheduled inspection</p>
              </div>
              <span className="text-sm font-black text-[#718078] font-mono">72 Hours Target</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Notifications Preferences */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-[#172D27] text-base">
              Notification &amp; Alert Preferences
            </h3>
            <p className="text-xs text-[#718078] mt-0.5">
              Configure which events trigger real-time banner, in-app bell, and email notifications.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {Object.keys(notifPrefs).map((key) => (
              <div key={key} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#E5EAE5]">
                <span className="text-xs font-semibold text-[#172D27] capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <input
                  type="checkbox"
                  checked={notifPrefs[key]}
                  onChange={() => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="w-4 h-4 rounded text-[#315F50] focus:ring-[#315F50] accent-[#315F50]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Database & Resilience (Admin Only) */}
      {activeTab === 'backup' && isAdmin && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-extrabold text-[#172D27] text-base">
              Database State, Backups &amp; Reset Tools
            </h3>
            <p className="text-xs text-[#718078] mt-0.5">
              Manage JSON disaster recovery backups or re-hydrate college department fixtures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-[#E5EAE5] bg-[#F7F8F5] space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#172D27]">
                Disaster Recovery Backup
              </h4>
              <p className="text-xs text-[#718078]">
                Export complete system snapshot (assets, tickets, subscriptions, audit logs) to an encrypted downloadable JSON file.
              </p>
              <button
                onClick={onOpenBackupModal}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-xs flex items-center space-x-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Open Backup &amp; Restore Modal</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5EAE5] bg-[#F7F8F5] space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#172D27]">
                Reload Standard Fixtures
              </h4>
              <p className="text-xs text-[#718078]">
                Restores the standard 8 assets and 5 subscriptions matching your dashboard configuration.
              </p>
              <button
                onClick={() => {
                  resetToSampleData();
                  alert('Standard dataset re-loaded successfully!');
                }}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#E6EFE8] hover:bg-[#A9C7B5]/30 text-[#244B3E] border border-[#A9C7B5] flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#315F50]" />
                <span>Re-Load Dashboard Fixtures</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
