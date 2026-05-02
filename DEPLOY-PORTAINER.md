# Panduan Deploy Production (Portainer)

Sistem Informasi Project PT. Energi Unggul Persada menggunakan arsitektur containerized modern dengan Docker Compose. Panduan ini menjelaskan cara melakukan deploy aplikasi ke server produksi Ubuntu menggunakan antarmuka web Portainer.

## Prasyarat
1. Server Ubuntu dengan Docker dan Portainer terinstall.
2. Akses login ke dashboard Portainer.
3. Database PostgreSQL credentials (jika tidak menggunakan database container bawaan).
4. Telah melakukan build image Next.js (bisa build di server atau push ke registry).

---

## Langkah 1: Persiapan Environment Variables
1. Buka file `.env.production.example` di repository proyek.
2. Salin isi file tersebut.
3. Siapkan nilai-nilai berikut di text editor lokal Anda (Notepad/VSCode):
   - `DATABASE_URL`: Ganti password dengan password kuat. Format: `postgresql://eupadmin:PASSWORD_ANDA@db:5432/eup_pis`
   - `NEXTAUTH_URL`: Ganti `SERVER_IP` dengan alamat IP atau domain server Anda (contoh: `http://192.168.1.100:8020`).
   - `NEXTAUTH_SECRET`: Generate string rahasia 64 karakter. (Di Linux/Mac, gunakan command: `openssl rand -base64 64`).
   - `POSTGRES_PASSWORD`: Sama dengan password di `DATABASE_URL`.
   - `SEED_ADMIN_PASSWORD`: Password untuk login admin pertama kali.

---

## Langkah 2: Build Image App (Di Server)
Jika image belum ada di registry, Anda harus mem-build-nya secara lokal di server.
Masuk ke terminal server Anda (via SSH) dan arahkan ke folder proyek, lalu jalankan:

```bash
docker build -t eup-pis:latest .
```

---

## Langkah 3: Deploy via Portainer Stacks
1. Login ke dashboard Portainer server Anda.
2. Pilih environment/endpoint (biasanya `local`).
3. Di menu sidebar sebelah kiri, klik **Stacks**.
4. Klik tombol **+ Add stack** di pojok kanan atas.
5. Beri nama stack, contoh: `eup-pis`.
6. Pilih build method: **Web editor**.
7. Buka file `docker-compose.yml` di repository proyek, salin isinya, lalu paste ke Web editor Portainer.

---

## Langkah 4: Memasukkan Environment Variables di Portainer
Di bawah Web editor Portainer terdapat bagian **Environment variables**.
1. Klik tombol **Advanced mode**.
2. Paste seluruh isi teks environment variables yang sudah Anda siapkan di *Langkah 1* ke dalam text area yang muncul.
3. Pastikan format penulisan sudah benar (e.g. `KUNCI=NILAI`).

---

## Langkah 5: Eksekusi Deploy
1. Scroll ke paling bawah halaman Stacks.
2. Klik tombol **Deploy the stack**.
3. Portainer akan mengunduh image (nginx, postgres) dan menjalankan container Anda berdasarkan `docker-compose.yml`. Proses ini mungkin memakan waktu 1-3 menit.

---

## Langkah 6: Verifikasi Status Aplikasi
1. Setelah stack berhasil dibuat, Anda akan diarahkan ke halaman detail stack `eup-pis`.
2. Pastikan ketiga service (`app`, `db`, `nginx`) memiliki status **running**.
3. Klik ikon dokumen (Logs) di samping service `app`.
4. Pastikan Anda melihat baris seperti berikut yang menandakan database telah di-migrasi dan server telah berjalan:
   ```
   Applying migration...
   Database migrated successfully
   Listening on port 3000
   ```
5. Buka browser dan akses alamat IP server dengan port `8020` (contoh: `http://192.168.1.100:8020`). Halaman depan GA Project Information System akan muncul!

---

## Troubleshooting
- **Aplikasi mendapatkan error "502 Bad Gateway":** Hal ini biasa terjadi di detik-detik awal karena Nginx (port 8020) nyala lebih dulu sebelum Next.js (`app`) selesai diinisialisasi. Tunggu 1 menit lalu refresh browser.
- **Gagal Upload File Besar:** Nginx sudah dikonfigurasi untuk menerima upload maksimal 50MB. Jika masih bermasalah, periksa ketersediaan kapasitas disk di server.
- **Lupa Password Admin:** Anda bisa me-reset password langsung di database PostgreSQL atau mengubah nilai `SEED_ADMIN_PASSWORD` dan me-restart stack jika database di-wipe.
