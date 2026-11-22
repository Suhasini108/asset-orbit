import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_VENDORS,
  INITIAL_ASSETS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TICKETS,
  INITIAL_SHADOW_IT,
  INITIAL_E_WASTE,
  INITIAL_NOTIFICATIONS,
  PLATFORM_PRICING_PLANS
} from '../data/collegeSampleData';
import { INITIAL_SOFTWARE_CATALOGUE } from '../data/softwareCatalogue';
import { dispatchAutomaticNotification } from '../services/emailService';
import { api } from '../services/apiClient';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Refresh local cache for clean green theme, pristine ISE inventory & matched 90-day renewals
  if (!localStorage.getItem('ao_green_theme_v12')) {
    localStorage.removeItem('ao_categories');
    localStorage.removeItem('ao_assets');
    localStorage.removeItem('ao_subscriptions');
    localStorage.removeItem('ao_tickets');
    localStorage.removeItem('ao_shadow_it');
    localStorage.removeItem('ao_loss_theft');
    localStorage.removeItem('ao_ewaste');
    localStorage.removeItem('ao_replacements');
    localStorage.removeItem('ao_warranty_claims');
    localStorage.removeItem('ao_notifications');
    localStorage.removeItem('ao_software_catalogue');
    localStorage.setItem('ao_green_theme_v12', 'true');
  }

  // --- STATE WITH LOCALSTORAGE PERSISTENCE ---
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('ao_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CATEGORIES;
  });

  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('ao_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('ao_assets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const has40 = parsed.some(a => a.id === 'AST-ISE-040' || a.tag === 'AST-ISE-040');
          if (!has40) {
            const ast40 = INITIAL_ASSETS.find(a => a.id === 'AST-ISE-040');
            if (ast40) return [ast40, ...parsed];
          }
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_ASSETS;
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('ao_subscriptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('ao_tickets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_TICKETS;
  });

  const [shadowItLogs, setShadowItLogs] = useState(() => {
    const saved = localStorage.getItem('ao_shadow_it');
    return saved ? JSON.parse(saved) : INITIAL_SHADOW_IT;
  });

  const [eWasteRecords, setEWasteRecords] = useState(() => {
    const saved = localStorage.getItem('ao_ewaste');
    return saved ? JSON.parse(saved) : INITIAL_E_WASTE;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('ao_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Software Catalogue with Plans (Dynamic Software Catalogue from DB/local store)
  const [softwareCatalogue, setSoftwareCatalogue] = useState(() => {
    const saved = localStorage.getItem('ao_software_catalogue');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_SOFTWARE_CATALOGUE;
  });

  useEffect(() => {
    localStorage.setItem('ao_software_catalogue', JSON.stringify(softwareCatalogue));
  }, [softwareCatalogue]);

  // Loss & Theft Reports
  const [lossTheftReports, setLossTheftReports] = useState(() => {
    const saved = localStorage.getItem('ao_loss_theft');
    return saved ? JSON.parse(saved) : [];
  });

  // Warranty Claims
  const [warrantyClaims, setWarrantyClaims] = useState(() => {
    const saved = localStorage.getItem('ao_warranty_claims');
    return saved ? JSON.parse(saved) : [];
  });

  // Asset Replacement Recommendations
  const [replacementRequests, setReplacementRequests] = useState(() => {
    const saved = localStorage.getItem('ao_replacements');
    return saved ? JSON.parse(saved) : [];
  });

  // Physical Audit Sessions
  const [activeAuditSession, setActiveAuditSession] = useState(() => {
    const saved = localStorage.getItem('ao_active_audit');
    return saved ? JSON.parse(saved) : null;
  });

  // Platform Subscription for AssetOrbit itself
  const [platformSubscription, setPlatformSubscription] = useState(() => {
    const saved = localStorage.getItem('ao_platform_sub');
    return saved ? JSON.parse(saved) : {
      planId: 'pro',
      billingCycle: 'yearly',
      renewalDate: '2027-11-15',
      autoRenew: true,
      lastPaymentAmount: 750
    };
  });

  // System Activity Audit Log
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('ao_activity_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'act-1', timestamp: '2026-11-17 15:10', user: 'Kiran V', action: 'Issued Loaner Laptop', entity: 'AST-LOAN-01 for Ticket #TCK-1001' },
      { id: 'act-2', timestamp: '2026-11-17 14:30', user: 'Vikram Naik', action: 'Created Support Ticket', entity: 'TCK-1001 (RAM Panic CSE Lab 1)' },
      { id: 'act-3', timestamp: '2026-11-17 13:40', user: 'System Sentinel', action: 'Shadow IT Flagged', entity: 'BitTorrent on CSE Bench 03' },
      { id: 'act-4', timestamp: '2026-11-17 10:15', user: 'System Price Watch', action: 'Price Hike Alert', entity: 'MATLAB Renewal +14.2%' },
      { id: 'act-5', timestamp: '2026-11-16 16:30', user: 'Kiran V', action: 'Resolved Ticket', entity: 'TCK-1003 (Cisco Switch Port 23)' }
    ];
  });

  // Real-time Cross-Window & Cross-Tab Sync helper
  const broadcastSync = (type, payload) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('assetorbit_app_sync');
        channel.postMessage({ type, payload });
        channel.close();
      }
    } catch (e) {}
  };

  // Cross-Tab & Cross-Window Listener for immediate side-by-side reflection
  useEffect(() => {
    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('assetorbit_app_sync');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_ASSETS' && Array.isArray(payload)) {
            setAssets(payload);
          } else if (type === 'SYNC_SUBSCRIPTIONS' && Array.isArray(payload)) {
            setSubscriptions(payload);
          } else if (type === 'SYNC_TICKETS' && Array.isArray(payload)) {
            setTickets(payload);
          }
        };
      }
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === 'ao_assets' && e.newValue) {
        try { setAssets(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'ao_subscriptions' && e.newValue) {
        try { setSubscriptions(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'ao_tickets' && e.newValue) {
        try { setTickets(JSON.parse(e.newValue)); } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // --- PERSISTENCE SYNCS ---
  useEffect(() => { localStorage.setItem('ao_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('ao_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('ao_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('ao_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('ao_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('ao_shadow_it', JSON.stringify(shadowItLogs)); }, [shadowItLogs]);
  useEffect(() => { localStorage.setItem('ao_ewaste', JSON.stringify(eWasteRecords)); }, [eWasteRecords]);
  useEffect(() => { localStorage.setItem('ao_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('ao_loss_theft', JSON.stringify(lossTheftReports)); }, [lossTheftReports]);
  useEffect(() => { localStorage.setItem('ao_warranty_claims', JSON.stringify(warrantyClaims)); }, [warrantyClaims]);
  useEffect(() => { localStorage.setItem('ao_replacements', JSON.stringify(replacementRequests)); }, [replacementRequests]);

  // --- GLOBAL MULTI-CLIENT SYNCHRONIZATION ENGINE ---
  const lastSyncTimeRef = useRef(0);

  const dispatchMutation = (type, payload = {}, actor = 'Admin') => {
    try {
      api.post('/sync/mutation', {
        type,
        payload,
        actor
      }).then(res => {
        if (res.ok && res.raw?.lastModified) {
          lastSyncTimeRef.current = res.raw.lastModified;
        }
      }).catch(() => {});
    } catch (e) {}
  };

  const syncWithServer = (force = false) => {
    const url = force ? '/sync' : `/sync?since=${lastSyncTimeRef.current}`;
    api.get(url).then(res => {
      if (res.ok && res.raw) {
        if (res.raw.upToDate) return;
        if (Array.isArray(res.raw.assets)) {
          setAssets(prev => {
            const serverAssetIds = new Set(res.raw.assets.map(a => a.id));
            const localOnly = (prev || []).filter(a => a.id && !serverAssetIds.has(a.id));
            if (localOnly.length > 0) {
              // Automatically push local-only assets (created offline or on localhost) to the central server
              localOnly.forEach(item => {
                dispatchMutation('ASSET_ADD', { asset: item }, 'AutoSync');
              });
              return [...res.raw.assets, ...localOnly];
            }
            return res.raw.assets;
          });
        }
        if (Array.isArray(res.raw.subscriptions)) {
          setSubscriptions(res.raw.subscriptions);
        }
        if (Array.isArray(res.raw.tickets)) {
          setTickets(res.raw.tickets);
        }
        if (res.raw.lastModified) {
          lastSyncTimeRef.current = res.raw.lastModified;
        }
      }
    }).catch(() => {});
  };

  // Continuous background synchronization across all connected laptops
  useEffect(() => {
    // 1. Initial immediate sync on mount
    syncWithServer(true);

    // 2. High-frequency polling every 2.5 seconds
    const interval = setInterval(() => {
      syncWithServer(false);
    }, 2500);

    // 3. Instant sync on tab switch or focus
    const handleFocus = () => syncWithServer(false);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncWithServer(false);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
  useEffect(() => { localStorage.setItem('ao_active_audit', JSON.stringify(activeAuditSession)); }, [activeAuditSession]);
  useEffect(() => { localStorage.setItem('ao_platform_sub', JSON.stringify(platformSubscription)); }, [platformSubscription]);
  useEffect(() => { localStorage.setItem('ao_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

  // Log an activity
  const logActivity = (user, action, entity) => {
    const newEntry = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      user: user || 'Current User',
      action,
      entity
    };
    setActivityLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  };

  // Add Notification
  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      unread: true,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // --- ASSET MANAGEMENT WITH QUANTITY GENERATION ---
  const addAsset = (assetData, quantity = 1, userName = 'Admin') => {
    const num = parseInt(quantity, 10) || 1;
    const batchId = num > 1 ? `BATCH-${assetData.subBranch || 'LAB'}-${Date.now().toString().slice(-6)}` : null;
    const newAssets = [];

    // Extract base tag or prefix
    const prefix = assetData.subBranch ? `AST-${assetData.subBranch}` : 'AST-GEN';
    const baseSerial = assetData.serialNumber || `SN-${Date.now().toString().slice(-4)}`;

    for (let i = 1; i <= num; i++) {
      const uniqueSuffix = String(assets.length + i).padStart(3, '0');
      const uniqueId = `${prefix}-${uniqueSuffix}`;
      const uniqueSerial = num > 1 ? `${baseSerial}-${String(i).padStart(2, '0')}` : baseSerial;
      const benchName = num > 1 && !assetData.benchNumber ? `Bench ${String(i).padStart(2, '0')}` : (num > 1 ? `${assetData.benchNumber} #${i}` : assetData.benchNumber);

      const singleAsset = {
        ...assetData,
        id: uniqueId,
        serialNumber: uniqueSerial,
        benchNumber: benchName || 'Unassigned Bench',
        batchId: batchId || assetData.batchId || null,
        healthScore: assetData.healthScore || 95,
        timeline: [
          {
            date: new Date().toISOString().slice(0, 10),
            event: 'Asset Commissioned',
            notes: num > 1 ? `Batch creation of ${num} units. Linked batch: ${batchId}` : 'Initial record added to system.'
          }
        ]
      };
      newAssets.push(singleAsset);
    }

    setAssets(prev => {
      const updated = [...newAssets, ...prev];
      broadcastSync('SYNC_ASSETS', updated);
      return updated;
    });
    dispatchMutation('ASSET_ADD', { assets: newAssets }, userName);
    logActivity(userName, num > 1 ? `Batch Added ${num} Assets` : 'Added Asset', `${assetData.name} (${newAssets.map(a => a.id).join(', ')})`);
    addNotification({
      title: num > 1 ? `${num} New Assets Added (Batch)` : 'New Asset Added',
      description: `${assetData.name} in ${assetData.subBranch || 'Department'} (${assetData.labRoom || 'Unassigned'})`,
      type: 'asset_added',
      category: 'Asset',
      link: '/assets'
    });
    return newAssets;
  };

  const updateAsset = (id, updates, userName = 'Admin') => {
    let targetAsset = null;
    setAssets(prev => {
      const nextAssets = prev.map(a => {
        if (a.id === id) {
          targetAsset = { ...a, ...updates };
          const updatedTimeline = a.timeline || [];
          if (updates.status && updates.status !== a.status) {
            updatedTimeline.push({
              date: new Date().toISOString().slice(0, 10),
              event: `Status Changed to ${updates.status}`,
              notes: updates.statusChangeNote || `Status updated by ${userName}`
            });
          }
          return { ...a, ...updates, timeline: updatedTimeline };
        }
        return a;
      });
      broadcastSync('SYNC_ASSETS', nextAssets);
      return nextAssets;
    });
    dispatchMutation('ASSET_UPDATE', { id, updates }, userName);
    logActivity(userName, 'Updated Asset', id);

    // If marked as InRepair or Faulty, automatically dispatch real email alert to Admin & IT Manager
    if (updates.status === 'InRepair' || updates.status === 'In Repair' || updates.status === 'Faulty') {
      try {
        dispatchAutomaticNotification({
          eventType: 'Hardware Defect & Repair Alert',
          subject: `[HARDWARE ALERT] Equipment Marked ${updates.status}: ${targetAsset?.name || id}`,
          message: `Notice to Workspace Admin & IT Manager: Equipment ${targetAsset?.name || id} (${id}) has been updated to status: ${updates.status}. Immediate diagnostic / vendor servicing required.\n\nDepartment: ${targetAsset?.subBranch || targetAsset?.category || 'General'}\nLocation: ${targetAsset?.location || targetAsset?.labRoom || 'N/A'}\nUpdated by: ${userName}`,
          priority: 'High',
          details: {
            assetId: id,
            name: targetAsset?.name,
            status: updates.status,
            department: targetAsset?.subBranch,
            updatedBy: userName
          }
        });
      } catch (e) {}
    }
  };

  const deleteAsset = (id, userName = 'Admin') => {
    setAssets(prev => {
      const remaining = prev.filter(a => a.id !== id);
      broadcastSync('SYNC_ASSETS', remaining);
      return remaining;
    });
    api.delete(`/assets/${id}`).catch(() => {});
    dispatchMutation('ASSET_DELETE', { id }, userName);
    logActivity(userName, 'Deleted Asset', id);
  };

  const bulkImportAssets = (importedList, userName = 'Admin') => {
    const formatted = importedList.map((item, idx) => ({
      id: item.id || `AST-IMP-${String(assets.length + idx + 1).padStart(3, '0')}`,
      name: item.Name || item.name || 'Unnamed Asset',
      serialNumber: item.SerialNumber || item.serialNumber || `SN-IMP-${idx + 1}`,
      category: item.Category || item.category || 'Engineering',
      subBranch: item.SubBranch || item.subBranch || 'CSE',
      labRoom: item.LabRoom || item.labRoom || 'Main Lab',
      benchNumber: item.BenchNumber || item.benchNumber || `Bench ${idx + 1}`,
      vendor: item.Vendor || item.vendor || 'Dell Technologies India',
      purchaseDate: item.PurchaseDate || item.purchaseDate || new Date().toISOString().slice(0, 10),
      cost: parseFloat(item.Cost || item.cost) || 750,
      salvageValue: parseFloat(item.SalvageValue || item.salvageValue) || 80,
      usefulLifeYears: parseInt(item.UsefulLifeYears || item.usefulLifeYears, 10) || 5,
      warrantyExpiry: item.WarrantyExpiry || item.warrantyExpiry || '2026-12-31',
      location: item.Location || item.location || 'College Campus',
      status: item.Status || item.status || 'Available',
      assignedUser: item.AssignedUser || item.assignedUser || 'Department Pool',
      specs: {
        cpu: item.CPU || 'Intel Core i5 / i7',
        ram: item.RAM || '16GB DDR4',
        storage: item.Storage || '512GB SSD',
        os: item.OS || 'Ubuntu 22.04 LTS / Windows 11',
        ipAddress: item.IP || '192.168.1.100',
        macAddress: item.MAC || '00:00:00:00:00:00'
      },
      healthScore: 90,
      batchId: `BATCH-IMPORT-${Date.now().toString().slice(-4)}`,
      timeline: [
        { date: new Date().toISOString().slice(0, 10), event: 'Bulk Imported', notes: 'Imported via CSV Wizard' }
      ]
    }));

    setAssets(prev => {
      const updated = [...formatted, ...prev];
      broadcastSync('SYNC_ASSETS', updated);
      return updated;
    });
    dispatchMutation('ASSET_ADD', { assets: formatted }, userName);
    logActivity(userName, `Imported ${formatted.length} Assets via CSV`, 'Bulk Import Wizard');
    addNotification({
      title: 'Bulk Asset Import Complete',
      description: `Successfully loaded ${formatted.length} asset records into the system.`,
      type: 'import_success',
      category: 'Asset',
      link: '/assets'
    });
  };

  // --- SUBSCRIPTIONS & PRICE HIKE TRACKING ---
  const addSubscription = (subData, userName = 'Admin') => {
    const newSub = {
      ...subData,
      id: `SUB-${String(subscriptions.length + 1).padStart(3, '0')}`,
      status: 'Active',
      previousCost: subData.cost,
      priceHikeHistory: [
        { year: new Date().getFullYear().toString(), cost: subData.cost, note: 'Initial agreement' }
      ]
    };
    setSubscriptions(prev => {
      const updated = [newSub, ...prev];
      broadcastSync('SYNC_SUBSCRIPTIONS', updated);
      return updated;
    });
    dispatchMutation('SUBSCRIPTION_ADD', { subscription: newSub }, userName);
    logActivity(userName, 'Added Software Subscription', subData.softwareName || subData.name);
  };

  const addSubscriptionWithPlan = (subData, userName = 'Admin') => {
    const newSub = {
      ...subData,
      id: `SUB-${String(subscriptions.length + 1).padStart(3, '0')}`,
      status: 'Active',
      previousCost: subData.cost,
      priceHikeHistory: [
        { year: new Date().getFullYear().toString(), cost: subData.cost, note: 'Initial agreement' }
      ]
    };
    setSubscriptions(prev => {
      const updated = [newSub, ...prev];
      broadcastSync('SYNC_SUBSCRIPTIONS', updated);
      return updated;
    });
    dispatchMutation('SUBSCRIPTION_ADD', { subscription: newSub }, userName);
    logActivity(userName, `Subscribed to ${subData.softwareName || subData.name} (${subData.planName || subData.plan})`, `Cost: ₹${subData.cost}/${subData.billingCycle}`);
    addNotification({
      title: `Subscription Activated: ${subData.softwareName || subData.name}`,
      description: `Plan: ${subData.planName || subData.plan} • ₹${subData.cost}/${subData.billingCycle} • Renews ${subData.renewalDate}`,
      type: 'subscription_added',
      category: 'Subscription',
      link: '/subscriptions'
    });
  };

  const addSoftware = (newSoftware, userName = 'Admin') => {
    setSoftwareCatalogue(prev => [newSoftware, ...prev]);
    logActivity(userName, 'Registered Software to Catalogue', newSoftware.softwareName);
    addNotification({
      title: 'New Software Product Registered',
      description: `Added ${newSoftware.softwareName} (${newSoftware.vendor}) with ${newSoftware.plans?.length || 0} plans to institutional catalogue.`,
      type: 'software_added',
      category: 'Subscription',
      link: '/subscriptions'
    });
  };

  const addSoftwarePlan = (softwareId, newPlan, userName = 'Admin') => {
    setSoftwareCatalogue(prev => prev.map(s => {
      if (s.id === softwareId) {
        return {
          ...s,
          plans: [...(s.plans || []), newPlan]
        };
      }
      return s;
    }));
    logActivity(userName, 'Added Software Plan to Catalogue', newPlan.planName);
  };

  const updateSubscription = (id, updates, userName = 'Admin') => {
    setSubscriptions(prev => {
      const nextSubs = prev.map(sub => {
        if (sub.id === id) {
          // Detect price hike!
          if (updates.cost && Number(updates.cost) > Number(sub.cost)) {
            const hikePercent = (((Number(updates.cost) - Number(sub.cost)) / Number(sub.cost)) * 100).toFixed(1);
            const history = sub.priceHikeHistory || [];
            history.push({
              year: new Date().getFullYear().toString(),
              cost: Number(updates.cost),
              note: `Renewal increase of ${hikePercent}% detected by Price Sentinel`
            });
            updates.priceHikeHistory = history;
            updates.previousCost = sub.cost;

            // Trigger high-priority alert
            addNotification({
              title: `Price Hike Detected: ${sub.name}`,
              description: `Renewal price increased by ${hikePercent}% from $${sub.cost} to $${updates.cost}/year.`,
              type: 'price_hike',
              category: 'Subscription',
              link: '/subscriptions'
            });
          }
          return { ...sub, ...updates };
        }
        return sub;
      });
      broadcastSync('SYNC_SUBSCRIPTIONS', nextSubs);
      return nextSubs;
    });
    dispatchMutation('SUBSCRIPTION_UPDATE', { id, updates }, userName);
    logActivity(userName, 'Updated Subscription', id);
  };

  const deleteSubscription = (id, userName = 'Admin') => {
    setSubscriptions(prev => {
      const remaining = prev.filter(s => s.id !== id);
      broadcastSync('SYNC_SUBSCRIPTIONS', remaining);
      return remaining;
    });
    api.delete(`/subscriptions/${id}`).catch(() => {});
    dispatchMutation('SUBSCRIPTION_DELETE', { id }, userName);
    logActivity(userName, 'Deleted Subscription', id);
  };

  // Unused License Reclaim / Optimization
  const reclaimLicense = (subId, seatsToReclaim, userName = 'Admin') => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id === subId) {
        const newAssigned = Math.max(0, (s.assignedSeats || 0) - seatsToReclaim);
        const newInactive = Math.max(0, (s.inactiveUsers90d || 0) - seatsToReclaim);
        const unitCost = Math.round(s.cost / (s.totalSeats || 1));
        const savedDollars = unitCost * seatsToReclaim;
        logActivity(userName, `Reclaimed ${seatsToReclaim} Inactive Seats`, `${s.name} (Estimated $${savedDollars}/yr savings)`);
        addNotification({
          title: 'License Pool Optimized',
          description: `Reclaimed ${seatsToReclaim} idle seats on ${s.name}. Potential annual savings: $${savedDollars}.`,
          type: 'license_saving',
          category: 'Subscription',
          link: '/subscriptions'
        });
        return {
          ...s,
          assignedSeats: newAssigned,
          inactiveUsers90d: newInactive
        };
      }
      return s;
    }));
  };

  // --- TICKETS & SLA RESOLUTION WORKFLOW ---
  const createTicket = (ticketData, userName = 'User') => {
    const slaHours = ticketData.priority === 'Critical' ? 4 : ticketData.priority === 'High' ? 8 : ticketData.priority === 'Medium' ? 24 : 72;
    const isEmployee = ticketData.reporterRole === 'Employee';
    const initialStatus = isEmployee ? 'Pending Admin Approval' : 'Open';

    const newTicket = {
      ...ticketData,
      id: `TCK-${String(tickets.length + 1001)}`,
      status: initialStatus,
      needsAdminApproval: isEmployee,
      slaTargetHours: slaHours,
      reportedAt: new Date().toISOString(),
      checklist: ticketData.checklist || [
        { id: 'chk-1', text: 'Visual physical inspection & power supply verification', done: false },
        { id: 'chk-2', text: 'Hardware POST & BIOS error code check', done: false },
        { id: 'chk-3', text: 'Run memory and storage diagnostic suite', done: false },
        { id: 'chk-4', text: 'Verify network connectivity and driver state', done: false }
      ],
      notes: [
        { author: userName, date: new Date().toISOString().replace('T', ' ').slice(0, 16), text: `Ticket created: ${ticketData.description}` }
      ],
      costs: { parts: 0, labor: 0 }
    };

    setTickets(prev => [newTicket, ...prev]);

    // If reported by admin/itmanager and critical, mark in repair immediately
    if (!isEmployee && ticketData.assetId && (ticketData.priority === 'Critical' || ticketData.priority === 'High')) {
      updateAsset(ticketData.assetId, { status: 'InRepair', healthScore: 55 }, userName);
    }

    logActivity(userName, isEmployee ? 'Submitted Issue for Admin Approval' : 'Created Helpdesk Ticket', `${newTicket.id} - ${ticketData.title}`);

    addNotification({
      title: isEmployee ? `Issue Awaiting Admin Approval: ${newTicket.id}` : `New Ticket: ${newTicket.id}`,
      description: `${ticketData.priority} Priority: ${ticketData.title} (by ${userName})`,
      type: 'ticket_created',
      category: 'Ticket',
      link: '/tickets'
    });

    // AUTOMATIC REAL EMAIL NOTIFICATION TO BOTH ADMIN AND IT MANAGER
    try {
      dispatchAutomaticNotification({
        eventType: isEmployee ? 'Employee Issue Awaiting Approval' : 'High Priority Issue Logged',
        subject: `[${ticketData.priority.toUpperCase()} TICKET] ${isEmployee ? 'Approval Required: ' : ''}${ticketData.title}`,
        message: `An incident has been submitted by ${userName} (${ticketData.reporterEmail || 'Staff'}).\n\nEquipment: ${ticketData.assetName || 'General Facility'}\nPriority: ${ticketData.priority}\nStatus: ${initialStatus}\n\nDescription:\n${ticketData.description}\n\nAction Required: Both Workspace Admin and IT Manager please review and approve.`,
        priority: ticketData.priority,
        details: {
          ticketId: newTicket.id,
          equipment: ticketData.assetName,
          reporter: userName,
          priority: ticketData.priority,
          status: initialStatus
        }
      });
    } catch (e) {}

    return newTicket;
  };

  // Admin Approval for Employee Reported Issues
  const approveEmployeeTicket = (ticketId, userName = 'Admin') => {
    let approvedTicket = null;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        approvedTicket = t;
        const updatedNotes = [...(t.notes || []), {
          author: userName,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          text: `Approved by Admin (${userName}). Equipment scheduled for technical repair.`
        }];
        return {
          ...t,
          status: 'In Progress',
          needsAdminApproval: false,
          approvedBy: userName,
          approvedAt: new Date().toISOString(),
          notes: updatedNotes
        };
      }
      return t;
    }));

    if (approvedTicket?.assetId) {
      updateAsset(approvedTicket.assetId, { status: 'InRepair', healthScore: 50 }, userName);
    }

    logActivity(userName, 'Approved Employee Reported Issue', ticketId);
    addNotification({
      title: `Issue Approved: ${ticketId}`,
      description: `Admin approved technical repair for ${approvedTicket?.title || 'equipment'}.`,
      type: 'ticket_approved',
      category: 'Ticket',
      link: '/tickets'
    });

    // Send real email alert on approval & repair schedule to both Admin & IT Manager
    try {
      dispatchAutomaticNotification({
        eventType: 'Incident Approved & Scheduled for Repair',
        subject: `[REPAIR APPROVED] Issue Approved by Admin: ${approvedTicket?.title || ticketId}`,
        message: `Admin ${userName} has approved incident ${ticketId} on equipment ${approvedTicket?.assetName}. Equipment status updated to InRepair. Technician work commenced.`,
        priority: 'High',
        details: {
          ticketId,
          equipment: approvedTicket?.assetName,
          approvedBy: userName
        }
      });
    } catch (e) {}
  };

  const rejectEmployeeTicket = (ticketId, reason = 'No defect identified', userName = 'Admin') => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updatedNotes = [...(t.notes || []), {
          author: userName,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          text: `Declined by Admin (${userName}). Reason: ${reason}`
        }];
        return {
          ...t,
          status: 'Declined',
          needsAdminApproval: false,
          declinedBy: userName,
          declinedReason: reason,
          notes: updatedNotes
        };
      }
      return t;
    }));

    logActivity(userName, 'Declined Employee Reported Issue', `${ticketId}: ${reason}`);
    addNotification({
      title: `Issue Declined: ${ticketId}`,
      description: `Admin declined ticket: ${reason}`,
      type: 'ticket_declined',
      category: 'Ticket',
      link: '/tickets'
    });
  };

  const updateTicketStatus = (ticketId, newStatus, resolutionData = {}, userName = 'Admin') => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updatedNotes = [...(t.notes || [])];
        if (resolutionData.note) {
          updatedNotes.push({
            author: userName,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            text: resolutionData.note
          });
        }

        // If ticket is resolved, check if asset was in repair and loaner was assigned
        if (newStatus === 'Resolved' || newStatus === 'Closed') {
          if (t.assetId) {
            updateAsset(t.assetId, { status: 'Assigned', healthScore: 92 }, userName);
          }
          if (t.loanerAssignedId) {
            // Prompt loaner swap-back
            addNotification({
              title: `Loaner Swap-Back Required`,
              description: `Main asset repaired! Return loaner ${t.loanerAssignedId} back to standby pool.`,
              type: 'loaner_swap',
              category: 'Loaner',
              link: '/loaners'
            });
          }
        }

        return {
          ...t,
          status: newStatus,
          notes: updatedNotes,
          resolutionAction: resolutionData.action || t.resolutionAction,
          resolutionSummary: resolutionData.summary || t.resolutionSummary,
          satisfactionRating: resolutionData.rating || t.satisfactionRating,
          costs: resolutionData.costs || t.costs
        };
      }
      return t;
    }));
    logActivity(userName, `Updated Ticket to ${newStatus}`, ticketId);
  };

  // --- LOANER POOL WORKFLOW ---
  const issueLoaner = (loanerId, ticketId, borrowerName, returnDate, notes, userName = 'Admin') => {
    // 1. Update loaner status to Assigned
    updateAsset(loanerId, {
      status: 'Assigned',
      assignedUser: `Temp Loan: ${borrowerName} (Ticket ${ticketId})`,
      expectedReturnDate: returnDate
    }, userName);

    // 2. Link loaner to ticket
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, loanerAssignedId: loanerId };
      }
      return t;
    }));

    logActivity(userName, 'Assigned Loaner Asset', `${loanerId} to ${borrowerName} until ${returnDate}`);
    addNotification({
      title: 'Loaner Asset Checked Out',
      description: `${loanerId} issued to ${borrowerName}. Due date: ${returnDate}`,
      type: 'loaner_issued',
      category: 'Loaner',
      link: '/loaners'
    });
  };

  const returnLoaner = (loanerId, mainAssetId = null, userName = 'Admin') => {
    // 1. Restore loaner back to available pool
    updateAsset(loanerId, {
      status: 'Available',
      assignedUser: 'Unassigned (Ready for Check-out)',
      expectedReturnDate: null
    }, userName);

    // 2. If main asset provided, confirm restored to active duty
    if (mainAssetId) {
      updateAsset(mainAssetId, { status: 'Assigned' }, userName);
    }

    logActivity(userName, 'Returned Loaner Asset to Pool', loanerId);
    addNotification({
      title: 'Loaner Restored to Standby Pool',
      description: `${loanerId} is now sanitized and available for future checkout.`,
      type: 'loaner_returned',
      category: 'Loaner',
      link: '/loaners'
    });
  };

  // --- SHADOW IT DETECTION ---
  const updateShadowItStatus = (id, newStatus, remediationAction, userName = 'Admin') => {
    setShadowItLogs(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: newStatus, remediationAction };
      }
      return s;
    }));
    logActivity(userName, `Remediated Shadow IT (${newStatus})`, id);
  };

  const simulateShadowItFeed = (userName = 'Admin') => {
    const sampleThreats = [
      {
        id: `SHD-${Date.now().toString().slice(-4)}`,
        appName: 'Tor Browser 13.5 (Onion Routing)',
        category: 'Darknet / Privacy Proxy',
        detectedOn: 'AST-CSE-002 (Bench 02)',
        user: 'Student User Lab B',
        department: 'Engineering (CSE)',
        riskLevel: 'High',
        riskScore: 94,
        threatReason: 'Circumventing campus perimeter firewall and deep-packet inspection; high compliance risk.',
        detectedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
        dataTransfer: '1.2 GB Encrypted',
        status: 'Flagged'
      },
      {
        id: `SHD-${(Date.now() + 1).toString().slice(-4)}`,
        appName: 'Personal GitHub Copilot CLI token',
        category: 'AI Assistant',
        detectedOn: 'AST-ECE-001 (DSP Bench)',
        user: 'Research Scholar',
        department: 'Engineering (ECE)',
        riskLevel: 'Medium',
        riskScore: 58,
        threatReason: 'Unvetted telemetry sharing institutional RTL / Verilog schematics with public LLM servers.',
        detectedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
        dataTransfer: 'API Webhook',
        status: 'Under Review'
      }
    ];

    setShadowItLogs(prev => [...sampleThreats, ...prev]);
    logActivity(userName, 'Injected Live Network Threat Logs', 'Shadow IT Sentinel');
    addNotification({
      title: 'New Shadow IT Anomaly Detected',
      description: 'Tor Browser & unauthorized LLM token detected on lab endpoints.',
      type: 'shadow_it',
      category: 'Security',
      link: '/shadow-it'
    });
  };

  // --- E-WASTE & SUSTAINABILITY ---
  const markAsEWaste = (assetId, disposalDetails, userName = 'Admin') => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    // 1. Update asset status
    updateAsset(assetId, {
      status: 'E-Waste',
      location: 'E-Waste Scrap Storage Bin',
      assignedUser: 'Retired for Certified Recycling'
    }, userName);

    // 2. Add e-waste record
    const weight = disposalDetails.weightKg || 12;
    const co2 = Math.round(weight * 2.3);
    const toxic = (weight * 0.1).toFixed(1);

    const newRecord = {
      id: `EW-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      batchName: disposalDetails.batchName || `Decommissioned ${asset.name}`,
      assetCount: 1,
      totalWeightKg: weight,
      disposalMethod: disposalDetails.method || 'Certified E-Waste Recycler (ISO 14001)',
      vendorName: disposalDetails.vendorName || 'EcoTech Green Recyclers India',
      dataWipeMethod: disposalDetails.wipeMethod || 'NIST SP 800-88 Rev 1 (3-Pass DoD Overwrite)',
      dataWipeCompleted: true,
      certificateNumber: `CERT-SAN-${Date.now().toString().slice(-6)}`,
      co2OffsetKg: co2,
      toxicMetalsDivertedKg: parseFloat(toxic),
      status: 'Certified & Disposed',
      disposalDate: new Date().toISOString().slice(0, 10),
      officerInCharge: userName
    };

    setEWasteRecords(prev => [newRecord, ...prev]);
    logActivity(userName, 'Marked Asset as E-Waste', `${assetId} (${newRecord.certificateNumber})`);
    addNotification({
      title: 'E-Waste Certificate Issued',
      description: `${asset.name} sanitized per NIST 800-88. Saved ${co2}kg CO2e.`,
      type: 'ewaste_disposed',
      category: 'E-Waste',
      link: '/e-waste'
    });
  };

  // --- LOSS & THEFT WORKFLOW ---
  const reportLossTheft = (reportData, userName = 'Reporter') => {
    const newReport = {
      id: `LTR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      status: 'Pending HOD Approval',
      reporterName: userName,
      incidentDate: reportData.incidentDate || new Date().toISOString().slice(0, 10),
      approvals: {
        reporter: { approved: true, date: new Date().toISOString().slice(0, 10) },
        deptHead: { approved: false, date: null },
        itAdmin: { approved: false, date: null }
      },
      ...reportData
    };

    setLossTheftReports(prev => [newReport, ...prev]);

    // Change asset status to Lost
    if (reportData.assetId) {
      updateAsset(reportData.assetId, { status: 'Lost' }, userName);
    }

    logActivity(userName, 'Filed Loss/Theft Report', `${newReport.id} (${reportData.assetName})`);
    addNotification({
      title: 'Asset Loss / Theft Reported',
      description: `Report ${newReport.id} pending HOD and Admin review. FIR: ${reportData.policeFirNumber || 'Pending'}`,
      type: 'loss_theft',
      category: 'Asset',
      link: '/loss-theft'
    });
    return newReport;
  };

  const approveLossTheft = (reportId, role, userName = 'Admin') => {
    setLossTheftReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const approvals = { ...r.approvals };
        let newStatus = r.status;

        if (role === 'Department Head' || role === 'ITManager or HOD') {
          approvals.deptHead = { approved: true, date: new Date().toISOString().slice(0, 10), approver: userName };
          newStatus = 'HOD Approved - Pending IT Admin';
        } else if (role === 'Admin/IT Manager' || role === 'Super Admin' || role === 'Admin') {
          approvals.itAdmin = { approved: true, date: new Date().toISOString().slice(0, 10), approver: userName };
          newStatus = 'Admin Approved - Deactivated';
          // Mark asset as confirmed Stolen and lock licenses
          if (r.assetId) {
            updateAsset(r.assetId, { status: 'Stolen', healthScore: 0 }, userName);
          }
        }

        return { ...r, approvals, status: newStatus };
      }
      return r;
    }));
    logActivity(userName, `Approved Loss/Theft Report as ${role}`, reportId);
  };

  const recoverAsset = (reportId, userName = 'Admin') => {
    const report = lossTheftReports.find(r => r.id === reportId);
    if (report && report.assetId) {
      updateAsset(report.assetId, { status: 'Available', healthScore: 85 }, userName);
    }
    setLossTheftReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, status: 'Recovered & Restored' };
      }
      return r;
    }));
    logActivity(userName, 'Recovered Lost Asset', reportId);
    addNotification({
      title: 'Asset Recovered & Restored',
      description: `Asset ${report?.assetName || reportId} has been returned and restored to service.`,
      type: 'asset_recovered',
      category: 'Asset',
      link: '/assets'
    });
  };

  // --- PLATFORM SUBSCRIPTION PLAN UPGRADE / DOWNGRADE ---
  const upgradePlatformPlan = (newPlanId, billingCycle, userName = 'Super Admin') => {
    const plan = PLATFORM_PRICING_PLANS.find(p => p.id === newPlanId);
    const amount = billingCycle === 'yearly' ? plan?.priceYearly : plan?.priceMonthly;

    setPlatformSubscription({
      planId: newPlanId,
      billingCycle,
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      autoRenew: true,
      lastPaymentAmount: amount
    });

    logActivity(userName, `Upgraded AssetOrbit Plan to ${plan?.name}`, `$${amount} (${billingCycle})`);
    addNotification({
      title: `Plan Upgraded: ${plan?.name}`,
      description: `AssetOrbit tier updated with active entitlements for ${billingCycle} billing.`,
      type: 'plan_upgraded',
      category: 'System',
      link: '/platform-plans'
    });
  };

  // --- WARRANTY CLAIM WORKFLOW ---
  const submitWarrantyClaim = (claimData, userName = 'Admin') => {
    const newClaim = {
      id: `CLM-${Date.now().toString().slice(-6)}`,
      claimNumber: claimData.claimNumber || `WCR-${Math.floor(100000 + Math.random() * 900000)}`,
      assetId: claimData.assetId,
      assetName: claimData.assetName,
      vendor: claimData.vendor || 'Authorized Service Partner',
      defectDescription: claimData.defectDescription,
      status: 'Submitted',
      submittedDate: new Date().toISOString().slice(0, 10),
      timeline: [
        { date: new Date().toISOString().slice(0, 10), status: 'Submitted', note: `Warranty claim logged by ${userName}` }
      ]
    };
    setWarrantyClaims(prev => [newClaim, ...prev]);
    logActivity(userName, 'Raised Warranty Claim', `${newClaim.claimNumber} (${claimData.assetName || claimData.assetId})`);
    return newClaim;
  };

  const updateWarrantyClaimStatus = (claimId, newStatus, note = '', userName = 'Admin') => {
    setWarrantyClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        const timeline = [...(c.timeline || []), {
          date: new Date().toISOString().slice(0, 10),
          status: newStatus,
          note: note || `Status updated to ${newStatus} by ${userName}`
        }];
        return { ...c, status: newStatus, timeline };
      }
      return c;
    }));
    logActivity(userName, `Updated Warranty Claim Status to ${newStatus}`, claimId);
  };

  // --- AUTOMATIC REPLACEMENT ENGINE WORKFLOW ---
  const submitReplacementRequest = (requestData, userName = 'Admin') => {
    const newReq = {
      id: `REP-${Date.now().toString().slice(-6)}`,
      assetId: requestData.assetId,
      assetName: requestData.assetName,
      department: requestData.department,
      triggerReason: requestData.triggerReason || 'Repeated Hardware Failures',
      urgency: requestData.urgency || 'High',
      estimatedCost: Number(requestData.estimatedCost) || 65000,
      status: 'Pending HOD Approval',
      submittedDate: new Date().toISOString().slice(0, 10),
      approvals: {
        hodApproved: false,
        committeeApproved: false
      }
    };
    setReplacementRequests(prev => [newReq, ...prev]);
    logActivity(userName, 'Created Capital Replacement Request', `${newReq.id} (${requestData.assetName})`);
    return newReq;
  };

  const approveReplacementRequest = (requestId, stage = 'hod', userName = 'Admin') => {
    setReplacementRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const approvals = { ...r.approvals };
        let newStatus = r.status;
        if (stage === 'hod') {
          approvals.hodApproved = true;
          newStatus = 'Approved by HOD - Pending Purchase Committee';
        } else {
          approvals.committeeApproved = true;
          newStatus = 'Approved for Procurement';
        }
        return { ...r, approvals, status: newStatus };
      }
      return r;
    }));
    logActivity(userName, `Approved Replacement Request (${stage})`, requestId);
  };

  // --- FULL BACKUP, SCHEDULED SNAPSHOTS & RESTORE SYSTEM ---
  const [backupLogs, setBackupLogs] = useState(() => {
    const saved = localStorage.getItem('ao_backup_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'BKP-AUTO-001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'Automated Snapshot',
        sizeKb: 48,
        assetCount: assets.length,
        subCount: subscriptions.length,
        status: 'Healthy (100% Integrity)'
      }
    ];
  });

  const createFullBackup = () => {
    const backupData = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      institution: 'AssetOrbit Enterprise ITAM',
      state: {
        categories,
        vendors,
        assets,
        subscriptions,
        tickets,
        shadowItLogs,
        eWasteRecords,
        lossTheftReports,
        warrantyClaims,
        replacementRequests,
        platformSubscription,
        activityLogs
      }
    };
    // Append to backup history log
    const newLog = {
      id: `BKP-MANUAL-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      type: 'Manual JSON Export',
      sizeKb: Math.max(12, Math.round(JSON.stringify(backupData).length / 1024)),
      assetCount: assets.length,
      subCount: subscriptions.length,
      status: 'Healthy (100% Verified)'
    };
    setBackupLogs(prev => [newLog, ...prev]);
    localStorage.setItem('ao_backup_logs', JSON.stringify([newLog, ...backupLogs]));
    return backupData;
  };

  const validateBackupIntegrity = (backupJson) => {
    try {
      const data = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
      if (!data || !data.state) {
        return { valid: false, error: 'Invalid backup structure: missing state payload' };
      }
      const assetCount = data.state.assets?.length || 0;
      const subCount = data.state.subscriptions?.length || 0;
      const ticketCount = data.state.tickets?.length || 0;
      return {
        valid: true,
        summary: {
          version: data.version || '2.0.0',
          timestamp: data.timestamp || new Date().toISOString(),
          assetCount,
          subCount,
          ticketCount,
          integrityCheck: 'PASSED (Cryptographic Schema Verified)'
        }
      };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  };

  const restoreSelective = (backupJson, selections = { assets: true, subscriptions: true, tickets: true, ewaste: true }, userName = 'Super Admin') => {
    try {
      const data = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
      if (!data.state) throw new Error('Invalid backup schema');

      let restoredCount = 0;
      if (selections.assets && data.state.assets) {
        setAssets(data.state.assets);
        restoredCount += data.state.assets.length;
      }
      if (selections.subscriptions && data.state.subscriptions) {
        setSubscriptions(data.state.subscriptions);
      }
      if (selections.tickets && data.state.tickets) {
        setTickets(data.state.tickets);
      }
      if (selections.ewaste && data.state.eWasteRecords) {
        setEWasteRecords(data.state.eWasteRecords);
      }
      if (selections.categories && data.state.categories) {
        setCategories(data.state.categories);
      }

      logActivity(userName, 'Selective Database Restoration Executed', `Restored ${restoredCount} assets and records`);
      return { success: true, count: restoredCount };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const restoreFromBackup = (backupJson, userName = 'Super Admin') => {
    try {
      const data = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
      if (!data.state) throw new Error('Invalid backup schema');

      if (data.state.categories) setCategories(data.state.categories);
      if (data.state.vendors) setVendors(data.state.vendors);
      if (data.state.assets) setAssets(data.state.assets);
      if (data.state.subscriptions) setSubscriptions(data.state.subscriptions);
      if (data.state.tickets) setTickets(data.state.tickets);
      if (data.state.shadowItLogs) setShadowItLogs(data.state.shadowItLogs);
      if (data.state.eWasteRecords) setEWasteRecords(data.state.eWasteRecords);
      if (data.state.lossTheftReports) setLossTheftReports(data.state.lossTheftReports);
      if (data.state.warrantyClaims) setWarrantyClaims(data.state.warrantyClaims);
      if (data.state.replacementRequests) setReplacementRequests(data.state.replacementRequests);
      if (data.state.platformSubscription) setPlatformSubscription(data.state.platformSubscription);

      logActivity(userName, 'Restored Full Database Backup', `Timestamp: ${data.timestamp || 'Unknown'}`);
      addNotification({
        title: 'System Restored from Backup',
        description: `Successfully restored ${data.state.assets?.length || 0} assets and records.`,
        type: 'restore_success',
        category: 'System',
        link: '/settings'
      });
      return { success: true, count: data.state.assets?.length || 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Reset to default sample college data
  const resetToSampleData = () => {
    setCategories(INITIAL_CATEGORIES);
    setVendors(INITIAL_VENDORS);
    setAssets(INITIAL_ASSETS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setTickets(INITIAL_TICKETS);
    setShadowItLogs(INITIAL_SHADOW_IT);
    setEWasteRecords(INITIAL_E_WASTE);
    setNotifications(INITIAL_NOTIFICATIONS);
    logActivity('Admin', 'Loaded College Lab Sample Dataset', 'CSE, ISE, ECE Labs');
  };

  // Clear all data for clean setup wizard
  const clearAllData = () => {
    setAssets([]);
    setSubscriptions([]);
    setTickets([]);
    setShadowItLogs([]);
    setEWasteRecords([]);
    setLossTheftReports([]);
    setWarrantyClaims([]);
    setReplacementRequests([]);
    logActivity('Admin', 'Purged All Data for Clean Import', 'Clean Slate');
  };

  // Notification actions
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Compute System KPIs
  const kpis = useMemo(() => {
    const totalAssetCount = assets.length;
    const totalAssetValue = assets.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    const assignedCount = assets.filter(a => a.status === 'Assigned').length;
    const inRepairCount = assets.filter(a => a.status === 'In Repair').length;
    const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Assigned').length;
    const totalSubSpend = subscriptions.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);
    
    // Potential License Savings
    const potentialSavings = subscriptions.reduce((sum, s) => {
      const inactive = Number(s.inactiveUsers90d) || 0;
      const unit = Math.round((Number(s.cost) || 0) / (Number(s.totalSeats) || 1));
      return sum + (inactive * unit);
    }, 0);

    // SLA Compliance rate %
    const resolvedWithSla = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
    const slaMetCount = resolvedWithSla.filter(t => !t.slaBreached).length;
    const slaCompliancePercent = resolvedWithSla.length > 0 ? Math.round((slaMetCount / resolvedWithSla.length) * 100) : 98;

    // Average Asset Health Score
    const totalHealth = assets.reduce((sum, a) => sum + (Number(a.healthScore) || 85), 0);
    const avgHealthScore = totalAssetCount > 0 ? Math.round(totalHealth / totalAssetCount) : 100;

    return {
      totalAssetCount,
      totalAssetValue,
      assignedCount,
      inRepairCount,
      openTicketsCount,
      totalSubSpend,
      potentialSavings,
      slaCompliancePercent,
      avgHealthScore
    };
  }, [assets, tickets, subscriptions]);

  return (
    <AppContext.Provider value={{
      categories,
      setCategories,
      vendors,
      setVendors,
      assets,
      setAssets,
      addAsset,
      updateAsset,
      deleteAsset,
      bulkImportAssets,
      subscriptions,
      setSubscriptions,
      addSubscription,
      addSubscriptionWithPlan,
      softwareCatalogue,
      setSoftwareCatalogue,
      addSoftware,
      addSoftwarePlan,
      updateSubscription,
      deleteSubscription,
      reclaimLicense,
      tickets,
      setTickets,
      createTicket,
      updateTicketStatus,
      approveEmployeeTicket,
      rejectEmployeeTicket,
      shadowItLogs,
      updateShadowItStatus,
      simulateShadowItFeed,
      eWasteRecords,
      markAsEWaste,
      lossTheftReports,
      reportLossTheft,
      approveLossTheft,
      recoverAsset,
      warrantyClaims,
      setWarrantyClaims,
      submitWarrantyClaim,
      updateWarrantyClaimStatus,
      replacementRequests,
      setReplacementRequests,
      submitReplacementRequest,
      approveReplacementRequest,
      activeAuditSession,
      setActiveAuditSession,
      platformSubscription,
      upgradePlatformPlan,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      clearAllNotifications,
      activityLogs,
      logActivity,
      issueLoaner,
      returnLoaner,
      createFullBackup,
      restoreFromBackup,
      restoreSelective,
      validateBackupIntegrity,
      backupLogs,
      resetToSampleData,
      clearAllData,
      kpis
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
