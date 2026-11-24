import fs from "fs";
import os from "os";
import path from "path";
import { INITIAL_ASSETS, INITIAL_SUBSCRIPTIONS } from "../../src/data/collegeSampleData.js";

const TMP_FILE = path.join(os.tmpdir(), "assetorbit_sync_state.json");

// Default initial employees list
const DEFAULT_PRESET_EMPLOYEES = [
  {
    id: "USR-EMP-CSE-01",
    name: "Vikram Naik",
    email: "employee@assetorbit.edu",
    password: "Employee@123",
    department: "CSE",
    category: "Engineering",
    subBranch: "CSE",
    role: "Employee",
    title: "Assistant Professor (Systems & Cloud)",
    avatar: "V",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-CSE-02",
    name: "Anita Sharma",
    email: "anita.sharma@college.edu",
    password: "Employee@123",
    department: "CSE",
    category: "Engineering",
    subBranch: "CSE",
    role: "Employee",
    title: "Senior Lab Instructor (Algorithms Lab)",
    avatar: "A",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ISE-01",
    name: "Sneha Rao",
    email: "sneha.rao@college.edu",
    password: "Employee@123",
    department: "ISE",
    category: "Engineering",
    subBranch: "ISE",
    role: "Employee",
    title: "Assistant Professor (Data Engineering)",
    avatar: "S",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ISE-02",
    name: "Praveen Kumar",
    email: "praveen.kumar@college.edu",
    password: "Employee@123",
    department: "ISE",
    category: "Engineering",
    subBranch: "ISE",
    role: "Employee",
    title: "Senior Lab Instructor (Network Security Lab)",
    avatar: "P",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ISE-03",
    name: "Sachin Joshi",
    email: "sachin.joshi@gmail.com",
    password: "Employee@123",
    department: "ISE",
    category: "Engineering",
    subBranch: "ISE",
    role: "Employee",
    title: "Assistant Professor & Lab In-Charge",
    avatar: "S",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ISE-04",
    name: "JDP sir",
    email: "jdp.sir@college.edu",
    password: "Employee@123",
    department: "ISE",
    category: "Engineering",
    subBranch: "ISE",
    role: "Employee",
    title: "Senior Faculty (ISE Department)",
    avatar: "J",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ISE-05",
    name: "Arathi Nayak",
    email: "arathi.nayak@college.edu",
    password: "Employee@123",
    department: "ISE",
    category: "Engineering",
    subBranch: "ISE",
    role: "Employee",
    title: "Assistant Professor & Faculty (ISE)",
    avatar: "A",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ISE-06",
    name: "Tanveer Ahmad",
    email: "tanveer.ahmad@college.edu",
    password: "Employee@123",
    department: "ISE",
    category: "Engineering",
    subBranch: "ISE",
    role: "Employee",
    title: "Assistant Professor & Faculty (ISE)",
    avatar: "T",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-AIML-01",
    name: "Dr. Rajesh Hegde",
    email: "rajesh.hegde@college.edu",
    password: "Employee@123",
    department: "AI&ML",
    category: "Engineering",
    subBranch: "AI&ML",
    role: "Employee",
    title: "Professor & AI Center Lead",
    avatar: "R",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ECE-01",
    name: "Prof. Sunita Kulkarni",
    email: "sunita.kulkarni@college.edu",
    password: "Employee@123",
    department: "ECE",
    category: "Engineering",
    subBranch: "ECE",
    role: "Employee",
    title: "Associate Professor (VLSI & Embedded)",
    avatar: "S",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-EEE-01",
    name: "Dr. Suresh Joshi",
    email: "suresh.joshi@college.edu",
    password: "Employee@123",
    department: "EEE",
    category: "Engineering",
    subBranch: "EEE",
    role: "Employee",
    title: "Professor (Power Electronics & Drives)",
    avatar: "S",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-MECH-01",
    name: "Dr. Anand Patil",
    email: "anand.patil@college.edu",
    password: "Employee@123",
    department: "Mechanical",
    category: "Engineering",
    subBranch: "Mechanical",
    role: "Employee",
    title: "HOD & Professor (CAD/CAM & Automation)",
    avatar: "A",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-CIVIL-01",
    name: "Prof. Deepa Nair",
    email: "deepa.nair@college.edu",
    password: "Employee@123",
    department: "Civil",
    category: "Engineering",
    subBranch: "Civil",
    role: "Employee",
    title: "Assistant Professor (Structural Engineering)",
    avatar: "D",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-OPS-01",
    name: "Naveen Teja",
    email: "naveen.teja@college.edu",
    password: "Employee@123",
    department: "Operations & IT",
    category: "Operations & IT",
    subBranch: "IT Center",
    role: "Employee",
    title: "Senior Systems Administrator",
    avatar: "N",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-ADMIN-01",
    name: "Dr. H. Venkatesh",
    email: "principal@college.edu",
    password: "Employee@123",
    department: "Administration",
    category: "Administration",
    subBranch: "Principal Office",
    role: "Employee",
    title: "Principal & Head of Institution",
    avatar: "H",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  },
  {
    id: "USR-EMP-SCI-01",
    name: "Dr. Archana Rao",
    email: "archana.physics@college.edu",
    password: "Employee@123",
    department: "Basic Sciences",
    category: "Basic Sciences",
    subBranch: "Physics Lab",
    role: "Employee",
    title: "Associate Professor (Applied Physics)",
    avatar: "A",
    permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
  }
];

