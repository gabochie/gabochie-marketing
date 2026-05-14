from fpdf import FPDF
from datetime import datetime

PRIMARY = (26, 123, 58)
ACCENT = (126, 211, 84)
DARK_GREEN = (15, 92, 40)
DARK_TEXT = (45, 45, 45)
LIGHT_BG = (245, 247, 250)
WHITE = (255, 255, 255)
MEDIUM_GRAY = (100, 100, 100)
AMBER = (245, 158, 11)

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
            self.cell(90, 5, 'Revenue Implementation Roadmap', new_x="RIGHT", new_y="TOP")
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
        self.cell(0, 14, 'Revenue Implementation Roadmap', new_x="LMARGIN", new_y="NEXT", align='C')
        self.set_font('Inter', '', 11)
        self.set_text_color(200, 220, 200)
        self.cell(0, 8, 'Upgrades Needed to Achieve Revenue Potential Goals', new_x="LMARGIN", new_y="NEXT", align='C')
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
        self.ln(4)
        self.set_fill_color(*DARK_GREEN)
        self.rect(15, self.get_y(), 180, 8, 'F')
        self.set_y(self.get_y() + 1.2)
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

    def table_header(self, cols):
        self.set_fill_color(*DARK_GREEN)
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

    def phase_card(self, phase_title, phase_tag, items):
        self.ln(2)
        y0 = self.get_y()
        if y0 > 240:
            self.add_page()
            y0 = self.get_y()

        # Phase header bar
        self.set_fill_color(*PRIMARY)
        self.rect(15, y0, 180, 7, 'F')
        self.set_xy(17, y0 + 1.2)
        self.set_font('Inter', 'B', 9)
        self.set_text_color(*WHITE)
        self.cell(50, 4.5, phase_title, new_x="RIGHT", new_y="TOP")
        self.set_font('Inter', 'I', 7)
        self.set_text_color(*ACCENT)
        self.cell(110, 4.5, phase_tag, new_x="LMARGIN", new_y="NEXT", align='R')

        # Items
        self.set_y(y0 + 8)
        cols = [('#', 7), ('Upgrade', 70), ('Effort', 20), ('Why', 83)]
        self.table_header(cols)
        for i, (num, title, effort, why) in enumerate(items):
            self.table_row(cols, [num, title, effort, why], fill=(i % 2 == 1))

    def highlight_box(self, items):
        self.ln(3)
        y0 = self.get_y()
        if y0 > 250:
            self.add_page()
            y0 = self.get_y()
        self.set_draw_color(*PRIMARY)
        self.set_fill_color(240, 248, 235)
        self.rect(15, y0, 180, len(items) * 5 + 8, 'DF')
        self.set_fill_color(*PRIMARY)
        self.rect(15, y0, 180, 6, 'F')
        self.set_y(y0 + 1.2)
        self.set_font('Inter', 'B', 8)
        self.set_text_color(*WHITE)
        self.cell(0, 4, '  Quickest Path to GHS 10,000/mo New Revenue', new_x="LMARGIN", new_y="NEXT")
        self.set_y(y0 + 8)
        for label, desc in items:
            self.set_x(18)
            self.set_font('Inter', 'B', 7)
            self.set_text_color(*PRIMARY)
            self.cell(10, 4.5, label, new_x="RIGHT", new_y="TOP")
            self.set_font('Inter', '', 7)
            self.set_text_color(*DARK_TEXT)
            self.cell(150, 4.5, desc, new_x="LMARGIN", new_y="NEXT")
        self.set_y(y0 + 8 + len(items) * 5 + 2)


