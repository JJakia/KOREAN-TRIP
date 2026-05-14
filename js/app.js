/* ════════════════════════════
   STATE
════════════════════════════ */
let kakaoReady = false;
let kakaoMap   = null;
let mapMarkers = [];
let currentRegion   = null;
let currentCategory = 'all';

/* ════════════════════════════
   CONSTANTS
════════════════════════════ */
const REGION_ICONS = {
  hongdae:    '🏙️',
  seongsu:    '🌿',
  gangnam:    '✨',
  gyeongbok:  '🏯',
  myeongdong: '🛍️',
  yeouido:    '🌸',
  incheon:    '☕',
};

const CAT_META = {
  '逛逛逛': { icon: '🛍️', bg: '#E8F5FD', label: '逛逛逛' },
  '衣食行':  { icon: '🍽️', bg: '#FEF3E2', label: '餐廳食物' },
  'SVT':    { icon: '💎', bg: '#F3EEFB', label: 'SVT' },
  'PLAVE':  { icon: '🎮', bg: '#EAFAF1', label: 'PLAVE' },
};

const MARKER_COLORS = {
  '逛逛逛': '#6EC6E6',
  '衣食行':  '#F0A060',
  'SVT':    '#9B7EC8',
  'PLAVE':  '#6DC894',
};

/* ════════════════════════════
   KAKAO MAP
════════════════════════════ */
async function ensureKakao() {
  if (kakaoReady) return;
  await loadKakaoMap();
  kakaoReady = true;
}

function clearMarkers() {
  mapMarkers.forEach(m => {
    if (m && typeof m.setMap === 'function') m.setMap(null);
  });
  mapMarkers = [];
}

function makeMarkerContent(cat) {
  const color = MARKER_COLORS[cat] || '#aaa';
  const icon  = CAT_META[cat]?.icon || '📌';
  return `<div style="
    width:32px;height:32px;border-radius:50%;
    background:${color};border:2.5px solid #fff;
    display:flex;align-items:center;justify-content:center;
    font-size:15px;
    box-shadow:0 2px 8px rgba(0,0,0,0.22);
    cursor:pointer;
  ">${icon}</div>`;
}

function addMarkers(region, cat) {
  clearMarkers();
  if (!kakaoMap) return;

  let places = PLACES.filter(p => p.region === region.id);
  if (cat !== 'all') places = places.filter(p => p.category === cat);

  places.forEach(p => {
    const pos     = new kakao.maps.LatLng(p.lat, p.lng);
    const content = makeMarkerContent(p.category);
    const overlay = new kakao.maps.CustomOverlay({
      map:      kakaoMap,
      position: pos,
      content,
      yAnchor: 1,
    });
    mapMarkers.push(overlay);
  });

  // 住宿 marker（只在 hongdae 顯示）
  if (region.id === 'hongdae') {
    const accPos = new kakao.maps.LatLng(ACCOMMODATION.lat, ACCOMMODATION.lng);
    const accEl  = `<div style="
      width:36px;height:36px;border-radius:50%;
      background:#E8956D;border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:17px;box-shadow:0 2px 10px rgba(0,0,0,0.25);
    ">🏠</div>`;
    const accOverlay = new kakao.maps.CustomOverlay({
      map: kakaoMap, position: accPos, content: accEl, yAnchor: 1,
    });
    mapMarkers.push(accOverlay);
  }
}

async function initMap(region) {
  await ensureKakao();

  const container = document.getElementById('kakao-map');
  const center    = new kakao.maps.LatLng(region.center.lat, region.center.lng);

  if (kakaoMap) {
    kakaoMap.setCenter(center);
    kakaoMap.setLevel(region.id === 'incheon' ? 6 : 5);
  } else {
    kakaoMap = new kakao.maps.Map(container, {
      center,
      level: region.id === 'incheon' ? 6 : 5,
    });
  }

  addMarkers(region, currentCategory);
}

/* ════════════════════════════
   RENDER: SUBWAY CHIPS
════════════════════════════ */
function renderSubwayChips(region) {
  const wrap = document.getElementById('subway-chips');
  if (!region.subways?.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = region.subways.map(s =>
    `<div class="subway-chip">
       <span class="line-dot" style="background:${s.color}"></span>
       <span>${s.name} ${s.line}號線</span>
     </div>`
  ).join('');
}

/* ════════════════════════════
   RENDER: CAT TABS
════════════════════════════ */
function renderCatTabs(region) {
  const wrap = document.getElementById('cat-tabs');
  const cats = [...new Set(PLACES.filter(p => p.region === region.id).map(p => p.category))];

  let html = `<div class="cat-tab active" data-cat="all">
    <span class="ct-icon">🗺️</span> 全部
  </div>`;
  cats.forEach(c => {
    const m = CAT_META[c] || { icon: '📌', label: c };
    html += `<div class="cat-tab" data-cat="${c}">
      <span class="ct-icon">${m.icon}</span> ${m.label}
    </div>`;
  });
  wrap.innerHTML = html;

  wrap.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      wrap.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      addMarkers(region, currentCategory);
      renderPlaceList(region, currentCategory);
    });
  });
}

