/**
 * Gabochie Marketing - Admin Web App Backend
 * Single source of truth: one Google Sheet for all data
 */

// Script Property keys — set via setupAdmin() or Script Properties editor
const PROP_SHEET_ID = 'SHEET_ID';
const PROP_ADMIN_USER = 'ADMIN_USER';
const PROP_ADMIN_PASS = 'ADMIN_PASS';
const PROP_ALLOWED_ORIGINS = 'ALLOWED_ORIGINS';

const DEFAULT_SHEET_ID = '1yvFvoIeVrOyBjocXBLAg1onDLKEFtdSxSkD4M5I1tl4';

const SHEET_NAME = 'Leads';
const CLIENT_SHEET_NAME = 'Clients';

const HEADERS = [
  'ID', 'Prospect Name', 'Business Name', 'Phone', 'WhatsApp Link',
  'Email', 'Website', 'Business Type', 'Location', 'Owner Name',
  'GBP Status', 'Lead Source', 'Funnel Stage', 'Pipeline Status',
  'Lead Type', 'Offer Type', 'Product Offer', 'Outreach Message',
  'Outreach Category', 'Follow-up', 'Last Contact', 'Notes',
  'Offer URL Sent', 'Assigned Offer', 'CTA Type', 'AI Model',
  'Last Generated At', 'Last Message Type', 'Rating',
  'Created At', 'Deleted'
];

const TEMPLATE_NAMES = ['day1', 'day3', 'day7', 'network'];
const PROP_TEMPLATES = 'MESSAGE_TEMPLATES';
const PROP_SHEET_NAME = 'TARGET_SHEET_NAME';

// API Provider Configuration
const PROP_API_PROVIDER = 'API_PROVIDER';        // 'gemini' | 'groq' | 'ollama'
const PROP_GEMINI_KEY = 'GEMINI_API_KEY';
const PROP_GEMINI_MODEL = 'GEMINI_MODEL';
const PROP_GROQ_KEY = 'GROQ_API_KEY';
const PROP_GROQ_MODEL = 'GROQ_MODEL';
const PROP_OLLAMA_URL = 'OLLAMA_BASE_URL';
const PROP_OLLAMA_MODEL = 'OLLAMA_MODEL';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_GROQ_MODEL = 'llama3-70b-8192';
const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
const DEFAULT_OLLAMA_MODEL = 'llama3';

// Auth
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Helpers ──
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth_(token) {
  if (!token) return false;
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty('SESSION_' + token);
  if (!stored) return false;
  const session = JSON.parse(stored);
  if (Date.now() > session.expiry) {
    props.deleteProperty('SESSION_' + token);
    return false;
  }
  return true;
}

function doGet() {
  return json({ status: 'ok', name: 'Gabochie Marketing API', version: '2.0' });
}

