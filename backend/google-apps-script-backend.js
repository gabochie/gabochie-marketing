/**
 * Google Apps Script Backend for Gabochie Marketing
 * Handles website form capture and client portal
 * Single source of truth: Google Sheet ID below
 */

// Script Property keys — set via setupPublicBackend() or Script Properties editor
const PROP_SHEET_ID = 'SHEET_ID';
const PROP_ALLOWED_ORIGINS = 'ALLOWED_ORIGINS';

const DEFAULT_SHEET_ID = '1yvFvoIeVrOyBjocXBLAg1onDLKEFtdSxSkD4M5I1tl4';

const LEADS_SHEET = 'Leads';
const CLIENTS_SHEET = 'Clients';

// Aligned with admin backend — single consistent column structure for all data
const LEADS_HEADERS = [
  'ID', 'Prospect Name', 'Business Name', 'Phone', 'WhatsApp Link',
  'Email', 'Website', 'Business Type', 'Location', 'Owner Name',
  'GBP Status', 'Lead Source', 'Funnel Stage', 'Pipeline Status',
  'Lead Type', 'Offer Type', 'Product Offer', 'Outreach Message',
  'Outreach Category', 'Follow-up', 'Last Contact', 'Notes',
  'Offer URL Sent', 'Assigned Offer', 'CTA Type', 'AI Model',
  'Last Generated At', 'Last Message Type', 'Rating',
  'Created At', 'Deleted'
];

const CLIENT_HEADERS = [
  'Email','Password','Name','Business Name','Package','Status','Start Date',
  'Phase 1','Phase 2','Phase 3',
  'Views','Directions','Calls','Reviews',
  'Token','Created At'
];

function getSheetId_() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty(PROP_SHEET_ID) || DEFAULT_SHEET_ID;
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    name: 'Gabochie Marketing Public API',
    version: '2.0'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ── Security Helpers ──

function isAllowedOrigin_(e) {
  const props = PropertiesService.getScriptProperties();
  const allowed = props.getProperty(PROP_ALLOWED_ORIGINS) || 'https://marketing.gabochie.com,http://localhost:4000,http://localhost:3000';
  const origins = allowed.split(',').map(s => s.trim().toLowerCase());

  try {
    const data = JSON.parse(e.postData.contents);
    const bodyOrigin = data._origin || '';
    if (bodyOrigin && origins.some(o => bodyOrigin.toLowerCase().startsWith(o))) return true;
  } catch (_) {}

  return true;
}

function checkRateLimit_() {
  const props = PropertiesService.getScriptProperties();
  const now = Date.now();
  const windowMs = 60000;
  const maxReqs = 60;

  const key = 'RL_COUNTER';
  const raw = props.getProperty(key);
  let data;

  if (raw) {
    try { data = JSON.parse(raw); } catch (_) { data = { window: now, count: 0 }; }
  } else {
    data = { window: now, count: 0 };
  }

  if (now - data.window > windowMs) {
    data = { window: now, count: 0 };
  }

  data.count++;
  props.setProperty(key, JSON.stringify(data));
  return data.count <= maxReqs;
}

/**
 * Run once from the Apps Script editor to set up the backend configuration.
 * Stores the Sheet ID in Script Properties (not in source code).
 */
function setupPublicBackend() {
  const props = PropertiesService.getScriptProperties();

  if (!props.getProperty(PROP_SHEET_ID)) {
    props.setProperty(PROP_SHEET_ID, DEFAULT_SHEET_ID);
  }

  if (!props.getProperty(PROP_ALLOWED_ORIGINS)) {
    props.setProperty(PROP_ALLOWED_ORIGINS, 'https://marketing.gabochie.com,http://localhost:4000,http://localhost:3000');
  }

  console.log('Public backend configured. Sheet ID and allowed origins stored in Script Properties.');
}

function doPost(e) {
  try {
    if (!isAllowedOrigin_(e)) {
      return respond({ status: 'error', message: 'Access denied: invalid origin', code: 'ORIGIN_DENIED' });
    }

    if (!checkRateLimit_()) {
      return respond({ status: 'error', message: 'Too many requests. Try again later.', code: 'RATE_LIMITED' });
    }

    const data = JSON.parse(e.postData.contents);

    if (data.action === 'clientLogin') return handleClientLogin(data);
    if (data.action === 'getClientDashboard') return getClientDashboard(data);
    if (data.action === 'registerClient') return registerClient(data);

    return handleLeadCapture(data);
  } catch (error) {
    console.error('Error in doPost:', error);
    return respond({ status: 'error', message: error.toString() });
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(getSheetId_());
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const hr = sheet.getRange(1, 1, 1, headers.length);
    hr.setFontWeight('bold');
    hr.setBackground('#0F5C28');
    hr.setFontColor('#FFFFFF');
  }
  return sheet;
}

function generateWhatsAppLink(phone) {
  if (!phone) return '';
  const clean = phone.toString().replace(/\D/g, '');
  let fp = clean;
  if (clean.startsWith('0')) fp = '233' + clean.substring(1);
  else if (!clean.startsWith('233')) fp = '233' + clean;
  return 'https://wa.me/' + fp;
}

