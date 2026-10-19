# AI Log

AI yang dipakai: Claude Code.

## W4 Data persisten
- Prompt: "gimana cara nyimpen array objek ke localStorage pake JSON.stringify terus dibaca lagi pake JSON.parse pas halaman dibuka? kalo isinya rusak jangan sampe crash"
- Dipakai: `simpanData()`, `muatData()`, `parseJson()` (try/catch di sekitar `JSON.parse`)
- Diubah: tidak ada.

## Bonus: filter dan pencarian
- Prompt: "cara filter array transaksi pake filter() buat jenis, kategori, sama rentang tanggal. string tanggal YYYY-MM-DD bisa dibandingin langsung pake < >? terus search catatan pake includes() yang gak peduli huruf besar kecil"
- Dipakai: `cocokFilter()`, `bacaFilter()`
- Diubah: tidak ada.

## Bonus: ekspor dan impor JSON
- Prompt: "cara ekspor state ke file .json pake Blob + URL.createObjectURL + tag a download, terus impornya pake FileReader readAsText. validasi isinya gimana biar file ngawur gak bikin error"
- Dipakai: `eksporData()`, `imporData()`, `transaksiValid()`
- Diubah: tidak ada.

## Bug responsif 360px
- Prompt: "kenapa catatan panjang tanpa spasi bikin halaman scroll horizontal di layar 360px padahal item-nya display flex?"
- Dipakai: `min-width: 0` dan `overflow-wrap: anywhere` pada `.info-transaksi` di `style.css`
- Diubah: tidak ada.
