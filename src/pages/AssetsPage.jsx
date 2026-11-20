import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Search,
  Plus,
  Download,
  Eye,
  Trash2,
  PackageOpen,
  Wrench,
  Filter,
  X,
  Layers,
  Sparkles,
  RotateCcw,
  Building2,
  UserPlus,
  UserMinus,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../data/templates';
import AssignAssetModal from '../components/assets/AssignAssetModal';
import EditAssetModal from '../components/assets/EditAssetModal';

export default function AssetsPage({ onOpenAddAsset, onSelectAsset, onReportIssue }) {
  const { assets, categories, deleteAsset, updateAsset } = useApp();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = currentUser?.role === 'Admin';
  const isITManager = currentUser?.role === 'IT Manager';
  const isManagement = isAdmin || isITManager;
  const isEmployee = currentUser?.role === 'Employee';

  const [assigningAsset, setAssigningAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);

  // Read URL query parameters
  const queryDept = searchParams.get('dept') || 'all';
  const queryCategory = searchParams.get('category') || 'all';
  const queryStatus = searchParams.get('status') || 'all';
  const queryType = searchParams.get('type') || 'all';
  const queryAll = searchParams.get('all') === 'true';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedDepartment, setSelectedDepartment] = useState(queryDept);
  const [selectedStatus, setSelectedStatus] = useState(queryStatus);
  const [selectedType, setSelectedType] = useState(queryType);

  // Sync state with URL params when they change
  useEffect(() => {
    if (queryAll) {
      setSelectedCategory('all');
      setSelectedDepartment('all');
      setSelectedStatus('all');
      setSelectedType('all');
    } else {
      if (searchParams.has('dept')) setSelectedDepartment(searchParams.get('dept'));
      if (searchParams.has('category')) setSelectedCategory(searchParams.get('category'));
      if (searchParams.has('status')) setSelectedStatus(searchParams.get('status'));
      if (searchParams.has('type')) setSelectedType(searchParams.get('type'));
    }
  }, [searchParams, queryAll]);

  // Available sub-branches based on selected category (excluding Data Science and Cyber Security as requested)
  const availableSubBranches = useMemo(() => {
    if (selectedCategory === 'all') {
      const engCat = categories.find(c => c.name === 'Engineering');
      return (engCat?.subBranches || ['CSE', 'ISE', 'AI&ML', 'ECE', 'EEE', 'Mechanical', 'Civil']).filter(
        sb => sb !== 'Data Science' && sb !== 'Cyber Security'
      );
    }
    const catObj = categories.find(c => c.name === selectedCategory);
    return (catObj?.subBranches || []).filter(
      sb => sb !== 'Data Science' && sb !== 'Cyber Security'
    );
  }, [selectedCategory, categories]);

  // Live count map per department across all assets
  const deptCounts = useMemo(() => {
    const map = {
      'all': assets.length,
      'CSE': 0,
      'ISE': 0,
      'AI&ML': 0,
      'ECE': 0,
      'EEE': 0,
      'Mechanical': 0,
      'Civil': 0,
      'Operations & IT': 0,
      'Administration': 0
    };
    assets.forEach(a => {
      const sub = a.subBranch;
      const cat = a.category;
      if (sub && map[sub] !== undefined) {
        map[sub] += 1;
      } else if (cat === 'Operations & IT') {
        map['Operations & IT'] += 1;
      } else if (cat === 'Administration') {
        map['Administration'] += 1;
      } else if (sub) {
        map[sub] = (map[sub] || 0) + 1;
      } else if (cat) {
        map[cat] = (map[cat] || 0) + 1;
      }
    });
    return map;
  }, [assets]);

  // Filtered Assets list with strict Department, Category and Employee isolation
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // If Employee role: strictly restrict to equipment assigned to this employee
      if (isEmployee) {
        const empName = (currentUser?.name || '').toLowerCase().trim();
        const empEmail = (currentUser?.email || '').toLowerCase().trim();
        const matchesEmployee = Boolean(
          (empName && asset.assignedTo && asset.assignedTo.toLowerCase().includes(empName)) ||
          (empName && asset.assignedUser && asset.assignedUser.toLowerCase().includes(empName)) ||
          (empEmail && asset.assignedEmail && asset.assignedEmail.toLowerCase() === empEmail)
        );

        if (!matchesEmployee) return false;

        // For Employee view: search filter over their assigned devices
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
          (asset.name && asset.name.toLowerCase().includes(q)) ||
          (asset.id && asset.id.toLowerCase().includes(q)) ||
          (asset.serialNumber && asset.serialNumber.toLowerCase().includes(q)) ||
          (asset.labRoom && asset.labRoom.toLowerCase().includes(q)) ||
          (asset.location && asset.location.toLowerCase().includes(q)) ||
          (asset.subBranch && asset.subBranch.toLowerCase().includes(q))
        );
        return matchesSearch;
      }

      // 1. Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (asset.name && asset.name.toLowerCase().includes(q)) ||
        (asset.id && asset.id.toLowerCase().includes(q)) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(q)) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(q)) ||
        (asset.assignedUser && asset.assignedUser.toLowerCase().includes(q)) ||
        (asset.labRoom && asset.labRoom.toLowerCase().includes(q)) ||
        (asset.subBranch && asset.subBranch.toLowerCase().includes(q)) ||
        (asset.category && asset.category.toLowerCase().includes(q))
      );

      // 2. Strict Category match
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;

      // 3. Strict Department / Sub-Branch match
      let matchesDept = true;
      if (selectedDepartment !== 'all') {
        matchesDept = 
          asset.subBranch === selectedDepartment ||
          asset.category === selectedDepartment ||
          (selectedDepartment === 'Operations & IT' && asset.category === 'Operations & IT') ||
          (selectedDepartment === 'Administration' && asset.category === 'Administration');
      }

      // 4. Status match (matches Available, Assigned, InRepair, Faulty, Retired)
      let matchesStatus = true;
      if (selectedStatus !== 'all') {
        const s = selectedStatus.toLowerCase();
        const aStatus = (asset.status || '').toLowerCase();
        if (s === 'available' || s === 'unassigned') {
          matchesStatus = aStatus === 'available' || aStatus === 'unassigned' || !asset.assignedTo || asset.assignedTo === 'Unassigned';
        } else if (s === 'inrepair' || s === 'in repair') {
          matchesStatus = aStatus === 'inrepair' || aStatus === 'in repair';
        } else {
          matchesStatus = aStatus === s;
        }
      }

      // 5. Type match
      const matchesType = selectedType === 'all' || 
        (asset.name || '').toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesCategory && matchesDept && matchesStatus && matchesType;
    });
  }, [assets, searchQuery, selectedCategory, selectedDepartment, selectedStatus, selectedType, isEmployee, currentUser]);

  const handleExportCsv = () => {
    const headers = ['id', 'name', 'serialNumber', 'category', 'subBranch', 'cost', 'status', 'assignedTo', 'purchaseDate'];
    exportToCsv('AssetFlow_Inventory_Export', headers, filteredAssets);
  };

  const handleDelete = (id) => {
    if (!isAdmin) {
      alert('Action Restricted: Only Workspace Admin has authority to delete asset records.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete asset record ${id}?`)) {
      deleteAsset(id, currentUser?.name || 'Workspace Admin');
    }
  };

  const handleUnassign = (asset) => {
    if (!isManagement) return;
    if (window.confirm(`Unassign ${asset.name} from ${asset.assignedTo || 'current employee'} and return to Available Pool?`)) {
      updateAsset(asset.id, {
        status: 'Available',
        assignedTo: '',
        assignedUser: 'Unassigned',
        assignedEmail: '',
        statusChangeNote: `Unassigned and returned to available pool by ${currentUser?.name || 'Administrator'}`
      }, currentUser?.name || 'Administrator');
    }
  };

  const handleSelectDepartment = (deptKey) => {
    setSelectedDepartment(deptKey);
    if (deptKey === 'all') {
      const newParams = {};
      if (selectedCategory !== 'all') newParams.category = selectedCategory;
      if (selectedStatus !== 'all') newParams.status = selectedStatus;
      if (selectedType !== 'all') newParams.type = selectedType;
      setSearchParams(newParams);
    } else {
      setSearchParams({ dept: deptKey });
    }
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setSelectedCategory(newCat);
    setSelectedDepartment('all');
    if (newCat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: newCat });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setSearchParams({ all: 'true' });
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedDepartment !== 'all' || selectedStatus !== 'all' || selectedType !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#234937] via-[#2d5642] to-[#3f7358] text-white p-7 sm:p-9 shadow-xl shadow-[#234937]/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#badcc9] bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-md">
              {isEmployee ? 'Employee Self-Service' : 'Asset Inventory & Governance'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isEmployee ? 'My Assigned Equipment' : 'Asset Inventory'}
            </h1>
            <p className="text-xs sm:text-sm text-[#d8eee1] max-w-xl leading-relaxed">
              {isEmployee
                ? `Official institutional equipment allocated to your profile (${currentUser?.name}). You can report issues directly to Admin for approval.`
                : 'Manage, allocate, and edit equipment across college engineering branches and departments.'}
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all backdrop-blur-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {isManagement && (
              <>
                <button
                  onClick={() => {
                    const candidate = assets.find(a => a.status === 'Available' || a.status === 'Unassigned') || assets[0];
                    if (candidate) setAssigningAsset(candidate);
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#badcc9] hover:bg-[#d8eee1] text-[#172D27] transition-all shadow-md"
                  title="Assign Equipment to Employee"
                >
                  <UserPlus className="w-4 h-4 text-[#172D27]" />
                  <span>Assign to Employee</span>
                </button>
                <button
                  onClick={() => onOpenAddAsset(selectedDepartment !== 'all' ? { dept: selectedDepartment, name: `${selectedDepartment} Lab` } : null)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#234937] transition-all shadow-md"
                >
                  <Plus className="w-4 h-4 text-[#234937]" />
                  <span>Add asset</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. FILTER BAR (Matching Image 3 with Category and Sub-branch separation) */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, serial number, tag, room..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#234937] shadow-sm"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#234937] shadow-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          {/* Department / Sub-Branch Dropdown */}
          <select
            value={selectedDepartment}
            onChange={(e) => handleSelectDepartment(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#234937] shadow-sm"
          >
            <option value="all">All Departments &amp; Branches</option>
            {selectedCategory === 'all' ? (
              <>
                <optgroup label="Engineering Sub-Branches">
                  <option value="CSE">CSE (Computer Science)</option>
                  <option value="ISE">ISE (Information Science)</option>
                  <option value="AI&ML">AI&amp;ML (Artificial Intelligence)</option>
                  <option value="ECE">ECE (Electronics &amp; Comm)</option>
                  <option value="EEE">EEE (Electrical &amp; Electronics)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                </optgroup>
                <optgroup label="Campus Operations &amp; Admin">
                  <option value="Operations & IT">Operations &amp; IT</option>
                  <option value="Administration">Administration</option>
                </optgroup>
              </>
            ) : (
              <optgroup label={`${selectedCategory} Departments`}>
                {availableSubBranches.map(sb => (
                  <option key={sb} value={sb}>{sb}</option>
                ))}
              </optgroup>
            )}
          </select>

          {/* Status Dropdown (Includes Available/Unassigned, Assigned, InRepair, Faulty, Retired) */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              if (e.target.value !== 'all') setSearchParams({ status: e.target.value });
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-xs font-semibold text-[#172D27] focus:outline-none focus:border-[#234937] shadow-2xs"
          >
            <option value="all">All statuses</option>
            <option value="Available">Available (Unassigned)</option>
            <option value="Assigned">Assigned</option>
            <option value="InRepair">InRepair</option>
            <option value="Faulty">Faulty</option>
            <option value="Retired">Retired</option>
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              if (e.target.value !== 'all') setSearchParams({ type: e.target.value });
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0f1424] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#234937] shadow-sm"
          >
            <option value="all">All types</option>
            <option value="laptop">Laptop</option>
            <option value="monitor">Monitor</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="optiplex">Workstation</option>
            <option value="switch">Networking</option>
          </select>

          {/* Refresher Icon to Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-[#718078] hover:text-[#315F50] hover:border-[#315F50] transition-colors shadow-2xs flex-shrink-0 flex items-center space-x-1.5"
            title="Reset all search and dropdown filters"
          >
            <RotateCcw className="w-4 h-4 text-[#315F50]" />
            <span className="text-xs font-bold text-[#172D27] hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 3. BRANCH TOTALS & ALL ASSETS CONTROLS (Only for Admin & IT Manager) */}
      {!isEmployee ? (
        <div className="flex flex-wrap items-center gap-3 pb-1 pt-1">
          {/* All Assets Pill */}
          <button
            onClick={() => handleSelectDepartment('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 flex-shrink-0 ${
              selectedDepartment === 'all' && selectedCategory === 'all'
                ? 'bg-[#315F50] text-white shadow-xs ring-2 ring-[#315F50]/30'
                : 'bg-white text-[#718078] border border-[#E5EAE5] hover:border-[#315F50] hover:text-[#172D27]'
            }`}
            title="Show all registered assets across all departments"
          >
            <span>All Assets</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              selectedDepartment === 'all' && selectedCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-[#F7F8F5] text-[#718078]'
            }`}>
              {assets.length}
            </span>
          </button>

          {/* Dynamic Branch / Category Total Badge when selected from dropdown */}
          {selectedDepartment !== 'all' ? (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#E6EFE8] border border-[#A9C7B5]/60 shadow-2xs">
              <Building2 className="w-4 h-4 text-[#315F50]" />
              <span className="text-xs font-extrabold text-[#172D27]">
                Branch Total: <span className="text-[#315F50] font-black">{filteredAssets.length} Assets</span> for {selectedDepartment}
              </span>
              <span className="text-[11px] text-[#718078] hidden sm:inline">
                (Value: ₹{filteredAssets.reduce((sum, a) => sum + (Number(a.cost) || 0), 0).toLocaleString()})
              </span>
              <button
                onClick={() => handleSelectDepartment('all')}
                className="text-[#718078] hover:text-rose-600 ml-1 p-0.5"
                title="Clear branch filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : selectedCategory !== 'all' ? (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#E6EFE8] border border-[#A9C7B5]/60 shadow-2xs">
              <Layers className="w-4 h-4 text-[#315F50]" />
              <span className="text-xs font-extrabold text-[#172D27]">
                Category Total: <span className="text-[#315F50] font-black">{filteredAssets.length} Assets</span> in {selectedCategory}
              </span>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchParams({}); }}
                className="text-[#718078] hover:text-rose-600 ml-1 p-0.5"
                title="Clear category filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-[#718078] font-medium hidden sm:inline">
              Select a Category or Sub-Branch from the dropdown above to view branch-specific totals.
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-3 pb-1 pt-1">
          <div className="px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] text-white shadow-xs flex items-center space-x-2">
            <span>My Allocated Equipment</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
              {filteredAssets.length}
            </span>
          </div>
          <span className="text-xs text-[#718078]">
            Showing only hardware assigned to your employee account ({currentUser?.name})
          </span>
        </div>
      )}

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-[#718078] font-medium">Active filters:</span>
          {selectedDepartment !== 'all' && (
            <span className="px-2.5 py-1 rounded-xl bg-[#E6EFE8] text-[#315F50] font-bold flex items-center space-x-1 border border-[#A9C7B5]/40 shadow-xs">
              <span>Department: {selectedDepartment}</span>
              <button onClick={() => handleSelectDepartment('all')}>
                <X className="w-3 h-3 ml-1 hover:text-rose-500" />
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="px-2.5 py-1 rounded-xl bg-[#E6EFE8] text-[#315F50] font-bold flex items-center space-x-1 border border-[#A9C7B5]/40 shadow-xs">
              <span>Category: {selectedCategory}</span>
              <button onClick={() => { setSelectedCategory('all'); setSearchParams({}); }}>
                <X className="w-3 h-3 ml-1 hover:text-rose-500" />
              </button>
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center space-x-1 border border-emerald-200 shadow-xs">
              <span>Status: {selectedStatus}</span>
              <button onClick={() => { setSelectedStatus('all'); setSearchParams({}); }}>
                <X className="w-3 h-3 ml-1 hover:text-rose-500" />
              </button>
            </span>
          )}
          {selectedType !== 'all' && (
            <span className="px-2.5 py-1 rounded-xl bg-[#E6EFE8] text-[#315F50] font-bold flex items-center space-x-1 border border-[#A9C7B5]/40 shadow-xs">
              <span>Type: {selectedType}</span>
              <button onClick={() => { setSelectedType('all'); setSearchParams({}); }}>
                <X className="w-3 h-3 ml-1 hover:text-rose-500" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline ml-1"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* 4. MAIN ASSET INVENTORY CONTAINER (Soft Green & Sage Theme) */}
      <div className="bg-white rounded-3xl border border-[#E5EAE5] shadow-xs overflow-hidden">
        
        {/* Table/Container Header */}
        <div className="p-6 border-b border-[#E5EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#172D27] flex items-center space-x-2">
              <span>{isEmployee ? 'My Assigned Equipment' : 'Asset Inventory'}</span>
              {selectedDepartment !== 'all' && !isEmployee && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]/40">
                  {selectedDepartment} Branch
                </span>
              )}
            </h3>
            <p className="text-xs text-[#718078] mt-0.5">
              {isEmployee
                ? `Showing ${filteredAssets.length} device${filteredAssets.length !== 1 ? 's' : ''} assigned directly to your profile (${currentUser?.name})`
                : `Showing ${filteredAssets.length} of ${assets.length} registered assets${selectedDepartment !== 'all' ? ` for ${selectedDepartment}` : ''}`}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#718078] bg-[#F7F8F5] px-3 py-1 rounded-full border border-[#E5EAE5]">
            {filteredAssets.length} records
          </span>
        </div>

        {/* Content Body: Empty State when 0 assets, or clean table when populated */}
        {filteredAssets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E6EFE8] text-[#315F50] flex items-center justify-center shadow-xs">
              <PackageOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#172D27]">
                {selectedDepartment !== 'all'
                  ? `No assets found in ${selectedDepartment}`
                  : 'No assets found'}
              </p>
              <p className="text-xs text-[#718078] mt-1 max-w-sm">
                {selectedDepartment !== 'all'
                  ? `No equipment registered for ${selectedDepartment} yet. When college admin adds assets for this department, they will appear here.`
                  : 'No registered equipment in your inventory yet. You can add new equipment anytime by clicking "+ Add asset".'}
              </p>
            </div>

            {(currentUser.role === 'Admin' || currentUser.role === 'IT Manager') && (
              <button
                onClick={() => onOpenAddAsset(selectedDepartment !== 'all' ? { dept: selectedDepartment, name: `${selectedDepartment} Lab` } : null)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white transition-all shadow-xs flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add asset {selectedDepartment !== 'all' ? `for ${selectedDepartment}` : ''}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] text-[11px] font-bold uppercase tracking-wider text-[#718078] border-b border-[#E5EAE5]">
                <tr>
                  <th className="py-3.5 px-6">Asset Tag / ID</th>
                  <th className="py-3.5 px-4">Model &amp; Category</th>
                  <th className="py-3.5 px-4">Department / Sub-Branch</th>
                  <th className="py-3.5 px-4">Purchase Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE5]">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-[#F7F8F5] transition-colors">
                    {/* Tag / ID */}
                    <td className="py-3.5 px-6 font-mono font-bold text-[#172D27]">
                      {asset.id}
                      <span className="block text-[10px] text-[#718078] font-normal font-sans">
                        SN: {asset.serialNumber}
                      </span>
                    </td>

                    {/* Model & Category */}
                    <td className="py-3.5 px-4 font-semibold text-[#172D27]">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span>{asset.name}</span>
                        {asset.quantity > 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6EFE8] text-[#315F50] border border-[#A9C7B5]/60 whitespace-nowrap">
                            Qty: {asset.quantity}
                          </span>
                        )}
                        {asset.repaired === 'Yes' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Equipment has repair history">
                            Repaired
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-[#718078] font-normal mt-0.5">
                        {asset.category} &bull; {asset.type}
                        {asset.healthNotes ? ` &bull; ${asset.healthNotes}` : (asset.healthStatus ? ` &bull; ${asset.healthStatus}` : '')}
                      </span>
                    </td>

                    {/* Department / Sub-Branch */}
                    <td className="py-3.5 px-4 text-[#172D27]">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6EFE8] text-[#315F50] mr-1.5">
                        {asset.subBranch || asset.category || 'General'}
                      </span>
                      <span className="block text-[10px] text-[#718078] font-normal mt-0.5">
                        {asset.labRoom || asset.benchNumber || 'Unassigned Lab'}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-4 font-bold text-[#172D27]">
                      ₹{asset.cost?.toLocaleString() || '0'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        asset.status === 'Available' || asset.status === 'Unassigned' ? 'bg-emerald-100 text-emerald-800' :
                        asset.status === 'Assigned' ? 'bg-[#E6EFE8] text-[#315F50]' :
                        asset.status === 'InRepair' || asset.status === 'In Repair' ? 'bg-amber-100 text-amber-800' :
                        asset.status === 'Faulty' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {asset.status === 'Available' || asset.status === 'Unassigned' ? 'Available' : asset.status}
                      </span>
                      {asset.status === 'Assigned' && (asset.assignedTo || asset.assignedUser) && (
                        <span className="block text-[10px] text-[#718078] mt-0.5 font-medium truncate max-w-[120px]" title={asset.assignedTo || asset.assignedUser}>
                          👤 {asset.assignedTo || asset.assignedUser}
                        </span>
                      )}
                      {(asset.status === 'Available' || asset.status === 'Unassigned') && !asset.assignedTo && (
                        <span className="block text-[9px] text-emerald-600 font-bold mt-0.5">
                          • Ready to assign
                        </span>
                      )}
                      {asset.status === 'Faulty' && (
                        <span className="block text-[9px] text-rose-600 font-semibold mt-0.5">
                          • Action required
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* View Details */}
                      <button
                        onClick={() => onSelectAsset(asset)}
                        className="p-1.5 rounded-lg text-[#718078] hover:text-[#315F50] hover:bg-[#E6EFE8] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Assign / Reassign to Employee (Admin & IT Manager) */}
                      {isManagement && (
                        <button
                          onClick={() => setAssigningAsset(asset)}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-[#E6EFE8] text-[#315F50] hover:bg-[#315F50] hover:text-white transition-colors inline-flex items-center space-x-1"
                          title={asset.status === 'Assigned' ? `Reassign ${asset.name} to another employee` : `Assign ${asset.name} to an employee`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{asset.status === 'Assigned' ? 'Reassign' : 'Assign'}</span>
                        </button>
                      )}

                      {/* If Assigned: Unassign / Return to Pool (Admin & IT Manager) */}
                      {isManagement && asset.status === 'Assigned' && (asset.assignedTo || asset.assignedUser) && (
                        <button
                          onClick={() => handleUnassign(asset)}
                          className="p-1.5 rounded-lg text-[#718078] hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title={`Unassign from ${asset.assignedTo || asset.assignedUser} & return to pool`}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Asset Authority: Admin and IT Manager */}
                      {isManagement && (
                        <button
                          onClick={() => setEditingAsset(asset)}
                          className="p-1.5 rounded-lg text-[#718078] hover:text-[#315F50] hover:bg-[#E6EFE8] transition-colors"
                          title="Edit Asset (Admin & IT Manager)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Report Issue: ONLY Employee and IT Manager (Admin has supreme authority and directly edits/updates status without reporting to anyone) */}
                      {!isAdmin && (
                        <button
                          onClick={() => onReportIssue(asset)}
                          className="p-1.5 rounded-lg text-[#718078] hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="Report Issue"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Asset: Strictly Admin Only */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1.5 rounded-lg text-[#718078] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Record (Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Asset Modal */}
      {assigningAsset && (
        <AssignAssetModal
          isOpen={!!assigningAsset}
          onClose={() => setAssigningAsset(null)}
          asset={assigningAsset}
        />
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <EditAssetModal
          isOpen={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          asset={editingAsset}
        />
      )}
    </div>
  );
}