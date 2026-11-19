// Comprehensive Software & Plan Catalogue for AssetOrbit Enterprise
// Supports dynamic plan selection for MATLAB, Microsoft 365, GitHub, Adobe CC, AWS, Netflix, Google Workspace, Zoom, JetBrains, Canva, etc.

export const INITIAL_SOFTWARE_CATALOGUE = [
  {
    id: 'soft-matlab',
    softwareName: 'MATLAB',
    vendor: 'MathWorks',
    category: 'Engineering & Simulation',
    website: 'https://www.mathworks.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png',
    logoBg: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Technical computing platform for numerical computation, matrix manipulation, simulation, and algorithm development across engineering departments.',
    plans: [
      {
        id: 'plan-matlab-student',
        planName: 'Student License',
        description: 'For student coursework and individual academic research projects.',
        price: 3900,
        currency: 'INR',
        billingCycles: ['Yearly'],
        defaultBillingCycle: 'Yearly',
        features: [
          'Standard MATLAB & Simulink',
          'Access to MATLAB Online & Mobile',
          'Up to 10 common academic toolboxes',
          'Community support & documentation'
        ],
        activeStatus: true
      },
      {
        id: 'plan-matlab-standard',
        planName: 'Standard Individual',
        description: 'Single-workstation commercial and faculty engineering research license.',
        price: 24500,
        currency: 'INR',
        billingCycles: ['Yearly'],
        defaultBillingCycle: 'Yearly',
        features: [
          'Full commercial toolboxes access',
          'Dedicated MathWorks technical support',
          'MATLAB Compiler runtime distribution',
          'Installation on two individual computers'
        ],
        activeStatus: true
      },
      {
        id: 'plan-matlab-pro',
        planName: 'Professional Concurrent',
        description: 'Network floating license for department lab clusters and servers.',
        price: 68000,
        currency: 'INR',
        billingCycles: ['Yearly'],
        defaultBillingCycle: 'Yearly',
        features: [
          'Network concurrent license server',
          'Parallel Computing Toolbox (up to 64 cores)',
          'MATLAB Coder & GPU Coder acceleration',
          'Priority 24/7 engineering escalation'
        ],
        activeStatus: true
      },
      {
        id: 'plan-matlab-campus-r2025b',
        planName: 'Campuswide Suite R2025B',
        description: 'Institution-wide unlimited license for all students, labs, and faculty in engineering departments.',
        price: 1259741,
        currency: 'INR',
        billingCycles: ['Yearly'],
        defaultBillingCycle: 'Yearly',
        features: [
          'Full MATLAB & Simulink Campuswide Suite R2025B',
          'Unlimited campus student & faculty access',
          'All 100+ specialized engineering & AI toolboxes',
          'Dedicated MathWorks technical escalation',
          'Automated MATLAB Grader for university courses'
        ],
        activeStatus: true
      },
      {
        id: 'plan-matlab-campus',
        planName: 'Campus-Wide Standard License',
        description: 'Institution-wide unlimited license for all students, labs, and faculty.',
        price: 185000,
        currency: 'INR',
        billingCycles: ['Yearly'],
        defaultBillingCycle: 'Yearly',
        features: [
          'Unlimited campus student & faculty access',
          'All 100+ specialized engineering toolboxes',
          'Campus cloud cluster server deployment',
          'Automated MATLAB Grader for university courses'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-m365',
    softwareName: 'Microsoft 365',
    vendor: 'Microsoft Corporation',
    category: 'Productivity & Office',
    website: 'https://www.microsoft.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    logoBg: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Cloud productivity platform integrating Word, Excel, PowerPoint, Outlook, Teams, OneDrive, and enterprise endpoint security.',
    plans: [
      {
        id: 'plan-m365-basic',
        planName: 'Business Basic',
        description: 'Web and mobile productivity apps with business email and cloud storage.',
        price: 145,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Web and mobile Office apps only',
          'Custom business domain email (50GB)',
          '1TB OneDrive cloud storage per user',
          'Microsoft Teams with up to 300 participants'
        ],
        activeStatus: true
      },
      {
        id: 'plan-m365-standard',
        planName: 'Business Standard',
        description: 'Full desktop Office suite plus cloud collaborative services.',
        price: 770,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Desktop Word, Excel, PowerPoint, Outlook',
          'Install on up to 5 PCs/Macs per user',
          '1TB OneDrive cloud storage per user',
          'Teams meeting recordings and transcripts'
        ],
        activeStatus: true
      },
      {
        id: 'plan-m365-premium',
        planName: 'Business Premium',
        description: 'Complete standard suite with enterprise cyber threat protection.',
        price: 1620,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Includes all Business Standard apps',
          'Microsoft Defender for Business anti-ransomware',
          'Microsoft Intune mobile device management (MDM)',
          'Azure Information Protection data loss prevention'
        ],
        activeStatus: true
      },
      {
        id: 'plan-m365-e5',
        planName: 'Enterprise E5',
        description: 'Highest-tier enterprise security, analytics, and voice capabilities.',
        price: 3410,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Full Microsoft 365 desktop apps & cloud',
          'Power BI Pro license included',
          'Advanced eDiscovery & audit log tracking',
          'Cloud-based phone system with audio conferencing'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-github',
    softwareName: 'GitHub',
    vendor: 'GitHub / Microsoft',
    category: 'Software Development',
    website: 'https://github.com',
    logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    logoBg: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Cloud Git repository hosting, collaborative pull requests, automated GitHub Actions CI/CD workflows, and code security analysis.',
    plans: [
      {
        id: 'plan-gh-free',
        planName: 'GitHub Free',
        description: 'Essential Git repositories and community collaboration.',
        price: 0,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Unlimited public & private repositories',
          '2,000 CI/CD Action minutes/month',
          '500MB GitHub Packages storage',
          'Automated Dependabot security vulnerability alerts'
        ],
        activeStatus: true
      },
      {
        id: 'plan-gh-team',
        planName: 'GitHub Team',
        description: 'Advanced collaboration and code review controls for dev teams.',
        price: 340,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Protected branches & multi-approver rules',
          '3,000 CI/CD Action minutes/month',
          'Code Owners automated review requests',
          'Draft pull requests & repository insights'
        ],
        activeStatus: true
      },
      {
        id: 'plan-gh-enterprise',
        planName: 'GitHub Enterprise',
        description: 'Enterprise compliance, security scanning, and SAML single sign-on.',
        price: 1750,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'SAML Single Sign-On (SSO) & SCIM provisioning',
          '50,000 CI/CD Action minutes/month',
          'Audit log streaming to SIEM systems',
          'GitHub Advanced Security secret scanning'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-adobe-cc',
    softwareName: 'Adobe Creative Cloud',
    vendor: 'Adobe Systems',
    category: 'Design & Creative',
    website: 'https://www.adobe.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg',
    logoBg: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Comprehensive creative suite of 20+ design, photography, video production, and UX tools including Photoshop, Illustrator, and Premiere Pro.',
    plans: [
      {
        id: 'plan-adobe-student',
        planName: 'Student & Teacher Edition',
        description: 'Full creative suite for accredited higher educational institutions.',
        price: 1596,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Complete 20+ desktop creative apps suite',
          'Photoshop, Illustrator, InDesign, Premiere Pro',
          '100GB secure creative cloud storage',
          'Adobe Portfolio & Adobe Fonts library'
        ],
        activeStatus: true
      },
      {
        id: 'plan-adobe-individual',
        planName: 'Individual All Apps',
        description: 'Unrestricted individual subscription for creative professionals.',
        price: 4230,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'All Apps including After Effects & Audition',
          '100GB Cloud Storage + Adobe Firefly AI credits',
          'Access to Adobe Stock standard assets',
          'Cross-device sync on desktop, iPad, and web'
        ],
        activeStatus: true
      },
      {
        id: 'plan-adobe-teams',
        planName: 'Creative Cloud for Teams',
        description: 'Centralized license re-assignment and enterprise cloud asset sharing.',
        price: 6580,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Admin Console for rapid license re-assignment',
          '1TB Cloud Storage per team license',
          '180-day extended file version history',
          '24/7 dedicated enterprise technical support'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-aws',
    softwareName: 'AWS Cloud Services',
    vendor: 'Amazon Web Services',
    category: 'Cloud Infrastructure',
    website: 'https://aws.amazon.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    logoBg: 'bg-amber-50 text-amber-800 border-amber-300',
    description: 'Scalable on-demand cloud computing, S3 object storage, relational databases (RDS), container orchestration, and serverless Lambda functions.',
    plans: [
      {
        id: 'plan-aws-free',
        planName: 'AWS Free Tier',
        description: 'Introductory free allowance for lab testing and student prototypes.',
        price: 0,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '750 hrs/month of EC2 t2.micro compute',
          '5GB standard S3 storage with 20K GET requests',
          '1 Million free AWS Lambda requests/month',
          'AWS CloudWatch fundamental monitoring'
        ],
        activeStatus: true
      },
      {
        id: 'plan-aws-payg',
        planName: 'Pay-As-You-Go Standard',
        description: 'Flexible consumption-based compute and departmental workload billing.',
        price: 3500,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Elastic Compute Cloud (EC2) on-demand instances',
          'Amazon Aurora & PostgreSQL automated backups',
          'Automated AWS Budgets cost spike SMS/email alerts',
          'Basic AWS technical support included'
        ],
        activeStatus: true
      },
      {
        id: 'plan-aws-reserved',
        planName: 'Compute Savings Plan',
        description: 'Commitment contract offering maximum discounts on continuous workloads.',
        price: 18000,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Up to 72% compute discounts across EC2 & Fargate',
          'Dedicated Virtual Private Cloud (VPC) isolation',
          'AWS Business Support with 1-hour response SLA',
          'Direct Connect campus fiber interconnect support'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-netflix',
    softwareName: 'Netflix',
    vendor: 'Netflix India',
    category: 'Entertainment & Media',
    website: 'https://www.netflix.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    logoBg: 'bg-rose-50 text-rose-700 border-rose-300',
    description: 'Digital streaming subscription for student lounge suites, campus recreation centers, and faculty guest lounges.',
    plans: [
      {
        id: 'plan-nf-mobile',
        planName: 'Mobile Plan',
        description: 'Single phone or tablet stream in standard definition.',
        price: 149,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '1 device stream at a time (Phone/Tablet)',
          'Standard Definition 480p resolution',
          'Download titles on 1 device for offline viewing',
          'Unlimited movies & TV shows'
        ],
        activeStatus: true
      },
      {
        id: 'plan-nf-basic',
        planName: 'Basic Plan',
        description: 'Single HD screen supporting TV, computer, and mobile.',
        price: 199,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '1 screen at a time on any device',
          'High Definition 720p resolution',
          'Download titles on 1 phone or tablet',
          'Ad-free uninterrupted streaming'
        ],
        activeStatus: true
      },
      {
        id: 'plan-nf-standard',
        planName: 'Standard Full HD',
        description: 'Two simultaneous streams in 1080p Full HD.',
        price: 499,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '2 screens simultaneous viewing',
          'Full HD 1080p crystal clear resolution',
          'Download titles to 2 devices',
          'Supports all Smart TVs and campus projectors'
        ],
        activeStatus: true
      },
      {
        id: 'plan-nf-premium',
        planName: 'Premium 4K Ultra HD',
        description: 'Four simultaneous 4K streams with spatial audio for campus auditoriums.',
        price: 649,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '4 screens simultaneous viewing',
          'Ultra HD 4K resolution + HDR visual processing',
          'Netflix spatial audio integration',
          'Download titles to 6 devices simultaneously'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-gworkspace',
    softwareName: 'Google Workspace',
    vendor: 'Google LLC',
    category: 'Productivity & Collaboration',
    website: 'https://workspace.google.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
    logoBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Institutional suite featuring custom institutional Gmail, Google Drive cloud storage, Google Meet, Docs, Sheets, and Classroom.',
    plans: [
      {
        id: 'plan-gw-starter',
        planName: 'Business Starter',
        description: 'Essential custom email and 30GB cloud storage per user.',
        price: 137,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Custom institution domain email (@college.edu)',
          '30GB pooled cloud storage per user',
          '100 participant Google Meet video calls',
          'Standard Google security management console'
        ],
        activeStatus: true
      },
      {
        id: 'plan-gw-standard',
        planName: 'Business Standard',
        description: 'High-capacity 2TB pooled storage and meeting recording.',
        price: 672,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '2TB pooled storage per user',
          '150 participant Meet calls with cloud recording',
          'Shared Team Drives for departmental folders',
          'Collaborative Google Docs, Sheets, Slides'
        ],
        activeStatus: true
      },
      {
        id: 'plan-gw-plus',
        planName: 'Business Plus',
        description: '5TB storage per user with Google Vault eDiscovery archiving.',
        price: 1150,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '5TB pooled cloud storage per user',
          '500 participant Meet calls + attendance tracking',
          'Google Vault for regulatory data retention & eDiscovery',
          'Advanced endpoint device security management'
        ],
        activeStatus: true
      },
      {
        id: 'plan-gw-enterprise',
        planName: 'Enterprise Edition',
        description: 'Unlimited storage upon request, S/MIME encryption, and DLP.',
        price: 2100,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Unlimited cloud storage (upon request)',
          'Data Loss Prevention (DLP) for Drive and Gmail',
          'S/MIME email certificate encryption',
          'Enterprise in-domain livestreaming for 100K viewers'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-zoom',
    softwareName: 'Zoom Workplace',
    vendor: 'Zoom Video Communications',
    category: 'Communication',
    website: 'https://zoom.us',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg',
    logoBg: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Video conferencing, virtual classrooms, webinar streaming, and team chat for university lectures and administrative committees.',
    plans: [
      {
        id: 'plan-zoom-basic',
        planName: 'Zoom Basic',
        description: 'Free virtual meetings with up to 100 participants.',
        price: 0,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Up to 100 participants per meeting',
          '40-minute limit on group meetings',
          'Automated live transcription captions',
          'Team chat & whiteboarding tools'
        ],
        activeStatus: true
      },
      {
        id: 'plan-zoom-pro',
        planName: 'Zoom Pro',
        description: 'Uncapped 30-hour meeting durations with 5GB cloud recording.',
        price: 1300,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Up to 100 participants with 30-hour meeting duration',
          '5GB MP4 cloud recording with transcript search',
          'Zoom AI Companion automated meeting summaries',
          'Social media livestreaming capability'
        ],
        activeStatus: true
      },
      {
        id: 'plan-zoom-business',
        planName: 'Zoom Business',
        description: 'Up to 300 participants, institutional single sign-on, and custom vanity URL.',
        price: 1800,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Up to 300 participants per session',
          'Unlimited cloud recording storage',
          'Single Sign-On (SSO) integration',
          'Custom company branding & vanity meeting URLs'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-jetbrains',
    softwareName: 'JetBrains All Products',
    vendor: 'JetBrains s.r.o.',
    category: 'Software Development',
    website: 'https://www.jetbrains.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/JetBrains_Logo_2016.svg',
    logoBg: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Professional developer tool suite including IntelliJ IDEA Ultimate, PyCharm Professional, WebStorm, CLion, and DataGrip.',
    plans: [
      {
        id: 'plan-jb-edu',
        planName: 'Educational Campus Pack',
        description: 'Free full-suite license for accredited educational college labs.',
        price: 0,
        currency: 'INR',
        billingCycles: ['Yearly'],
        defaultBillingCycle: 'Yearly',
        features: [
          'All 16 JetBrains IDEs completely free for students & staff',
          'IntelliJ IDEA Ultimate, PyCharm Pro, CLion, WebStorm',
          'Deployable across college computer lab image templates',
          'Valid for 1 year with annual educational renewal'
        ],
        activeStatus: true
      },
      {
        id: 'plan-jb-individual',
        planName: 'Individual Developer',
        description: 'Full commercial license for individual research faculty members.',
        price: 2200,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Full access to all desktop IDEs',
          'Installation on multiple computers by one developer',
          'Continual perpetual fallback license after 12 months',
          'Access to early access program (EAP) releases'
        ],
        activeStatus: true
      },
      {
        id: 'plan-jb-commercial',
        planName: 'Commercial Organization',
        description: 'Floating network license pack for software development research cells.',
        price: 5800,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Floating organization license server integration',
          'Transferable licenses between faculty & researchers',
          'Central JetBrains Account organization portal',
          'Priority commercial technical support SLA'
        ],
        activeStatus: true
      }
    ]
  },
  {
    id: 'soft-canva',
    softwareName: 'Canva',
    vendor: 'Canva Pty Ltd',
    category: 'Design & Creative',
    website: 'https://www.canva.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
    logoBg: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Online graphic design and visual communication platform for university event banners, research posters, and student club media.',
    plans: [
      {
        id: 'plan-canva-free',
        planName: 'Canva Free',
        description: 'Core graphic design tools and templates.',
        price: 0,
        currency: 'INR',
        billingCycles: ['Monthly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '250,000+ free templates for posters & presentations',
          '5GB cloud storage for uploaded assets',
          'Magic Studio AI design tools (limited)',
          'Export to PDF, PNG, and MP4 formats'
        ],
        activeStatus: true
      },
      {
        id: 'plan-canva-pro',
        planName: 'Canva Pro',
        description: 'Unlimited premium content and Brand Kit for single creators.',
        price: 499,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          '100+ Million premium stock photos, graphics & videos',
          '1-Click Background Remover & Magic Eraser AI',
          'Brand Kit with college logos, fonts, and colors',
          '1TB Cloud Storage + Scheduled Social Publishing'
        ],
        activeStatus: true
      },
      {
        id: 'plan-canva-teams',
        planName: 'Canva for Teams',
        description: 'Team collaboration and asset approval workflows for 5 users.',
        price: 850,
        currency: 'INR',
        billingCycles: ['Monthly', 'Yearly'],
        defaultBillingCycle: 'Monthly',
        features: [
          'Includes all Pro features for first 5 team members',
          'Centralized brand controls and template locking',
          'Team design review & approval workflows',
          'Single Sign-On (SSO) and dedicated team support'
        ],
        activeStatus: true
      }
    ]
  }
];
