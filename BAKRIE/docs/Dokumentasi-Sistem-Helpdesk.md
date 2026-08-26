# 📘 Dokumentasi Sistem Helpdesk BPI (Enterprise Architecture)

## 1. Arsitektur Umum & Alur Data (Data Flow)
Sistem Bakrie Helpdesk telah bertransformasi dari sistem Mockup murni (*LocalStorage*) menjadi arsitektur **Client-Server Enterprise** yang menghubungkan Frontend (Angular) dan Backend (Node.js + SQL Server).

*   **Frontend (Browser):** Menangani User Interface (UI), Interaksi Pengguna, dan State Management. Menggunakan **Optimistic UI Pattern** untuk respon instan.
*   **Backend (Node.js):** Menangani logika bisnis yang saklek (Otentikasi, Privasi, Routing), melakukan kalkulasi SLA, dan bertindak sebagai penjaga gerbang (*Gatekeeper*) database.
*   **Database (SQL Server):** Menyimpan *Single Source of Truth* untuk riwayat tiket, survei kepuasan, dan manajemen staf.

---

## 2. Optimistic UI Adapter (Sistem Sinkronisasi)
Mengingat aplikasi Helpdesk membutuhkan kecepatan manipulasi tabel seperti aplikasi Desktop, integrasi HTTP tidak dilakukan secara *blocking* (menunggu server selesai loading baru me-refresh layar), melainkan menggunakan **Adapter Optimistic UI** di `helpdesk.service.ts`:

1.  **Aksi Pengguna:** Saat pengguna memencet tombol *Create Ticket*, sistem mendeteksi aksi tersebut.
2.  **Manipulasi Lokal Cepat:** Aplikasi secara sepihak mem-`push()` elemen data palsu `[TKT-SYNCING...]` ke array memori tabel dan langsung merender ulang UI (*Zero-Delay*).
3.  **Kirim Background:** Di balik layar (`.subscribe()`), file JSON rahasia terbang ke Backend `/api/tickets`.
4.  **Re-Sync:** Begitu Backend menjawab dengan Status 201 (Sukses) dan mengembalikan UUID sejati, Frontend menimpa array lokal dengan Data Aktual dari Server sehingga ID tiket berubah menjadi permanen tanpa kedipan *Loading Screen*.

---

## 3. Logika Ketat (Strict Firewall) & Survei Kepuasan
Berbeda dengan fase *Mockup*, logika privasi kini bersandar 100% pada **JWT (JSON Web Token)** dan Validasi Silang antar Departemen:

*   **Kebocoran Lintas Departemen (Linjur) Dicegah!** 
    UI tidak lagi bergantung pada *hardcode ID* (`if NIP === 1001`). Backend Node.js melakukan *Eager Loading* `Department` model saat *Login*, menanamkan nama sejati (*string*) departemen ke Sesi Sinyal JWT. Tabel pendelegasian staf (*Assign*) akan dengan otomatis mendeteksi departemen pengguna dan hanya menampilkan anak buah yang satu nasab departemen (e.g., *IT Infra Admin* hanya bisa mendelegasi ke staf *IT Infra*).
*   **Keamanan Survei (Ghost Mode):** 
    Survei hanya akan muncul (**Approve & Close**) kepada NIP Pembuat Tiket *(Requester)* yang bersangkutan ketika Teknisi mengubah statusnya menjadi `PENDING_APPROVAL`. Pengguna pihak ketiga yang mengakses *URL Endpoint Survey* tidak akan bisa memberikan *rating* sabotase untuk tiket karena difilter oleh kaitan UUID JWT miliknya sendiri. 
*   **Efek Survei:** Mensubmit *rating* akan menyimpan nilai bintang secara relasional di SQL (`Surveys` table) dan meninggalkan bekas ketukan palu (Audit) di `TicketHistories`.

---

## 4. Rangkuman API Interface
Backend API telah dipersenjatai penuh untuk menerima lalu lintas Helpdesk fasa produksi.

| Endpoint | Method | Keterangan Fungsi |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Autentikasi Pengguna & Penanaman Departemen ke JWT Sesi |
| `/api/tickets` | `GET` | Tarik Semua Tiket Real-Time (Filtered by Company ID) |
| `/api/tickets` | `POST` | Menciptakan Tiket dan menyuntikkan Status OPEN beserta riwayat pertamanya |
| `/api/tickets/:id/status`| `PUT` | Update status (ASSIGNED, IN_PROGRESS, HOLD). Terbuka bagi Teknisi & Admin |
| `/api/tickets/:id/survey`| `POST` | Khusus *User/Requester*. Menggembok status tiket menjadi `CLOSED` permanen sembari mentransfer nilai skor Bintang Kepuasan. |

---
**Status Modul Terkini:** Modul Tiket, Otorisasi, Logika Departemen, dan Survei *SUDAH TERINTEGRASI PENUH* secara Backend-Frontend. (Modul yang masih dalam fase Placeholder: Laporan Statistik, Charting, dan Rekapitulasi Rata-Rata Waktu).
