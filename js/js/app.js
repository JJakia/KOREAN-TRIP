/* ── STATE ── */
let kakaoMap = null;
let activeMarkers = [];
let currentRegion = null;
let currentCategory = 'all';

/* ── REGION COLORS ── */
const REGION_COLORS = {
  hongdae:    '#F7C59F',
  seongsu:    '#C8E6C9',
  gangnam:    '#E1BEE7',
  gyeongbok:  '#FFECB3',
  myeongdong: '#FFCDD2',
  yeouido:    '#B3E5FC',
  incheon:    '#CFD8DC',
};

const CAT_COLORS = {
  '逛逛逛': '#7EC8E3',
  '衣食行':  '#F4A460',
  'SVT':    '#9B7EC8',
  'PLAVE':  '#7EC8A0',
};
const CAT_ICONS = {
  '逛逛逛': '🛍️',
  '衣食行':  '🍽️',
  'SVT':    '💎',
  'PLAVE':  '🎮',
};
const CAT_BG = {
  '逛逛逛': '#E3F5FB',
  '衣食行':  '#FEF3E2',
  'SVT':    '#F0EBF8',
  'PLAVE':  '#E8F5EC',
};

/* ── KAKAO MAP INIT ── */
function initKakaoMap(region) {
  const container = document.getElementById('kakao-map');

  // Destroy old map
  if (kakaoMap) {
    kakaoMap = null;
    container.innerHTML = '';
  }

  const center = new kakao.maps.LatLng(region.center.lat, region.center.lng);
  kakaoMap = new kakao.maps.Map(container, {
    center,
    level: region.id === 'incheon' ? 6 : 5,
    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
  });

  // Style: Kakao doesn't expose raw style override like Google,
  // but we overlay a semi-transparent region polygon for the colour-block effect
  drawRegionOverlay(region);
  drawMarkers(region, 'all');
}

/* ── REGION POLYGON OVERLAY ── */
function drawRegionOverlay(region) {
  const b = region.bounds;
  const path = [
    new kakao.maps.LatLng(b.maxLat, b.minLng),
    new kakao.maps.LatLng(b.maxLat, b.maxLng),
    new kakao.maps.LatLng(b.minLat, b.maxLng),
    new kakao.maps.LatLng(b.minLat, b.minLng),
  ];
  const color = REGION_COLORS[region.id] || '#F7C59F';
  const polygon = new kakao.maps.Polygon({
    map: kakaoMap,
    path,
    strokeWeight: 2,
    strokeColor: color,
    strokeOpacity: 0.8,
    fillColor: color,
    fillOpacity: 0.18,
  });
}

/* ── DRAW MARKERS ── */
function drawMarkers(region, cat) {
  // Clear old
  activeMarkers.forEach(m => m.setMap(null));
  activeMarkers = [];

  let places = PLACES.filter(p => p.region === region.id);
  if (cat && cat !== 'all') places = places.filter(p => p.category === cat);

  places.forEach(p => {
    const color = CAT_COLORS[p.category] || '#aaa';
    const icon = CAT_ICONS[p.category] || '📌';

    const content = `<div style="
      width:30px;height:30px;border-radius:50%;
      background:${color};border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.25);
      cursor:pointer;
    ">${icon}</div>`;

    const overlay = new kakao.maps.CustomOverlay({
      map: kakaoMap,
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content,
      yAnchor: 1,
    });

    activeMarkers.push(overlay);
  });

  // Accommodation marker
  if (
    ACCOMMODATION.lat >= region.bounds.minLat &&
    ACCOMMODATION.lat <= region.bounds.maxLat &&
    ACCOMMODATION.lng >= region.bounds.minLng &&
    ACCOMMODATION.lng <= region.bounds.maxLng
  ) {
    const accContent = `<div style="
      width:34px;height:34px;border-radius:50%;
      background:#E8956D;border:3px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">🏠</div>`;
    const accOverlay = new kakao.maps.CustomOverlay({
      map: kakaoMap,
      position: new kakao.maps.LatLng(ACCOMMODATION.lat, ACCOMMODATION.lng),
      content: accContent,
      yAnchor: 1,
    });
    activeMarkers.push(accOverlay);
  }
}

/* ── SUBWAY CHIPS ── */
function renderSubwayChips(region) {
  const wrap = document.getElementById('subway-chips');
  if (!region.subways.length) {
    wrap.innerHTML = `<span style="font-size:12px;color:var(--text-light)">無地鐵站資訊</span>`;
    return;
  }
  wrap.innerHTML = region.subways.map(s =>
    `<div class="subway-chip">
      <span class="line-dot" style="background:${s.color}"></span>
      <span>${s.name} ${s.line}號線</span>
    </div>`
  ).join('');
}

