# Panduan Lengkap Instalasi & Deployment (Git + Portainer)

Dokumen ini berisi langkah-langkah detail untuk menginstal aplikasi **EUP Project Information System** menggunakan Git dan melakukan deployment menggunakan **Portainer Stacks**.

---

## 📋 Prasyarat
1. Server (Ubuntu/Debian direkomendasikan) yang sudah terinstall:
   - **Docker** & **Docker Compose**
   - **Portainer** (CE atau EE)
2. Akses ke Dashboard Portainer melalui browser.
3. Akun Git (GitHub/GitLab) tempat menyimpan kode aplikasi ini.

---

## 🚀 Langkah 1: Persiapan Repository Git

Agar Portainer bisa menarik kode secara otomatis, kode aplikasi Anda harus berada di cloud (GitHub/GitLab).

1. **Buat Repository Baru**: Buat repository kosong di GitHub atau GitLab (misal: `eup-pis`).
2. **Push Kode ke Git**:
   Buka terminal di komputer lokal Anda (folder project ini), lalu jalankan:
   ```bash
   git init
   git add .
   git commit -m "Initial commit production ready"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/eup-pis.git
   git push -u origin main
   ```
   *(Ganti URL dengan URL repository Anda sendiri)*.

---

## ⚙️ Langkah 2: Menyiapkan Environment Variables

Sebelum masuk ke Portainer, siapkan catatan teks berisi variabel berikut. Anda bisa menyalin format ini dan menyesuaikan isinya:

```env
# Database Configuration
POSTGRES_DB=eup_pis
POSTGRES_USER=eupadmin
POSTGRES_PASSWORD=GANTI_DENGAN_PASSWORD_KUAT

# App Configuration
DATABASE_URL=postgresql://eupadmin:PASSWORD_DI_ATAS@db:5432/eup_pis
NEXTAUTH_URL=http://IP_SERVER_ANDA:8020
NEXTAUTH_SECRET=BUAT_STRING_ACAK_64_KARAKTER
NODE_ENV=production

# Admin Initial Credentials
SEED_ADMIN_PASSWORD=PASSWORD_LOGIN_ADMIN_PERTAMA
```

> **Tips**: Untuk `NEXTAUTH_SECRET`, Anda bisa mengetik `openssl rand -base64 32` di terminal untuk mendapatkan string acak.

---

## 🛠️ Langkah 3: Deployment via Portainer Stacks

Langkah ini dilakukan di dalam dashboard Portainer.

1. **Login ke Portainer** dan pilih environment Anda (biasanya `local`).
2. Klik menu **Stacks** di sidebar kiri.
3. Klik tombol **+ Add stack**.
4. **Isi Data Stack**:
   - **Name**: `eup-pis`
   - **Build method**: Pilih **Repository**.
   - **Repository URL**: Masukkan URL Git Anda (contoh: `https://github.com/USERNAME/eup-pis.git`).
   - **Repository reference**: Masukkan `refs/heads/main` (atau branch utama Anda).
   - **Compose path**: Pastikan tertulis `docker-compose.yml`.
5. **Konfigurasi Environment Variables**:
   - Scroll ke bawah ke bagian **Environment variables**.
   - Klik tombol **Advanced mode**.
   - **Paste** seluruh variabel yang sudah Anda siapkan di **Langkah 2** ke dalam kotak teks tersebut.
6. **Deploy**:
   - Klik tombol **Deploy the stack**.

> **Catatan**: Karena kita menggunakan `build: .` di dalam `docker-compose.yml`, Portainer akan melakukan build image Next.js langsung di server. Proses ini mungkin memakan waktu 3-7 menit tergantung spesifikasi server Anda.

---

## 🔍 Langkah 4: Verifikasi & Akses

1. Tunggu hingga status stack menjadi **Running** (hijau).
2. Klik pada stack `eup-pis` untuk melihat daftar container.
3. Pastikan ada 3 container yang berjalan:
   - `eup-pis-nginx` (Port 8020)
   - `eup-pis-app`
   - `eup-pis-db`
4. **Cek Log**: Klik ikon log (📝) pada container `eup-pis-app`. Jika melihat pesan `Listening on port 3000` dan `Database migrated successfully`, maka aplikasi sudah siap.
5. **Akses Aplikasi**: Buka browser dan ketik:
   `http://ALAMAT_IP_SERVER:8020`

---

## 🔄 Pembaruan Aplikasi (Update)

Jika Anda melakukan perubahan kode di masa depan:
1. Push perubahan ke Git: `git push origin main`.
2. Di Portainer, buka stack `eup-pis`.
3. Klik tab **Editor**.
4. Klik tombol **Update the stack**.
5. Centang opsi **Prune services** dan **Pull latest image** (jika menggunakan registry) atau biarkan Portainer melakukan build ulang.

---

## ⚠️ Troubleshooting

- **502 Bad Gateway**: Ini normal saat aplikasi baru dinyalakan. Tunggu sekitar 1-2 menit hingga proses inisialisasi Next.js selesai.
- **Gagal Build**: Pastikan server Anda memiliki RAM minimal 2GB. Build Next.js membutuhkan memori yang cukup besar.
- **Koneksi Database Error**: Pastikan password di `POSTGRES_PASSWORD` dan `DATABASE_URL` sama persis.
