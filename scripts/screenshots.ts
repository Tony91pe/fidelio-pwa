/**
 * Screenshot script — genera screenshot mobile della PWA con dati mock
 * Uso: npx ts-node --esm scripts/screenshots.ts
 *   oppure: npx playwright test scripts/screenshots.spec.ts
 *
 * Richiede il dev server attivo su localhost:3000
 */
import { chromium, Page } from 'playwright'
import path from 'path'
import fs from 'fs'

const BASE = 'http://localhost:3000'
const OUT  = path.join(process.cwd(), 'screenshots')

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CUSTOMER = {
  id: 'cust_mock1',
  name: 'Marco Rossi',
  email: 'marco.rossi@example.com',
  code: 'MR4X7K',
  points: 856,
  totalVisits: 45,
  lastVisitAt: new Date().toISOString(),
  birthday: '1990-05-15',
}

const MOCK_SHOPS = [
  {
    shopId: 'shop1',
    shopName: 'Caffè Milano',
    category: 'bar',
    points: 247,
    nextRewardPoints: 300,
    rewardDescription: 'Caffè gratis',
    totalVisits: 12,
  },
  {
    shopId: 'shop2',
    shopName: 'Pizzeria Napoli',
    category: 'restaurant',
    points: 520,
    nextRewardPoints: 500,
    rewardDescription: 'Pizza gratis',
    totalVisits: 28,
  },
  {
    shopId: 'shop3',
    shopName: 'Parrucchiere Style',
    category: 'hair',
    points: 89,
    nextRewardPoints: 200,
    rewardDescription: 'Taglio gratis',
    totalVisits: 5,
  },
]

const MOCK_REWARDS = [
  { id: 'r1', shopId: 'shop1', shopName: 'Caffè Milano',      description: 'Caffè espresso gratis',   pointsRequired: 200, createdAt: '2024-03-15T10:30:00Z' },
  { id: 'r2', shopId: 'shop2', shopName: 'Pizzeria Napoli',   description: 'Dessert gratuito',        pointsRequired: 300, createdAt: '2024-02-20T14:00:00Z' },
  { id: 'r3', shopId: 'shop1', shopName: 'Caffè Milano',      description: 'Cornetto + cappuccino',   pointsRequired: 200, createdAt: '2024-01-10T08:00:00Z' },
]

const MOCK_GIFT_CARDS = [
  {
    id: 'gc1', code: 'GC-XKTZ-2024', points: 0,
    value: 25.00, remainingValue: 18.50,
    description: 'Buono regalo per compleanno',
    shopId: 'shop2', shopName: 'Pizzeria Napoli',
  },
]

const now = new Date()
const MOCK_VISITS = [
  { id: 'v1', shopName: 'Caffè Milano',      shopCategory: 'bar',        points: 5,  note: null, amount: null, createdAt: new Date(now.getTime() - 1*3600000).toISOString() },
  { id: 'v2', shopName: 'Pizzeria Napoli',   shopCategory: 'restaurant', points: 12, note: null, amount: 24.50, createdAt: new Date(now.getTime() - 26*3600000).toISOString() },
  { id: 'v3', shopName: 'Parrucchiere Style',shopCategory: 'hair',       points: 8,  note: null, amount: null, createdAt: new Date(now.getTime() - 3*24*3600000).toISOString() },
  { id: 'v4', shopName: 'Caffè Milano',      shopCategory: 'bar',        points: 5,  note: null, amount: null, createdAt: new Date(now.getTime() - 5*24*3600000).toISOString() },
  { id: 'v5', shopName: 'Pizzeria Napoli',   shopCategory: 'restaurant', points: 15, note: null, amount: 31.00, createdAt: new Date(now.getTime() - 8*24*3600000).toISOString() },
]

