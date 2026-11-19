import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink, AlertTriangle, ShieldAlert, Layers, ShieldCheck, Ticket } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } = useApp();
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'sla_warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'price_hike': return <Layers className="w-4 h-4 text-rose-500" />;
      case 'shadow_it': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'warranty': return <ShieldCheck className="w-4 h-4 text-[#315F50]" />;
      case 'ticket_created': return <Ticket className="w-4 h-4 text-sky-500" />;
      default: return <Bell className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No active notifications. System running smoothly!
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-3.5 transition-colors flex items-start space-x-3 cursor-pointer ${
                    item.unread
                      ? 'bg-sky-50/60 dark:bg-sky-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold truncate ${item.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    {item.link && (
                      <Link
                        to={item.link}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center space-x-1 text-[11px] text-brand-600 dark:text-brand-400 font-medium mt-1.5 hover:underline"
                      >
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  {item.unread && (
                    <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