/* ════════════════════════════
   RENDER: PLACE LIST
════════════════════════════ */
function renderPlaceList(region, cat) {
  const wrap = document.getElementById('place-list');
  let places = PLACES.filter(p => p.region === region.id);
  if (cat !== 'all') places = places.filter(p => p.category === cat);

  if (!places.length) {
    wrap.innerHTML = `<div class="empty-state">此區域沒有相關地點 🌿</div>`;
    return;
  }

  wrap.innerHTML = places.map((p, i) => {
    const meta   = CAT_META[p.category] || { icon: '📌', bg: '#f5f5f5' };
    const kUrl   = `https://map.kakao.com/link/map/${encodeURIComponent(p.nameKo)},${p.lat},${p.lng}`;
    const addrEl = p.address
      ? `<div class="place-address">📍 ${p.address}</div>`
      : `<div class="place-address empty">地址待填</div>`;
    const noteEl = p.note
      ? `<div class="place-note ${p.note.includes('BOOKED') ? 'booked' : ''}">${p.note}</div>`
      : '';

    return `
    <div class="place-card" style="animation-delay:${i * 0.035}s">
      <div class="place-card-icon" style="background:${meta.bg}">${meta.icon}</div>
      <div class="place-card-body">
        <div class="place-name-cn">${p.nameCn}</div>
        <div class="place-name-ko">${p.nameKo}</div>
        ${addrEl}
        ${noteEl}
      </div>
      <a class="kakao-btn" href="${kUrl}" target="_blank" rel="noopener">
        <span class="kakao-btn-icon">🗺</span>
        <span>在 Kakao<br>Map 查看</span>
      </a>
    </div>`;
  }).join('');
}

/* ════════════════════════════
   NAVIGATE TO REGION
════════════════════════════ */
async function navigateToRegion(regionId) {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return;

  currentRegion   = region;
  currentCategory = 'all';

  document.getElementById('region-topbar-title').textContent = region.name;

  // Reset cat tabs UI
  document.getElementById('cat-tabs').innerHTML = '';
  document.getElementById('place-list').innerHTML = '';

  showPage('region');

  // Wait for paint, then init map + content
  await new Promise(r => setTimeout(r, 60));

  renderSubwayChips(region);
  renderCatTabs(region);
  renderPlaceList(region, 'all');
  await initMap(region);
}

/* ════════════════════════════
   PAGE TRANSITIONS
════════════════════════════ */
function showPage(id) {
  const home   = document.getElementById('page-home');
  const region = document.getElementById('page-region');

  if (id === 'home') {
    region.classList.remove('active');
    home.classList.remove('slide-left');
    home.classList.add('active');
  } else {
    home.classList.remove('active');
    home.classList.add('slide-left');
    region.classList.add('active');
  }
}

