# Fidelio PWA — Cliente

PWA per i clienti Fidelio. Login via OTP email, QR personale, mappa negozi, premi.

## Stack

- Next.js 14 App Router
- React 18 + TypeScript
- TailwindCSS
- React Query (TanStack)
- Zustand
- next-pwa
- Leaflet (mappa)
- jsQR (scanner QR via Web API)
- QRCode (generazione QR)

## Setup

```bash
npm install
cp .env.local.example .env.local
# Modifica NEXT_PUBLIC_API_URL con l'URL del backend Fidelio
npm run dev
```

## Variabili d'ambiente

```
NEXT_PUBLIC_API_URL=https://fidelio-web-git-main-tony91pes-projects.vercel.app
```

## API Backend necessarie

La PWA richiede questi endpoint sul backend Fidelio:

### Auth cliente (da aggiungere)
- `POST /api/customer/auth/send-otp` — body: `{ email }` → invia OTP via email
- `POST /api/customer/auth/verify-otp` — body: `{ email, code }` → restituisce `{ token, customer }`

### Dati cliente (da aggiungere)
- `GET /api/customer/me` — header: `Authorization: Bearer <token>` → restituisce cliente
- `GET /api/customer/rewards?email=` → premi riscattati
- `GET /api/customer/giftcards?email=` → gift card

### Già esistenti
- `GET /api/app/customer-shops?email=` → negozi con punti
- `GET /api/app/shops` → tutti i negozi
- `GET /api/app/my-code?email=` → codice QR cliente

## Deploy su Vercel

```bash
vercel --prod
```

## Struttura cartelle

```
src/
  app/
    page.tsx          # Home - punti e negozi
    login/page.tsx    # Login OTP
    scopri/page.tsx   # Mappa negozi
    premi/page.tsx    # Premi e gift card
    offerte/page.tsx  # Offerte in corso
    scan/page.tsx     # QR scanner + mostra QR
    profilo/page.tsx  # Profilo utente
    globals.css
    layout.tsx
  components/
    AuthInit.tsx
    BottomNav.tsx
    MapComponent.tsx
    ProtectedLayout.tsx
  lib/
    api.ts
    categories.ts
    queryProvider.tsx
  store/
    authStore.ts
  types/
    index.ts
```

## Note importanti

### Scanner QR
Lo scanner usa `jsQR` + Web API (getUserMedia) — nessuna libreria nativa.
Funziona su iOS Safari ≥ 14.3 e tutti i browser moderni.

### Mappa
Leaflet con tile CartoDB Dark. Se i negozi non hanno lat/lng nel DB,
la mappa non mostrerà marker. Aggiungi lat/lng allo schema Prisma se necessario.

### OTP Backend
Devi aggiungere gli endpoint OTP al backend Fidelio.
Usa Resend (già configurato) per inviare l'email con il codice.
Usa Redis o un campo DB per memorizzare il codice temporaneo.

### PWA Icons
Genera le icone in `/public/icons/` nelle dimensioni indicate nel manifest.json.
Puoi usare https://realfavicongenerator.net/