const MOCK_ALL_SHOPS = [
  { id: 'shop1', name: 'Caffè Milano',       category: 'bar',        address: 'Via Brera 12',        city: 'Milano',  lat: 45.472, lng: 9.186,  rewardThreshold: 300, rewardDescription: 'Caffè gratis',  pointsSystem: 'per_visit', pointsPerVisit: 5, pointsPerEuro: 0, welcomePoints: 10 },
  { id: 'shop2', name: 'Pizzeria Napoli',    category: 'restaurant', address: 'Corso Garibaldi 45',  city: 'Milano',  lat: 45.480, lng: 9.183,  rewardThreshold: 500, rewardDescription: 'Pizza gratis',  pointsSystem: 'per_euro',  pointsPerVisit: 0, pointsPerEuro: 2, welcomePoints: 20 },
  { id: 'shop3', name: 'Parrucchiere Style', category: 'hair',       address: 'Via Montenapoleone 7',city: 'Milano',  lat: 45.467, lng: 9.195,  rewardThreshold: 200, rewardDescription: 'Taglio gratis', pointsSystem: 'per_visit', pointsPerVisit: 8, pointsPerEuro: 0, welcomePoints: 15 },
  { id: 'shop4', name: 'Pasticceria Luca',   category: 'bakery',     address: 'Piazza Duomo 1',      city: 'Milano',  lat: 45.464, lng: 9.190,  rewardThreshold: 250, rewardDescription: 'Dolce gratis',  pointsSystem: 'per_visit', pointsPerVisit: 6, pointsPerEuro: 0, welcomePoints: 10 },
  { id: 'shop5', name: 'FitLife Gym',        category: 'gym',        address: 'Via Sempione 88',     city: 'Milano',  lat: 45.475, lng: 9.177,  rewardThreshold: 400, rewardDescription: 'Lezione gratis',pointsSystem: 'per_visit', pointsPerVisit: 10, pointsPerEuro: 0, welcomePoints: 25 },
]

// ── API mock routes ──────────────────────────────────────────────────────────

async function mockRoutes(page: Page) {
  const API = 'https://fidelio-web-git-main-tony91pes-projects.vercel.app'

  await page.route(`${API}/api/app/customer-shops**`, r =>
    r.fulfill({ json: { data: MOCK_SHOPS } })
  )
  await page.route(`${API}/api/app/my-code**`, r =>
    r.fulfill({ json: { data: { code: MOCK_CUSTOMER.code } } })
  )
  await page.route(`${API}/api/customer/rewards**`, r =>
    r.fulfill({ json: { data: MOCK_REWARDS } })
  )
  await page.route(`${API}/api/customer/giftcards**`, r =>
    r.fulfill({ json: { data: MOCK_GIFT_CARDS } })
  )
  await page.route(`${API}/api/customer/visits**`, r =>
    r.fulfill({ json: { visits: MOCK_VISITS } })
  )
  await page.route(`${API}/api/app/shops**`, r =>
    r.fulfill({ json: { data: MOCK_ALL_SHOPS } })
  )
  // catch-all
  await page.route(`${API}/**`, r => r.fulfill({ json: {} }))
}

async function injectAuth(page: Page) {
  await page.addInitScript((customer) => {
    localStorage.setItem('fidelio_token', 'mock_token_12345')
    localStorage.setItem('fidelio_customer', JSON.stringify(customer))
  }, MOCK_CUSTOMER)
}

async function shot(page: Page, name: string) {
  // attendiamo che le animazioni finiscano
  await page.waitForTimeout(1200)
  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false })
  console.log(`✓ ${name}.png`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  // iPhone 14 Pro — 393×852 @3x, ma per screenshot usiamo 1x per file leggeri
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    colorScheme: 'dark',
  })

  const page = await ctx.newPage()
  await mockRoutes(page)
  await injectAuth(page)

  // ── Home ──────────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Le mie carte fedeltà', { timeout: 8000 }).catch(() => {})
  await shot(page, '01-home')

  // ── Premi ────────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/premi`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Premi', { timeout: 6000 }).catch(() => {})
  await shot(page, '02-premi')

  // Gift card tab
  const gcTab = page.locator('button:has-text("Gift Card")')
  if (await gcTab.isVisible()) {
    await gcTab.click()
    await page.waitForTimeout(600)
    await shot(page, '03-giftcard')
  }

  // ── Storico ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/storico`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Storico', { timeout: 6000 }).catch(() => {})
  await shot(page, '04-storico')

  // ── Profilo ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/profilo`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Marco', { timeout: 6000 }).catch(() => {})
  await shot(page, '05-profilo')

  // ── Scopri ───────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/scopri`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  await shot(page, '06-scopri')

  await browser.close()
  console.log(`\n✅ Screenshot salvati in: ${OUT}`)
}

main().catch(e => { console.error(e); process.exit(1) })