/* ════════════════════════════
   RENDER: HOME REGION GRID
════════════════════════════ */
function renderRegionGrid() {
  const grid = document.getElementById('region-grid');
  grid.innerHTML = REGIONS.map(r => {
    const count = PLACES.filter(p => p.region === r.id).length;
    const icon  = REGION_ICONS[r.id] || '📍';
    const color = r.color || '#F7C59F';
    return `
    <div class="region-card" data-region="${r.id}">
      <div class="region-card-bg" style="background:${color}"></div>
      <div class="region-card-icon">${icon}</div>
      <div class="region-card-name">${r.name}</div>
      <div class="region-card-ko">${r.nameKo}</div>
      <div class="region-card-count">${count} 個地點</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.region-card').forEach(card => {
    card.addEventListener('click', () => navigateToRegion(card.dataset.region));
  });
}

/* ════════════════════════════
   SUBWAY MAP SVG (STATIC)
════════════════════════════ */
function renderSubwayMapSVG() {
  // Simple illustrated Seoul subway map (key lines only)
  const svg = `<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg" font-family="Noto Sans TC, sans-serif">
  <rect width="340" height="200" fill="#FBF7F2" rx="10"/>

  <!-- Line 1 (dark blue) -->
  <path d="M100,20 L100,180" stroke="#374EA2" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Line 2 (green) circle -->
  <ellipse cx="170" cy="100" rx="80" ry="60" stroke="#00A84D" stroke-width="4" fill="none"/>
  <!-- Line 3 (orange) -->
  <path d="M40,60 Q90,50 120,80 Q150,110 140,160" stroke="#EF7C1C" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Line 4 (sky blue) -->
  <path d="M220,20 Q240,80 210,160" stroke="#00A5DE" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Line 5 (purple) -->
  <path d="M20,100 L300,105" stroke="#9C27B0" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Line 6 (brown) -->
  <path d="M40,140 Q100,125 160,135 Q200,140 230,130" stroke="#CD6E2C" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Line 9 (gold) -->
  <path d="M30,165 Q120,155 200,160 L300,158" stroke="#BFA100" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Gyeongui (teal) -->
  <path d="M70,20 L110,180" stroke="#77C4A8" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6,3"/>

  <!-- Key stations -->
  <!-- 홍대입구 -->
  <circle cx="118" cy="97" r="5" fill="#fff" stroke="#374EA2" stroke-width="2"/>
  <text x="104" y="88" font-size="7.5" fill="#3A2E27" font-weight="600">홍대입구</text>
  <!-- 신촌 -->
  <circle cx="132" cy="97" r="4" fill="#fff" stroke="#00A84D" stroke-width="2"/>
  <text x="134" y="93" font-size="7" fill="#3A2E27">신촌</text>
  <!-- 강남 -->
  <circle cx="189" cy="128" r="5" fill="#fff" stroke="#00A84D" stroke-width="2"/>
  <text x="192" y="127" font-size="7.5" fill="#3A2E27" font-weight="600">강남</text>
  <!-- 명동 -->
  <circle cx="183" cy="97" r="4" fill="#fff" stroke="#00A84D" stroke-width="2"/>
  <text x="186" y="93" font-size="7" fill="#3A2E27">명동</text>
  <!-- 성수 -->
  <circle cx="222" cy="97" r="4" fill="#fff" stroke="#00A84D" stroke-width="2"/>
  <text x="225" y="93" font-size="7" fill="#3A2E27">성수</text>
  <!-- 잠실 -->
  <circle cx="248" cy="100" r="5" fill="#fff" stroke="#00A84D" stroke-width="2"/>
  <text x="251" y="98" font-size="7.5" fill="#3A2E27" font-weight="600">잠실</text>
  <!-- 경복궁 -->
  <circle cx="100" cy="62" r="4" fill="#fff" stroke="#EF7C1C" stroke-width="2"/>
  <text x="82" y="58" font-size="7" fill="#3A2E27">경복궁</text>
  <!-- 여의도 -->
  <circle cx="128" cy="103" r="4" fill="#fff" stroke="#9C27B0" stroke-width="2"/>
  <text x="110" y="118" font-size="7" fill="#3A2E27">여의도</text>

  <!-- Legend -->
  <rect x="8" y="8" width="68" height="94" rx="6" fill="white" opacity="0.85"/>
  <line x1="14" y1="18" x2="30" y2="18" stroke="#374EA2" stroke-width="3" stroke-linecap="round"/>
  <text x="33" y="21" font-size="7" fill="#3A2E27">1호선</text>
  <line x1="14" y1="30" x2="30" y2="30" stroke="#00A84D" stroke-width="3" stroke-linecap="round"/>
  <text x="33" y="33" font-size="7" fill="#3A2E27">2호선</text>
  <line x1="14" y1="42" x2="30" y2="42" stroke="#EF7C1C" stroke-width="3" stroke-linecap="round"/>
  <text x="33" y="45" font-size="7" fill="#3A2E27">3호선</text>
  <line x1="14" y1="54" x2="30" y2="54" stroke="#00A5DE" stroke-width="3" stroke-linecap="round"/>
  <text x="33" y="57" font-size="7" fill="#3A2E27">4호선</text>
  <line x1="14" y1="66" x2="30" y2="66" stroke="#9C27B0" stroke-width="3" stroke-linecap="round"/>
  <text x="33" y="69" font-size="7" fill="#3A2E27">5호선</text>
  <line x1="14" y1="78" x2="30" y2="78" stroke="#CD6E2C" stroke-width="3" stroke-linecap="round"/>
  <text x="33" y="81" font-size="7" fill="#3A2E27">6호선</text>
  <line x1="14" y1="90" x2="30" y2="90" stroke="#BFA100" stroke-width="3" stroke-linecap="round"/>
  <text x="33" y="93" font-size="7" fill="#3A2E27">9호선</text>
</svg>`;
  document.getElementById('subway-map-svg').innerHTML = svg;
}

/* ════════════════════════════
   INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  document.getElementById('back-btn').addEventListener('click', () => {
    clearMarkers();
    currentCategory = 'all';
    showPage('home');
  });

  renderRegionGrid();
  renderSubwayMapSVG();
});
