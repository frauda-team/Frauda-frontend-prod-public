/* ══════════════════════════════════════════════════════════════════════
   dashboard.js — Logic for dashboard.html (analytics dashboard)
   Dashboard visuals are derived from FraudaData.dashboardStats()/filterDashboardBy()
   (primary source: data/dashboard_graph.csv; fallback: derived from scenarios.csv).
══════════════════════════════════════════════════════════════════════ */

// ── Strategy colour palette ────────────────────────────────────────────
const STRATEGY_COLORS = [
  '#b91c1c', '#d97706', '#9333ea', '#2563eb', '#0891b2', '#15803d', '#6d28d9', '#0f766e',
];

// ── Computed from FraudaData.dashboardStats() ─────────────────────────
let STATS = null;
let FILTERED_SCENARIOS = [];

function i18nT(key, vars) {
  if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') {
    return window.FraudaI18n.t(key, vars);
  }
  return key;
}

function getFilters() {
  const read = id => (document.getElementById(id).value || 'all');
  const mapVal = v => (v === 'all' ? undefined : v);
  return {
    date: mapVal(read('fDate')),
    ageGroup: mapVal(read('fAge')),
    gender: mapVal(read('fGender')),
    fraud_type: mapVal(read('fType')),
    channel: mapVal(read('fChannel')),
    caller_origin: mapVal(read('fRegion')),
  };
}

function ageGroupOf(age) {
  if (age <= 24) return '18–24';
  if (age <= 34) return '25–34';
  if (age <= 49) return '35–49';
  if (age <= 64) return '50–64';
  return '65+';
}

