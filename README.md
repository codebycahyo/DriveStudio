# Drive Studio

Website jasa kustomisasi & modifikasi kendaraan dengan **konfigurator 3D** interaktif.
Dibangun murni dengan HTML, CSS, dan JavaScript (ES Modules) — tanpa framework dan tanpa proses build.

---

## Cara Menjalankan

Website ini memakai **ES Modules** dan memuat model 3D (`.glb`), sehingga **tidak bisa** dibuka langsung dengan klik dua kali pada `index.html` (akan diblokir kebijakan CORS browser). Jalankan lewat server lokal dengan **VS Code + Live Server**:

1. Buka folder `DriveStudio-main` di VS Code.
2. Pasang ekstensi **Live Server**.
3. Klik kanan `index.html` → **Open with Live Server**.

---

## Struktur Folder

```
DriveStudio-main/
├── index.html            # Beranda
├── cars.html             # Daftar layanan (search + filter)
├── detail.html           # Detail layanan
├── compare.html          # Galeri proyek
├── gallery-detail.html   # Detail proyek galeri
├── configurator.html     # Konfigurator 3D
├── about.html            # Tentang kami + form booking
├── article.html          # Berita / artikel
├── css/
│   ├── main.css          # Variabel warna, tipografi, layout dasar
│   ├── components.css    # Navbar, kartu, form, konfigurator
│   ├── pages.css         # Gaya khusus tiap halaman
│   ├── animations.css    # Keyframes & transisi
│   └── responsive.css    # Media query
├── js/
│   ├── configurator.js   # Mesin 3D (Three.js): kamera, material, livery
│   ├── nav.js            # Navbar sticky, menu mobile, tema
│   ├── search.js         # Pencarian layanan
│   ├── filter.js         # Filter brand & kategori
│   ├── favorites.js      # Simpan layanan favorit
│   ├── storage.js        # Wrapper localStorage (namespace `ds:`)
│   ├── ui.js             # Tab, komponen UI umum
│   └── utils.js          # Loading screen, debounce, animasi angka
└── assets/
    ├── images/           # Foto layanan & aset hero
    └── models/model.glb  # Model mobil 3D
```

---

## Fitur

**Halaman umum**

- Desain responsif (desktop, tablet, HP) memakai Flexbox, Grid, dan media query.
- Mode terang/gelap yang tersimpan di `localStorage` (tanpa kedip saat halaman dimuat).
- Loading screen dengan progress bar, animasi hitung angka pada statistik.
- Pencarian dan filter kategori pada halaman Layanan.
- Simpan layanan favorit, lengkap dengan badge jumlah di navbar.
- Navigasi mobile berupa panel dropdown ringkas.

**Konfigurator 3D** (`configurator.html`)

Model `.glb` dirender dengan Three.js r160 + OrbitControls + GLTFLoader. Alat yang tersedia:

| Alat | Fungsi |
|---|---|
| Paint | Ganti warna & jenis cat bodi |
| Wheels | Ganti model velg |
| Glass | Atur tingkat kegelapan kaca |
| Livery | Unggah gambar sendiri sebagai stiker/livery |
| Lighting | Atur pencahayaan studio |
| Environment | Ganti latar/environment map |
| Camera | Preset sudut pandang kamera |

---

## Teknologi

| Bagian | Keterangan |
|---|---|
| Struktur | HTML5 semantik |
| Tampilan | CSS3 — custom properties, Flexbox, Grid, media query |
| Logika | JavaScript ES6+ (modules, tanpa bundler) |
| 3D | [Three.js](https://threejs.org/) r160 via importmap (unpkg CDN) |
| Ikon | Bootstrap Icons 1.11.3 (jsDelivr CDN) |
| Penyimpanan | `localStorage` untuk tema & favorit |

Tidak ada dependency yang perlu di-`install` — cukup jalankan server lokal.

---

## Catatan

- Gambar hero memakai `assets/images/HeroPict.png` (PNG berlatar transparan). Untuk menggantinya, cukup timpa file tersebut dengan nama yang sama.
- Ukuran bleed mobil di hero dapat diatur lewat `translateX()` dan `width` pada `.hero-car` di `css/pages.css`.
- URL `https://drivestudio.com/` pada tag meta/canonical bersifat placeholder dan perlu disesuaikan bila website di-hosting.
