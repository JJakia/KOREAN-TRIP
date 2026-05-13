/* ── STATE ── */
let currentRegion = null;
let currentCategory = 'all';
let kakaoMap = null;
let kakaoMarkers = [];
let kakaoOverlays = [];

/* ── KAKAO MAP INIT ── */
function initKakaoMap(region) {
  const container = document.getElementById('kakao-map');

  // Region center
  const center = new kakao.maps.LatLng(region.center.lat, region.center.lng);

  const options = {
    center,
    level: region.zoomLevel || 4,
  };

  // Destroy old map if exists
  if (kakaoMap) {
    kakaoMap = null;
    container.innerHTML = '';
  }

  kakaoMap = new kakao.maps.Map(container, options);

  // Fit bounds to region
  const bounds = new kakao.maps.LatLngBounds(
    new kakao.maps.LatLng(region.bounds.minLat, region.bounds.minLng),
    new kakao.maps.LatLng(region.bounds.maxLat, region.bounds.maxLng)
  );
  kakaoMap.setBounds(bounds);

  // Style: disable some controls for cleaner look
  kakaoMap.setZoomable(true);

  // Draw markers for this region
  drawMarkers(region, 'all');
}

/* ── CUSTOM MARKER OVERLAY ── */
function makeCatColor(cat) {
  const colors = { '逛逛逛': '#7EC8E3', '衣食行': '#F4A460', 'SVT': '#9B7EC8', 'PLAVE': '#7EC8A0' };
  return colors[cat] || '#aaa';
}
function makeCatIcon(cat) {
  const icons = { '逛逛逛': '🛍️', '衣食行': '🍽️', 'SVT': '💎', 'PLAVE': '🎮' };
  return icons[cat] || '📌';
}

function clearMarkers() {
  kakaoOverlays.forEach(o => o.setMap(null));
  kakaoOverlays = [];
}

function drawMarkers(region, cat) {
  clearMarkers();

  let places = PLACES.filter(p => p.region === region.id);
  if (cat && cat !== 'all') places = places.filter(p => p.category === cat);

  places.forEach(p => {
    const color = makeCatColor(p.category);
    const icon = makeCatIcon(p.category);
    const kUrl = `https://map.kakao.com/link/map/${encodeURIComponent(p.nameKo)},${p.lat},${p.lng}`;

    const content = `
      <div style="
        position:relative;
        display:flex; flex-direction:column; align-items:center;
        cursor:pointer;
      ">
        <div style="
          width:32px; height:32px; border-radius:50%;
          background:${color}; border:2.5px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          display:flex; align-items:center; justify-content:center;
          font-size:15px;
        ">${icon}</div>
        <div style="
          width:0; height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:7px solid ${color};
          margin-top:-1px;
        "></div>
      </div>`;

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content,
      yAnchor: 1,
    });

    overlay.setMap(kakaoMap);
    kakaoOverlays.push(overlay);
  });

  // Accommodation marker (home icon) if in this region
  const a = ACCOMMODATION;
  const inRegion =
    a.lat >= region.bounds.minLat && a.lat <= region.bounds.maxLat &&
    a.lng >= region.bounds.minLng && a.lng <= region.bounds.maxLng;

  if (inRegion) {
    const homeContent = `
      <div style="
        width:38px; height:38px; border-radius:50%;
        background:#E8956D; border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex; align-items:center; justify-content:center;
        font-size:18px;
      ">🏠</div>`;
    const homeOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(a.lat, a.lng),
      content: homeContent,
      yAnchor: 0.5,
    });
    homeOverlay.setMap(kakaoMap);
    kakaoOverlays.push(homeOverlay);
  }
}

/* ── SUBWAY CHIPS ── */
function renderSubwayChips(region) {
  const wrap = document.getElementById('subway-chips');
  if (!region.subways || region.subways.length === 0) {
    wrap.innerHTML = '';
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
  const regionPlaces = PLACES.filter(p => p.region === region.id);
  const cats = [...new Set(regionPlaces.map(p => p.category))];

  const catDefs = {
    '逛逛逛': { icon: '🛍️', label: '逛逛逛' },
    '衣食行':  { icon: '🍽️', label: '餐廳食物' },
    'SVT':    { icon: '💎', label: 'SVT' },
    'PLAVE':  { icon: '🎮', label: 'PLAVE' },
  };

  let html = `<div class="cat-tab active" data-cat="all">
    <span class="ct-icon">🗺️</span>
    <span class="ct-label">全部</span>
  </div>`;

  cats.forEach(c => {
    const d = catDefs[c] || { icon: '📌', label: c };
    html += `<div class="cat-tab" data-cat="${c}">
      <span class="ct-icon">${d.icon}</span>
      <span class="ct-label">${d.label}</span>
    </div>`;
  });

  wrap.innerHTML = html;
  currentCategory = 'all';

  wrap.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      wrap.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      drawMarkers(currentRegion, currentCategory);
      renderPlaceList(currentRegion, currentCategory);
    });
  });
}

