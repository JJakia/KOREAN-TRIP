/* ── STATE ── */
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
    const kUrl  = p.naverUrl || `https://map.naver.com/p/search/${encodeURIComponent(p.nameKo)}`;
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
      <a class="naver-btn" href="${kUrl}" target="_blank" rel="noopener">
        <span class="naver-btn-icon">🗺</span>
        <span>在 Naver<br>Map 查看</span>
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
    renderMap(region);
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
    currentCategory = 'all';
    showPage('home');
  });
  renderRegionGrid();
});

/* ── GOOGLE MY MAPS IFRAME ── */
function renderMap(region) {
  const container = document.getElementById('kakao-map');
  const lat = region.center.lat;
  const lng = region.center.lng;
  const zoom = region.id === 'incheon' ? 12 : 14;
  // 用你的 My Maps mid，加上 ll (center) 和 z (zoom) 讓地圖對焦到該區域
  const mid = '1HgZF4C_vqsJayCAhpXOLC_Tmr1PZaSg';
  container.innerHTML = `<iframe
    src="https://www.google.com/maps/d/u/0/embed?mid=${mid}&ll=${lat},${lng}&z=${zoom}&ehbc=2E312F"
    width="100%" height="100%"
    style="border:0;display:block;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>`;
}
