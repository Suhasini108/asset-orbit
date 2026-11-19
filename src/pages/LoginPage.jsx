import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Laptop,
  Users,
  Calendar,
  Sparkles,
  AlertCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth, DESIGNATED_PASSWORDS } from '../context/AuthContext';
import confetti from 'canvas-confetti';

// Function to generate strong, secure, and compliant passwords
function generateStrongPassword() {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';

  let pass = '';
  pass += uppers[Math.floor(Math.random() * uppers.length)];
  pass += lowers[Math.floor(Math.random() * lowers.length)];
  pass += lowers[Math.floor(Math.random() * lowers.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];
  pass += uppers[Math.floor(Math.random() * uppers.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += lowers[Math.floor(Math.random() * lowers.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];
  pass += lowers[Math.floor(Math.random() * lowers.length)];

  return `Orbit#${pass.slice(0, 8)}`;
}

export default function LoginPage() {
  const { login, registerEmployee } = useAuth();
  const navigate = useNavigate();

  // Exactly THREE Roles: Admin, IT Manager, Employee
  const ROLES = [
    {
      key: 'Admin',
      title: 'Admin',
      subtitle: 'Full workspace control',
      icon: Shield
    },
    {
      key: 'IT Manager',
      title: 'IT Manager',
      subtitle: 'IT operations & labs',
      icon: Laptop
    },
    {
      key: 'Employee',
      title: 'Employee',
      subtitle: 'My assigned assets view',
      icon: Users
    }
  ];

  const [selectedRole, setSelectedRole] = useState('Admin');
  const [employeeMode, setEmployeeMode] = useState('signin'); // 'signin' | 'signup'

  // Sign In State (Confidential - NO passwords exposed or pre-filled)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sign Up State (Employee only)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('CSE');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setError('');
    setPassword('');
    if (roleKey === 'Employee') {
      setEmployeeMode('signin');
    }
  };

  // Generate and apply a strong password (ONLY for Employee Sign Up)
  const handleSuggestPassword = () => {
    const strongPass = generateStrongPassword();
    setSuggestedPassword(strongPass);
    setSignupPassword(strongPass);
    setSignupConfirmPassword(strongPass);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2500);
  };

  // Sign In Handler
  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password, selectedRole);
      setLoading(false);
      if (res.success) {
        try {
          confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });
        } catch (e) {}
        navigate('/');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 300);
  };

  // Google SSO Simulation
  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const defaultEmail = selectedRole === 'Admin'
        ? 'admin@assetorbit.edu'
        : selectedRole === 'IT Manager'
        ? 'itmanager@assetorbit.edu'
        : 'employee@assetorbit.edu';
      const defaultPass = selectedRole === 'Admin'
        ? DESIGNATED_PASSWORDS.ADMIN
        : selectedRole === 'IT Manager'
        ? DESIGNATED_PASSWORDS.IT_MANAGER
        : 'Employee@123';

      login(defaultEmail, defaultPass, selectedRole);
      navigate('/');
    }, 400);
  };

  // Sign Up Handler (Employee)
  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = registerEmployee({
        name: signupName.trim(),
        email: signupEmail.trim(),
        department: signupDept,
        password: signupPassword
      });

      setLoading(false);
      if (res.success) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
        navigate('/');
      } else {
        setError(res.error || 'Registration failed.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F9F6] text-[#172D27] flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Decorative Organic Soft Sage Background Curves (Matching Reference Image) */}
      <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] pointer-events-none -z-0">
        <svg viewBox="0 0 600 600" fill="none" className="w-full h-full opacity-65">
          <path d="M 280 0 C 380 90 480 220 600 200 L 600 0 Z" fill="#DDECDD" />
          <path d="M 400 0 C 470 130 530 310 600 280 L 600 0 Z" fill="#C5DEC9" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] pointer-events-none -z-0">
        <svg viewBox="0 0 500 500" fill="none" className="w-full h-full opacity-60">
          <path d="M 500 160 C 390 230 310 350 250 500 L 500 500 Z" fill="#DDECDD" />
          <path d="M 500 260 C 430 330 370 410 330 500 L 500 500 Z" fill="#C5DEC9" />
        </svg>
      </div>

      {/* 1. TOP HEADER (Matching Reference Image: Logo on Left, Tagline on Right) */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 relative flex items-center justify-center">
            <div className="w-6 h-6 rounded-md bg-[#244B3E] transform rotate-45 shadow-sm" />
            <div className="w-5 h-5 rounded-md bg-[#315F50] transform rotate-45 absolute -top-1 opacity-90" />
            <div className="w-4 h-4 rounded-md bg-[#A9C7B5] transform rotate-45 absolute -top-2 opacity-80" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-sm sm:text-base text-[#172D27] block tracking-tight">
              Asset &amp; Subscription
            </span>
            <span className="font-bold text-xs sm:text-sm text-[#315F50] block">
              Management
            </span>
          </div>
        </div>

        {/* Right Tagline */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-[#718078]">
          <span className="text-[#A9C7B5]">|</span>
          <span>Track</span>
          <span>&bull;</span>
          <span>Manage</span>
          <span>&bull;</span>
          <span>Optimize</span>
        </div>
      </header>

      {/* 2. MAIN SPLIT CONTENT */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-4 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 my-auto">
        
        {/* LEFT COLUMN: Exactly Matching Reference Image (media_1795008031594_543b4d02.jpg) */}
        <div className="w-full lg:w-1/2 space-y-6 flex flex-col justify-center">
          
          {/* Main Heading & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-[#172D27] tracking-tight leading-[1.12]">
              Smarter Management.<br />
              <span className="relative inline-block">
                Greater Control.
                {/* Subtle sage-green brush underline below heading */}
                <svg className="absolute -bottom-2.5 left-0 w-full h-3 text-[#A9C7B5]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 9C50 3 150 2 198 8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#527060] font-medium max-w-md leading-relaxed pt-1">
              Manage your assets and subscriptions<br />
              all in one place — efficiently and effortlessly.
            </p>
          </div>

          {/* Realistic Dashboard, Potted Plant & Floating Badges Illustration */}
          <div className="relative w-full max-w-[490px] h-[280px] sm:h-[310px] flex items-end">
            <svg
              viewBox="0 0 500 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full overflow-visible select-none"
            >
              <defs>
                {/* Badge Drop Shadow */}
                <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#172D27" floodOpacity="0.08" />
                </filter>
                {/* Laptop Drop Shadow */}
                <filter id="laptopShadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#172D27" floodOpacity="0.12" />
                </filter>

                {/* Line Chart Area Gradient */}
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A9C7B5" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#A9C7B5" stopOpacity="0.02" />
                </linearGradient>

                {/* Screen Glare Gradient */}
                <linearGradient id="screenGlass" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* 1. Sparkle ✦ on left */}
              <g transform="translate(36, 68)">
                <path
                  d="M0 8 C4 8 8 4 8 0 C8 4 12 8 16 8 C12 8 8 12 8 16 C8 12 4 8 0 8 Z"
                  fill="#84B89C"
                />
              </g>

              {/* 2. Soft Ground Shadows */}
              <ellipse cx="280" cy="285" rx="195" ry="10" fill="#172D27" fillOpacity="0.07" />
              <ellipse cx="102" cy="282" rx="36" ry="6" fill="#172D27" fillOpacity="0.08" />

              {/* 3. Arching Dashed Connecting Flow Line */}
              <path
                d="M 125 185 C 118 115, 160 32, 235 28 C 305 25, 400 68, 424 165"
                stroke="#CBDCD0"
                strokeWidth="2"
                strokeDasharray="4 5"
                strokeLinecap="round"
                fill="none"
              />

              {/* 4. POTTED PLANT (Left Side) */}
              <g id="pottedPlant">
                {/* Leaves */}
                <g id="plantLeaves">
                  {/* Leaf 1 (Left low) */}
                  <path
                    d="M 102 240 C 70 235, 45 210, 42 178 C 65 178, 88 198, 102 240 Z"
                    fill="#4A7563"
                  />
                  <path d="M 102 240 Q 75 215 50 188" stroke="#315F50" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Leaf 2 (Left high) */}
                  <path
                    d="M 102 238 C 80 200, 68 150, 78 120 C 100 135, 108 175, 102 238 Z"
                    fill="#315F50"
                  />
                  <path d="M 102 238 Q 90 180 82 130" stroke="#244B3E" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Leaf 3 (Center top high) */}
                  <path
                    d="M 102 235 C 96 170, 96 115, 106 90 C 118 115, 118 170, 102 235 Z"
                    fill="#5E8D77"
                  />
                  <path d="M 102 235 L 105 100" stroke="#315F50" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Leaf 4 (Right high) */}
                  <path
                    d="M 102 238 C 115 195, 132 150, 148 132 C 145 160, 130 200, 102 238 Z"
                    fill="#315F50"
                  />
                  <path d="M 102 238 Q 120 185 140 142" stroke="#244B3E" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Leaf 5 (Right lower) */}
                  <path
                    d="M 102 240 C 122 215, 145 198, 160 195 C 150 218, 130 235, 102 240 Z"
                    fill="#78A78F"
                  />
                  <path d="M 102 240 Q 130 216 152 200" stroke="#4A7563" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* Pot */}
                <g id="potContainer">
                  {/* Pot Rim & Soil */}
                  <ellipse cx="102" cy="242" rx="30" ry="6" fill="#D3C9BD" />
                  <ellipse cx="102" cy="242" rx="27" ry="4.5" fill="#3A2D23" />

                  {/* Pot Body */}
                  <path
                    d="M 74 242 C 75 268, 84 282, 102 282 C 120 282, 129 268, 130 242 Z"
                    fill="#F5EFE6"
                    stroke="#E5DDD0"
                    strokeWidth="1.5"
                  />
                  {/* Subtle 3D Highlight on pot */}
                  <path
                    d="M 82 244 C 84 265, 90 276, 102 276 C 96 276, 88 265, 86 244 Z"
                    fill="#FFFFFF"
                    fillOpacity="0.6"
                  />
                </g>
              </g>

              {/* 5. OPEN MODERN LAPTOP (Center-Right) */}
              <g id="laptopDisplay" transform="translate(156, 100)">
                {/* Screen Shell / Bezel */}
                <rect
                  x="20"
                  y="12"
                  width="234"
                  height="150"
                  rx="8"
                  fill="#1E2B25"
                  stroke="#17231E"
                  strokeWidth="2"
                  filter="url(#laptopShadow)"
                />

                {/* Webcam dot */}
                <circle cx="137" cy="18" r="1.5" fill="#4B6356" />

                {/* Screen Inner Display Area */}
                <g transform="translate(26, 24)">
                  {/* Screen Background */}
                  <rect width="222" height="132" rx="4" fill="#F7F9F6" />

                  {/* Mini Sidebar on Screen */}
                  <rect width="28" height="132" rx="4" fill="#1A2822" />
                  {/* Sidebar Icons */}
                  <g transform="translate(8, 14)">
                    {/* Home icon */}
                    <path d="M 2 7 L 6 3 L 10 7 V 11 H 2 Z" fill="#84B89C" />
                    {/* Stats Bar Chart icon */}
                    <rect x="2" y="18" width="2" height="7" rx="0.5" fill="#84B89C" />
                    <rect x="5.5" y="15" width="2" height="10" rx="0.5" fill="#84B89C" />
                    <rect x="9" y="19" width="2" height="6" rx="0.5" fill="#84B89C" />
                    {/* Settings icon */}
                    <circle cx="6" cy="33" r="3" stroke="#84B89C" strokeWidth="1.2" fill="none" />
                  </g>

                  {/* Main Dashboard Content on Screen */}
                  <g transform="translate(35, 10)">
                    
                    {/* Metric Card 1: Total Assets 24 */}
                    <rect x="0" y="0" width="88" height="46" rx="5" fill="#FFFFFF" stroke="#E5EAE5" strokeWidth="1" />
                    <rect x="6" y="6" width="16" height="14" rx="3" fill="#E6EFE8" />
                    <path d="M 9 9 H 19 V 16 H 9 Z" fill="#315F50" />
                    <line x1="8" y1="17" x2="20" y2="17" stroke="#315F50" strokeWidth="1.2" strokeLinecap="round" />
                    <text x="26" y="13" fill="#718078" fontSize="6.5" fontWeight="600" fontFamily="sans-serif">Total Assets</text>
                    <text x="26" y="27" fill="#172D27" fontSize="13" fontWeight="900" fontFamily="sans-serif">24</text>

                    {/* Metric Card 2: Active Subscriptions 8 */}
                    <rect x="94" y="0" width="88" height="46" rx="5" fill="#FFFFFF" stroke="#E5EAE5" strokeWidth="1" />
                    <rect x="100" y="6" width="16" height="14" rx="3" fill="#E6EFE8" />
                    <rect x="103" y="9" width="10" height="8" rx="1.5" fill="#315F50" />
                    <line x1="105" y1="8" x2="105" y2="9.5" stroke="#315F50" strokeWidth="1" />
                    <line x1="111" y1="8" x2="111" y2="9.5" stroke="#315F50" strokeWidth="1" />
                    <text x="120" y="13" fill="#718078" fontSize="6.5" fontWeight="600" fontFamily="sans-serif">Active Subscriptions</text>
                    <text x="120" y="27" fill="#172D27" fontSize="13" fontWeight="900" fontFamily="sans-serif">8</text>

                    {/* Trend Line Chart Box */}
                    <g transform="translate(0, 52)">
                      <rect width="182" height="64" rx="5" fill="#FFFFFF" stroke="#E5EAE5" strokeWidth="1" />
                      
                      {/* Subtle horizontal grid lines */}
                      <line x1="10" y1="18" x2="172" y2="18" stroke="#F0F4F1" strokeWidth="1" />
                      <line x1="10" y1="36" x2="172" y2="36" stroke="#F0F4F1" strokeWidth="1" />
                      <line x1="10" y1="52" x2="172" y2="52" stroke="#F0F4F1" strokeWidth="1" />

                      {/* Filled Trend Gradient */}
                      <path
                        d="M 14 46 Q 38 48 54 38 T 94 40 T 134 26 T 170 14 V 58 H 14 Z"
                        fill="url(#chartGrad)"
                      />

                      {/* Trend Stroke Line */}
                      <path
                        d="M 14 46 Q 38 48 54 38 T 94 40 T 134 26 T 170 14"
                        stroke="#5E8D77"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />

                      {/* Trend Data Nodes */}
                      <circle cx="14" cy="46" r="2.5" fill="#FFFFFF" stroke="#315F50" strokeWidth="1.5" />
                      <circle cx="54" cy="38" r="2.5" fill="#FFFFFF" stroke="#315F50" strokeWidth="1.5" />
                      <circle cx="94" cy="40" r="2.5" fill="#FFFFFF" stroke="#315F50" strokeWidth="1.5" />
                      <circle cx="134" cy="26" r="2.5" fill="#FFFFFF" stroke="#315F50" strokeWidth="1.5" />
                      <circle cx="170" cy="14" r="2.5" fill="#FFFFFF" stroke="#315F50" strokeWidth="1.5" />
                    </g>
                  </g>

                  {/* Glare Diagonal across Screen */}
                  <polygon points="0,0 90,0 20,132 0,132" fill="url(#screenGlass)" pointerEvents="none" />
                </g>

                {/* Laptop Keyboard / Base Chassis */}
                <path
                  d="M 4 162 L 270 162 L 264 170 C 263 172, 260 173, 256 173 L 18 173 C 14 173, 11 172, 10 170 Z"
                  fill="#CBD5E1"
                />
                {/* Center Thumb Notch */}
                <rect x="122" y="162" width="30" height="2.5" rx="1" fill="#94A3B8" />
                <path
                  d="M 8 171 L 266 171 C 260 174, 254 175, 248 175 L 26 175 C 20 175, 14 174, 8 171 Z"
                  fill="#94A3B8"
                />
              </g>

              {/* 6. FOUR FLOATING BADGES (Along the dashed curve, exactly matching Reference Image) */}
              {/* BADGE 1: Monitor / Desktop (Top-Left above plant) */}
              <g transform="translate(85, 48)" filter="url(#badgeShadow)">
                <rect width="36" height="36" rx="10" fill="#EBF2ED" stroke="#D1E2D7" strokeWidth="1.2" />
                <g transform="translate(9, 9)">
                  <rect x="1" y="1" width="16" height="11" rx="2" stroke="#315F50" strokeWidth="1.5" fill="none" />
                  <line x1="9" y1="12" x2="9" y2="15" stroke="#315F50" strokeWidth="1.5" />
                  <line x1="6" y1="15" x2="12" y2="15" stroke="#315F50" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </g>

              {/* BADGE 2: Cloud (Top-Center above laptop) */}
              <g transform="translate(202, 16)" filter="url(#badgeShadow)">
                <rect width="36" height="36" rx="10" fill="#EBF2ED" stroke="#D1E2D7" strokeWidth="1.2" />
                <g transform="translate(9, 9)">
                  <path
                    d="M 5 13 A 3.5 3.5 0 0 1 4 6 A 4.5 4.5 0 0 1 12.5 4 A 4 4 0 0 1 15 13 Z"
                    stroke="#315F50"
                    strokeWidth="1.5"
                    fill="#315F50"
                    fillOpacity="0.15"
                    strokeLinejoin="round"
                  />
                </g>
              </g>

              {/* BADGE 3: Calendar (Top-Right above laptop) */}
              <g transform="translate(312, 44)" filter="url(#badgeShadow)">
                <rect width="36" height="36" rx="10" fill="#EBF2ED" stroke="#D1E2D7" strokeWidth="1.2" />
                <g transform="translate(9, 9)">
                  <rect x="2" y="3" width="14" height="12" rx="2" stroke="#315F50" strokeWidth="1.5" fill="none" />
                  <line x1="2" y1="7" x2="16" y2="7" stroke="#315F50" strokeWidth="1.2" />
                  <line x1="5.5" y1="1" x2="5.5" y2="3.5" stroke="#315F50" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="12.5" y1="1" x2="12.5" y2="3.5" stroke="#315F50" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </g>

              {/* BADGE 4: Shield Check (Right side of laptop) */}
              <g transform="translate(388, 106)" filter="url(#badgeShadow)">
                <rect width="36" height="36" rx="10" fill="#EBF2ED" stroke="#D1E2D7" strokeWidth="1.2" />
                <g transform="translate(9, 9)">
                  <path
                    d="M 9 2 L 15 4.5 V 9.5 C 15 13.5 12 16.5 9 17.5 C 6 16.5 3 13.5 3 9.5 V 4.5 Z"
                    stroke="#315F50"
                    strokeWidth="1.5"
                    fill="#315F50"
                    fillOpacity="0.15"
                    strokeLinejoin="round"
                  />
                  <path d="M 6.5 9.5 L 8.2 11.2 L 11.8 7.5" stroke="#315F50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Matching Reference Image (media_1795008031594_543b4d02.jpg) */}
        <div className="w-full lg:w-[440px] bg-white rounded-3xl shadow-xl shadow-[#172D27]/5 border border-[#E5EAE5] p-7 sm:p-9 relative">
          
          {/* Logo Badge at card top */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-12 h-12 relative flex items-center justify-center mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#244B3E] transform rotate-45 shadow-sm" />
              <div className="w-7 h-7 rounded-lg bg-[#315F50] transform rotate-45 absolute -top-1 opacity-90" />
              <div className="w-6 h-6 rounded-lg bg-[#A9C7B5] transform rotate-45 absolute -top-2 opacity-80" />
            </div>

            <h2 className="text-2xl font-black text-[#172D27] tracking-tight">
              {employeeMode === 'signup' ? 'Create Employee Account' : 'Welcome Back!'}
            </h2>
            <p className="text-xs text-[#718078] font-medium">
              {employeeMode === 'signup'
                ? 'Register your official departmental employee profile'
                : 'Sign in to your account'}
            </p>
          </div>

          {/* Clean 3-Role Selection Tabs (Admin, IT Manager, Employee) */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#F7F9F6] border border-[#E5EAE5] mb-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleRoleSelect(r.key)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center space-y-1 ${
                    isSelected
                      ? 'bg-white text-[#172D27] shadow-xs border border-[#A9C7B5]'
                      : 'text-[#718078] hover:text-[#172D27]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#315F50]' : 'text-slate-400'}`} />
                  <span className="truncate">{r.title}</span>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium mb-4 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM: Employee Sign Up Mode */}
          {employeeMode === 'signup' ? (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. rahul.sharma@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Department / Engineering Branch
                </label>
                <select
                  value={signupDept}
                  onChange={(e) => setSignupDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                >
                  <option value="CSE">CSE (Computer Science)</option>
                  <option value="ISE">ISE (Information Science)</option>
                  <option value="AI&ML">AI&amp;ML (Artificial Intelligence)</option>
                  <option value="ECE">ECE (Electronics &amp; Comm)</option>
                  <option value="EEE">EEE (Electrical &amp; Electronics)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Operations & IT">Operations &amp; IT</option>
                </select>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#172D27]">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestPassword}
                    className="text-[11px] font-bold text-[#315F50] hover:text-[#244B3E] hover:underline flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#315F50]" />
                    <span>Suggest Strong Password</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Enter password or use suggestion"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbdcd0] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50]"
                />
              </div>

              {/* Password Generated Pill Notification */}
              {suggestedPassword && (
                <div className="p-2 rounded-xl bg-[#E6EFE8] border border-[#A9C7B5] text-xs flex items-center justify-between">
                  <span className="text-[#315F50] font-bold font-mono">
                    Suggested: {suggestedPassword}
                  </span>
                  <span className="text-[10px] font-bold text-[#315F50] bg-white px-2 py-0.5 rounded-md shadow-2xs">
                    {passwordCopied ? 'Auto-Applied!' : 'Applied'}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl text-xs font-extrabold bg-[#244B3E] hover:bg-[#172D27] text-white shadow-md shadow-[#244B3E]/20 transition-all flex items-center justify-center space-x-2 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Employee Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-xs text-[#718078]">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setEmployeeMode('signin')}
                  className="font-bold text-[#315F50] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            /* FORM: Standard Sign In Mode (Matching Reference Image) */
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Address Field */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@assetorbit.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] shadow-xs"
                  />
                </div>
              </div>

              {/* Password Field with Lock Icon and Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#172D27] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E5EAE5] text-xs text-[#172D27] focus:outline-none focus:border-[#315F50] shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#E5EAE5] text-[#315F50] focus:ring-[#315F50]"
                  />
                  <span className="text-[#718078] font-medium">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Password Recovery:\nPlease contact your institutional IT Helpdesk or System Administrator to reset your credentials.')}
                  className="font-medium text-[#718078] hover:text-[#315F50] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Forest-Green Login Button Matching Reference Image */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl text-xs font-extrabold bg-[#244B3E] hover:bg-[#172D27] text-white shadow-md shadow-[#244B3E]/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Login →'}</span>
              </button>

              {/* "or" Divider Matching Reference Image */}
              <div className="flex items-center my-3.5">
                <div className="flex-1 border-t border-[#E5EAE5]" />
                <span className="px-3 text-xs text-[#718078] font-medium">or</span>
                <div className="flex-1 border-t border-[#E5EAE5]" />
              </div>

              {/* "Continue with Google" Button Matching Reference Image */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-[#172D27] bg-white border border-[#E5EAE5] hover:bg-[#F7F9F6] transition-all flex items-center justify-center space-x-2 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Bottom "Don't have an account? Sign Up" Matching Reference Image */}
              <div className="text-center pt-2 text-xs text-[#718078]">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('Employee'); setEmployeeMode('signup'); }}
                  className="font-bold text-[#315F50] hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-3 text-center text-xs text-[#718078] font-medium border-t border-[#E5EAE5]/60">
        &copy; 2026 AssetOrbit &bull; Enterprise IT Asset &amp; Subscription Management System &bull; College Minor Project
      </footer>
    </div>
  );
}
