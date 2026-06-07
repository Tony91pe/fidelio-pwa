// Screenshot script — genera screenshot mobile della PWA con dati mock
const { chromium } = require('playwright')
const path = require('path')
const fs   = require('fs')

const BASE = 'http://localhost:3000'
const OUT  = path.join(__dirname, '..', 'screenshots')

const MOCK_CUSTOMER = {
  id: 'cust_mock1', name: 'Marco Rossi', email: 'marco.rossi@example.com',
  code: 'MR4X7K', points: 856, totalVisits: 45,
  lastVisitAt: new Date().toISOString(), birthday: '1990-05-15',
}

const MOCK_SHOPS = [
  { shopId: 'shop1', shopName: 'Caffe Milano',       category: 'bar',        points: 247, nextRewardPoints: 300, rewardDescription: 'Caffe gratis',  totalVisits: 12 },
  { shopId: 'shop2', shopName: 'Pizzeria Napoli',    category: 'restaurant', points: 520, nextRewardPoints: 500, rewardDescription: 'Pizza gratis',  totalVisits: 28 },
  { shopId: 'shop3', shopName: 'Parrucchiere Style', category: 'hair',       points: 89,  nextRewardPoints: 200, rewardDescription: 'Taglio gratis', totalVisits: 5  },
]
const MOCK_REWARDS    = [
  { id: 'r1', shopId: 'shop1', shopName: 'Caffe Milano',    description: 'Caffe espresso gratis', pointsRequired: 200, createdAt: '2024-03-15T10:30:00Z' },
  { id: 'r2', shopId: 'shop2', shopName: 'Pizzeria Napoli', description: 'Dessert gratuito',      pointsRequired: 300, createdAt: '2024-02-20T14:00:00Z' },
]
const MOCK_GIFT_CARDS = [
  { id: 'gc1', code: 'GC-XKTZ-2024', points: 0, value: 25.00, remainingValue: 18.50, description: 'Buono regalo', shopId: 'shop2', shopName: 'Pizzeria Napoli' },
]
const now = Date.now()
const MOCK_VISITS = [
  { id: 'v1', shopName: 'Caffe Milano',       shopCategory: 'bar',        points: 5,  note: null, amount: null,  createdAt: new Date(now - 1*3600000).toISOString() },
  { id: 'v2', shopName: 'Pizzeria Napoli',    shopCategory: 'restaurant', points: 12, note: null, amount: 24.50, createdAt: new Date(now - 26*3600000).toISOString() },
  { id: 'v3', shopName: 'Parrucchiere Style', shopCategory: 'hair',       points: 8,  note: null, amount: null,  createdAt: new Date(now - 3*24*3600000).toISOString() },
  { id: 'v4', shopName: 'Caffe Milano',       shopCategory: 'bar',        points: 5,  note: null, amount: null,  createdAt: new Date(now - 5*24*3600000).toISOString() },
  { id: 'v5', shopName: 'Pizzeria Napoli',    shopCategory: 'restaurant', points: 15, note: null, amount: 31.00, createdAt: new Date(now - 8*24*3600000).toISOString() },
]

async function mockRoutes(page) {
  await page.route('**/api/app/customer-shops**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: MOCK_SHOPS }) }))
  await page.route('**/api/app/my-code**',        r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: { code: MOCK_CUSTOMER.code } }) }))
  await page.route('**/api/customer/rewards**',   r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: MOCK_REWARDS }) }))
  await page.route('**/api/customer/giftcards**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: MOCK_GIFT_CARDS }) }))
  await page.route('**/api/customer/visits**',    r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ visits: MOCK_VISITS }) }))
  await page.route('**/api/**',                   r => r.fulfill({ contentType: 'application/json', body: '{}' }))
}

async function injectAuth(page) {
  await page.addInitScript((c) => {
    localStorage.setItem('fidelio_token', 'mock_token_12345')
    localStorage.setItem('fidelio_customer', JSON.stringify(c))
  }, MOCK_CUSTOMER)
}

async function shot(page, name) {
  await page.waitForTimeout(2500)
  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false })
  console.log('  OK ' + name + '.png')
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  console.log('Avvio browser...\n')

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    colorScheme: 'dark',
  })

  const page = await ctx.newPage()

  // Log errori console
  page.on('console', m => { if (m.type() === 'error') console.log('[browser error]', m.text().slice(0, 120)) })
  page.on('pageerror', e => console.log('[page error]', e.message.slice(0, 200)))

  await mockRoutes(page)
  await injectAuth(page)

  console.log('-> Home...')
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(4000)
  await shot(page, '01-home')

  console.log('-> Premi...')
  await page.goto(`${BASE}/premi`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(3000)
  await shot(page, '02-premi')

  try {
    await page.click('button:has-text("Gift Card")', { timeout: 2000 })
    await page.waitForTimeout(1000)
    await shot(page, '03-giftcard')
  } catch (_) {}

  console.log('-> Storico...')
  await page.goto(`${BASE}/storico`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(3000)
  await shot(page, '04-storico')

  console.log('-> Profilo...')
  await page.goto(`${BASE}/profilo`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(3000)
  await shot(page, '05-profilo')

  await browser.close()
  console.log('\nFatto. Screenshot in: ' + OUT)
}

main().catch(e => { console.error('Errore:', e.message); process.exit(1) })
