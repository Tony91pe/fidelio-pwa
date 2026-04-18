'use client'
import Link from 'next/link'

interface PlanGateProps {
  currentPlan?: string
  requiredPlan: 'GROWTH' | 'PRO'
  feature: string
  description?: string
}

const PLAN_COLORS = { GROWTH: '#7C3AED', PRO: '#f97316' }
const PLAN_PRICES = { GROWTH: '39', PRO: '79' }

export function PlanGate({ currentPlan, requiredPlan, feature, description }: PlanGateProps) {
  const color = PLAN_COLORS[requiredPlan]
  const price = PLAN_PRICES[requiredPlan]

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div
        className="w-full max-w-sm rounded-3xl p-7 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${color}33`,
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: color + '15', border: `1px solid ${color}30` }}
        >
          🔒
        </div>

        {/* Piano attuale badge */}
        {currentPlan && (
          <div className="mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
            >
              Piano attuale: {currentPlan}
            </span>
          </div>
        )}

        <h2 className="font-display font-bold text-xl mb-2">{feature}</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          {description ?? `Questa funzionalità richiede il piano ${requiredPlan}. Aggiorna dal portale web per sbloccarla.`}
        </p>

        {/* Price card */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: color + '12', border: `1px solid ${color}33` }}
        >
          <p className="text-xs font-bold mb-1" style={{ color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Piano {requiredPlan}
          </p>
          <p className="font-display font-black text-3xl" style={{ color }}>
            €{price}<span className="text-base font-normal" style={{ color: 'rgba(255,255,255,0.35)' }}>/mese</span>
          </p>
        </div>

        <a
          href="https://fidelio-web.vercel.app/dashboard/upgrade"
          target="_blank"
          rel="noreferrer"
          className="block w-full py-3.5 rounded-xl font-bold text-sm"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            boxShadow: `0 4px 16px ${color}44`,
            color: 'white',
            textDecoration: 'none',
          }}
        >
          Aggiorna a {requiredPlan} →
        </a>

        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Aggiorna dal pannello web Fidelio
        </p>
      </div>
    </div>
  )
}
