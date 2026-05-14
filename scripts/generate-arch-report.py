from fpdf import FPDF
from datetime import datetime

PRIMARY = (26, 123, 58)
ACCENT = (126, 211, 84)
DARK_GREEN = (15, 92, 40)
DARK_TEXT = (45, 45, 45)
LIGHT_BG = (245, 247, 250)
WHITE = (255, 255, 255)
MEDIUM_GRAY = (100, 100, 100)
RED_ACCENT = (200, 50, 50)
AMBER = (245, 158, 11)
GREEN_OK = (34, 180, 80)

FONT_DIR = r'C:\Windows\Fonts'


class Report(FPDF):

    def _setup_fonts(self):
        self.add_font('Inter', '', FONT_DIR + r'\arial.ttf')
        self.add_font('Inter', 'B', FONT_DIR + r'\arialbd.ttf')
        self.add_font('Inter', 'I', FONT_DIR + r'\ariali.ttf')
        self.add_font('Inter', 'BI', FONT_DIR + r'\arialbi.ttf')

    def header(self):
        if self.page_no() > 1:
            self.set_fill_color(*DARK_GREEN)
            self.rect(0, 0, 210, 8, 'F')
            self.set_y(1.5)
            self.set_font('Inter', 'B', 6)
            self.set_text_color(*ACCENT)
            self.cell(10, 5, '', new_x="RIGHT", new_y="TOP")
            self.cell(60, 5, 'GABOCHIE MARKETING', new_x="RIGHT", new_y="TOP")
            self.set_font('Inter', '', 6)
            self.set_text_color(180, 200, 180)
            self.cell(90, 5, 'Architecture & Security Assessment', new_x="RIGHT", new_y="TOP")
            self.cell(30, 5, datetime.now().strftime('%B %Y'), new_x="LMARGIN", new_y="NEXT", align='R')

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-12)
            self.set_font('Inter', '', 6)
            self.set_text_color(*MEDIUM_GRAY)
            self.cell(0, 10, f'Page {self.page_no() - 1}', new_x="LMARGIN", new_y="NEXT", align='C')

    def cover_page(self):
        self.add_page()
        self.set_fill_color(*DARK_GREEN)
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*PRIMARY)
        self.rect(0, 90, 210, 2, 'F')
        self.set_y(50)
        self.set_font('Inter', 'B', 11)
        self.set_text_color(*ACCENT)
        self.cell(0, 8, 'GABOCHIE MARKETING', new_x="LMARGIN", new_y="NEXT", align='C')
        self.set_font('Inter', 'B', 22)
        self.set_text_color(*WHITE)
        self.cell(0, 14, 'Architecture & Security', new_x="LMARGIN", new_y="NEXT", align='C')
        self.cell(0, 14, 'Assessment', new_x="LMARGIN", new_y="NEXT", align='C')
        self.set_font('Inter', '', 11)
        self.set_text_color(200, 220, 200)
        self.cell(0, 8, 'Production Readiness, Security Audit & Migration Roadmap', new_x="LMARGIN", new_y="NEXT", align='C')
        self.set_y(100)
        self.set_fill_color(*PRIMARY)
        self.rect(0, 98, 210, 0.5, 'F')
        self.set_y(110)
        self.set_font('Inter', 'I', 8)
        self.set_text_color(*ACCENT)
        self.cell(0, 6, "Ghana's #1 Local Visibility Agency", new_x="LMARGIN", new_y="NEXT", align='C')
        self.set_font('Inter', '', 8)
        self.set_text_color(180, 200, 180)
        self.cell(0, 6, f'Prepared: {datetime.now().strftime("%B %d, %Y")}', new_x="LMARGIN", new_y="NEXT", align='C')
        self.set_fill_color(*PRIMARY)
        self.rect(0, 280, 210, 1.5, 'F')

    def section_title(self, title, subtitle=None):
        self.ln(3)
        y = self.get_y()
        self.set_fill_color(*DARK_GREEN)
        self.rect(15, y, 180, 8, 'F')
        self.set_y(y + 1.2)
        self.set_font('Inter', 'B', 12)
        self.set_text_color(*WHITE)
        self.cell(0, 6, f'  {title}', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        if subtitle:
            self.set_font('Inter', 'I', 8)
            self.set_text_color(*MEDIUM_GRAY)
            self.cell(0, 5, subtitle, new_x="LMARGIN", new_y="NEXT")
            self.ln(1)

    def sub_title(self, title):
        self.ln(2)
        self.set_font('Inter', 'B', 10)
        self.set_text_color(*PRIMARY)
        self.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_font('Inter', '', 8)
        self.set_text_color(*DARK_TEXT)
        self.multi_cell(0, 4.5, text)
        self.ln(0.5)

    def table_header(self, cols, color=DARK_GREEN):
        self.set_fill_color(*color)
        self.set_text_color(*WHITE)
        self.set_font('Inter', 'B', 7)
        for col in cols:
            self.cell(col[1], 6, f' {col[0]}', border=1, new_x="RIGHT", new_y="TOP", fill=True)
        self.ln()

    def table_row(self, cols, row_data, fill=False):
        self.set_font('Inter', '', 7)
        if fill:
            self.set_fill_color(*LIGHT_BG)
        else:
            self.set_fill_color(*WHITE)
        self.set_text_color(*DARK_TEXT)
        for i, data in enumerate(row_data):
            self.cell(cols[i][1], 5.5, f' {data}', border=1, new_x="RIGHT", new_y="TOP", fill=True)
        self.ln()

    def severity_badge(self, text, level):
        colors = {
            'Critical': (200, 50, 50),
            'High': AMBER,
            'Medium': (100, 100, 200),
            'Low': (100, 180, 100),
        }
        c = colors.get(level, MEDIUM_GRAY)
        self.set_fill_color(*c)
        self.set_text_color(*WHITE)
        self.set_font('Inter', 'B', 6)
        w = self.get_string_width(f' {text} ') + 3
        self.cell(w, 4.5, f' {text} ', border=1, new_x="RIGHT", new_y="TOP", fill=True, align='C')

    def issue_row(self, issue, detail, severity, fill=False):
        self.set_font('Inter', '', 7)
        if fill:
            self.set_fill_color(*LIGHT_BG)
        else:
            self.set_fill_color(*WHITE)
        self.set_text_color(*DARK_TEXT)
        self.cell(50, 5.5, f' {issue}', border=1, new_x="RIGHT", new_y="TOP", fill=True)
        # Severity badge in second column
        self.set_fill_color(*{
            'Critical': (200, 50, 50),
            'High': AMBER,
            'Medium': (100, 100, 200),
        }.get(severity, MEDIUM_GRAY))
        self.set_text_color(*WHITE)
        self.set_font('Inter', 'B', 6)
        self.cell(14, 5.5, f' {severity} ', border=1, new_x="RIGHT", new_y="TOP", fill=True, align='C')
        self.set_font('Inter', '', 7)
        self.set_text_color(*DARK_TEXT)
        self.set_fill_color(*LIGHT_BG if fill else WHITE)
        self.cell(116, 5.5, f' {detail}', border=1, new_x="LMARGIN", new_y="NEXT", fill=True)

    def comparison_row(self, feature, sheets, supabase, fill=False):
        self.set_font('Inter', '', 7)
        if fill:
            self.set_fill_color(*LIGHT_BG)
        else:
            self.set_fill_color(*WHITE)
        self.set_text_color(*DARK_TEXT)
        self.cell(38, 5.5, f' {feature}', border=1, new_x="RIGHT", new_y="TOP", fill=True)
        cols_w = [62, 80]
        for val, cw in zip([sheets, supabase], cols_w):
            if val.startswith('+'):
                self.set_text_color(*GREEN_OK)
            elif val.startswith('!'):
                self.set_text_color(*RED_ACCENT)
            else:
                self.set_text_color(*DARK_TEXT)
            self.cell(cw, 5.5, f' {val}', border=1, new_x="RIGHT", new_y="TOP", fill=True)
        self.ln()
        self.set_text_color(*DARK_TEXT)


def generate():
    pdf = Report('P', 'mm', 'A4')
    pdf._setup_fonts()
    pdf.set_auto_page_break(auto=True, margin=16)

    # Cover
    pdf.cover_page()

    # Executive Summary
    pdf.add_page()
    pdf.section_title('1. Executive Summary',
                      'Production readiness assessment of Gabochie Marketing\'s technical stack')

    pdf.body_text(
        'Gabochie Marketing\'s current architecture is functional for early-stage operation but has '
        'significant security and scalability issues that must be addressed before the business can grow '
        'past approximately 50-100 clients. The stack combines a production-grade frontend host (Netlify) '
        'with an MVP-grade backend (Google Sheets + Google Apps Script) and has several critical vulnerabilities '
        'including plain-text password storage, exposed credentials in source code, and no database access controls.'
    )
    pdf.ln(1)
    pdf.body_text(
        'This report assesses the current architecture, identifies risks ranked by severity, compares the '
        'current stack against a proposed Supabase + Vercel alternative, and provides a phased 6-step '
        'migration roadmap. The first two phases (auth fix and database migration) can be completed within '
        '2 weeks at zero additional cost and eliminate the most critical risks.'
    )

    pdf.ln(3)
    # Quick verdict box
    y0 = pdf.get_y()
    pdf.set_fill_color(255, 245, 235)
    pdf.set_draw_color(*AMBER)
    pdf.rect(15, y0, 180, 20, 'DF')
    pdf.set_y(y0 + 1.5)
    pdf.set_font('Inter', 'B', 8)
    pdf.set_text_color(*AMBER)
    pdf.cell(0, 4, '  Verdict: MVP-Grade Architecture. Not Production-Ready.', new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(18)
    pdf.set_font('Inter', '', 7)
    pdf.set_text_color(*DARK_TEXT)
    pdf.cell(0, 4, '  The frontend (Netlify) is fine. The backend (Google Sheets + Apps Script) and auth system are the critical risks.', new_x="LMARGIN", new_y="NEXT")
    pdf.set_y(y0 + 22)

    # Current Architecture
    pdf.section_title('2. Current Architecture Overview')

    pdf.body_text(
        'The application is a static HTML/CSS/JS site hosted on Netlify with a serverless backend '
        'powered by Google Apps Script. A single Google Sheet serves as the database for leads, clients, '
        'and CRM data. An admin panel (also hosted on Netlify) communicates with a separate Google Apps '
        'Script backend. The client portal uses the same sheet for authentication and dashboard data.'
    )

    pdf.ln(1)
    cols = [('Layer', 35), ('Technology', 55), ('Assessment', 90)]
    pdf.table_header(cols)
    layers = [
        ('Frontend Host', 'Netlify', 'Production-grade. Static hosting with CDN, SSL, security headers.'),
        ('CSS Framework', 'Tailwind v3 (CDN)', 'Functional but no build step. Full library sent to every visitor.'),
        ('Backend', 'Google Apps Script', 'MVP-grade. 6-min limit, 50 concurrent writes, no rate limiting.'),
        ('Database', 'Google Sheets', 'MVP-grade. Flat rows, no relations, no access control.'),
        ('Auth', 'Custom DIY', 'Critical risk. Plain text passwords, hardcoded creds, no hashing.'),
        ('Lead Capture', 'Forms + localStorage', 'Functional. Ghost-free mode works, but no CAPTCHA or validation.'),
    ]
    for i, (l, t, a) in enumerate(layers):
        pdf.table_row(cols, [l, t, a], fill=(i % 2 == 1))

    # Issues
    pdf.add_page()
    pdf.section_title('3. Security & Scalability Issues',
                      'Ranked by severity. Critical and High items should be addressed immediately.')

    cols2 = [('Issue', 50), ('Sev.', 14), ('Detail', 116)]
    pdf.table_header(cols2, DARK_GREEN)

    issues = [
        ('Google Sheets as database', 'Critical', '10M cell limit, ~50 concurrent writes, no indexes, no relationships, no transactions. Two backends write to same sheet with different column headers.'),
        ('Passwords in plain text', 'Critical', 'Admin credentials (admin/gabochie2024) hardcoded in Code.gs. Client passwords stored as raw text in Clients sheet.'),
        ('No encryption at rest', 'Critical', 'Google Sheets has no column-level encryption. Anyone with sheet access or who finds the Sheet ID in JS source can read everything.'),
        ('Admin creds in source', 'Critical', 'Username and password visible to anyone with Apps Script access or who finds the file in version control.'),
        ('Sheet ID exposed', 'High', 'SHEET_ID hardcoded in frontend JS. Anyone can inspect and attempt to access the sheet.'),
        ('No rate limiting', 'High', 'Forms can be spammed with unlimited submissions. No CAPTCHA, no throttling.'),
        ('No input validation', 'High', 'No sanitization on form fields before sending to backend or storing in localStorage.'),
        ('Tailwind via CDN', 'Medium', 'Full library (hundreds of KB unused CSS) sent to every visitor. No purge optimization.'),
        ('GAS execution limits', 'Medium', '6-minute cap, 20K URL fetch/day, 100 emails/day. Bottleneck at ~50+ submissions/day.'),
        ('No staging env', 'Medium', 'Changes go straight to production. No preview deployments.'),
        ('DIY auth fragile', 'Medium', '24-hour session token in script properties. No refresh tokens, OAuth, or password hashing.'),
    ]

    for i, (issue, sev, detail) in enumerate(issues):
        pdf.set_font('Inter', '', 7)
        if i % 2 == 0:
            pdf.set_fill_color(*LIGHT_BG)
        else:
            pdf.set_fill_color(*WHITE)
        pdf.set_text_color(*DARK_TEXT)
        pdf.cell(50, 5.5, f' {issue}', border=1, new_x="RIGHT", new_y="TOP", fill=True)
        # Severity
        sev_colors = {'Critical': RED_ACCENT, 'High': AMBER, 'Medium': (100, 100, 200)}
        pdf.set_fill_color(*sev_colors.get(sev, MEDIUM_GRAY))
        pdf.set_text_color(*WHITE)
        pdf.set_font('Inter', 'B', 6)
        pdf.cell(14, 5.5, f' {sev} ', border=1, new_x="RIGHT", new_y="TOP", fill=True, align='C')
        pdf.set_font('Inter', '', 7)
        pdf.set_text_color(*DARK_TEXT)
        pdf.set_fill_color(*LIGHT_BG if i % 2 == 0 else WHITE)
        pdf.cell(116, 5.5, f' {detail}', border=1, new_x="LMARGIN", new_y="NEXT", fill=True)

    pdf.ln(4)
    pdf.body_text(
        'Summary: 4 Critical risks (passwords, encryption, Sheets-as-DB, exposed credentials) and 3 High risks '
        'need immediate attention. The Medium risks are important but not urgent. The Critical items alone '
        'represent genuine liability exposure for a business handling client contact information.'
    )

    # Comparison
    pdf.add_page()
    pdf.section_title('4. Google Sheets vs. Supabase (PostgreSQL)',
                      'Why migration to a proper database is recommended')

    cols3 = [('Feature', 38), ('Google Sheets (Current)', 62), ('Supabase (PostgreSQL)', 80)]
    pdf.table_header(cols3, PRIMARY)

    comparisons = [
        ('Data model', '! Flat rows, no relationships', '+ Full relational (clients, invoices, referrals)'),
        ('Security', '! No access control, plain text', '+ Row-Level Security, encrypted at rest, proper auth'),
        ('Concurrent writes', '! ~50 max', '+ Thousands'),
        ('Scaling', '! Hits limits at ~10K rows', '+ Millions of rows'),
        ('Backups', '! Manual only', '+ Automated daily snapshots'),
        ('Auth', '! DIY, broken, plain text', '+ Built-in: Google OAuth, email/password, magic link'),
        ('APIs', '! Custom Apps Script', '+ Auto-generated REST + GraphQL'),
        ('Real-time', '! No', '+ Built-in WebSockets'),
        ('Cost', 'Free (for now)', 'Free tier (500 MB, 50K users) -> $25/mo production'),
        ('Rate limiting', '! None', '+ Built-in row-level security policies'),
        ('Input validation', '! None', '+ Database constraints + RLS policies'),
    ]

    for i, (feat, sheets, supabase) in enumerate(comparisons):
        pdf.comparison_row(feat, sheets, supabase, fill=(i % 2 == 0))

    pdf.ln(3)
    pdf.body_text(
        'Supabase offers a generous free tier that is sufficient for Gabochie Marketing\'s current scale '
        '(500 MB database, 50K users, 2 GB bandwidth). The paid tier ($25/mo) unlocks 8 GB database, '
        '100K users, and 50 GB bandwidth - more than enough for the Year 1-2 scenario. The migration '
        'from Google Sheets to Supabase eliminates every Critical and High risk identified in this report.'
    )

    # Migration Path
    pdf.add_page()
    pdf.section_title('5. Migration Roadmap',
                      '6 phases from current state to production-ready architecture')

    phases = [
        {
            'title': 'PHASE 1: Fix Authentication',
            'tag': 'Week 1 -- Highest priority',
            'items': [
                ('1', 'Hash passwords using bcrypt', '1 day', 'Eliminates plain-text exposure. No user data at risk.'),
                ('2', 'Implement Supabase Auth with magic link or Google OAuth', '2 days', 'Replaces DIY auth with battle-tested system.'),
                ('3', 'Remove hardcoded admin credentials from source code', '1 day', 'Admin login via Supabase Auth instead of plain-text check.'),
            ]
        },
        {
            'title': 'PHASE 2: Database Migration',
            'tag': 'Week 1-2 -- Core data layer',
            'items': [
                ('4', 'Create Supabase project, set up schema (leads, clients, referrals, invoices)', '2 days', 'Relational model with foreign keys, indexes, constraints.'),
                ('5', 'Write migration script to export Google Sheets data to Supabase', '1 day', 'One-time export preserving all existing client and lead records.'),
                ('6', 'Build REST API endpoints with RLS policies for each table', '2 days', 'Replace Apps Script endpoints with secure Supabase API.'),
            ]
        },
        {
            'title': 'PHASE 3: Vercel Serverless Functions',
            'tag': 'Week 2-3 -- Replace Google Apps Script',
            'items': [
                ('7', 'Deploy form submission handler as Vercel Edge Function', '1 day', 'Replaces POST handler in google-apps-script-backend.js.'),
                ('8', 'Deploy admin CRM API as serverless functions', '2 days', 'Replaces all admin/Code.gs functionality.'),
                ('9', 'Deploy client portal auth and dashboard endpoints', '1 day', 'Client login and dashboard data via secure Supabase queries.'),
            ]
        },
        {
            'title': 'PHASE 4: Security Hardening',
            'tag': 'Week 3 -- Rate limiting, validation, CSP',
            'items': [
                ('10', 'Add CAPTCHA to all forms (Turnstile or reCAPTCHA v3)', '1 day', 'Prevents spam submissions and bot attacks.'),
                ('11', 'Add server-side input validation and sanitization', '1 day', 'Prevents XSS, SQL injection, and malformed data.'),
                ('12', 'Add rate limiting on all API endpoints', '1 day', 'Prevents abuse. 10 req/min per IP on forms.'),
            ]
        },
        {
            'title': 'PHASE 5: Frontend Optimization',
            'tag': 'Week 3-4 -- Build step, staging',
            'items': [
                ('13', 'Add Vite build step: auto-purge Tailwind unused CSS, minify HTML/JS', '2 days', 'Reduces page weight from ~800KB to ~150KB.'),
                ('14', 'Set up Vercel preview deployments per branch', '1 day', 'Every PR gets a unique URL for testing before production.'),
                ('15', 'Remove SHEET_ID and sensitive strings from client-side JS', '1 day', 'No backend identifiers exposed to visitors.'),
            ]
        },
        {
            'title': 'PHASE 6: Vercel Migration (Optional)',
            'tag': 'Week 4+ -- Move off Netlify if desired',
            'items': [
                ('16', 'Migrate static hosting from Netlify to Vercel', '1 day', 'Consolidates hosting + serverless on one platform.'),
                ('17', 'Set up custom domain, SSL, redirects on Vercel', '1 day', 'Same domain, zero downtime migration.'),
                ('18', 'Remove Google Sheets and Apps Script entirely', '1 day', 'Complete decoupling from legacy backend.'),
            ]
        },
    ]

    for phase in phases:
        # Check if we need a new page
        if pdf.get_y() > 210:
            pdf.add_page()

        pdf.ln(2)
        y0 = pdf.get_y()

        # Phase header
        pdf.set_fill_color(*PRIMARY)
        pdf.rect(15, y0, 180, 7, 'F')
        pdf.set_xy(17, y0 + 1.2)
        pdf.set_font('Inter', 'B', 9)
        pdf.set_text_color(*WHITE)
        pdf.cell(60, 4.5, phase['title'], new_x="RIGHT", new_y="TOP")
        pdf.set_font('Inter', 'I', 7)
        pdf.set_text_color(*ACCENT)
        pdf.cell(100, 4.5, phase['tag'], new_x="LMARGIN", new_y="NEXT", align='R')

        pdf.set_y(y0 + 8)
        cols = [('#', 7), ('Action', 90), ('Effort', 18), ('Rationale', 65)]
        pdf.table_header(cols, DARK_GREEN)
        for i, (num, action, effort, rationale) in enumerate(phase['items']):
            pdf.table_row(cols, [num, action, effort, rationale], fill=(i % 2 == 1))

    # Recommendation
    pdf.add_page()
    pdf.set_fill_color(*DARK_GREEN)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.set_y(70)
    pdf.set_font('Inter', 'B', 18)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 12, 'Recommendation', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_font('Inter', '', 10)
    pdf.set_text_color(*ACCENT)
    pdf.cell(0, 8, 'Do Phase 1 + 2 next week. The rest can follow incrementally.', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(100)
    pdf.set_font('Inter', '', 8)
    pdf.set_text_color(180, 200, 180)
    items_rec = [
        'Fix auth and passwords FIRST - this is an active liability.',
        'Migrate data from Google Sheets to Supabase - zero cost, fixes worst issues.',
        'Replace Google Apps Script with Vercel serverless functions.',
        'Add rate limiting, CAPTCHA, and input validation.',
        'Optimize frontend with build step and preview deploys.',
        'Move to Vercel only if you want consolidation.',
    ]
    for item in items_rec:
        pdf.cell(0, 6, f'  {item}', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(170)
    pdf.set_fill_color(*PRIMARY)
    pdf.rect(60, 168, 90, 1, 'F')

    pdf.set_y(178)
    pdf.set_font('Inter', '', 8)
    pdf.set_text_color(160, 190, 160)
    pdf.cell(0, 5, 'marketing.gabochie.com', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 5, 'gabochiemarketing@gmail.com', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 5, '+233 50 638 4917', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(260)
    pdf.set_font('Inter', 'I', 6)
    pdf.set_text_color(120, 150, 120)
    pdf.cell(0, 4, 'Confidential - Prepared for Internal Strategy Use', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 4, f'Generated {datetime.now().strftime("%B %d, %Y")}', new_x="LMARGIN", new_y="NEXT", align='C')

    out = 'Gabochie_Marketing_Architecture_Assessment.pdf'
    pdf.output(out)
    return out


if __name__ == '__main__':
    path = generate()
    import os
    size = os.path.getsize(path)
    print(f'Report generated: {path}')
    print(f'File size: {size:,} bytes ({size/1024:.1f} KB)')
