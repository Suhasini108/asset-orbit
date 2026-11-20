import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Laptop,
  Crown,
  Calendar,
  BarChart3,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  User,
  Heart,
  X,
  CheckCircle2,
  Building2,
  Mail,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import HealthSupportModal from '../common/HealthSupportModal';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { currentUser, logout } = useAuth();
  const { assets, subscriptions, tickets, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [healthSupportOpen, setHealthSupportOpen] = useState(false);

  // Close mobile drawer automatically when navigating to any page
  useEffect(() => {
    onCloseMobile();
  }, [location.pathname]);

  if (!currentUser) return null;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const isEmployee = currentUser.role === 'Employee';
  const isAdmin = currentUser.role === 'Admin';
  const isITManager = currentUser.role === 'IT Manager';

  // Calculate filtered counts & items for Employee
  const empName = (currentUser.name || '').toLowerCase().trim();
  const empEmail = (currentUser.email || '').toLowerCase().trim();
  const empDept = (currentUser.department || '').toLowerCase().trim();

  const assignedAssetsList = (assets || []).filter(a => {
    const aTo = (a.assignedTo || '').toLowerCase().trim();
    const aUser = (a.assignedUser || '').toLowerCase().trim();
    const aEmail = (a.assignedEmail || '').toLowerCase().trim();

    return Boolean(
      (empEmail && aEmail === empEmail) ||
      (empName && (
        aTo === empName ||
        aUser === empName ||
        (aTo && aTo !== 'unassigned' && (aTo.includes(empName) || empName.includes(aTo))) ||
        (aUser && aUser !== 'unassigned' && (aUser.includes(empName) || empName.includes(aUser)))
      ))
    );
  });
  const assignedAssetsCount = assignedAssetsList.length;

  const assignedSubsList = (subscriptions || []).filter(
    s => (empEmail && s.assignedEmail && s.assignedEmail.toLowerCase() === empEmail) ||
         (empName && s.assignedEmployee && s.assignedEmployee.toLowerCase().includes(empName)) ||
         (empName && s.owner && s.owner.toLowerCase().includes(empName)) ||
         (empDept && s.department && s.department.toLowerCase() === empDept) ||
         (s.department && ['all', 'campus-wide', 'engineering'].includes(s.department.toLowerCase()))
  );
  const assignedSubsCount = assignedSubsList.length;

  const myTicketsCount = (tickets || []).filter(
    t => (empName && t.reporterName && t.reporterName.toLowerCase().includes(empName)) ||
         (empEmail && t.reporterEmail && t.reporterEmail.toLowerCase() === empEmail)
  ).length;

  const pendingAdminApprovals = (tickets || []).filter(
    t => t.status === 'Pending Admin Approval'
  ).length;

  // Role-Specific Navigation Menu strictly matching User Prompt 10
  const navItems = isEmployee ? [
    { label: 'My Dashboard', path: '/', icon: Home },
    { label: 'My Assets', path: '/assets', icon: Laptop, badge: assignedAssetsCount },
    { label: 'My Subscriptions', path: '/subscriptions', icon: Crown },
    { label: 'My Requests', path: '/tickets', icon: ShieldCheck, badge: myTicketsCount }
  ] : [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Assets & Equipment', path: '/assets', icon: Laptop, badge: assets.length },
    { label: 'Subscriptions', path: '/subscriptions', icon: Crown, badge: subscriptions.length },
    { label: 'Renewals', path: '/renewals', icon: Calendar },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Smart Tools & SLA', path: '/smart-tools', icon: ShieldCheck, badge: isAdmin && pendingAdminApprovals > 0 ? pendingAdminApprovals : null },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  // Reusable Sidebar Internal Content (Used by both Desktop Sidebar and Mobile Drawer)
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between min-h-0">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#2d5642] flex-shrink-0">
          <div 
            onClick={() => {
              navigate('/');
              if (isMobile) onCloseMobile();
            }}
            className="flex items-center space-x-3 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 rounded-md bg-white transform rotate-45 shadow-sm" />
              <div className="w-5 h-5 rounded-md bg-[#84b89c] transform rotate-45 absolute -top-1 opacity-90" />
              <div className="w-4 h-4 rounded-md bg-[#badcc9] transform rotate-45 absolute -top-2 opacity-80" />
            </div>
            <div className="leading-tight min-w-0">
              <span className="font-extrabold text-sm text-white block tracking-tight truncate">
                Asset &amp; Subscription
              </span>
              <span className="font-bold text-xs text-[#a2d2b8] block truncate">
                Management
              </span>
            </div>
          </div>

          {/* Close Button on Mobile Drawer */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-[#a2d2b8] hover:text-white hover:bg-white/10 transition-colors ml-2 cursor-pointer flex-shrink-0"
              aria-label="Close navigation menu"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items matching Image 2 */}
        <div className="px-3.5 py-6 space-y-1.5 flex-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  if (isMobile) onCloseMobile();
                }}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all group cursor-pointer
                  ${isActive
                    ? 'bg-[#e8f1ec] text-[#234937] font-bold shadow-sm'
                    : 'text-[#d0e5d9] hover:bg-[#2b5742] hover:text-white'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1b382a] text-[#a2d2b8] group-hover:bg-[#1a3528]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Employee Dedicated Menu Items: Notifications & My Profile */}
          {isEmployee && (
            <>
              <button
                type="button"
                onClick={() => {
                  alert(`Notifications (${notifications.length}):\nAll departmental notices and ticket alerts are sent to your official inbox.`);
                  if (isMobile) onCloseMobile();
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#d0e5d9] hover:bg-[#2b5742] hover:text-white transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1b382a] text-[#a2d2b8]">
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(true);
                  if (isMobile) onCloseMobile();
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#d0e5d9] hover:bg-[#2b5742] hover:text-white transition-all cursor-pointer"
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">My Profile</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setHealthSupportOpen(true);
              if (isMobile) onCloseMobile();
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#d0e5d9] hover:bg-[#2b5742] hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Help &amp; Support</span>
          </button>
        </div>
      </div>

      {/* Bottom Promo Artwork matching Image 2 */}
      <div className="p-4 border-t border-[#2d5642] relative overflow-hidden flex-shrink-0">
        {/* Subtle plant leaves illustration */}
        <div className="absolute -bottom-4 -right-4 w-28 h-28 pointer-events-none opacity-20">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-emerald-100">
            <path d="M 20 80 Q 50 20 80 10 Q 70 60 20 80 Z" />
            <path d="M 10 90 Q 20 40 50 30 Q 50 70 10 90 Z" />
          </svg>
        </div>

        <div className="relative z-10 space-y-1">
          <p className="text-xs font-extrabold text-white">
            Stay Organized!
          </p>
          <p className="text-[10px] text-[#a2d2b8] flex items-center space-x-1">
            <span>Track. Manage. Renew.</span>
            <Heart className="w-2.5 h-2.5 text-[#a2d2b8] fill-current" />
          </p>
        </div>

        {/* User Profile Card & Sign Out */}
        <div className="pt-3 mt-3 border-t border-[#2d5642]/60 flex items-center justify-between text-xs">
          <div 
            onClick={() => {
              setProfileModalOpen(true);
              if (isMobile) onCloseMobile();
            }}
            className="flex items-center space-x-2 min-w-0 cursor-pointer hover:opacity-90"
            title="Click to view profile"
          >
            <div className="w-7 h-7 rounded-full bg-[#3b6d54] text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white truncate block max-w-[100px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#a2d2b8] block truncate">
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-[#a2d2b8] hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERSISTENT SIDEBAR: Hidden on mobile (< lg), visible on desktop (lg+) */}
      <aside className="hidden lg:flex w-64 bg-[#234937] text-white h-screen sticky top-0 flex-col justify-between border-r border-[#1a382a] z-30 select-none flex-shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. MOBILE DRAWER OVERLAY BACKDROP: Covers dashboard completely so dashboard is dimmed & not interacting */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 3. MOBILE DRAWER SLIDE-OVER PANEL: Visible on mobile when hamburger is toggled */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#234937] text-white z-50 lg:hidden flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile Navigation Drawer"
      >
        {renderSidebarContent(true)}
      </aside>

      {/* Dedicated My Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5EAE5] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#244B3E] to-[#315F50] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black text-white text-base">
                  {currentUser.avatar || currentUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs text-[#d8eee1]">
                    {currentUser.title || currentUser.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-4 text-xs text-[#172D27]">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5]">
                  <span className="text-[10px] font-bold text-[#718078] block uppercase tracking-wider">
                    Role Authority
                  </span>
                  <span className="text-xs font-black text-[#315F50] mt-0.5 flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{currentUser.role}</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5]">
                  <span className="text-[10px] font-bold text-[#718078] block uppercase tracking-wider">
                    Department
                  </span>
                  <span className="text-xs font-bold text-[#172D27] mt-0.5 block truncate">
                    {currentUser.department || 'Engineering'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-[#718078]">
                  <Mail className="w-3.5 h-3.5 text-[#315F50]" />
                  <span>Official Email:</span>
                  <span className="font-bold text-[#172D27]">{currentUser.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#718078]">
                  <Laptop className="w-3.5 h-3.5 text-[#315F50]" />
                  <span>Assigned Devices:</span>
                  <span className="font-bold text-[#172D27]">{assignedAssetsCount} item{assignedAssetsCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#718078]">
                  <Crown className="w-3.5 h-3.5 text-[#315F50]" />
                  <span>Software Subscriptions:</span>
                  <span className="font-bold text-[#172D27]">{assignedSubsCount} license{assignedSubsCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#718078]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Account Status:</span>
                  <span className="font-bold text-emerald-700">Verified &amp; Active</span>
                </div>
              </div>

              {/* Assigned Hardware Summary List (Visible when items allocated) */}
              {isEmployee && (
                <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#315F50] block">
                    My Allocated Equipment ({assignedAssetsCount})
                  </span>
                  {assignedAssetsCount === 0 ? (
                    <p className="text-[11px] text-[#718078] italic">No physical devices assigned yet.</p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                      {assignedAssetsList.map(a => (
                        <div key={a.id} className="p-2 rounded-xl bg-[#F7F9F6] border border-[#E5EAE5] flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#172D27] leading-tight">{a.name}</p>
                            <p className="text-[10px] text-[#718078] font-mono">{a.id} &bull; {a.labRoom || a.location || 'ISE Lab'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#E6EFE8] text-[#315F50]">
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Software Subscriptions List */}
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#315F50] block pt-1">
                    My Software Subscriptions ({assignedSubsCount})
                  </span>
                  {assignedSubsCount === 0 ? (
                    <p className="text-[11px] text-[#718078] italic">No software licenses allocated yet.</p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                      {assignedSubsList.map(s => (
                        <div key={s.id} className="p-2 rounded-xl bg-[#F7F9F6] border border-[#E5EAE5] flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#172D27] leading-tight">{s.name || s.softwareName}</p>
                            <p className="text-[10px] text-[#718078]">{s.seatType || 'Campus License'} &bull; {s.vendor || 'Institutional'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-[#E5EAE5] flex justify-end">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#244B3E] hover:bg-[#172D27] text-white"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health & Support Interactive Modal */}
      <HealthSupportModal
        isOpen={healthSupportOpen}
        onClose={() => setHealthSupportOpen(false)}
      />
    </>
  );
}
