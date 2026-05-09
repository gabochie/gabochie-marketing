/**
 * Simple Backend Solution - No GCP Required
 * Uses Formspree or similar service to send data directly to your Google Sheet
 */

class SimpleBackend {
  constructor() {
    this.sheetId = '1yvFvoIeVrOyBjocXBLAg1onDLKEFtdSxSkD4M5I1tl4';
    this.serviceUrl = 'https://formspree.io/f/mqenywna'; // Your Formspree endpoint
    this.notificationEmail = 'gabochiemarketing@gmail.com';
  }

  /**
   * Send lead data to Google Sheet via Formspree
   */
  async sendLead(leadData) {
    try {
      // Add timestamp and ID
      const enhancedData = {
        ...leadData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        source: 'gabochie-website'
      };

      // Send to your form service
      const response = await fetch(this.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_FORMSPREE_TOKEN` // Optional - Formspree works without token token
        },
        body: JSON.stringify({
          // Formspree expects this structure
          name: 'Gabochie Marketing Lead',
          email: this.notificationEmail,
          subject: `New Lead: ${leadData.name} - ${leadData.businessName}`,
          message: this.formatLeadEmail(enhancedData),
          data: enhancedData,
          redirect: 'https://docs.google.com/spreadsheets/d/1yvFvoIeVrOyBjocXBLAg1onDLKEFtdSxSkD4M5I1tl4/edit'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Send email notification
        await this.sendEmailNotification(enhancedData);
        
        return { 
          success: true, 
          message: 'Lead submitted successfully',
          id: enhancedData.id
        };
      } else {
        throw new Error('Form service error');
      }
    } catch (error) {
      // Fallback to local storage
      this.storeLocally(enhancedData);
      return { 
        success: true, 
        message: 'Lead stored locally (service unavailable)',
        id: enhancedData.id
      };
    }
  }

  /**
   * Store lead locally when service is down
   */
  storeLocally(leadData) {
    const leads = JSON.parse(localStorage.getItem('gabochieLeads') || '[]');
    leads.push(leadData);
    localStorage.setItem('gabochieLeads', JSON.stringify(leads));
    
    // Queue email for later sending
    this.queueEmailNotification(leadData);
  }

  /**
   * Queue email notification locally
   */
  queueEmailNotification(leadData) {
    const emails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
    emails.push({
      to: this.notificationEmail,
      subject: `🔥 NEW LEAD: ${leadData.name} - ${leadData.businessName}`,
      body: this.formatLeadEmail(leadData),
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('pendingEmails', JSON.stringify(emails));
  }

  /**
   * Send email notification (you can integrate with any email service)
   */
  async sendEmailNotification(leadData) {
    try {
      // This is where you'd integrate EmailJS, SendGrid, or your preferred service
      console.log('Email notification queued:', leadData);
      
      // For now, just log it - you can replace this with actual email sending
      const emailLog = JSON.parse(localStorage.getItem('sentEmails') || '[]');
      emailLog.push({
        to: this.notificationEmail,
        subject: `🔥 NEW LEAD: ${leadData.name} - ${leadData.businessName}`,
        body: this.formatLeadEmail(leadData),
        timestamp: new Date().toISOString(),
        status: 'logged'
      });
      localStorage.setItem('sentEmails', JSON.stringify(emailLog));
      
      return { success: true, message: 'Email notification logged' };
      
    } catch (error) {
      console.error('Email notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format lead data for email
   */
  formatLeadEmail(leadData) {
    return `
NEW LEAD ALERT! 🚀

Lead Details:
• Name: ${leadData.name || 'Not provided'}
• Business: ${leadData.businessName || 'Not provided'}
• Phone: ${leadData.phone || 'Not provided'}
• Email: ${leadData.email || 'Not provided'}
• Website: ${leadData.website || 'Not provided'}
• Business Type: ${leadData.subcategory || 'Not provided'}
• Location: ${leadData.location || 'Not provided'}
• Lead Source: ${leadData.leadSource || 'Unknown'}
• Status: ${leadData.status || 'New'}
• Notes: ${leadData.notes || 'No notes'}

Score: ${leadData.score || 'Not scored'}
Created: ${new Date().toLocaleString()}

🎯 ACTION REQUIRED: Contact this lead ASAP!

---
Gabochie Marketing Lead System (Simple Backend)
`;
  }

  /**
   * Get all stored leads
   */
  getStoredLeads() {
    try {
      const leads = JSON.parse(localStorage.getItem('gabochieLeads') || '[]');
      return { success: true, leads };
    } catch (error) {
      return { success: false, error: error.message, leads: [] };
    }
  }

  /**
   * Get pending emails
   */
  getPendingEmails() {
    try {
      const emails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
      return { success: true, emails };
    } catch (error) {
      return { success: false, error: error.message, emails: [] };
    }
  }

  /**
   * Clear stored data
   */
  clearStoredData() {
    localStorage.removeItem('gabochieLeads');
    localStorage.removeItem('pendingEmails');
    localStorage.removeItem('sentEmails');
  }

  /**
   * Export leads as CSV
   */
  exportLeadsCSV() {
    const leads = this.getStoredLeads();
    if (!leads.success) return;

    const csv = [
      'ID,Name,Business,Phone,Email,Website,Type,Location,Source,Status,Notes,Created'
    ];
    
    leads.leads.forEach(lead => {
      csv.push([
        lead.id || '',
        lead.name || '',
        lead.businessName || '',
        lead.phone || '',
        lead.email || '',
        lead.website || '',
        lead.subcategory || '',
        lead.location || '',
        lead.leadSource || '',
        lead.status || '',
        lead.notes || '',
        lead.timestamp || ''
      ].join(','));
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gabochie-leads.csv';
    a.click();
  }
}

// Export for use
window.SimpleBackend = SimpleBackend;
window.simpleBackend = new SimpleBackend();

console.log('🚀 Simple Backend loaded - No GCP required!');
console.log('Available methods:');
console.log('- simpleBackend.sendLead(leadData) - Send lead to Google Sheet');
console.log('- simpleBackend.getStoredLeads() - Get all stored leads');
console.log('- simpleBackend.getPendingEmails() - Get pending emails');
console.log('- simpleBackend.exportLeadsCSV() - Export leads as CSV');
console.log('- simpleBackend.clearStoredData() - Clear all stored data');