class SyncStore {
  constructor() {
    this.state = {
      assets: JSON.parse(JSON.stringify(INITIAL_ASSETS)),
      subscriptions: JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTIONS)),
      tickets: [],
      registeredEmployees: JSON.parse(JSON.stringify(DEFAULT_PRESET_EMPLOYEES)),
      lastModified: Date.now(),
      version: 1
    };
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(TMP_FILE)) {
        const raw = fs.readFileSync(TMP_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.assets)) {
          // Merge any newly introduced canonical assets (e.g. AST-ISE-040) if not present
          const existingIds = new Set(parsed.assets.map(a => a.id));
          const missing = INITIAL_ASSETS.filter(a => !existingIds.has(a.id));
          const mergedAssets = [...parsed.assets, ...missing];

          // Merge any newly introduced preset employees (e.g. Arathi Nayak) if not present
          const existingEmps = new Set((parsed.registeredEmployees || []).map(e => (e.email || "").toLowerCase()));
          const missingEmps = DEFAULT_PRESET_EMPLOYEES.filter(e => !existingEmps.has((e.email || "").toLowerCase()));
          const mergedEmps = [...(parsed.registeredEmployees || []), ...missingEmps];

          this.state = {
            assets: mergedAssets,
            subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : this.state.subscriptions,
            tickets: Array.isArray(parsed.tickets) ? parsed.tickets : this.state.tickets,
            registeredEmployees: mergedEmps,
            lastModified: parsed.lastModified || Date.now(),
            version: parsed.version || 1
          };
          console.log(`[SyncStore] Loaded ${this.state.assets.length} assets from disk cache.`);
        }
      }
    } catch (e) {
      console.warn("[SyncStore] Notice on cache load:", e.message);
    }
  }

  saveToDisk() {
    try {
      fs.writeFileSync(TMP_FILE, JSON.stringify(this.state), "utf8");
    } catch (e) {
      // Non-fatal if tmp write is constrained in serverless
    }
  }

  touch() {
    this.state.lastModified = Date.now();
    this.state.version = (this.state.version || 0) + 1;
    this.saveToDisk();
  }

  getState(since = 0) {
    const sinceNum = Number(since) || 0;
    if (sinceNum > 0 && sinceNum >= this.state.lastModified) {
      return {
        upToDate: true,
        lastModified: this.state.lastModified,
        version: this.state.version
      };
    }
    return {
      upToDate: false,
      assets: this.state.assets,
      subscriptions: this.state.subscriptions,
      tickets: this.state.tickets,
      registeredEmployees: this.state.registeredEmployees,
      lastModified: this.state.lastModified,
      version: this.state.version
    };
  }

  // --- MUTATION DISPATCHER ---
  applyMutation({ type, payload = {}, actor = "Admin", role = "Admin" }) {
    switch (type) {
      case "ASSET_DELETE": {
        const targetId = String(payload.id || payload.tag || "");
        if (targetId) {
          this.state.assets = this.state.assets.filter(a => a.id !== targetId && a.tag !== targetId);
          this.touch();
        }
        break;
      }

      case "ASSET_ASSIGN": {
        const targetId = String(payload.id || payload.tag || "");
        const assignee = (payload.assignee || payload.employeeName || payload.assignedTo || "").trim();
        const email = (payload.employeeEmail || payload.assignedEmail || "").trim().toLowerCase();
        const location = payload.location || payload.deskLocation || "";

        this.state.assets = this.state.assets.map(a => {
          if (a.id === targetId || a.tag === targetId) {
            return {
              ...a,
              status: "Assigned",
              assignedTo: assignee || a.assignedTo,
              assignedUser: assignee || a.assignedUser,
              assignedEmail: email || a.assignedEmail,
              employeeEmail: email || a.employeeEmail,
              location: location || a.location || a.labRoom,
              timeline: [
                ...(a.timeline || []),
                {
                  date: new Date().toISOString().slice(0, 10),
                  event: `Assigned to ${assignee}`,
                  notes: payload.notes || `Assigned by ${actor} (${role})`
                }
              ]
            };
          }
          return a;
        });

        // Ensure assigned employee exists in registered employees
        if (assignee && email) {
          const exists = this.state.registeredEmployees.some(e => e.email.toLowerCase() === email);
          if (!exists) {
            this.state.registeredEmployees.push({
              id: `USR-EMP-${Date.now().toString().slice(-4)}`,
              name: assignee,
              email: email,
              password: "Employee@123",
              department: payload.department || "General",
              category: "Engineering",
              subBranch: payload.department || "General",
              role: "Employee",
              title: "Faculty / Staff Member",
              avatar: assignee.charAt(0).toUpperCase() || "E",
              permissions: ["tickets:create", "assets:view_assigned", "loaners:request"]
            });
          }
        }

        this.touch();
        break;
      }

      case "ASSET_UNASSIGN": {
        const targetId = String(payload.id || payload.tag || "");
        this.state.assets = this.state.assets.map(a => {
          if (a.id === targetId || a.tag === targetId) {
            return {
              ...a,
              status: "Available",
              assignedTo: "",
              assignedUser: "Unassigned",
              assignedEmail: "",
              employeeEmail: "",
              timeline: [
                ...(a.timeline || []),
                {
                  date: new Date().toISOString().slice(0, 10),
                  event: "Returned to Available Pool",
                  notes: `Unassigned by ${actor} (${role})`
                }
              ]
            };
          }
          return a;
        });
        this.touch();
        break;
      }

      case "ASSET_ADD": {
        const newItems = Array.isArray(payload.assets) ? payload.assets : (payload.asset ? [payload.asset] : []);
        if (newItems.length > 0) {
          // Prevent duplicates by id
          const existingIds = new Set(this.state.assets.map(a => a.id));
          const toAdd = newItems.filter(item => !existingIds.has(item.id));
          this.state.assets = [...toAdd, ...this.state.assets];
          this.touch();
        }
        break;
      }

      case "ASSET_UPDATE": {
        const targetId = String(payload.id || payload.tag || "");
        const updates = payload.updates || payload;
        this.state.assets = this.state.assets.map(a => {
          if (a.id === targetId || a.tag === targetId) {
            return { ...a, ...updates };
          }
          return a;
        });
        this.touch();
        break;
      }

      case "EMPLOYEE_REGISTER": {
        const emp = payload.employee || payload;
        const cleanEmail = (emp.email || "").trim().toLowerCase();
        if (cleanEmail) {
          const idx = this.state.registeredEmployees.findIndex(e => e.email.toLowerCase() === cleanEmail);
          if (idx >= 0) {
            this.state.registeredEmployees[idx] = { ...this.state.registeredEmployees[idx], ...emp };
          } else {
            this.state.registeredEmployees.unshift(emp);
          }
          this.touch();
        }
        break;
      }

      case "SUBSCRIPTION_ADD": {
        const sub = payload.subscription || payload;
        if (sub && sub.id) {
          this.state.subscriptions = [sub, ...this.state.subscriptions.filter(s => s.id !== sub.id)];
          this.touch();
        }
        break;
      }

      case "SUBSCRIPTION_UPDATE": {
        const targetId = String(payload.id || "");
        const updates = payload.updates || payload;
        this.state.subscriptions = this.state.subscriptions.map(s => {
          if (s.id === targetId) return { ...s, ...updates };
          return s;
        });
        this.touch();
        break;
      }

      case "SUBSCRIPTION_DELETE": {
        const targetId = String(payload.id || "");
        this.state.subscriptions = this.state.subscriptions.filter(s => s.id !== targetId);
        this.touch();
        break;
      }

      case "BULK_SYNC": {
        if (Array.isArray(payload.assets)) {
          this.state.assets = payload.assets;
        }
        if (Array.isArray(payload.subscriptions)) {
          this.state.subscriptions = payload.subscriptions;
        }
        if (Array.isArray(payload.registeredEmployees)) {
          this.state.registeredEmployees = payload.registeredEmployees;
        }
        this.touch();
        break;
      }

      default:
        break;
    }

    return {
      success: true,
      lastModified: this.state.lastModified,
      version: this.state.version
    };
  }

  // --- ASSET HELPERS FOR REST ROUTES ---
  getAssets(user = null, filter = {}) {
    let list = [...this.state.assets];

    // Strictly scope Employee role to only their assigned equipment
    if (user && user.role === "Employee") {
      const uName = (user.name || "").toLowerCase().trim();
      const uEmail = (user.email || "").toLowerCase().trim();
      list = list.filter(a => {
        if (a.status !== "Assigned") return false;
        const aTo = (a.assignedTo || a.assignee || "").toLowerCase().trim();
        const aUser = (a.assignedUser || "").toLowerCase().trim();
        const aEmail = (a.assignedEmail || a.employeeEmail || "").toLowerCase().trim();
        const firstNameU = uName ? uName.split(" ")[0] : "";
        const firstNameA = (aTo || aUser) ? (aTo || aUser).split(" ")[0] : "";

        const matchesEmail = Boolean(uEmail && aEmail === uEmail);
        const matchesName = Boolean(
          uName && (
            aTo === uName ||
            aUser === uName ||
            (aTo && aTo !== "unassigned" && (aTo.includes(uName) || uName.includes(aTo))) ||
            (aUser && aUser !== "unassigned" && (aUser.includes(uName) || uName.includes(aUser))) ||
            (firstNameU.length > 2 && firstNameU === firstNameA)
          )
        );

        return matchesEmail || matchesName;
      });
    }

    if (filter.status) {
      list = list.filter(a => a.status?.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.department) {
      list = list.filter(a => (a.department || a.subBranch)?.toLowerCase() === filter.department.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.id?.toLowerCase().includes(q) ||
        a.tag?.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q) ||
        a.assignedTo?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.labRoom?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getAssetById(id) {
    const target = String(id || "").toLowerCase();
    return this.state.assets.find(a => 
      (a.id && a.id.toLowerCase() === target) ||
      (a.tag && a.tag.toLowerCase() === target) ||
      (a.serialNumber && a.serialNumber.toLowerCase() === target)
    ) || null;
  }

  // --- EMPLOYEE HELPERS FOR REST ROUTES ---
  getEmployees() {
    return this.state.registeredEmployees;
  }

  findEmployee(email) {
    const clean = String(email || "").toLowerCase().trim();
    return this.state.registeredEmployees.find(e => e.email.toLowerCase() === clean) || null;
  }

  // --- SUBSCRIPTIONS HELPERS ---
  getSubscriptions(filter = {}) {
    let list = [...this.state.subscriptions];
    if (filter.status) {
      list = list.filter(s => s.status?.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.department) {
      list = list.filter(s => s.department?.toLowerCase() === filter.department.toLowerCase());
    }
    return list;
  }
}

export const syncStore = new SyncStore();
export default syncStore;
