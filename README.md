# Portal Panduan Karirhub

Portal web responsif untuk membaca handbook dan manual operasional Karirhub.
Konten, tabel, dan gambar dihasilkan dari dokumen DOCX sumber.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Gunakan kata sandi `080899`. Akses tidak disimpan, sehingga halaman akan
meminta kata sandi lagi setelah dimuat ulang atau dibuka kembali.

## Perintah

- `npm run convert:docx` — menghasilkan ulang konten dari lokasi DOCX bawaan.
- `npm run convert:docx -- "C:\lokasi\dokumen.docx"` — menggunakan DOCX lain.
- `npm test` — menjalankan pengujian interaksi.
- `npm run lint` — memeriksa kualitas kode.
- `npm run build` — membuat hasil produksi di `dist`.

> Perlindungan kata sandi berjalan di sisi browser dan berfungsi sebagai
> pembatas akses visual, bukan autentikasi server. URL PDF yang digunakan juga
> tetap dapat diakses langsung.
