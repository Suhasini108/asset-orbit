import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoleSwitcherBar() {
  const { currentUser, switchRole, logout, PRESET_USERS } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleSignOutToLogin = () => {
    logout();
    navigate('/login');
  };

  // Only the 3 roles: Admin, ITManager or HOD, Employee
  const ALLOWED_ROLES = ['Admin', 'ITManager or HOD', 'Employee'];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-indigo-900/60 shadow-sm transition-colors">
      <div className="flex items-center space-x-2 mr-4">
        <Users className="w-3.5 h-3.5 text-sky-400" />
        <span className="font-bold text-sky-200">Role Switcher:</span>
        <span className="text-slate-400 hidden md:inline text-[11px]">
          (Logged in as: <strong className="text-white">{currentUser.role}</strong>)
        </span>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
        <div className="flex items-center space-x-1.5">
          {ALLOWED_ROLES.map((role) => {
            const isActive = currentUser.role === role;
            return (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center space-x-1 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/50 ring-1 ring-white/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                <span>{role}</span>
              </button>
            );
          })}
        </div>

        {/* Dedicated Sign Out / Go to Login Button */}
        <button
          onClick={handleSignOutToLogin}
          className="ml-2 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center space-x-1 transition-all"
          title="Sign out and return to the Login Page"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
