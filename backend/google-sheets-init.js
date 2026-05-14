/**
 * Google Sheets Header Initialization & Styling
 * Automatically creates and styles headers in Google Sheets
 */

class GoogleSheetsInitializer {
  constructor() {
    this.sheetId = '1yvFvoIeVrOyBjocXBLAg1onDLKEFtdSxSkD4M5I1tl4';
    this.sheetName = 'Leads';
    this.apiKey = null; // Will use Google Apps Script instead
  }

  /**
   * Initialize Google Sheet with proper headers and styling
   */
  async initializeSheet() {
    const headers = [
      'ID', 'Prospect Name', 'Business Name', 'Phone', 'WhatsApp Link',
      'Email', 'Website', 'Business Type', 'Location', 'Owner Name',
      'GBP Status', 'Lead Source', 'Funnel Stage', 'Pipeline Status',
      'Lead Type', 'Offer Type', 'Product Offer', 'Outreach Message',
      'Outreach Category', 'Follow-up', 'Last Contact', 'Notes',
      'Offer URL Sent', 'Assigned Offer', 'CTA Type', 'AI Model',
      'Last Generated At', 'Last Message Type', 'Rating',
      'Created At', 'Deleted'
    ];

    try {
      // First, create the sheet if it doesn't exist
      const sheetCreationResult = await this.createSheet();
      if (!sheetCreationResult.success) {
        return sheetCreationResult;
      }

      // Then add headers with styling
      const headerResult = await this.addHeadersWithStyling(headers);
      
      // Apply row formatting and column widths
      const stylingResult = await this.applySheetStyling();
      
      return {
        success: true,
        message: 'Google Sheet initialized with headers and styling',
        headers: headers,
        sheetId: this.sheetId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Google Sheet if it doesn't exist
   */
  async createSheet() {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwYYyPgmCZQet30LRxeJY_yX15e9EoGPsnPYXa52pojG3wQdnkgjmXXZlpT3WJBrb9g/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSheet',
          sheetName: this.sheetName,
          headers: [
            'ID', 'Prospect Name', 'Business Name', 'Phone', 'WhatsApp Link',
            'Email', 'Website', 'Business Type', 'Location', 'Owner Name',
            'GBP Status', 'Lead Source', 'Funnel Stage', 'Pipeline Status',
            'Lead Type', 'Offer Type', 'Product Offer', 'Outreach Message',
            'Outreach Category', 'Follow-up', 'Last Contact', 'Notes',
            'Offer URL Sent', 'Assigned Offer', 'CTA Type', 'AI Model',
            'Last Generated At', 'Last Message Type', 'Rating',
            'Created At', 'Deleted'
          ]
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to create sheet');
      }
    } catch (error) {
      return {
        success: false,
        error: `Sheet creation error: ${error.message}`
      };
    }
  }

  /**
   * Add headers with proper styling
   */
  async addHeadersWithStyling(headers) {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwYYyPgmCZQet30LRxeJY_yX15e9EoGPsnPYXa52pojG3wQdnkgjmXXZlpT3WJBrb9g/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addHeaders',
          sheetName: this.sheetName,
          headers: headers,
          styling: {
            headerRow: {
              backgroundColor: '#1A7B3A',
              textColor: '#FFFFFF',
              fontSize: 12,
              bold: true,
              wrapText: true
            },
            columns: [
              { width: 80, align: 'center' },  // ID
              { width: 200, align: 'left' },  // Prospect Name
              { width: 200, align: 'left' },  // Business Name
              { width: 150, align: 'left' },  // Phone
              { width: 200, align: 'left' },  // WhatsApp Link
              { width: 200, align: 'left' },  // Email
              { width: 180, align: 'left' },  // Website
              { width: 150, align: 'center' }, // Business Type
              { width: 120, align: 'center' }, // Location
              { width: 150, align: 'left' },  // Owner Name
              { width: 120, align: 'center' }, // GBP Status
              { width: 120, align: 'center' }, // Lead Source
              { width: 120, align: 'center' }, // Funnel Stage
              { width: 120, align: 'center' }, // Pipeline Status
              { width: 120, align: 'center' }, // Lead Type
              { width: 120, align: 'center' }, // Offer Type
              { width: 150, align: 'left' },  // Product Offer
              { width: 200, align: 'left' },  // Outreach Message
              { width: 150, align: 'center' }, // Outreach Category
              { width: 120, align: 'center' }, // Follow-up
              { width: 150, align: 'center' }, // Last Contact
              { width: 200, align: 'left' },  // Notes
              { width: 150, align: 'center' }, // Offer URL Sent
              { width: 150, align: 'left' },  // Assigned Offer
              { width: 100, align: 'center' }, // CTA Type
              { width: 100, align: 'center' }, // AI Model
              { width: 150, align: 'center' }, // Last Generated At
              { width: 150, align: 'center' }, // Last Message Type
              { width: 80, align: 'center' },  // Rating
              { width: 150, align: 'center' }, // Created At
              { width: 80, align: 'center' }   // Deleted
            ]
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to add headers');
      }
    } catch (error) {
      return {
        success: false,
        error: `Header addition error: ${error.message}`
      };
    }
  }