function getKeywordCloud() {
  const counts = new Map();
  FILTERED_SCENARIOS.forEach(s => {
    FraudaData.parseIndicators(s.indicators).forEach(ind => {
      const key = ind.label;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([text, count]) => ({
      text,
      count,
      risk: count >= 4 ? 'h' : count >= 2 ? 'm' : 'l'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);
}

function getDynamicInsights() {
  if (!FILTERED_SCENARIOS.length) return [];
  const total = STATS.total || 1;
  const topStrategy = STATS.strategies[0];
  const topOrigin = Object.entries(STATS.byOrigin).sort((a, b) => b[1] - a[1])[0];
  const topAge = Object.entries(STATS.byAgeGroup).sort((a, b) => b[1] - a[1])[0];
  const peakHour = STATS.byHour.indexOf(Math.max(...STATS.byHour));
  const peakCount = STATS.byHour[peakHour] || 0;
  const topLang = Object.entries(STATS.byLang).sort((a, b) => b[1] - a[1])[0];
  const langLabelMap = { lv: i18nT('index.lang.lv'), ru: i18nT('index.lang.ru'), en: i18nT('index.lang.en') };

  return [
    {
      cls: 'red',
      icon: '⚠',
      title: i18nT('dashboard.dynamic.top_strategy.title'),
      text: topStrategy ? i18nT('dashboard.dynamic.top_strategy.text', {
        label: topStrategy.label, pct: topStrategy.pct, count: topStrategy.count
      }) : i18nT('dashboard.no_data')
    },
    {
      cls: 'amber',
      icon: '◉',
      title: i18nT('dashboard.dynamic.top_origin.title'),
      text: topOrigin ? i18nT('dashboard.dynamic.top_origin.text', {
        origin: topOrigin[0], pct: Math.round((topOrigin[1] / total) * 100)
      }) : i18nT('dashboard.no_data')
    },
    {
      cls: 'blue',
      icon: '↑',
      title: i18nT('dashboard.dynamic.high_risk.title'),
      text: i18nT('dashboard.dynamic.high_risk.text', {
        pct: Math.round((STATS.highRisk / total) * 100)
      })
    },
    {
      cls: 'green',
      icon: '⌁',
      title: i18nT('dashboard.dynamic.top_age.title'),
      text: topAge ? i18nT('dashboard.dynamic.top_age.text', {
        age: topAge[0], pct: Math.round((topAge[1] / total) * 100)
      }) : i18nT('dashboard.no_data')
    },
    {
      cls: 'amber',
      icon: '⏱',
      title: i18nT('dashboard.dynamic.peak_hour.title'),
      text: i18nT('dashboard.dynamic.peak_hour.text', {
        hour: String(peakHour).padStart(2, '0'), count: peakCount
      })
    },
    {
      cls: 'red',
      icon: '◈',
      title: i18nT('dashboard.dynamic.language_mix.title'),
      text: topLang ? i18nT('dashboard.dynamic.language_mix.text', {
        lang: langLabelMap[topLang[0]] || topLang[0], pct: Math.round((topLang[1] / total) * 100)
      }) : i18nT('dashboard.no_data')
    }
  ];
}

function getDynamicAlerts() {
  if (!FILTERED_SCENARIOS.length) return [];
  const total = STATS.total || 1;
  const highPct = Math.round((STATS.highRisk / total) * 100);
  const topStrategy = STATS.strategies[0];
  const voicePct = Math.round(((STATS.byType.voice || 0) / total) * 100);
  const smsPct = Math.round(((STATS.byType.sms || 0) / total) * 100);
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return [
    {
      sev: highPct >= 50 ? 'crit' : 'warn',
      text: i18nT('dashboard.dynamic.alert.high_risk', {
        high: STATS.highRisk, total, pct: highPct
      }),
      ts
    },
    {
      sev: topStrategy && topStrategy.pct >= 40 ? 'crit' : 'info',
      text: topStrategy ? i18nT('dashboard.dynamic.alert.top_strategy', {
        label: topStrategy.label, count: topStrategy.count
      }) : i18nT('dashboard.no_data'),
      ts
    },
    {
      sev: 'info',
      text: i18nT('dashboard.dynamic.alert.channel_mix', { voice: voicePct, sms: smsPct }),
      ts
    }
  ];
}

/* ══════════════════════════════════════════════════════════════════════
   RENDER FUNCTIONS — all data-driven from STATS
══════════════════════════════════════════════════════════════════════ */

function renderTimestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const ts  = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('lastSync').textContent = `${i18nT('dashboard.timestamp.last_sync')} ${ts}`;
  document.getElementById('alertTs').textContent  = `${i18nT('dashboard.timestamp.as_of')} ${ts}`;
}

// ── KPI cards ─────────────────────────────────────────────────────────
function renderKPIs() {
  const s = STATS;
  document.getElementById('kpi1').textContent = s.total;
  document.getElementById('kpi2').textContent = s.highRisk;
  document.getElementById('kpi3').textContent = s.strategies.length;
  document.getElementById('kpi6').textContent = s.avgScore.toFixed(1) + '%';
  if (!s.total) {
    document.getElementById('kpiAge').textContent = '—';
    document.getElementById('kpiAgeSub').textContent = '—';
    document.getElementById('kpiPeak').textContent = '—';
    document.getElementById('kpiPeakSub').textContent = '—';
    return;
  }

  // Most targeted age group (highest count in byAgeGroup)
  const topAge = Object.entries(s.byAgeGroup).sort((a, b) => b[1] - a[1])[0];
  const topAgePct = Math.round(topAge[1] / s.total * 100);
  document.getElementById('kpiAge').textContent  = topAge[0];
  document.getElementById('kpiAgeSub').textContent = i18nT('dashboard.kpi.age_sub', {
    count: topAge[1], total: s.total, pct: topAgePct
  });

  // Peak hour
  const peakHour = s.byHour.indexOf(Math.max(...s.byHour));
  document.getElementById('kpiPeak').textContent    = peakHour.toString().padStart(2, '0') + ':00';
  document.getElementById('kpiPeakSub').textContent = i18nT('dashboard.kpi.peak_window', {
    from: `${String(Math.max(0, peakHour - 1)).padStart(2, '0')}:00`,
    to: `${String(Math.min(23, peakHour + 2)).padStart(2, '0')}:00`
  });
}

// ── Hourly SVG area chart ──────────────────────────────────────────────
function renderHourChart() {
  const svg  = document.getElementById('hourChart');
  const data = STATS.byHour;
  if (!STATS.total) {
    svg.innerHTML = '';
    return;
  }
  const W = 560, H = 160, padL = 6, padR = 6, padT = 14, padB = 8;
  const max = Math.max(...data, 1);
  const n   = data.length;

  const x = i => padL + (i / (n - 1)) * (W - padL - padR);
  const y = v => padT + (1 - v / max) * (H - padT - padB);

  const pts      = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const linePath = `M ${pts.split(' ').join(' L ')}`;
  const areaPath = `M ${x(0)},${y(data[0])} L ${pts.split(' ').join(' L ')} L ${x(n - 1)},${H - padB} L ${x(0)},${H - padB} Z`;

  const peakHour = data.indexOf(Math.max(...data));
  const px1 = x(Math.max(0, peakHour - 1));
  const px2 = x(Math.min(23, peakHour + 1));

  svg.innerHTML = `
    <defs>
      <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#1d4ed8" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#1d4ed8" stop-opacity=".01"/>
      </linearGradient>
    </defs>
    <rect x="${px1}" y="${padT}" width="${px2 - px1}" height="${H - padT - padB}" fill="#fef3c7" opacity=".55"/>
    <path d="${areaPath}" fill="url(#aG)"/>
    <path d="${linePath}" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${data.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#1d4ed8" opacity=".7"
      data-tip="${i18nT('dashboard.hour.tooltip', { hour: String(i).padStart(2, '0'), count: v })}"/>`).join('')}
    <text x="${(px1 + px2) / 2}" y="${padT + 10}" text-anchor="middle" font-size="9" fill="#b45309"
      font-family="IBM Plex Sans,sans-serif" font-weight="600">${i18nT('dashboard.hour.peak')}</text>`;

  svg.querySelectorAll('circle').forEach(el => {
    el.addEventListener('mouseenter', e => showTip(e, el.dataset.tip));
    el.addEventListener('mouseleave', hideTip);
  });
}

// ── Strategy bars ──────────────────────────────────────────────────────
function renderStratChart() {
  const strategies = STATS.strategies;
  if (!strategies.length) {
    document.getElementById('stratChart').innerHTML = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
    return;
  }
  document.getElementById('stratChart').innerHTML = strategies.map((s, i) => {
    const color = STRATEGY_COLORS[i % STRATEGY_COLORS.length];
    return `
      <div class="strat-row">
        <div class="strat-rank">${i + 1}</div>
        <div class="strat-label" translate="no">${s.label}</div>
        <div class="strat-track">
          <div class="strat-fill" style="width:${s.pct}%;background:${color}22;border-right:2px solid ${color}"></div>
        </div>
        <div class="strat-pct">${s.pct}%</div>
        <div class="strat-trend up">↑</div>
      </div>`;
  }).join('');
}

// ── Age grouped bars ───────────────────────────────────────────────────
function renderAgeChart() {
  const ageGroups   = ['18–24', '25–34', '35–49', '50–64', '65+'];
  const s           = STATS;
  const ageXFraud   = s.ageXFraud;
  const fraudLabels = s.strategies.slice(0, 4).map(x => x.label); // top 4 fraud types
  if (!fraudLabels.length) {
    document.getElementById('ageLegend').innerHTML = '';
    document.getElementById('ageChart').innerHTML = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
    return;
  }
  const colors      = STRATEGY_COLORS.slice(0, 4);

  document.getElementById('ageLegend').innerHTML = fraudLabels.map((t, i) =>
    `<div class="g-leg-item"><div class="g-leg-dot" style="background:${colors[i]}"></div>${t}</div>`
  ).join('');

  const allValues = ageGroups.flatMap(ag =>
    fraudLabels.map(fl => (ageXFraud[ag] && ageXFraud[ag][fl]) || 0)
  );
  const maxVal = Math.max(...allValues, 1);

  document.getElementById('ageChart').innerHTML = ageGroups.map(ag => {
    const bars = fraudLabels.map((fl, ti) => {
      const v = (ageXFraud[ag] && ageXFraud[ag][fl]) || 0;
      return `
        <div class="age-bar-wrap">
          <div class="age-bar" style="background:${colors[ti]};width:${Math.round(v / maxVal * 100)}%;opacity:.85"
            data-tip="${i18nT('dashboard.age.tooltip', { age: ag, fraud: fl, count: v })}"></div>
        </div>`;
    }).join('');
    return `
      <div class="age-row">
        <div class="age-label">${ag}</div>
        <div class="age-bars">${bars}</div>
      </div>`;
  }).join('');

  document.getElementById('ageChart').querySelectorAll('.age-bar').forEach(el => {
    el.addEventListener('mouseenter', e => showTip(e, el.dataset.tip));
    el.addEventListener('mouseleave', hideTip);
  });
}

// ── Gender stacked bars ────────────────────────────────────────────────
function renderGenderChart() {
  const genders     = ['male', 'female'];
  const genderLabels = {
    male: i18nT('dashboard.gender.male'),
    female: i18nT('dashboard.gender.female')
  };
  const s           = STATS;
  const gXF         = s.genderXFraud;
  const fraudLabels = s.strategies.slice(0, 4).map(x => x.label);
  if (!fraudLabels.length) {
    document.getElementById('genderLegend').innerHTML = '';
    document.getElementById('genderChart').innerHTML = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
    return;
  }
  const colors      = STRATEGY_COLORS.slice(0, 4);

  document.getElementById('genderLegend').innerHTML = fraudLabels.map((t, i) =>
    `<div class="g-leg-item"><div class="g-leg-dot" style="background:${colors[i]}"></div>${t}</div>`
  ).join('');

  document.getElementById('genderChart').innerHTML = genders.map(g => {
    const row   = gXF[g] || {};
    const total = fraudLabels.reduce((a, fl) => a + (row[fl] || 0), 0) || 1;
    const segs  = fraudLabels.map((fl, ti) => {
      const v   = row[fl] || 0;
      const pct = Math.round(v / total * 100);
      return `<div class="gender-seg" style="background:${colors[ti]};flex:${Math.max(v, 0.5)}"
        data-tip="${i18nT('dashboard.gender.tooltip', { gender: genderLabels[g], fraud: fl, pct })}">${pct > 8 ? pct + '%' : ''}</div>`;
    }).join('');
    return `<div class="gender-row">
      <div class="gender-label">${genderLabels[g]}</div>
      <div class="gender-bars">${segs}</div>
    </div>`;
  }).join('');

  document.getElementById('genderChart').querySelectorAll('.gender-seg').forEach(el => {
    el.addEventListener('mouseenter', e => showTip(e, el.dataset.tip));
    el.addEventListener('mouseleave', hideTip);
  });
}

// ── Keywords ───────────────────────────────────────────────────────────
function renderKeywords() {
  const keywords = getKeywordCloud();
  if (!keywords.length) {
    document.getElementById('kwGrid').innerHTML = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
    return;
  }
  document.getElementById('kwGrid').innerHTML = keywords.map(k =>
    `<span class="kw-tag ${k.risk}" translate="no"
      data-tip="${i18nT('dashboard.keyword.tooltip', { count: k.count.toLocaleString() })}">
      ${k.text}<span class="kw-count">${k.count.toLocaleString()}</span>
    </span>`
  ).join('');
  document.getElementById('kwGrid').querySelectorAll('.kw-tag').forEach(el => {
    el.addEventListener('mouseenter', e => showTip(e, el.dataset.tip));
    el.addEventListener('mouseleave', hideTip);
  });
}

// ── Mini bar helper ────────────────────────────────────────────────────
function miniBarSet(data) {
  const max = Math.max(...data.map(d => d.v), 1);
  return data.map(d => `
    <div class="mini-bar-row">
      <div class="mini-bar-label">${d.l}</div>
      <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.round(d.v / max * 100)}%;background:${d.c}"></div></div>
      <div class="mini-bar-val">${d.v}%</div>
    </div>`).join('');
}

// ── Metadata tiles ─────────────────────────────────────────────────────
function renderMetaTiles() {
  const s = STATS;
  const total = s.total;
  if (!total) {
    document.getElementById('metaTiles').innerHTML = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
    return;
  }

  // Origin
  const originColors = { 'LV (VoIP)': '#b91c1c', 'LV (Mobilais)': '#d97706', 'LV (Fiksētais)': '#2563eb', 'LV (Īssavilkums)': '#15803d', 'LT (Mobilais)': '#9333ea' };
  const metaOrigin = Object.entries(s.byOrigin).map(([l, v]) => ({
    l, v: Math.round(v / total * 100), c: originColors[l] || '#9ca3af',
  })).sort((a, b) => b.v - a.v);

  // Channel
  const metaChannel = [
    { l: i18nT('dashboard.channel.voice'), v: Math.round(s.byType.voice / total * 100), c: '#7c3aed' },
    { l: i18nT('dashboard.channel.sms'), v: Math.round(s.byType.sms / total * 100), c: '#0891b2' },
  ];

  // Language
  const langColors = { lv: '#1d4ed8', ru: '#d97706', en: '#15803d' };
  const langLabels = {
    lv: i18nT('index.lang.lv'),
    ru: i18nT('index.lang.ru'),
    en: i18nT('index.lang.en')
  };
  const metaLang = Object.entries(s.byLang).map(([l, v]) => ({
    l: langLabels[l] || l, v: Math.round(v / total * 100), c: langColors[l] || '#9ca3af',
  })).sort((a, b) => b.v - a.v);

  // Weekday — distribute from hourly data heuristically
  const wdLabels = [
    i18nT('dashboard.weekday.mon'),
    i18nT('dashboard.weekday.tue'),
    i18nT('dashboard.weekday.wed'),
    i18nT('dashboard.weekday.thu'),
    i18nT('dashboard.weekday.fri'),
    i18nT('dashboard.weekday.sat'),
    i18nT('dashboard.weekday.sun')
  ];
  const wdValues = [0, 0, 0, 0, 0, 0, 0];
  FILTERED_SCENARIOS.forEach(row => {
    const day = new Date(row.timestamp).getDay(); // 0=Sun
    const idx = day === 0 ? 6 : day - 1;
    wdValues[idx]++;
  });
  const wdMax    = Math.max(...wdValues);
  const wdBars   = wdLabels.map((d, i) => `
    <div class="wd-col">
      <div class="wd-val">${wdValues[i]}</div>
      <div class="wd-bar" style="height:${Math.round(wdValues[i] / wdMax * 64)}px;background:${wdValues[i] === wdMax ? '#1d4ed8' : '#93c5fd'}"></div>
      <div class="wd-label">${d}</div>
    </div>`).join('');

  document.getElementById('metaTiles').innerHTML = `
    <div class="meta-tile">
      <div class="meta-tile-label">${i18nT('dashboard.meta.origin')}</div>
      ${miniBarSet(metaOrigin)}
    </div>
    <div class="meta-tile">
      <div class="meta-tile-label">${i18nT('dashboard.meta.channel_split')}</div>
      ${miniBarSet(metaChannel)}
      <div style="margin-top:8px">
        <div class="meta-tile-label">${i18nT('dashboard.meta.language')}</div>
        ${miniBarSet(metaLang)}
      </div>
    </div>
    <div class="meta-tile">
      <div class="meta-tile-label">${i18nT('dashboard.meta.weekday_activity')}</div>
      <div class="weekday-bars">${wdBars}</div>
    </div>`;
}

// ── Intelligence cards ─────────────────────────────────────────────────
function renderIntel() {
  const intelCards = getDynamicInsights();
  if (!intelCards.length) {
    document.getElementById('intelGrid').innerHTML = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
    return;
  }
  document.getElementById('intelGrid').innerHTML = intelCards.map(c => `
    <div class="intel-card ${c.cls}">
      <div class="intel-icon">${c.icon}</div>
      <div class="intel-text"><strong>${c.title}</strong><span>${c.text}</span></div>
    </div>`).join('');
}

// ── Alerts ─────────────────────────────────────────────────────────────
function renderAlerts() {
  const alerts = getDynamicAlerts();
  if (!alerts.length) {
    document.getElementById('alertList').innerHTML = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
    return;
  }
  document.getElementById('alertList').innerHTML = alerts.map(a => `
    <div class="alert-item ${a.sev}">
      <span class="alert-badge ${a.sev}">${a.sev === 'crit' ? i18nT('dashboard.alert.level.crit') : a.sev === 'warn' ? i18nT('dashboard.alert.level.warn') : i18nT('dashboard.alert.level.info')}</span>
      <span class="alert-text">${a.text}</span>
      <span class="alert-ts">${a.ts}</span>
    </div>`).join('');
}

function renderTable() {
  if (!STATS.strategies.length) {
    document.getElementById('tableBody').innerHTML = `<tr><td colspan="7" class="section-meta">${i18nT('dashboard.table.no_data')}</td></tr>`;
    return;
  }
  const rows = STATS.strategies.map(s => {
    const matching = FILTERED_SCENARIOS.filter(row => row.fraud_type === s.type);
    const ageCounts = {};
    const indicatorCounts = {};
    const hourCounts = {};
    const riskCounts = { red: 0, yellow: 0, green: 0 };
    matching.forEach(row => {
      const age = ageGroupOf(row.age);
      ageCounts[age] = (ageCounts[age] || 0) + 1;
      riskCounts[row.risk] = (riskCounts[row.risk] || 0) + 1;
      const hour = new Date(row.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      FraudaData.parseIndicators(row.indicators).forEach(ind => {
        indicatorCounts[ind.label] = (indicatorCounts[ind.label] || 0) + 1;
      });
    });
    const topAge = Object.entries(ageCounts).sort((a, b) => b[1] - a[1])[0];
    const topIndicators = Object.entries(indicatorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const risk = riskCounts.red ? 'red' : (riskCounts.yellow ? 'amber' : 'green');
    const status = s.pct >= 45 ? 'blue' : (s.pct >= 25 ? 'amber' : 'green');
    const delta = `${s.pct}%`;
    return `<tr>
      <td style="font-weight:500" translate="no">${s.label}</td>
      <td translate="no">${topAge ? `${topAge[0]} / ${matching.length}` : '—'}</td>
      <td><div class="phrase-list">${topIndicators.map(p => `<span class="phrase-chip" translate="no">${p}</span>`).join('')}</div></td>
      <td style="font-family:var(--mono);font-size:11px">${peakHour ? `${String(peakHour[0]).padStart(2, '0')}:00` : '—'}</td>
      <td><span class="pill ${risk}">${risk === 'red' ? i18nT('dashboard.risk.high') : risk === 'amber' ? i18nT('dashboard.risk.mid') : i18nT('dashboard.risk.low')}</span></td>
      <td class="trend-cell ${s.pct >= 34 ? 'up' : 'dn'}">${delta}</td>
      <td><span class="pill ${status}">${status === 'blue' ? i18nT('dashboard.status.active') : status === 'green' ? i18nT('dashboard.status.decreasing') : status === 'amber' ? i18nT('dashboard.status.increasing') : i18nT('dashboard.status.stable')}</span></td>
    </tr>`;
  }).join('');
  document.getElementById('tableBody').innerHTML = rows;
}

/* ══════════════════════════════════════════════════════════════════════
   TOOLTIP
══════════════════════════════════════════════════════════════════════ */
const tooltip = document.getElementById('tooltip');
function showTip(e, text) { tooltip.textContent = text; tooltip.style.opacity = '1'; moveTip(e); }
function moveTip(e) { tooltip.style.left = (e.clientX + 10) + 'px'; tooltip.style.top = (e.clientY - 28) + 'px'; }
function hideTip() { tooltip.style.opacity = '0'; }
document.addEventListener('mousemove', e => { if (tooltip.style.opacity === '1') moveTip(e); });

function simulateRefresh() {
  const icon = document.getElementById('refreshIcon');
  icon.style.transform  = 'rotate(360deg)';
  icon.style.transition = 'transform .5s ease';
  STATS = FraudaData.dashboardStats(getFilters());
  FILTERED_SCENARIOS = FraudaData.filterDashboardBy(getFilters());
  renderDashboardDynamic();
  setTimeout(() => { icon.style.transform = ''; icon.style.transition = ''; }, 600);
}

/* ══════════════════════════════════════════════════════════════════════
   INIT — wait for FraudaData then render everything
══════════════════════════════════════════════════════════════════════ */
function renderDashboardDynamic() {
  renderTimestamp();
  renderKPIs();
  renderHourChart();
  renderStratChart();
  renderAgeChart();
  renderGenderChart();
  renderKeywords();
  renderMetaTiles();
  renderIntel();
  renderAlerts();
  renderTable();
}

function init() {
  STATS = FraudaData.dashboardStats(getFilters());
  FILTERED_SCENARIOS = FraudaData.filterDashboardBy(getFilters());
  renderDashboardDynamic();

  window.addEventListener('resize', renderHourChart);
  window.addEventListener('frauda:lang-changed', renderDashboardDynamic);

  ['fDate', 'fAge', 'fGender', 'fType', 'fChannel', 'fRegion'].forEach(id => {
    document.getElementById(id).addEventListener('change', simulateRefresh);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([FraudaData.ready, FraudaData.dashboardReady])
    .then(init)
    .catch((err) => {
      console.error('Could not initialize dashboard from CSV:', err);
      const message = `<div class="section-meta">${i18nT('dashboard.no_data')}</div>`;
      document.getElementById('stratChart').innerHTML = message;
      document.getElementById('ageChart').innerHTML = message;
      document.getElementById('genderChart').innerHTML = message;
      document.getElementById('kwGrid').innerHTML = message;
      document.getElementById('metaTiles').innerHTML = message;
      document.getElementById('intelGrid').innerHTML = message;
      document.getElementById('alertList').innerHTML = message;
      document.getElementById('tableBody').innerHTML = `<tr><td colspan="7" class="section-meta">${i18nT('dashboard.table.no_data')}</td></tr>`;
    });
});
