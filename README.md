# MedicalScan-AI (MedAI-CV)

Portal AI Klinis & Sistem Manajemen Pemindaian Medis cerdas untuk alur kerja radiologi dan diagnostik rumah sakit modern.

## 🩺 Gambaran Proyek

**MedicalScan-AI** dirancang untuk mempercepat dan mempermudah alur kerja diagnosis klinis berbasis kecerdasan buatan (AI) pada berbagai modalitas pemindaian medis (Chest X-Ray, Brain MRI, CT Scan Abdomen, dan USG).

Sistem ini menyediakan antarmuka khusus untuk berbagai peran klinis dan operasional:
- **Dokter Spesialis / Radiologist** (`doctor.html`): Tinjauan mendalam hasil pemindaian, anotasi AI, perbandingan citra, dan validasi diagnosa akhir.
- **Operator PACS / Radiografer** (`operator.html`): Unggah data pemindaian, quality control (QC), pemantauan antrean pemrosesan AI, dan status PACS.
- **Administrator Rumah Sakit & IT** (`admin.html`): Manajemen peran, integrasi sistem, audit log aktivitas klinis, dan pemantauan performa AI.
- **Dashboard Ringkasan** (`dashboard.html` & `index.html`): Portal terpadu dengan analitik real-time dan metrik diagnostik.

---

## 🚀 Fitur Utama

- **Multi-Role Portal**: Akses berbasis peran (Doctor, Operator, Administrator) dengan navigasi intuitif.
- **AI-Powered Diagnostics**: Integrasi estimasi keyakinan (confidence score), heatmaps/anotasi temuan otomatis, dan triage kasus kritis.
- **Lightweight Backend**: Server bawaan Node.js tanpa dependensi eksternal berat (menggunakan modul bawaan `node:sqlite`).
- **Modern Responsive UI**: Dibangun dengan Bootstrap 5, Bootstrap Icons, serta font modern (Sora & Changa One).
- **Auto Database Seeding**: Otomatis membuat dan mengisi skema database awal (`medai.db`) saat server pertama kali dijalankan.

---

## 🛠️ Persyaratan Sistem

- **Node.js** v22.x+ (mendukung modul bawaan `node:sqlite`)
- Browser modern (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)

---

## 💻 Cara Menjalankan

### 1. Kloning Repositori
```bash
git clone https://github.com/RahmanDevs/MedicalScan-AI.git
cd MedicalScan-AI
```

### 2. Jalankan Server
```bash
node server.js
```
Server akan berjalan di: `http://localhost:3000`

Jika database belum ada, skrip akan otomatis menginisialisasi SQLite database dari `database/schema.sql`.

### 3. Akses Halaman
- **Portal Login / Hub**: `http://localhost:3000/index.html`
- **Dashboard Utama**: `http://localhost:3000/dashboard.html`
- **Ruang Dokter**: `http://localhost:3000/doctor.html`
- **Konsol Operator**: `http://localhost:3000/operator.html`
- **Konsol Admin**: `http://localhost:3000/admin.html`

---

## 📂 Struktur Direktori

```text
├── admin.html          # Halaman portal Administrator
├── assets/
│   ├── css/            # Stylesheet modular (style.css, dashboard.css)
│   ├── img/            # Aset visual & logo brand
│   └── js/             # Logika interaktif frontend (main.js, dashboard.js)
├── dashboard.html      # Tampilan dashboard terpadu
├── database/
│   ├── init_db.js      # Script inisialisasi & seeding database SQLite
│   ├── medai.db        # File database SQLite3
│   └── schema.sql      # Skema tabel & data awal
├── doctor.html         # Halaman tinjauan klinis dokter
├── index.html          # Halaman gerbang / autentikasi & info produk
├── operator.html       # Halaman konsol radiografer / operator
├── server.js           # Server HTTP & REST API (Node.js & SQLite3)
└── README.md           # Dokumentasi proyek
```

---

## 📄 Lisensi

Proyek ini dikembangkan untuk tujuan PoC (Proof of Concept) dan demonstrasi sistem AI Medis.
