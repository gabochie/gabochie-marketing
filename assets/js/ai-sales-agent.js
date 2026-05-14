// Gabochie Marketing — AI Sales Agent
(function() {
'use strict';

const CONFIG = {
  apiBase: 'https://script.google.com/macros/s/AKfycbycShRubz9XK1wVo5FW78CUWNqtVvrs_407Xfp01sEWqyDtqC-OEWIOACVFTjMeSXHE/exec',
  whatsapp: '233506384917',
  mobileMoney: '059 985 7126',
  brandName: 'Gabochie Marketing',
  primaryColor: '#1A7B3A',
  accentColor: '#7ED354'
};

// Sales knowledge base
const FAQ = {
  'pricing|cost|price|how much|fee|rates|charges': {
    answer: 'We have three packages:\n\n1. **Starter Visibility** — GHS 950 setup + GHS 500/mo\n2. **Growth System** — GHS 1,500 setup + GHS 1,000/mo (our most popular)\n3. **Market Authority** — GHS 2,500 setup + GHS 2,000/mo\n\nAll include a free Google Visibility Audit to start. Which sounds like the best fit for your business?',
    next: ['starter', 'growth', 'market']
  },
  'starter|basic|entry': {
    answer: '**Starter Visibility** is perfect if you\'re just getting started:\n• Google Business Profile setup & verification\n• Basic optimization (NAP, categories, description)\n• 1 review request per month\n• Monthly performance report\n\nSetup: GHS 950 | Monthly: GHS 500\n→ Ready to start? Drop your number and I\'ll have someone reach out.',
    capture: true
  },
  'growth|popular|recommended|standard': {
    answer: '**Growth System** is our most popular package:\n• Full GBP optimization + multi-location support\n• Weekly photo/video updates\n• 4 review requests per month\n• Competitor tracking\n• WhatsApp integration\n• Monthly strategy call\n\nSetup: GHS 1,500 | Monthly: GHS 1,000\n\n→ Want me to check if your business qualifies? Tell me your business name and location.',
    capture: true
  },
  'market|authority|premium|enterprise': {
    answer: '**Market Authority** is our all-in package for dominating local search:\n• Everything in Growth System\n• Citation building (50+ directories)\n• Reputation management\n• Content creation (blog posts, social media snippets)\n• Priority support\n\nSetup: GHS 2,500 | Monthly: GHS 2,000\n\n→ This is for businesses ready to fully own their local market. Want a free audit?',
    capture: true
  },
  'how.*work|process|what.*do|how.*start|steps': {
    answer: 'Here\'s how we work:\n\n1. **Free Audit** — We analyze your current Google visibility\n2. **Choose Package** — Pick what fits your budget & goals\n3. **Setup** — We optimize your GBP (48-72 hours)\n4. **Monthly Management** — We keep your profile active & growing\n\nWant to start with a free audit? Just tell me your business name 📋',
    capture: true
  },
  'timeline|how long|when|how soon|48|72': {
    answer: 'Most clients see their Google Business Profile optimized and visible within **48-72 hours** of setup. Review generation and ranking improvements build over the first 30 days.',
    capture: false
  },
  'refund|guarantee|money back|risk': {
    answer: 'If we optimize your profile and your business doesn\'t start showing up on Google Maps as agreed, you **don\'t pay**. That\'s our guarantee.',
    capture: false
  },
  'refer|referral|earn|commission|friend': {
    answer: 'Yes! Refer another business and earn **GHS 200** when they sign up. Share your unique referral link from our referral page.',
    capture: false
  },
  'whatsapp|contact|call|speak|human|agent|person|talk': {
    answer: 'You can reach us directly on WhatsApp: https://wa.me/' + CONFIG.whatsapp + '\n\nOr drop your number and I\'ll have a team member call you within a few hours.',
    capture: true
  },
  'payment|pay|mobile money|momomo|transfer|invoice': {
    answer: 'We accept **Mobile Money**:\n📱 **' + CONFIG.mobileMoney + '**\nName: ' + CONFIG.brandName + '\n\nAfter payment, send us a WhatsApp confirmation and we\'ll activate your service.',
    capture: false
  },
  'google maps|visibility|ranking|seo|local': {
    answer: 'We specialize in getting Ghanaian businesses found on Google Maps. Our system optimizes your Business Profile so when customers search for your service in your area, **you show up first**. \n\nReady to check your current visibility? What\'s your business name and location?',
    capture: true
  },
  'hello|hi|hey|yo|helo|help|good morning|good afternoon|good evening|hai|howdy': {
    answer: '👋 Welcome to ' + CONFIG.brandName + '!\n\nI\'m your sales assistant. I can help you with:\n• Pricing & packages\n• How Google Maps optimization works\n• Free visibility audit\n• Getting started today\n\nWhat can I help you with?',
    capture: false
  },
  'thanks|thank|appreciate|awesome|great|nice': {
    answer: 'You\'re welcome! 😊 Anything else you\'d like to know about getting your business on Google Maps?',
    capture: false
  },
  'bye|goodbye|see you|later': {
    answer: 'Thanks for chatting! Feel free to come back anytime. You can also reach us on WhatsApp at https://wa.me/' + CONFIG.whatsapp + ' if you have more questions.',
    capture: false
  }
};

// Default greeting
const GREETING = '👋 Hi! I\'m the ' + CONFIG.brandName + ' sales assistant.\n\nI can help you pick the right package, explain how Google Maps optimization works, or get you started today.\n\nWhat brings you here?';

// ── Widget DOM ──
function injectStyles() {
  const css = document.createElement('style');
  css.textContent = `
    .gabochie-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 60px; height: 60px; border-radius: 50%;
      background: ${CONFIG.primaryColor}; color: #fff;
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(26,123,58,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; transition: transform 0.2s, box-shadow 0.2s;
    }
    .gabochie-chat-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(26,123,58,0.5); }
    .gabochie-chat-btn svg { width: 28px; height: 28px; fill: currentColor; }

    .gabochie-chat-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 9998;
      width: 360px; height: 540px; max-height: calc(100vh - 140px);
      background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      display: none; flex-direction: column; overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideUp 0.25s ease;
    }
    .gabochie-chat-panel.open { display: flex; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .gabochie-chat-header {
      background: ${CONFIG.primaryColor}; color: #fff; padding: 16px 18px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .gabochie-chat-header strong { font-size: 0.95rem; }
    .gabochie-chat-header span { font-size: 0.75rem; opacity: 0.85; }
    .gabochie-chat-close {
      margin-left: auto; background: none; border: none; color: #fff;
      cursor: pointer; font-size: 1.2rem; opacity: 0.7; padding: 0 4px;
    }
    .gabochie-chat-close:hover { opacity: 1; }

    .gabochie-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex;
      flex-direction: column; gap: 10px; scroll-behavior: smooth;
    }
    .gabochie-chat-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 14px;
      font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap;
    }
    .gabochie-chat-msg.bot {
      align-self: flex-start; background: #f0f4f0;
      border-bottom-left-radius: 4px; color: #2D2D2D;
    }
    .gabochie-chat-msg.user {
      align-self: flex-end; background: ${CONFIG.primaryColor};
      color: #fff; border-bottom-right-radius: 4px;
    }
    .gabochie-chat-msg a { color: ${CONFIG.primaryColor}; text-decoration: underline; }
    .gabochie-chat-msg strong { font-weight: 600; }

    .gabochie-chat-options {
      display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;
    }
    .gabochie-chat-options button {
      font-size: 0.75rem; padding: 5px 12px; border-radius: 99px;
      border: 1px solid ${CONFIG.primaryColor}; background: #fff;
      color: ${CONFIG.primaryColor}; cursor: pointer; transition: all 0.15s;
      font-family: inherit;
    }
    .gabochie-chat-options button:hover { background: ${CONFIG.primaryColor}; color: #fff; }

    .gabochie-chat-input-wrap {
      display: flex; border-top: 1px solid #e5e7eb; padding: 10px 12px;
      gap: 8px; background: #fff; flex-shrink: 0;
    }
    .gabochie-chat-input {
      flex: 1; border: 1px solid #d1d5db; border-radius: 99px;
      padding: 8px 14px; font-size: 0.85rem; outline: none;
      font-family: inherit;
    }
    .gabochie-chat-input:focus { border-color: ${CONFIG.primaryColor}; }
    .gabochie-chat-send {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: ${CONFIG.primaryColor}; color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s;
    }
    .gabochie-chat-send:hover { background: #0F5C28; }
    .gabochie-chat-send:disabled { opacity: 0.4; cursor: default; }
    .gabochie-chat-send svg { width: 16px; height: 16px; fill: currentColor; }

    .gabochie-chat-capture {
      padding: 12px 16px; background: #fefce8; border-top: 1px solid #fde68a;
      display: none; flex-direction: column; gap: 8px; flex-shrink: 0;
    }
    .gabochie-chat-capture.open { display: flex; }
    .gabochie-chat-capture p { font-size: 0.8rem; font-weight: 600; color: #92400e; }
    .gabochie-chat-capture input {
      border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px;
      font-size: 0.85rem; outline: none; font-family: inherit;
    }
    .gabochie-chat-capture input:focus { border-color: ${CONFIG.primaryColor}; }
    .gabochie-chat-capture button {
      background: ${CONFIG.primaryColor}; color: #fff; border: none;
      border-radius: 8px; padding: 8px; font-weight: 600; cursor: pointer;
      font-size: 0.85rem; font-family: inherit;
    }
    .gabochie-chat-capture button:hover { background: #0F5C28; }
    .gabochie-chat-capture .note {
      font-size: 0.7rem; color: #6b7280; text-align: center;
    }

    @media (max-width: 480px) {
      .gabochie-chat-panel { width: calc(100vw - 32px); right: 16px; bottom: 88px; height: 60vh; }
    }
  `;
  document.head.appendChild(css);
}

function createWidget() {
  // Button
  const btn = document.createElement('button');
  btn.className = 'gabochie-chat-btn';
  btn.id = 'gabochieChatBtn';
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>';
  btn.setAttribute('aria-label', 'Open chat');
  document.body.appendChild(btn);

  // Panel
  const panel = document.createElement('div');
  panel.className = 'gabochie-chat-panel';
  panel.id = 'gabochieChatPanel';
  panel.innerHTML = `
    <div class="gabochie-chat-header">
      <div><strong>${CONFIG.brandName}</strong><br><span>Sales Assistant</span></div>
      <button class="gabochie-chat-close" id="gabochieChatClose">&times;</button>
    </div>
    <div class="gabochie-chat-messages" id="gabochieChatMessages"></div>
    <div class="gabochie-chat-input-wrap">
      <input class="gabochie-chat-input" id="gabochieChatInput" placeholder="Type your message..." autocomplete="off">
      <button class="gabochie-chat-send" id="gabochieChatSend">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div class="gabochie-chat-capture" id="gabochieChatCapture">
      <p>Leave your details and we'll call you:</p>
      <input type="text" id="gabochieCaptureName" placeholder="Your name">
      <input type="tel" id="gabochieCapturePhone" placeholder="Phone number">
      <button id="gabochieCaptureSubmit">Send &rarr;</button>
      <div class="note">We'll contact you within 24 hours</div>
    </div>
  `;
  document.body.appendChild(panel);

  // State
  const state = {
    open: false,
    messages: [],
    captureActive: false
  };

  const messagesEl = document.getElementById('gabochieChatMessages');
  const inputEl = document.getElementById('gabochieChatInput');
  const sendEl = document.getElementById('gabochieChatSend');
  const captureEl = document.getElementById('gabochieChatCapture');
  const captureName = document.getElementById('gabochieCaptureName');
  const capturePhone = document.getElementById('gabochieCapturePhone');
  const captureSubmit = document.getElementById('gabochieCaptureSubmit');

  function addMessage(text, role, options) {
    state.messages.push({ role, text });
    const div = document.createElement('div');
    div.className = 'gabochie-chat-msg ' + role;

    // Render markdown-style bold and links
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/https?:\/\/[^\s<]+/g, '<a href="$&" target="_blank" rel="noopener">$&</a>')
      .replace(/\n/g, '<br>');
    div.innerHTML = html;

    messagesEl.appendChild(div);

    if (options && options.length) {
      const optDiv = document.createElement('div');
      optDiv.className = 'gabochie-chat-options';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.onclick = () => handleUserMessage(opt.value);
        optDiv.appendChild(btn);
      });
      messagesEl.appendChild(optDiv);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function findMatch(text) {
    const lower = text.toLowerCase().trim();
    for (const [patterns, data] of Object.entries(FAQ)) {
      if (patterns.split('|').some(p => new RegExp('\\b' + p + '\\b').test(lower))) {
        return data;
      }
    }
    return null;
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'gabochie-chat-msg bot';
    typing.textContent = 'Typing...';
    typing.id = 'gabochieTyping';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(() => {
      const typingEl = document.getElementById('gabochieTyping');
      if (typingEl) typingEl.remove();

      const match = findMatch(text);
      if (match) {
        addMessage(match.answer, 'bot');
        if (match.capture) showCapture();
      } else {
        // Fallback: offer WhatsApp transfer + capture
        addMessage('I\'m not sure about that one! Let me connect you with a real person.\n\nDrop your number below and I\'ll have a specialist reach out within a few hours.', 'bot');
        showCapture();
      }
    }, 600 + Math.random() * 400);

    inputEl.value = '';
    sendEl.disabled = false;
  }

  function showCapture() {
    if (state.captureActive) return;
    state.captureActive = true;
    captureEl.classList.add('open');
  }

  function hideCapture() {
    state.captureActive = false;
    captureEl.classList.remove('open');
  }

  function toggle() {
    state.open = !state.open;
    panel.classList.toggle('open', state.open);
    btn.style.display = state.open ? 'none' : 'flex';
    if (state.open && state.messages.length === 0) {
      addMessage(GREETING, 'bot', [
        { label: 'Pricing', value: 'How much does it cost?' },
        { label: 'How it works', value: 'How does it work?' },
        { label: 'Free audit', value: 'I want a free audit' }
      ]);
    }
    if (state.open) {
      inputEl.focus();
    }
  }

  // Event listeners
  btn.onclick = toggle;
  document.getElementById('gabochieChatClose').onclick = toggle;

  sendEl.onclick = () => {
    const text = inputEl.value.trim();
    if (text) handleUserMessage(text);
  };
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendEl.click();
  });

  captureSubmit.onclick = async () => {
    const name = captureName.value.trim();
    const phone = capturePhone.value.trim();
    if (!name || !phone) {
      alert('Please enter your name and phone number.');
      return;
    }

    captureSubmit.disabled = true;
    captureSubmit.textContent = 'Sending...';

    try {
      await fetch(CONFIG.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: name,
          phone: phone,
          source: 'chat-widget',
          notes: 'Captured by AI Sales Agent chat widget',
          outreachCategory: 'Chat Lead'
        })
      });
    } catch (_) {}

    addMessage('Thanks ' + name + '! Your details have been sent. A team member will call you on **' + phone + '** within 24 hours.\n\nIn the meantime, you can also reach us directly on WhatsApp: https://wa.me/' + CONFIG.whatsapp, 'bot');
    hideCapture();
    captureSubmit.disabled = false;
    captureSubmit.textContent = 'Send →';
    captureName.value = '';
    capturePhone.value = '';
  };
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { injectStyles(); createWidget(); });
} else {
  injectStyles();
  createWidget();
}

})();
