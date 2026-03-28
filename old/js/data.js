/* ══════════════════════════════════════════════════════════════════════
   FraudaData — single data layer for all pages
   Loads scenarios.csv and exposes a clean API.
   CSV is the only source of scenario data.
══════════════════════════════════════════════════════════════════════ */

const FraudaData = (function () {

  let _scenarios = [];
  let _dashboardRows = [];
  let _loadError = null;

  // ── CSV parser (RFC 4180 compliant, no external libs) ────────────────
  function parseCSV(text) {
    const rows = [];
    let i = 0;
    const n = text.length;

    while (i < n) {
      const row = [];
      // parse one row
      while (i < n && text[i] !== '\n') {
        let field = '';
        if (text[i] === '"') {
          i++; // skip opening quote
          while (i < n) {
            if (text[i] === '"') {
              if (text[i + 1] === '"') { field += '"'; i += 2; } // escaped quote
              else { i++; break; } // closing quote
            } else {
              field += text[i++];
            }
          }
        } else {
          while (i < n && text[i] !== ',' && text[i] !== '\n') {
            field += text[i++];
          }
        }
        row.push(field.trim());
        if (i < n && text[i] === ',') i++; // skip comma
      }
      if (i < n && text[i] === '\n') i++; // skip newline
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
    }
    return rows;
  }

  function rowsToObjects(rows) {
    const headers = rows[0];
    const expectedLen = headers.length;
    const transcriptColIdx = headers.indexOf('transcript_text');

    function normalizeRow(row, rowNumber) {
      if (row.length === expectedLen) return row;

      // Some transcript_text fields may contain commas without CSV quoting.
      // In that case, join overflow columns back into transcript_text.
      if (transcriptColIdx !== -1 && row.length > expectedLen) {
        const fixed = row.slice(0, transcriptColIdx);
        const transcriptParts = row.slice(transcriptColIdx);
        fixed.push(transcriptParts.join(',').trim());
        if (fixed.length === expectedLen) {
          console.warn(`FraudaData: normalized malformed CSV row ${rowNumber} (extra columns merged into transcript_text).`);
          return fixed;
        }
      }

      if (row.length < expectedLen) {
        console.warn(`FraudaData: row ${rowNumber} has missing columns (${row.length}/${expectedLen}); padding empty values.`);
        return row.concat(new Array(expectedLen - row.length).fill(''));
      }

      console.warn(`FraudaData: row ${rowNumber} still malformed after normalization (${row.length}/${expectedLen}); truncating extras.`);
      return row.slice(0, expectedLen);
    }

    return rows.slice(1).map((row, idx) => {
      const fixedRow = normalizeRow(row, idx + 2);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = fixedRow[i] || ''; });
      return obj;
    });
  }

  // ── Coerce types ─────────────────────────────────────────────────────
  function coerce(obj) {
    // Derive tests_passed from indicator count (schema: number of social engineering categories triggered)
    const indicators = parseIndicators(obj.indicators);
    return {
      ...obj,
      id: parseInt(obj.id, 10),
      duration_seconds: parseInt(obj.duration_seconds, 10),
      score: parseInt(obj.score, 10),
      age: parseInt(obj.age, 10),
      tests_passed: indicators.length,
      tests_total: 8,
    };
  }

  // ── Indicator parser: "[red]Label//Detail|[yellow]Label//Detail" ─────
  function parseIndicators(str) {
    if (!str) return [];
    return str.split('|').map(part => {
      const rankMatch = part.match(/^\[(\w+)\]/);
      const rank = rankMatch ? rankMatch[1] : 'yellow';
      const rest = part.replace(/^\[\w+\]/, '');
      const [label, detail] = rest.split('//');
      return { rank, label: (label || '').trim(), detail: (detail || '').trim() };
    });
  }

  // ── Transcript parser: "S: text || V: text || S: text" ──────────────
  function parseTranscript(str, type) {
    if (!str) return null;
    if (type === 'sms') return { type: 'sms', text: str };
    const turns = str.split(' || ').map(turn => {
      const colonIdx = turn.indexOf(': ');
      if (colonIdx === -1) return { role: 'S', text: turn };
      const role = turn.slice(0, colonIdx).trim();
      const text = turn.slice(colonIdx + 2).trim();
      return { role, text };
    });
    return { type: 'voice', turns };
  }

  // ── Duration formatter ───────────────────────────────────────────────
  function formatDuration(scenario) {
    if (scenario.type === 'sms') {
      return scenario.duration_seconds + ' rakstzīmes';
    }
    const s = scenario.duration_seconds;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + 'm ' + String(sec).padStart(2, '0') + 's';
  }

  function ageGroupOf(age) {
    if (age <= 24) return '18–24';
    if (age <= 34) return '25–34';
    if (age <= 49) return '35–49';
    if (age <= 64) return '50–64';
    return '65+';
  }

  function indicatorLabelsFromIndicators(indicatorsStr) {
    return parseIndicators(indicatorsStr).map(ind => ind.label).filter(Boolean);
  }

  function toDashboardRow(s) {
    const labels = indicatorLabelsFromIndicators(s.indicators);
    const timestamp = s.timestamp || '';
    const hourStr = ((timestamp.split('T')[1] || '00:00:00').split(':')[0] || '0');
    const hour = parseInt(hourStr, 10);
    return {
      id: s.id,
      source_id: s.id,
      timestamp,
      date: (timestamp || '').slice(0, 10),
      hour: Number.isFinite(hour) ? hour : 0,
      type: s.type,
      channel: s.channel,
      score: s.score,
      risk: s.risk,
      risk_label: s.risk_label,
      caller_origin: s.caller_origin,
      lang: s.lang,
      age: s.age,
      age_group: ageGroupOf(s.age),
      gender: s.gender,
      occupation: s.occupation,
      fraud_type: s.fraud_type,
      summary: s.summary,
      indicators: s.indicators,
      indicator_labels: labels.join(' | '),
      transcript_text: s.transcript_text,
    };
  }

  function coerceDashboard(obj) {
    return {
      ...obj,
      id: parseInt(obj.id, 10),
      source_id: parseInt(obj.source_id || obj.id, 10),
      hour: parseInt(obj.hour, 10),
      score: parseInt(obj.score, 10),
      age: parseInt(obj.age, 10),
      age_group: obj.age_group || ageGroupOf(parseInt(obj.age, 10)),
    };
  }

  // ── Stats aggregator ─────────────────────────────────────────────────
  function computeStats(scenarios) {
    const byRisk    = { red: 0, yellow: 0, green: 0 };
    const byType    = { voice: 0, sms: 0 };
    const byChannel = { vishing: 0, smishing: 0 };
    const byLang    = {};
    const byGender  = { male: 0, female: 0 };
    const byOccupation = {};
    const byFraudType  = {};
    const byOrigin     = {};
    const byHour       = new Array(24).fill(0);
    const byAgeGroup   = { '18–24': 0, '25–34': 0, '35–49': 0, '50–64': 0, '65+': 0 };

    // Cross-tabs for charts
    const fraudTypeLabels = {
      phishing_link: 'Phishing saite',
      delivery_fraud: 'Piegādes maksa',
      legitimate: 'Likumīgi',
      government_impersonation: 'VID / valsts drauds',
      otp_theft: 'OTP iegūšana',
      bank_impersonation: 'Bankas uzdošanās',
      investment_scam: 'Investīciju krāpn.',
      utility_fraud: 'Komunālie pakalpojumi',
    };

    const ageXFraud = {};
    const genderXFraud = {};
    const allFraudLabels = new Set();

    scenarios.forEach(s => {
      byRisk[s.risk]++;
      byType[s.type]++;
      byChannel[s.channel]++;
      byLang[s.lang] = (byLang[s.lang] || 0) + 1;
      byGender[s.gender] = (byGender[s.gender] || 0) + 1;
      byOccupation[s.occupation] = (byOccupation[s.occupation] || 0) + 1;
      byFraudType[s.fraud_type] = (byFraudType[s.fraud_type] || 0) + 1;
      byOrigin[s.caller_origin] = (byOrigin[s.caller_origin] || 0) + 1;

      const hour = parseInt((s.timestamp || '').split('T')[1] || '0', 10);
      if (hour >= 0 && hour < 24) byHour[hour]++;

      const ag = ageGroupOf(s.age);
      byAgeGroup[ag]++;

      // cross-tabs (only for non-legitimate)
      if (s.fraud_type !== 'legitimate') {
        const label = fraudTypeLabels[s.fraud_type] || s.fraud_type;
        allFraudLabels.add(label);

        if (!ageXFraud[ag]) ageXFraud[ag] = {};
        ageXFraud[ag][label] = (ageXFraud[ag][label] || 0) + 1;

        if (!genderXFraud[s.gender]) genderXFraud[s.gender] = {};
        genderXFraud[s.gender][label] = (genderXFraud[s.gender][label] || 0) + 1;
      }
    });

    const total = scenarios.length;
    const fraudScenarios = scenarios.filter(s => s.fraud_type !== 'legitimate');
    const avgScore = total ? (scenarios.reduce((a, s) => a + s.score, 0) / total) : 0;
    const fraudTotal = fraudScenarios.length || 1;

    // Top strategies (non-legitimate, sorted by count)
    const strategyMap = {};
    fraudScenarios.forEach(s => {
      strategyMap[s.fraud_type] = (strategyMap[s.fraud_type] || 0) + 1;
    });
    const strategies = Object.entries(strategyMap)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        label: fraudTypeLabels[type] || type,
        count,
        pct: Math.round(count / fraudTotal * 100),
      }));

    return {
      total,
      highRisk: byRisk.red,
      avgScore: Math.round(avgScore * 10) / 10,
      byRisk, byType, byChannel, byLang, byGender,
      byOccupation, byFraudType, byOrigin, byHour,
      byAgeGroup, ageXFraud, genderXFraud,
      strategies,
      allFraudLabels: Array.from(allFraudLabels),
      fraudTypeLabels,
    };
  }

  function filterRows(rows, { type, risk, occupation, lang, channel, gender, fraud_type, date, ageGroup, caller_origin } = {}) {
    return rows.filter(s =>
      (!type       || s.type       === type)       &&
      (!risk       || s.risk       === risk)       &&
      (!occupation || s.occupation === occupation) &&
      (!lang       || s.lang       === lang)       &&
      (!channel    || s.channel    === channel)    &&
      (!gender     || s.gender     === gender)     &&
      (!fraud_type || s.fraud_type === fraud_type) &&
      (!date       || (s.timestamp || '').startsWith(date)) &&
      (!ageGroup   || ageGroupOf(s.age) === ageGroup || s.age_group === ageGroup) &&
      (!caller_origin || s.caller_origin === caller_origin)
    );
  }

  // ── Public API ────────────────────────────────────────────────────────
  const api = {
    scenarios: [],
    dashboardRows: [],

    ready: fetch('data/scenarios.csv')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} while loading data/scenarios.csv`);
        return r.text();
      })
      .then(text => {
        const rows = parseCSV(text);
        if (!rows.length) throw new Error('data/scenarios.csv is empty');
        _scenarios = rowsToObjects(rows).map(coerce);
        api.scenarios = _scenarios;
        _loadError = null;
        return _scenarios;
      })
      .catch(err => {
        _loadError = err;
        console.error('FraudaData: failed to load scenarios.csv', err);
        throw err;
      }),

    dashboardReady: fetch('data/dashboard_graph.csv')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} while loading data/dashboard_graph.csv`);
        return r.text();
      })
      .then(text => {
        const rows = parseCSV(text);
        if (!rows.length) throw new Error('data/dashboard_graph.csv is empty');
        _dashboardRows = rowsToObjects(rows).map(coerceDashboard);
        api.dashboardRows = _dashboardRows;
        return _dashboardRows;
      })
      .catch(err => {
        console.warn('FraudaData: dashboard_graph.csv unavailable, deriving dashboard rows from scenarios.csv', err);
        return api.ready.then(() => {
          _dashboardRows = _scenarios.map(toDashboardRow);
          api.dashboardRows = _dashboardRows;
          return _dashboardRows;
        });
      }),

    getById(id) {
      return _scenarios.find(s => s.id === id) || null;
    },

    filterBy({ type, risk, occupation, lang, channel, gender, fraud_type, date, ageGroup, caller_origin } = {}) {
      return filterRows(_scenarios, { type, risk, occupation, lang, channel, gender, fraud_type, date, ageGroup, caller_origin });
    },

    filterDashboardBy({ type, risk, occupation, lang, channel, gender, fraud_type, date, ageGroup, caller_origin } = {}) {
      return filterRows(_dashboardRows, { type, risk, occupation, lang, channel, gender, fraud_type, date, ageGroup, caller_origin });
    },

    stats(filters = null) {
      const rows = filters ? api.filterBy(filters) : _scenarios;
      return computeStats(rows);
    },

    dashboardStats(filters = null) {
      const rows = filters ? api.filterDashboardBy(filters) : _dashboardRows;
      return computeStats(rows);
    },

    getLoadError() {
      return _loadError;
    },

    // Helpers for rendering
    formatDuration,
    parseIndicators,
    parseTranscript,
  };

  return api;
})();
