/* ── APP STATE ── */
let currentPage = 'home';
let currentRegion = null;
let currentCategory = null;

/* ── GEO HELPERS ── */
// Seoul viewport: lat 37.46–37.59, lng 126.88–127.14
const MAP_BOUNDS = {
  minLat: 37.46, maxLat: 37.595,
  minLng: 126.86, maxLng: 127.14
};

function toSVG(lat, lng, w, h, bounds) {
  const x = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng) * w;
  const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * h;
  return { x, y };
}

/* ── KAKAO MAP URL ── */
function kakaoUrl(lat, lng, name) {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
}

/* ── RENDER OVERVIEW MAP ── */
function renderOverviewMap() {
  const svg = document.getElementById('overview-svg');
  const W = svg.viewBox.baseVal.width || 390;
  const H = svg.viewBox.baseVal.height || 220;
  const B = MAP_BOUNDS;

  let html = '';

  // Draw region blobs
  REGIONS.forEach(r => {
    const tl = toSVG(r.bounds.maxLat, r.bounds.minLng, W, H, B);
    const br = toSVG(r.bounds.minLat, r.bounds.maxLng, W, H, B);
    const rw = br.x - tl.x, rh = br.y - tl.y;
    const colorVar = `--region-${r.id}`;
    html += `<rect x="${tl.x.toFixed(1)}" y="${tl.y.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}"
      rx="8" fill="var(${colorVar})" opacity="0.75"
      data-region="${r.id}" class="region-blob" style="cursor:pointer"/>`;
    // Label
    const cx = (tl.x + br.x) / 2, cy = (tl.y + br.y) / 2;
    html += `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
      font-size="9" font-weight="700" fill="#3D2B1F" opacity="0.8" pointer-events="none"
      style="font-family:'Noto Sans TC',sans-serif">${r.name}</text>`;
  });

  // Accommodation star
  const acc = toSVG(ACCOMMODATION.lat, ACCOMMODATION.lng, W, H, B);
  html += `<circle cx="${acc.x.toFixed(1)}" cy="${acc.y.toFixed(1)}" r="8" fill="#E8956D" opacity="0.95"/>`;
  html += `<text x="${acc.x.toFixed(1)}" y="${acc.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
    font-size="10" pointer-events="none">🏠</text>`;

  // Place dots
  PLACES.forEach(p => {
    const pt = toSVG(p.lat, p.lng, W, H, B);
    const catColors = { '逛逛逛': '#7EC8E3', '衣食行': '#F4A460', 'SVT': '#9B7EC8', 'PLAVE': '#7EC8A0' };
    const c = catColors[p.category] || '#aaa';
    html += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3" fill="${c}" opacity="0.85" pointer-events="none"/>`;
  });

  svg.innerHTML = html;

  // Click to navigate
  svg.querySelectorAll('.region-blob').forEach(el => {
    el.addEventListener('click', () => navigateToRegion(el.dataset.region));
  });
}

