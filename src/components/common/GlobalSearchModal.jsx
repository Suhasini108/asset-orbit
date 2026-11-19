import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Box, Ticket, Layers, Building2, MonitorCheck, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const { assets, tickets, subscriptions, vendors } = useApp();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingAssets = q ? assets.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q) ||
    a.serialNumber.toLowerCase().includes(q) ||
    (a.subBranch && a.subBranch.toLowerCase().includes(q)) ||
    (a.benchNumber && a.benchNumber.toLowerCase().includes(q)) ||
    (a.labRoom && a.labRoom.toLowerCase().includes(q))
  ).slice(0, 5) : [];

  const matchingTickets = q ? tickets.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.id.toLowerCase().includes(q) ||
    t.priority.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchingSubs = q ? subscriptions.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.vendor.toLowerCase().includes(q) ||
    s.department.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchingVendors = q ? vendors.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.category.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const hasResults = matchingAssets.length > 0 || matchingTickets.length > 0 || matchingSubs.length > 0 || matchingVendors.length > 0;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search input header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, college labs, serials, tickets, subscriptions... (Ctrl+K)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              <p className="font-medium text-sm text-slate-600 dark:text-slate-300 mb-1">Search everything in AssetOrbit</p>
              <p>Try searching for "Dell", "CSE Lab", "MATLAB", "RAM", or a ticket ID</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Assets Section */}
              {matchingAssets.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Box className="w-3.5 h-3.5 mr-1 text-sky-500" />
                    Assets & Systems ({matchingAssets.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingAssets.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => handleSelect('/assets')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-300 text-xs font-bold">
                            {asset.subBranch || 'AST'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600">
                              {asset.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {asset.id} • {asset.serialNumber} • {asset.labRoom || asset.location}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets Section */}
              {matchingTickets.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Ticket className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Helpdesk Tickets ({matchingTickets.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => handleSelect('/tickets')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-amber-500">
                            {ticket.id}: {ticket.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Priority: <span className="font-semibold text-amber-600">{ticket.priority}</span> • Status: {ticket.status}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscriptions Section */}
              {matchingSubs.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1 text-[#315F50]" />
                    Software Subscriptions ({matchingSubs.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingSubs.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelect('/subscriptions')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#315F50]">
                            {sub.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Vendor: {sub.vendor} • ${sub.cost}/yr • {sub.totalSeats} Seats
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#315F50] transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
