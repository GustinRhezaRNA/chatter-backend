# Chatter Backend

Repository ini merupakan sistem *backend* dari aplikasi Chatter (Aplikasi Percakapan Real-time). Sistem ini dirancang dengan arsitektur modern, dapat diskalakan (scalable), dan berbasis GraphQL.

## Teknologi yang Digunakan
Sistem *backend* ini berjalan di atas ekosistem Node.js dengan rincian *framework* dan pustaka (*libraries*) utama sebagai berikut:

- **Kerangka Kerja (Framework): NestJS**
  Digunakan sebagai fondasi utama aplikasi untuk memastikan struktur kode yang rapi, *modular*, dan mendukung prinsip arsitektur *dependency injection* yang *enterprise-grade*.
- **API & Query Language: GraphQL & Apollo Server**
  Sistem menggunakan `GraphQL` alih-alih REST API tradisional. Ini memberikan fleksibilitas ekstrem kepada *frontend* untuk hanya meminta data spesifik yang dibutuhkan.
- **Basis Data: MongoDB & Mongoose**
  Menggunakan basis data *NoSQL MongoDB* melalui *Object Data Modeling (ODM) Mongoose* untuk menyimpan data terstruktur seperti Pengguna (User), Profil, Ruang Obrolan (Chat Room), dan Pesan.
- **Integrasi Cloud Storage: AWS S3**
  Menggunakan `@aws-sdk/client-s3` untuk penyimpanan *cloud*. Ini digunakan untuk mengunggah dan melayani *file* media, misalnya foto profil avatar pengguna atau lampiran pesan.
- **Manajemen State Secara Real-time: Redis**
  Aplikasi ini menggunakan Redis (`ioredis`) melalui `graphql-redis-subscriptions`. Ini berfungsi sebagai *PubSub engine* (Publisher/Subscriber), memastikan bahwa saat diskalakan ke berbagai server (*instance*), notifikasi *real-time* tetap tersinkronisasi.
- **High-Performance Logging: Pino**
  Sebuah *logger* asinkron performa tinggi (`nestjs-pino`, `pino-http`) digunakan menjaga rekam jejak sistem secara terstruktur tanpa memperlambat aplikasi.

## Fitur Utama (*Backend Features*)
1. **Autentikasi & Otorisasi Berbasis JWT (JSON Web Token)**
   - Menggunakan `Passport.js` dan `@nestjs/jwt`.
   - Proses login menghasilkan token yang dikirim dan disimpan sebagai *HttpOnly Cookies*, metode pencegahan *Cross-Site Scripting (XSS)* yang aman.
   - Menggunakan keamanan enkripsi *password* menggunakan `bcrypt`.
2. **Sistem Pesan Instan (Real-time Messaging)**
   - Terhubung secara *live* dua-arah (*bidirectional*).
   - Menerapkan arsitektur WebSockets menggunakan paket murni `graphql-ws`, dan `graphql-subscriptions`.
3. **Penyimpanan Gambar Avatar**
   - User dapat mengunggah dan melampirkan gambar melalui koneksi aman AWS S3 Bucket.
4. **Validasi Skema Kuat**
   - Setiap *request* tervalidasi sangat ketat di level API menggunakan *decorator* dari tipe TypeScript seperti `class-validator`, `class-transformer` dan `joi` untuk validasi variabel *environment*.
5. **Dukungan CORS (Cross-Origin Resource Sharing) Modular**
   - Terintegrasi secara bawaan dengan kontrol CORS khusus yang memperbolehkan komunikasi aman lintas domain (antara Apollo Studio, *local server*, dan *domain production* frontend).
