// CSV Templates and Utilities for AssetOrbit

export const CSV_TEMPLATES = {
  assets: `Name,SerialNumber,Category,SubBranch,LabRoom,BenchNumber,Vendor,PurchaseDate,Cost,WarrantyExpiry,Location,Status,AssignedUser,CPU,RAM,Storage,OS
Dell OptiPlex 7090,OPT-CSE-7091,Engineering,CSE,CSE Lab 1 (Turing),Bench 01,Dell India,2023-08-15,850,2026-08-15,Main Academic Block 3rd Floor,Assigned,Prof. Rajesh Kumar / Batch A,Intel Core i7-11700,16GB DDR4,512GB NVMe SSD,Ubuntu 22.04 LTS
HP ProDesk 600 G6,HPD-ISE-6002,Engineering,ISE,ISE Lab 1 (Lovelace),Bench 04,HP Commercial,2022-11-20,780,2025-11-20,IT Block 2nd Floor,Assigned,Dr. Ananya Sharma / Batch B,Intel Core i5-10500,16GB DDR4,512GB SSD,Windows 11 Pro
Lenovo ThinkCentre M70q,LNV-ECE-7003,Engineering,ECE,ECE DSP & VLSI Lab,Bench 12,Lenovo India,2023-01-10,920,2026-01-10,Electronics Wing 1st Floor,Assigned,DSP Batch 2,Intel Core i7-12700T,32GB DDR4,1TB NVMe SSD,Ubuntu 22.04 LTS
Epson EB-X49 Ceiling Projector,EPS-CSE-PRJ1,Engineering,CSE,CSE Seminar Hall,Ceiling Mount,Epson India,2023-05-12,540,2025-05-12,Main Block Room 305,Available,Department Shared,N/A,N/A,N/A,Embedded Firmware
Cisco Catalyst 2960-X Switch,CSCO-SW-01,Operations,Networking,Server Room,Rack 02,Cisco Systems,2021-09-01,1650,2026-09-01,Data Center B1,Assigned,Network Admin Team,Cisco APM,512MB RAM,128MB Flash,Cisco IOS 15.2`,

  subscriptions: `Name,Vendor,Category,BillingCycle,Cost,TotalSeats,AssignedSeats,RenewalDate,AutoRenew,Department,Owner
MATLAB Campus-Wide Suite,MathWorks,Engineering,Yearly,13700,500,430,2027-04-15,true,Engineering,Dr. Rajesh ECE / All Depts
Microsoft 365 Education A5,Microsoft,Office,Yearly,18500,2000,1850,2027-06-30,true,Administration,IT Director
JetBrains Academic All Products Pack,JetBrains,Engineering,Yearly,4200,150,112,2027-03-20,true,Engineering (CSE & ISE),Prof. Ananya ISE
Cadence EDA University Bundle,Cadence Design,Engineering,Yearly,9800,60,54,2027-08-10,false,Engineering (ECE),Dr. K. Swaminathan ECE
SolidWorks Education Edition,Dassault Systemes,Engineering,Yearly,7500,80,62,2027-05-01,true,Engineering (Mechanical),Prof. Ramesh Mech
Turnitin Academic Plagiarism Suite,Turnitin,R&D,Yearly,3600,100,82,2027-09-15,true,R&D / Dean Academic,Dean Academic
Zoom Pro Campus License,Zoom Video,Communication,Yearly,2400,20,18,2027-02-15,true,Administration,Registrar Office`,

  vendors: `Name,Category,ContactPerson,Email,Phone,Rating,ActiveContracts,Address
Dell Technologies India,Hardware OEM,Rahul Verma,rahul.verma@dell-partner.in,+91-80-67890123,4.8,3,Bagmane Tech Park Bangalore
HP Enterprise & Commercial,Hardware OEM,Sumanth Hegde,support@hp-commercial.in,+91-80-23456789,4.5,2,Whitefield Main Road Bangalore
MathWorks India,Software,Pooja Nair,education@mathworks.in,+91-80-66320000,4.9,1,Salarpuria Windsor Ulsoor Bangalore
Cisco Systems,Networking,Amit Saxena,enterprise@cisco-partner.com,+91-22-40001234,4.7,2,BKC Mumbai
Microsoft Education,Cloud & Software,Deepak Rao,edu-licensing@microsoft.com,+91-124-4567890,4.6,2,DLF Cyber City Gurugram`,

  users: `Name,Email,Role,Department,SubBranch,EmployeeId
Suhasini R (Super Admin),admin@assetorbit.edu,Super Admin,Administration,IT Center,AO-ADM-01
Prof. Rajesh Kumar (HOD CSE),hod.cse@college.edu,Department Head,Engineering,CSE,FAC-CSE-01
Dr. Ananya Sharma (HOD ISE),hod.ise@college.edu,Department Head,Engineering,ISE,FAC-ISE-01
Dr. K. Swaminathan (HOD ECE),hod.ece@college.edu,Department Head,Engineering,ECE,FAC-ECE-01
Kiran V (System Admin / Tech),kiran.tech@college.edu,Admin/IT Manager,Operations,IT Support,TECH-SYS-09
Vikram Naik (Lab Assistant),vikram.lab@college.edu,Employee,Engineering,CSE Lab 1,STAFF-LAB-04
Priya Desai (Internal Auditor),auditor@assetorbit.edu,Auditor,Finance,Audit,AUD-FIN-02`
};

export function downloadTemplate(type) {
  const content = CSV_TEMPLATES[type];
  if (!content) return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AssetOrbit_${type}_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCsvText(text) {
  const lines = text.trim().split(/\r\n|\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const values = parseCsvLine(rawLine);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    rows.push(rowObj);
  }
  return { headers, rows };
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function exportToCsv(filename, headers, data) {
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  data.forEach(row => {
    const values = headers.map(header => {
      let val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  });
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