function doPost(e) {
  try {
    // Origin validation
    if (!isAllowedOrigin_(e)) {
      return json({ success: false, error: 'Access denied: invalid origin', code: 'ORIGIN_DENIED' });
    }

    // Rate limiting
    if (!checkRateLimit_()) {
      return json({ success: false, error: 'Too many requests. Try again later.', code: 'RATE_LIMITED' });
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const token = data.token;

    // Login, health check, and setup don't require auth
    if (action === 'login') return json(handleLogin(data));
    if (action === 'ping') return json({ success: true });

    // Everything else requires valid session
    if (!checkAuth_(token)) return json({ success: false, error: 'Unauthorized', code: 'AUTH_EXPIRED' });

    switch (action) {
      case 'syncGoogleSheets': return json(syncGoogleSheets());
      case 'addContact': return json(addContact(data));
      case 'updateContact': return json(updateContact(data));
      case 'deleteContact': return json(deleteContact(parseInt(data.id)));
      case 'updateStatus': return json(updateStatus(data));
      case 'getFollowUpsDue': return json(getFollowUpsDue());
      case 'getClients': return json(getClients());
      case 'createClient': return json(createClient(data));
      case 'getTemplates': return json(getTemplates());
      case 'saveTemplates': return json(saveTemplates(data.templates));
      case 'getAppSettings': return json(getAppSettings());
      case 'saveAppSettings': return json(saveAppSettings(data.settings || data));
      case 'generateMessage': return json(generateMessage(data));
      case 'processCSVContent': return json(processCSVContent(data.csvContent, data.fileName));
      default: return json({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (e) {
    return json({ success: false, error: e.toString() });
  }
}

// ── Sheet Access ──
function getSheetId_() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty(PROP_SHEET_ID) || DEFAULT_SHEET_ID;
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(getSheetId_());
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function getClientSheet_() {
  const ss = SpreadsheetApp.openById(getSheetId_());
  let sheet = ss.getSheetByName(CLIENT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CLIENT_SHEET_NAME);
    sheet.appendRow(['Email','Password','Name','Business Name','Package','Status','Start Date','Phase 1','Phase 2','Phase 3','Views','Directions','Calls','Reviews','Token','Created At']);
  }
  return sheet;
}

function getAllRows_(sheet) {
  const d = sheet.getDataRange().getValues();
  if (d.length < 2) return [];
  const h = d[0];
  const result = [];
  for (let i = 1; i < d.length; i++) {
    const row = { _row: i + 1 };
    h.forEach((name, idx) => row[name] = d[i][idx] !== undefined ? d[i][idx].toString() : '');
    result.push(row);
  }
  return result;
}

function idForSheet_(sheet) {
  const d = sheet.getDataRange().getValues();
  if (d.length < 2) return 1;
  let maxId = 0;
  for (let i = 1; i < d.length; i++) {
    const v = parseInt(d[i][0], 10);
    if (v > maxId) maxId = v;
  }
  return maxId + 1;
}

// ── Clean Phone ──
function cleanPhone_(phone) {
  if (!phone) return '';
  const p = phone.toString().replace(/\D/g, '');
  if (p.startsWith('0')) return '233' + p.substring(1);
  if (!p.startsWith('233')) return '233' + p;
  return p;
}

function waLink_(phone) {
  const c = cleanPhone_(phone);
  return c ? 'https://wa.me/' + c : '';
}

// ── Auth ──
function login(username, password) {
  const props = PropertiesService.getScriptProperties();
  const storedUser = props.getProperty(PROP_ADMIN_USER);
  const storedPass = props.getProperty(PROP_ADMIN_PASS);

  // If credentials haven't been set up yet, allow first-time setup
  if (!storedUser || !storedPass) {
    return { success: false, error: 'Admin not configured. Run setupAdmin() in the Apps Script editor.', code: 'NOT_CONFIGURED' };
  }

  if (username !== storedUser || password !== storedPass) {
    return { success: false, error: 'Invalid credentials' };
  }
  const token = Utilities.getUuid();
  const expiry = Date.now() + SESSION_DURATION_MS;
  props.setProperty('SESSION_' + token, JSON.stringify({ expiry }));
  return { success: true, token, expiresAt: expiry };
}

// Legacy: called by old login function name
function handleLogin(data) {
  return login(data.username || data.user, data.password || data.pass);
}

// ── Security Helpers ──

function isAllowedOrigin_(e) {
  const props = PropertiesService.getScriptProperties();
  const allowed = props.getProperty(PROP_ALLOWED_ORIGINS) || 'https://marketing.gabochie.com,http://localhost:4000,http://localhost:3000';
  const origins = allowed.split(',').map(s => s.trim().toLowerCase());

  // Google Apps Script web apps don't expose HTTP headers (Origin/Referer).
  // Instead, the client sends _origin in the POST body.
  try {
    const data = JSON.parse(e.postData.contents);
    const bodyOrigin = data._origin || '';
    if (bodyOrigin && origins.some(o => bodyOrigin.toLowerCase().startsWith(o))) return true;
  } catch (_) {}

  // Allow if no _origin sent (legacy clients, direct API calls from authorized tools)
  return true;
}

function checkRateLimit_() {
  const props = PropertiesService.getScriptProperties();
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxReqs = 60; // max requests per minute

  const key = 'RL_COUNTER';
  const raw = props.getProperty(key);
  let data;

  if (raw) {
    try { data = JSON.parse(raw); } catch (_) { data = { window: now, count: 0 }; }
  } else {
    data = { window: now, count: 0 };
  }

  // Reset window if expired
  if (now - data.window > windowMs) {
    data = { window: now, count: 0 };
  }

  data.count++;
  props.setProperty(key, JSON.stringify(data));
  return data.count <= maxReqs;
}

/**
 * Run this once from the Apps Script editor to set up admin credentials
 * and other configuration. Never hardcode secrets in source code.
 */
function setupAdmin() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  if (!props.getProperty(PROP_ADMIN_USER)) {
    const user = ui.prompt('Set Admin Username', 'Enter the admin username:', ui.ButtonSet.OK_CANCEL);
    if (user.getSelectedButton() !== ui.Button.OK) return;
    props.setProperty(PROP_ADMIN_USER, user.getResponseText());
  }

  if (!props.getProperty(PROP_ADMIN_PASS)) {
    const pass = ui.prompt('Set Admin Password', 'Enter a strong admin password (min 8 chars):', ui.ButtonSet.OK_CANCEL);
    if (pass.getSelectedButton() !== ui.Button.OK) return;
    if (pass.getResponseText().length < 8) {
      ui.alert('Password must be at least 8 characters. Run setupAdmin() again.');
      return;
    }
    props.setProperty(PROP_ADMIN_PASS, pass.getResponseText());
  }

  if (!props.getProperty(PROP_SHEET_ID)) {
    props.setProperty(PROP_SHEET_ID, DEFAULT_SHEET_ID);
  }

  if (!props.getProperty(PROP_ALLOWED_ORIGINS)) {
    props.setProperty(PROP_ALLOWED_ORIGINS, 'https://marketing.gabochie.com,http://localhost:4000,http://localhost:3000');
  }

  ui.alert('Admin configured successfully!\n\nThe SHEET_ID, admin credentials, and allowed origins are now stored in Script Properties (not in source code).\n\nYou can update these anytime from the Apps Script editor:\n  File → Project properties → Script properties');
}

// ── Sync: Pull All Contacts ──
function syncGoogleSheets() {
  const sheet = getSheet_();
  const rows = getAllRows_(sheet);
  const contacts = [];
  rows.forEach(r => {
    if (r.Deleted && r.Deleted.toLowerCase() === 'yes') return;
    contacts.push({
      id: parseInt(r.ID, 10) || 0,
      name: r['Prospect Name'] || '',
      biz: r['Business Name'] || '',
      phone: r['Phone'] || '',
      email: r['Email'] || '',
      website: r['Website'] || '',
      type: r['Business Type'] || '',
      loc: r['Location'] || '',
      ownerName: r['Owner Name'] || '',
      gbpStatus: r['GBP Status'] || 'none',
      leadSource: r['Lead Source'] || 'Google Maps',
      funnelStage: r['Funnel Stage'] || 'tofu',
      status: r['Pipeline Status'] || 'new',
      leadType: r['Lead Type'] || 'unknown',
      offerType: r['Offer Type'] || 'service',
      productOffer: r['Product Offer'] || '',
      outreachMessage: r['Outreach Message'] || '',
      outreachCategory: r['Outreach Category'] || '',
      followup: r['Follow-up'] || '',
      lastContact: r['Last Contact'] || '',
      notes: r['Notes'] || '',
      offerUrlSent: r['Offer URL Sent'] || '',
      assignedOffer: r['Assigned Offer'] || '',
      ctaType: r['CTA Type'] || '',
      aiModel: r['AI Model'] || '',
      lastGeneratedAt: r['Last Generated At'] || '',
      lastMessageType: r['Last Message Type'] || '',
      rating: r['Rating'] || '',
      createdAt: r['Created At'] || '',
      _row: r._row
    });
  });
  return contacts;
}

// ── Add Contact ──
function addContact(data) {
  try {
    const sheet = getSheet_();
    const id = idForSheet_(sheet);
    const ts = new Date().toISOString();
    const phone = data.phone || '';
    const row = [
      id, data.name || '', data.businessName || '', phone, waLink_(phone),
      data.email || '', data.website || '', data.subcategory || '',
      data.location || '', data.ownerName || '', data.gbpStatus || 'none',
      data.leadSource || 'Google Maps', data.funnelStage || 'tofu',
      data.status || 'new', data.leadType || 'unknown',
      data.offerType || 'service', data.productOffer || '', '',
      data.outreachCategory || '', '', '', data.note || '',
      '', '', '', '', '', '', '', ts, ''
    ];
    sheet.appendRow(row);
    return { success: true, message: 'Contact added', id };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Bulk Add ──
function bulkAddContacts(contacts) {
  try {
    const sheet = getSheet_();
    let added = 0;
    contacts.forEach(c => {
      addContact(c);
      added++;
    });
    return { success: true, added, message: added + ' contacts added' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Update Pipeline Status ──
function updateStatus(data) {
  try {
    const sheet = getSheet_();
    const rows = getAllRows_(sheet);
    const match = rows.find(r => parseInt(r.ID, 10) === data.id);
    if (!match) return { success: false, error: 'Contact not found' };
    const colIdx = HEADERS.indexOf('Pipeline Status') + 1;
    sheet.getRange(match._row, colIdx).setValue(data.status);

    // Auto-set follow-up
    const fupCol = HEADERS.indexOf('Follow-up') + 1;
    if (data.status === 'contacted') sheet.getRange(match._row, fupCol).setValue('Follow up Day 3');
    else if (data.status === 'replied') sheet.getRange(match._row, fupCol).setValue('Follow up Day 7');
    else if (data.status === 'interested' || data.status === 'closed') sheet.getRange(match._row, fupCol).setValue('');

    return { success: true, message: 'Status updated to ' + data.status };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Update Outreach Message ──
function updateOutreachMessage(data) {
  try {
    const sheet = getSheet_();
    const rows = getAllRows_(sheet);
    const match = rows.find(r => parseInt(r.ID, 10) === data.id);
    if (!match) return { success: false, error: 'Contact not found' };
    const colIdx = HEADERS.indexOf('Outreach Message') + 1;
    sheet.getRange(match._row, colIdx).setValue(data.message);
    return { success: true, message: 'Message saved' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Bulk Update Messages ──
function bulkUpdateOutreachMessage(updates) {
  try {
    updates.forEach(u => updateOutreachMessage(u));
    return { success: true, message: updates.length + ' messages saved' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Update Contact (all fields) ──
function updateContact(data) {
  try {
    const sheet = getSheet_();
    const rows = getAllRows_(sheet);
    const match = rows.find(r => parseInt(r.ID, 10) === data.id);
    if (!match) return { success: false, error: 'Contact not found' };

    const fields = {
      'Prospect Name': data.name,
      'Business Name': data.businessName,
      'Phone': data.phone,
      'Email': data.email,
      'Business Type': data.bizType,
      'Funnel Stage': data.funnelStage,
      'Pipeline Status': data.status,
      'Lead Type': data.leadType,
      'Lead Source': data.leadSource,
      'Notes': data.notes
    };

    Object.keys(fields).forEach(key => {
      if (fields[key] !== undefined) {
        const idx = HEADERS.indexOf(key);
        if (idx >= 0) sheet.getRange(match._row, idx + 1).setValue(fields[key]);
      }
    });

    return { success: true, message: 'Contact updated' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Delete Contact (soft delete) ──
function deleteContact(id) {
  try {
    const sheet = getSheet_();
    const rows = getAllRows_(sheet);
    const match = rows.find(r => parseInt(r.ID, 10) === id);
    if (!match) return { success: false, error: 'Contact not found' };
    const colIdx = HEADERS.indexOf('Deleted') + 1;
    sheet.getRange(match._row, colIdx).setValue('yes');
    return { success: true, message: 'Contact deleted' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Mark Message Sent ──
function markMessageSent(data) {
  try {
    const sheet = getSheet_();
    const rows = getAllRows_(sheet);
    const match = rows.find(r => parseInt(r.ID, 10) === data.id);
    if (!match) return { success: false, error: 'Contact not found' };
    const now = new Date().toISOString();
    const cols = {
      'Pipeline Status': data.status || match['Pipeline Status'],
      'Funnel Stage': data.funnelStage || match['Funnel Stage'],
      'Last Contact': now,
      'Offer URL Sent': data.offerUrlSent || match['Offer URL Sent'] || '',
      'Assigned Offer': data.assignedOffer || match['Assigned Offer'] || '',
      'CTA Type': data.ctaType || match['CTA Type'] || '',
      'Last Message Type': data.funnelStage || '',
      'Last Generated At': now
    };
    Object.keys(cols).forEach(key => {
      const idx = HEADERS.indexOf(key);
      if (idx >= 0) sheet.getRange(match._row, idx + 1).setValue(cols[key]);
    });
    return { success: true, message: 'Message marked as sent' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Follow-ups Due ──
function getFollowUpsDue() {
  try {
    const sheet = getSheet_();
    const rows = getAllRows_(sheet);
    const now = new Date();
    const dueLeads = [];
    rows.forEach(r => {
      if (r.Deleted && r.Deleted.toLowerCase() === 'yes') return;
      if (r['Follow-up'] && r['Pipeline Status'] !== 'closed' && r['Pipeline Status'] !== 'cold') {
        const fup = r['Follow-up'].toLowerCase();
        let due = false;
        if (fup.includes('day 3') || fup.includes('day3')) {
          const last = r['Last Contact'] ? new Date(r['Last Contact']) : null;
          if (last) {
            const diff = (now.getTime() - last.getTime()) / 86400000;
            if (diff >= 3) due = true;
          } else {
            due = true;
          }
        }
        if (fup.includes('day 7') || fup.includes('day7')) {
          const last = r['Last Contact'] ? new Date(r['Last Contact']) : null;
          if (last) {
            const diff = (now.getTime() - last.getTime()) / 86400000;
            if (diff >= 7) due = true;
          } else {
            due = true;
          }
        }
        if (due) {
          dueLeads.push({
            id: parseInt(r.ID, 10),
            name: r['Prospect Name'] || r['Business Name'] || '',
            businessName: r['Business Name'] || '',
            phone: r['Phone'] || '',
            followup: r['Follow-up']
          });
        }
      }
    });
    return { success: true, dueLeads };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Templates ──
function getTemplates() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(PROP_TEMPLATES);
  const defaults = {
    day1: 'Hello {name}, I was looking up {type} businesses in {area} and came across {biz}. I noticed {gbpObservation} I help businesses become visible on Google Maps. If useful, I can do a free audit for you.',
    day3: 'Hello {name}, following up on {biz}. I checked again and noticed {gbpObservation} I can help fix that. Would you be open to a quick chat?',
    day7: 'Hello {name}, if we start now I can get {biz} visible on Google Maps within 48 hours. If it does not show up as agreed, you do not pay. Can I start today?',
    network: 'Hello {name}, hope you are doing well. I have been helping Ghana businesses improve how they show up on Google Maps, and when I looked at {biz} I noticed {gbpObservation} If useful, message me and I will show you what I recommend.'
  };
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { return defaults; }
  }
  return defaults;
}

function saveTemplates(templates) {
  try {
    PropertiesService.getScriptProperties().setProperty(PROP_TEMPLATES, JSON.stringify(templates));
    return { success: true, message: 'Templates saved' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── App Settings ──
function getAppSettings() {
  const props = PropertiesService.getScriptProperties();
  return {
    targetSheetName: props.getProperty(PROP_SHEET_NAME) || SHEET_NAME,
    // API Provider
    apiProvider: props.getProperty(PROP_API_PROVIDER) || 'gemini',
    hasGeminiKey: !!props.getProperty(PROP_GEMINI_KEY),
    geminiModel: props.getProperty(PROP_GEMINI_MODEL) || DEFAULT_GEMINI_MODEL,
    hasGroqKey: !!props.getProperty(PROP_GROQ_KEY),
    groqModel: props.getProperty(PROP_GROQ_MODEL) || DEFAULT_GROQ_MODEL,
    ollamaUrl: props.getProperty(PROP_OLLAMA_URL) || DEFAULT_OLLAMA_URL,
    ollamaModel: props.getProperty(PROP_OLLAMA_MODEL) || DEFAULT_OLLAMA_MODEL
  };
}

function saveAppSettings(settings) {
  try {
    const props = PropertiesService.getScriptProperties();
    if (settings.targetSheetName) props.setProperty(PROP_SHEET_NAME, settings.targetSheetName);
    if (settings.apiProvider) props.setProperty(PROP_API_PROVIDER, settings.apiProvider);
    if (settings.geminiApiKey !== undefined) props.setProperty(PROP_GEMINI_KEY, settings.geminiApiKey);
    if (settings.geminiModel) props.setProperty(PROP_GEMINI_MODEL, settings.geminiModel);
    if (settings.groqApiKey !== undefined) props.setProperty(PROP_GROQ_KEY, settings.groqApiKey);
    if (settings.groqModel) props.setProperty(PROP_GROQ_MODEL, settings.groqModel);
    if (settings.ollamaUrl) props.setProperty(PROP_OLLAMA_URL, settings.ollamaUrl);
    if (settings.ollamaModel) props.setProperty(PROP_OLLAMA_MODEL, settings.ollamaModel);
    const hasAnyKey = !!(props.getProperty(PROP_GEMINI_KEY) || props.getProperty(PROP_GROQ_KEY));
    return { success: true, hasAnyKey };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Multi-Provider Message Generation ──
function buildPrompt_(payload) {
  const gbpObs = {
    none: 'your business is not showing up properly on Google Maps yet.',
    unclaimed: 'your Google listing appears to be unclaimed.',
    poor: 'your Google listing exists but needs stronger photos, details, and WhatsApp visibility.',
    claimed: 'your listing exists but can be improved to convert more searchers into enquiries.'
  }[payload.gbpStatus || 'none'];
  const stageLabel = { tofu: 'cold first contact', mofu: 'follow-up after reply', bofu: 'closing/final push', network: 'personal network warm outreach' }[payload.funnelStage || 'tofu'];
  return `You are a sales outreach assistant for Gabochie Marketing, a Ghana-based agency that helps local businesses get found on Google Maps.

Generate a short, warm WhatsApp outreach message (max 250 words) for a ${stageLabel} prospect.

Context:
- Prospect Name: ${payload.name}
- Business Name: ${payload.businessName || 'their business'}
- Business Type: ${payload.businessType || 'local business'}
- Location: ${payload.area || 'Accra, Ghana'}
- Owner: ${payload.ownerName || payload.name}
- Google Visibility: ${gbpObs}
- Offer: ${payload.offer || 'Google Maps visibility services'}
- Lead Source: ${payload.leadSource || 'Google Maps'}

Rules:
- Be warm, professional, and personal
- Reference their specific business and location
- Mention the Google visibility observation naturally
- End with a clear, low-friction call to action
- Use Ghanaian-friendly English
- DO NOT use placeholders like {name} or {biz} - be specific
- Keep it conversational, not salesy
- Write in first person (I/we)`;
}

function callGemini_(payload) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty(PROP_GEMINI_KEY);
  if (!apiKey) return { success: false, error: 'No Gemini API key configured' };
  const model = props.getProperty(PROP_GEMINI_MODEL) || DEFAULT_GEMINI_MODEL;
  const prompt = buildPrompt_(payload);
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
  const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 512 } };
  try {
    const response = UrlFetchApp.fetch(url, { method: 'POST', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const message = result.candidates[0].content.parts.map(p => p.text).join('\n').trim();
      return { success: true, message, provider: 'gemini', model };
    }
    // Check for blocked content
    if (result.promptFeedback && result.promptFeedback.blockReason) {
      return { success: false, error: 'Blocked: ' + result.promptFeedback.blockReason };
    }
    return { success: false, error: 'Gemini returned no content' };
  } catch (e) {
    return { success: false, error: e.toString(), provider: 'gemini' };
  }
}

function callGroq_(payload) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty(PROP_GROQ_KEY);
  if (!apiKey) return { success: false, error: 'No Groq API key configured' };
  const model = props.getProperty(PROP_GROQ_MODEL) || DEFAULT_GROQ_MODEL;
  const prompt = buildPrompt_(payload);

  const systemMsg = 'You are a sales outreach assistant for Gabochie Marketing, a Ghana-based marketing agency. Write warm, professional WhatsApp messages in Ghanaian-friendly English. Keep messages under 250 words, conversational, and end with a clear CTA.';
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const body = { model, messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 512 };

  try {
    const response = UrlFetchApp.fetch(url, { method: 'POST', headers: { 'Authorization': 'Bearer ' + apiKey }, contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    if (result.choices && result.choices[0] && result.choices[0].message) {
      return { success: true, message: result.choices[0].message.content.trim(), provider: 'groq', model };
    }
    return { success: false, error: 'Groq returned no content' };
  } catch (e) {
    return { success: false, error: e.toString(), provider: 'groq' };
  }
}

function callOllama_(payload) {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty(PROP_OLLAMA_URL) || DEFAULT_OLLAMA_URL;
  const model = props.getProperty(PROP_OLLAMA_MODEL) || DEFAULT_OLLAMA_MODEL;
  const prompt = buildPrompt_(payload);

  const url = baseUrl.replace(/\/$/, '') + '/api/generate';
  const body = { model, prompt: 'You are a sales outreach assistant for Gabochie Marketing. ' + prompt, stream: false, options: { temperature: 0.7 } };

  try {
    const response = UrlFetchApp.fetch(url, { method: 'POST', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    if (result.response) {
      return { success: true, message: result.response.trim(), provider: 'ollama', model };
    }
    return { success: false, error: 'Ollama returned no response' };
  } catch (e) {
    return { success: false, error: e.toString(), provider: 'ollama' };
  }
}

/**
 * Generate message using configured provider with fallback chain.
 * Attempts primary provider first, then falls back through the chain.
 */
function generateMessage(payload) {
  const props = PropertiesService.getScriptProperties();
  const primary = props.getProperty(PROP_API_PROVIDER) || 'gemini';
  // Define fallback order based on primary
  const order = [];
  if (primary === 'gemini') { order.push('gemini', 'groq', 'ollama'); }
  else if (primary === 'groq') { order.push('groq', 'gemini', 'ollama'); }
  else { order.push('ollama', 'groq', 'gemini'); }

  const errors = [];
  for (let i = 0; i < order.length; i++) {
    const provider = order[i];
    let result;
    if (provider === 'gemini') result = callGemini_(payload);
    else if (provider === 'groq') result = callGroq_(payload);
    else result = callOllama_(payload);

    if (result && result.success) {
      // Include fallback info
      result.fallbackUsed = i > 0;
      result.attemptedProviders = order.slice(0, i + 1);
      return result;
    }
    errors.push(provider + ': ' + (result.error || 'unknown error'));
  }

  return { success: false, error: 'All providers failed: ' + errors.join(' | '), errors };
}

// ── CSV Processing ──
function processCSVContent(csvContent, fileName) {
  try {
    const rows = Utilities.parseCsv(csvContent);
    if (rows.length < 2) return { success: false, error: 'CSV has no data rows' };

    const sheet = getSheet_();
    const existing = getAllRows_(sheet);
    const existingPhones = new Set(existing.map(r => cleanPhone_(r['Phone'])));

    const headerMap = {};
    const h = rows[0].map(x => x.toString().trim().toLowerCase());
    h.forEach((name, i) => {
      if (name.includes('name') || name.includes('prospect')) headerMap['Prospect Name'] = i;
      if (name.includes('business') || name.includes('company') || name.includes('biz')) headerMap['Business Name'] = i;
      if (name.includes('phone') || name.includes('mobile') || name.includes('whatsapp') || name.includes('contact')) headerMap['Phone'] = i;
      if (name.includes('type') || name.includes('category') || name.includes('industry')) headerMap['Business Type'] = i;
      if (name.includes('location') || name.includes('address') || name.includes('area') || name.includes('city')) headerMap['Location'] = i;
      if (name.includes('email')) headerMap['Email'] = i;
      if (name.includes('website') || name.includes('web')) headerMap['Website'] = i;
      if (name.includes('notes') || name.includes('note')) headerMap['Notes'] = i;
    });

    let processed = 0, duplicates = 0, dummyRecords = 0, invalidPhones = 0;
    const warnings = [];
    const ts = new Date().toISOString();

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const name = headerMap['Prospect Name'] !== undefined ? r[headerMap['Prospect Name']] || '' : '';
      const biz = headerMap['Business Name'] !== undefined ? r[headerMap['Business Name']] || '' : name;
      const phone = headerMap['Phone'] !== undefined ? r[headerMap['Phone']] || '' : '';
      const type = headerMap['Business Type'] !== undefined ? r[headerMap['Business Type']] || '' : '';
      const loc = headerMap['Location'] !== undefined ? r[headerMap['Location']] || '' : '';
      const email = headerMap['Email'] !== undefined ? r[headerMap['Email']] || '' : '';
      const website = headerMap['Website'] !== undefined ? r[headerMap['Website']] || '' : '';
      const notes = headerMap['Notes'] !== undefined ? r[headerMap['Notes']] || '' : '';

      // Skip test/dummy records
      if (/test|dummy|sample/i.test(name) && /test|dummy|sample/i.test(biz)) {
        dummyRecords++;
        warnings.push('Row ' + (i + 1) + ': Skipped dummy/test record - ' + name);
        continue;
      }

      if (!name && !biz) { dummyRecords++; continue; }

      const cleanPhone = cleanPhone_(phone);
      if (cleanPhone.length < 10) {
        invalidPhones++;
        warnings.push('Row ' + (i + 1) + ': Invalid phone ' + phone + ' - ' + name);
      }

      // Duplicate check
      if (cleanPhone && existingPhones.has(cleanPhone)) {
        duplicates++;
        warnings.push('Row ' + (i + 1) + ': Duplicate removed - ' + name + ' (' + phone + ')');
        continue;
      }

      const id = idForSheet_(sheet);
      const row = [
        id, name, biz, phone, waLink_(phone),
        email, website, type, loc, '',
        'none', 'Google Maps', 'tofu', 'new', 'unknown',
        'service', '', '', 'CSV Import', '', '', notes,
        '', '', '', '', '', '', '', '', ts, ''
      ];
      sheet.appendRow(row);
      if (cleanPhone) existingPhones.add(cleanPhone);
      processed++;
    }

    // Generate CSV output
    let csvOut = HEADERS.join(',') + '\n';
    const allRows = getAllRows_(sheet);
    allRows.forEach(r => {
      if (r.Deleted && r.Deleted.toLowerCase() === 'yes') return;
      csvOut += HEADERS.map(h => '"' + (r[h] || '').replace(/"/g, '""') + '"').join(',') + '\n';
    });

    return {
      success: true,
      data: {
        totalRows: rows.length - 1,
        processed,
        duplicates,
        dummyRecords,
        invalidPhones,
        warnings,
        csvData: csvOut
      }
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Bulk Upload Processed CSV ──
function bulkUploadProcessedContacts(csvData) {
  try {
    if (!csvData) return { success: false, error: 'No data provided' };
    const rows = Utilities.parseCsv(csvData);
    if (rows.length < 2) return { success: false, error: 'No valid rows' };
    const sheet = getSheet_();
    const existing = getAllRows_(sheet);
    const existingPhones = new Set(existing.map(r => cleanPhone_(r['Phone'])));
    let uploaded = 0, duplicates = 0;

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const name = r[1] || '';
      const phone = r[3] || '';
      const cleanPhone = cleanPhone_(phone);
      if (cleanPhone && existingPhones.has(cleanPhone)) { duplicates++; continue; }
      const id = idForSheet_(sheet);
      r[0] = id.toString();
      r[4] = waLink_(phone);
      r[29] = new Date().toISOString();
      sheet.appendRow(r);
      if (cleanPhone) existingPhones.add(cleanPhone);
      uploaded++;
    }

    return { success: true, message: 'Uploaded ' + uploaded + ' contacts', uploaded, duplicates };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ── Client Management ──
function getClients() {
  const sheet = getClientSheet_();
  const d = sheet.getDataRange().getValues();
  const clients = [];
  const h = d[0];
  for (let i = 1; i < d.length; i++) {
    const c = { _row: i + 1 };
    h.forEach((name, idx) => c[name] = d[i][idx] !== undefined ? d[i][idx].toString() : '');
    clients.push(c);
  }
  return { success: true, clients };
}

function createClient(data) {
  const sheet = getClientSheet_();
  // Check duplicate email
  const existing = getClients().clients;
  if (existing.some(c => c.Email === data.email)) {
    return { success: false, message: 'Client already exists' };
  }
  const pw = Math.random().toString(36).slice(-8);
  const token = Utilities.getUuid();
  sheet.appendRow([
    data.email, pw, data.name, data.businessName, data.package || 'Growth System',
    'Onboarding', new Date().toISOString().split('T')[0],
    'pending', 'pending', 'pending', '0', '0', '0', '0',
    token, new Date().toISOString()
  ]);
  return { success: true, message: 'Client created', tempPassword: pw };
}

function updateClient(data) {
  const sheet = getClientSheet_();
  const row = data._row;
  const fields = ['Email','Password','Name','Business Name','Package','Status','Start Date','Phase 1','Phase 2','Phase 3','Views','Directions','Calls','Reviews'];
  fields.forEach((f, idx) => {
    if (data[f] !== undefined) sheet.getRange(row, idx + 1).setValue(data[f]);
  });
  return { success: true, message: 'Client updated' };
}
