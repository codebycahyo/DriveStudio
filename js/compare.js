import { initNavbar } from './nav.js';
import { initTheme } from './theme.js';
import { initScrollReveal, initCounters, initLoadingScreen } from './utils.js';

initNavbar();
initTheme();
initScrollReveal();
initCounters();
initLoadingScreen();

/* ── Car spec data ─────────────────────────────────────────── */
const CAR_DATA = {
  'toyota-innova-zenix': {
    name: 'Innova Zenix Hybrid',
    brand: 'Toyota',
    price: 471600000,
    engine: '2.0L M20A-FXS Dual VVT-i Hybrid',
    power: 186,
    torque: 187,
    transmission: 'e-CVT',
    bbmText: '21.0 km/L',
    bbmVal: 21.0,
    topSpeed: 175,
    tangki: 52,
    gc: 185,
  },
  'honda-brio': {
    name: 'Honda Brio',
    brand: 'Honda',
    price: 191900000,
    engine: '1.2L 4-Silinder i-VTEC',
    power: 90,
    torque: 110,
    transmission: 'CVT',
    bbmText: '16.5 km/L',
    bbmVal: 16.5,
    topSpeed: 160,
    tangki: 35,
    gc: 165,
  },
  'mitsubishi-pajero-sport': {
    name: 'Pajero Sport',
    brand: 'Mitsubishi',
    price: 589600000,
    engine: '2.4L MIVEC Turbo Diesel',
    power: 181,
    torque: 430,
    transmission: '8-Speed Otomatis',
    bbmText: '12.8 km/L',
    bbmVal: 12.8,
    topSpeed: 180,
    tangki: 68,
    gc: 218,
  },
  'byd-atto-3': {
    name: 'BYD Atto 3',
    brand: 'BYD',
    price: 515000000,
    engine: 'Motor Listrik Tunggal (EV)',
    power: 204,
    torque: 310,
    transmission: '1-Speed Direct Drive',
    bbmText: '6.2 km/kWh (Listrik)',
    bbmVal: 30.0,
    topSpeed: 160,
    tangki: 0,
    gc: 175,
  },
};

/* ── DOM references ────────────────────────────────────────── */
const slotA = document.getElementById('compareSlotA');
const slotB = document.getElementById('compareSlotB');
const slotC = document.getElementById('compareSlotC');
const table = document.getElementById('compareTable');

/* ── Helpers ────────────────────────────────────────────────── */
const fmt = {
  price:    (v) => `Rp${v.toLocaleString('id-ID')}`,
  power:    (v) => `${v} PS`,
  torque:   (v) => `${v} Nm`,
  topSpeed: (v) => `${v} km/jam`,
  tangki:   (v) => v > 0 ? `${v} Liter` : 'N/A (Listrik)',
  gc:       (v) => `${v} mm`,
};

function bestIndex(values, mode) {
  const validValues = values.filter(v => v > 0);
  if (validValues.length === 0) return -1;
  
  const target = mode === 'lowest' ? Math.min(...validValues) : Math.max(...validValues);
  return values.indexOf(target);
}

/* ── Render ─────────────────────────────────────────────────── */
function renderTable() {
  if (!slotA || !slotB || !slotC || !table) return;

  const ids  = [slotA.value, slotB.value, slotC.value];
  const cars = ids.map((id) => CAR_DATA[id]);

  /* thead */
  const thead = table.querySelector('thead');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th scope="col">Spesifikasi</th>
        ${cars.map((c) => `<th scope="col">${c.name}</th>`).join('')}
      </tr>`;
  }

  /* Row definitions: [label, key, formatter | null, bestMode | null] */
  const rows = [
    ['Harga OTR',         'price',    fmt.price,    'lowest'],
    ['Mesin',             'engine',   null,         null],
    ['Tenaga',            'power',    fmt.power,    'highest'],
    ['Torsi',             'torque',   fmt.torque,   'highest'],
    ['Transmisi',         'transmission', null,     null],
    ['Konsumsi BBM',      'bbmText',  null,         null],
    ['Kecepatan Maksimum','topSpeed', fmt.topSpeed, 'highest'],
    ['Kapasitas Tangki',  'tangki',   fmt.tangki,   'highest'],
    ['Ground Clearance',  'gc',       fmt.gc,       'highest'],
  ];

  const tbodyHTML = rows.map(([label, key, formatter, mode]) => {
    let values;
    if (key === 'bbmText') {
      values = cars.map((c) => c.bbmVal);
      mode = 'highest'; 
    } else {
      values = cars.map((c) => c[key]);
    }
    
    const best = mode !== null ? bestIndex(values, mode) : -1;

    const cells = cars.map((c, i) => {
      const rawVal = c[key];
      const text = formatter ? formatter(rawVal) : rawVal;
      const isBestCell = i === best;
      const cls = isBestCell ? ' class="is-best"' : '';
      return `<td${cls}>${text}</td>`;
    }).join('');

    return `<tr><th scope="row">${label}</th>${cells}</tr>`;
  }).join('');

  const tbody = table.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = tbodyHTML;
  }
}

/* ── Events ─────────────────────────────────────────────────── */
if (slotA && slotB && slotC) {
  [slotA, slotB, slotC].forEach((sel) => sel.addEventListener('change', renderTable));
}

/* ── Initial render ─────────────────────────────────────────── */
renderTable();