def generate():
    pdf = Report('P', 'mm', 'A4')
    pdf._setup_fonts()
    pdf.set_auto_page_break(auto=True, margin=16)

    # === COVER ===
    pdf.cover_page()

    # === REVENUE POTENTIAL OVERVIEW ===
    pdf.add_page()
    pdf.section_title('Revenue Potential Overview',
                      'Three scenarios: current state vs. optimized vs. scaled')

    cols = [
        ('Scenario', 50),
        ('Monthly (GHS)', 35),
        ('Monthly (USD)', 30),
        ('Annual Run-Rate', 35),
        ('Clients', 30),
    ]
    pdf.table_header(cols)
    data = [
        ('Current (est.)', '15K-37K', '$1K-2.5K', '180K-450K', '10-25'),
        ('Gaps Closed (Yr 1)', '106K-190K', '$7K-12.7K', '1.3M-2.3M', '60-120'),
        ('Scaled Team (Yr 2-3)', '300K-600K', '$20K-40K', '3.6M-7.2M', '150-300'),
        ('Multi-Location (Yr 3+)', '750K-1.5M', '$50K-100K', '9M-18M', '200-500'),
    ]
    for i, row in enumerate(data):
        pdf.table_row(cols, row, fill=(i % 2 == 1))

    pdf.ln(3)
    pdf.body_text(
        'The gap between Current and Optimized is ~5-7x. This is achieved not by working harder '
        'but by changing the revenue model: converting one-time GBP sales to monthly retainers, '
        'adding low-friction entry points (review management, digital products), and systematic '
        'referral generation. Below is the specific upgrade roadmap to bridge this gap.'
    )

    # === MARKET SIZING ===
    pdf.ln(2)
    pdf.sub_title('Market Context')
    cols2 = [('Metric', 70), ('Value', 110)]
    pdf.table_header(cols2)
    mkt = [
        ('TAM (Ghanaian SMEs needing visibility)', '~500,000+'),
        ('SAM (Greater Accra + Kumasi, active GBP potential)', '50,000-100,000'),
        ('SOM (reachable Year 1 with current team)', '100-300'),
        ('Avg. USD ticket blended', '$40-$670 one-time + $23-$80/mo'),
    ]
    for i, (m, v) in enumerate(mkt):
        pdf.table_row(cols2, [m, v], fill=(i % 2 == 1))

    # === PHASE 1 ===
    pdf.add_page()
    pdf.section_title('1. Implementation Roadmap',
                      '14 upgrades across 5 phases, ordered by impact and dependency')

    pdf.phase_card('PHASE 1: Immediate', 'Week 1-2 -- Remove revenue-blocking bottlenecks', [
        ('1', 'Add online payment processing: Paystack (GHS) or Stripe', '2 days',
         'Zero payment collection = lost sales. Paystack is Ghana\'s leading gateway'),
        ('2', 'Add Calendly / Appointy booking link to audit modal and CTAs', '1 day',
         'Remove friction from form submission to consultation'),
        ('3', 'Add WhatsApp click-to-chat with lead source tracking', '1 day',
         'Capture source attribution for referral and campaign tracking'),
    ])

    # === PHASE 2 ===
    pdf.phase_card('PHASE 2: Revenue Model Upgrade', 'Week 2-4 -- Single highest-lever changes', [
        ('4', 'Restructure GBP pricing: add monthly retainer tiers (GHS 500/1,000/2,000/mo)',
         '1 day', 'Converts one-timers into MRR -- biggest leverage point in the business'),
        ('5', 'Add standalone Review Management service page at GHS 500/mo',
         '1 day', 'Low-friction entry point that graduates clients into full GBP management'),
        ('6', 'Build referral program page + WhatsApp share with referral tracking',
         '1 day', 'Word-of-mouth is dominant in Ghana -- formalize it'),
        ('7', 'Add 3/6-month retainer contract options to package signup flow',
         '1 day', 'Reduces churn, improves cash flow, locks in pricing'),
    ])

    # === PHASE 3 ===
    pdf.add_page()
    pdf.phase_card('PHASE 3: Automation & Upsell', 'Week 3-6 -- Scale without hiring', [
        ('8', 'Set up WhatsApp Business API sequences: post-purchase follow-ups, upgrade offers at D14/D30/D60',
         '3 days', '15-30% LTV increase with zero manual work per client'),
        ('9', 'Build automated email/SMS client reporting: monthly GBP stats sent to clients',
         '2 days', 'Increases perceived value, reduces churn dramatically'),
        ('10', 'Replace hardcoded admin auth with Google OAuth or JWT',
         '2 days', 'Security risk -- credentials are in plain text in source code'),
    ])

    # === PHASE 4 ===
    pdf.phase_card('PHASE 4: Vertical Expansion', 'Month 2-3 -- Monetize existing blog traffic', [
        ('11', 'Create vertical-specific landing pages: /restaurants/, /hotels/, /clinics/ with tailored pricing',
         '4 days', 'Monetize existing blog traffic at 30-50% premium pricing'),
        ('12', 'Launch 2 digital products: paid GBP Optimization Guide (GHS 500) + Checklist Pro (GHS 200)',
         '2 days', 'First passive revenue streams -- build once, sell forever'),
        ('13', 'Add multi-currency pricing toggle: GHS / USD on all service pages',
         '1 day', 'Opens diaspora Ghanaian market with higher purchasing power'),
    ])

    # === PHASE 5 ===
    pdf.phase_card('PHASE 5: Scale Infrastructure', 'Month 3-6 -- Prepare for growth beyond 100 clients', [
        ('14', 'Migrate from Google Sheets to proper database (Supabase or Firebase)',
         '1-2 weeks', 'Sheets will break past 100 clients (concurrent write limits, 10M cell cap)'),
        ('15', 'Build multi-location GBP management dashboard for enterprise tier',
         '1 week', 'Unlocks hotels, chains, franchises at GHS 3,000-5,000/mo per account'),
    ])

    # === QUICKEST PATH ===
    pdf.add_page()
    pdf.section_title('2. Quickest Path to GHS 10,000/mo New Revenue',
                      'Do only these 3 things first. Nothing else matters until these are done.')

    pdf.highlight_box([
        ('1.', 'Restructure GBP pricing to monthly retainer (GHS 500-2,000/mo). Get 10 clients on retainer = GHS 5,000-20,000/mo new MRR.'),
        ('2.', 'Add referral program with WhatsApp share. 1-2 referrals/mo from existing clients = GHS 2,000-5,000/mo.'),
        ('3.', 'Add Calendly booking + online payment. Remove the two biggest conversion leaks in the current funnel.'),
    ])

    pdf.ln(4)
    pdf.body_text(
        'These 3 changes alone get you to the lower end of the optimized revenue potential (GHS 106,000/mo) '
        'without building a single new service page or complex automation. They fix the structural issues: '
        '(1) no recurring revenue, (2) no systematic referral generation, (3) manual sales friction.'
    )

    pdf.ln(2)
    pdf.sub_title('Projected Impact of These 3 Changes Alone')

    cols3 = [('Metric', 70), ('Current', 50), ('After 3 Changes', 60)]
    pdf.table_header(cols3)
    impact = [
        ('Monthly recurring revenue', 'GHS 2,500-7,500', 'GHS 7,500-27,500'),
        ('New clients / month', '3-8', '6-15'),
        ('Client LTV', 'GHS 950-4,500', 'GHS 6,000-24,000'),
        ('Referral-driven leads', '~0 (organic)', '~30-50% of new leads'),
        ('Monthly total revenue', 'GHS 15K-37K', 'GHS 50K-90K'),
    ]
    for i, (m, c, a) in enumerate(impact):
        pdf.table_row(cols3, [m, c, a], fill=(i % 2 == 1))

    # === REVENUE GAPS SUMMARY ===
    pdf.add_page()
    pdf.section_title('3. Revenue Gaps Being Closed',
                      'Reference: the 8 gaps identified in the Strategic Analysis')

    cols4 = [
        ('#', 6),
        ('Revenue Gap', 70),
        ('Primary Upgrade', 104),
    ]
    pdf.table_header(cols4)
    gap_map = [
        ('1', 'No recurring model for core GBP', 'Add monthly retainer tiers (Phase 2, #4)'),
        ('2', 'No performance-based pricing', 'Hybrid base + commission pricing (Phase 2)'),
        ('3', 'No vertical-specific packages', 'Vertical landing pages (Phase 4, #11)'),
        ('4', 'No upsell/cross-sell automation', 'WhatsApp sequences (Phase 3, #8)'),
        ('5', 'No digital products / passive income', 'GBP Guide + Checklist Pro (Phase 4, #12)'),
        ('6', 'No retainer contracts', 'Contract options in signup (Phase 2, #7)'),
        ('7', 'No standalone review management', 'Review Management page (Phase 2, #5)'),
        ('8', 'No referral program', 'Referral program (Phase 2, #6)'),
    ]
    for i, (num, gap, upgrade) in enumerate(gap_map):
        pdf.table_row(cols4, [num, gap, upgrade], fill=(i % 2 == 1))

    pdf.ln(3)
    pdf.body_text(
        'Each gap in the Revenue GAP Analysis maps directly to one or more upgrades in this roadmap. '
        'Closing all 8 gaps achieves the GHS 106,000-190,000/mo optimized scenario. The Phase 1-3 upgrades '
        'alone close the first 5 gaps and deliver ~70% of the total upside.'
    )

    # === CLOSING PAGE ===
    pdf.add_page()
    pdf.set_fill_color(*DARK_GREEN)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.set_y(70)
    pdf.set_font('Inter', 'B', 18)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 12, 'Start With the 3 Quick Wins', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_font('Inter', '', 10)
    pdf.set_text_color(*ACCENT)
    pdf.cell(0, 8, 'Then execute the phases in order.', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(100)
    pdf.set_font('Inter', '', 8)
    pdf.set_text_color(180, 200, 180)
    pdf.cell(0, 6, '1. Restructure pricing to monthly retainer', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 6, '2. Add referral program', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 6, '3. Add Calendly + online payment', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.ln(4)
    pdf.cell(0, 6, 'Everything else compounds from there.', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(160)
    pdf.set_fill_color(*PRIMARY)
    pdf.rect(60, 158, 90, 1, 'F')

    pdf.set_y(168)
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

    out = 'Gabochie_Marketing_Revenue_Roadmap_Report.pdf'
    pdf.output(out)
    return out


if __name__ == '__main__':
    path = generate()
    import os
    size = os.path.getsize(path)
    print(f'Report generated: {path}')
    print(f'File size: {size:,} bytes ({size/1024:.1f} KB)')
