const KUNCI_TRANSAKSI = "transaksi";
const KUNCI_UANG_BULANAN = "uangBulanan";
const KUNCI_BUDGET = "budget";

let state = {
  transaksi: [],
  uangBulanan: 0,
  budget: {},
  idEdit: null,
  filter: { jenis: "semua", kategori: "semua", dari: "", sampai: "", kata: "" }
};

const form = document.querySelector("#form-transaksi");
const inputTanggal = document.querySelector("#tanggal");
const inputJenis = document.querySelector("#jenis");
const inputKategori = document.querySelector("#kategori");
const inputNominal = document.querySelector("#nominal");
const inputCatatan = document.querySelector("#catatan");
const formFilter = document.querySelector("#form-filter");
const filterJenis = document.querySelector("#filter-jenis");
const filterKategori = document.querySelector("#filter-kategori");
const filterDari = document.querySelector("#filter-dari");
const filterSampai = document.querySelector("#filter-sampai");
const filterKata = document.querySelector("#filter-kata");
const tombolResetFilter = document.querySelector("#tombol-reset-filter");
const tombolEkspor = document.querySelector("#tombol-ekspor");
const fileImpor = document.querySelector("#file-impor");
const pesanBackup = document.querySelector("#pesan-backup");
const formBudget = document.querySelector("#form-budget");
const budgetKategori = document.querySelector("#budget-kategori");
const budgetBatas = document.querySelector("#budget-batas");
const errorBudget = document.querySelector("#error-budget");
const daftarBudget = document.querySelector("#daftar-budget");
const judulForm = document.querySelector("#judul-form");
const tombolSimpan = document.querySelector("#tombol-simpan");
const tombolBatal = document.querySelector("#tombol-batal");
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
  localStorage.setItem(KUNCI_BUDGET, JSON.stringify(state.budget));
}

function bacaJson(kunci) {
  try {
    return JSON.parse(localStorage.getItem(kunci));
  } catch (error) {
    return null;
  }
}

