const KUNCI_TRANSAKSI = "transaksi";
const KUNCI_UANG_BULANAN = "uangBulanan";

let state = {
  transaksi: [],
  uangBulanan: 0
};

const form = document.querySelector("#form-transaksi");
const inputTanggal = document.querySelector("#tanggal");
const inputJenis = document.querySelector("#jenis");
const inputKategori = document.querySelector("#kategori");
const inputNominal = document.querySelector("#nominal");
const inputCatatan = document.querySelector("#catatan");
const pesan = document.querySelector("#pesan");
const daftarError = document.querySelector("#daftar-error");
const daftarTransaksi = document.querySelector("#daftar-transaksi");
const teksPemasukan = document.querySelector("#total-pemasukan");
const teksPengeluaran = document.querySelector("#total-pengeluaran");
const teksSaldo = document.querySelector("#saldo");
const formUang = document.querySelector("#form-uang");
const inputUangBulanan = document.querySelector("#uang-bulanan");
const errorUang = document.querySelector("#error-uang");
const teksSisaUang = document.querySelector("#sisa-uang");
const teksSisaHari = document.querySelector("#sisa-hari");
const teksJatahHarian = document.querySelector("#jatah-harian");
const teksPengeluaranHariIni = document.querySelector("#pengeluaran-hari-ini");
const teksPeringatan = document.querySelector("#peringatan");

function simpanData() {
  localStorage.setItem(KUNCI_TRANSAKSI, JSON.stringify(state.transaksi));
  localStorage.setItem(KUNCI_UANG_BULANAN, String(state.uangBulanan));
}

function muatData() {
  const uang = Number(localStorage.getItem(KUNCI_UANG_BULANAN));
  if (uang > 0) {
    state.uangBulanan = uang;
  }

  try {
    const data = JSON.parse(localStorage.getItem(KUNCI_TRANSAKSI));
    if (Array.isArray(data)) {
      state.transaksi = data;
    }
  } catch (error) {
    state.transaksi = [];
  }
}

