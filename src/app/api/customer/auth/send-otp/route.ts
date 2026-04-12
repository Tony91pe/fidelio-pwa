import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Store OTPs in memory for simplicity (use Redis in production)
const otpStore = new Map<string, { code: string; expires: number; name?: string }>()

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

  // Find or note existing customer
  const existing = await db.customer.findFirst({ where: { email } })

  otpStore.set(email, { code, expires, name: existing?.name })

  try {
    await resend.emails.send({
      from: 'Fidelio <noreply@fidelio.it>',
      to: email,
      subject: `Il tuo codice Fidelio: ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #7C3AED, #3B82F6); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 28px; margin: 0 0 8px;">Fidelio</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">La tua carta fedeltà digitale</p>
          </div>
          <h2 style="color: #1a1a2e; font-size: 20px; margin-bottom: 8px;">Il tuo codice di accesso</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Usa questo codice per accedere a Fidelio. Valido per 10 minuti.</p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #7C3AED;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">Non hai richiesto questo codice? Ignora questa email.</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('Error sending OTP email:', err)
    // Still return success to not leak info, but log the error
  }

  return NextResponse.json({ ok: true })
}

export { otpStore }