/* ── CATEGORY TABS ── */
function renderCatTabs(region) {
  const wrap = document.getElementById('cat-tabs');
  const cats = [...new Set(PLACES.filter(p => p.region === region.id).map(p => p.category))];

  let html = `<div class="cat-tab active" data-cat="all">
    <span class="ct-icon">🗺️</span><span class="ct-label">全部</span>
  </div>`;
  cats.forEach(c => {
    html += `<div class="cat-tab" data-cat="${c}">
      <span class="ct-icon">${CAT_ICONS[c] || '📌'}</span>
      <span class="ct-label">${c}</span>
    </div>`;
  });
  wrap.innerHTML = html;
  currentCategory = 'all';

  wrap.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      wrap.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      drawMarkers(region, currentCategory);
      renderPlaceList(region, currentCategory);
    });
  });
}

/* ── PLACE LIST ── */
function renderPlaceList(region, cat) {
  const wrap = document.getElementById('place-list');
  let places = PLACES.filter(p => p.region === region.id);
  if (cat && cat !== 'all') places = places.filter(p => p.category === cat);

  if (!places.length) {
    wrap.innerHTML = `<p style="color:var(--text-light);font-size:13px;text-align:center;padding:24px">此區域無相關地點</p>`;
    return;
  }

  wrap.innerHTML = places.map((p, i) => {
    const icon = CAT_ICONS[p.category] || '📌';
    const bg = CAT_BG[p.category] || '#f5f5f5';
    const kUrl = `https://map.kakao.com/link/map/${encodeURIComponent(p.nameKo)},${p.lat},${p.lng}`;
    const addrHtml = p.address
      ? `<div class="place-card-address">📍 ${p.address}</div>`
      : `<div class="place-card-address empty">地址待填</div>`;
    const noteHtml = p.note
      ? `<div class="place-card-note ${p.note.includes('BOOKED') ? 'booked' : ''}">${p.note}</div>`
      : '';

    return `<div class="place-card" style="animation-delay:${i*0.04}s">
      <div class="place-card-icon" style="background:${bg}">${icon}</div>
      <div class="place-card-body">
        <div class="place-card-names">${p.nameCn}<span class="ko">${p.nameKo}</span></div>
        ${addrHtml}
        ${noteHtml}
      </div>
      <a class="kakao-icon-btn" href="${kUrl}" target="_blank" rel="noopener" title="在 Kakao Map 查看">🗺️</a>
    </div>`;
  }).join('');
}

/* ── NAVIGATE TO REGION ── */
function navigateToRegion(regionId) {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return;
  currentRegion = region;

  showPage('region');

  // Update header
  document.getElementById('header-title').textContent = region.name;
  document.getElementById('header-sub').textContent = region.nameKo;

  // Wait for page to be visible before init map
  requestAnimationFrame(() => {
    initKakaoMap(region);
    renderSubwayChips(region);
    renderCatTabs(region);
    renderPlaceList(region, 'all');
  });
}

/* ── PAGE NAV ── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');

  const backBtn = document.getElementById('back-btn');
  if (id === 'home') {
    backBtn.style.display = 'none';
    document.getElementById('header-title').textContent = '首爾旅遊地圖';
    document.getElementById('header-sub').textContent = '5月24日—31日';
  } else {
    backBtn.style.display = 'flex';
  }
}

/* ── REGION GRID ── */
function renderRegionGrid() {
  const grid = document.getElementById('region-grid');
  grid.innerHTML = REGIONS.map(r => {
    const count = PLACES.filter(p => p.region === r.id).length;
    const cats = [...new Set(PLACES.filter(p => p.region === r.id).map(p => p.category))];
    const dots = cats.map(c =>
      `<span class="rc-dot" style="background:${CAT_COLORS[c]}"></span>`
    ).join('');
    const color = REGION_COLORS[r.id] || '#ddd';

    return `<div class="region-card" data-region="${r.id}">
      <div class="rc-bar" style="background:${color}"></div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-ko">${r.nameKo}</div>
      <div class="rc-count">${dots} ${count} 個地點</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.region-card').forEach(card => {
    card.addEventListener('click', () => navigateToRegion(card.dataset.region));
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  document.getElementById('back-btn').addEventListener('click', () => {
    showPage('home');
  });

  renderRegionGrid();
  showPage('home');
});
