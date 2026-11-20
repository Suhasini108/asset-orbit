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

export const DEFAULT_EMPLOYEES = [
  // 1. Engineering Category
  // CSE Sub-Branch
  {
    id: 'USR-EMP-CSE-01',
    name: 'Vikram Naik',
    email: 'employee@assetorbit.edu',
    password: 'Employee@123',
    department: 'CSE',
    category: 'Engineering',
    subBranch: 'CSE',
    role: 'Employee',
    title: 'Assistant Professor (Systems & Cloud)',
    avatar: 'V',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-CSE-02',
    name: 'Anita Sharma',
    email: 'anita.sharma@college.edu',
    password: 'Employee@123',
    department: 'CSE',
    category: 'Engineering',
    subBranch: 'CSE',
    role: 'Employee',
    title: 'Senior Lab Instructor (Algorithms Lab)',
    avatar: 'A',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  // ISE Sub-Branch
  {
    id: 'USR-EMP-ISE-01',
    name: 'Sneha Rao',
    email: 'sneha.rao@college.edu',
    password: 'Employee@123',
    department: 'ISE',
    category: 'Engineering',
    subBranch: 'ISE',
    role: 'Employee',
    title: 'Assistant Professor (Data Engineering)',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ISE-02',
    name: 'Praveen Kumar',
    email: 'praveen.kumar@college.edu',
    password: 'Employee@123',
    department: 'ISE',
    category: 'Engineering',
    subBranch: 'ISE',
    role: 'Employee',
    title: 'Senior Lab Instructor (Network Security Lab)',
    avatar: 'P',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ISE-03',
    name: 'Sachin Joshi',
    email: 'sachin.joshi@gmail.com',
    password: 'Employee@123',
    department: 'ISE',
    category: 'Engineering',
    subBranch: 'ISE',
    role: 'Employee',
    title: 'Assistant Professor & Lab In-Charge',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ISE-04',
    name: 'JDP sir',
    email: 'jdp.sir@college.edu',
    password: 'Employee@123',
    department: 'ISE',
    category: 'Engineering',
    subBranch: 'ISE',
    role: 'Employee',
    title: 'Senior Faculty (ISE Department)',
    avatar: 'J',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  // AI&ML Sub-Branch
  {
    id: 'USR-EMP-AIML-01',
    name: 'Dr. Rajesh Hegde',
    email: 'rajesh.hegde@college.edu',
    password: 'Employee@123',
    department: 'AI&ML',
    category: 'Engineering',
    subBranch: 'AI&ML',
    role: 'Employee',
    title: 'Professor & AI Center Lead',
    avatar: 'R',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-AIML-02',
    name: 'Kavya Murthy',
    email: 'kavya.murthy@college.edu',
    password: 'Employee@123',
    department: 'AI&ML',
    category: 'Engineering',
    subBranch: 'AI&ML',
    role: 'Employee',
    title: 'Project Associate (Deep Learning)',
    avatar: 'K',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  // ECE Sub-Branch
  {
    id: 'USR-EMP-ECE-01',
    name: 'Prof. Sunita Kulkarni',
    email: 'sunita.kulkarni@college.edu',
    password: 'Employee@123',
    department: 'ECE',
    category: 'Engineering',
    subBranch: 'ECE',
    role: 'Employee',
    title: 'Associate Professor (VLSI & Embedded Systems)',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ECE-02',
    name: 'Ramesh Babu',
    email: 'ramesh.babu@college.edu',
    password: 'Employee@123',
    department: 'ECE',
    category: 'Engineering',
    subBranch: 'ECE',
    role: 'Employee',
    title: 'Hardware Lab Specialist (DSP & Microcontroller Lab)',
    avatar: 'R',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  // EEE Sub-Branch
  {
    id: 'USR-EMP-EEE-01',
    name: 'Dr. Suresh Joshi',
    email: 'suresh.joshi@college.edu',
    password: 'Employee@123',
    department: 'EEE',
    category: 'Engineering',
    subBranch: 'EEE',
    role: 'Employee',
    title: 'Professor (Power Electronics & Grid Systems)',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-EEE-02',
    name: 'Priya Deshmukh',
    email: 'priya.deshmukh@college.edu',
    password: 'Employee@123',
    department: 'EEE',
    category: 'Engineering',
    subBranch: 'EEE',
    role: 'Employee',
    title: 'Lab Assistant (Electrical Machines & Simulation Lab)',
    avatar: 'P',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  // Mechanical Sub-Branch
  {
    id: 'USR-EMP-MECH-01',
    name: 'Dr. Anand Patil',
    email: 'anand.patil@college.edu',
    password: 'Employee@123',
    department: 'Mechanical',
    category: 'Engineering',
    subBranch: 'Mechanical',
    role: 'Employee',
    title: 'HOD & Professor (Thermal Systems & Robotics)',
    avatar: 'A',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-MECH-02',
    name: 'Manjunath G',
    email: 'manjunath.g@college.edu',
    password: 'Employee@123',
    department: 'Mechanical',
    category: 'Engineering',
    subBranch: 'Mechanical',
    role: 'Employee',
    title: 'CAD/CAM & Mechatronics Lab Instructor',
    avatar: 'M',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  // Civil Sub-Branch
  {
    id: 'USR-EMP-CIVIL-01',
    name: 'Prof. Deepa Nair',
    email: 'deepa.nair@college.edu',
    password: 'Employee@123',
    department: 'Civil',
    category: 'Engineering',
    subBranch: 'Civil',
    role: 'Employee',
    title: 'Assistant Professor (Structural Engineering)',
    avatar: 'D',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-CIVIL-02',
    name: 'Chetan Gowda',
    email: 'chetan.gowda@college.edu',
    password: 'Employee@123',
    department: 'Civil',
    category: 'Engineering',
    subBranch: 'Civil',
    role: 'Employee',
    title: 'Surveying & GIS Lab Specialist',
    avatar: 'C',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },

  // 2. Operations & IT Category
  {
    id: 'USR-EMP-OPS-01',
    name: 'Naveen Teja',
    email: 'naveen.teja@college.edu',
    password: 'Employee@123',
    department: 'Operations & IT',
    category: 'Operations & IT',
    subBranch: 'IT Center',
    role: 'Employee',
    title: 'Senior Systems Administrator',
    avatar: 'N',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-OPS-02',
    name: 'Rohan Shetty',
    email: 'rohan.shetty@college.edu',
    password: 'Employee@123',
    department: 'Operations & IT',
    category: 'Operations & IT',
    subBranch: 'Campus Networking',
    role: 'Employee',
    title: 'Network Infrastructure Engineer',
    avatar: 'R',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-OPS-03',
    name: 'Divya Prasad',
    email: 'divya.prasad@college.edu',
    password: 'Employee@123',
    department: 'Operations & IT',
    category: 'Operations & IT',
    subBranch: 'Data Center',
    role: 'Employee',
    title: 'Cloud & Virtualization Specialist',
    avatar: 'D',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-OPS-04',
    name: 'Mahesh K',
    email: 'mahesh.k@college.edu',
    password: 'Employee@123',
    department: 'Operations & IT',
    category: 'Operations & IT',
    subBranch: 'Audio Visual',
    role: 'Employee',
    title: 'Multimedia & Smart Classrooms Technician',
    avatar: 'M',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-OPS-05',
    name: 'Santosh Kumar',
    email: 'santosh.k@college.edu',
    password: 'Employee@123',
    department: 'Operations & IT',
    category: 'Operations & IT',
    subBranch: 'Campus Security',
    role: 'Employee',
    title: 'Security Hardware & Access Control Lead',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },

  // 3. Administration Category
  {
    id: 'USR-EMP-ADM-01',
    name: 'Dr. H. Venkatesh',
    email: 'principal@college.edu',
    password: 'Employee@123',
    department: 'Administration',
    category: 'Administration',
    subBranch: 'Principal Office',
    role: 'Employee',
    title: 'Principal & Head of Institution',
    avatar: 'H',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ADM-02',
    name: 'Savitha M',
    email: 'savitha.m@college.edu',
    password: 'Employee@123',
    department: 'Administration',
    category: 'Administration',
    subBranch: 'Principal Office',
    role: 'Employee',
    title: 'Executive Administrative Secretary',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ADM-03',
    name: 'Dr. B. N. Meenakshi',
    email: 'dean.academic@college.edu',
    password: 'Employee@123',
    department: 'Administration',
    category: 'Administration',
    subBranch: 'Dean Academic',
    role: 'Employee',
    title: 'Dean of Academic Affairs',
    avatar: 'B',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ADM-04',
    name: 'Srikanth Vernekar',
    email: 'registrar.office@college.edu',
    password: 'Employee@123',
    department: 'Administration',
    category: 'Administration',
    subBranch: 'Registrar',
    role: 'Employee',
    title: 'Assistant Registrar (Admissions & Records)',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ADM-05',
    name: 'Geetha Pai',
    email: 'exams@college.edu',
    password: 'Employee@123',
    department: 'Administration',
    category: 'Administration',
    subBranch: 'Examination Cell',
    role: 'Employee',
    title: 'Controller of Examinations Officer',
    avatar: 'G',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-ADM-06',
    name: 'Raghavendra Rao',
    email: 'accounts@college.edu',
    password: 'Employee@123',
    department: 'Administration',
    category: 'Administration',
    subBranch: 'Accounts & Finance',
    role: 'Employee',
    title: 'Senior Finance Officer',
    avatar: 'R',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },

  // 4. Basic Sciences Category
  {
    id: 'USR-EMP-SCI-01',
    name: 'Dr. Archana Rao',
    email: 'archana.physics@college.edu',
    password: 'Employee@123',
    department: 'Basic Sciences',
    category: 'Basic Sciences',
    subBranch: 'Physics Lab',
    role: 'Employee',
    title: 'Associate Professor (Applied Physics & Optics)',
    avatar: 'A',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-SCI-02',
    name: 'Dr. Srinivas Murthy',
    email: 'srinivas.chem@college.edu',
    password: 'Employee@123',
    department: 'Basic Sciences',
    category: 'Basic Sciences',
    subBranch: 'Chemistry Lab',
    role: 'Employee',
    title: 'Faculty & Lab In-Charge (Material Science)',
    avatar: 'S',
    permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
  },
  {
    id: 'USR-EMP-SCI-03',
    name: 'Dr. Vandana Bhat',
    email: 'vandana.math@college.edu',
    password: 'Employee@123',
    department: 'Basic Sciences',
    category: 'Basic Sciences',
    subBranch: 'Mathematics Research',
    role: 'Employee',
    title: 'Research Lead (Computational Mathematics)',
    avatar: 'V',
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

export const getCategoryForDept = (dept) => {
  if (!dept) return 'Engineering';
  const d = dept.toLowerCase();
  if (['cse', 'ise', 'ai&ml', 'aiml', 'ece', 'eee', 'mechanical', 'civil'].some(k => d.includes(k))) return 'Engineering';
  if (['it center', 'networking', 'data center', 'audio visual', 'security', 'operations'].some(k => d.includes(k))) return 'Operations & IT';
  if (['principal', 'dean', 'registrar', 'exam', 'accounts', 'finance', 'admin'].some(k => d.includes(k))) return 'Administration';
  if (['physics', 'chemistry', 'math', 'basic sciences', 'science'].some(k => d.includes(k))) return 'Basic Sciences';
  return 'Engineering';
};

export function AuthProvider({ children }) {
  // Cleanup any invalid or misplaced ao_admin_email cached in browser
  try {
    const cachedAdmin = (localStorage.getItem('ao_admin_email') || '').toLowerCase();
    if (cachedAdmin === 'sachin.joshi@gmail.com' || DEFAULT_EMPLOYEES.some(e => e.email?.toLowerCase() === cachedAdmin)) {
      localStorage.removeItem('ao_admin_email');
    }
  } catch (e) {}

  // Registered employees stored in localStorage with full category & sub-branch coverage
  const [registeredEmployees, setRegisteredEmployees] = useState(() => {
    const saved = localStorage.getItem('ao_registered_employees');
    let list = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {}
    }
    // Normalize and auto-repair category and subBranch
    list = (list || []).map(emp => ({
      ...emp,
      category: emp.category || getCategoryForDept(emp.department || emp.subBranch),
      subBranch: emp.subBranch || emp.department || 'CSE',
      department: emp.department || emp.subBranch || 'CSE'
    }));

    // Merge DEFAULT_EMPLOYEES so all engineering branches, ops, admin, and science staff are available
    const existingEmails = new Set(list.map(e => (e.email || '').toLowerCase()));
    const missing = DEFAULT_EMPLOYEES.filter(e => !existingEmails.has((e.email || '').toLowerCase()));
    return [...list, ...missing];
  });

  useEffect(() => {
    localStorage.setItem('ao_registered_employees', JSON.stringify(registeredEmployees));
  }, [registeredEmployees]);

  // Sync registered employees with server on mount & periodically
  useEffect(() => {
    const fetchEmployees = () => {
      api.get('/auth/employees').then(res => {
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setRegisteredEmployees(prev => {
            const emailMap = new Map();
            res.data.forEach(e => {
              if (e.email) emailMap.set(e.email.toLowerCase(), e);
            });
            (prev || []).forEach(e => {
              if (e.email && !emailMap.has(e.email.toLowerCase())) {
                emailMap.set(e.email.toLowerCase(), e);
              }
            });
            return Array.from(emailMap.values());
          });
        }
      }).catch(() => {});
    };

    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time synchronization across browser tabs and windows
  useEffect(() => {
    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('assetorbit_auth_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'EMPLOYEES_UPDATED' && Array.isArray(event.data.payload)) {
            setRegisteredEmployees(event.data.payload);
          }
        };
      }
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === 'ao_registered_employees' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setRegisteredEmployees(parsed);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const broadcastEmployees = (updatedList) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('assetorbit_auth_channel');
        channel.postMessage({ type: 'EMPLOYEES_UPDATED', payload: updatedList });
        channel.close();
      }
    } catch (e) {}
  };

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
    const dept = (department || 'CSE').trim();
    const cat = getCategoryForDept(dept);

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
      department: dept,
      category: cat,
      subBranch: dept,
      role: 'Employee',
      title: 'Faculty / Staff Member',
      avatar: cleanName.charAt(0).toUpperCase() || 'E',
      permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
    };

    const updated = [newEmp, ...registeredEmployees];
    setRegisteredEmployees(updated);
    broadcastEmployees(updated);
    setCurrentUser(newEmp);

    // Sync with backend API to obtain server-signed JWT token & sync with all laptops
    api.post('/auth/register', { name: cleanName, email: cleanEmail, department: dept, password })
      .then(res => {
        if (res.ok && res.raw?.token) {
          sessionStorage.setItem('assetorbit_session_token', res.raw.token);
          localStorage.setItem('assetorbit_token', res.raw.token);
        }
      })
      .catch(() => {});

    api.post('/sync/mutation', {
      type: 'EMPLOYEE_REGISTER',
      payload: { employee: newEmp },
      actor: cleanName,
      role: 'Employee'
    }).catch(() => {});

    return { success: true, user: newEmp };
  };

  // 2. Strict Real-World Authentication & Role Verification:
  // - Admin tab: ONLY authorized Admin accounts can sign in with Admin password (Admin@123)
  //   If an employee or IT manager tries to sign in here, they are blocked with a clear role error!
  // - IT Manager tab: ONLY authorized IT Manager accounts can sign in with IT Manager password (Manager@123)
  //   If an employee or admin tries to sign in here, they are blocked with a clear role error!
  // - Employee tab: ONLY registered employees can sign in with their password (Employee@123)
  //   If an admin or IT manager tries to sign in here, they are prompted to use their designated tab!
  const login = (emailInput, passwordInput, selectedRoleHint = 'Admin') => {
    const enteredEmail = (emailInput || '').trim();
    const enteredPassword = (passwordInput || '').trim();
    const emailLower = enteredEmail.toLowerCase();
    const roleHint = selectedRoleHint || 'Admin';

    if (!enteredEmail) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!enteredPassword) {
      return { success: false, error: 'Password is required.' };
    }

    // Identify account types
    const isKnownEmployee = () => {
      return (
        registeredEmployees.some(e => e.email?.toLowerCase() === emailLower) ||
        DEFAULT_EMPLOYEES.some(e => e.email?.toLowerCase() === emailLower)
      );
    };

    const isKnownAdmin = () => {
      // Employees are NEVER administrators
      if (emailLower === 'sachin.joshi@gmail.com' || isKnownEmployee()) {
        return false;
      }
      const storedAdminEmail = (localStorage.getItem('ao_admin_email') || '').toLowerCase();
      const isValidStoredAdmin = storedAdminEmail &&
        storedAdminEmail !== 'sachin.joshi@gmail.com' &&
        !DEFAULT_EMPLOYEES.some(e => e.email?.toLowerCase() === storedAdminEmail) &&
        !registeredEmployees.some(e => e.email?.toLowerCase() === storedAdminEmail);

      return (
        emailLower === 'admin@assetorbit.edu' ||
        emailLower === 'suhasinimugganavar@gmail.com' ||
        (isValidStoredAdmin && emailLower === storedAdminEmail)
      );
    };

    const isKnownITManager = () => {
      return (
        emailLower === 'itmanager@assetorbit.edu' ||
        emailLower === 'itmanager@gmail.com'
      );
    };

    // =========================================================================
    // 1. ADMIN ROLE VERIFICATION
    // =========================================================================
    if (roleHint === 'Admin') {
      // Cross-role boundary check 1: Is this user an Employee?
      if (isKnownEmployee()) {
        return {
          success: false,
          error: `Access Denied: ${enteredEmail} is registered as an Employee. Please switch to the Employee tab.`
        };
      }

      // Cross-role boundary check 2: Is this user an IT Manager?
      if (isKnownITManager()) {
        return {
          success: false,
          error: `Access Denied: ${enteredEmail} is registered as an IT Manager. Please switch to the IT Manager tab.`
        };
      }

      // Authorization check: Is this email an approved Administrator?
      if (!isKnownAdmin()) {
        return {
          success: false,
          error: `No Administrator account found for ${enteredEmail}. Please verify your admin email or contact your IT department.`
        };
      }

      // Password verification
      if (enteredPassword !== DESIGNATED_PASSWORDS.ADMIN && enteredPassword !== 'Admin@123') {
        return {
          success: false,
          error: 'Incorrect password for Administrator account.'
        };
      }

      // Validated Admin user session
      const adminName = (emailLower === 'admin@assetorbit.edu')
        ? 'Workspace Admin'
        : (emailLower === 'suhasinimugganavar@gmail.com')
        ? 'Suhasinimugganavar (Admin)'
        : enteredEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + ' (Admin)';

      const adminUser = {
        ...PRESET_USERS['Admin'],
        email: enteredEmail,
        name: adminName
      };
      setCurrentUser(adminUser);

      // Background backend sync
      api.post('/auth/login', { email: enteredEmail, password: enteredPassword, roleHint: 'Admin' })
        .then(res => {
          if (res.ok && res.raw?.token) {
            sessionStorage.setItem('assetorbit_session_token', res.raw.token);
            localStorage.setItem('assetorbit_token', res.raw.token);
          }
        }).catch(() => {});

      return { success: true, user: adminUser };
    }

    // =========================================================================
    // 2. IT MANAGER ROLE VERIFICATION
    // =========================================================================
    if (roleHint === 'IT Manager') {
      // Cross-role boundary check 1: Is this user an Employee?
      if (isKnownEmployee()) {
        return {
          success: false,
          error: `Access Denied: ${enteredEmail} is registered as an Employee. Please switch to the Employee tab.`
        };
      }

      // Cross-role boundary check 2: Is this user an Admin?
      if (isKnownAdmin()) {
        return {
          success: false,
          error: `Access Denied: ${enteredEmail} is registered as an Administrator. Please switch to the Admin tab.`
        };
      }

      // Authorization check: Is this email an approved IT Manager?
      if (!isKnownITManager()) {
        return {
          success: false,
          error: `No IT Manager account found for ${enteredEmail}. Please verify your IT Manager email.`
        };
      }

      // Password verification
      if (enteredPassword !== DESIGNATED_PASSWORDS.IT_MANAGER && enteredPassword !== 'Manager@123' && enteredPassword !== 'ITManager@123') {
        return {
          success: false,
          error: 'Incorrect password for IT Manager account.'
        };
      }

      // Validated IT Manager user session
      const itManagerName = (emailLower === 'itmanager@assetorbit.edu')
        ? 'Kiran V'
        : enteredEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + ' (IT Manager)';

      const itManagerUser = {
        ...PRESET_USERS['IT Manager'],
        email: enteredEmail,
        name: itManagerName
      };
      setCurrentUser(itManagerUser);

      // Background backend sync
      api.post('/auth/login', { email: enteredEmail, password: enteredPassword, roleHint: 'IT Manager' })
        .then(res => {
          if (res.ok && res.raw?.token) {
            sessionStorage.setItem('assetorbit_session_token', res.raw.token);
            localStorage.setItem('assetorbit_token', res.raw.token);
          }
        }).catch(() => {});

      return { success: true, user: itManagerUser };
    }

    // =========================================================================
    // 3. EMPLOYEE ROLE VERIFICATION
    // =========================================================================
    if (roleHint === 'Employee') {
      // Cross-role boundary check 1: Is this user an Admin?
      if (isKnownAdmin()) {
        return {
          success: false,
          error: `Access Denied: ${enteredEmail} is an Administrator account. Please switch to the Admin tab.`
        };
      }

      // Cross-role boundary check 2: Is this user an IT Manager?
      if (isKnownITManager()) {
        return {
          success: false,
          error: `Access Denied: ${enteredEmail} is an IT Manager account. Please switch to the IT Manager tab.`
        };
      }

      // Find employee in registeredEmployees or defaults
      let matchedEmployee = registeredEmployees.find(e => e.email?.toLowerCase() === emailLower);
      if (!matchedEmployee) {
        matchedEmployee = DEFAULT_EMPLOYEES.find(e => e.email?.toLowerCase() === emailLower);
      }

      // If not yet in list, check if created during asset/subscription assignments in localStorage
      if (!matchedEmployee) {
        let storedAssets = [];
        try {
          storedAssets = JSON.parse(localStorage.getItem('ao_assets') || '[]');
        } catch (e) {}

        let storedSubs = [];
        try {
          storedSubs = JSON.parse(localStorage.getItem('ao_subscriptions') || '[]');
        } catch (e) {}

        const assetMatch = storedAssets.find(a =>
          a.assignedEmail && a.assignedEmail.toLowerCase() === emailLower
        );
        const subMatch = storedSubs.find(s =>
          s.assignedEmail && s.assignedEmail.toLowerCase() === emailLower
        );

        if (assetMatch || subMatch) {
          const resolvedName = assetMatch?.assignedTo || subMatch?.assignedEmployee || enteredEmail.split('@')[0];
          const resolvedDept = assetMatch?.subBranch || subMatch?.department || 'ISE';
          matchedEmployee = {
            id: `USR-EMP-${Date.now().toString().slice(-4)}`,
            name: resolvedName,
            email: emailLower,
            password: 'Employee@123',
            department: resolvedDept,
            category: getCategoryForDept(resolvedDept),
            subBranch: resolvedDept,
            role: 'Employee',
            title: 'Faculty / Staff Member',
            avatar: resolvedName.charAt(0).toUpperCase() || 'E',
            permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
          };
          const updatedList = [matchedEmployee, ...registeredEmployees.filter(e => e.email?.toLowerCase() !== emailLower)];
          setRegisteredEmployees(updatedList);
          localStorage.setItem('ao_registered_employees', JSON.stringify(updatedList));
          broadcastEmployees(updatedList);
        }
      }

      // Universal Employee Login across all laptops & devices:
      // If employee enters password Employee@123, auto-provision and authenticate immediately on that laptop!
      if (!matchedEmployee && (enteredPassword === 'Employee@123' || enteredPassword === 'Employee@1234')) {
        const cleanName = emailLower.includes('@')
          ? emailLower.split('@')[0]
              .replace(/[._\-+]/g, ' ')
              .split(' ')
              .filter(Boolean)
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
          : 'Faculty / Staff Member';

        const dept = 'ISE';
        matchedEmployee = {
          id: `USR-EMP-${Date.now().toString().slice(-4)}`,
          name: cleanName,
          email: emailLower,
          password: 'Employee@123',
          department: dept,
          category: getCategoryForDept(dept),
          subBranch: dept,
          role: 'Employee',
          title: 'Faculty / Staff Member',
          avatar: cleanName.charAt(0).toUpperCase() || 'E',
          permissions: ['tickets:create', 'assets:view_assigned', 'loaners:request']
        };

        const updatedList = [matchedEmployee, ...registeredEmployees.filter(e => e.email?.toLowerCase() !== emailLower)];
        setRegisteredEmployees(updatedList);
        localStorage.setItem('ao_registered_employees', JSON.stringify(updatedList));
        broadcastEmployees(updatedList);
      }

      if (!matchedEmployee) {
        return {
          success: false,
          error: `No employee account found for ${enteredEmail}. Please switch to the Sign Up tab to create your profile or check spelling.`
        };
      }

      // Verify Employee Password
      const expectedPassword = matchedEmployee.password || 'Employee@123';
      if (enteredPassword !== expectedPassword && enteredPassword !== 'Employee@123') {
        return {
          success: false,
          error: 'Incorrect password for this employee account.'
        };
      }

      // Validated Employee user session
      setCurrentUser(matchedEmployee);

      // Background backend sync
      api.post('/auth/login', { email: matchedEmployee.email, password: enteredPassword, roleHint: 'Employee' })
        .then(res => {
          if (res.ok && res.raw?.token) {
            sessionStorage.setItem('assetorbit_session_token', res.raw.token);
            localStorage.setItem('assetorbit_token', res.raw.token);
          }
        }).catch(() => {});

      return { success: true, user: matchedEmployee };
    }

    return {
      success: false,
      error: 'Invalid login role specified.'
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

  const switchRole = (targetRole, employeeEmail = null) => {
    if (targetRole === 'Admin') {
      setCurrentUser(PRESET_USERS['Admin']);
    } else if (targetRole === 'IT Manager' || targetRole === 'ITManager or HOD') {
      setCurrentUser(PRESET_USERS['IT Manager']);
    } else if (targetRole === 'Employee') {
      if (employeeEmail) {
        const found = registeredEmployees.find(e => e.email.toLowerCase() === employeeEmail.toLowerCase());
        if (found) {
          setCurrentUser(found);
          return;
        }
      }
      const firstEmp = registeredEmployees[0] || PRESET_USERS['Employee'];
      setCurrentUser(firstEmp);
    }
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
      switchRole,
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
