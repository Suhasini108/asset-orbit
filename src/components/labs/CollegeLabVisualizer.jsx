import React, { useState } from 'react';
import {
  Monitor,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  QrCode,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function CollegeLabVisualizer({ onSelectAsset, onAddAssetToLab }) {
  const { assets, categories, tickets } = useApp();
  const { isAuditor } = useAuth();

  // Find all college labs from categories
  const engineeringCat = categories.find(c => c.name === 'Engineering');
  const availableLabs = engineeringCat?.labs || [
    { id: 'lab-cse-1', name: 'CSE Lab 1 (Turing Systems & OS)', dept: 'CSE', room: 'Room 301', capacity: 30 },
    { id: 'lab-cse-2', name: 'CSE Lab 2 (Lovelace AI & Cloud)', dept: 'CSE', room: 'Room 302', capacity: 25 },
    { id: 'lab-ise-1', name: 'ISE Lab 1 (Network Security & Cloud)', dept: 'ISE', room: 'Room 204', capacity: 25 },
    { id: 'lab-ece-1', name: 'ECE Lab 1 (DSP & Microprocessors)', dept: 'ECE', room: 'Room 105', capacity: 20 },
    { id: 'lab-ece-2', name: 'ECE Lab 2 (VLSI & Embedded Systems)', dept: 'ECE', room: 'Room 106', capacity: 20 },
    { id: 'lab-mech-1', name: 'Mech Lab 1 (CAD/CAM Workstations)', dept: 'Mechanical', room: 'Room 008', capacity: 15 }
  ];

  const [selectedLabId, setSelectedLabId] = useState('lab-cse-1');
  const [selectedBenchAsset, setSelectedBenchAsset] = useState(null);
  const [filterHealth, setFilterHealth] = useState('all');

  const currentLab = availableLabs.find(l => l.id === selectedLabId) || availableLabs[0];

  // Assets belonging to this lab (or matched by name/room/dept)
  const labAssets = assets.filter(a => {
    if (!a.labRoom) return false;
    const labNamePart = currentLab.name.split('(')[0].trim().toLowerCase();
    const assetLab = a.labRoom.toLowerCase();
    return assetLab.includes(labNamePart) || assetLab.includes(currentLab.dept.toLowerCase());
  });

  // Calculate Lab Metrics
  const totalLabSystems = labAssets.length;
  const healthySystems = labAssets.filter(a => a.status === 'Assigned' && (a.healthScore || 90) >= 80).length;
  const degradedSystems = labAssets.filter(a => (a.healthScore || 90) < 80 && a.status !== 'In Repair').length;
  const inRepairSystems = labAssets.filter(a => a.status === 'In Repair').length;

  const filteredAssets = labAssets.filter(a => {
    if (filterHealth === 'healthy') return (a.healthScore || 90) >= 80 && a.status !== 'In Repair';
    if (filterHealth === 'degraded') return (a.healthScore || 90) < 80 && a.status !== 'In Repair';
    if (filterHealth === 'repair') return a.status === 'In Repair';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Department / Lab Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Department Lab Floorplan
              </span>
              <span className="text-xs text-slate-500">• {currentLab.room}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {currentLab.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time hardware lifecycle, system health telemetry, and lab bench allocation grid.
            </p>
          </div>

          {!isAuditor && onAddAssetToLab && (
            <button
              onClick={() => onAddAssetToLab(currentLab)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Workstations (Quantity Batch)</span>
            </button>
          )}
        </div>

        {/* Lab Selection Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {availableLabs.map(lab => {
            const isSelected = lab.id === selectedLabId;
            return (
              <button
                key={lab.id}
                onClick={() => {
                  setSelectedLabId(lab.id);
                  setSelectedBenchAsset(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-300 dark:ring-sky-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-sky-400'}`} />
                <span>{lab.name.split('(')[0]}</span>
                <span className="text-[10px] opacity-75">({lab.dept})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lab KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Lab Benches</span>
            <Monitor className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {totalLabSystems} <span className="text-xs font-normal text-slate-400">/ {currentLab.capacity} capacity</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Healthy Systems</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {healthySystems}
            <span className="text-xs font-normal text-slate-400 ml-1">
              ({totalLabSystems ? Math.round((healthySystems / totalLabSystems) * 100) : 100}%)
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-500">Degraded / High Temp</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {degradedSystems}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-500">In Repair / Down</span>
            <Wrench className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {inRepairSystems}
          </p>
        </div>
      </div>

      {/* Main Bench Grid Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Interactive Workstation Matrix</span>
              <span className="text-xs font-normal text-slate-400">(Click any computer to inspect)</span>
            </h3>
            <p className="text-xs text-slate-500">Arranged in physical bench layout matching {currentLab.room}</p>
          </div>

          {/* Quick status filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterHealth('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterHealth === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              All ({labAssets.length})
            </button>
            <button
              onClick={() => setFilterHealth('healthy')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterHealth === 'healthy' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
            >
              Healthy
            </button>
            <button
              onClick={() => setFilterHealth('repair')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filterHealth === 'repair' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}
            >
              Repair
            </button>
          </div>
        </div>

        {/* Visual Teacher / Instructor Pod */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/30 border border-sky-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">Front of Classroom</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Instructor Pod & Ceiling Projector Display</p>
              <p className="text-[11px] text-slate-500">Connected to 3600 Lumens HDMI Switch & Faculty Terminal</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            AV Link Operational
          </span>
        </div>

        {/* Student Benches Grid */}
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Monitor className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No computers found in this view</p>
            <p className="text-xs text-slate-400 mt-1">Use the "Add Workstations (Quantity Batch)" button to generate workstations for this lab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredAssets.map((asset) => {
              const isSelected = selectedBenchAsset?.id === asset.id;
              const isRepair = asset.status === 'In Repair';
              const isDegraded = !isRepair && (asset.healthScore || 90) < 80;
              const score = asset.healthScore || 90;

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedBenchAsset(asset)}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-brand-500 border-transparent bg-brand-50/50 dark:bg-brand-950/40 shadow-lg'
                      : isRepair
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
                      : isDegraded
                      ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-sky-300 dark:hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  {/* Top Bar: Bench Tag & Status Pulse */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {asset.benchNumber || asset.id}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${
                        isRepair ? 'bg-rose-500 animate-ping' :
                        isDegraded ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>

                  {/* Icon & Name */}
                  <div className="flex items-center space-x-2 my-1">
                    <div className={`p-1.5 rounded-lg ${
                      isRepair ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' :
                      isDegraded ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                      'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300'
                    }`}>
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {asset.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {asset.serialNumber}
                      </p>
                    </div>
                  </div>

                  {/* Specs Pill */}
                  <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{asset.specs?.cpu?.split('(')[0] || 'Intel Core i7'}</span>
                  </div>

                  {/* Health Score Progress Bar */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">Health</span>
                    <span className={`font-extrabold ${
                      score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                      score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        score >= 80 ? 'bg-emerald-500' :
                        score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Bench Detail Modal / Slide-Over */}
      {selectedBenchAsset && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border-2 border-brand-500/40 relative animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedBenchAsset.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    selectedBenchAsset.status === 'Assigned' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    selectedBenchAsset.status === 'In Repair' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {selectedBenchAsset.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedBenchAsset.id} • Serial: {selectedBenchAsset.serialNumber} • {selectedBenchAsset.benchNumber} ({selectedBenchAsset.labRoom})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectAsset && onSelectAsset(selectedBenchAsset)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950 dark:hover:bg-brand-900 dark:text-brand-300 border border-brand-200 dark:border-brand-800 transition-colors flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Asset Profile</span>
              </button>
              <button
                onClick={() => setSelectedBenchAsset(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>

          {/* Clean Operational Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Bench &amp; Asset Tag</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                {selectedBenchAsset.benchNumber || 'Bench'} • {selectedBenchAsset.id}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Operational Status</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                {selectedBenchAsset.status}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                {selectedBenchAsset.subBranch} • {selectedBenchAsset.labRoom || 'Main Lab'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Health Index</span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {selectedBenchAsset.healthScore || 90}/100 Condition
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
