import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') || ''

serve(async (req) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  try {
    const { reference, invoice_id, action } = await req.json()

    if (action === 'verify' && reference) {
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      })
      const result = await paystackRes.json()

      if (result.status && result.data.status === 'success') {
        const amount = result.data.amount / 100
        const channel = result.data.channel
        const paidAt = result.data.paid_at

        if (invoice_id) {
          await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoice_id}`, {
            method: 'PATCH',
            headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'paid', paid_at: paidAt, payment_method: channel, payment_ref: reference })
          })
        }

        return new Response(JSON.stringify({ success: true, amount, channel, paidAt }), { headers })
      }

      return new Response(JSON.stringify({ success: false, message: result.message || 'Payment verification failed' }), { status: 400, headers })
    }

    if (action === 'create-plan') {
      const { name, amount, interval, description } = await req.json()
      const paystackRes = await fetch('https://api.paystack.co/plan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount: Math.round(amount * 100), interval: interval || 'monthly', description, currency: 'GHS' })
      })
      const result = await paystackRes.json()
      return new Response(JSON.stringify(result), { headers })
    }

    if (action === 'create-subscription') {
      const { customer, plan, authorization } = await req.json()
      const paystackRes = await fetch('https://api.paystack.co/subscription', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, plan, authorization })
      })
      const result = await paystackRes.json()
      return new Response(JSON.stringify(result), { headers })
    }

    return new Response(JSON.stringify({ success: false, message: 'Unknown action' }), { status: 400, headers })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers })
  }
})
