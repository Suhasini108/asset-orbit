import React, { useState } from 'react';
import {
  Building2,
  Star,
  Mail,
  Phone,
  FileCheck,
  Plus,
  Search,
  MapPin,
  ExternalLink,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function VendorsPage() {
  const { vendors, setVendors, assets, subscriptions } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware & Workstations',
    contactPerson: '',
    email: '',
    phone: '',
    rating: 4.8,
    slaTerms: '4hr On-site Critical SLA',
    address: 'Bengaluru, Karnataka'
  });

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newVendor = {
      ...formData,
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      activeContracts: 1,
      rating: parseFloat(formData.rating) || 4.5
    };

    setVendors(prev => [...prev, newVendor]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Supplier &amp; OEM Relationship Manager</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Vendor Directory &amp; SLA Performance
          </h1>
          <p className="text-xs text-slate-500">
            Track authorized college hardware OEMs, software publishers, contact persons, and warranty terms.
          </p>
        </div>

        {!isAuditor && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier / Vendor</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor name, category, or representative..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm"
        />
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => {
          const suppliedAssets = assets.filter(a => a.vendor === vendor.name).length;
          const suppliedSubs = subscriptions.filter(s => s.vendor === vendor.name).length;

          return (
            <div
              key={vendor.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {vendor.name}
                    </h3>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold block mt-0.5">
                      {vendor.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{vendor.rating}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">SLA Commitment:</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{vendor.slaTerms}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Supplied Hardware: <strong className="text-slate-800 dark:text-slate-200">{suppliedAssets} Units</strong></span>
                <span>Contracts: <strong className="text-slate-800 dark:text-slate-200">{vendor.activeContracts} Active</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Add Hardware / Software Supplier
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company / OEM Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Cisco Systems India"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-semibold">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
