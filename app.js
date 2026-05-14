/* ── STATE ── */
let kakaoReady = false;
let kakaoMap   = null;
let mapMarkers = [];
let currentRegion   = null;
let currentCategory = 'all';

/* ── CONSTANTS ── */
const REGION_ICONS = {
  hongdae:    '🏙️', seongsu: '🌿', gangnam: '✨',
  gyeongbok:  '🏯', myeongdong: '🛍️', yeouido: '🌸', incheon: '☕',
};
const CAT_META = {
  '逛逛逛': { icon: '🛍️', bg: '#E8F5FD', label: '逛逛逛' },
  '衣食行':  { icon: '🍽️', bg: '#FEF3E2', label: '餐廳食物' },
  'SVT':    { icon: '💎', bg: '#F3EEFB', label: 'SVT' },
  'PLAVE':  { icon: '🎮', bg: '#EAFAF1', label: 'PLAVE' },
};
const MARKER_COLORS = {
  '逛逛逛': '#6EC6E6', '衣食行': '#F0A060', 'SVT': '#9B7EC8', 'PLAVE': '#6DC894',
};

/* ── KAKAO SDK LOADER ── */
async function ensureKakao() {
  if (kakaoReady) return;
  await loadKakaoMap();
  kakaoReady = true;
}

/* ── MARKERS ── */
function clearMarkers() {
  mapMarkers.forEach(m => { try { m.setMap(null); } catch(e){} });
  mapMarkers = [];
}

function addMarkers(region, cat) {
  clearMarkers();
  if (!kakaoMap) return;

  let places = PLACES.filter(p => p.region === region.id);
  if (cat !== 'all') places = places.filter(p => p.category === cat);

  places.forEach(p => {
    const color = MARKER_COLORS[p.category] || '#aaa';
    const icon  = CAT_META[p.category]?.icon || '📌';
    const content = `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${icon}</div>`;
    const overlay = new kakao.maps.CustomOverlay({
      map: kakaoMap,
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content,
      yAnchor: 1,
    });
    mapMarkers.push(overlay);
  });

  // 住宿 marker
  if (
    ACCOMMODATION.lat >= region.bounds.minLat && ACCOMMODATION.lat <= region.bounds.maxLat &&
    ACCOMMODATION.lng >= region.bounds.minLng && ACCOMMODATION.lng <= region.bounds.maxLng
  ) {
    const accContent = `<div style="width:34px;height:34px;border-radius:50%;background:#E8956D;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.25);">🏠</div>`;
    mapMarkers.push(new kakao.maps.CustomOverlay({
      map: kakaoMap,
      position: new kakao.maps.LatLng(ACCOMMODATION.lat, ACCOMMODATION.lng),
      content: accContent,
      yAnchor: 1,
    }));
  }
}

/* ── MAP INIT：每次都重建，避免 iOS container 問題 ── */
async function initMap(region) {
  await ensureKakao();

  // 每次都清空 container 重建，確保 iOS 正確渲染
  const container = document.getElementById('kakao-map');
  container.innerHTML = '';
  kakaoMap = null;

  const center = new kakao.maps.LatLng(region.center.lat, region.center.lng);
  const level  = region.id === 'incheon' ? 6 : 5;

  kakaoMap = new kakao.maps.Map(container, { center, level });

  // 等地圖 idle 後再放 markers，確保渲染完成
  kakao.maps.event.addListenerOnce(kakaoMap, 'idle', () => {
    addMarkers(region, currentCategory);
  });
}

/* ── SUBWAY CHIPS ── */
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

/* ── CAT TABS ── */
function renderCatTabs(region) {
  const wrap = document.getElementById('cat-tabs');
  const cats = [...new Set(PLACES.filter(p => p.region === region.id).map(p => p.category))];

  let html = `<div class="cat-tab active" data-cat="all"><span>🗺️</span> 全部</div>`;
  cats.forEach(c => {
    const m = CAT_META[c] || { icon: '📌', label: c };
    html += `<div class="cat-tab" data-cat="${c}"><span>${m.icon}</span> ${m.label}</div>`;
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

/* ── PLACE LIST ── */
function renderPlaceList(region, cat) {
  const wrap = document.getElementById('place-list');
  let places = PLACES.filter(p => p.region === region.id);
  if (cat !== 'all') places = places.filter(p => p.category === cat);

  if (!places.length) {
    wrap.innerHTML = `<div class="empty-state">此區域沒有相關地點 🌿</div>`;
    return;
  }

  wrap.innerHTML = places.map((p, i) => {
    const meta  = CAT_META[p.category] || { icon: '📌', bg: '#f5f5f5' };
    const kUrl  = `https://map.kakao.com/link/map/${encodeURIComponent(p.nameKo)},${p.lat},${p.lng}`;
    const addr  = p.address
      ? `<div class="place-address">📍 ${p.address}</div>`
      : `<div class="place-address empty">地址待填</div>`;
    const note  = p.note
      ? `<div class="place-note ${p.note.includes('BOOKED') ? 'booked' : ''}">${p.note}</div>`
      : '';
    return `
    <div class="place-card" style="animation-delay:${i*0.03}s">
      <div class="place-card-icon" style="background:${meta.bg}">${meta.icon}</div>
      <div class="place-card-body">
        <div class="place-name-cn">${p.nameCn}</div>
        <div class="place-name-ko">${p.nameKo}</div>
        ${addr}${note}
      </div>
      <a class="kakao-btn" href="${kUrl}" target="_blank" rel="noopener">
        <span class="kakao-btn-icon">🗺</span>
        <span>在 Kakao<br>Map 查看</span>
      </a>
    </div>`;
  }).join('');
}

/* ── NAVIGATE ── */
async function navigateToRegion(regionId) {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return;
  currentRegion   = region;
  currentCategory = 'all';

  document.getElementById('region-topbar-title').textContent = region.name;
  document.getElementById('cat-tabs').innerHTML   = '';
  document.getElementById('place-list').innerHTML = '';

  showPage('region');

  // 讓頁面先完成渲染，再初始化地圖
  requestAnimationFrame(() => {
    renderSubwayChips(region);
    renderCatTabs(region);
    renderPlaceList(region, 'all');
    initMap(region);
  });
}

/* ── PAGE TRANSITIONS ── */
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

/* ── REGION GRID ── */
function renderRegionGrid() {
  const grid = document.getElementById('region-grid');
  grid.innerHTML = REGIONS.map(r => {
    const count = PLACES.filter(p => p.region === r.id).length;
    const icon  = REGION_ICONS[r.id] || '📍';
    const color = r.color || '#F7C59F';
    return `<div class="region-card" data-region="${r.id}">
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

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  document.getElementById('back-btn').addEventListener('click', () => {
    clearMarkers();
    currentCategory = 'all';
    showPage('home');
  });
  renderRegionGrid();
});