function formatRupiah(angka) {
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatTanggal(teks) {
  const tanggal = new Date(`${teks}T00:00:00`);
  return tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

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

function buatItemTransaksi(item) {
  const li = document.createElement("li");
  li.className = `item-transaksi ${item.jenis}`;

  const info = document.createElement("div");

  const kategori = document.createElement("strong");
  kategori.textContent = item.kategori;

  const detail = document.createElement("p");
  detail.className = "detail";
  detail.textContent = item.catatan
    ? `${formatTanggal(item.tanggal)} · ${item.catatan}`
    : formatTanggal(item.tanggal);

  info.appendChild(kategori);
  info.appendChild(detail);

  const nominal = document.createElement("span");
  nominal.className = "nominal";
  const tanda = item.jenis === "pemasukan" ? "+" : "-";
  nominal.textContent = `${tanda} ${formatRupiah(item.nominal)}`;

  const tombolHapus = document.createElement("button");
  tombolHapus.type = "button";
  tombolHapus.className = "tombol-hapus";
  tombolHapus.dataset.id = item.id;
  tombolHapus.textContent = "Hapus";

  const aksi = document.createElement("div");
  aksi.className = "aksi";
  aksi.appendChild(nominal);
  aksi.appendChild(tombolHapus);

  li.appendChild(info);
  li.appendChild(aksi);
  return li;
}

function renderDaftar(data) {
  daftarTransaksi.innerHTML = "";

  if (data.transaksi.length === 0) {
    const kosong = document.createElement("li");
    kosong.className = "kosong";
    kosong.textContent = "Belum ada transaksi.";
    daftarTransaksi.appendChild(kosong);
    return;
  }

  const terurut = [...data.transaksi].sort((a, b) => {
    return b.tanggal.localeCompare(a.tanggal) || b.id - a.id;
  });

  for (const item of terurut) {
    daftarTransaksi.appendChild(buatItemTransaksi(item));
  }
}

function hitungRingkasan(data) {
  const pemasukan = data.transaksi
    .filter((item) => item.jenis === "pemasukan")
    .reduce((total, item) => total + item.nominal, 0);

  const pengeluaran = data.transaksi
    .filter((item) => item.jenis === "pengeluaran")
    .reduce((total, item) => total + item.nominal, 0);

  return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
}

function renderRingkasan(data) {
  const ringkasan = hitungRingkasan(data);
  teksPemasukan.textContent = formatRupiah(ringkasan.pemasukan);
  teksPengeluaran.textContent = formatRupiah(ringkasan.pengeluaran);
  teksSaldo.textContent = formatRupiah(ringkasan.saldo);
  teksSaldo.classList.toggle("negatif", ringkasan.saldo < 0);
}

function hitungJatahHarian(data) {
  const sekarang = new Date();
  const tanggalHariIni = hariIni();
  const bulanIni = tanggalHariIni.slice(0, 7);

  const jumlahHariBulanIni = new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 0).getDate();
  const sisaHari = jumlahHariBulanIni - sekarang.getDate() + 1;

  const pengeluaranBulanIni = data.transaksi
    .filter((item) => item.jenis === "pengeluaran" && item.tanggal.slice(0, 7) === bulanIni)
    .reduce((total, item) => total + item.nominal, 0);

  const pengeluaranHariIni = data.transaksi
    .filter((item) => item.jenis === "pengeluaran" && item.tanggal === tanggalHariIni)
    .reduce((total, item) => total + item.nominal, 0);

  const sisaUang = data.uangBulanan - pengeluaranBulanIni;
  const sisaUangAwalHari = sisaUang + pengeluaranHariIni;
  const jatah = Math.floor(Math.max(sisaUangAwalHari, 0) / sisaHari);

  return {
    sisaUang,
    sisaHari,
    jatah,
    pengeluaranHariIni,
    melebihi: data.uangBulanan > 0 && pengeluaranHariIni > jatah
  };
}

function renderJatah(data) {
  const jatah = hitungJatahHarian(data);

  teksSisaUang.textContent = formatRupiah(jatah.sisaUang);
  teksSisaHari.textContent = `${jatah.sisaHari} hari`;
  teksJatahHarian.textContent = formatRupiah(jatah.jatah);
  teksPengeluaranHariIni.textContent = formatRupiah(jatah.pengeluaranHariIni);

  if (jatah.melebihi) {
    teksPeringatan.textContent = `Awas! Pengeluaran hari ini (${formatRupiah(jatah.pengeluaranHariIni)}) melebihi jatah harian (${formatRupiah(jatah.jatah)}).`;
  } else {
    teksPeringatan.textContent = "";
  }
}

function render(data) {
  renderRingkasan(data);
  renderJatah(data);
  renderDaftar(data);
}

function tambahTransaksi(item) {
  state.transaksi.push(item);
  simpanData();
  render(state);
  pesan.textContent = "Transaksi berhasil ditambahkan.";
}

function hapusTransaksi(id) {
  state.transaksi = state.transaksi.filter((item) => item.id !== id);
  simpanData();
  render(state);
  pesan.textContent = "Transaksi dihapus.";
}

daftarTransaksi.addEventListener("click", (event) => {
  const tombol = event.target.closest(".tombol-hapus");
  if (!tombol) return;

  if (confirm("Yakin ingin menghapus transaksi ini?")) {
    hapusTransaksi(Number(tombol.dataset.id));
  }
});

function validasiTransaksi(item) {
  const daftarPesan = [];

  if (!item.tanggal) {
    daftarPesan.push("Tanggal wajib diisi.");
  }

  if (Number.isNaN(item.nominal) || item.nominal <= 0) {
    daftarPesan.push("Nominal wajib diisi dan harus lebih dari 0.");
  }

  return daftarPesan;
}

function tampilkanError(daftarPesan) {
  daftarError.innerHTML = "";

  for (const teks of daftarPesan) {
    const li = document.createElement("li");
    li.textContent = teks;
    daftarError.appendChild(li);
  }
}

formUang.addEventListener("submit", (event) => {
  event.preventDefault();

  const uang = Number(inputUangBulanan.value);
  if (Number.isNaN(uang) || uang <= 0) {
    errorUang.textContent = "Uang bulanan wajib diisi dan harus lebih dari 0.";
    return;
  }

  errorUang.textContent = "";
  state.uangBulanan = uang;
  simpanData();
  render(state);
});

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

  const daftarPesan = validasiTransaksi(transaksiBaru);
  tampilkanError(daftarPesan);

  if (daftarPesan.length > 0) {
    pesan.textContent = "";
    return;
  }

  tambahTransaksi(transaksiBaru);
  kosongkanForm();
});

muatData();
inputUangBulanan.value = state.uangBulanan > 0 ? state.uangBulanan : "";
kosongkanForm();
render(state);
