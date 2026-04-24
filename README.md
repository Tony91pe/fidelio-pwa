<p align="center">
  <img src="public/icons/icon-192x192.svg" width="120" alt="Fidelio Logo" />
</p>

<h1 align="center">Fidelio — Loyalty Platform for Local Shops (PWA)</h1>

<p align="center">
  Modern PWA for collecting points, redeeming rewards, and exploring nearby shops.
</p>

---

## 🚀 Overview

**Fidelio** is a modern loyalty platform designed for local shops.  
Customers can collect points, redeem rewards, and explore nearby stores — all through a fast, installable **PWA** built with **Next.js 14**.

The platform includes:

- Customer PWA  
- QR-based reward system  
- Wallet with personal QR  
- Map with nearby shops  
- Rewards & gift cards  
- Email OTP authentication  

---

## ✨ Features

- **Email OTP login** (no password required)  
- **QR code scanner** for point collection  
- **Customer wallet** with personal QR  
- **Rewards & gift cards**  
- **Interactive map** with Leaflet  
- **Offline-ready PWA**  
- **Fast UI** with Tailwind CSS  
- **State management** with Zustand  
- **Data fetching** with React Query  

---

## 🧱 Tech Stack

- **Next.js 14 (App Router)**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Zustand**
- **React Query**
- **next-pwa**
- **Leaflet**
- **jsQR**

---

## 🌐 Live App

👉 **https://app.fidelio.app**

---

## 📦 Installation

```bash
npm install
npm run dev
```

---

## 🗂 Project Structure

```
src/
  app/
    page.tsx              # Home — points & loyalty cards
    login/                # Email OTP login
    scan/                 # QR scanner + personal QR
    premi/                # Rewards & gift cards
    offerte/              # Active offers
    scopri/               # Map — nearby shops
    profilo/              # User profile
    storico/              # History
    onboarding/           # First-time setup
    negozio/              # Shop portal (scanner, offers, rewards, upgrade)
  components/
  hooks/
  lib/
  store/
  types/
public/
  icons/
  manifest.json
worker/
```

---

## 🔐 Authentication

Fidelio uses email-based OTP authentication for a frictionless login experience.

---

## 📱 PWA Support

- Installable on iOS, Android, Desktop
- Offline caching
- Manifest + service worker
- Optimized Lighthouse score

---

## 📸 QR Scanner

The app includes a built-in QR scanner using:

- jsQR for decoding
- Camera stream via browser APIs
- Real-time validation

---

## 🗺 Map Integration

Built with Leaflet, showing:

- Nearby shops
- Shop details
- Reward availability

---

## 📄 License

Private project — all rights reserved.

---

## 👤 Author

Antonio  
Founder of Fidelio
