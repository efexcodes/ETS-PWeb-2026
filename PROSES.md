# Proses

## Persona dan masalahnya

Mendapat uang bulanan tetap dari orang tua dan sering kehabisan sebelum akhir bulan. Jadi aplikasinya harus bisa menunjukkan jatah harian dan memberi peringatan kalau pengeluaran hari ini sudah kelewatan.

## Rancangan struktur data

Data disimpan di localStorage dengan tiga kunci:

| Kunci | Isi |
| --- | --- |
| `transaksi` | array objek transaksi |
| `uangBulanan` | angka uang bulanan |
| `budget` | objek `{ kategori: batas }` |

Satu transaksi:

```js
{ id: 1739251200000, tanggal: "2026-10-12", jenis: "pengeluaran", kategori: "Makan", nominal: 25000, catatan: "Nasi goreng" }
```

- `id` dari `Date.now()` supaya unik.
- `nominal` disimpan sebagai angka, bukan teks Rupiah, supaya bisa dijumlahkan dengan `reduce`.
- `tanggal` berformat `YYYY-MM-DD` supaya bisa dibandingkan langsung sebagai teks (untuk urutan dan filter).

Di memori semua data dikumpulkan dalam satu objek `state` (`transaksi`, `uangBulanan`, `budget`, `idEdit`, `filter`). Fungsi `render(state)` membaca dari argumen itu. Hanya tiga data pertama yang disimpan ke localStorage, `idEdit` dan `filter` tidak.

## Keputusan desain

**Jatah harian dihitung dari sisa uang di awal hari, bukan sisa uang saat ini.**

Kalau memakai sisa uang saat ini, jatah ikut mengecil setiap saya mencatat pengeluaran hari ini. Contoh: sisa uang Rp 1.000.000 dan sisa 10 hari, jatahnya Rp 100.000. Setelah mencatat makan Rp 95.000, sisa uang jadi Rp 905.000 dan jatah turun jadi Rp 90.500, sehingga peringatan muncul padahal pengeluaranku belum melewati Rp 100.000. Karena itu di `hitungJatahHarian()` pengeluaran hari ini ditambahkan lagi ke sisa uang sebelum dibagi sisa hari, jadi jatah tetap sama sepanjang hari.

## Bug dan kendala

**1. Halaman melebar di layar 360px**

- Gejala: dengan catatan panjang tanpa spasi, halaman bisa di-scroll ke samping.
- Cara menemukan: aku mengisi catatan panjang di browser dengan lebar 360px, lalu membandingkan `document.documentElement.scrollWidth` (530) dengan `clientWidth` (360).
- Penyebab: item daftar memakai `display: flex`, dan flex item punya `min-width: auto` sehingga tidak mau lebih kecil dari kata terpanjangnya.
- Solusi: `min-width: 0` dan `overflow-wrap: anywhere` pada `.info-transaksi`. Setelah itu `scrollWidth` kembali 360.

**3. Pesan error validasi tidak muncul di halaman**

- Gejala: di W1 field tanggal dan nominal memakai atribut `required`. Saat dikosongkan, yang muncul adalah balon bawaan browser, bukan pesan error buatanku di halaman.
- Penyebab: validasi bawaan browser berjalan lebih dulu dan menahan event `submit`, jadi `validasiTransaksi()` tidak pernah dipanggil.
- Solusi: tambah `novalidate` pada `<form>` dan hapus atribut `required`, sehingga validasi sepenuhnya ditangani JavaScript dan pesannya tampil di elemen `error-transaksi`.

**3. Form tetap dalam mode edit setelah transaksi yang diedit dihapus**

- Gejala: kalau saya klik Edit lalu menghapus transaksi yang sama, `state.idEdit` masih menunjuk id yang sudah tidak ada, jadi tombol masih "Simpan Perubahan" dan menyimpan tidak mengubah apa pun.
- Cara menemukan: aku menelusuri alur edit dan hapus dan menyadari keduanya berbagi form yang sama.
- Solusi: di `hapusTransaksi()` ditambahkan pengecekan `if (state.idEdit === id)` untuk memanggil `selesaiEdit()` agar form kembali ke mode tambah.