/* ── RENDER REGION MAP ── */
function renderRegionMap(region) {
  const svg = document.getElementById('region-svg');
  if (!svg) return;
  const W = 390, H = 240;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Expand bounds a bit for context
  const pad = 0.008;
  const B = {
    minLat: region.bounds.minLat - pad,
    maxLat: region.bounds.maxLat + pad,
    minLng: region.bounds.minLng - pad,
    maxLng: region.bounds.maxLng + pad,
  };

  let html = `<rect width="${W}" height="${H}" fill="#EDE0D4"/>`;

  // Region fill
  const tl = toSVG(region.bounds.maxLat, region.bounds.minLng, W, H, B);
  const br = toSVG(region.bounds.minLat, region.bounds.maxLng, W, H, B);
  html += `<rect x="${tl.x.toFixed(1)}" y="${tl.y.toFixed(1)}" width="${(br.x-tl.x).toFixed(1)}" height="${(br.y-tl.y).toFixed(1)}"
    rx="10" fill="var(--region-${region.id})" opacity="0.5"/>`;

  // Subway stations
  region.subways.forEach(s => {
    const pt = toSVG(s.lat, s.lng, W, H, B);
    html += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="7" fill="${s.color}" opacity="0.85"/>`;
    html += `<text x="${pt.x.toFixed(1)}" y="${(pt.y + 14).toFixed(1)}" text-anchor="middle"
      font-size="8" fill="#3D2B1F" font-weight="600" opacity="0.9"
      style="font-family:'Noto Sans KR',sans-serif">${s.name}</text>`;
  });

  // Accommodation if in region
  const accInRegion =
    ACCOMMODATION.lat >= region.bounds.minLat && ACCOMMODATION.lat <= region.bounds.maxLat &&
    ACCOMMODATION.lng >= region.bounds.minLng && ACCOMMODATION.lng <= region.bounds.maxLng;
  if (accInRegion) {
    const apt = toSVG(ACCOMMODATION.lat, ACCOMMODATION.lng, W, H, B);
    html += `<circle cx="${apt.x.toFixed(1)}" cy="${apt.y.toFixed(1)}" r="10" fill="#E8956D"/>`;
    html += `<text x="${apt.x.toFixed(1)}" y="${apt.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
      font-size="12" pointer-events="none">🏠</text>`;
  }

  // Places in this region
  const regionPlaces = PLACES.filter(p => p.region === region.id);
  const catColors = { '逛逛逛': '#7EC8E3', '衣食行': '#F4A460', 'SVT': '#9B7EC8', 'PLAVE': '#7EC8A0' };

  regionPlaces.forEach(p => {
    const pt = toSVG(p.lat, p.lng, W, H, B);
    const c = catColors[p.category] || '#aaa';
    html += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="5" fill="${c}" stroke="white" stroke-width="1.5" opacity="0.9"/>`;
  });

  svg.innerHTML = html;
}

/* ── RENDER SUBWAY CHIPS ── */
function renderSubwayChips(region) {
  const wrap = document.getElementById('subway-chips');
  if (!wrap) return;
  if (region.subways.length === 0) {
    wrap.innerHTML = `<span style="font-size:12px;color:var(--text-light)">無地鐵站資訊</span>`;
    return;
  }
  wrap.innerHTML = region.subways.map(s =>
    `<div class="subway-chip">
      <span class="line-dot" style="background:${s.color}"></span>
      <span>${s.name} (${s.line}號線)</span>
    </div>`
  ).join('');
}

