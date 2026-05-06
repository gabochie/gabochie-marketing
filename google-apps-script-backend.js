/**
 * Google Apps Script Backend for Gabochie Marketing Lead Capture
 * This script receives form submissions and saves them to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Copy this entire code into the script editor
 * 3. Create a Google Sheet named "Gabochie Marketing Leads"
 * 4. Copy the Sheet ID from the URL and paste it in SHEET_ID below
 * 5. Deploy as Web App: Deploy > New Deployment > Web App
 * 6. Set "Execute as: Me" and "Who has access: Anyone"
 * 7. Copy the Web App URL and paste it in your website's GOOGLE_SCRIPT_URL
 */

// Configuration
const SHEET_NAME = 'Leads';
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your actual Sheet ID

// Column headers matching your CSV structure
const HEADERS = [
  'Prospect Name',
  'BusinessName',
  'Phone',
  'WhatsAppLink',
  'Address',
  'Business Type',
  'OutreachCategory',
  'Status',
  'Followup',
  'Notes',
  'LastContact',
  'Website',
  'Email',
  'Rating',
  'OutreachMessage',
  'OfferType',
  'ProductOffer',
  'Source',
  'Timestamp'
];

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Gabochie Marketing Lead Capture API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests from the website form
 */
function doPost(e) {
  try {
    // Parse the JSON payload
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the sheet
    const sheet = getOrCreateSheet();
    
    // Prepare the row data matching CSV structure
    const rowData = [
      data.prospectName || '',           // Prospect Name
      data.businessName || '',           // BusinessName
      data.phone || '',                  // Phone
      generateWhatsAppLink(data.phone),  // WhatsAppLink
      data.address || '',                // Address
      data.businessType || '',           // Business Type
      data.outreachCategory || 'Website Lead', // OutreachCategory
      data.status || 'new',             // Status
      '',                               // Followup
      data.notes || '',                 // Notes
      new Date().toISOString(),         // LastContact
      data.website || '',               // Website
      data.email || '',                 // Email
      '',                               // Rating
      '',                               // OutreachMessage
      data.offerType || '',             // OfferType
      data.productOffer || '',          // ProductOffer
      data.source || 'website',         // Source
      data.timestamp || new Date().toISOString() // Timestamp
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Lead captured successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log error for debugging
    console.error('Error processing lead:', error);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get or create the spreadsheet and sheet
 */
function getOrCreateSheet() {
  try {
    // Try to open existing spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1A7B3A');
      headerRange.setFontColor('#FFFFFF');
      
      // Auto-resize columns
      sheet.autoResizeColumns(1, HEADERS.length);
    }
    
    return sheet;
  } catch (error) {
    // If sheet doesn't exist, create new one
    const spreadsheet = SpreadsheetApp.create('Gabochie Marketing Leads');
    const sheet = spreadsheet.getActiveSheet();
    sheet.setName(SHEET_NAME);
    sheet.appendRow(HEADERS);
    
    // Log the new sheet ID (you'll need to update SHEET_ID constant)
    console.log('New spreadsheet created. ID:', spreadsheet.getId());
    console.log('URL:', spreadsheet.getUrl());
    
    return sheet;
  }
}

/**
 * Generate WhatsApp link from phone number
 */
function generateWhatsAppLink(phone) {
  if (!phone) return '';
  
  // Clean the phone number (remove spaces, dashes, etc.)
  const cleanPhone = phone.toString().replace(/\D/g, '');
  
  // Add country code if missing (Ghana = 233)
  let formattedPhone = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    formattedPhone = '233' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('233')) {
    formattedPhone = '233' + cleanPhone;
  }
  
  return `https://wa.me/${formattedPhone}`;
}

/**
 * Test function (run this to verify setup)
 */
function testScript() {
  const testData = {
    prospectName: 'Test User',
    businessName: 'Test Business',
    phone: '+233501234567',
    email: 'test@example.com',
    address: 'Accra, Ghana',
    businessType: 'Restaurant/Food',
    website: 'https://testbusiness.com',
    notes: 'This is a test submission',
    outreachCategory: 'Website Audit Request',
    status: 'new',
    offerType: 'Free Google Visibility Audit',
    productOffer: 'Google Maps Optimization',
    source: 'test',
    timestamp: new Date().toISOString()
  };
  
  // Simulate POST request
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
}

/**
 * Setup function - run once to create headers
 */
function setupSheet() {
  const sheet = getOrCreateSheet();
  console.log('Sheet ready:', sheet.getParent().getUrl());
}

/**
 * Client Portal Functions
 * Handles authentication and dashboard data for client portal
 */

const CLIENT_SHEET_NAME = 'Clients';
const CLIENT_HEADERS = [
  'Email', 'Password', 'Name', 'BusinessName', 'Package', 'Status', 'StartDate', 
  'Phase1_Status', 'Phase2_Status', 'Phase3_Status',
  'Stats_Views', 'Stats_Directions', 'Stats_Calls', 'Stats_Reviews',
  'Token', 'CreatedAt'
];

/**
 * Enhanced doPost with client portal actions
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Route based on action type
    if (data.action === 'clientLogin') {
      return handleClientLogin(data);
    } else if (data.action === 'getClientDashboard') {
      return getClientDashboard(data);
    } else if (data.action === 'registerClient') {
      return registerClient(data);
    } else {
      // Original lead capture logic
      return handleLeadCapture(data);
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle client login
 */
function handleClientLogin(data) {
  const clientSheet = getOrCreateClientSheet();
  const data_range = clientSheet.getDataRange();
  const values = data_range.getValues();
  
  // Find client by email
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email && values[i][1] === data.password) {
      // Generate token
      const token = Utilities.getUuid();
      clientSheet.getRange(i + 1, 15).setValue(token); // Store token
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        token: token,
        name: values[i][2],
        businessName: values[i][3],
        package: values[i][4]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Invalid email or password'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get client dashboard data
 */
function getClientDashboard(data) {
  const clientSheet = getOrCreateClientSheet();
  const data_range = clientSheet.getDataRange();
  const values = data_range.getValues();
  
  // Find client by email and validate token
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email && values[i][14] === data.token) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        name: values[i][2],
        businessName: values[i][3],
        package: values[i][4],
        status: values[i][5],
        startDate: values[i][6],
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
          { date: '2026-05-10', description: 'Profile optimization completed' },
          { date: '2026-05-08', description: 'Started Phase 1: Foundation' },
          { date: '2026-05-06', description: 'Package purchased - Growth System' }
        ]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'Session expired. Please login again.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Register new client from package purchase
 */
function registerClient(data) {
  const clientSheet = getOrCreateClientSheet();
  
  // Check if email already exists
  const data_range = clientSheet.getDataRange();
  const values = data_range.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.email) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Client already exists'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8);
  const token = Utilities.getUuid();
  
  // Add new client
  const rowData = [
    data.email,
    tempPassword,
    data.name,
    data.businessName,
    data.package,
    'Onboarding',
    new Date().toISOString().split('T')[0],
    'pending', // Phase 1
    'pending', // Phase 2
    'pending', // Phase 3
    '0', '0', '0', '0', // Stats
    token,
    new Date().toISOString()
  ];
  
  clientSheet.appendRow(rowData);
  
  // Send welcome email with credentials (in production)
  console.log('New client registered:', data.email);
  console.log('Temporary password:', tempPassword);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Client registered successfully',
    tempPassword: tempPassword
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get or create client sheet
 */
function getOrCreateClientSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(CLIENT_SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CLIENT_SHEET_NAME);
    sheet.appendRow(CLIENT_HEADERS);
    
    // Format header
    const headerRange = sheet.getRange(1, 1, 1, CLIENT_HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1A7B3A');
    headerRange.setFontColor('#FFFFFF');
  }
  
  return sheet;
}

/**
 * Original lead capture handler
 */
function handleLeadCapture(data) {
  const sheet = getOrCreateSheet();
  
  const rowData = [
    data.prospectName || '',
    data.businessName || '',
    data.phone || '',
    generateWhatsAppLink(data.phone),
    data.address || '',
    data.businessType || '',
    data.outreachCategory || 'Website Lead',
    data.status || 'new',
    '',
    data.notes || '',
    new Date().toISOString(),
    data.website || '',
    data.email || '',
    '',
    '',
    data.offerType || '',
    data.productOffer || '',
    data.source || 'website',
    data.timestamp || new Date().toISOString()
  ];
  
  sheet.appendRow(rowData);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Lead captured successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}
