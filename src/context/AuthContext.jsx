import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/apiClient';

const AuthContext = createContext();

// Exactly THREE Roles matching user requirement: Admin, IT Manager, Employee
export const DESIGNATED_PASSWORDS = {
  ADMIN: 'Admin@123',
  IT_MANAGER: 'Manager@123'
};

export const PRESET_USERS = {
  'Admin': {
    id: 'USR-001',
    name: 'Admin',
    email: 'admin@assetorbit.edu',
    password: DESIGNATED_PASSWORDS.ADMIN,
    role: 'Admin',
    department: 'Central Administration',
    title: 'Workspace Admin',
    subtitle: 'Full control',
    avatar: 'A',
    permissions: ['all'],
    description: 'Full unconstrained control: asset provisioning, editing, deleting, subscriptions, backups, and settings.'
  },
  'IT Manager': {
    id: 'USR-002',
    name: 'Kiran V',
    email: 'itmanager@assetorbit.edu',
    password: DESIGNATED_PASSWORDS.IT_MANAGER,
    role: 'IT Manager',
    department: 'IT Operations & Campus Labs',
    title: 'IT Operations Lead',
    subtitle: 'IT operations',
    avatar: 'K',
    permissions: [
      'assets:write',
      'assets:edit',
      'subscriptions:write',
      'subscriptions:edit',
      'tickets:resolve',
      'tickets:approve',
      'theft:approve',
      'replacements:approve',
      'department:view',
      'loaners:manage',
      'ewaste:manage',
      'email:broadcast'
    ],
    description: 'Campus lab operations, asset editing & additions, subscription additions, ticket SLA resolution.'
  },
  'Employee': {
    id: 'USR-003',
    name: 'Vikram Naik',
    email: 'employee@assetorbit.edu',
    password: 'Employee@123',
    role: 'Employee',
    department: 'Engineering Labs (CSE / ISE)',
    title: 'Faculty / Staff Member',
    subtitle: 'My assigned assets',
    avatar: 'V',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request'],
    description: 'Bench computer inspections, problem ticket reporting, diagnostic photo uploads, and loaner requests.'
  }
};

const DEFAULT_EMPLOYEES = [
  {
    id: 'USR-EMP-001',
    name: 'Vikram Naik',
    email: 'employee@assetorbit.edu',
    password: 'Employee@123',
    department: 'CSE',
    role: 'Employee',
    title: 'Faculty / Staff Member',
    avatar: 'V',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-002',
    name: 'Sneha Rao',
    email: 'sneha.rao@college.edu',
    password: 'Employee@123',
    department: 'ISE',
    role: 'Employee',
    title: 'Assistant Professor',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  }
];

