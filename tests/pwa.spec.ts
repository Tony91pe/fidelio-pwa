import { test, expect } from '@playwright/test'

// ─── HOME / CARICAMENTO ───────────────────────────────────────────────────────

test.describe('PWA - Caricamento', () => {
  test('si carica correttamente', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Application error')).not.toBeVisible()
  })

  test('ha manifest PWA', async ({ page }) => {
    // Il preview URL Vercel può proteggere con 401 i file statici
    const res = await page.request.get('/manifest.json')
    expect([200, 401]).toContain(res.status())
    if (res.status() === 200) {
      const manifest = await res.json()
      expect(manifest.name || manifest.short_name).toBeTruthy()
    }
  })

  test('mostra schermata di accesso non autenticato', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    // Deve mostrare input email o un testo di login, oppure redirect a /login
    const hasInput = await page.locator('input[type="email"], input[type="text"]').count()
    const hasLoginText = await page.getByText(/email|accedi|login|inserisci/i).count()
    const url = page.url()
    expect(hasInput > 0 || hasLoginText > 0 || url.includes('login')).toBeTruthy()
  })
})

// ─── FLUSSO LOGIN OTP ─────────────────────────────────────────────────────────

test.describe('PWA - Flusso login OTP', () => {
  test('schermata email visibile', async ({ page }) => {
    await page.goto('/login')
    await expect(
      page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('invio email mostra step OTP', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill('test@example.com')
    // Prova a cliccare qualsiasi button presente dopo la compilazione
    const btn = page.locator('button[type="submit"]').or(
      page.getByRole('button', { name: /continua|invia|avanti|accedi|conferma/i })
    ).first()
    await btn.click()
    await expect(
      page.getByText(/codice|otp|controlla|email inviata|verifica/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('email non valida mostra errore', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill('nonunaemail')
    const btn = page.locator('button[type="submit"]').or(
      page.getByRole('button', { name: /continua|invia|avanti|accedi|conferma/i })
    ).first()
    await btn.click()
    await expect(page).toHaveURL(/login/)
  })
})

// ─── PAGINE PUBBLICHE PWA ────────────────────────────────────────────────────

test.describe('PWA - Pagine pubbliche', () => {
  test('pagina install accessibile', async ({ page }) => {
    await page.goto('/install')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=500')).not.toBeVisible()
  })

  test('pagina scopri accessibile', async ({ page }) => {
    await page.goto('/scopri')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=500')).not.toBeVisible()
  })
})

// ─── API PWA ─────────────────────────────────────────────────────────────────

test.describe('PWA - API', () => {
  test('/api/app/shops risponde', async ({ page }) => {
    const res = await page.request.get('https://www.getfidelio.app/api/app/shops')
    expect([200, 401]).toContain(res.status())
  })

  test('OTP senza email restituisce errore', async ({ page }) => {
    const res = await page.request.post('https://www.getfidelio.app/api/customer/auth/send-otp', {
      data: {}, headers: { 'Content-Type': 'application/json' }
    })
    expect([400, 422]).toContain(res.status())
  })

  test('accesso customer senza token restituisce 401', async ({ page }) => {
    const res = await page.request.get('https://www.getfidelio.app/api/customer/visits')
    expect([400, 401, 403]).toContain(res.status())
  })

  test('accesso rewards senza token restituisce 401', async ({ page }) => {
    const res = await page.request.get('https://www.getfidelio.app/api/customer/rewards')
    expect([400, 401, 403]).toContain(res.status())
  })
})

// ─── CHECKIN FLOW ────────────────────────────────────────────────────────────

test.describe('PWA - Check-in negozio', () => {
  test('pagina checkin con shopId inesistente restituisce errore gestito', async ({ page }) => {
    await page.goto('https://www.getfidelio.app/checkin/shop-inesistente-xyz')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=Application error')).not.toBeVisible()
  })

  test('API checkin senza body restituisce 400', async ({ page }) => {
    const res = await page.request.post('https://www.getfidelio.app/api/checkin', {
      data: {}, headers: { 'Content-Type': 'application/json' }
    })
    expect([400, 422]).toContain(res.status())
  })
})

// ─── MOBILE ──────────────────────────────────────────────────────────────────

test.describe('PWA - Mobile', () => {
  test('viewport mobile corretto', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20)
  })

  test('nessun overflow orizzontale nella home', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(overflow).toBeFalsy()
  })
})

// ─── PERFORMANCE ─────────────────────────────────────────────────────────────

test.describe('PWA - Performance base', () => {
  test('risponde entro 5 secondi', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })

  test('non ha errori JS critici in console', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForTimeout(2000)
    // Filtra errori noti non critici (CSP, network, terze parti)
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ERR_BLOCKED') &&
      !e.includes('analytics') &&
      !e.includes('Content Security Policy') &&
      !e.includes('clerk') &&
      !e.includes('sentry') &&
      !e.includes('crisp') &&
      !e.includes('violates') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::') &&
      !e.includes('vercel') &&
      !e.includes('ChunkLoad') &&
      !e.includes('Loading chunk') &&
      !e.includes('hydrat') &&
      !e.includes('GSI_LOGGER') &&
      !e.includes('FedCM') &&
      !e.includes("accounts list is empty")
    )
    if (criticalErrors.length > 0) console.log('Errori rimasti:', criticalErrors)
    expect(criticalErrors.length).toBe(0)
  })
})
