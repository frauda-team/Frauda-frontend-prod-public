/* ══════════════════════════════════════════════════════════════════════
   app.js — Logic for index.html (fraud message analyser)
   All scenario data comes exclusively from FraudaData (data.js → scenarios.csv)
══════════════════════════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────────────────────
let _smsCases   = [];
let _voiceCases = [];
let _smsIndex   = 0;
let _voiceIndex = 0;
let _isAnalyzing = false;
let _activeSampleType = '';
let _currentTranscriptItems = [];
let _currentScenario = null;
let _currentScenarioType = '';
let _currentAnalyzedTime = '';
let _requestData = null;

function i18nT(key, vars) {
  if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') {
    return window.FraudaI18n.t(key, vars);
  }
  return key;
}

const REQUEST_SCHEMA = [
  { id: 'reqFullName', key: 'fullName', type: 'text', required: true, minLen: 3, error: 'index.form.error.full_name' },
  { id: 'reqEmail', key: 'email', type: 'email', required: true, error: 'index.form.error.email' },
  { id: 'reqPhone', key: 'phone', type: 'phone', required: true, error: 'index.form.error.phone' },
  { id: 'reqAge', key: 'age', type: 'number', required: true, min: 18, max: 100, error: 'index.form.error.age' },
  { id: 'reqChannel', key: 'channel', type: 'select', required: true, error: 'index.form.error.channel' },
  { id: 'reqContext', key: 'context', type: 'textarea', required: true, minLen: 12, error: 'index.form.error.context' },
];

function showActionError(messageKey) {
  const el = document.getElementById('actionError');
  if (!el) return;
  el.textContent = i18nT(messageKey);
  el.style.display = 'block';
}

function clearActionError() {
  const el = document.getElementById('actionError');
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
}

function readRequestForm() {
  const data = {};
  REQUEST_SCHEMA.forEach((f) => {
    const el = document.getElementById(f.id);
    data[f.key] = (el?.value || '').trim();
  });
  return data;
}

function setFieldError(fieldId, msgKey = '') {
  const err = getFieldErrorElement(fieldId);
  const input = document.getElementById(fieldId);
  if (err) {
    err.textContent = msgKey ? i18nT(msgKey) : '';
    err.style.display = msgKey ? 'block' : 'none';
  }
  if (input) input.classList.toggle('is-invalid', !!msgKey);
}

function validateRequestForm() {
  let valid = true;
  clearActionError();
  const data = readRequestForm();

  REQUEST_SCHEMA.forEach((field) => {
    let error = '';
    const value = data[field.key];
    if (field.required && !value) error = field.error;
    if (!error && field.type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) error = field.error;
    }
    if (!error && field.type === 'phone') {
      const ok = /^\+?[0-9\s-]{8,20}$/.test(value);
      if (!ok) error = field.error;
    }
    if (!error && field.type === 'number') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < field.min || n > field.max) error = field.error;
    }
    if (!error && field.minLen && value.length < field.minLen) error = field.error;
    setFieldError(field.id, error);
    if (error) valid = false;
  });

  if (valid) _requestData = data;
  return valid;
}

function bindFormValidation() {
  REQUEST_SCHEMA.forEach((field) => {
    const el = document.getElementById(field.id);
    if (!el) return;
    const handler = () => {
      if (!el.classList.contains('is-invalid')) return;
      validateRequestForm();
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });
}

function getStatusLabel(status) {
  if (status === 'success') return i18nT('index.report.status.success');
  if (status === 'fail') return i18nT('index.report.status.fail');
  return i18nT('index.report.status.in_work');
}

function getFieldErrorElement(fieldId) {
  return document.getElementById(`err${fieldId.charAt(0).toUpperCase()}${fieldId.slice(1)}`);
}

function setSimpleFieldError(fieldId, key = '') {
  const err = getFieldErrorElement(fieldId);
  const input = document.getElementById(fieldId);
  if (err) {
    err.textContent = key ? i18nT(key) : '';
    err.style.display = key ? 'block' : 'none';
  }
  if (input) input.classList.toggle('is-invalid', !!key);
}

function renderReportHistory() {
  const authGate = document.getElementById('reportAuthGate');
  const empty = document.getElementById('reportHistoryEmpty');
  const list = document.getElementById('reportHistoryList');
  const filter = document.getElementById('reportFilter');
  if (!authGate || !empty || !list || !filter || !window.FraudaShell) return;

  const auth = window.FraudaShell.getAuth();
  if (!auth.isAuthenticated) {
    authGate.style.display = '';
    empty.style.display = 'none';
    list.innerHTML = '';
    list.style.display = 'none';
    return;
  }
  authGate.style.display = 'none';

  const statusFilter = filter.value || 'all';
  const reports = window.FraudaShell.getReports().filter((r) => r.user_id === 'test-user');
  const filtered = statusFilter === 'all' ? reports : reports.filter((r) => r.status === statusFilter);

  if (!filtered.length) {
    empty.style.display = '';
    list.innerHTML = '';
    list.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display = '';
  list.innerHTML = filtered.map((r) => {
    const ts = new Date(r.created_at);
    const time = `${String(ts.getDate()).padStart(2, '0')}.${String(ts.getMonth() + 1).padStart(2, '0')}.${ts.getFullYear()} ${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}`;
    return `
      <div class="report-item">
        <div>
          <div class="report-title" translate="no">${escapeHtml(r.summary || 'Report')}</div>
          <div class="report-meta" translate="no">${time} · ${escapeHtml(r.id)}</div>
        </div>
        <span class="status-pill ${r.status.replace(' ', '-')}" translate="no">${getStatusLabel(r.status)}</span>
      </div>
    `;
  }).join('');
}

function renderTestSubmissions() {
  const list = document.getElementById('submissionList');
  const empty = document.getElementById('submissionListEmpty');
  if (!list || !empty || !window.FraudaShell) return;
  const items = window.FraudaShell.getTestSubmissions().filter((x) => x.user_id === 'test-user');
  if (!items.length) {
    empty.style.display = '';
    list.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  list.style.display = '';
  list.innerHTML = items.map((item) => {
    const ts = new Date(item.created_at);
    const time = `${String(ts.getDate()).padStart(2, '0')}.${String(ts.getMonth() + 1).padStart(2, '0')}.${ts.getFullYear()} ${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}`;
    const body = item.type === 'text'
      ? escapeHtml(item.text_message || '')
      : escapeHtml(item.voice_file_name || '');
    const typeLabel = item.type === 'text' ? i18nT('index.submission.type.text') : i18nT('index.submission.type.voice');
    return `
      <div class="report-item">
        <div>
          <div class="report-title" translate="no">${typeLabel}</div>
          <div class="report-meta" translate="no">${time} · ${escapeHtml(item.id)}</div>
          <div class="report-body" translate="no">${body}</div>
        </div>
        <span class="status-pill in-work">${i18nT('index.report.status.in_work')}</span>
      </div>
    `;
  }).join('');
}

function switchSubmissionType(type) {
  const textWrap = document.getElementById('subTextWrap');
  const voiceWrap = document.getElementById('subVoiceWrap');
  if (!textWrap || !voiceWrap) return;
  const isText = type !== 'voice';
  textWrap.style.display = isText ? '' : 'none';
  voiceWrap.style.display = isText ? 'none' : '';
  setSimpleFieldError('subText');
  setSimpleFieldError('subVoiceFile');
}

function validateSubmissionForm() {
  const typeEl = document.getElementById('subType');
  const textEl = document.getElementById('subText');
  const voiceEl = document.getElementById('subVoiceFile');
  const errorEl = document.getElementById('submissionError');
  const successEl = document.getElementById('submissionSuccess');
  if (!typeEl || !textEl || !voiceEl || !window.FraudaShell) return null;
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
  if (successEl) {
    successEl.textContent = '';
    successEl.style.display = 'none';
  }
  const type = typeEl.value === 'voice' ? 'voice' : 'text';
  const text = (textEl.value || '').trim();
  const voiceFile = (voiceEl.value || '').trim();

  if (type === 'text') {
    if (text.length < 6) {
      setSimpleFieldError('subText', 'index.submission.error.text');
      return null;
    }
    setSimpleFieldError('subText');
    return { type, text_message: text };
  }

  if (!/\.mp4$/i.test(voiceFile)) {
    setSimpleFieldError('subVoiceFile', 'index.submission.error.voice');
    return null;
  }
  setSimpleFieldError('subVoiceFile');
  return { type, voice_file_name: voiceFile };
}

function handleSubmissionSave(e) {
  e.preventDefault();
  const errorEl = document.getElementById('submissionError');
  const successEl = document.getElementById('submissionSuccess');
  if (!window.FraudaShell) return;
  const valid = validateSubmissionForm();
  if (!valid) {
    if (errorEl) {
      errorEl.textContent = i18nT('index.submission.error.fix');
      errorEl.style.display = 'block';
    }
    return;
  }
  const save = () => {
    const entry = window.FraudaShell.addTestSubmission(valid);
    if (successEl) {
      successEl.textContent = i18nT('index.submission.saved', { id: entry.id });
      successEl.style.display = 'block';
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
    const form = document.getElementById('userSubmissionForm');
    if (form) form.reset();
    switchSubmissionType('text');
    renderTestSubmissions();
  };
  if (!window.FraudaShell.getAuth().isAuthenticated) {
    window.FraudaShell.ensureAuth({ messageKey: 'auth.required_for_upload', onSuccess: save });
    return;
  }
  save();
}

// ── Initialise after data is ready ────────────────────────────────────
FraudaData.ready
  .then(() => {
    _smsCases   = FraudaData.filterBy({ type: 'sms' });
    _voiceCases = FraudaData.filterBy({ type: 'voice' });
    // Enable buttons once data is loaded
    document.getElementById('btnText').disabled  = false;
    document.getElementById('btnVoice').disabled = false;
    document.getElementById('btnText').title  = '';
    document.getElementById('btnVoice').title = '';
  })
  .catch((err) => {
    console.error('Could not initialize submission UI from CSV:', err);
    document.getElementById('btnText').disabled  = true;
    document.getElementById('btnVoice').disabled = true;
    const awaiting = document.getElementById('awaitingArea');
    awaiting.style.display = '';
    awaiting.textContent = i18nT('index.data.error');
  });

// ── Flow step helpers ─────────────────────────────────────────────────
function resetSteps() {
  for (let i = 1; i <= 6; i++) {
    document.getElementById('step' + i + 'Icon').className  = 'step-icon';
    document.getElementById('step' + i + 'Label').className = 'step-label';
  }
}
function setStep(n, state) {
  document.getElementById('step' + n + 'Icon').className  = 'step-icon '  + state;
  document.getElementById('step' + n + 'Label').className = 'step-label ' + state;
}

// ── Add sample ─────────────────────────────────────────────────────────
function addSample(type) {
  if (_isAnalyzing) return;
  if (!validateRequestForm()) {
    showActionError('index.form.error.fix_fields');
    return;
  }

  const continueStart = () => {
    startSampleFlow(type);
  };

  if (window.FraudaShell && !window.FraudaShell.getAuth().isAuthenticated) {
    window.FraudaShell.ensureAuth({
      messageKey: 'auth.required_for_upload',
      onSuccess: continueStart,
    });
    return;
  }
  continueStart();
}

function startSampleFlow(type) {
  if (_isAnalyzing) return;
  const pool = type === 'text' ? _smsCases : _voiceCases;
  if (!pool.length) {
    const awaiting = document.getElementById('awaitingArea');
    awaiting.style.display = '';
    awaiting.textContent = type === 'text' ? i18nT('index.no_samples.text') : i18nT('index.no_samples.voice');
    return;
  }
  _isAnalyzing = true;
  _activeSampleType = type;

  let scenario;
  if (type === 'text') {
    scenario = pool[_smsIndex];
    _smsIndex = (_smsIndex + 1) % pool.length;
  } else {
    scenario = pool[_voiceIndex];
    _voiceIndex = (_voiceIndex + 1) % pool.length;
  }

  if (window.FraudaShell) {
    window.FraudaShell.createReport(_requestData || readRequestForm());
    renderReportHistory();
  }

  document.getElementById('resultArea').classList.remove('visible');
  document.getElementById('awaitingArea').style.display = 'none';
  document.getElementById('loadingArea').classList.add('visible');
  document.getElementById('btnText').disabled  = true;
  document.getElementById('btnVoice').disabled = true;
  document.getElementById('copySuccess').classList.remove('show');
  _currentTranscriptItems = [];

  resetSteps();
  setStep(1, 'active');

  for (let i = 1; i <= 5; i++) {
    document.getElementById('ls' + i).className = 'loading-step';
  }
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('loadingPct').textContent    = '0%';
  document.getElementById('loadingLabel').textContent  =
    type === 'text' ? i18nT('index.loading.text') : i18nT('index.loading.voice');

  const stepTimings = [
    { ls: 1, flow: 2, pct: 20, delay: 200 },
    { ls: 2, flow: 3, pct: 40, delay: 1200 },
    { ls: 3, flow: 4, pct: 60, delay: 2400 },
    { ls: 4, flow: 5, pct: 80, delay: 3400 },
    { ls: 5, flow: 6, pct: 95, delay: 4400 },
  ];

  stepTimings.forEach(({ ls, flow, pct, delay }) => {
    setTimeout(() => {
      if (ls > 1) {
        document.getElementById('ls' + (ls - 1)).className = 'loading-step done';
        setStep(flow - 1, 'done');
      }
      document.getElementById('ls' + ls).className = 'loading-step active';
      setStep(flow, 'active');
      document.getElementById('progressFill').style.width = pct + '%';
      document.getElementById('loadingPct').textContent   = pct + '%';
    }, delay);
  });

  setTimeout(() => {
    document.getElementById('ls5').className = 'loading-step done';
    setStep(6, 'done');
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('loadingPct').textContent   = '100%';
    setTimeout(() => {
      document.getElementById('loadingArea').classList.remove('visible');
      showResult(scenario, type);
      _isAnalyzing = false;
      _activeSampleType = '';
      document.getElementById('btnText').disabled  = false;
      document.getElementById('btnVoice').disabled = false;
    }, 400);
  }, 5000);
}

// ── Extract highlight phrases from indicator details ────────────────────
function extractHighlights(scenario) {
  const indicators = FraudaData.parseIndicators(scenario.indicators);
  const highlights = [];

  indicators.forEach(ind => {
    // Extract single-quoted phrases from detail text (e.g. 'bloķēts', '48 stundu laikā')
    const matches = ind.detail.match(/'([^']{3,})'/g) || [];
    matches.forEach(m => highlights.push({ text: m.slice(1, -1), rank: ind.rank }));
  });

  // Always highlight URLs
  const urlRe = /https?:\/\/\S+/g;
  let m;
  while ((m = urlRe.exec(scenario.transcript_text || '')) !== null) {
    highlights.push({ text: m[0], rank: 'red' });
  }

  return highlights;
}

// ── Apply highlights: wrap matched phrases in <mark> tags ───────────────
function buildHighlightedText(text, highlights) {
  if (!highlights.length) return escapeHtml(text);

  const lower = text.toLowerCase();
  const found = [];
  highlights.forEach(h => {
    const phrase = h.text.toLowerCase();
    let pos = lower.indexOf(phrase);
    while (pos !== -1) {
      found.push({ start: pos, end: pos + h.text.length, rank: h.rank });
      pos = lower.indexOf(phrase, pos + 1);
    }
  });

  if (!found.length) return escapeHtml(text);

  // Sort by start position, skip overlaps
  found.sort((a, b) => a.start - b.start);
  const clean = [];
  let maxEnd = 0;
  found.forEach(f => { if (f.start >= maxEnd) { clean.push(f); maxEnd = f.end; } });

  let result = '', last = 0;
  clean.forEach(f => {
    result += escapeHtml(text.slice(last, f.start));
    result += `<mark class="hl hl-${f.rank}">${escapeHtml(text.slice(f.start, f.end))}</mark>`;
    last = f.end;
  });
  return result + escapeHtml(text.slice(last));
}

// ── Render transcript HTML from CSV transcript_text ────────────────────
function buildTranscriptHTML(scenario) {
  const parsed = FraudaData.parseTranscript(scenario.transcript_text, scenario.type);
  if (!parsed) {
    _currentTranscriptItems = [];
    return `<div class="text-msg">${escapeHtml(i18nT('index.no_transcript'))}</div>`;
  }

  const highlights = extractHighlights(scenario);

  if (parsed.type === 'sms') {
    _currentTranscriptItems = [{ role: 'caller', text: parsed.text }];
    return `<div class="text-msg" translate="no">${buildHighlightedText(parsed.text, highlights)}</div>`;
  }

  // Voice — render conversation bubbles
  const isScam = scenario.risk === 'red' || scenario.risk === 'yellow';
  const callerLabel = isScam ? i18nT('index.caller.scammer') : i18nT('index.caller.agent');
  const recipientLabel = i18nT('index.recipient');
  const transcriptItems = [];
  const bubbles = parsed.turns.map(turn => {
    const isVictim = turn.role === 'V';
    const cls      = isVictim ? 'victim' : 'scammer';
    const avatar   = isVictim ? 'V' : 'S';
    const roleLabel = isVictim ? recipientLabel : callerLabel;
    transcriptItems.push({ role: isVictim ? 'recipient' : 'caller', text: turn.text });
    return `
      <div class="msg ${cls}" translate="no">
        <div class="msg-avatar">${avatar}</div>
        <div>
          <div class="msg-role">${roleLabel}</div>
          <div class="msg-bubble">${buildHighlightedText(turn.text, highlights)}</div>
        </div>
      </div>`;
  });
  _currentTranscriptItems = transcriptItems;
  return bubbles.join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Show result ─────────────────────────────────────────────────────────
function showResult(scenario, type, options = {}) {
  _currentTranscriptItems = [];
  _currentScenario = scenario;
  _currentScenarioType = type;

  const scoreEl = document.getElementById('scoreNumber');
  scoreEl.textContent = scenario.score + '%';
  scoreEl.className   = 'score-number ' + scenario.risk;

  const badgeEl = document.getElementById('riskBadge');
  badgeEl.textContent = i18nT(`index.risk.${scenario.risk}`);
  badgeEl.className   = 'risk-badge ' + scenario.risk;

  document.getElementById('scoreSummary').textContent = scenario.summary;
  document.getElementById('scoreNote').textContent    = ''; // no 'note' field — summary suffices

  if (!options.useExistingTime || !_currentAnalyzedTime) {
    const now = new Date();
    _currentAnalyzedTime = now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0') + ':' +
      now.getSeconds().toString().padStart(2, '0');
  }

  document.getElementById('caseTypeBadge').textContent =
    type === 'text' ? i18nT('index.case.text') : i18nT('index.case.voice');

  // Type label display
  const typeLabel = type === 'text' ? i18nT('index.type.sms') : i18nT('index.type.voice_call');
  const channelLabel = scenario.lang === 'lv' ? i18nT('index.lang.lv') :
                       scenario.lang === 'ru' ? i18nT('index.lang.ru') : i18nT('index.lang.en');

  document.getElementById('metaType').textContent     = typeLabel;
  document.getElementById('metaDuration').textContent = FraudaData.formatDuration(scenario);
  document.getElementById('metaCaller').textContent   = scenario.caller;
  document.getElementById('metaOrigin').textContent   = scenario.caller_origin;
  document.getElementById('metaLang').textContent     = channelLabel;
  document.getElementById('metaTime').textContent     = _currentAnalyzedTime;

  document.getElementById('transcriptLabel').textContent =
    type === 'text' ? i18nT('index.transcript.text_content') : i18nT('index.transcript.call_transcript');

  document.getElementById('transcriptBody').innerHTML = buildTranscriptHTML(scenario);

  // Indicators from CSV
  const indicators = FraudaData.parseIndicators(scenario.indicators);
  const indList    = document.getElementById('indicatorsList');
  indList.innerHTML = '';
  indicators.forEach((ind, i) => {
    const div = document.createElement('div');
    div.className = 'indicator-item';
    div.innerHTML = `
      <div class="indicator-rank ${ind.rank}" translate="no">${i + 1}</div>
      <div class="indicator-text">
        <strong>${escapeHtml(ind.label)}</strong>
        <span>${escapeHtml(ind.detail)}</span>
      </div>`;
    indList.appendChild(div);
  });

  const resultArea = document.getElementById('resultArea');
  resultArea.classList.add('visible', 'fade-in');
  if (!options.skipScroll) {
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ── Copy transcript ─────────────────────────────────────────────────────
function copyTranscript() {
  if (!_currentTranscriptItems.length) return;

  function showSuccess() {
    const el = document.getElementById('copySuccess');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  const formatted = _currentTranscriptItems.map(item => {
    const label = item.role === 'recipient' ? i18nT('index.copy.recipient') : i18nT('index.copy.unknown');
    return `[${label}]\n${item.text}`;
  }).join('\n\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(formatted).then(showSuccess)
      .catch(() => execCommandCopy(formatted, showSuccess));
  } else {
    execCommandCopy(formatted, showSuccess);
  }
}

function execCommandCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); callback(); } catch(e) { console.warn('Copy failed:', e); }
  document.body.removeChild(ta);
}

// ── Reset ───────────────────────────────────────────────────────────────
function resetTool() {
  document.getElementById('resultArea').classList.remove('visible');
  document.getElementById('awaitingArea').style.display = '';
  resetSteps();
  _currentTranscriptItems = [];
  _currentScenario = null;
  _currentScenarioType = '';
  _currentAnalyzedTime = '';
}

// ── Disable buttons until data loads ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnText').disabled  = true;
  document.getElementById('btnVoice').disabled = true;
  document.getElementById('btnText').title     = i18nT('index.title.loading_data');
  document.getElementById('btnVoice').title    = i18nT('index.title.loading_data');
  bindFormValidation();
  const filter = document.getElementById('reportFilter');
  if (filter) filter.addEventListener('change', renderReportHistory);
  const authBtn = document.getElementById('btnHistoryLogin');
  if (authBtn) authBtn.addEventListener('click', () => {
    if (window.FraudaShell) window.FraudaShell.openAuthModal('auth.required_for_history');
  });
  window.addEventListener('frauda:auth-changed', renderReportHistory);
  window.addEventListener('frauda:reports-changed', renderReportHistory);
  window.addEventListener('frauda:test-submissions-changed', renderTestSubmissions);
  renderReportHistory();

  const subType = document.getElementById('subType');
  if (subType) subType.addEventListener('change', (ev) => switchSubmissionType(ev.target.value));
  const subForm = document.getElementById('userSubmissionForm');
  if (subForm) subForm.addEventListener('submit', handleSubmissionSave);
  switchSubmissionType((subType && subType.value) || 'text');
  renderTestSubmissions();
});

window.addEventListener('frauda:lang-changed', () => {
  if (_isAnalyzing && _activeSampleType) {
    document.getElementById('loadingLabel').textContent =
      _activeSampleType === 'text' ? i18nT('index.loading.text') : i18nT('index.loading.voice');
  }

  if (_currentScenario && _currentScenarioType) {
    showResult(_currentScenario, _currentScenarioType, { skipScroll: true, useExistingTime: true });
  }

  renderReportHistory();
  renderTestSubmissions();
  const hasInvalid = REQUEST_SCHEMA.some((f) => {
    const el = document.getElementById(f.id);
    return el && el.classList.contains('is-invalid');
  });
  if (hasInvalid) validateRequestForm();
});
