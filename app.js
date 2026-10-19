let state = {
  transaksi: []
};

const form = document.querySelector("#form-transaksi");
const inputTanggal = document.querySelector("#tanggal");
const inputJenis = document.querySelector("#jenis");
const inputKategori = document.querySelector("#kategori");
const inputNominal = document.querySelector("#nominal");
const inputCatatan = document.querySelector("#catatan");
const pesan = document.querySelector("#pesan");

function hariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const tanggal = String(sekarang.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${tanggal}`;
}

function kosongkanForm() {
  form.reset();
  inputTanggal.value = hariIni();
}

function tambahTransaksi(item) {
  state.transaksi.push(item);
  pesan.textContent = "Transaksi berhasil ditambahkan.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const transaksiBaru = {
    id: Date.now(),
    tanggal: inputTanggal.value,
    jenis: inputJenis.value,
    kategori: inputKategori.value,
    nominal: Number(inputNominal.value),
    catatan: inputCatatan.value.trim()
  };

  tambahTransaksi(transaksiBaru);
  kosongkanForm();
});

kosongkanForm();
