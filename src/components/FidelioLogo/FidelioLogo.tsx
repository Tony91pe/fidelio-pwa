import { Playfair_Display } from 'next/font/google'
import styles from './FidelioLogo.module.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  style: ['italic'],
  display: 'swap',
})

interface FidelioLogoProps {
  animate?: boolean
  size?: 'sm' | 'md' | 'lg'
  tagline?: boolean
  markOnly?: boolean
  className?: string
}

const sizes = { sm: 48, md: 72, lg: 96 }

export function FidelioLogo({
  animate = true,
  size = 'md',
  tagline = true,
  markOnly = false,
  className,
}: FidelioLogoProps) {
  const px = sizes[size]
  const scale = px / 72

  return (
    <div
      className={`${styles.logo} ${className ?? ''}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
    >
      <div className={styles.mark}>
        <svg viewBox="0 0 72 72" width={72} height={72} style={{ position: 'absolute', inset: 0 }} overflow="visible" aria-hidden>
          <rect x="0" y="0" width="72" height="72" fill="#0F1B4C" />
          <rect className={animate ? styles.border : undefined} x="1" y="1" width="70" height="70" fill="none" stroke="#C8A84B" strokeWidth="1.8" style={!animate ? { strokeDashoffset: 0 } : undefined} />
          <rect className={animate ? styles.borderInner : undefined} x="8" y="8" width="56" height="56" fill="none" stroke="#C8A84B" strokeWidth="0.7" opacity={animate ? 0 : 0.3} />
          <g className={animate ? styles.corners : undefined} opacity={animate ? 0 : 1}>
            <path d="M4 18 L4 4 L18 4"    fill="none" stroke="#C8A84B" strokeWidth="1" opacity=".7"/>
            <path d="M68 18 L68 4 L54 4"   fill="none" stroke="#C8A84B" strokeWidth="1" opacity=".7"/>
            <path d="M4 54 L4 68 L18 68"   fill="none" stroke="#C8A84B" strokeWidth="1" opacity=".7"/>
            <path d="M68 54 L68 68 L54 68" fill="none" stroke="#C8A84B" strokeWidth="1" opacity=".7"/>
          </g>
          <rect className={animate ? styles.fVert : undefined} x="20" y="14" width="6" height="44" fill="#F0EAD6" opacity={animate ? 0 : 1} />
          <rect className={animate ? styles.fTop : undefined} x="20" y="14" width="30" height="6" fill="#F0EAD6" opacity={animate ? 0 : 1} />
          <rect className={animate ? styles.fMid : undefined} x="20" y="31" width="23" height="5.5" fill="#F0EAD6" opacity={animate ? 0 : 1} />
          <rect className={animate ? styles.fFoot : undefined} x="15" y="54" width="15" height="2" fill="#F0EAD6" opacity={animate ? 0 : 0.35} />
          <circle className={animate ? styles.dot : undefined} cx="55" cy="50" r="4" fill="#C8A84B" opacity={animate ? 0 : 1} />
        </svg>
      </div>

      {!markOnly && <div
        className={animate ? styles.vDivider : undefined}
        style={!animate ? { width: 1, height: 52, background: 'linear-gradient(180deg,transparent,#C8A84B 40%,#C8A84B 60%,transparent)' } : {}}
      />}

      {!markOnly && <div className={styles.wordmarkWrap}>
        <div
          className={`${playfair.className} ${animate ? styles.wordmark : ''}`}
          style={!animate ? { fontSize: 44, fontStyle: 'italic', fontWeight: 700, color: '#F0EAD6', letterSpacing: '.06em', lineHeight: 1 } : {}}
        >
          FIDELIO
        </div>
        <div
          className={animate ? styles.rule : undefined}
          style={!animate ? { width: 140, height: 1, background: 'linear-gradient(90deg,#C8A84B,transparent)' } : {}}
        />
        {tagline && (
          <div
            className={animate ? styles.tagline : undefined}
            style={!animate ? { fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: '#C8A84B', opacity: .65 } : {}}
          >
            Fedeltà Digitale · Made in Italy
          </div>
        )}
      </div>}
    </div>
  )
}
