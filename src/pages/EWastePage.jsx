import React, { useState } from 'react';
import {
  Trash2,
  Leaf,
  ShieldCheck,
  FileText,
  Plus,
  CheckCircle2,
  Download,
  Printer,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function EWastePage() {
  const { eWasteRecords, assets, markAsEWaste } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    batchName: 'Lab Retirement Batch',
    weightKg: 15,
    method: 'Certified E-Waste Recycler (ISO 14001 / R2 Certified)',
    vendorName: 'EcoTech Green Recyclers India',
    wipeMethod: 'NIST SP 800-88 Rev 1 (3-Pass DoD Overwrite & Degaussing)'
  });

  // Calculate environmental impacts
  const totalWeight = eWasteRecords.reduce((sum, r) => sum + (Number(r.totalWeightKg) || 0), 0);
  const totalCo2 = eWasteRecords.reduce((sum, r) => sum + (Number(r.co2OffsetKg) || 0), 0);
  const totalToxic = eWasteRecords.reduce((sum, r) => sum + (Number(r.toxicMetalsDivertedKg) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.assetId) {
      alert('Please select an asset to decommission as e-waste.');
      return;
    }

    markAsEWaste(formData.assetId, formData, currentUser.name);
    setModalOpen(false);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handlePrintCertificate = (record) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Green IT Environmental Impact Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-900/50 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sustainable IT &amp; Circular Economy</span>
              </span>
              <span className="text-xs text-slate-400">• Certified Sanitization &amp; Green Disposal</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">
              Campus E-Waste Management &amp; NIST 800-88 Compliance
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Track decommissioned computers, projectors and networking gear. Ensure complete data sanitization before certified recycling to prevent hazardous environmental landfill dumping.
            </p>
          </div>

          {!isAuditor && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Mark Asset as E-Waste</span>
            </button>
          )}
        </div>

        {/* Environmental KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Recycled Batches</span>
            <p className="text-2xl font-black text-white mt-0.5">{eWasteRecords.length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400">E-Waste Weight Diverted</span>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">
              {totalWeight.toLocaleString()} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-300">Est. Carbon Offset</span>
            <p className="text-2xl font-black text-teal-300 mt-0.5">
              {totalCo2.toLocaleString()} <span className="text-xs font-normal">kg CO₂e</span>
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-300">Toxic Lead/Mercury Diverted</span>
            <p className="text-2xl font-black text-amber-300 mt-0.5">
              {totalToxic.toFixed(1)} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* Disposal Certificates List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              E-Waste Disposal Logs &amp; Sanitization Certificates
            </h3>
            <p className="text-xs text-slate-500">
              Verified certificates issued by certified recyclers meeting State Pollution Control Board standards.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {eWasteRecords.map((record) => (
            <div
              key={record.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {record.batchName}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {record.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Recycler: <span className="font-semibold text-slate-800 dark:text-slate-200">{record.vendorName}</span> • Date: {record.disposalDate}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-800 dark:text-slate-200">
                      Cert #: {record.certificateNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Method: {record.disposalMethod.split('(')[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      Wipe: {record.dataWipeMethod.split('(')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end md:self-center">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight &amp; Offset</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {record.totalWeightKg} kg ({record.co2OffsetKg}kg CO₂e)
                  </span>
                </div>

                <button
                  onClick={() => handlePrintCertificate(record)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-white shadow-sm flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mark E-Waste Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Decommission Asset as E-Waste
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Asset to Decommission *
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Equipment --</option>
                  {assets.filter(a => a.status !== 'E-Waste').map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id}: {a.name} ({a.subBranch} • SN: {a.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Disposal Batch Name
                </label>
                <input
                  type="text"
                  value={formData.batchName}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData(prev => ({ ...prev, weightKg: parseFloat(e.target.value) || 10 }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Disposal Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Certified Recycler (R2 / ISO 14001)">Certified Recycler (R2 / ISO 14001)</option>
                    <option value="Donation to Rural School">Donation to Rural School</option>
                    <option value="Component Salvage / Harvesting">Component Salvage / Harvesting</option>
                    <option value="Scrap Metal Auction">Scrap Metal Auction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Data Wiping &amp; Sanitization Standard
                </label>
                <select
                  value={formData.wipeMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, wipeMethod: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="NIST SP 800-88 Rev 1 (3-Pass DoD Overwrite & Degaussing)">
                    NIST SP 800-88 Rev 1 (3-Pass DoD Overwrite &amp; Degaussing)
                  </option>
                  <option value="Physical Drive Shredding (Micro-Shredded &lt; 2mm)">
                    Physical Drive Shredding (Micro-Shredded &lt; 2mm)
                  </option>
                  <option value="Cryptographic Erase (Self-Encrypting Drive Purge)">
                    Cryptographic Erase (Self-Encrypting Drive Purge)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Certify &amp; Mark E-Waste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
