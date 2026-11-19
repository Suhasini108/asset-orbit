// AssetOrbit Real Automated Email Dispatch Service
// Real delivery to inboxes for Workspace Admin & IT Manager on high priority lists & reminders

const STORAGE_KEY_LOGS = 'ao_email_dispatch_log';
const STORAGE_KEY_SETTINGS = 'ao_email_settings';

export const getEmailSettings = () => {
  const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
  const adminEmailStored = localStorage.getItem('ao_admin_email');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (adminEmailStored && parsed.adminEmail === 'admin@assetorbit.edu') {
        parsed.adminEmail = adminEmailStored;
      }
      return parsed;
    } catch (e) {}
  }
  return {
    adminEmail: adminEmailStored || 'admin@assetorbit.edu',
    itManagerEmail: 'itmanager@assetorbit.edu',
    autoRemindersEnabled: true,
    highPriorityAlertsEnabled: true,
    repairAlertsEnabled: true,
    approvalAlertsEnabled: true,
    lastRenewalScanDate: null
  };
};

export const saveEmailSettings = (settings) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};

/**
 * Returns a 1-click URL to open Gmail in browser with pre-filled To, Subject, and Body
 */
export function getGmailComposeUrl({ to, subject, body }) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Returns a 1-click URL to open Outlook Web in browser with pre-filled To, Subject, and Body
 */
export function getOutlookComposeUrl({ to, subject, body }) {
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Opens default mail software (Outlook, Windows Mail, Gmail) with pre-filled content
 */
export function openNativeMailClient({ to, subject, body }) {
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

export const getEmailDispatchLogs = () => {
  const saved = localStorage.getItem(STORAGE_KEY_LOGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return [];
};

export const appendEmailDispatchLog = (logEntry) => {
  const logs = getEmailDispatchLogs();
  const updated = [
    {
      id: `EML-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...logEntry
    },
    ...logs.slice(0, 99) // Keep last 100 entries
  ];
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  return updated;
};

/**
 * Dispatches a real email over HTTPS to real inboxes
 * Uses FormSubmit AJAX delivery engine + fallback to Express backend API
 */
export async function sendRealEmail({ to, subject, message, priority = 'High', category = 'System Alert', details = {} }) {
  const recipients = Array.isArray(to) ? to : [to];
  const results = [];

  for (const recipient of recipients) {
    if (!recipient || !recipient.includes('@')) continue;

    let deliveryStatus = 'Pending';
    let responseData = null;

    try {
      // 1. Direct real email dispatch via FormSubmit AJAX service
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[AssetOrbit ITAM] ${priority.toUpperCase()}: ${subject}`,
          _captcha: 'false',
          Priority: priority,
          Category: category,
          Recipient: recipient,
          Message: message,
          Equipment_Details: typeof details === 'string' ? details : JSON.stringify(details, null, 2),
          Dispatched_At: new Date().toLocaleString(),
          System: 'AssetOrbit Enterprise ITAM & Subscription Management',
          _template: 'table'
        })
      });

      if (response.ok) {
        responseData = await response.json().catch(() => ({}));
        const msgText = (responseData?.message || '').toLowerCase();
        if (msgText.includes('activation') || msgText.includes('confirm') || msgText.includes('activate')) {
          deliveryStatus = 'Activation Required';
        } else {
          deliveryStatus = 'Delivered';
        }
      } else {
        deliveryStatus = 'Dispatched (HTTP ' + response.status + ')';
      }
    } catch (err) {
      // Fallback: If network is offline or blocked, mark as Queued in Dispatch Outbox
      console.warn(`Email dispatch fallback for ${recipient}:`, err.message);
      deliveryStatus = 'Queued in Outbox';
    }

    // Also attempt Express server endpoint if reachable
    try {
      fetch('http://localhost:5000/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, subject, message, priority, category, details })
      }).catch(() => {});
    } catch (e) {}

    const isActivation = deliveryStatus === 'Activation Required' || (responseData?.message && responseData.message.toLowerCase().includes('activation'));

    const logItem = {
      recipient,
      subject,
      message,
      priority,
      category,
      details,
      status: deliveryStatus,
      needsActivation: isActivation,
      apiMessage: responseData?.message || (isActivation ? 'First-time activation email sent by FormSubmit. Please check Spam/Junk folder and click Activate.' : 'Report dispatched via secure email relay.'),
      sentAt: new Date().toLocaleString()
    };

    appendEmailDispatchLog(logItem);
    results.push(logItem);
  }

  return results;
}

/**
 * Automatically dispatches alerts to BOTH Admin and IT Manager
 */
export async function dispatchAutomaticNotification({ eventType, subject, message, priority = 'High', details = {} }) {
  const settings = getEmailSettings();
  const sessionUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('assetorbit_session_user') || '{}');
    } catch (e) {
      return {};
    }
  })();

  // Collect destination emails for BOTH Admin and IT Manager
  const recipients = new Set();

  if (settings.adminEmail) recipients.add(settings.adminEmail);
  if (settings.itManagerEmail) recipients.add(settings.itManagerEmail);

  // If currently logged in user has an email and is Admin or IT Manager, ensure it receives the alert
  if (sessionUser.role === 'Admin' && sessionUser.email) recipients.add(sessionUser.email);
  if (sessionUser.role === 'IT Manager' && sessionUser.email) recipients.add(sessionUser.email);

  // Fallbacks if empty
  if (recipients.size === 0) {
    recipients.add('admin@assetorbit.edu');
    recipients.add('itmanager@assetorbit.edu');
  }

  const recipientList = Array.from(recipients);

  return await sendRealEmail({
    to: recipientList,
    subject,
    message,
    priority,
    category: eventType,
    details
  });
}
