import React, { useState } from 'react';
import {
  Search,
  Bell,
  Mail,
  ChevronDown,
  LogOut,
  Shield,
  Layers,
  Box,
  CheckCircle2,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onOpenEmailBroadcast, onToggleMobileMenu }) {
  const { currentUser, logout } = useAuth();
  const { notifications } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!currentUser) return null;

  const isManagement = currentUser?.role === 'Admin' || currentUser?.role === 'IT Manager';
  const displayName = currentUser?.role === 'Admin' ? 'Admin' : currentUser.name;
  const displayAvatar = currentUser?.role === 'Admin' ? 'A' : (currentUser.avatar || 'U');

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/assets?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadNotifs = notifications.filter(n => n.unread);

  return (
    <header className="h-18 bg-white border-b border-[#E5EAE5] px-3.5 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      
      {/* 1. LEFT: Hamburger Menu (Mobile) + Mini Brand Logo (Mobile) + Search Bar */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 mr-2 sm:mr-4">
        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded-xl text-[#234937] hover:bg-[#E6EFE8] lg:hidden transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
          aria-label="Toggle navigation menu"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 text-[#234937]" />
        </button>

        {/* Mobile Brand Logo Icon */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-2 lg:hidden cursor-pointer flex-shrink-0 mr-1"
          title="AssetOrbit Home"
        >
          <div className="w-7 h-7 relative flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 rounded-md bg-[#234937] transform rotate-45 shadow-xs" />
            <div className="w-4 h-4 rounded-md bg-[#84b89c] transform rotate-45 absolute -top-0.5 opacity-90" />
            <div className="w-3 h-3 rounded-md bg-[#badcc9] transform rotate-45 absolute -top-1 opacity-80" />
          </div>
          <span className="font-extrabold text-xs text-[#172D27] tracking-tight hidden sm:inline">
            AssetOrbit
          </span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 sm:top-3 text-[#718078]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, subscriptions..."
            className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs rounded-full bg-[#F7F8F5] sm:bg-white border border-[#E5EAE5] text-[#172D27] placeholder-[#718078] focus:outline-none focus:border-[#315F50] focus:ring-2 focus:ring-[#315F50]/15 transition-all shadow-xs"
          />
        </form>
      </div>

      {/* 2. RIGHT ACTIONS (Email Broadcast for Admin/IT Manager + Notification Bell + User Profile) */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        
        {/* Issue Report to Admin Action Button (Exclusive for IT Manager) */}
        {currentUser?.role === 'IT Manager' && (
          <button
            onClick={onOpenEmailBroadcast}
            className="p-2 rounded-full text-[#315F50] hover:bg-[#E6EFE8] transition-colors relative cursor-pointer"
            title="Issue Operational Report to Admin (Real-time Email Dispatch)"
          >
            <Mail className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#315F50] absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>
        )}

        {/* Notification Bell with Red Badge */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-full text-[#718078] hover:text-[#172D27] hover:bg-[#F7F8F5] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#718078]" />
            {unreadNotifs.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Flyout */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5EAE5] p-4 space-y-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5EAE5]">
                <span className="text-xs font-bold text-[#172D27]">Notifications</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#315F50]">
                  {unreadNotifs.length} new
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="p-2 rounded-xl bg-[#F7F8F5] hover:bg-[#E6EFE8]/40 text-xs transition-colors">
                    <p className="font-bold text-[#172D27]">{n.title}</p>
                    <p className="text-[11px] text-[#718078] mt-0.5">{n.description}</p>
                    <span className="text-[9px] text-[#718078] mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 p-1 sm:pr-3 rounded-full hover:bg-[#F7F8F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#315F50] text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
              {displayAvatar}
            </div>
            <span className="text-xs font-bold text-[#172D27] hidden sm:inline">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#718078]" />
          </button>

          {/* User Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5EAE5] p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#E5EAE5]">
                <p className="text-xs font-bold text-[#172D27]">{displayName}</p>
                <p className="text-[10px] text-[#718078]">{currentUser.email}</p>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E6EFE8] text-[#315F50] inline-block mt-1">
                  {currentUser.role}
                </span>
              </div>

              {currentUser?.role === 'IT Manager' && (
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenEmailBroadcast?.();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#315F50] hover:bg-[#E6EFE8]/50 rounded-xl transition-colors font-semibold flex items-center space-x-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Issue Report to Admin</span>
                </button>
              )}

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#172D27] hover:bg-[#F7F8F5] rounded-xl transition-colors"
              >
                Settings &amp; Backup
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
