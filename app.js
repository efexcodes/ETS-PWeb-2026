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
const daftarTransaksi = document.querySelector("#daftar-transaksi");

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

  li.appendChild(info);
  li.appendChild(nominal);
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

function tambahTransaksi(item) {
  state.transaksi.push(item);
  renderDaftar(state);
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
renderDaftar(state);
