/**
 * Google Apps Script Backend for Gabochie Marketing
 * Handles website form capture and client portal
 * Single source of truth: Google Sheet ID below
 */

const SHEET_ID = '1yvFvoIeVrOyBjocXBLAg1onDLKEFtdSxSkD4M5I1tl4';
const LEADS_SHEET = 'Leads';
const CLIENTS_SHEET = 'Clients';

const LEADS_HEADERS = [
  'Timestamp','DateAdded','ProspectName','BusinessName','Phone','Email','BusinessType','Area',
  'FunnelStage','PipelineStatus','LeadType','Instagram','Facebook','Website','GBPLink','GBPStatus',
  'OfferType','OutreachMessage','LastContact','FollowupDate','FollowupNote','Notes','Source',
  'Rating','Address','WhatsAppLink','ProductOffer','OutreachCategory','Status','Followup','GBPObservation'
];

const CLIENT_HEADERS = [
  'Email','Password','Name','BusinessName','Package','Status','StartDate',
  'Phase1_Status','Phase2_Status','Phase3_Status',
  'Stats_Views','Stats_Directions','Stats_Calls','Stats_Reviews',
  'Token','CreatedAt'
];

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Gabochie Marketing API is running',
    sheetId: SHEET_ID
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'clientLogin') return handleClientLogin(data);
    if (data.action === 'getClientDashboard') return getClientDashboard(data);
    if (data.action === 'registerClient') return registerClient(data);

    return handleLeadCapture(data);
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
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

  const rowData = [
    new Date().toISOString(),
    new Date().toISOString().split('T')[0],
    data.ProspectName || data.name || '',
    data.BusinessName || data.businessName || data.biz || '',
    data.Phone || data.phone || '',
    data.Email || data.email || '',
    data.BusinessType || data.businessType || data.type || '',
    data.Address || data.address || data.area || '',
    'TOFU',
    'New',
    'Potential Client',
    data.Instagram || data.ig || '',
    data.Facebook || data.fb || '',
    data.Website || data.website || '',
    data.GBPLink || '',
    '',
    data.OfferType || data.offerType || '',
    generateOutreachMessage(data),
    '',
    '',
    '',
    data.Notes || data.notes || '',
    data.Source || 'website',
    '',
    data.Address || '',
    generateWhatsAppLink(data.Phone || data.phone),
    data.ProductOffer || '',
    data.OutreachCategory || 'Website Lead',
    'new',
    '',
    ''
  ];

  sheet.appendRow(rowData);

  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Lead captured successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ── Client Portal ──

function handleClientLogin(data) {
  const sheet = getOrCreateSheet(CLIENTS_SHEET, CLIENT_HEADERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email && values[i][1] === data.password) {
      const token = Utilities.getUuid();
      sheet.getRange(i + 1, 15).setValue(token);
      return ContentService.createTextOutput(JSON.stringify({
        success: true, token: token,
        name: values[i][2], businessName: values[i][3], package: values[i][4]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false, message: 'Invalid email or password'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getClientDashboard(data) {
  const sheet = getOrCreateSheet(CLIENTS_SHEET, CLIENT_HEADERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email && values[i][14] === data.token) {
      return ContentService.createTextOutput(JSON.stringify({
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
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false, message: 'Session expired. Please login again.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function registerClient(data) {
  const sheet = getOrCreateSheet(CLIENTS_SHEET, CLIENT_HEADERS);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, message: 'Client already exists'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  const tempPassword = Math.random().toString(36).slice(-8);
  const token = Utilities.getUuid();

  sheet.appendRow([
    data.email, tempPassword, data.name, data.businessName,
    data.package, 'Onboarding', new Date().toISOString().split('T')[0],
    'pending', 'pending', 'pending',
    '0', '0', '0', '0',
    token, new Date().toISOString()
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    success: true, message: 'Client registered successfully',
    tempPassword: tempPassword
  })).setMimeType(ContentService.MimeType.JSON);
}