/* ── RENDER CATEGORY TABS ── */
function renderCatTabs(region) {
  const wrap = document.getElementById('cat-tabs');
  if (!wrap) return;

  const regionPlaces = PLACES.filter(p => p.region === region.id);
  const cats = [...new Set(regionPlaces.map(p => p.category))];

  const all = { icon: '🗺️', label: '全部' };
  const catDefs = {
    '逛逛逛': { icon: '🛍️', label: '逛逛逛' },
    '衣食行':  { icon: '🍽️', label: '餐廳食物' },
    'SVT':    { icon: '💎', label: 'SVT' },
    'PLAVE':  { icon: '🎮', label: 'PLAVE' },
  };

  let html = `<div class="cat-tab active" data-cat="all">
    <span class="ct-icon">${all.icon}</span>
    <span class="ct-label">${all.label}</span>
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
      renderPlaceList(region, currentCategory);
    });
  });
}

/* ── RENDER PLACE LIST ── */
function renderPlaceList(region, cat) {
  const wrap = document.getElementById('place-list');
  if (!wrap) return;

  let places = PLACES.filter(p => p.region === region.id);
  if (cat && cat !== 'all') places = places.filter(p => p.category === cat);

  const catIcons = { '逛逛逛': '🛍️', '衣食行': '🍽️', 'SVT': '💎', 'PLAVE': '🎮' };
  const catBg = { '逛逛逛': '#E3F5FB', '衣食行': '#FEF3E2', 'SVT': '#F0EBF8', 'PLAVE': '#E8F5EC' };

  if (places.length === 0) {
    wrap.innerHTML = `<p style="color:var(--text-light);font-size:13px;text-align:center;padding:24px">此區域無相關地點</p>`;
    return;
  }

  wrap.innerHTML = places.map((p, i) => {
    const icon = catIcons[p.category] || '📌';
    const bg = catBg[p.category] || '#f5f5f5';
    const addrHtml = p.address
      ? `<div class="place-card-address">📍 ${p.address}</div>`
      : `<div class="place-card-address empty">地址待填</div>`;
    const noteHtml = p.note
      ? `<div class="place-card-note ${p.note.includes('BOOKED') ? 'booked' : ''}">${p.note}</div>`
      : '';
    const kUrl = kakaoUrl(p.lat, p.lng, p.nameKo);

    return `<div class="place-card" style="animation-delay:${i * 0.04}s">
      <div class="place-card-icon" style="background:${bg}">${icon}</div>
      <div class="place-card-body">
        <div class="place-card-names">
          ${p.nameCn}
          <span class="ko">${p.nameKo}</span>
        </div>
        ${addrHtml}
        ${noteHtml}
      </div>
      <a class="kakao-btn" href="${kUrl}" target="_blank" rel="noopener">
        <span class="kb-icon">🗺</span>
        <span>Kakao</span>
      </a>
    </div>`;
  }).join('');
}

/* ── NAVIGATION ── */
function navigateToRegion(regionId) {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return;
  currentRegion = region;

  // Update region page header
  document.getElementById('region-title').textContent = region.name;
  document.getElementById('region-subtitle').textContent = region.nameKo;

  // Render components
  renderRegionMap(region);
  renderSubwayChips(region);
  renderCatTabs(region);
  renderPlaceList(region, 'all');

  // Switch page
  showPage('region');
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');

  // Header
  const backBtn = document.getElementById('back-btn');
  if (pageId === 'home') {
    backBtn.style.display = 'none';
    document.getElementById('header-title').textContent = '首爾旅遊地圖';
    document.getElementById('header-sub').textContent = '5月24日—31日';
  } else {
    backBtn.style.display = 'flex';
  }

  currentPage = pageId;
}

/* ── REGION CARD COUNT ── */
function getRegionCount(regionId) {
  return PLACES.filter(p => p.region === regionId).length;
}

/* ── RENDER HOME REGION GRID ── */
function renderRegionGrid() {
  const grid = document.getElementById('region-grid');
  const catColors = { '逛逛逛': '#7EC8E3', '衣食行': '#F4A460', 'SVT': '#9B7EC8', 'PLAVE': '#7EC8A0' };

  grid.innerHTML = REGIONS.map(r => {
    const count = getRegionCount(r.id);
    const cats = [...new Set(PLACES.filter(p => p.region === r.id).map(p => p.category))];
    const dots = cats.map(c => `<span class="rc-dot" style="background:${catColors[c]}"></span>`).join('');

    return `<div class="region-card" data-region="${r.id}"
        style="border-top-color:var(--region-${r.id})">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:var(--region-${r.id});border-radius:8px 8px 0 0"></div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-ko">${r.nameKo}</div>
      <div class="rc-count">${dots}${count} 個地點</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.region-card').forEach(card => {
    card.addEventListener('click', () => navigateToRegion(card.dataset.region));
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  document.getElementById('back-btn').addEventListener('click', () => {
    showPage('home');
  });

  renderRegionGrid();
  showPage('home');

  // Defer map render after layout
  requestAnimationFrame(() => {
    const svg = document.getElementById('overview-svg');
    svg.setAttribute('viewBox', '0 0 390 220');
    renderOverviewMap();
  });
});