  /**
   * Apply comprehensive sheet styling
   */
  async applySheetStyling() {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwYYyPgmCZQet30LRxeJY_yX15e9EoGPsnPYXa52pojG3wQdnkgjmXXZlpT3WJBrb9g/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'styleSheet',
          sheetName: this.sheetName,
          styling: {
            frozenRows: 1, // Freeze header row
            gridlines: true,
            headerRow: {
              backgroundColor: '#1A7B3A',
              textColor: '#FFFFFF',
              fontSize: 12,
              bold: true,
              wrapText: true
            },
            dataRows: {
              alternateRowColors: ['#F8F9FA', '#FFFFFF'],
              headerFont: 'Arial',
              dataFont: 'Arial',
              fontSize: 11
            },
            conditionalFormatting: [
              {
                range: 'A2:Z1000',
                condition: 'new_leads_today',
                format: {
                  backgroundColor: '#E8F5E8',
                  textColor: '#000000'
                }
              },
              {
                range: 'A2:Z1000',
                condition: 'high_priority',
                format: {
                  backgroundColor: '#FFCDD2',
                  textColor: '#000000'
                }
              },
              {
                range: 'A2:Z1000',
                condition: 'medium_priority',
                format: {
                  backgroundColor: '#FFF2CC',
                  textColor: '#000000'
                }
              }
            ],
            dataValidation: [
              {
                range: 'D2:D1000', // Phone column
                type: 'textLength',
                minLength: 10,
                maxLength: 20,
                inputMessage: 'Enter valid phone number (+233...)'
              },
              {
                range: 'F2:F1000', // Email column
                type: 'email',
                inputMessage: 'Enter valid email address'
              },
              {
                range: 'H2:H1000', // Business Type column
                type: 'list',
                values: [
                  'Restaurant/Food', 'Retail/Shop', 'Beauty/Salon', 'Healthcare',
                  'Hotel/Hospitality', 'Professional Services', 'Construction', 'Technology', 'Other'
                ]
              },
              {
                range: 'I2:I1000', // Location column
                type: 'list',
                values: [
                  'Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Sunyani', 'Cape Coast',
                  'Koforidua', 'Obuasi', 'Tema', 'Ashaiman', 'Madina', 'Other'
                ]
              }
            ]
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to apply styling');
      }
    } catch (error) {
      return {
        success: false,
        error: `Styling error: ${error.message}`
      };
    }
  }

  /**
   * Test sheet initialization
   */
  async testInitialization() {
    console.log('🏗️ Testing Google Sheets initialization...');
    
    try {
      const result = await this.initializeSheet();
      
      if (result.success) {
        console.log('✅ Sheet initialized successfully!');
        console.log('📊 Headers created:', result.headers);
        console.log('🔗 Sheet ID:', result.sheetId);
        
        // Create test lead to verify
        await this.createTestLead();
        
        return result;
      } else {
        console.error('❌ Initialization failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a test lead to verify sheet is working
   */
  async createTestLead() {
    const testLead = {
      id: Date.now().toString(),
      name: 'Test User - Sheet Init',
      businessName: 'Gabochie Marketing Test',
      phone: '+233501234567',
      email: 'test@gabochie.com',
      website: 'https://gabochie.com',
      subcategory: 'Technology',
      location: 'Accra',
      leadSource: 'Sheet Initialization Test',
      notes: 'This is a test lead created during sheet initialization',
      status: 'new',
      offerType: 'Test',
      productOffer: 'Sheet Setup Verification',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwYYyPgmCZQet30LRxeJY_yX15e9EoGPsnPYXa52pojG3wQdnkgjmXXZlpT3WJBrb9g/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLead)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test lead created successfully:', result);
        return result;
      } else {
        throw new Error('Failed to create test lead');
      }
    } catch (error) {
      console.error('❌ Test lead creation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current sheet status
   */
  async getSheetStatus() {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwYYyPgmCZQet30LRxeJY_yX15e9EoGPsnPYXa52pojG3wQdnkgjmXXZlpT3WJBrb9g/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getSheetStatus',
          sheetName: this.sheetName
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to get sheet status');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export for use
window.GoogleSheetsInitializer = GoogleSheetsInitializer;
window.sheetsInit = new GoogleSheetsInitializer();

console.log('🏗️ Google Sheets Initializer loaded');
console.log('Available methods:');
console.log('- sheetsInit.initializeSheet() - Create sheet with headers and styling');
console.log('- sheetsInit.testInitialization() - Test complete initialization');
console.log('- sheetsInit.getSheetStatus() - Get current sheet status');
console.log('- sheetsInit.createTestLead() - Create test lead');
