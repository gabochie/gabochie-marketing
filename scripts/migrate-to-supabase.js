/**
 * Gabochie Marketing — Google Sheets → Supabase Migration (p2-2)
 *
 * Usage:
 *   set SUPABASE_SERVICE_KEY=your_key && node scripts/migrate-to-supabase.js
 *
 * You'll be prompted for admin username and password (for Apps Script API).
 */

const https = require('https');
const http = require('http');
const readline = require('readline');

const SUPABASE_URL  = process.env.SUPABASE_URL || 'https://gcbsffvryqguesofgvjh.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_API_URL = 'https://script.google.com/macros/s/AKfycby43AfuiiL77YSn6VyJ2xlNPRDFKV9qiduq-XCg8RyLYuE3TnvMWtp22c-UOKEkSvw-/exec';

if (!SUPABASE_KEY) { console.error('Error: SUPABASE_SERVICE_KEY env var required'); process.exit(1); }

function rl() { return readline.createInterface({ input: process.stdin, output: process.stdout }); }
function ask(q) { return new Promise(resolve => { const i = rl(); i.question(q, a => { i.close(); resolve(a); }); }); }

function request(urlStr, method, body, cookie) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const mod = u.protocol === 'https:' ? https : http;
    const opts = { hostname: u.hostname, path: u.pathname + u.search, method, headers: {} };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.headers['Content-Length'] = Buffer.byteLength(body); }
    if (cookie) opts.headers['Cookie'] = cookie;
    const req = mod.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        const newCookie = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : cookie;
        resolve({ status: res.statusCode, body: d, cookie: newCookie, location: res.headers.location });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function appsScriptPost(data) {
  let r = await request(ADMIN_API_URL, 'GET');
  r = await request(r.location, 'GET', null, r.cookie);
  r = await request(ADMIN_API_URL, 'POST', JSON.stringify(data), r.cookie);
  r = await request(r.location, 'GET', null, r.cookie);
  return JSON.parse(r.body);
}

function supabasePost(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const u = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: {
        'Content-Type': 'application/json', 'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'return=minimal'
      }
    };
    if (rows.length > 0) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve({ status: res.statusCode, body: d || null });
        else reject(new Error(`${res.statusCode}: ${d}`));
      });
    });
    req.on('error', reject);
    if (rows.length > 0) req.write(body);
    req.end();
  });
}

function mapLead(s) {
  const phone = (s.Phone || '').replace(/\D/g, '');
  let createdAt = null, lastContact = null;
  if (s['Created At']) { const d = new Date(s['Created At']); if (!isNaN(d.getTime())) createdAt = d.toISOString(); }
  if (s['Last Contact']) { const d = new Date(s['Last Contact']); if (!isNaN(d.getTime())) lastContact = d.toISOString(); }
  let rating = parseInt(s.Rating, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) rating = null;
  const lead = {
    prospect_name: s['Prospect Name'] || '', business_name: s['Business Name'] || '',
    phone, email: s.Email || '', website: s.Website || '',
    business_type: s['Business Type'] || '', location: s.Location || '',
    owner_name: s['Owner Name'] || '',
    gbp_status: (s['GBP Status'] || 'none').toLowerCase().replace(/ /g, '_'),
    lead_source: (s['Lead Source'] || 'other').toLowerCase().replace(/ /g, '_'),
    funnel_stage: (s['Funnel Stage'] || 'tofu').toLowerCase(),
    status: (s['Pipeline Status'] || 'new').toLowerCase(),
    lead_type: s['Lead Type'] || 'unknown',
    offer_type: (s['Offer Type'] || 'service').toLowerCase(),
    product_offer: s['Product Offer'] || '',
    outreach_message: s['Outreach Message'] || '',
    outreach_category: s['Outreach Category'] || '',
    notes: s.Notes || '', last_contact: lastContact,
    created_at: createdAt || new Date().toISOString()
  };
  if (rating) lead.rating = rating;
  if (s.Deleted && s.Deleted.toLowerCase() === 'yes') lead.deleted_at = new Date().toISOString();
  return lead;
}

