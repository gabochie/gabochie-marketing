/**
 * Direct Google Sheet Population
 * Bypasses Apps Script limitations and directly populates your sheet
 */

class DirectSheetPopulator {
  constructor() {
    this.sheetId = '1yvFvoIeVrOyBjocXBLAg1onDLKEFtdSxSkD4M5I1tl4';
    this.apiKey = null; // We'll use a different approach
  }

  /**
   * Directly populate Google Sheet with headers and data
   */
  async populateSheet() {
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
      // Update button UI to show loading state
      const populateBtn = document.getElementById('populateBtn');
      if (populateBtn) {
        populateBtn.disabled = true;
        populateBtn.innerHTML = '<span class="btn-text">🏗️ Processing...</span><div class="progress-bar"><div class="progress-fill"></div></div>';
      }

      // Create a temporary HTML form that will submit to Google Sheets
      const formHtml = this.createSubmissionForm(headers);
      
      // Open in new window to submit
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      newWindow.document.write(formHtml);
      newWindow.document.close();
      
      // Reset button after delay
      setTimeout(() => {
        if (populateBtn) {
          populateBtn.disabled = false;
          populateBtn.innerHTML = '<span class="btn-text">🏗️ Populate Headers</span>';
        }
      }, 2000);
      
      return {
        success: true,
        message: 'Sheet population form opened in new window',
        instructions: [
          '1. A new window opened with a form',
          '2. Click "Submit to Google Sheet" button',
          '3. Grant permissions when prompted',
          '4. Your sheet will be populated with headers',
          '5. Close the window when done'
        ]
      };
    } catch (error) {
      // Reset button on error
      const populateBtn = document.getElementById('populateBtn');
      if (populateBtn) {
        populateBtn.disabled = false;
        populateBtn.innerHTML = '<span class="btn-text">🏗️ Populate Headers</span>';
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create HTML form for direct sheet submission
   */
  createSubmissionForm(headers) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Populate Google Sheet - Gabochie Marketing</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f5f5f5; 
            max-width: 600px; 
            margin: 0 auto; 
        }
        .form-container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        .header { 
            background: #1A7B3A; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
        }
        .header p { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
        }
        .submit-btn { 
            background: #1A7B3A; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 16px; 
            font-weight: bold; 
            width: 100%; 
            margin-top: 20px; 
        }
        .submit-btn:hover { 
            background: #0F5C28; 
        }
        .info-box { 
            background: #e3f2fd; 
            border: 1px solid #1a73e8; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
        }
        .headers-preview { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
        }
        .headers-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 10px; 
            font-size: 12px; 
        }
        .header-item { 
            background: #1A7B3A; 
            color: white; 
            padding: 8px; 
            border-radius: 3px; 
            text-align: center; 
            font-weight: bold; 
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="header">
            <h1>🏗️ Google Sheet Setup</h1>
            <p>Populate your Google Sheet with professional headers and styling</p>
        </div>
        
        <div class="info-box">
            <h3>📋 Sheet Information:</h3>
            <p><strong>Sheet ID:</strong> ${this.sheetId}</p>
            <p><strong>Headers:</strong> ${headers.length} columns will be created</p>
        </div>
        
        <div class="headers-preview">
            <h3>📊 Headers That Will Be Created:</h3>
            <div class="headers-grid">
                ${headers.map(header => `<div class="header-item">${header}</div>`).join('')}
            </div>
        </div>
        
        <form action="https://script.google.com/macros/s/AKfycby43AfuiiL77YSn6VyJ2xlNPRDFKV9qiduq-XCg8RyLYuE3TnvMWtp22c-UOKEkSvw-/exec" 
              method="POST" target="_blank">
            <input type="hidden" name="action" value="populateSheet">
            <input type="hidden" name="sheetId" value="${this.sheetId}">
            <input type="hidden" name="headers" value='${JSON.stringify(headers)}'>
            
            <button type="submit" class="submit-btn">
                🚀 Submit to Google Sheet
            </button>
        </form>
        
        <div class="info-box">
            <h3>📋 Instructions:</h3>
            <ol>
                <li>Click the "Submit to Google Sheet" button above</li>
                <li>A new tab will open with Google authorization</li>
                <li>Sign in to your Google account</li>
                <li>Grant permission to access your sheet</li>
                <li>Your sheet will be populated with headers</li>
                <li>The sheet will be styled professionally</li>
                <li>Close the authorization window when complete</li>
            </ol>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Create test data to verify sheet is working
   */
  async createTestData() {
    const testData = [
      {
        id: Date.now().toString(),
        name: 'Test User - Direct Populate',
        businessName: 'Gabochie Marketing Test',
        phone: '+233501234567',
        email: 'test@gabochie.com',
        website: 'https://gabochie.com',
        subcategory: 'Technology',
        location: 'Accra',
        leadSource: 'Direct Sheet Population',
        notes: 'This is a test lead created during sheet population',
        status: 'new',
        offerType: 'Test',
        productOffer: 'Direct Sheet Population Test',
        timestamp: new Date().toISOString()
      }
    ];

    try {
      // Update button UI to show loading state
      const testBtn = document.getElementById('testBtn');
      if (testBtn) {
        testBtn.disabled = true;
        testBtn.innerHTML = '<span class="btn-text">🧪 Processing...</span><div class="progress-bar"><div class="progress-fill"></div></div>';
      }

      const formHtml = this.createTestDataForm(testData);
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      newWindow.document.write(formHtml);
      newWindow.document.close();
      
      // Reset button after delay
      setTimeout(() => {
        if (testBtn) {
          testBtn.disabled = false;
          testBtn.innerHTML = '<span class="btn-text">🧪 Create Test Data</span>';
        }
      }, 2000);
      
      return {
        success: true,
        message: 'Test data form opened',
        data: testData
      };
    } catch (error) {
      // Reset button on error
      const testBtn = document.getElementById('testBtn');
      if (testBtn) {
        testBtn.disabled = false;
        testBtn.innerHTML = '<span class="btn-text">🧪 Create Test Data</span>';
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create form for test data submission
   */
  createTestDataForm(testData) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Add Test Data - Gabochie Marketing</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .form-container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: #1A7B3A; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .submit-btn { background: #1A7B3A; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; margin-top: 20px; }
        .submit-btn:hover { background: #0F5C28; }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="header">
            <h1>🧪 Add Test Data</h1>
            <p>Add a test lead to verify your Google Sheet is working</p>
        </div>
        
        <form action="https://script.google.com/macros/s/AKfycby43AfuiiL77YSn6VyJ2xlNPRDFKV9qiduq-XCg8RyLYuE3TnvMWtp22c-UOKEkSvw-/exec" 
              method="POST" target="_blank">
            <input type="hidden" name="action" value="addTestData">
            
            <div class="form-group">
                <label>Name:</label>
                <input type="text" name="name" value="${testData.name}" required>
            </div>
            
            <div class="form-group">
                <label>Business Name:</label>
                <input type="text" name="businessName" value="${testData.businessName}" required>
            </div>
            
            <div class="form-group">
                <label>Phone:</label>
                <input type="tel" name="phone" value="${testData.phone}" required>
            </div>
            
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" value="${testData.email}" required>
            </div>
            
            <div class="form-group">
                <label>Website:</label>
                <input type="url" name="website" value="${testData.website}">
            </div>
            
            <div class="form-group">
                <label>Business Type:</label>
                <input type="text" name="subcategory" value="${testData.subcategory}">
            </div>
            
            <div class="form-group">
                <label>Location:</label>
                <input type="text" name="location" value="${testData.location}">
            </div>
            
            <div class="form-group">
                <label>Lead Source:</label>
                <input type="text" name="leadSource" value="${testData.leadSource}">
            </div>
            
            <div class="form-group">
                <label>Notes:</label>
                <input type="text" name="notes" value="${testData.notes}">
            </div>
            
            <input type="hidden" name="status" value="${testData.status}">
            <input type="hidden" name="offerType" value="${testData.offerType}">
            <input type="hidden" name="productOffer" value="${testData.productOffer}">
            <input type="hidden" name="timestamp" value="${testData.timestamp}">
            
            <button type="submit" class="submit-btn">
                🧪 Add Test Lead to Sheet
            </button>
        </form>
    </div>
</body>
</html>
    `;
  }
}

// Export for use
window.DirectSheetPopulator = DirectSheetPopulator;
window.sheetPopulator = new DirectSheetPopulator();

// Test the class is loaded
console.log('🏗️ Direct Sheet Populator loaded');
console.log('Testing class initialization...');
const testInstance = new DirectSheetPopulator();
console.log('Sheet ID:', testInstance.sheetId);
console.log('Available methods:');
console.log('- sheetPopulator.populateSheet() - Create headers and styling');
console.log('- sheetPopulator.createTestData() - Create test data form');

console.log('🏗️ Direct Sheet Populator loaded');
console.log('Available methods:');
console.log('- sheetPopulator.populateSheet() - Create headers and styling');
console.log('- sheetPopulator.createTestData() - Create test data form');
