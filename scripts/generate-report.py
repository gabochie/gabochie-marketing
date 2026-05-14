from fpdf import FPDF
from datetime import datetime

# Brand colors
PRIMARY = (26, 123, 58)
ACCENT = (126, 211, 84)
DARK_GREEN = (15, 92, 40)
DARK_TEXT = (45, 45, 45)
LIGHT_BG = (245, 247, 250)
WHITE = (255, 255, 255)
MEDIUM_GRAY = (100, 100, 100)
LIGHT_GRAY = (200, 200, 200)
RED_ACCENT = (200, 50, 50)
AMBER = (245, 158, 11)

FONT_DIR = r'C:\Windows\Fonts'


class GabochieReport(FPDF):

    def _setup_fonts(self):
        self.add_font('Inter', '', FONT_DIR + r'\arial.ttf', uni=True)
        self.add_font('Inter', 'B', FONT_DIR + r'\arialbd.ttf', uni=True)
        self.add_font('Inter', 'I', FONT_DIR + r'\ariali.ttf', uni=True)
        self.add_font('Inter', 'BI', FONT_DIR + r'\arialbi.ttf', uni=True)

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
            self.cell(90, 5, 'Strategic Business Analysis', new_x="RIGHT", new_y="TOP")
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
        self.cell(0, 14, 'Strategic Business Analysis', new_x="LMARGIN", new_y="NEXT", align='C')

        self.set_font('Inter', '', 11)
        self.set_text_color(200, 220, 200)
        self.cell(0, 8, 'SWOT Analysis & Revenue GAP Analysis', new_x="LMARGIN", new_y="NEXT", align='C')

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

    def gap_card(self, title, current, recommended, impact, color=PRIMARY):
        self.ln(1.5)
        y_start = self.get_y()

        if y_start > 255:
            self.add_page()
            y_start = self.get_y()

        self.set_draw_color(*color)
        self.set_line_width(0.4)
        self.rect(15, y_start, 180, 28)

        self.set_fill_color(*color)
        self.rect(15, y_start, 2.5, 28, 'F')

        self.set_xy(20, y_start + 1.5)
        self.set_font('Inter', 'B', 8.5)
        self.set_text_color(*color)
        self.cell(160, 5, title, new_x="LMARGIN", new_y="NEXT")

        self.set_x(20)
        self.set_font('Inter', 'B', 7)
        self.set_text_color(*DARK_TEXT)
        self.cell(22, 4.5, 'Current:', new_x="RIGHT", new_y="TOP")
        self.set_font('Inter', '', 7)
        self.cell(140, 4.5, current, new_x="LMARGIN", new_y="NEXT")

        self.set_x(20)
        self.set_font('Inter', 'B', 7)
        self.set_text_color(*DARK_TEXT)
        self.cell(22, 4.5, 'Recommended:', new_x="RIGHT", new_y="TOP")
        self.set_font('Inter', '', 7)
        self.cell(140, 4.5, recommended, new_x="LMARGIN", new_y="NEXT")

        self.set_x(20)
        self.set_font('Inter', 'B', 7)
        self.set_text_color(*color)
        self.cell(22, 4.5, 'Impact:', new_x="RIGHT", new_y="TOP")
        self.set_font('Inter', '', 7)
        self.set_text_color(*DARK_TEXT)
        self.cell(140, 4.5, impact, new_x="LMARGIN", new_y="NEXT")

        self.set_y(y_start + 30)


