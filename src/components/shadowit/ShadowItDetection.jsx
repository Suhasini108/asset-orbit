import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function ShadowItDetection() {
  const { shadowItLogs, updateShadowItStatus, simulateShadowItFeed } = useApp();
  const { currentUser, isAuditor } = useAuth();
  const [filterRisk, setFilterRisk] = useState('all');
  const [logImported, setLogImported] = useState(false);

  const handleSimulateFeed = () => {
    simulateShadowItFeed(currentUser.name);
    setLogImported(true);
    setTimeout(() => setLogImported(false), 3000);
  };

  const handleAction = (id, newStatus, reason) => {
    if (isAuditor) return;
    updateShadowItStatus(id, newStatus, reason, currentUser.name);
  };

  const filteredLogs = shadowItLogs.filter(log => {
    if (filterRisk === 'all') return true;
    return log.riskLevel.toLowerCase() === filterRisk.toLowerCase();
  });

  const highRiskCount = shadowItLogs.filter(l => l.riskLevel === 'High' && l.status === 'Flagged').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Zero-Trust Shadow IT Defense</span>
              </span>
              <span className="text-xs text-slate-400">• Network &amp; Endpoint Telemetry</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">
              Unapproved SaaS &amp; Unauthorized Executables Sentinel
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Detects unapproved software, unauthorized P2P traffic, personal AI tokens, and shadow cloud drives operating inside campus labs and department subnets.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSimulateFeed}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Live Anomaly Feed</span>
            </button>
          </div>
        </div>

        {/* Threat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Scanned Events</span>
            <p className="text-2xl font-black text-white mt-0.5">{shadowItLogs.length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400">High Risk Active</span>
            <p className="text-2xl font-black text-rose-400 mt-0.5">{highRiskCount}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400">Medium Risk</span>
            <p className="text-2xl font-black text-amber-400 mt-0.5">
              {shadowItLogs.filter(l => l.riskLevel === 'Medium').length}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400">Approved / Sanitized</span>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">
              {shadowItLogs.filter(l => l.status === 'Approved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Threat Table & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Detected Shadow IT Anomalies
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated against approved campus catalogue. Review and take immediate remediation actions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Filter Risk:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk Only</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* List of Detected Tools */}
        <div className="space-y-3">
          {filteredLogs.map((item) => {
            const isHigh = item.riskLevel === 'High';
            const isMed = item.riskLevel === 'Medium';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                  item.status === 'Quarantined'
                    ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : isHigh
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                    isHigh
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                      : isMed
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.appName}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHigh ? 'bg-rose-600 text-white' :
                        isMed ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        Risk Score: {item.riskScore}/100 ({item.riskLevel})
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Endpoint: <span className="font-semibold">{item.detectedOn}</span> • User: {item.user} • {item.department}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">Threat Vector:</span> {item.threatReason}
                    </p>
                    {item.remediationAction && (
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        Remediation: {item.remediationAction}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isAuditor && (
                  <div className="flex items-center space-x-2 self-end lg:self-center">
                    <button
                      onClick={() => handleAction(item.id, 'Approved', 'Validated by IT Admin & added to safe catalogue')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 transition-colors"
                    >
                      Approve Tool
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'Quarantined', 'Firewall ACL applied and process terminated')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                    >
                      Block &amp; Quarantine
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'Under Review', 'Security team investigation opened')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