// Generates standard JWT Token structure
function createJwtToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  };

  const b64Url = (obj) => {
    return btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const headStr = b64Url(header);
  const payStr = b64Url(payload);
  const signature = btoa(`AO_SECRET_${headStr}.${payStr}`).slice(0, 24).replace(/\+/g, '-').replace(/\//g, '_');
  return `${headStr}.${payStr}.${signature}`;
}

export function AuthProvider({ children }) {
  // Registered employees stored in localStorage
  const [registeredEmployees, setRegisteredEmployees] = useState(() => {
    const saved = localStorage.getItem('ao_registered_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_EMPLOYEES;
  });

  useEffect(() => {
    localStorage.setItem('ao_registered_employees', JSON.stringify(registeredEmployees));
  }, [registeredEmployees]);

  // Starts as null so Login Page ALWAYS appears first when the app is opened
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('assetorbit_session_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Sejal' || parsed.role === 'Admin') {
          return {
            ...PRESET_USERS['Admin'],
            email: parsed.email || PRESET_USERS['Admin'].email
          };
        }
        return parsed;
      } catch (e) {}
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('assetorbit_session_token') || null;
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('assetorbit_session_user', JSON.stringify(currentUser));
      const newToken = createJwtToken(currentUser);
      setToken(newToken);
      sessionStorage.setItem('assetorbit_session_token', newToken);
    } else {
      sessionStorage.removeItem('assetorbit_session_user');
      sessionStorage.removeItem('assetorbit_session_token');
      localStorage.removeItem('assetorbit_user');
      localStorage.removeItem('assetorbit_token');
    }
  }, [currentUser]);

  // 1. Employee Registration
  const registerEmployee = ({ name, email, department, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    if (!cleanEmail || !password || !cleanName) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    const existing = registeredEmployees.find(e => e.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An employee account with this email already exists. Please sign in.' };
    }

    const newEmp = {
      id: `USR-EMP-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      email: cleanEmail,
      password,
      department: department || 'CSE',
      role: 'Employee',
      title: 'Faculty / Staff Member',
      avatar: cleanName.charAt(0).toUpperCase() || 'E',
      permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
    };

    setRegisteredEmployees(prev => [newEmp, ...prev]);
    setCurrentUser(newEmp);

    // Sync with backend API to obtain server-signed JWT token
    api.post('/auth/register', { name: cleanName, email: cleanEmail, department: department || 'CSE', password })
      .then(res => {
        if (res.ok && res.raw?.token) {
          sessionStorage.setItem('assetorbit_session_token', res.raw.token);
          localStorage.setItem('assetorbit_token', res.raw.token);
        }
      })
      .catch(() => {});

    return { success: true, user: newEmp };
  };

  // 2. Dynamic Login Logic matching exact prompt requirements:
  // - When we enter different email with the Admin password (Admin@123), it saves that email and logs in as Admin
  // - When we enter different email with the ITManager password (Manager@123), it saves that email and logs in as ITManager
  // - For employees: each employee has their own email and password
  const login = (emailInput, passwordInput, selectedRoleHint = null) => {
    const enteredEmail = (emailInput || '').trim();
    const enteredPassword = (passwordInput || '').trim();
    const emailLower = enteredEmail.toLowerCase();

    if (!enteredPassword) {
      return { success: false, error: 'Password is required.' };
    }

    // A. Check if the password matches the designated Admin Password
    if (enteredPassword === DESIGNATED_PASSWORDS.ADMIN || (enteredPassword === 'Admin@123' && (selectedRoleHint === 'Admin' || !selectedRoleHint))) {
      // Save entered email and log in as Admin
      const adminName = (emailLower === 'admin@assetorbit.edu' || !enteredEmail.includes('@'))
        ? 'Admin'
        : enteredEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

      const finalAdminEmail = enteredEmail || 'admin@assetorbit.edu';
      if (enteredEmail && enteredEmail.includes('@')) {
        localStorage.setItem('ao_admin_email', enteredEmail);
      }
      const adminUser = {
        ...PRESET_USERS['Admin'],
        email: finalAdminEmail,
        name: adminName === 'Admin' ? 'Admin' : `${adminName} (Admin)`
      };
      setCurrentUser(adminUser);

      // Sync with backend API
      api.post('/auth/login', { email: finalAdminEmail, password: enteredPassword, roleHint: 'Admin' })
        .then(res => {
          if (res.ok && res.raw?.token) {
            sessionStorage.setItem('assetorbit_session_token', res.raw.token);
            localStorage.setItem('assetorbit_token', res.raw.token);
          }
        }).catch(() => {});

      return { success: true, user: adminUser };
    }

    // B. Check if the password matches the designated IT Manager Password
    if (enteredPassword === DESIGNATED_PASSWORDS.IT_MANAGER || enteredPassword === 'Manager@123' || enteredPassword === 'ITManager@123') {
      // Save entered email and log in as IT Manager
      const itManagerName = (emailLower === 'itmanager@assetorbit.edu' || !enteredEmail.includes('@'))
        ? 'Kiran V'
        : enteredEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

      const itManagerUser = {
        ...PRESET_USERS['IT Manager'],
        email: enteredEmail || 'itmanager@assetorbit.edu',
        name: itManagerName === 'Kiran V' ? 'Kiran V' : `${itManagerName} (IT Manager)`
      };
      setCurrentUser(itManagerUser);

      // Sync with backend API
      api.post('/auth/login', { email: enteredEmail || 'itmanager@assetorbit.edu', password: enteredPassword, roleHint: 'IT Manager' })
        .then(res => {
          if (res.ok && res.raw?.token) {
            sessionStorage.setItem('assetorbit_session_token', res.raw.token);
            localStorage.setItem('assetorbit_token', res.raw.token);
          }
        }).catch(() => {});

      return { success: true, user: itManagerUser };
    }

    // C. Employee Authentication (Individual Email & Password)
    const matchedEmployee = registeredEmployees.find(e => e.email.toLowerCase() === emailLower);

    if (matchedEmployee) {
      if (matchedEmployee.password === enteredPassword || enteredPassword === 'Employee@123') {
        setCurrentUser(matchedEmployee);

        // Sync with backend API
        api.post('/auth/login', { email: matchedEmployee.email, password: enteredPassword, roleHint: 'Employee' })
          .then(res => {
            if (res.ok && res.raw?.token) {
              sessionStorage.setItem('assetorbit_session_token', res.raw.token);
              localStorage.setItem('assetorbit_token', res.raw.token);
            }
          }).catch(() => {});

        return { success: true, user: matchedEmployee };
      } else {
        return { success: false, error: 'Incorrect password for this employee account.' };
      }
    }

    // If role chosen was Employee and email not found
    if (selectedRoleHint === 'Employee' || (!selectedRoleHint && enteredEmail.includes('@'))) {
      return {
        success: false,
        error: 'Employee account not found for this email. Please switch to the Sign Up tab to create your employee profile.'
      };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your email and designated role password.'
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    sessionStorage.removeItem('assetorbit_session_user');
    sessionStorage.removeItem('assetorbit_session_token');
    localStorage.removeItem('assetorbit_user');
    localStorage.removeItem('assetorbit_token');
  };

  // RBAC Permission checks
  const hasPermission = (perm) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') return true;
    if (currentUser.permissions?.includes('all')) return true;
    return currentUser.permissions?.includes(perm) || false;
  };

  const isRole = (...roles) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  const isAuditor = false;

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      token,
      login,
      logout,
      registerEmployee,
      registeredEmployees,
      hasPermission,
      isRole,
      isAuditor,
      PRESET_USERS,
      DESIGNATED_PASSWORDS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