function mapClient(s) {
  const pkg = ({ 'Starter': 'starter_visibility', 'Growth': 'growth_system', 'Market Authority': 'market_authority' })[s.Package] || 'growth_system';
  let startDate = null, createdAt = null;
  if (s['Start Date']) { const d = new Date(s['Start Date']); if (!isNaN(d.getTime())) startDate = d.toISOString().split('T')[0]; }
  if (s['Created At']) { const d = new Date(s['Created At']); if (!isNaN(d.getTime())) createdAt = d.toISOString(); }
  return {
    name: s.Name || '', email: s.Email || '', business_name: s['Business Name'] || '',
    phone: s.Phone || '', package: pkg, status: (s.Status || 'onboarding').toLowerCase(),
    start_date: startDate || new Date().toISOString().split('T')[0],
    monthly_rate: 0, setup_fee: 0,
    gbp_views: parseInt(s.Views, 10) || 0, gbp_directions: parseInt(s.Directions, 10) || 0,
    gbp_calls: parseInt(s.Calls, 10) || 0, gbp_reviews: parseInt(s.Reviews, 10) || 0,
    phase_foundation: (s['Phase 1'] || 'pending').toLowerCase(),
    phase_activation: (s['Phase 2'] || 'pending').toLowerCase(),
    phase_domination: (s['Phase 3'] || 'pending').toLowerCase(),
    created_at: createdAt || new Date().toISOString()
  };
}

async function main() {
  console.log('\n=== Gabochie Marketing — Sheets → Supabase Migration ===\n');
  const username = await ask('Admin username (default: admin): ');
  const password = await ask('Admin password: ');
  const user = username || 'admin';

  console.log('Logging into admin API...');
  const login = await appsScriptPost({ action: 'login', username: user, password, _origin: 'http://localhost' });
  if (!login.success) { console.error('Login failed:', login.error); process.exit(1); }
  const token = login.token;

  console.log('Fetching leads...');
  const leadsRaw = await appsScriptPost({ action: 'syncGoogleSheets', token, _origin: 'http://localhost' });
  const leads = Array.isArray(leadsRaw) ? leadsRaw : (leadsRaw.data || []);
  console.log(`Found ${leads.length} leads.`);

  console.log('Fetching clients...');
  const clientsRes = await appsScriptPost({ action: 'getClients', token, _origin: 'http://localhost' });
  const clients = clientsRes.success ? (clientsRes.clients || []) : [];
  console.log(`Found ${clients.length} clients.`);

  if (leads.length === 0 && clients.length === 0) { console.log('Nothing to migrate.'); return; }
  const confirm = await ask(`Migrate ${leads.length} leads and ${clients.length} clients to Supabase? (yes/no): `);
  if (confirm.toLowerCase() !== 'yes') { console.log('Cancelled.'); return; }

  if (leads.length > 0) {
    console.log('Inserting leads into Supabase...');
    const mapped = leads.map(mapLead);
    for (let i = 0; i < mapped.length; i += 50) {
      const batch = mapped.slice(i, i + 50);
      try { await supabasePost('leads', batch); console.log(`  Leads ${i+1}-${Math.min(i+50, mapped.length)}/${mapped.length}`); }
      catch (e) { console.error(`  Batch ${i} failed:`, e.message); }
    }
  }

  if (clients.length > 0) {
    console.log('Inserting clients into Supabase...');
    const mapped = clients.map(mapClient);
    for (let i = 0; i < mapped.length; i += 50) {
      const batch = mapped.slice(i, i + 50);
      try { await supabasePost('clients', batch); console.log(`  Clients ${i+1}-${Math.min(i+50, mapped.length)}/${mapped.length}`); }
      catch (e) { console.error(`  Batch ${i} failed:`, e.message); }
    }
  }

  console.log('\n=== Migration complete! ===\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