function muatData() {
  const uang = Number(localStorage.getItem(KUNCI_UANG_BULANAN));
  if (uang > 0) {
    state.uangBulanan = uang;
  }

  const transaksi = bacaJson(KUNCI_TRANSAKSI);
  if (Array.isArray(transaksi)) {
    state.transaksi = transaksi;
  }

  const budget = bacaJson(KUNCI_BUDGET);
  if (budget && typeof budget === "object" && !Array.isArray(budget)) {
    state.budget = budget;
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

  const tombolEdit = document.createElement("button");
  tombolEdit.type = "button";
  tombolEdit.className = "tombol-edit";
  tombolEdit.dataset.id = item.id;
  tombolEdit.textContent = "Edit";

  const tombolHapus = document.createElement("button");
  tombolHapus.type = "button";
  tombolHapus.className = "tombol-hapus";
  tombolHapus.dataset.id = item.id;
  tombolHapus.textContent = "Hapus";

  const tombolAksi = document.createElement("div");
  tombolAksi.className = "tombol-aksi";
  tombolAksi.appendChild(tombolEdit);
  tombolAksi.appendChild(tombolHapus);

  const aksi = document.createElement("div");
  aksi.className = "aksi";
  aksi.appendChild(nominal);
  aksi.appendChild(tombolAksi);

  li.appendChild(info);
  li.appendChild(aksi);
  return li;
}

function cocokFilter(item, filter) {
  if (filter.jenis !== "semua" && item.jenis !== filter.jenis) return false;
  if (filter.kategori !== "semua" && item.kategori !== filter.kategori) return false;
  if (filter.dari && item.tanggal < filter.dari) return false;
  if (filter.sampai && item.tanggal > filter.sampai) return false;
  if (filter.kata && !item.catatan.toLowerCase().includes(filter.kata)) return false;
  return true;
}

function renderDaftar(data) {
  daftarTransaksi.innerHTML = "";

  const hasil = data.transaksi.filter((item) => cocokFilter(item, data.filter));

  if (hasil.length === 0) {
    const kosong = document.createElement("li");
    kosong.className = "kosong";
    kosong.textContent = data.transaksi.length === 0
      ? "Belum ada transaksi."
      : "Tidak ada transaksi yang cocok dengan filter.";
    daftarTransaksi.appendChild(kosong);
    return;
  }

  const terurut = hasil.sort((a, b) => {
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

function hitungBudget(data) {
  const bulanIni = hariIni().slice(0, 7);

  return Object.keys(data.budget).map((kategori) => {
    const batas = data.budget[kategori];
    const terpakai = data.transaksi
      .filter((item) => {
        return item.jenis === "pengeluaran" && item.kategori === kategori && item.tanggal.slice(0, 7) === bulanIni;
      })
      .reduce((total, item) => total + item.nominal, 0);

    let status = "aman";
    if (terpakai > batas) {
      status = "lewat";
    } else if (terpakai >= batas * 0.8) {
      status = "dekat";
    }

    return { kategori, batas, terpakai, persen: Math.round((terpakai / batas) * 100), status };
  });
}

function renderBudget(data) {
  daftarBudget.innerHTML = "";

  const daftar = hitungBudget(data);
  if (daftar.length === 0) {
    const kosong = document.createElement("li");
    kosong.className = "kosong";
    kosong.textContent = "Belum ada budget.";
    daftarBudget.appendChild(kosong);
    return;
  }

  const teksStatus = {
    aman: "Masih aman.",
    dekat: "Mendekati batas!",
    lewat: "Melewati batas!"
  };

  for (const budget of daftar) {
    const li = document.createElement("li");
    li.className = `item-budget ${budget.status}`;

    const judul = document.createElement("div");
    judul.className = "judul-budget";

    const nama = document.createElement("strong");
    nama.textContent = budget.kategori;

    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.className = "tombol-hapus-budget";
    tombolHapus.dataset.kategori = budget.kategori;
    tombolHapus.textContent = "Hapus";

    judul.appendChild(nama);
    judul.appendChild(tombolHapus);

    const bar = document.createElement("progress");
    bar.max = budget.batas;
    bar.value = budget.terpakai;

    const rincian = document.createElement("p");
    rincian.className = "detail";
    rincian.textContent = `${formatRupiah(budget.terpakai)} dari ${formatRupiah(budget.batas)} (${budget.persen}%)`;

    const status = document.createElement("p");
    status.className = "status-budget";
    status.textContent = teksStatus[budget.status];

    li.appendChild(judul);
    li.appendChild(bar);
    li.appendChild(rincian);
    li.appendChild(status);
    daftarBudget.appendChild(li);
  }
}

function render(data) {
  renderRingkasan(data);
  renderJatah(data);
  renderBudget(data);
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
  if (state.idEdit === id) {
    selesaiEdit();
  }
  simpanData();
  render(state);
  pesan.textContent = "Transaksi dihapus.";
}

function ubahTransaksi(id, dataBaru) {
  dataBaru.id = id;
  state.transaksi = state.transaksi.map((item) => (item.id === id ? dataBaru : item));
  simpanData();
  render(state);
  selesaiEdit();
  pesan.textContent = "Transaksi berhasil diubah.";
}

function mulaiEdit(id) {
  const item = state.transaksi.find((transaksi) => transaksi.id === id);
  if (!item) return;

  state.idEdit = id;
  inputTanggal.value = item.tanggal;
  inputJenis.value = item.jenis;
  inputKategori.value = item.kategori;
  inputNominal.value = item.nominal;
  inputCatatan.value = item.catatan;

  judulForm.textContent = "Edit Transaksi";
  tombolSimpan.textContent = "Simpan Perubahan";
  tombolBatal.hidden = false;
  tampilkanError([]);
  pesan.textContent = "";
  form.scrollIntoView({ behavior: "smooth" });
}

function selesaiEdit() {
  state.idEdit = null;
  kosongkanForm();
  judulForm.textContent = "Tambah Transaksi";
  tombolSimpan.textContent = "Simpan";
  tombolBatal.hidden = true;
  tampilkanError([]);
}

daftarTransaksi.addEventListener("click", (event) => {
  const tombolHapus = event.target.closest(".tombol-hapus");
  if (tombolHapus) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      hapusTransaksi(Number(tombolHapus.dataset.id));
    }
    return;
  }

  const tombolEdit = event.target.closest(".tombol-edit");
  if (tombolEdit) {
    mulaiEdit(Number(tombolEdit.dataset.id));
  }
});

tombolBatal.addEventListener("click", () => {
  selesaiEdit();
  pesan.textContent = "";
});

function eksporData() {
  const data = {
    transaksi: state.transaksi,
    uangBulanan: state.uangBulanan,
    budget: state.budget
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = `uang-kos-${hariIni()}.json`;
  tautan.click();
  URL.revokeObjectURL(url);

  pesanBackup.textContent = "Data berhasil diekspor.";
}

function transaksiValid(item) {
  return item !== null
    && typeof item === "object"
    && typeof item.id === "number"
    && typeof item.tanggal === "string"
    && item.tanggal !== ""
    && (item.jenis === "pemasukan" || item.jenis === "pengeluaran")
    && typeof item.kategori === "string"
    && typeof item.nominal === "number"
    && item.nominal > 0
    && typeof item.catatan === "string";
}

function dataImporValid(data) {
  if (!data || !Array.isArray(data.transaksi)) return false;
  if (!data.transaksi.every(transaksiValid)) return false;

  const budget = data.budget || {};
  if (Array.isArray(budget)) return false;
  return Object.values(budget).every((batas) => typeof batas === "number" && batas > 0);
}

function imporData(teks) {
  let data = null;
  try {
    data = JSON.parse(teks);
  } catch (error) {
    data = null;
  }

  if (!dataImporValid(data)) {
    pesanBackup.textContent = "File tidak valid, data tidak diubah.";
    return;
  }

  if (!confirm("Data saat ini akan diganti dengan isi file. Lanjutkan?")) return;

  state.transaksi = data.transaksi;
  state.uangBulanan = Number(data.uangBulanan) > 0 ? Number(data.uangBulanan) : 0;
  state.budget = data.budget || {};
  simpanData();

  inputUangBulanan.value = state.uangBulanan > 0 ? state.uangBulanan : "";
  selesaiEdit();
  render(state);
  pesanBackup.textContent = `Berhasil mengimpor ${state.transaksi.length} transaksi.`;
}

tombolEkspor.addEventListener("click", eksporData);

fileImpor.addEventListener("change", () => {
  const file = fileImpor.files[0];
  if (!file) return;

  const pembaca = new FileReader();
  pembaca.addEventListener("load", () => {
    imporData(pembaca.result);
    fileImpor.value = "";
  });
  pembaca.readAsText(file);
});

function isiOpsiKategori(pilihan) {
  for (const opsi of inputKategori.options) {
    const salinan = document.createElement("option");
    salinan.value = opsi.value;
    salinan.textContent = opsi.textContent;
    pilihan.appendChild(salinan);
  }
}

formBudget.addEventListener("submit", (event) => {
  event.preventDefault();

  const batas = Number(budgetBatas.value);
  if (Number.isNaN(batas) || batas <= 0) {
    errorBudget.textContent = "Batas budget wajib diisi dan harus lebih dari 0.";
    return;
  }

  errorBudget.textContent = "";
  state.budget[budgetKategori.value] = batas;
  simpanData();
  render(state);
  budgetBatas.value = "";
});

daftarBudget.addEventListener("click", (event) => {
  const tombol = event.target.closest(".tombol-hapus-budget");
  if (!tombol) return;

  delete state.budget[tombol.dataset.kategori];
  simpanData();
  render(state);
});

function bacaFilter() {
  state.filter = {
    jenis: filterJenis.value,
    kategori: filterKategori.value,
    dari: filterDari.value,
    sampai: filterSampai.value,
    kata: filterKata.value.trim().toLowerCase()
  };
  renderDaftar(state);
}

formFilter.addEventListener("input", bacaFilter);

tombolResetFilter.addEventListener("click", () => {
  formFilter.reset();
  bacaFilter();
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

  if (state.idEdit === null) {
    tambahTransaksi(transaksiBaru);
    kosongkanForm();
  } else {
    ubahTransaksi(state.idEdit, transaksiBaru);
  }
});

muatData();
isiOpsiKategori(filterKategori);
isiOpsiKategori(budgetKategori);
inputUangBulanan.value = state.uangBulanan > 0 ? state.uangBulanan : "";
kosongkanForm();
render(state);
