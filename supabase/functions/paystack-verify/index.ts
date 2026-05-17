import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') || ''

function verifyWebhook(sig: string, body: string, secret: string): boolean {
  try {
    const encoder = new TextEncoder()
    const key = encoder.encode(secret)
    const data = encoder.encode(body)
    const cryptoKey = crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
    // Sync fallback for Deno
    const hashBuf = new Uint8Array(64)
    const keyData = key
    const blockSize = 128
    const ipad = new Uint8Array(blockSize)
    const opad = new Uint8Array(blockSize)
    for (let i = 0; i < blockSize; i++) {
      ipad[i] = keyData[i] || 0 ^ 0x36
      opad[i] = keyData[i] || 0 ^ 0x5c
    }
    const inner = new Uint8Array([...ipad, ...data])
    const innerHash = new Uint8Array(await crypto.subtle.digest('SHA-512', inner))
    const outer = new Uint8Array([...opad, ...innerHash])
    const fullHash = new Uint8Array(await crypto.subtle.digest('SHA-512', outer))
    const computed = Array.from(fullHash).map(b => b.toString(16).padStart(2, '0')).join('')
    return computed === sig
  } catch { return false }
}

serve(async (req) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // ── WEBHOOK: Paystack event notification ──
    if (body.event) {
      const sig = req.headers.get('x-paystack-signature') || ''
      const webhookSecret = Deno.env.get('PAYSTACK_WEBHOOK_SECRET') || ''
      if (webhookSecret && !verifyWebhook(sig, rawBody, webhookSecret)) {
        console.error('Webhook signature invalid')
        return new Response(JSON.stringify({ status: 'invalid signature' }), { status: 403, headers })
      }
      if (body.event === 'charge.success') {
        const data = body.data
        const ref = data.reference
        const metadataId = data.metadata?.invoice_id
        if (metadataId && ref) {
          const paidAmount = data.amount / 100
          const channel = data.channel
          const paidAt = data.paid_at
          await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${metadataId}`, {
            method: 'PATCH',
            headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'paid', paid_at: paidAt, payment_method: channel, payment_ref: ref })
          })
        }
      }
      return new Response(JSON.stringify({ status: 'ok' }), { headers })
    }

    // ── DIRECT API CALL: verification or plan/subscription management ──
    const { reference, invoice_id, action } = body

    if (action === 'verify' && reference) {
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      })
      const result = await paystackRes.json()
      if (!result.status || result.data.status !== 'success') {
        return new Response(JSON.stringify({ success: false, message: 'Payment verification failed' }), { status: 400, headers })
      }
      const paidAmount = result.data.amount / 100
      const channel = result.data.channel
      const paidAt = result.data.paid_at
      const metadataId = result.data.metadata?.invoice_id
      const resolvedId = String(metadataId || invoice_id || '')
      if (!resolvedId) {
        return new Response(JSON.stringify({ success: false, message: 'No invoice reference' }), { status: 400, headers })
      }
      if (invoice_id && metadataId && String(metadataId) !== String(invoice_id)) {
        return new Response(JSON.stringify({ success: false, message: 'Invoice mismatch' }), { status: 403, headers })
      }
      const invRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${resolvedId}&select=amount`, {
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` }
      })
      const invData = await invRes.json()
      if (invData && invData.length > 0) {
        const invAmt = parseFloat(invData[0].amount) || 0
        if (Math.abs(invAmt - paidAmount) > 0.01) {
          return new Response(JSON.stringify({ success: false, message: 'Amount mismatch' }), { status: 403, headers })
        }
      }
      await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${resolvedId}`, {
        method: 'PATCH',
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paid_at: paidAt, payment_method: channel, payment_ref: reference })
      })
      return new Response(JSON.stringify({ success: true, amount: paidAmount, channel, paidAt }), { headers })
    }

    if (action === 'create-plan') {
      const { name, amount, interval, description } = body
      const r = await fetch('https://api.paystack.co/plan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount: Math.round(amount * 100), interval: interval || 'monthly', description, currency: 'GHS' })
      })
      return new Response(JSON.stringify(await r.json()), { headers })
    }

    if (action === 'create-subscription') {
      const { customer, plan, authorization } = body
      const r = await fetch('https://api.paystack.co/subscription', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, plan, authorization })
      })
      return new Response(JSON.stringify(await r.json()), { headers })
    }

    return new Response(JSON.stringify({ success: false, message: 'Unknown action' }), { status: 400, headers })
  } catch (e) {
    console.error('paystack-verify error:', e)
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500, headers })
  }
})