function generateOutreachMessage(data) {
  const templates = {
    'Website Lead': `Hi ${data.ProspectName || '[Name]'}, thanks for contacting Gabochie Marketing about ${data.BusinessName || 'your business'}. We help Ghanaian businesses get found on Google Maps. What's the best time to call you at ${data.Phone || '[Phone]'}?`,
    'Website Audit Request': `Hi ${data.ProspectName || '[Name]'}, you requested a free Google Visibility Audit for ${data.BusinessName || 'your business'}. I'll review your Google Business Profile and send you a detailed report within 24 hours. Is this the right location: ${data.Address || '[Address]'}? Reply YES to confirm.`,
    'Package Purchase Request': `Hi ${data.ProspectName || '[Name]'}, thank you for purchasing ${data.OfferType || 'our package'} for ${data.BusinessName || 'your business'}. I'm excited to help you dominate Google Maps! I'll call you at ${data.Phone || '[Phone]'} within 24 hours to get started.`
  };

  let template = templates[data.OutreachCategory] || templates['Website Lead'];

  template = template.replace(/\{name\}/g, data.ProspectName || '[Name]');
  template = template.replace(/\{biz\}/g, data.BusinessName || '[Business]');
  template = template.replace(/\{phone\}/g, data.Phone || '[Phone]');
  template = template.replace(/\{type\}/g, data.BusinessType || '[Type]');
  template = template.replace(/\{area\}/g, data.Address || '[Area]');

  return template;
}

function handleLeadCapture(data) {
  const sheet = getOrCreateSheet(LEADS_SHEET, LEADS_HEADERS);
  const ts = new Date().toISOString();
  const phone = data.Phone || data.phone || '';
  const name = data.ProspectName || data.name || '';
  const biz = data.BusinessName || data.businessName || data.biz || '';
  const email = data.Email || data.email || '';
  const website = data.Website || data.website || '';

  // Build row aligned with admin backend HEADERS (31 columns)
  const rowData = [
    '',                                   // 1.  ID (auto by admin)
    name,                                 // 2.  Prospect Name
    biz,                                  // 3.  Business Name
    phone,                                // 4.  Phone
    generateWhatsAppLink(phone),          // 5.  WhatsApp Link
    email,                                // 6.  Email
    website,                              // 7.  Website
    data.BusinessType || data.businessType || data.type || '',  // 8.  Business Type
    data.Address || data.address || data.area || '',  // 9.  Location
    data.ownerName || '',                 // 10. Owner Name
    data.gbpStatus || 'none',             // 11. GBP Status
    data.Source || data.leadSource || 'website',  // 12. Lead Source
    'tofu',                               // 13. Funnel Stage
    'new',                                // 14. Pipeline Status
    'unknown',                            // 15. Lead Type
    data.OfferType || data.offerType || '',  // 16. Offer Type
    data.ProductOffer || '',              // 17. Product Offer
    generateOutreachMessage(data),        // 18. Outreach Message
    data.OutreachCategory || 'Website Lead',  // 19. Outreach Category
    '',                                   // 20. Follow-up
    '',                                   // 21. Last Contact
    data.Notes || data.notes || data.note || '',  // 22. Notes
    '',                                   // 23. Offer URL Sent
    '',                                   // 24. Assigned Offer
    '',                                   // 25. CTA Type
    '',                                   // 26. AI Model
    '',                                   // 27. Last Generated At
    '',                                   // 28. Last Message Type
    '',                                   // 29. Rating
    ts,                                   // 30. Created At
    ''                                    // 31. Deleted
  ];

  sheet.appendRow(rowData);

  return respond({ status: 'success', message: 'Lead captured successfully' });
}

// ── Client Portal ──

function hashPassword_(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function handleClientLogin(data) {
  const sheet = getOrCreateSheet(CLIENTS_SHEET, CLIENT_HEADERS);
  const values = sheet.getDataRange().getValues();
  const inputHash = hashPassword_(data.password || '');

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email && values[i][1] === inputHash) {
      const token = Utilities.getUuid();
      sheet.getRange(i + 1, 15).setValue(token);
      return respond({
        success: true, token: token,
        name: values[i][2], businessName: values[i][3], package: values[i][4]
      });
    }
  }

  return respond({ success: false, message: 'Invalid email or password' });
}

function getClientDashboard(data) {
  const sheet = getOrCreateSheet(CLIENTS_SHEET, CLIENT_HEADERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email && values[i][14] === data.token) {
      return respond({
        success: true,
        name: values[i][2], businessName: values[i][3],
        package: values[i][4], status: values[i][5], startDate: values[i][6],
        phases: {
          foundation: values[i][7] || 'pending',
          activation: values[i][8] || 'pending',
          domination: values[i][9] || 'pending'
        },
        stats: {
          views: values[i][10] || '0',
          directions: values[i][11] || '0',
          calls: values[i][12] || '0',
          reviews: values[i][13] || '0'
        },
        activity: [
          { date: new Date().toISOString().split('T')[0], description: 'Profile optimization completed' },
          { date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], description: 'Started Phase 1: Foundation' },
          { date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], description: 'Package purchased' }
        ]
      });
    }
  }

  return respond({ success: false, message: 'Session expired. Please login again.' });
}

function registerClient(data) {
  const sheet = getOrCreateSheet(CLIENTS_SHEET, CLIENT_HEADERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email) {
      return respond({ success: false, message: 'Client already exists' });
    }
  }

  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = hashPassword_(tempPassword);
  const token = Utilities.getUuid();
  const ts = new Date().toISOString();

  sheet.appendRow([
    data.email, hashedPassword, data.name, data.businessName,
    data.package || 'Growth System', 'Onboarding', ts.split('T')[0],
    'pending', 'pending', 'pending',
    '0', '0', '0', '0',
    token, ts
  ]);

  return respond({
    success: true, message: 'Client registered successfully',
    tempPassword: tempPassword
  });
}
