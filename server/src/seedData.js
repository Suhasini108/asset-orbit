import Asset from "./models/Asset.js";
import Subscription from "./models/Subscription.js";
import MaintenanceTicket from "./models/MaintenanceTicket.js";
import Vendor from "./models/Vendor.js";
import User from "./models/User.js";

export async function seedDemoData() {
  // 1. Seed Preset Users
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create([
      {
        name: "Workspace Admin",
        email: "admin@assetorbit.edu",
        password: "Admin@123",
        role: "Admin",
        department: "Central Administration",
        title: "Workspace Administrator",
        permissions: ["all"],
        avatar: "A"
      },
      {
        name: "Kiran V",
        email: "itmanager@assetorbit.edu",
        password: "Manager@123",
        role: "IT Manager",
        department: "IT Operations & Campus Labs",
        title: "IT Operations Lead",
        permissions: ["assets:write", "assets:edit", "subscriptions:write", "subscriptions:edit", "tickets:resolve", "tickets:approve"],
        avatar: "K"
      },
      {
        name: "Vikram Naik",
        email: "employee@assetorbit.edu",
        password: "Employee@123",
        role: "Employee",
        department: "Engineering Labs (CSE / ISE)",
        title: "Faculty Member",
        permissions: ["tickets:create", "assets:view_assigned", "loaners:request"],
        avatar: "V"
      },
      {
        name: "Sneha Rao",
        email: "sneha.rao@college.edu",
        password: "Employee@123",
        role: "Employee",
        department: "ISE",
        title: "Assistant Professor",
        permissions: ["tickets:create", "assets:view_assigned", "loaners:request"],
        avatar: "S"
      }
    ]);
  }

  // 2. Seed Vendors
  const vendorCount = await Vendor.countDocuments();
  if (vendorCount === 0) {
    await Vendor.create([
      { name: "Dell Technologies", contactPerson: "Arun Bhat", email: "arun@dell-edu.com", phone: "+91 98450 12345", rating: 4.8, category: "Desktops, Laptops & Servers" },
      { name: "HP Commercial Systems", contactPerson: "Pooja Nair", email: "support@hp-partners.com", phone: "+91 98450 54321", rating: 4.6, category: "Printers & Scanners" },
      { name: "Lenovo Enterprise India", contactPerson: "Karthik Rao", email: "karthik@lenovo.com", phone: "+91 98450 66778", rating: 4.7, category: "Workstations & ThinkCentres" },
      { name: "Schneider Electric / APC India", contactPerson: "Manoj Kumar", email: "apc.support@schneider.com", phone: "+91 98450 44332", rating: 4.9, category: "Power & UPS Systems" },
      { name: "MathWorks India Private Limited", contactPerson: "Campus Licensing Desk", email: "academic-sales@mathworks.in", phone: "+91 80 6632 6000", rating: 5.0, category: "Academic Software & Campus Licenses" }
    ]);
  }

  // 3. Seed Subscriptions
  const subCount = await Subscription.countDocuments();
  if (subCount === 0) {
    const renDate = new Date();
    renDate.setDate(renDate.getDate() + 83); // Within 90-day renewal window
    await Subscription.create({
      name: "MATLAB Software campuswide suite R2025B",
      category: "Engineering & Technical Computing",
      vendor: "MathWorks",
      plan: "Campuswide Suite R2025B",
      cost: 1259741,
      billing: "Yearly",
      billingCycle: "Yearly",
      renewal: renDate,
      renewalDate: renDate,
      status: "Active",
      paid: "yes",
      cancelled: "No",
      owner: "ISE Department HOD",
      department: "ISE",
      seats: 1000,
      assignedSeats: 250,
      autoRenew: true,
      previousCost: 1259741,
      notes: "Campuswide Suite R2025B for all students, labs, and faculty in ISE Department."
    });
  }

  // 4. Seed ISE Inventory Assets
  const assetCount = await Asset.countDocuments();
  if (assetCount === 0) {
    const iseAssets = [
      { tag: "AST-ISE-001", name: 'Lenovo Thinkcentre M72e (i3) with 18.5" LED Monitor', type: "Desktop", quantity: 30, workingUnits: 28, faultyUnits: 2, repaired: "Yes", healthStatus: "2 Desktops are not working", value: 38500, cost: 38500, location: "ISE Department Block Room 204", labRoom: "ISE Lab 1", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-002", name: 'Lenovo Thinkcentre M73e(i5) with 18.5" LED Monitor', type: "Desktop", quantity: 10, workingUnits: 8, faultyUnits: 2, repaired: "Yes", healthStatus: "2 Desktops are not working", value: 44000, cost: 44000, location: "ISE Department Block Room 204", labRoom: "ISE Lab 1", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-003", name: 'Lenovo thinkcentre Desktop E73 (i7) with 18.5" LED Monitor', type: "Desktop", quantity: 2, workingUnits: 2, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 58000, cost: 58000, location: "ISE Faculty Cabins", labRoom: "HOD Cabin", status: "Assigned", assignee: "Vikram Naik", employeeEmail: "employee@assetorbit.edu", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-004", name: 'Lenovo thinkcentre Desktop E73 (i5) with 18.5" LED Monitor', type: "Desktop", quantity: 17, workingUnits: 16, faultyUnits: 1, repaired: "No", healthStatus: "One desktop is not working", value: 46000, cost: 46000, location: "ISE Department Block Room 205", labRoom: "ISE Lab 2", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-005", name: 'Lenovo Desktop S510 (i5) 6th Gen with 19.5" LED Monitor', type: "Desktop", quantity: 3, workingUnits: 3, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 49000, cost: 49000, location: "ISE Department Block Room 205", labRoom: "ISE Lab 2", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-006", name: 'DELL VOSTRO 3471 Desktops (i7)/8 GB/ 1 TB with 18.5" LED Monitor', type: "Desktop", quantity: 4, workingUnits: 4, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 62000, cost: 62000, location: "ISE Faculty Cabins", labRoom: "Faculty Workstations", status: "Assigned", assignee: "Sneha Rao", employeeEmail: "sneha.rao@college.edu", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-007", name: 'DELL Optiplex 3080 x CTO(i5)/16 GB/ 512 M2 with 18.5" LED Monitor', type: "Desktop", quantity: 20, workingUnits: 20, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 54500, cost: 54500, location: "ISE Department Block Room 204", labRoom: "ISE Lab 1", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-008", name: 'DELL Optiplex 3080 (i5) WIN Pro/16 GB/ 1 TB with 18.5" LED Monitor', type: "Desktop", quantity: 2, workingUnits: 2, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 56000, cost: 56000, location: "ISE Department Block Room 204", labRoom: "ISE Lab 1", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-009", name: 'Lenovo IdeaCenter 390SM0089IN (i5) 8GB/256 M.2 1TB HDD/', type: "Desktop", quantity: 20, workingUnits: 20, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 51000, cost: 51000, location: "ISE Department Block Room 205", labRoom: "ISE Lab 2", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-010", name: 'Lenovo Mainstream Ideacentre 307IRBB Intel core (i5) 13400 8GB DDR4/512 GB SSD.', type: "Desktop", quantity: 6, workingUnits: 6, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 57500, cost: 57500, location: "ISE Department Research Lab", labRoom: "Research Center", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-011", name: 'Dell Precision 3680 Tower CTO (i7) 32GB RAM/256 NVME/2TB SATA HDD', type: "Desktop", quantity: 7, workingUnits: 7, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 89000, cost: 89000, location: "ISE High Performance Lab", labRoom: "AI & Data Lab", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-012", name: 'DELL Server POWER EDGE T130 Intel Xeon E3-1220/8/1 TB with 18.5" LED Monitor', type: "Server", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 145000, cost: 145000, location: "ISE Department Server Room 201", labRoom: "Server Bay", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-013", name: 'Dell PowerEdge T150 Server 16GB RAM/6TB HDD with 18.5" LED Monitor', type: "Server", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 185000, cost: 185000, location: "ISE Department Server Room 201", labRoom: "Server Bay", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-014", name: "Laser Printer HP make P1008", type: "Printer", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 12500, cost: 12500, location: "ISE Faculty Office", labRoom: "Faculty Workroom", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-015", name: "Laser Color Printer HP Make CP1025 (Colour)", type: "Printer", quantity: 1, workingUnits: 0, faultyUnits: 1, repaired: "No", healthStatus: "Not Working", value: 24000, cost: 24000, location: "ISE Department Office", labRoom: "Admin Bay", status: "Faulty", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-016", name: "Laserjet Pro M203dn HP Make (White)", type: "Printer", quantity: 1, workingUnits: 0, faultyUnits: 1, repaired: "No", healthStatus: "Not Working", value: 18500, cost: 18500, location: "ISE Lab 1 Office", labRoom: "Staff Bench", status: "In Repair", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-017", name: "Laserjet HP Printer M1005", type: "Printer", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 21000, cost: 21000, location: "ISE HOD Chamber", labRoom: "HOD Office", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-018", name: "Scanner : HP Scanjet 5590 Digital Flatbed Scanner", type: "Scanner", quantity: 1, workingUnits: 0, faultyUnits: 1, repaired: "No", healthStatus: "Not Working", value: 28000, cost: 28000, location: "ISE Department Library Room", labRoom: "Resource Bay", status: "Faulty", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-019", name: "AcerAspire One Happy 2 Netbook laptop", type: "Laptop", quantity: 3, workingUnits: 0, faultyUnits: 3, repaired: "No", healthStatus: "Not Working", value: 22000, cost: 22000, location: "ISE Storage Bay", labRoom: "Alumni Archive", status: "Retired", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-020", name: "Dell Vostro 3568 - i5 Laptop", type: "Laptop", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 52000, cost: 52000, location: "ISE Faculty Lab", labRoom: "Staff Room", status: "Assigned", assignee: "Vikram Naik", employeeEmail: "employee@assetorbit.edu", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-021", name: "Lenovo Laptop Ideapad slim core i5-12OU 16GB RAM/512GB SSD", type: "Laptop", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 59500, cost: 59500, location: "ISE Project Lab", labRoom: "Faculty Workroom", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-022", name: "LCD Projector (EPSON EB905) - Unit A", type: "LCD Projector", quantity: 1, workingUnits: 0, faultyUnits: 1, repaired: "No", healthStatus: "Not Working", value: 36000, cost: 36000, location: "ISE Seminar Hall", labRoom: "Seminar Hall", status: "Faulty", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-023", name: "LCD Projector (EPSON EB905) - Unit B", type: "LCD Projector", quantity: 1, workingUnits: 0, faultyUnits: 1, repaired: "No", healthStatus: "Not Working", value: 36000, cost: 36000, location: "ISE Class Room 204", labRoom: "Lecture Bay", status: "Faulty", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-024", name: "EPSON Data Projector (EB-S03)", type: "LCD Projector", quantity: 4, workingUnits: 4, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 32000, cost: 32000, location: "ISE Classrooms 201-204", labRoom: "Classrooms", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-025", name: "LCD Projector (DELL CDWYM)", type: "LCD Projector", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 34000, cost: 34000, location: "ISE Project Presentation Room", labRoom: "Auditorium", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-026", name: "LCD Projector EPSON EB-S41", type: "LCD Projector", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 35500, cost: 35500, location: "ISE Lab 1 Overhead", labRoom: "ISE Lab 1", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-027", name: "LED Projector (EPSON EB X49 XGA)", type: "LCD Projector", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 39000, cost: 39000, location: "ISE Lab 2 Overhead", labRoom: "ISE Lab 2", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-028", name: "LED Projector (EPSON EB X49 EPIL)", type: "LCD Projector", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 39000, cost: 39000, location: "ISE Faculty Discussion Bay", labRoom: "Meeting Bay", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-029", name: "LED Projector (EPSON EBW 49)", type: "LCD Projector", quantity: 1, workingUnits: 1, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 41000, cost: 41000, location: "ISE Conference Room", labRoom: "Boardroom", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-030", name: "UPS- Make : APC 550 VA", type: "UPS", quantity: 15, workingUnits: 0, faultyUnits: 15, repaired: "No", healthStatus: "Not Working", value: 4200, cost: 4200, location: "ISE Department Power Storage", labRoom: "Power Bay", status: "Retired", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-031", name: "UPS- Make : Emerson Liebert BX600 VA", type: "UPS", quantity: 8, workingUnits: 0, faultyUnits: 8, repaired: "No", healthStatus: "Not Working", value: 4500, cost: 4500, location: "ISE Department Power Storage", labRoom: "Power Bay", status: "Retired", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-032", name: "UPS- Make : ITON Emerson Liebert CX600 VA", type: "UPS", quantity: 4, workingUnits: 0, faultyUnits: 4, repaired: "No", healthStatus: "Not Working", value: 4600, cost: 4600, location: "ISE Department Power Storage", labRoom: "Power Bay", status: "Retired", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-033", name: "UPS- Make : APC Backups 600 VA", type: "UPS", quantity: 2, workingUnits: 0, faultyUnits: 2, repaired: "No", healthStatus: "Not Working", value: 4400, cost: 4400, location: "ISE Department Power Storage", labRoom: "Power Bay", status: "Retired", condition: "Needs Repair", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-034", name: "APC make UPS – Capacity : 1.5 KVA Model No. BR1500-IN", type: "UPS", quantity: 4, workingUnits: 4, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 16500, cost: 16500, location: "ISE Lab 1 Backup Rack", labRoom: "ISE Lab 1", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-035", name: "APC make UPS – Capacity : 1.5 KVA Model No. BR1500G", type: "UPS", quantity: 5, workingUnits: 5, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 17500, cost: 17500, location: "ISE Lab 2 Backup Rack", labRoom: "ISE Lab 2", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-036", name: "UPS- Make : APC Capacity 700 VA", type: "UPS", quantity: 4, workingUnits: 4, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 5800, cost: 5800, location: "ISE Faculty Cabins", labRoom: "Workroom", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-037", name: "UPS- Make : APC Backups 600 VA (Active)", type: "UPS", quantity: 2, workingUnits: 2, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 4600, cost: 4600, location: "ISE Department Office", labRoom: "Office", status: "Available", department: "ISE", subBranch: "ISE" },
      { tag: "AST-ISE-038", name: "UPS - Make : APC – 10 KVA Online Rack", type: "UPS", quantity: 4, workingUnits: 4, faultyUnits: 0, repaired: "No", healthStatus: "Working", value: 125000, cost: 125000, location: "ISE Department Server Room 201", labRoom: "Main Server Bay", status: "Available", department: "ISE", subBranch: "ISE" }
    ];
    await Asset.insertMany(iseAssets);
  }

  return "Seeding completed: Real ISE inventory, MATLAB subscription, and users initialized.";
}
