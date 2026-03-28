/* ══════════════════════════════════════════════════════════════════════
   FraudaDashboard — Analytics dashboard page (/dashboard)
   All visuals driven by FraudaData.dashboardStats() / filterDashboardBy()
   Primary source: data/dashboard_graph.csv; fallback: derived from scenarios.csv
══════════════════════════════════════════════════════════════════════ */

window.FraudaDashboard = (function () {
  'use strict';

  var STRATEGY_COLORS = [
    '#b91c1c', '#d97706', '#9333ea', '#2563eb', '#0891b2', '#15803d', '#6d28d9', '#0f766e',
  ];

  var STATS = null;
  var FILTERED_SCENARIOS = [];
  var _resizeHandler = null;
  var _langHandler = null;
  var _filterIds = ['fDate', 'fAge', 'fGender', 'fType', 'fChannel', 'fRegion', 'fLang'];

  function i18nT(key, vars) {
    if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') {
      return window.FraudaI18n.t(key, vars);
    }
    return key;
  }

  function ageGroupOf(age) {
    if (age <= 24) return '18–24';
    if (age <= 34) return '25–34';
    if (age <= 49) return '35–49';
    if (age <= 64) return '50–64';
    return '65+';
  }

  /* ── Filters ──────────────────────────────────────────────────────── */
  function getFilters() {
    var read = function (id) {
      var el = document.getElementById(id);
      return el ? (el.value || 'all') : 'all';
    };
    var mapVal = function (v) { return v === 'all' ? undefined : v; };
    return {
      date: mapVal(read('fDate')),
      ageGroup: mapVal(read('fAge')),
      gender: mapVal(read('fGender')),
      fraud_type: mapVal(read('fType')),
      channel: mapVal(read('fChannel')),
      caller_origin: mapVal(read('fRegion')),
      lang: mapVal(read('fLang')),
    };
  }

  /* ── Keyword Cloud ────────────────────────────────────────────────── */
  function getKeywordCloud() {
    var counts = new Map();
    FILTERED_SCENARIOS.forEach(function (s) {
      FraudaData.parseIndicators(s.indicators).forEach(function (ind) {
        var key = ind.label;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(function (e) { return { text: e[0], count: e[1], risk: e[1] >= 4 ? 'h' : e[1] >= 2 ? 'm' : 'l' }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 16);
  }

  /* ── Dynamic Insights ─────────────────────────────────────────────── */
  function getDynamicInsights() {
    if (!FILTERED_SCENARIOS.length) return [];
    var total = STATS.total || 1;
    var topStrategy = STATS.strategies[0];
    var originEntries = Object.entries(STATS.byOrigin).sort(function (a, b) { return b[1] - a[1]; });
    var topOrigin = originEntries[0];
    var ageEntries = Object.entries(STATS.byAgeGroup).sort(function (a, b) { return b[1] - a[1]; });
    var topAge = ageEntries[0];
    var peakHour = STATS.byHour.indexOf(Math.max.apply(null, STATS.byHour));
    var peakCount = STATS.byHour[peakHour] || 0;
    var langEntries = Object.entries(STATS.byLang).sort(function (a, b) { return b[1] - a[1]; });
    var topLang = langEntries[0];
    var langLabelMap = { lv: i18nT('index.lang.lv'), ru: i18nT('index.lang.ru'), en: i18nT('index.lang.en') };

    return [
      {
        cls: 'red', icon: '⚠',
        title: i18nT('dashboard.dynamic.top_strategy.title'),
        text: topStrategy ? i18nT('dashboard.dynamic.top_strategy.text', { label: topStrategy.label, pct: topStrategy.pct, count: topStrategy.count }) : i18nT('dashboard.no_data')
      },
      {
        cls: 'amber', icon: '◉',
        title: i18nT('dashboard.dynamic.top_origin.title'),
        text: topOrigin ? i18nT('dashboard.dynamic.top_origin.text', { origin: topOrigin[0], pct: Math.round((topOrigin[1] / total) * 100) }) : i18nT('dashboard.no_data')
      },
      {
        cls: 'blue', icon: '↑',
        title: i18nT('dashboard.dynamic.high_risk.title'),
        text: i18nT('dashboard.dynamic.high_risk.text', { pct: Math.round((STATS.highRisk / total) * 100) })
      },
      {
        cls: 'green', icon: '⌁',
        title: i18nT('dashboard.dynamic.top_age.title'),
        text: topAge ? i18nT('dashboard.dynamic.top_age.text', { age: topAge[0], pct: Math.round((topAge[1] / total) * 100) }) : i18nT('dashboard.no_data')
      },
      {
        cls: 'amber', icon: '⏱',
        title: i18nT('dashboard.dynamic.peak_hour.title'),
        text: i18nT('dashboard.dynamic.peak_hour.text', { hour: String(peakHour).padStart(2, '0'), count: peakCount })
      },
      {
        cls: 'red', icon: '◈',
        title: i18nT('dashboard.dynamic.language_mix.title'),
        text: topLang ? i18nT('dashboard.dynamic.language_mix.text', { lang: langLabelMap[topLang[0]] || topLang[0], pct: Math.round((topLang[1] / total) * 100) }) : i18nT('dashboard.no_data')
      }
    ];
  }

  /* ── Dynamic Alerts ───────────────────────────────────────────────── */
  function getDynamicAlerts() {
    if (!FILTERED_SCENARIOS.length) return [];
    var total = STATS.total || 1;
    var highPct = Math.round((STATS.highRisk / total) * 100);
    var topStrategy = STATS.strategies[0];
    var voicePct = Math.round(((STATS.byType.voice || 0) / total) * 100);
    var smsPct = Math.round(((STATS.byType.sms || 0) / total) * 100);
    var now = new Date();
    var ts = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    return [
      {
        sev: highPct >= 50 ? 'crit' : 'warn',
        text: i18nT('dashboard.dynamic.alert.high_risk', { high: STATS.highRisk, total: total, pct: highPct }),
        ts: ts
      },
      {
        sev: topStrategy && topStrategy.pct >= 40 ? 'crit' : 'info',
        text: topStrategy ? i18nT('dashboard.dynamic.alert.top_strategy', { label: topStrategy.label, count: topStrategy.count }) : i18nT('dashboard.no_data'),
        ts: ts
      },
      {
        sev: 'info',
        text: i18nT('dashboard.dynamic.alert.channel_mix', { voice: voicePct, sms: smsPct }),
        ts: ts
      }
    ];
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER — returns full HTML string for the dashboard page
  ══════════════════════════════════════════════════════════════════ */
  function render() {
    return ''
    + '<div class="dash-layout">'

    /* ── Filter Bar ─────────────────────────────────────────────── */
    + '<div class="filter-bar">'
    + '  <span class="filter-label" data-i18n="dashboard.filter.label">' + i18nT('dashboard.filter.label') + '</span>'
    + '  <div class="filter-sep"></div>'
    + '  <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-secondary)">'
    + '    <span data-i18n="dashboard.filter.date">' + i18nT('dashboard.filter.date') + '</span>'
    + '    <input type="date" id="fDate">'
    + '  </label>'
    + '  <select id="fAge">'
    + '    <option value="all" data-i18n="dashboard.filter.age.all">' + i18nT('dashboard.filter.age.all') + '</option>'
    + '    <option value="18–24">18–24</option><option value="25–34">25–34</option><option value="35–49">35–49</option>'
    + '    <option value="50–64">50–64</option><option value="65+">65+</option>'
    + '  </select>'
    + '  <select id="fGender">'
    + '    <option value="all" data-i18n="dashboard.filter.gender.all">' + i18nT('dashboard.filter.gender.all') + '</option>'
    + '    <option value="male" data-i18n="dashboard.filter.gender.male">' + i18nT('dashboard.filter.gender.male') + '</option>'
    + '    <option value="female" data-i18n="dashboard.filter.gender.female">' + i18nT('dashboard.filter.gender.female') + '</option>'
    + '  </select>'
    + '  <select id="fType">'
    + '    <option value="all" data-i18n="dashboard.filter.type.all">' + i18nT('dashboard.filter.type.all') + '</option>'
    + '    <option value="bank_impersonation" data-i18n="dashboard.filter.type.bank">' + i18nT('dashboard.filter.type.bank') + '</option>'
    + '    <option value="government_impersonation" data-i18n="dashboard.filter.type.gov">' + i18nT('dashboard.filter.type.gov') + '</option>'
    + '    <option value="otp_theft" data-i18n="dashboard.filter.type.otp">' + i18nT('dashboard.filter.type.otp') + '</option>'
    + '    <option value="delivery_fraud" data-i18n="dashboard.filter.type.delivery">' + i18nT('dashboard.filter.type.delivery') + '</option>'
    + '    <option value="investment_scam" data-i18n="dashboard.filter.type.investment">' + i18nT('dashboard.filter.type.investment') + '</option>'
    + '    <option value="utility_fraud" data-i18n="dashboard.filter.type.utility">' + i18nT('dashboard.filter.type.utility') + '</option>'
    + '    <option value="phishing_link" data-i18n="dashboard.filter.type.phishing">' + i18nT('dashboard.filter.type.phishing') + '</option>'
    + '    <option value="legitimate" data-i18n="dashboard.filter.type.legitimate">' + i18nT('dashboard.filter.type.legitimate') + '</option>'
    + '  </select>'
    + '  <select id="fChannel">'
    + '    <option value="all" data-i18n="dashboard.filter.channel.all">' + i18nT('dashboard.filter.channel.all') + '</option>'
    + '    <option value="vishing" data-i18n="dashboard.filter.channel.voice">' + i18nT('dashboard.filter.channel.voice') + '</option>'
    + '    <option value="smishing" data-i18n="dashboard.filter.channel.sms">' + i18nT('dashboard.filter.channel.sms') + '</option>'
    + '  </select>'
    + '  <select id="fRegion">'
    + '    <option value="all" data-i18n="dashboard.filter.region.all">' + i18nT('dashboard.filter.region.all') + '</option>'
    + '    <option value="LV (VoIP)" data-i18n="dashboard.filter.region.voip">' + i18nT('dashboard.filter.region.voip') + '</option>'
    + '    <option value="LV (Mobilais)" data-i18n="dashboard.filter.region.mobile">' + i18nT('dashboard.filter.region.mobile') + '</option>'
    + '    <option value="LV (Fiksētais)" data-i18n="dashboard.filter.region.fixed">' + i18nT('dashboard.filter.region.fixed') + '</option>'
    + '    <option value="LV (Īssavilkums)" data-i18n="dashboard.filter.region.shortcode">' + i18nT('dashboard.filter.region.shortcode') + '</option>'
    + '    <option value="LT (Mobilais)" data-i18n="dashboard.filter.region.lt_mobile">' + i18nT('dashboard.filter.region.lt_mobile') + '</option>'
    + '  </select>'
    + '  <select id="fLang">'
    + '    <option value="all" data-i18n="dashboard.filter.lang.all">' + i18nT('dashboard.filter.lang.all') + '</option>'
    + '    <option value="lv">LV</option>'
    + '    <option value="en">EN</option>'
    + '    <option value="ru">RU</option>'
    + '  </select>'
    + '  <button class="btn-refresh" id="btnRefresh" type="button">'
    + '    <svg id="refreshIcon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'
    + '    <span data-i18n="dashboard.btn.refresh">' + i18nT('dashboard.btn.refresh') + '</span>'
    + '  </button>'
    + '  <button class="btn btn-ghost btn-sm" id="btnExportCsv" type="button" style="margin-left:auto">'
    + '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
    + '    <span data-i18n="dashboard.btn.export">' + i18nT('dashboard.btn.export') + '</span>'
    + '  </button>'
    + '  <button class="btn btn-ghost btn-sm" id="btnNotifPrefs" type="button">'
    + '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
    + '    <span data-i18n="dashboard.btn.notifications">' + i18nT('dashboard.btn.notifications') + '</span>'
    + '  </button>'
    + '</div>'

    /* ── KPI Row ────────────────────────────────────────────────── */
    + '<div class="kpi-grid">'
    + '  <div class="kpi"><div class="kpi-label" data-i18n="dashboard.kpi.total_suspicious">' + i18nT('dashboard.kpi.total_suspicious') + '</div><div class="kpi-value" id="kpi1" translate="no">—</div><div class="kpi-trend up" data-i18n="dashboard.kpi.trend.total">' + i18nT('dashboard.kpi.trend.total') + '</div></div>'
    + '  <div class="kpi"><div class="kpi-label" data-i18n="dashboard.kpi.high_risk">' + i18nT('dashboard.kpi.high_risk') + '</div><div class="kpi-value" id="kpi2" translate="no">—</div><div class="kpi-trend up" data-i18n="dashboard.kpi.trend.high_risk">' + i18nT('dashboard.kpi.trend.high_risk') + '</div></div>'
    + '  <div class="kpi"><div class="kpi-label" data-i18n="dashboard.kpi.active_campaigns">' + i18nT('dashboard.kpi.active_campaigns') + '</div><div class="kpi-value" id="kpi3" translate="no">—</div><div class="kpi-trend up" data-i18n="dashboard.kpi.trend.campaigns">' + i18nT('dashboard.kpi.trend.campaigns') + '</div></div>'
    + '  <div class="kpi"><div class="kpi-label" data-i18n="dashboard.kpi.age_risk">' + i18nT('dashboard.kpi.age_risk') + '</div><div class="kpi-value" id="kpiAge" style="font-size:18px" translate="no">—</div><div class="kpi-sub" id="kpiAgeSub" translate="no">—</div></div>'
    + '  <div class="kpi"><div class="kpi-label" data-i18n="dashboard.kpi.activity_peak">' + i18nT('dashboard.kpi.activity_peak') + '</div><div class="kpi-value" id="kpiPeak" style="font-size:18px" translate="no">—</div><div class="kpi-sub" id="kpiPeakSub" translate="no">—</div></div>'
    + '  <div class="kpi"><div class="kpi-label" data-i18n="dashboard.kpi.avg_risk">' + i18nT('dashboard.kpi.avg_risk') + '</div><div class="kpi-value" id="kpi6" translate="no">—</div><div class="kpi-trend dn" data-i18n="dashboard.kpi.trend.avg_risk">' + i18nT('dashboard.kpi.trend.avg_risk') + '</div></div>'
    + '</div>'

    /* ── Charts row 1: Hourly + Strategies ──────────────────────── */
    + '<div class="chart-grid">'
    + '  <div class="dashboard-section">'
    + '    <div class="section-head"><span class="section-title" data-i18n="dashboard.chart.hourly.title">' + i18nT('dashboard.chart.hourly.title') + '</span><span class="section-meta" data-i18n="dashboard.chart.hourly.meta">' + i18nT('dashboard.chart.hourly.meta') + '</span></div>'
    + '    <div class="section-body">'
    + '      <div class="chart-canvas-wrap"><svg class="line-chart" id="hourChart" viewBox="0 0 560 160" preserveAspectRatio="none"></svg></div>'
    + '      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px;padding:0 6px" translate="no"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div>'
    + '    </div>'
    + '  </div>'
    + '  <div class="dashboard-section">'
    + '    <div class="section-head"><span class="section-title" data-i18n="dashboard.chart.strategies.title">' + i18nT('dashboard.chart.strategies.title') + '</span><span class="section-meta" data-i18n="dashboard.chart.strategies.meta">' + i18nT('dashboard.chart.strategies.meta') + '</span></div>'
    + '    <div class="section-body"><div id="stratChart"></div></div>'
    + '  </div>'
    + '</div>'

    /* ── Charts row 2: Age + Gender ─────────────────────────────── */
    + '<div class="chart-grid">'
    + '  <div class="dashboard-section">'
    + '    <div class="section-head"><span class="section-title" data-i18n="dashboard.chart.age.title">' + i18nT('dashboard.chart.age.title') + '</span><span class="section-meta" data-i18n="dashboard.chart.age.meta">' + i18nT('dashboard.chart.age.meta') + '</span></div>'
    + '    <div class="section-body"><div class="grouped-legend" id="ageLegend"></div><div class="grouped-chart"><div class="grouped-inner" id="ageChart"></div></div></div>'
    + '  </div>'
    + '  <div class="dashboard-section">'
    + '    <div class="section-head"><span class="section-title" data-i18n="dashboard.chart.gender.title">' + i18nT('dashboard.chart.gender.title') + '</span><span class="section-meta" data-i18n="dashboard.chart.gender.meta">' + i18nT('dashboard.chart.gender.meta') + '</span></div>'
    + '    <div class="section-body"><div class="grouped-legend" id="genderLegend"></div><div class="gender-grid" id="genderChart"></div></div>'
    + '  </div>'
    + '</div>'

    /* ── Charts row 3: Keywords + Metadata ──────────────────────── */
    + '<div class="chart-grid">'
    + '  <div class="dashboard-section">'
    + '    <div class="section-head"><span class="section-title" data-i18n="dashboard.chart.keywords.title">' + i18nT('dashboard.chart.keywords.title') + '</span><span class="section-meta" data-i18n="dashboard.chart.keywords.meta">' + i18nT('dashboard.chart.keywords.meta') + '</span></div>'
    + '    <div class="section-body">'
    + '      <div class="kw-grid" id="kwGrid"></div>'
    + '      <div style="margin-top:10px;font-size:11px;color:var(--text-muted)">'
    + '        <span style="display:inline-block;width:9px;height:9px;background:var(--red-bg);border:1px solid var(--red-border);border-radius:2px;margin-right:3px;vertical-align:middle"></span><span data-i18n="dashboard.legend.risk.high">' + i18nT('dashboard.legend.risk.high') + '</span> &nbsp;'
    + '        <span style="display:inline-block;width:9px;height:9px;background:var(--amber-bg);border:1px solid var(--amber-border);border-radius:2px;margin-right:3px;vertical-align:middle"></span><span data-i18n="dashboard.legend.risk.mid">' + i18nT('dashboard.legend.risk.mid') + '</span> &nbsp;'
    + '        <span style="display:inline-block;width:9px;height:9px;background:var(--surface-2);border:1px solid var(--border);border-radius:2px;margin-right:3px;vertical-align:middle"></span><span data-i18n="dashboard.legend.risk.low">' + i18nT('dashboard.legend.risk.low') + '</span>'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '  <div class="dashboard-section">'
    + '    <div class="section-head"><span class="section-title" data-i18n="dashboard.chart.metadata.title">' + i18nT('dashboard.chart.metadata.title') + '</span><span class="section-meta" data-i18n="dashboard.chart.metadata.meta">' + i18nT('dashboard.chart.metadata.meta') + '</span></div>'
    + '    <div class="section-body"><div class="meta-tiles" id="metaTiles"></div></div>'
    + '  </div>'
    + '</div>'

    /* ── Combined Intelligence ──────────────────────────────────── */
    + '<div class="dashboard-section">'
    + '  <div class="section-head"><span class="section-title" data-i18n="dashboard.section.combined.title">' + i18nT('dashboard.section.combined.title') + '</span><span class="section-meta" data-i18n="dashboard.section.combined.meta">' + i18nT('dashboard.section.combined.meta') + '</span></div>'
    + '  <div class="section-body"><div class="intel-grid" id="intelGrid"></div></div>'
    + '</div>'

    /* ── Alerts ─────────────────────────────────────────────────── */
    + '<div class="dashboard-section">'
    + '  <div class="section-head"><span class="section-title" data-i18n="dashboard.section.alerts.title">' + i18nT('dashboard.section.alerts.title') + '</span><span class="section-meta" id="alertTs" translate="no"></span></div>'
    + '  <div class="section-body"><div class="alert-list" id="alertList"></div></div>'
    + '</div>'

    /* ── Data Table ─────────────────────────────────────────────── */
    + '<div class="dashboard-section">'
    + '  <div class="section-head"><span class="section-title" data-i18n="dashboard.section.table.title">' + i18nT('dashboard.section.table.title') + '</span><span class="section-meta" data-i18n="dashboard.section.table.meta">' + i18nT('dashboard.section.table.meta') + '</span></div>'
    + '  <div class="section-body" style="padding:0">'
    + '    <div class="data-table-wrap"><table class="data-table"><thead><tr>'
    + '      <th data-i18n="dashboard.table.type">' + i18nT('dashboard.table.type') + '</th>'
    + '      <th data-i18n="dashboard.table.segment">' + i18nT('dashboard.table.segment') + '</th>'
    + '      <th data-i18n="dashboard.table.phrases">' + i18nT('dashboard.table.phrases') + '</th>'
    + '      <th data-i18n="dashboard.table.peak">' + i18nT('dashboard.table.peak') + '</th>'
    + '      <th data-i18n="dashboard.table.risk">' + i18nT('dashboard.table.risk') + '</th>'
    + '      <th data-i18n="dashboard.table.delta">' + i18nT('dashboard.table.delta') + '</th>'
    + '      <th data-i18n="dashboard.table.status">' + i18nT('dashboard.table.status') + '</th>'
    + '    </tr></thead><tbody id="tableBody"></tbody></table></div>'
    + '  </div>'
    + '</div>'

    /* ── Sync timestamp ─────────────────────────────────────────── */
    + '<div style="text-align:right;font-size:11px;color:var(--text-muted);padding:8px 0" id="lastSync" translate="no"></div>'

    + '</div>' /* .dash-layout */

    /* ── Notification Preferences Slide-Over (UI only) ──────────── */
    + '<div class="panel-overlay" id="notifOverlay"></div>'
    + '<aside class="slide-panel" id="notifPanel">'
    + '  <div class="panel-header">'
    + '    <h3 data-i18n="dashboard.notif.title">' + i18nT('dashboard.notif.title') + '</h3>'
    + '    <button class="btn btn-ghost btn-sm" id="btnNotifClose" type="button">&times;</button>'
    + '  </div>'
    + '  <div class="panel-body">'
    + '    <p data-i18n="dashboard.notif.desc">' + i18nT('dashboard.notif.desc') + '</p>'
    + '    <div class="form-field" style="margin-bottom:12px">'
    + '      <label><input type="checkbox" id="notifEmail" checked> <span data-i18n="dashboard.notif.email">' + i18nT('dashboard.notif.email') + '</span></label>'
    + '    </div>'
    + '    <div class="form-field" style="margin-bottom:12px">'
    + '      <label><input type="checkbox" id="notifBrowser"> <span data-i18n="dashboard.notif.browser">' + i18nT('dashboard.notif.browser') + '</span></label>'
    + '    </div>'
    + '    <div class="form-field" style="margin-bottom:12px">'
    + '      <label><input type="checkbox" id="notifSms"> <span data-i18n="dashboard.notif.sms">' + i18nT('dashboard.notif.sms') + '</span></label>'
    + '    </div>'
    + '    <div class="form-field" style="margin-bottom:12px">'
    + '      <label data-i18n="dashboard.notif.threshold">' + i18nT('dashboard.notif.threshold') + '</label>'
    + '      <select id="notifThreshold">'
    + '        <option value="high" data-i18n="dashboard.notif.threshold.high">' + i18nT('dashboard.notif.threshold.high') + '</option>'
    + '        <option value="medium" data-i18n="dashboard.notif.threshold.medium">' + i18nT('dashboard.notif.threshold.medium') + '</option>'
    + '        <option value="all" data-i18n="dashboard.notif.threshold.all">' + i18nT('dashboard.notif.threshold.all') + '</option>'
    + '      </select>'
    + '    </div>'
    + '    <button class="btn btn-primary" id="btnNotifSave" type="button" data-i18n="dashboard.notif.save">' + i18nT('dashboard.notif.save') + '</button>'
    + '  </div>'
    + '</aside>';
  }

  /* ══════════════════════════════════════════════════════════════════
     INDIVIDUAL RENDER FUNCTIONS — all data-driven from STATS
  ══════════════════════════════════════════════════════════════════ */

  function renderTimestamp() {
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var ts = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    var el = document.getElementById('lastSync');
    if (el) el.textContent = i18nT('dashboard.timestamp.last_sync') + ' ' + ts;
    var alertEl = document.getElementById('alertTs');
    if (alertEl) alertEl.textContent = i18nT('dashboard.timestamp.as_of') + ' ' + ts;
  }

  function renderKPIs() {
    var s = STATS;
    var el = function (id) { return document.getElementById(id); };
    if (el('kpi1')) el('kpi1').textContent = s.total;
    if (el('kpi2')) el('kpi2').textContent = s.highRisk;
    if (el('kpi3')) el('kpi3').textContent = s.strategies.length;
    if (el('kpi6')) el('kpi6').textContent = s.avgScore.toFixed(1) + '%';
    if (!s.total) {
      if (el('kpiAge')) el('kpiAge').textContent = '—';
      if (el('kpiAgeSub')) el('kpiAgeSub').textContent = '—';
      if (el('kpiPeak')) el('kpiPeak').textContent = '—';
      if (el('kpiPeakSub')) el('kpiPeakSub').textContent = '—';
      return;
    }
    var topAge = Object.entries(s.byAgeGroup).sort(function (a, b) { return b[1] - a[1]; })[0];
    var topAgePct = Math.round(topAge[1] / s.total * 100);
    if (el('kpiAge')) el('kpiAge').textContent = topAge[0];
    if (el('kpiAgeSub')) el('kpiAgeSub').textContent = i18nT('dashboard.kpi.age_sub', { count: topAge[1], total: s.total, pct: topAgePct });
    var peakHour = s.byHour.indexOf(Math.max.apply(null, s.byHour));
    if (el('kpiPeak')) el('kpiPeak').textContent = peakHour.toString().padStart(2, '0') + ':00';
    if (el('kpiPeakSub')) el('kpiPeakSub').textContent = i18nT('dashboard.kpi.peak_window', {
      from: String(Math.max(0, peakHour - 1)).padStart(2, '0') + ':00',
      to: String(Math.min(23, peakHour + 2)).padStart(2, '0') + ':00'
    });
  }

  function renderHourChart() {
    var svg = document.getElementById('hourChart');
    if (!svg) return;
    var data = STATS.byHour;
    if (!STATS.total) { svg.innerHTML = ''; return; }
    var W = 560, H = 160, padL = 6, padR = 6, padT = 14, padB = 8;
    var max = Math.max.apply(null, data.concat([1]));
    var n = data.length;
    var x = function (i) { return padL + (i / (n - 1)) * (W - padL - padR); };
    var y = function (v) { return padT + (1 - v / max) * (H - padT - padB); };
    var pts = data.map(function (v, i) { return x(i) + ',' + y(v); }).join(' ');
    var linePath = 'M ' + pts.split(' ').join(' L ');
    var areaPath = 'M ' + x(0) + ',' + y(data[0]) + ' L ' + pts.split(' ').join(' L ') + ' L ' + x(n - 1) + ',' + (H - padB) + ' L ' + x(0) + ',' + (H - padB) + ' Z';
    var peakHour = data.indexOf(Math.max.apply(null, data));
    var px1 = x(Math.max(0, peakHour - 1));
    var px2 = x(Math.min(23, peakHour + 1));
    svg.innerHTML = '<defs><linearGradient id="aG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".18"/><stop offset="100%" stop-color="var(--accent)" stop-opacity=".01"/></linearGradient></defs>'
      + '<rect x="' + px1 + '" y="' + padT + '" width="' + (px2 - px1) + '" height="' + (H - padT - padB) + '" fill="#fef3c7" opacity=".55"/>'
      + '<path d="' + areaPath + '" fill="url(#aG)"/>'
      + '<path d="' + linePath + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      + data.map(function (v, i) {
          return '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3" fill="var(--accent)" opacity=".7" data-tip="' + i18nT('dashboard.hour.tooltip', { hour: String(i).padStart(2, '0'), count: v }) + '"/>';
        }).join('')
      + '<text x="' + ((px1 + px2) / 2) + '" y="' + (padT + 10) + '" text-anchor="middle" font-size="9" fill="#b45309" font-family="IBM Plex Sans,sans-serif" font-weight="600">' + i18nT('dashboard.hour.peak') + '</text>';

    svg.querySelectorAll('circle').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) { showTip(e, el.dataset.tip); });
      el.addEventListener('mouseleave', hideTip);
    });
  }

  function renderStratChart() {
    var strategies = STATS.strategies;
    var container = document.getElementById('stratChart');
    if (!container) return;
    if (!strategies.length) {
      container.innerHTML = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
      return;
    }
    container.innerHTML = strategies.map(function (s, i) {
      var color = STRATEGY_COLORS[i % STRATEGY_COLORS.length];
      return '<div class="strat-row">'
        + '<div class="strat-rank">' + (i + 1) + '</div>'
        + '<div class="strat-label" translate="no">' + s.label + '</div>'
        + '<div class="strat-track"><div class="strat-fill" style="width:' + s.pct + '%;background:' + color + '22;border-right:2px solid ' + color + '"></div></div>'
        + '<div class="strat-pct">' + s.pct + '%</div>'
        + '<div class="strat-trend up">↑</div>'
        + '</div>';
    }).join('');
  }

  function renderAgeChart() {
    var ageGroups = ['18–24', '25–34', '35–49', '50–64', '65+'];
    var s = STATS;
    var ageXFraud = s.ageXFraud;
    var fraudLabels = s.strategies.slice(0, 4).map(function (x) { return x.label; });
    var ageLegend = document.getElementById('ageLegend');
    var ageChart = document.getElementById('ageChart');
    if (!ageChart) return;
    if (!fraudLabels.length) {
      if (ageLegend) ageLegend.innerHTML = '';
      ageChart.innerHTML = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
      return;
    }
    var colors = STRATEGY_COLORS.slice(0, 4);
    if (ageLegend) {
      ageLegend.innerHTML = fraudLabels.map(function (t, i) {
        return '<div class="g-leg-item"><div class="g-leg-dot" style="background:' + colors[i] + '"></div>' + t + '</div>';
      }).join('');
    }
    var allValues = ageGroups.reduce(function (acc, ag) {
      return acc.concat(fraudLabels.map(function (fl) { return (ageXFraud[ag] && ageXFraud[ag][fl]) || 0; }));
    }, []);
    var maxVal = Math.max.apply(null, allValues.concat([1]));
    ageChart.innerHTML = ageGroups.map(function (ag) {
      var bars = fraudLabels.map(function (fl, ti) {
        var v = (ageXFraud[ag] && ageXFraud[ag][fl]) || 0;
        return '<div class="age-bar-wrap"><div class="age-bar" style="background:' + colors[ti] + ';width:' + Math.round(v / maxVal * 100) + '%;opacity:.85" data-tip="' + i18nT('dashboard.age.tooltip', { age: ag, fraud: fl, count: v }) + '"></div></div>';
      }).join('');
      return '<div class="age-row"><div class="age-label">' + ag + '</div><div class="age-bars">' + bars + '</div></div>';
    }).join('');
    ageChart.querySelectorAll('.age-bar').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) { showTip(e, el.dataset.tip); });
      el.addEventListener('mouseleave', hideTip);
    });
  }

  function renderGenderChart() {
    var genders = ['male', 'female'];
    var genderLabels = { male: i18nT('dashboard.gender.male'), female: i18nT('dashboard.gender.female') };
    var s = STATS;
    var gXF = s.genderXFraud;
    var fraudLabels = s.strategies.slice(0, 4).map(function (x) { return x.label; });
    var genderLegend = document.getElementById('genderLegend');
    var genderChart = document.getElementById('genderChart');
    if (!genderChart) return;
    if (!fraudLabels.length) {
      if (genderLegend) genderLegend.innerHTML = '';
      genderChart.innerHTML = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
      return;
    }
    var colors = STRATEGY_COLORS.slice(0, 4);
    if (genderLegend) {
      genderLegend.innerHTML = fraudLabels.map(function (t, i) {
        return '<div class="g-leg-item"><div class="g-leg-dot" style="background:' + colors[i] + '"></div>' + t + '</div>';
      }).join('');
    }
    genderChart.innerHTML = genders.map(function (g) {
      var row = gXF[g] || {};
      var total = fraudLabels.reduce(function (a, fl) { return a + (row[fl] || 0); }, 0) || 1;
      var segs = fraudLabels.map(function (fl, ti) {
        var v = row[fl] || 0;
        var pct = Math.round(v / total * 100);
        return '<div class="gender-seg" style="background:' + colors[ti] + ';flex:' + Math.max(v, 0.5) + '" data-tip="' + i18nT('dashboard.gender.tooltip', { gender: genderLabels[g], fraud: fl, pct: pct }) + '">' + (pct > 8 ? pct + '%' : '') + '</div>';
      }).join('');
      return '<div class="gender-row"><div class="gender-label">' + genderLabels[g] + '</div><div class="gender-bars">' + segs + '</div></div>';
    }).join('');
    genderChart.querySelectorAll('.gender-seg').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) { showTip(e, el.dataset.tip); });
      el.addEventListener('mouseleave', hideTip);
    });
  }

  function renderKeywords() {
    var keywords = getKeywordCloud();
    var kwGrid = document.getElementById('kwGrid');
    if (!kwGrid) return;
    if (!keywords.length) {
      kwGrid.innerHTML = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
      return;
    }
    kwGrid.innerHTML = keywords.map(function (k) {
      return '<span class="kw-tag ' + k.risk + '" translate="no" data-tip="' + i18nT('dashboard.keyword.tooltip', { count: k.count.toLocaleString() }) + '">' + k.text + '<span class="kw-count">' + k.count.toLocaleString() + '</span></span>';
    }).join('');
    kwGrid.querySelectorAll('.kw-tag').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) { showTip(e, el.dataset.tip); });
      el.addEventListener('mouseleave', hideTip);
    });
  }

  function miniBarSet(data) {
    var max = Math.max.apply(null, data.map(function (d) { return d.v; }).concat([1]));
    return data.map(function (d) {
      return '<div class="mini-bar-row"><div class="mini-bar-label">' + d.l + '</div><div class="mini-bar-track"><div class="mini-bar-fill" style="width:' + Math.round(d.v / max * 100) + '%;background:' + d.c + '"></div></div><div class="mini-bar-val">' + d.v + '%</div></div>';
    }).join('');
  }

  function renderMetaTiles() {
    var s = STATS;
    var total = s.total;
    var metaTiles = document.getElementById('metaTiles');
    if (!metaTiles) return;
    if (!total) {
      metaTiles.innerHTML = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
      return;
    }
    var originColors = { 'LV (VoIP)': '#b91c1c', 'LV (Mobilais)': '#d97706', 'LV (Fiksētais)': '#2563eb', 'LV (Īssavilkums)': '#15803d', 'LT (Mobilais)': '#9333ea' };
    var metaOrigin = Object.entries(s.byOrigin).map(function (e) {
      return { l: e[0], v: Math.round(e[1] / total * 100), c: originColors[e[0]] || '#9ca3af' };
    }).sort(function (a, b) { return b.v - a.v; });
    var metaChannel = [
      { l: i18nT('dashboard.channel.voice'), v: Math.round(s.byType.voice / total * 100), c: '#7c3aed' },
      { l: i18nT('dashboard.channel.sms'), v: Math.round(s.byType.sms / total * 100), c: '#0891b2' },
    ];
    var langColors = { lv: '#1d4ed8', ru: '#d97706', en: '#15803d' };
    var langLabels = { lv: i18nT('index.lang.lv'), ru: i18nT('index.lang.ru'), en: i18nT('index.lang.en') };
    var metaLang = Object.entries(s.byLang).map(function (e) {
      return { l: langLabels[e[0]] || e[0], v: Math.round(e[1] / total * 100), c: langColors[e[0]] || '#9ca3af' };
    }).sort(function (a, b) { return b.v - a.v; });
    var wdLabels = [
      i18nT('dashboard.weekday.mon'), i18nT('dashboard.weekday.tue'), i18nT('dashboard.weekday.wed'),
      i18nT('dashboard.weekday.thu'), i18nT('dashboard.weekday.fri'), i18nT('dashboard.weekday.sat'), i18nT('dashboard.weekday.sun')
    ];
    var wdValues = [0, 0, 0, 0, 0, 0, 0];
    FILTERED_SCENARIOS.forEach(function (row) {
      var day = new Date(row.timestamp).getDay();
      var idx = day === 0 ? 6 : day - 1;
      wdValues[idx]++;
    });
    var wdMax = Math.max.apply(null, wdValues.concat([1]));
    var wdBars = wdLabels.map(function (d, i) {
      return '<div class="wd-col"><div class="wd-val">' + wdValues[i] + '</div><div class="wd-bar" style="height:' + Math.round(wdValues[i] / wdMax * 64) + 'px;background:' + (wdValues[i] === wdMax ? 'var(--accent)' : 'var(--accent-light)') + '"></div><div class="wd-label">' + d + '</div></div>';
    }).join('');
    metaTiles.innerHTML = '<div class="meta-tile"><div class="meta-tile-label">' + i18nT('dashboard.meta.origin') + '</div>' + miniBarSet(metaOrigin) + '</div>'
      + '<div class="meta-tile"><div class="meta-tile-label">' + i18nT('dashboard.meta.channel_split') + '</div>' + miniBarSet(metaChannel) + '<div style="margin-top:8px"><div class="meta-tile-label">' + i18nT('dashboard.meta.language') + '</div>' + miniBarSet(metaLang) + '</div></div>'
      + '<div class="meta-tile"><div class="meta-tile-label">' + i18nT('dashboard.meta.weekday_activity') + '</div><div class="weekday-bars">' + wdBars + '</div></div>';
  }

  function renderIntel() {
    var intelCards = getDynamicInsights();
    var intelGrid = document.getElementById('intelGrid');
    if (!intelGrid) return;
    if (!intelCards.length) {
      intelGrid.innerHTML = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
      return;
    }
    intelGrid.innerHTML = intelCards.map(function (c) {
      return '<div class="intel-card ' + c.cls + '"><div class="intel-icon">' + c.icon + '</div><div class="intel-text"><strong>' + c.title + '</strong><span>' + c.text + '</span></div></div>';
    }).join('');
  }

  function renderAlerts() {
    var alerts = getDynamicAlerts();
    var alertList = document.getElementById('alertList');
    if (!alertList) return;
    if (!alerts.length) {
      alertList.innerHTML = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
      return;
    }
    alertList.innerHTML = alerts.map(function (a) {
      return '<div class="alert-item ' + a.sev + '">'
        + '<span class="alert-badge ' + a.sev + '">' + (a.sev === 'crit' ? i18nT('dashboard.alert.level.crit') : a.sev === 'warn' ? i18nT('dashboard.alert.level.warn') : i18nT('dashboard.alert.level.info')) + '</span>'
        + '<span class="alert-text">' + a.text + '</span>'
        + '<span class="alert-ts">' + a.ts + '</span>'
        + '</div>';
    }).join('');
  }

  function renderTable() {
    var tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    if (!STATS.strategies.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="section-meta">' + i18nT('dashboard.table.no_data') + '</td></tr>';
      return;
    }
    var rows = STATS.strategies.map(function (s) {
      var matching = FILTERED_SCENARIOS.filter(function (row) { return row.fraud_type === s.type; });
      var ageCounts = {};
      var indicatorCounts = {};
      var hourCounts = {};
      var riskCounts = { red: 0, yellow: 0, green: 0 };
      matching.forEach(function (row) {
        var age = ageGroupOf(row.age);
        ageCounts[age] = (ageCounts[age] || 0) + 1;
        riskCounts[row.risk] = (riskCounts[row.risk] || 0) + 1;
        var hour = new Date(row.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        FraudaData.parseIndicators(row.indicators).forEach(function (ind) {
          indicatorCounts[ind.label] = (indicatorCounts[ind.label] || 0) + 1;
        });
      });
      var topAge = Object.entries(ageCounts).sort(function (a, b) { return b[1] - a[1]; })[0];
      var topIndicators = Object.entries(indicatorCounts).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 3).map(function (e) { return e[0]; });
      var peakHour = Object.entries(hourCounts).sort(function (a, b) { return b[1] - a[1]; })[0];
      var risk = riskCounts.red ? 'red' : (riskCounts.yellow ? 'amber' : 'green');
      var status = s.pct >= 45 ? 'blue' : (s.pct >= 25 ? 'amber' : 'green');
      var delta = s.pct + '%';
      return '<tr>'
        + '<td style="font-weight:500" translate="no">' + s.label + '</td>'
        + '<td translate="no">' + (topAge ? topAge[0] + ' / ' + matching.length : '—') + '</td>'
        + '<td><div class="phrase-list">' + topIndicators.map(function (p) { return '<span class="phrase-chip" translate="no">' + p + '</span>'; }).join('') + '</div></td>'
        + '<td style="font-family:var(--mono);font-size:11px">' + (peakHour ? String(peakHour[0]).padStart(2, '0') + ':00' : '—') + '</td>'
        + '<td><span class="pill ' + risk + '">' + (risk === 'red' ? i18nT('dashboard.risk.high') : risk === 'amber' ? i18nT('dashboard.risk.mid') : i18nT('dashboard.risk.low')) + '</span></td>'
        + '<td class="trend-cell ' + (s.pct >= 34 ? 'up' : 'dn') + '">' + delta + '</td>'
        + '<td><span class="pill ' + status + '">' + (status === 'blue' ? i18nT('dashboard.status.active') : status === 'green' ? i18nT('dashboard.status.decreasing') : status === 'amber' ? i18nT('dashboard.status.increasing') : i18nT('dashboard.status.stable')) + '</span></td>'
        + '</tr>';
    }).join('');
    tableBody.innerHTML = rows;
  }

  /* ── Tooltip ────────────────────────────────────────────────────── */
  function showTip(e, text) {
    var tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    tooltip.textContent = text;
    tooltip.style.opacity = '1';
    moveTip(e);
  }
  function moveTip(e) {
    var tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    tooltip.style.left = (e.clientX + 10) + 'px';
    tooltip.style.top = (e.clientY - 28) + 'px';
  }
  function hideTip() {
    var tooltip = document.getElementById('tooltip');
    if (tooltip) tooltip.style.opacity = '0';
  }

  /* ── Render all dynamic sections ────────────────────────────────── */
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

  function simulateRefresh() {
    var icon = document.getElementById('refreshIcon');
    if (icon) {
      icon.style.transform = 'rotate(360deg)';
      icon.style.transition = 'transform .5s ease';
    }
    STATS = FraudaData.dashboardStats(getFilters());
    FILTERED_SCENARIOS = FraudaData.filterDashboardBy(getFilters());
    renderDashboardDynamic();
    setTimeout(function () {
      if (icon) { icon.style.transform = ''; icon.style.transition = ''; }
    }, 600);
  }

  /* ── Export CSV ──────────────────────────────────────────────────── */
  function exportCsv() {
    var exportRows = Array.isArray(FraudaData.dashboardRows) ? FraudaData.dashboardRows : [];
    if (!exportRows.length) return;
    var headers = ['timestamp', 'fraud_type', 'risk', 'score', 'age', 'gender', 'caller_origin', 'channel', 'language'];
    var csvRows = [headers.join(',')];
    exportRows.forEach(function (row) {
      var vals = headers.map(function (h) {
        var srcKey = h === 'language' ? 'lang' : h;
        var v = row[srcKey] !== undefined ? String(row[srcKey]) : '';
        return '"' + v.replace(/"/g, '""') + '"';
      });
      csvRows.push(vals.join(','));
    });
    var blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'frauda_dashboard_export_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Notification Prefs Panel ───────────────────────────────────── */
  function openNotifPanel() {
    var overlay = document.getElementById('notifOverlay');
    var panel = document.getElementById('notifPanel');
    if (overlay) overlay.classList.add('visible');
    if (panel) panel.classList.add('open');
  }
  function closeNotifPanel() {
    var overlay = document.getElementById('notifOverlay');
    var panel = document.getElementById('notifPanel');
    if (overlay) overlay.classList.remove('visible');
    if (panel) panel.classList.remove('open');
  }

  /* ── Init — bind events and load data ───────────────────────────── */
  function init() {
    _resizeHandler = renderHourChart;
    _langHandler = function () { renderDashboardDynamic(); };

    Promise.all([FraudaData.ready, FraudaData.dashboardReady])
      .then(function () {
        STATS = FraudaData.dashboardStats(getFilters());
        FILTERED_SCENARIOS = FraudaData.filterDashboardBy(getFilters());
        renderDashboardDynamic();

        // Bind filter changes
        _filterIds.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.addEventListener('change', simulateRefresh);
        });
      })
      .catch(function (err) {
        console.error('Could not initialize dashboard from CSV:', err);
        var message = '<div class="section-meta">' + i18nT('dashboard.no_data') + '</div>';
        ['stratChart', 'ageChart', 'genderChart', 'kwGrid', 'metaTiles', 'intelGrid', 'alertList'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.innerHTML = message;
        });
        var tableBody = document.getElementById('tableBody');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" class="section-meta">' + i18nT('dashboard.table.no_data') + '</td></tr>';
      });

    window.addEventListener('resize', _resizeHandler);

    // Tooltip mousemove
    document.addEventListener('mousemove', function (e) {
      var tooltip = document.getElementById('tooltip');
      if (tooltip && tooltip.style.opacity === '1') moveTip(e);
    });

    // Refresh button
    var btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) btnRefresh.addEventListener('click', simulateRefresh);

    // Export CSV
    var btnExport = document.getElementById('btnExportCsv');
    if (btnExport) btnExport.addEventListener('click', exportCsv);

    // Notification prefs
    var btnNotif = document.getElementById('btnNotifPrefs');
    if (btnNotif) btnNotif.addEventListener('click', openNotifPanel);
    var btnNotifClose = document.getElementById('btnNotifClose');
    if (btnNotifClose) btnNotifClose.addEventListener('click', closeNotifPanel);
    var notifOverlay = document.getElementById('notifOverlay');
    if (notifOverlay) notifOverlay.addEventListener('click', closeNotifPanel);
    var btnNotifSave = document.getElementById('btnNotifSave');
    if (btnNotifSave) btnNotifSave.addEventListener('click', function () {
      closeNotifPanel();
    });

  }

  /* ── Destroy — clean up event listeners ─────────────────────────── */
  function destroy() {
    if (_resizeHandler) window.removeEventListener('resize', _resizeHandler);
    _resizeHandler = null;
    _langHandler = null;
    STATS = null;
    FILTERED_SCENARIOS = [];
  }

  return { render: render, init: init, destroy: destroy };
})();
