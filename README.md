# Ekosistem Proyek BPI (Bakrie)

Dokumentasi pusat untuk aplikasi BPI. Repositori ini memuat dua solusi utama yang terintegrasi, yaitu platform operasional berbasis Web/Desktop dan aplikasi Mobile berbasis Android.

## Fitur Utama (Berdasarkan Modul)
- **BAKRIE (Aplikasi Utama / Desktop-Web)**: Antarmuka terpusat untuk mengelola seluruh operasional BPI. Menyediakan fungsionalitas pengolahan data, pelaporan (charting), dan manajemen pengguna.
- **BAKRIE-ANDROID (Aplikasi Mobile)**: Ekstensi fungsionalitas sistem utama yang dioptimalkan untuk perangkat seluler. Memungkinkan pengguna untuk mengakses dan mengelola operasional secara _real-time_ dari _smartphone_ Android.

## Teknologi (Tech Stack)
- **Frontend**: Angular, Capacitor (untuk _mobile wrapping_ di Android)
- **Backend**: Node.js (Express)
- **Database**: SQL Server / RDBMS
- **Tools Tambahan**: Chart.js, ng2-charts (Visualisasi data), Postman (API Testing)

## Struktur Folder
```text
BPI/
├── BAKRIE/              # Proyek utama Angular (Desktop / Web App)
│   ├── backend/         # API & Logika bisnis spesifik aplikasi BAKRIE
│   └── src/             # Komponen UI Angular
├── BAKRIE-ANDROID/      # Proyek Angular + Capacitor (Mobile Android)
│   ├── android/         # Build source untuk Android native
│   ├── backend/         # API terdedikasi untuk mobile
│   └── src/             # Komponen UI Mobile
└── README.md            # Dokumentasi utama (File ini)
```

## Memulai (Getting Started)

### Prasyarat
Sebelum memulai, pastikan Anda telah menginstal beberapa perangkat lunak berikut di mesin Anda:
- **Node.js** (Disarankan versi 18 LTS atau 20 LTS)
- **Angular CLI** (Untuk menjalankan perintah-perintah Angular secara lokal)
- **Android Studio** (Hanya diperlukan jika ingin melakukan *build* atau emulator pada proyek `BAKRIE-ANDROID`)

### Langkah Instalasi
1. Buka terminal Anda dan kloning/buka repositori workspace BPI ke mesin lokal.
2. Masuk ke direktori proyek yang ingin Anda jalankan (misalnya `BAKRIE`):
   ```bash
   cd BAKRIE
   ```
3. Instal semua _dependencies_ yang dibutuhkan:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Catatan: Gunakan `--legacy-peer-deps` jika terdapat konflik versi pustaka seperti Angular CDK dan ng2-charts).*

### Menjalankan Aplikasi
Untuk menjalankan aplikasi (misalnya web/desktop) ke dalam *development server*:
```bash
npm start
```
Atau menggunakan perintah Angular native:
```bash
ng serve
```
Aplikasi akan secara otomatis dimuat (umumnya di `http://localhost:4200/`). Setiap perubahan pada kode sumber akan otomatis me-_reload_ aplikasi di browser.