def generate_report():
    pdf = GabochieReport('P', 'mm', 'A4')
    pdf._setup_fonts()
    pdf.set_auto_page_break(auto=True, margin=16)

    # =================== COVER PAGE ===================
    pdf.cover_page()

    # =================== TABLE OF CONTENTS ===================
    pdf.add_page()
    pdf.ln(6)
    pdf.section_title('Table of Contents')
    pdf.ln(2)

    toc_items = [
        ('1.', 'Executive Summary', 'High-level overview of Gabochie Marketing\'s strategic position'),
        ('2.', 'SWOT Analysis', 'Strengths, Weaknesses, Opportunities, and Threats assessment'),
        ('  2.1', 'Strengths', 'Internal capabilities and competitive advantages'),
        ('  2.2', 'Weaknesses', 'Internal gaps and areas for improvement'),
        ('  2.3', 'Opportunities', 'External growth potential and market openings'),
        ('  2.4', 'Threats', 'External risks and competitive pressures'),
        ('3.', 'Revenue GAP Analysis', 'Revenue model assessment and growth opportunities'),
        ('  3.1', 'Current Revenue Streams', 'Existing pricing and revenue breakdown'),
        ('  3.2', 'Revenue Gaps (1-8)', 'Identified gaps with recommended solutions'),
        ('  3.3', 'Impact Summary & Priority Actions', 'Quantified upside and ranked actions'),
    ]

    for num, title, desc in toc_items:
        if not num.startswith(' '):
            pdf.set_font('Inter', 'B', 9)
            pdf.set_text_color(*DARK_GREEN)
            pdf.ln(1.5)
        else:
            pdf.set_font('Inter', '', 8)
            pdf.set_text_color(*DARK_TEXT)
        pdf.cell(12, 5, num, new_x="RIGHT", new_y="TOP")
        pdf.cell(50, 5, title, new_x="RIGHT", new_y="TOP")
        pdf.set_font('Inter', 'I', 7)
        pdf.set_text_color(*MEDIUM_GRAY)
        pdf.cell(0, 5, desc, new_x="LMARGIN", new_y="NEXT")

    # =================== EXECUTIVE SUMMARY ===================
    pdf.add_page()
    pdf.section_title('1. Executive Summary',
                      'Gabochie Marketing - marketing.gabochie.com')

    pdf.body_text(
        'Gabochie Marketing is a Ghana-based digital marketing agency specializing in Google Business Profile '
        'optimization and local SEO. Positioned as "Ghana\'s #1 Local Visibility Agency," the company helps '
        'Ghanaian businesses turn Google Maps into a predictable customer acquisition channel through its '
        'proprietary "Google Maps Profit System" - a 3-step framework covering Visibility, Authority, and Conversion.'
    )
    pdf.ln(1)
    pdf.body_text(
        'The business serves the Greater Accra region with a comprehensive service stack: GBP optimization '
        '(GHS 950-10,000), WordPress website building (GHS 2,500-10,000 one-time), and WordPress maintenance '
        '(GHS 350-1,200/month). The technical infrastructure runs on a serverless stack (Jekyll + Tailwind CSS + '
        'Google Apps Script/Sheets), enabling zero-cost backend operations. A full admin CRM with AI-powered '
        'messaging (Gemini/Groq) and a client portal for GBP performance tracking provide operational '
        'sophistication atypical for a small agency.'
    )
    pdf.ln(1)
    pdf.body_text(
        'This analysis evaluates the company\'s internal capabilities and market position (SWOT) and identifies '
        '8 specific revenue gaps that, if closed, could add GHS 13,500-43,000+ in monthly recurring revenue '
        'while significantly improving customer lifetime value and competitive differentiation.'
    )

    # Key metrics box
    pdf.ln(3)
    pdf.set_draw_color(*PRIMARY)
    pdf.set_fill_color(240, 248, 235)
    y0 = pdf.get_y()
    pdf.rect(15, y0, 180, 28)
    pdf.set_fill_color(*PRIMARY)
    pdf.rect(15, y0, 180, 6, 'F')
    pdf.set_y(y0 + 1.2)
    pdf.set_font('Inter', 'B', 8)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 4, '  Key Metrics', new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(18)
    pdf.set_font('Inter', '', 7)
    pdf.set_text_color(*DARK_TEXT)
    metrics = [
        ('Tagline:', "Ghana's #1 Local Visibility Agency"),
        ('Price Range:', 'GHS 950 - 15,000+'),
        ('Avg. Rating:', '4.9 / 5.0 (50+ reviews)'),
        ('Tech Stack:', 'Jekyll + Tailwind CSS + Google Apps Script'),
        ('Services:', 'GBP Optimization, WordPress Sites, WP Maintenance'),
    ]
    for label, val in metrics:
        pdf.cell(30, 4.5, f'  {label}', new_x="RIGHT", new_y="TOP")
        pdf.set_font('Inter', 'B', 7)
        pdf.cell(0, 4.5, val, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font('Inter', '', 7)
        pdf.set_x(18)

    # =================== SWOT ANALYSIS ===================
    pdf.add_page()
    pdf.section_title('2. SWOT Analysis',
                      'Assessment of internal strengths/weaknesses and external opportunities/threats')

    # Quadrant dimensions
    qw = 88
    qh = 72
    start_x = 14
    gap = 6

    # Row 1
    def swot_quadrant(pdf, title, items, color_top, color_bottom, x, y, w, h):
        half = h / 2
        pdf.set_fill_color(*color_top)
        pdf.rect(x, y, w, half, 'F')
        pdf.set_xy(x, y)
        pdf.set_font('Inter', 'B', 7.5)
        pdf.set_text_color(*WHITE)
        pdf.cell(w, 5, f'  {title}', new_x="LMARGIN", new_y="NEXT", align='L')
        pdf.set_xy(x + w - 12, y + 1)
        pdf.set_font('Inter', '', 6)
        pdf.set_text_color(*ACCENT)
        pdf.cell(10, 4, f'{len(items)} items', new_x="LMARGIN", new_y="NEXT", align='R')
        pdf.set_xy(x + 1.5, y + 6)
        pdf.set_font('Inter', '', 6.5)
        pdf.set_text_color(*WHITE)
        for item in items:
            pdf.set_x(x + 2)
            # Check if we need to wrap text
            if pdf.get_x() + w - 4 < 100:
                pdf.cell(w - 4, 3.8, f'  {item}', new_x="LMARGIN", new_y="NEXT")
            else:
                pdf.multi_cell(w - 4, 3.8, f'  {item}')

    swot_quadrant(pdf, 'STRENGTHS', [
        'Niche specialization: Google Maps / local SEO for Ghana',
        'Full schema markup and technical SEO implementation',
        'Zero-cost serverless backend (Apps Script + Sheets)',
        'Unique client portal with real-time GBP tracking',
        'AI-powered admin CRM (Gemini / Groq integration)',
        '3-step sales funnel: lead magnet + audit + package',
        'Deep Ghana cultural context in all content',
        'WhatsApp-native sales and support throughout funnel',
    ], PRIMARY, DARK_GREEN, start_x, pdf.get_y(), qw, qh)

    swot_quadrant(pdf, 'WEAKNESSES', [
        'No online payment processing (manual invoicing)',
        'Vanilla HTML/CSS - no framework, hard to scale',
        'Admin credentials hardcoded (security risk)',
        'Google Sheets not scalable past 50-100 clients',
        'No automated client reporting (email/SMS)',
        'Core GBP service lacks monthly recurring model',
        'No quantified case studies with real ROI data',
        'No Calendly-style automated appointment booking',
    ], (180, 70, 70), (140, 40, 40), start_x + qw + gap, pdf.get_y(), qw, qh)

    pdf.set_y(pdf.get_y() + qh + gap)

    swot_quadrant(pdf, 'OPPORTUNITIES', [
        'Massively underserved market in Ghana',
        'Low SEO competition for local SEO Ghana keywords',
        '50%+ of Ghanaians use voice search daily',
        'Industry vertical expansion: restaurants, hotels',
        'Shift GBP from one-time to monthly retainer',
        'Multi-location GBP for chains and franchises',
        'YouTube/TikTok educational content - zero competition',
        'Referral program for word-of-mouth culture',
    ], (50, 130, 200), (30, 80, 150), start_x, pdf.get_y(), qw, qh)

    swot_quadrant(pdf, 'THREATS', [
        'Google policy/algorithm changes',
        'Low entry barrier: freelancers at $20-50',
        'Single platform dependency on Google Maps',
        'GHS inflation reduces marketing budgets',
        'DIY tools becoming more capable over time',
        'AI commoditization of SEO content creation',
        'Infrastructure issues (power, internet)',
        'International agencies could enter market',
    ], AMBER, (160, 100, 30), start_x + qw + gap, pdf.get_y(), qw, qh)

    pdf.ln(4)
    pdf.body_text(
        'Summary: Gabochie Marketing has a strong niche position with sophisticated infrastructure for its size. '
        'The primary strategic imperatives are: (1) converting the core GBP offering to a recurring revenue model, '
        '(2) closing the payment processing gap, and (3) leveraging the content engine for vertical-specific '
        'service lines before competition intensifies.'
    )

    # =================== REVENUE GAP ANALYSIS ===================
    pdf.add_page()
    pdf.section_title('3. Revenue GAP Analysis',
                      'Assessment of current revenue model vs. optimal state')

    pdf.sub_title('3.1 Current Revenue Streams')

    cols = [
        ('Service', 42),
        ('Product', 50),
        ('Price (GHS)', 25),
        ('Price (USD)', 22),
        ('Type', 41),
    ]

    pdf.table_header(cols)

    rev_data = [
        ('Primary', 'Starter Visibility', '950-1,200', '$65-80', 'One-time'),
        ('Primary', 'Growth System', 'From 4,500', '~$300', 'One-time + 30d'),
        ('Primary', 'Market Authority', 'From 10,000', '~$670', 'One-time + 3mo'),
        ('Secondary', 'WP Site - Starter', '2,500', '~$170', 'One-time'),
        ('Secondary', 'WP Site - Professional', '5,000', '~$335', 'One-time'),
        ('Secondary', 'WP Site - Enterprise', '10,000', '~$670', 'One-time'),
        ('Recurring', 'WP Support - Basic', '350/mo', '~$23/mo', 'Monthly'),
        ('Recurring', 'WP Support - Professional', '650/mo', '~$43/mo', 'Monthly'),
        ('Recurring', 'WP Support - Enterprise', '1,200/mo', '~$80/mo', 'Monthly'),
    ]

    for i, (tier, prod, price_g, price_u, rtype) in enumerate(rev_data):
        pdf.table_row(cols, [tier, prod, price_g, price_u, rtype], fill=(i % 2 == 1))

    pdf.ln(3)
    pdf.body_text(
        'Critical observation: Only secondary services (WordPress Support) have a monthly recurring model. '
        'The core GBP optimization service - the company\'s primary differentiator - is sold as one-time or '
        'fixed-term, generating zero ongoing revenue after delivery. This is the single largest structural gap '
        'in the revenue model.'
    )

    # -- Revenue Gaps --
    pdf.add_page()
    pdf.sub_title('3.2 Identified Revenue Gaps')

    gaps = [
        {
            'title': 'GAP #1: No Recurring Model for Core GBP Service',
            'current': 'GBP packages are one-time (GHS 950) or fixed-term (GHS 4,500-10,000). Client pays once, no further revenue.',
            'recommended': 'Add GBP Monthly Management Retainer - GHS 500-2,000/mo for ongoing optimization, posts, review mgmt, reporting.',
            'impact': '10 clients on GHS 1,000/mo retainer = GHS 10,000/mo predictable MRR vs. sporadic one-offs.'
        },
        {
            'title': 'GAP #2: No Performance / Commission-Based Pricing',
            'current': 'Fixed fee only. No pricing model for risk-averse businesses who question value.',
            'recommended': 'Offer hybrid model: lower base retainer + performance bonus on calls/leads generated via GBP.',
            'impact': 'Unlocks price-sensitive segment. Differentiates from low-cost freelancers.'
        },
        {
            'title': 'GAP #3: No Vertical-Specific Packages',
            'current': 'One-size-fits-all packages. Blog targets 10+ industries but no tailored offerings.',
            'recommended': 'Create industry-specific packages: Restaurant (GHS 800/mo), Hotel (GHS 2,000/mo), Medical (GHS 1,200/mo).',
            'impact': 'Higher blog conversion. 30-50% premium for specialized expertise.'
        },
        {
            'title': 'GAP #4: No Upsell / Cross-Sell Automation',
            'current': 'No automated post-purchase follow-up. No system to cross-sell GBP > WordPress > WP Support.',
            'recommended': 'WhatsApp/email sequences: offer Growth upgrade at day 14; WP buyer gets GBP audit offer.',
            'impact': '15-30% increase in customer LTV with near-zero incremental cost.'
        },
        {
            'title': 'GAP #5: No Digital Products / Passive Income',
            'current': '100% service revenue. No scalable passive income streams.',
            'recommended': 'Launch: DIY GBP Guide (GHS 500), Video Course (GHS 1,500), Audit Templates (GHS 200).',
            'impact': 'Low-effort revenue. Builds authority. Captures DIY segment.'
        },
        {
            'title': 'GAP #6: No Retainer Agreements or Contracts',
            'current': 'No minimum commitment. Clients can churn anytime with zero notice.',
            'recommended': '3/6-month contracts: 10% discount for 6-month, priority support, locked-in pricing.',
            'impact': 'Reduces churn, improves cash flow predictability.'
        },
        {
            'title': 'GAP #7: No Standalone Review Management Service',
            'current': 'Review generation is bundled only into high-tier packages (GHS 4,500+).',
            'recommended': 'Standalone Review Management at GHS 500/mo - automated requests, reply drafting, monitoring.',
            'impact': 'Low-friction entry point (GHS 500 vs GHS 4,500). Graduates to full management.'
        },
        {
            'title': 'GAP #8: No Referral / Affiliate Program',
            'current': 'Zero referral infrastructure despite word-of-mouth dominance in Ghana.',
            'recommended': 'Refer a Business: referrer gets 10% of first payment or GHS 200 flat fee.',
            'impact': 'Low-cost acquisition in trust-based market. Leverages WhatsApp network.'
        },
    ]

    for gap in gaps:
        pdf.gap_card(gap['title'], gap['current'], gap['recommended'], gap['impact'])

    # -- Impact Summary --
    pdf.add_page()
    pdf.sub_title('3.3 Revenue Impact Summary')

    cols2 = [
        ('Gap', 72),
        ('Current', 40),
        ('Recommended', 40),
        ('Est. Monthly Impact', 28),
    ]

    pdf.table_header(cols2)

    summary_data = [
        ('#1 No recurring GBP model', 'One-time GHS 950', '+ GHS 500-2,000/mo', '+GHS 5K-20K'),
        ('#2 No performance pricing', 'Fixed fee only', 'Hybrid: base + commission', '+GHS 2K-5K'),
        ('#3 No vertical packages', 'Generic pricing', 'Industry tiers (+30-50%)', '+GHS 3K-10K'),
        ('#4 No upsell automation', 'Manual only', 'WhatsApp/email sequences', '+15-30% LTV'),
        ('#5 No digital products', 'GHS 0 passive', 'Courses, templates, tools', '+GHS 2K-5K/mo'),
        ('#6 No retainer contracts', 'Month-to-month', '3/6-month commitments', '+stability'),
        ('#7 No review-only service', 'Bundled only', 'Standalone GHS 500/mo', '+GHS 2.5K-5K/mo'),
        ('#8 No referral program', 'Organic only', '10% commission', '+GHS 1K-3K/mo'),
    ]

    for i, (gap, curr, rec, impact) in enumerate(summary_data):
        pdf.table_row(cols2, [gap, curr, rec, impact], fill=(i % 2 == 1))

    pdf.ln(3)
    pdf.set_draw_color(*PRIMARY)
    pdf.set_fill_color(*DARK_GREEN)
    pdf.rect(15, pdf.get_y(), 180, 7, 'F')
    pdf.set_y(pdf.get_y() + 1.5)
    pdf.set_font('Inter', 'B', 9)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 4, '  TOTAL ESTIMATED MONTHLY UPSIDE: GHS 13,500 - 43,000+  (~$900 - $2,900/mo)',
             new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    pdf.body_text(
        'This total excludes compounding effects: recurring revenue builds month-over-month, referral clients '
        'bring their own LTV, and digital products have near-zero marginal cost. The actual 12-month impact '
        'from closing all 8 gaps could be 2-3x the monthly estimate due to growth compounding.'
    )

    # -- Priority Actions --
    pdf.ln(3)
    pdf.sub_title('Priority Actions (Ranked)')

    actions = [
        ('1', 'Convert GBP to monthly retainer model', 'Highest impact - single biggest revenue lever'),
        ('2', 'Add referral program', 'Near-zero cost, high cultural fit for Ghana'),
        ('3', 'Build vertical-specific landing pages', 'Monetize existing blog traffic by industry'),
        ('4', 'Set up post-purchase automation (WhatsApp)', 'No-code with WhatsApp Business API + Sheets'),
        ('5', 'Launch review management as standalone', 'Low-friction upsell entry at GHS 500/mo'),
        ('6', 'Add appointment booking (Calendly)', 'Remove friction from audit to consultation to sale'),
        ('7', 'Create 1-2 digital products', 'Start with paid upgrade of 27-point checklist'),
    ]

    cols3 = [
        ('#', 8),
        ('Action', 72),
        ('Rationale', 100),
    ]

    pdf.table_header(cols3)
    for i, (num, action, rationale) in enumerate(actions):
        pdf.table_row(cols3, [num, action, rationale], fill=(i % 2 == 1))

    # =================== FINAL PAGE ===================
    pdf.add_page()
    pdf.set_fill_color(*DARK_GREEN)
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.set_y(80)
    pdf.set_font('Inter', 'B', 18)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 12, 'Strategic Recommendations', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_font('Inter', '', 10)
    pdf.set_text_color(*ACCENT)
    pdf.cell(0, 8, 'Close the gaps. Build recurring revenue. Dominate the niche.',
             new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(110)
    pdf.set_font('Inter', '', 8)
    pdf.set_text_color(180, 200, 180)
    pdf.cell(0, 6, 'Gabochie Marketing has a strong foundation. The path from micro-agency',
             new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 6, 'to market leader runs through recurring revenue, vertical specialization,',
             new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 6, 'and systematic referral generation.',
             new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(150)
    pdf.set_fill_color(*PRIMARY)
    pdf.rect(60, 148, 90, 1, 'F')

    pdf.set_y(158)
    pdf.set_font('Inter', '', 8)
    pdf.set_text_color(160, 190, 160)
    pdf.cell(0, 5, 'marketing.gabochie.com', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 5, 'gabochiemarketing@gmail.com', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 5, '+233 50 638 4917', new_x="LMARGIN", new_y="NEXT", align='C')

    pdf.set_y(260)
    pdf.set_font('Inter', 'I', 6)
    pdf.set_text_color(120, 150, 120)
    pdf.cell(0, 4, 'Confidential - Prepared for Internal Strategy Use',
             new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.cell(0, 4, f'Generated {datetime.now().strftime("%B %d, %Y")}',
             new_x="LMARGIN", new_y="NEXT", align='C')

    # Output
    output_path = 'Gabochie_Marketing_Strategic_Analysis_Report.pdf'
    pdf.output(output_path)
    return output_path


if __name__ == '__main__':
    path = generate_report()
    import os
    size = os.path.getsize(path)
    print(f'Report generated: {path}')
    print(f'File size: {size:,} bytes ({size/1024:.1f} KB)')
