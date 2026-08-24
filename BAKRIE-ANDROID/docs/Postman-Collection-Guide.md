# BAKRIE Helpdesk API - Postman Collection

Berikut adalah panduan lengkap payload dan URL untuk mengetes API sesuai dengan struktur folder Postman Anda. (Gunakan **Base URL: `http://localhost:3001`**)

---

## 📁 Auth

### `GET` Health Check
Untuk mengecek apakah server Node.js sudah hidup dan merespon dengan baik.
- **URL:** `http://localhost:3001/api/health`
- **Auth:** Tidak perlu
- **Body:** Tidak perlu

### `POST` Auth - Login with Default...
Digunakan untuk login dan menyalin Token (JWT) yang akan digunakan untuk operasi selanjutnya.
- **URL:** `http://localhost:3001/api/auth/login`
- **Auth:** Tidak perlu
- **Body (`raw` -> `JSON`):**
  ```json
  {
      "email": "1000",
      "password": "1234"
  }
  ```

### `GET` Auth - Get Profile
Untuk mengecek identitas pengguna yang tokennya sedang dipakai saat ini.
- **URL:** `http://localhost:3001/api/auth/me`
- **Auth:** Bearer Token *(Wajib diisi dengan token hasil login)*
- **Body:** Tidak perlu

---

## 📁 Tickets

### `GET` Tickets - List All
Menampilkan seluruh data tiket yang ada di sistem berdasarkan hak akses akun Anda.
- **URL:** `http://localhost:3001/api/tickets`
- **Auth:** Bearer Token
- **Body:** Tidak perlu

### `POST` Tickets - Create Ticket
Pembuatan tiket / pelaporan insiden keluhan dari sisi Karyawan.
- **URL:** `http://localhost:3001/api/tickets`
- **Auth:** Bearer Token
- **Body (`raw` -> `JSON`):**
  ```json
  {
      "title": "Lampu Ruang Rapat Mati",
      "description": "Lampu utama ruangan rapat lantai 3 mati dan perlu diganti",
      "category": "Infrastruktur",
      "priority": "P3",
      "department_name": "Maintenance"
  }
  ```

### `GET` Tickets - Get Ticket Detail
Menampilkan rincian, rating, dan riwayat mutasi dari 1 tiket spesifik.
- **URL:** `http://localhost:3001/api/tickets/69d46459-d2c0-4723-a477-45213b8f7876`
- **Auth:** Bearer Token
- **Body:** Tidak perlu

### `PUT` Tickets - Update Status
Teknisi/Admin mengubah status tiket menjadi "IN PROGRESS" atau memberikan assign ke rekannya.
- **URL:** `http://localhost:3001/api/tickets/69d46459-d2c0-4723-a477-45213b8f7876/status`
- **Auth:** Bearer Token
- **Body (`raw` -> `JSON`):**
  ```json
  {
      "status": "IN PROGRESS",
      "notes": "Laporan sudah diterima dan sedang dianalisa",
      "assigned_to": "1009"
  }
  ```

### `POST` Tickets - Upload Evidence
Teknisi mengunggah foto / dokumen bukti bahwa perbaikan telah dilakukan.
- **URL:** `http://localhost:3001/api/tickets/69d46459-d2c0-4723-a477-45213b8f7876/evidence`
- **Auth:** Bearer Token
- **Body (`form-data`):**
  - **Key** `evidenceFile` *(tipe File)*: (Pilih berkas dari komputer)
  - **Key** `description` *(tipe Text)*: `"Foto kabel jaringan setelah diganti"`

### `POST` Tickets - Submit Survey
Karyawan/Pelapor merubah status tiket menjadi CLOSE otomatis dengan memberikan bintang dan feedback penanganan.
- **URL:** `http://localhost:3001/api/tickets/69d46459-d2c0-4723-a477-45213b8f7876/survey`
- **Auth:** Bearer Token
- **Body (`raw` -> `JSON`):**
  ```json
  {
      "rating": 5,
      "feedback": "Penanganan super kilat, terima kasih!"
  }
  ```

### `DEL` Tickets - Delete Ticket
Hanya Admin yang berhak menghapus tiket cacat/salah buat secara permanen dari sistem.
- **URL:** `http://localhost:3001/api/tickets/69d46459-d2c0-4723-a477-45213b8f7876`
- **Auth:** Bearer Token
- **Body:** Tidak perlu