/* ── PLACE LIST ── */
function renderPlaceList(region, cat) {
  const wrap = document.getElementById('place-list');
  let places = PLACES.filter(p => p.region === region.id);
  if (cat && cat !== 'all') places = places.filter(p => p.category === cat);

  const catBg = { '逛逛逛': '#E3F5FB', '衣食行': '#FEF3E2', 'SVT': '#F0EBF8', 'PLAVE': '#E8F5EC' };

  if (places.length === 0) {
    wrap.innerHTML = `<p style="color:var(--text-light);font-size:13px;text-align:center;padding:24px">此區域無相關地點</p>`;
    return;
  }

  wrap.innerHTML = places.map((p, i) => {
    const icon = makeCatIcon(p.category);
    const bg = catBg[p.category] || '#f5f5f5';
    const kUrl = `https://map.kakao.com/link/map/${encodeURIComponent(p.nameKo)},${p.lat},${p.lng}`;
    const addrHtml = p.address
      ? `<div class="place-card-address">📍 ${p.address}</div>`
      : `<div class="place-card-address empty">地址待填</div>`;
    const noteHtml = p.note
      ? `<div class="place-card-note ${p.note.includes('BOOKED') ? 'booked' : ''}">${p.note}</div>`
      : '';

    return `<div class="place-card" style="animation-delay:${i * 0.035}s">
      <div class="place-card-icon" style="background:${bg}">${icon}</div>
      <div class="place-card-body">
        <div class="place-card-names">
          ${p.nameCn}
          <span class="ko">${p.nameKo}</span>
        </div>
        ${addrHtml}
        ${noteHtml}
      </div>
      <a class="place-kakao-btn" href="${kUrl}" target="_blank" rel="noopener" title="在Kakao Map查看">🗺️</a>
    </div>`;
  }).join('');
}

/* ── REGION GRID ── */
function renderRegionGrid() {
  const grid = document.getElementById('region-grid');
  const catColors = { '逛逛逛': '#7EC8E3', '衣食行': '#F4A460', 'SVT': '#9B7EC8', 'PLAVE': '#7EC8A0' };

  grid.innerHTML = REGIONS.map(r => {
    const count = PLACES.filter(p => p.region === r.id).length;
    const cats = [...new Set(PLACES.filter(p => p.region === r.id).map(p => p.category))];
    const dots = cats.map(c =>
      `<span class="rc-cat-dot" style="background:${catColors[c]}"></span>`
    ).join('');

    return `<div class="region-card" data-region="${r.id}">
      <div class="rc-color-bar" style="background:var(--region-${r.id})"></div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-ko">${r.nameKo}</div>
      <div class="rc-count">${dots} ${count} 個地點</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.region-card').forEach(card => {
    card.addEventListener('click', () => navigateToRegion(card.dataset.region));
  });
}

/* ── NAVIGATION ── */
function navigateToRegion(regionId) {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return;
  currentRegion = region;

  document.getElementById('header-title').textContent = region.name;
  document.getElementById('header-sub').textContent = region.nameKo;
  document.getElementById('back-btn').style.display = 'flex';

  showPage('region');

  // Init map after page is visible
  requestAnimationFrame(() => {
    setTimeout(() => {
      initKakaoMap(region);
      renderSubwayChips(region);
      renderCatTabs(region);
      renderPlaceList(region, 'all');
    }, 80);
  });
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  document.getElementById('back-btn').addEventListener('click', () => {
    showPage('home');
    document.getElementById('header-title').textContent = '首爾旅遊地圖';
    document.getElementById('header-sub').textContent = '5月24日—31日';
    document.getElementById('back-btn').style.display = 'none';
    clearMarkers();
    kakaoMap = null;
  });

  renderRegionGrid();
});
