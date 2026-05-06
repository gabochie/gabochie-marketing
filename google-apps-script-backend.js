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
