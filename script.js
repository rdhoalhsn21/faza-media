// ===== Tahun di footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Navbar scroll effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== Hamburger menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ===== Format Rupiah =====
const rupiah = (n) => 'Rp' + n.toLocaleString('id-ID');

// ===== Elemen form =====
const paketSelect = document.getElementById('paket');
const durasiInput = document.getElementById('durasi');
const sumPaket = document.getElementById('sumPaket');
const sumDurasi = document.getElementById('sumDurasi');
const sumHarga = document.getElementById('sumHarga');
const sumExtra = document.getElementById('sumExtra');
const sumTotal = document.getElementById('sumTotal');

// Setup data harga per paket
const paketInfo = {
  "Hemat 1 Kamera": 500000,
  "Hemat 2 Kamera": 1000000,
  "Paket 1 Kamera Exclusive": 650000,
  "Paket 2 Kamera Exclusive": 1500000,
  "Paket 3 Kamera Exclusive": 2300000,
  "Paket 4 Kamera Exclusive": 3000000,
  "Paket 4 Kamera + Drone Exclusive": 4000000,
  "Sewa Alat / Lainnya": 0,
  "Custom": 0
};

function hitungEstimasi() {
  const selectedOption = paketSelect.options[paketSelect.selectedIndex];
  const paketName = selectedOption.value;
  const hargaSatuan = parseInt(selectedOption.getAttribute('data-price')) || 0;
  
  let durasi = parseInt(durasiInput.value) || 1;
  if (durasi < 1) durasi = 1;

  // Biaya extra per jam/hari = Rp100.000 (Misal).
  let biayaExtra = 0;
  if (durasi > 1 && hargaSatuan > 0 && paketName.includes("Sewa")) {
      biayaExtra = (durasi - 1) * hargaSatuan;
  } else if (durasi > 4 && hargaSatuan > 0 && !paketName.includes("Sewa")) {
      // Jika Live Streaming lewat 4 jam, kena biaya extra 100rb/jam
      biayaExtra = (durasi - 4) * 100000;
  }

  const total = hargaSatuan + biayaExtra;

  sumPaket.textContent = paketName;
  sumDurasi.textContent = durasi + ' jam/hari';
  sumHarga.textContent = rupiah(hargaSatuan);
  sumExtra.textContent = rupiah(biayaExtra);
  sumTotal.textContent = rupiah(total);

  return { paket: paketName, durasi, harga: hargaSatuan, biayaExtra, total };
}

// Event listener kalkulator
paketSelect.addEventListener('change', hitungEstimasi);
durasiInput.addEventListener('input', hitungEstimasi);
hitungEstimasi();

// ===== Tombol "Sewa" / "Pilih Paket" =====
document.querySelectorAll('.select-package').forEach((btn) => {
  btn.addEventListener('click', () => {
    const namaAlat = btn.dataset.service;
    const harga = btn.dataset.price;
    
    // Cari opsi di dropdown yang cocok, jika tidak ada tambahkan baru
    let found = false;
    for (let i = 0; i < paketSelect.options.length; i++) {
        if (paketSelect.options[i].value === namaAlat) {
            paketSelect.selectedIndex = i;
            found = true;
            break;
        }
    }
    
    if (!found) {
        const newOption = new Option(namaAlat, namaAlat);
        newOption.setAttribute('data-price', harga);
        paketSelect.add(newOption);
        paketSelect.value = namaAlat;
    }

    hitungEstimasi();
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== Form booking submit =====
const form = document.getElementById('bookingForm');
const modal = document.getElementById('modal');
const summaryText = document.getElementById('summaryText');
const waBtn = document.getElementById('waBtn');
const copyBtn = document.getElementById('copyBtn');
const closeModal = document.getElementById('closeModal');

// GANTI nomor WA di bawah dengan nomor Faza Media
const WA_NUMBER = '6285113715101';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = hitungEstimasi();
  const nama = document.getElementById('nama').value.trim();
  const wa = document.getElementById('whatsapp').value.trim();
  const event = document.getElementById('event').value.trim();
  const tanggal = document.getElementById('tanggal').value;
  const catatan = document.getElementById('catatan').value.trim();

  const ringkasan =
`📋 *BOOKING FAZA MEDIA*
Nama: ${nama}
WhatsApp: ${wa}
Jenis Event: ${event}
Tanggal: ${tanggal}
Paket/Alat: ${data.paket}
Durasi: ${data.durasi} jam/hari
Harga Dasar: ${rupiah(data.harga)}
Tambahan: ${rupiah(data.biayaExtra)}
Total Estimasi: ${rupiah(data.total)}
Catatan: ${catatan || '-'}

Mohon konfirmasi jadwalnya. Terima kasih!`;

  summaryText.textContent = ringkasan;
  waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(ringkasan)}`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
});

// Copy ringkasan
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(summaryText.textContent);
    copyBtn.textContent = 'Tersalin ✓';
    setTimeout(() => (copyBtn.textContent = 'Salin Ringkasan'), 2000);
  } catch {
    const range = document.createRange();
    range.selectNode(summaryText);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    copyBtn.textContent = 'Tersalin ✓';
    setTimeout(() => (copyBtn.textContent = 'Salin Ringkasan'), 2000);
  }
});

// Tutup modal
closeModal.addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
});

// ===== Animasi reveal sederhana =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.section, .price-card, .flow-step, .stat-card, .paket-card, .alat-item').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});