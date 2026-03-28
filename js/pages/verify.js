/* ══════════════════════════════════════════════════════════════════════
   FraudaVerify — Message Verification page (/verify)
   Three input tabs: sample scenarios, custom message (with metadata), voice recording.
   Form validation: custom message requires ≥6 chars, voice requires file selected.
   Report button active for scores ≥40%, inactive with tooltip for <40%.
══════════════════════════════════════════════════════════════════════ */

window.FraudaVerify = (function () {
  'use strict';

  var _smsCases = [];
  var _voiceCases = [];
  var _smsIndex = 0;
  var _voiceIndex = 0;
  var _isAnalyzing = false;
  var _currentTranscriptItems = [];
  var _currentScenario = null;
  var _currentScenarioType = '';
  var _currentAnalyzedTime = '';
  var _activeTab = 'submit';
  var _inputMode = 'sample';
  var _expandedReportId = null;
  var _openPanel = null; // "report" | "api"

  function t(key, vars) {
    if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') return window.FraudaI18n.t(key, vars);
    return key;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function pushRouteState(extra) {
    window.dispatchEvent(new CustomEvent('frauda:route-state', {
      detail: Object.assign({
        panel: _openPanel,
        reportId: _expandedReportId,
      }, extra || {}),
    }));
  }

  function render() {
    return ''
    + '<div class="verify-layout enter-up">'
    + '  <div class="verify-header">'
    + '    <h1 data-i18n="verify.title">' + t('verify.title') + '</h1>'
    + '    <p data-i18n="verify.desc">' + t('verify.desc') + '</p>'
    + '  </div>'

    + '  <div class="verify-tabs">'
    + '    <button class="verify-tab ' + (_activeTab === 'submit' ? 'active' : '') + '" id="tabSubmit" type="button" data-i18n="verify.tab.submit">' + t('verify.tab.submit') + '</button>'
    + '    <button class="verify-tab ' + (_activeTab === 'history' ? 'active' : '') + '" id="tabHistory" type="button" data-i18n="verify.tab.history">' + t('verify.tab.history') + '</button>'
    + '  </div>'

    + '  <div id="submitPanel" style="display:' + (_activeTab === 'submit' ? '' : 'none') + '">'
    + '    <div class="card verify-primary-card">'
    + '      <div class="card-header"><span class="card-title" data-i18n="verify.input.title">' + t('verify.input.title') + '</span></div>'
    + '      <div class="card-body">'
    + '        <div class="input-tabs">'
    + '          <button class="input-tab ' + (_inputMode === 'sample' ? 'active' : '') + '" id="modesSample" type="button" data-i18n="verify.mode.sample">' + t('verify.mode.sample') + '</button>'
    + '          <button class="input-tab ' + (_inputMode === 'custom' ? 'active' : '') + '" id="modesCustom" type="button" data-i18n="verify.mode.custom">' + t('verify.mode.custom') + '</button>'
    + '          <button class="input-tab ' + (_inputMode === 'voice' ? 'active' : '') + '" id="modesVoiceUpload" type="button" data-i18n="verify.mode.voice">' + t('verify.mode.voice') + '</button>'
    + '        </div>'

    + '        <div id="sampleMode" style="display:' + (_inputMode === 'sample' ? '' : 'none') + '">'
    + '          <p class="field-help" style="margin-bottom:12px" data-i18n="verify.sample.desc">' + t('verify.sample.desc') + '</p>'
    + '          <div class="input-area">'
    + '            <button class="btn btn-primary btn-lg" id="btnText" type="button" disabled>'
    + '              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    + '              <span data-i18n="verify.btn.sample_text">' + t('verify.btn.sample_text') + '</span>'
    + '            </button>'
    + '            <button class="btn btn-secondary btn-lg" id="btnVoice" type="button" disabled>'
    + '              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'
    + '              <span data-i18n="verify.btn.sample_voice">' + t('verify.btn.sample_voice') + '</span>'
    + '            </button>'
    + '          </div>'
    + '        </div>'

    + '        <div id="customMode" style="display:' + (_inputMode === 'custom' ? '' : 'none') + '">'
    + '          <div class="form-field" style="margin-bottom:12px">'
    + '            <label for="customMessage" data-i18n="verify.custom.label">' + t('verify.custom.label') + '</label>'
    + '            <textarea id="customMessage" rows="4" placeholder="' + t('verify.custom.placeholder') + '" data-i18n-placeholder="verify.custom.placeholder"></textarea>'
    + '            <div class="field-help" data-i18n="verify.custom.help">' + t('verify.custom.help') + '</div>'
    + '            <div class="validation-error" id="customMessageError" style="display:none;color:#E8274B;font-size:0.8rem;margin-top:4px;"></div>'
    + '          </div>'
    + '          <div class="verify-metadata-grid">'
    + '            <div class="form-field">'
    + '              <label for="customLinks" data-i18n="verify.custom.links_label">' + t('verify.custom.links_label') + '</label>'
    + '              <textarea id="customLinks" rows="2" placeholder="' + t('verify.custom.links_placeholder') + '" data-i18n-placeholder="verify.custom.links_placeholder"></textarea>'
    + '            </div>'
    + '            <div class="form-field">'
    + '              <label for="customNumber" data-i18n="verify.custom.number_label">' + t('verify.custom.number_label') + '</label>'
    + '              <input type="tel" id="customNumber" placeholder="+371..." />'
    + '            </div>'
    + '            <div class="form-field">'
    + '              <label for="customDatetime" data-i18n="verify.custom.datetime_label">' + t('verify.custom.datetime_label') + '</label>'
    + '              <input type="datetime-local" id="customDatetime" />'
    + '            </div>'
    + '            <div class="form-field">'
    + '              <label for="customLanguage" data-i18n="verify.custom.language_label">' + t('verify.custom.language_label') + '</label>'
    + '              <select id="customLanguage">'
    + '                <option value="lv" data-i18n="verify.custom.language.latvian">' + t('verify.custom.language.latvian') + '</option>'
    + '                <option value="en" data-i18n="verify.custom.language.english">' + t('verify.custom.language.english') + '</option>'
    + '                <option value="ru" data-i18n="verify.custom.language.russian">' + t('verify.custom.language.russian') + '</option>'
    + '                <option value="other" data-i18n="verify.custom.language.other">' + t('verify.custom.language.other') + '</option>'
    + '              </select>'
    + '            </div>'
    + '            <div class="form-field" style="grid-column: 1 / -1">'
    + '              <label for="customAdditional" data-i18n="verify.custom.additional_label">' + t('verify.custom.additional_label') + '</label>'
    + '              <textarea id="customAdditional" rows="2" placeholder="' + t('verify.custom.additional_placeholder') + '" data-i18n-placeholder="verify.custom.additional_placeholder"></textarea>'
    + '            </div>'
    + '          </div>'
    + '          <div class="input-area" style="margin-top:16px">'
    + '            <button class="btn btn-primary btn-lg" id="btnSubmitCustom" type="button" disabled>'
    + '              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>'
    + '              <span data-i18n="verify.btn.submit_custom">' + t('verify.btn.submit_custom') + '</span>'
    + '            </button>'
    + '          </div>'
    + '          <div class="inline-error" id="customSubmitError"></div>'
    + '          <div class="inline-success" id="customSubmitSuccess"></div>'
    + '        </div>'

    + '        <div id="voiceUploadMode" style="display:' + (_inputMode === 'voice' ? '' : 'none') + '">'
    + '          <div class="voice-upload-area" id="voiceUploadArea">'
    + '            <input type="file" id="voiceFileInput" accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,.mp3,.wav,.ogg,.m4a" style="display:none" />'
    + '            <svg class="voice-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
    + '              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>'
    + '              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>'
    + '              <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'
    + '            </svg>'
    + '            <div class="voice-upload-title" data-i18n="verify.voice.upload_title">' + t('verify.voice.upload_title') + '</div>'
    + '            <div class="voice-upload-formats" data-i18n="verify.voice.upload_formats">' + t('verify.voice.upload_formats') + '</div>'
    + '            <div class="voice-file-selected" id="voiceFileSelected" style="display:none">'
    + '              <span data-i18n="verify.voice.file_selected">' + t('verify.voice.file_selected') + '</span>'
    + '              <span class="voice-file-name" id="voiceFileName"></span>'
    + '              <button type="button" class="voice-file-remove" id="voiceFileRemove" data-i18n="verify.voice.remove_file">' + t('verify.voice.remove_file') + '</button>'
    + '            </div>'
    + '          </div>'
    + '          <div class="verify-metadata-grid" style="margin-top:16px">'
    + '            <div class="form-field">'
    + '              <label for="voiceNumber" data-i18n="verify.voice.caller_label">' + t('verify.voice.caller_label') + '</label>'
    + '              <input type="tel" id="voiceNumber" placeholder="+371..." />'
    + '            </div>'
    + '            <div class="form-field">'
    + '              <label for="voiceDatetime" data-i18n="verify.voice.datetime_label">' + t('verify.voice.datetime_label') + '</label>'
    + '              <input type="datetime-local" id="voiceDatetime" />'
    + '            </div>'
    + '            <div class="form-field">'
    + '              <label data-i18n="verify.voice.duration_label">' + t('verify.voice.duration_label') + '</label>'
    + '              <div class="voice-duration-inputs">'
    + '                <input type="number" id="voiceDurationMin" min="0" placeholder="0" />'
    + '                <span data-i18n="verify.voice.duration_min">' + t('verify.voice.duration_min') + '</span>'
    + '                <input type="number" id="voiceDurationSec" min="0" max="59" placeholder="0" />'
    + '                <span data-i18n="verify.voice.duration_sec">' + t('verify.voice.duration_sec') + '</span>'
    + '              </div>'
    + '            </div>'
    + '            <div class="form-field">'
    + '              <label for="voiceLanguage" data-i18n="verify.voice.language_label">' + t('verify.voice.language_label') + '</label>'
    + '              <select id="voiceLanguage">'
    + '                <option value="lv" data-i18n="verify.custom.language.latvian">' + t('verify.custom.language.latvian') + '</option>'
    + '                <option value="en" data-i18n="verify.custom.language.english">' + t('verify.custom.language.english') + '</option>'
    + '                <option value="ru" data-i18n="verify.custom.language.russian">' + t('verify.custom.language.russian') + '</option>'
    + '                <option value="other" data-i18n="verify.custom.language.other">' + t('verify.custom.language.other') + '</option>'
    + '              </select>'
    + '            </div>'
    + '            <div class="form-field" style="grid-column: 1 / -1">'
    + '              <label for="voiceAdditional" data-i18n="verify.voice.additional_label">' + t('verify.voice.additional_label') + '</label>'
    + '              <textarea id="voiceAdditional" rows="2" placeholder="' + t('verify.voice.additional_placeholder') + '" data-i18n-placeholder="verify.voice.additional_placeholder"></textarea>'
    + '            </div>'
    + '          </div>'
    + '          <div class="input-area" style="margin-top:16px">'
    + '            <button class="btn btn-primary btn-lg" id="btnSubmitVoice" type="button" disabled>'
    + '              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>'
    + '              <span data-i18n="verify.voice.submit">' + t('verify.voice.submit') + '</span>'
    + '            </button>'
    + '          </div>'
    + '          <div class="validation-error" id="voiceFileError" style="display:none;color:#E8274B;font-size:0.8rem;margin-top:8px;"></div>'
    + '          <div class="voice-submit-success" id="voiceSubmitSuccess" style="display:none" data-i18n="verify.voice.success">' + t('verify.voice.success') + '</div>'
    + '        </div>'
    + '      </div>'
    + '    </div>'

    + '    <div class="card">'
    + '      <div class="card-body">'
    + '        <div class="process-flow" id="processFlow">'
    + '          <div class="process-step"><div class="step-icon" id="step1Icon">1</div><div class="step-label" id="step1Label" data-i18n="index.flow.input">' + t('index.flow.input') + '</div></div>'
    + '          <div class="process-step"><div class="step-icon" id="step2Icon">2</div><div class="step-label" id="step2Label" data-i18n="index.flow.preprocess">' + t('index.flow.preprocess') + '</div></div>'
    + '          <div class="process-step"><div class="step-icon" id="step3Icon">3</div><div class="step-label" id="step3Label" data-i18n="index.flow.nlp">' + t('index.flow.nlp') + '</div></div>'
    + '          <div class="process-step"><div class="step-icon" id="step4Icon">4</div><div class="step-label" id="step4Label" data-i18n="index.flow.pattern">' + t('index.flow.pattern') + '</div></div>'
    + '          <div class="process-step"><div class="step-icon" id="step5Icon">5</div><div class="step-label" id="step5Label" data-i18n="index.flow.scoring">' + t('index.flow.scoring') + '</div></div>'
    + '          <div class="process-step"><div class="step-icon" id="step6Icon">6</div><div class="step-label" id="step6Label" data-i18n="index.flow.result">' + t('index.flow.result') + '</div></div>'
    + '        </div>'
    + '      </div>'
    + '      <div class="loading-area" id="loadingArea">'
    + '        <div class="loading-header"><span class="loading-label" id="loadingLabel" data-i18n="index.loading.default">' + t('index.loading.default') + '</span><span class="loading-pct" id="loadingPct" translate="no">0%</span></div>'
    + '        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>'
    + '        <div class="loading-steps">'
    + '          <div class="loading-step" id="ls1"><div class="loading-step-dot"></div><span data-i18n="index.loading.step1">' + t('index.loading.step1') + '</span></div>'
    + '          <div class="loading-step" id="ls2"><div class="loading-step-dot"></div><span data-i18n="index.loading.step2">' + t('index.loading.step2') + '</span></div>'
    + '          <div class="loading-step" id="ls3"><div class="loading-step-dot"></div><span data-i18n="index.loading.step3">' + t('index.loading.step3') + '</span></div>'
    + '          <div class="loading-step" id="ls4"><div class="loading-step-dot"></div><span data-i18n="index.loading.step4">' + t('index.loading.step4') + '</span></div>'
    + '          <div class="loading-step" id="ls5"><div class="loading-step-dot"></div><span data-i18n="index.loading.step5">' + t('index.loading.step5') + '</span></div>'
    + '        </div>'
    + '      </div>'
    + '      <div class="awaiting-area" id="awaitingArea"><span data-i18n="verify.awaiting">' + t('verify.awaiting') + '</span></div>'
    + '    </div>'

    + '    <div class="card result-area" id="resultArea">'
    + '      <div class="card-header">'
    + '        <span class="card-title" data-i18n="index.result.title">' + t('index.result.title') + '</span>'
    + '        <span id="caseTypeBadge" style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em"></span>'
    + '      </div>'
    + '      <div class="score-row">'
    + '        <div class="score-gauge"><div class="score-number" id="scoreNumber" translate="no">&mdash;</div><div class="score-unit" data-i18n="index.score.unit">' + t('index.score.unit') + '</div></div>'
    + '        <div><div class="risk-badge" id="riskBadge">&mdash;</div></div>'
    + '        <div class="score-meta"><div class="score-summary" id="scoreSummary">&mdash;</div><div class="score-note" id="scoreNote" translate="no"></div></div>'
    + '      </div>'
    + '      <div class="meta-grid">'
    + '        <div class="meta-card"><div class="meta-label" data-i18n="index.meta.type">' + t('index.meta.type') + '</div><div class="meta-value" id="metaType">&mdash;</div></div>'
    + '        <div class="meta-card"><div class="meta-label" data-i18n="index.meta.duration">' + t('index.meta.duration') + '</div><div class="meta-value" id="metaDuration">&mdash;</div></div>'
    + '        <div class="meta-card"><div class="meta-label" data-i18n="index.meta.caller">' + t('index.meta.caller') + '</div><div class="meta-value" id="metaCaller" translate="no">&mdash;</div></div>'
    + '        <div class="meta-card"><div class="meta-label" data-i18n="index.meta.origin">' + t('index.meta.origin') + '</div><div class="meta-value" id="metaOrigin" translate="no">&mdash;</div></div>'
    + '        <div class="meta-card"><div class="meta-label" data-i18n="index.meta.language">' + t('index.meta.language') + '</div><div class="meta-value" id="metaLang">&mdash;</div></div>'
    + '        <div class="meta-card"><div class="meta-label" data-i18n="index.meta.analyzed">' + t('index.meta.analyzed') + '</div><div class="meta-value" id="metaTime" translate="no">&mdash;</div></div>'
    + '      </div>'
    + '      <div class="transcript-header"><span class="transcript-label" id="transcriptLabel" data-i18n="index.transcript.default">' + t('index.transcript.default') + '</span></div>'
    + '      <div class="transcript-body" id="transcriptBody"></div>'
    + '      <div class="card-header" style="border-top:1px solid var(--border-light)"><span class="card-title" data-i18n="index.section.indicators">' + t('index.section.indicators') + '</span></div>'
    + '      <div class="indicators-list" id="indicatorsList"></div>'
    + '      <div id="reportSuccessBanner" class="report-success-banner" style="display:none"></div>'
    + '      <div class="actions-bar">'
    + '        <button class="btn btn-secondary btn-sm" id="btnCopy" type="button"><span data-i18n="index.btn.copy">' + t('index.btn.copy') + '</span></button>'
    + '        <span class="copy-success" id="copySuccess" data-i18n="index.copy.success">' + t('index.copy.success') + '</span>'
    + '        <div style="flex:1"></div>'
    + '        <div id="reportBtnContainer" style="position:relative;display:none"></div>'
    + '        <button class="btn btn-ghost btn-sm" id="btnReset" type="button" data-i18n="index.btn.reset">' + t('index.btn.reset') + '</button>'
    + '      </div>'
    + '    </div>'
    + '  </div>'

    + '  <div id="historyPanel" style="display:' + (_activeTab === 'history' ? '' : 'none') + '">'
    + '    <div class="card">'
    + '      <div class="card-header">'
    + '        <span class="card-title" data-i18n="verify.history.title">' + t('verify.history.title') + '</span>'
    + '        <div class="history-filter">'
    + '          <label for="reportFilter" data-i18n="index.report.filter.label">' + t('index.report.filter.label') + '</label>'
    + '          <select id="reportFilter">'
    + '            <option value="all" data-i18n="index.report.filter.all">' + t('index.report.filter.all') + '</option>'
    + '            <option value="in work" data-i18n="index.report.filter.in_work">' + t('index.report.filter.in_work') + '</option>'
    + '            <option value="success" data-i18n="index.report.filter.success">' + t('index.report.filter.success') + '</option>'
    + '            <option value="fail" data-i18n="index.report.filter.fail">' + t('index.report.filter.fail') + '</option>'
    + '          </select>'
    + '        </div>'
    + '      </div>'
    + '      <div class="card-body">'
    + '        <div class="state-card" id="reportAuthGate">'
    + '          <strong data-i18n="index.report.auth.title">' + t('index.report.auth.title') + '</strong>'
    + '          <span data-i18n="index.report.auth.desc">' + t('index.report.auth.desc') + '</span>'
    + '          <button class="btn btn-secondary btn-sm" id="btnHistoryLogin" type="button" data-i18n="index.report.auth.cta">' + t('index.report.auth.cta') + '</button>'
    + '        </div>'
    + '        <div class="state-card" id="reportHistoryEmpty" style="display:none">'
    + '          <strong data-i18n="index.report.empty.title">' + t('index.report.empty.title') + '</strong>'
    + '          <span data-i18n="index.report.empty.desc">' + t('index.report.empty.desc') + '</span>'
    + '        </div>'
    + '        <div class="report-list" id="reportHistoryList"></div>'
    + '      </div>'
    + '    </div>'
    + '  </div>'

    + '  <div class="verify-footer-actions">'
    + '    <button class="btn btn-ghost btn-sm" id="btnRequestApi" type="button">'
    + '      <span data-i18n="verify.btn.request_api">' + t('verify.btn.request_api') + '</span>'
    + '    </button>'
    + '  </div>'
    + '</div>';
  }

  function init() {
    bindEvents();
    resetSteps();
    setStep(1, 'active');
    loadData();
    renderReportHistory();
    if (_currentScenario) showResult(_currentScenario, _currentScenarioType);
  }

  function restoreState(state) {
    if (!state) return;
    if (state.reportId !== undefined) _expandedReportId = state.reportId;
    if (state.panel !== undefined) _openPanel = state.panel;
    if (state.panel === 'report') openReportPanel();
    if (state.panel === 'api') openApiPanel();
    if (_activeTab === 'history') renderReportHistory();
  }

  function destroy() {
    window.removeEventListener('frauda:auth-changed', renderReportHistory);
    window.removeEventListener('frauda:reports-changed', renderReportHistory);
    _isAnalyzing = false;
  }

  function bindEvents() {
    var tabSubmit = document.getElementById('tabSubmit');
    var tabHistory = document.getElementById('tabHistory');
    if (tabSubmit) tabSubmit.addEventListener('click', function () { switchTab('submit'); });
    if (tabHistory) tabHistory.addEventListener('click', function () { switchTab('history'); });

    var modeSample = document.getElementById('modesSample');
    var modeCustom = document.getElementById('modesCustom');
    var modeVoiceUpload = document.getElementById('modesVoiceUpload');
    if (modeSample) modeSample.addEventListener('click', function () { switchInputMode('sample'); });
    if (modeCustom) modeCustom.addEventListener('click', function () { switchInputMode('custom'); });
    if (modeVoiceUpload) modeVoiceUpload.addEventListener('click', function () { switchInputMode('voice'); });

    var btnText = document.getElementById('btnText');
    var btnVoice = document.getElementById('btnVoice');
    if (btnText) btnText.addEventListener('click', function () { addSample('text'); });
    if (btnVoice) btnVoice.addEventListener('click', function () { addSample('voice'); });

    var btnCustom = document.getElementById('btnSubmitCustom');
    if (btnCustom) btnCustom.addEventListener('click', submitCustomMessage);

    // Custom message textarea validation
    var customMessageArea = document.getElementById('customMessage');
    if (customMessageArea) {
      customMessageArea.addEventListener('input', function () {
        validateCustomMessage();
      });
    }

    // Voice upload events
    var voiceUploadArea = document.getElementById('voiceUploadArea');
    var voiceFileInput = document.getElementById('voiceFileInput');
    var voiceFileRemove = document.getElementById('voiceFileRemove');
    var btnSubmitVoice = document.getElementById('btnSubmitVoice');

    if (voiceUploadArea && voiceFileInput) {
      voiceUploadArea.addEventListener('click', function () { voiceFileInput.click(); });
      voiceFileInput.addEventListener('change', handleVoiceFileSelect);
    }
    if (voiceFileRemove) voiceFileRemove.addEventListener('click', handleVoiceFileRemove);
    if (btnSubmitVoice) btnSubmitVoice.addEventListener('click', submitVoiceRecording);

    // Set default datetime to now
    setDefaultDatetime();

    var btnCopy = document.getElementById('btnCopy');
    var btnReset = document.getElementById('btnReset');
    if (btnCopy) btnCopy.addEventListener('click', copyTranscript);
    if (btnReset) btnReset.addEventListener('click', resetTool);
    // Note: Report button binding is now handled dynamically in renderReportButton()

    var btnRequestApi = document.getElementById('btnRequestApi');
    if (btnRequestApi) btnRequestApi.addEventListener('click', openApiPanel);

    var reportFilter = document.getElementById('reportFilter');
    if (reportFilter) reportFilter.addEventListener('change', renderReportHistory);
    var historyLogin = document.getElementById('btnHistoryLogin');
    if (historyLogin) historyLogin.addEventListener('click', function () {
      if (window.FraudaShell) window.FraudaShell.openAuthModal('auth.required_for_history');
    });

    window.addEventListener('frauda:auth-changed', renderReportHistory);
    window.addEventListener('frauda:reports-changed', renderReportHistory);
  }

  function validateCustomMessage() {
    var textarea = document.getElementById('customMessage');
    var btn = document.getElementById('btnSubmitCustom');
    var errEl = document.getElementById('customMessageError');
    var message = textarea ? textarea.value.trim() : '';
    var isValid = message.length >= 6;

    if (btn) btn.disabled = !isValid;
    if (errEl) {
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
  }

  function switchTab(tab) {
    _activeTab = tab;
    var tabS = document.getElementById('tabSubmit');
    var tabH = document.getElementById('tabHistory');
    var panelS = document.getElementById('submitPanel');
    var panelH = document.getElementById('historyPanel');
    if (!tabS || !tabH || !panelS || !panelH) return;
    tabS.classList.toggle('active', tab === 'submit');
    tabH.classList.toggle('active', tab === 'history');
    panelS.style.display = tab === 'submit' ? '' : 'none';
    panelH.style.display = tab === 'history' ? '' : 'none';
    if (tab === 'history') renderReportHistory();
  }

  function switchInputMode(mode) {
    _inputMode = mode;
    var mS = document.getElementById('modesSample');
    var mC = document.getElementById('modesCustom');
    var mV = document.getElementById('modesVoiceUpload');
    var sPanel = document.getElementById('sampleMode');
    var cPanel = document.getElementById('customMode');
    var vPanel = document.getElementById('voiceUploadMode');
    if (!mS || !mC || !mV || !sPanel || !cPanel || !vPanel) return;
    mS.classList.toggle('active', mode === 'sample');
    mC.classList.toggle('active', mode === 'custom');
    mV.classList.toggle('active', mode === 'voice');
    sPanel.style.display = mode === 'sample' ? '' : 'none';
    cPanel.style.display = mode === 'custom' ? '' : 'none';
    vPanel.style.display = mode === 'voice' ? '' : 'none';
    // Update default datetime when switching tabs
    setDefaultDatetime();
  }

  function setDefaultDatetime() {
    var now = new Date();
    var isoStr = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    var customDt = document.getElementById('customDatetime');
    var voiceDt = document.getElementById('voiceDatetime');
    if (customDt && !customDt.value) customDt.value = isoStr;
    if (voiceDt && !voiceDt.value) voiceDt.value = isoStr;
  }

  var _selectedVoiceFile = null;

  function handleVoiceFileSelect(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    _selectedVoiceFile = file;
    var uploadArea = document.getElementById('voiceUploadArea');
    var fileSelected = document.getElementById('voiceFileSelected');
    var fileName = document.getElementById('voiceFileName');
    var submitBtn = document.getElementById('btnSubmitVoice');
    var errEl = document.getElementById('voiceFileError');
    if (uploadArea) uploadArea.classList.add('has-file');
    if (fileSelected) fileSelected.style.display = 'flex';
    if (fileName) fileName.textContent = file.name;
    if (submitBtn) submitBtn.disabled = false;
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  }

  function handleVoiceFileRemove(e) {
    e.stopPropagation();
    _selectedVoiceFile = null;
    var uploadArea = document.getElementById('voiceUploadArea');
    var fileSelected = document.getElementById('voiceFileSelected');
    var fileInput = document.getElementById('voiceFileInput');
    var submitBtn = document.getElementById('btnSubmitVoice');
    if (uploadArea) uploadArea.classList.remove('has-file');
    if (fileSelected) fileSelected.style.display = 'none';
    if (fileInput) fileInput.value = '';
    if (submitBtn) submitBtn.disabled = true;
  }

  function submitVoiceRecording() {
    var errEl = document.getElementById('voiceFileError');
    
    // Validate that a file is selected
    if (!_selectedVoiceFile) {
      if (errEl) {
        errEl.textContent = t('verify.voice.error.no_file');
        errEl.style.display = 'block';
      }
      return;
    }
    
    // Clear any previous error
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
    
    // Mock submission for now - just show success message
    var successMsg = document.getElementById('voiceSubmitSuccess');
    if (successMsg) {
      successMsg.style.display = 'block';
      setTimeout(function () { successMsg.style.display = 'none'; }, 5000);
    }
  }

  function loadData() {
    if (typeof FraudaData === 'undefined') return;
    FraudaData.ready.then(function () {
      _smsCases = FraudaData.filterBy({ type: 'sms' });
      _voiceCases = FraudaData.filterBy({ type: 'voice' });
      var btnT = document.getElementById('btnText');
      var btnV = document.getElementById('btnVoice');
      var btnC = document.getElementById('btnSubmitCustom');
      if (btnT) btnT.disabled = false;
      if (btnV) btnV.disabled = false;
      if (btnC) btnC.disabled = false;
    }).catch(function (err) {
      console.error('Verify: Could not load scenarios:', err);
      var awaiting = document.getElementById('awaitingArea');
      if (awaiting) {
        awaiting.style.display = '';
        awaiting.textContent = t('index.data.error');
      }
    });
  }

  function resetSteps() {
    for (var i = 1; i <= 6; i++) {
      var icon = document.getElementById('step' + i + 'Icon');
      var label = document.getElementById('step' + i + 'Label');
      if (icon) icon.className = 'step-icon';
      if (label) label.className = 'step-label';
    }
  }

  function setStep(n, state) {
    var icon = document.getElementById('step' + n + 'Icon');
    var label = document.getElementById('step' + n + 'Label');
    if (icon) icon.className = 'step-icon ' + state;
    if (label) label.className = 'step-label ' + state;
  }

  function addSample(type) {
    if (_isAnalyzing) return;
    var continueStart = function () { startSampleFlow(type); };
    if (window.FraudaShell && !window.FraudaShell.getAuth().isAuthenticated) {
      window.FraudaShell.ensureAuth({
        messageKey: 'auth.required_for_upload',
        onSuccess: continueStart,
        showRegister: true,
      });
      return;
    }
    continueStart();
  }

  function submitCustomMessage() {
    var textarea = document.getElementById('customMessage');
    var message = textarea ? textarea.value.trim() : '';
    var errEl = document.getElementById('customSubmitError');
    var msgErrEl = document.getElementById('customMessageError');
    var okEl = document.getElementById('customSubmitSuccess');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    if (msgErrEl) { msgErrEl.textContent = ''; msgErrEl.style.display = 'none'; }
    if (okEl) { okEl.textContent = ''; okEl.style.display = 'none'; }

    if (message.length < 6) {
      if (msgErrEl) {
        msgErrEl.textContent = t('verify.custom.error.short');
        msgErrEl.style.display = 'block';
      }
      return;
    }

    if (!window.FraudaShell) return;
    var doSubmit = function () {
      window.FraudaShell.submitCustomMessage(message).then(function (res) {
        if (res.ok && res.status === 200) {
          if (okEl) {
            okEl.textContent = t('verify.custom.success');
            okEl.style.display = 'block';
          }
          if (textarea) textarea.value = '';
        } else if (errEl) {
          errEl.textContent = t('verify.custom.error.submit');
          errEl.style.display = 'block';
        }
      }).catch(function () {
        if (errEl) {
          errEl.textContent = t('verify.custom.error.submit');
          errEl.style.display = 'block';
        }
      });
    };

    if (!window.FraudaShell.getAuth().isAuthenticated) {
      window.FraudaShell.ensureAuth({
        messageKey: 'auth.required_for_upload',
        onSuccess: doSubmit,
        showRegister: true,
      });
      return;
    }
    doSubmit();
  }

  function startSampleFlow(type) {
    if (_isAnalyzing) return;
    var pool = type === 'text' ? _smsCases : _voiceCases;
    if (!pool.length) {
      var awaiting = document.getElementById('awaitingArea');
      if (awaiting) {
        awaiting.style.display = '';
        awaiting.textContent = type === 'text' ? t('index.no_samples.text') : t('index.no_samples.voice');
      }
      return;
    }
    _isAnalyzing = true;

    var scenario;
    if (type === 'text') {
      scenario = pool[_smsIndex];
      _smsIndex = (_smsIndex + 1) % pool.length;
    } else {
      scenario = pool[_voiceIndex];
      _voiceIndex = (_voiceIndex + 1) % pool.length;
    }

    if (window.FraudaShell) {
      var reportInput = {
        _summary: scenario.summary || 'Analysis',
        channel: type,
        status_risk: scenario.risk,
        message_text: type === 'text' ? (scenario.transcript_text || '') : '',
        transcription: type === 'voice' ? (scenario.transcript_text || '') : '',
      };
      window.FraudaShell.createReport(reportInput);
    }

    var resultArea = document.getElementById('resultArea');
    var awaitingArea = document.getElementById('awaitingArea');
    var loadingArea = document.getElementById('loadingArea');
    if (resultArea) resultArea.classList.remove('visible');
    if (awaitingArea) awaitingArea.style.display = 'none';
    if (loadingArea) loadingArea.classList.add('visible');

    var btnT = document.getElementById('btnText');
    var btnV = document.getElementById('btnVoice');
    if (btnT) btnT.disabled = true;
    if (btnV) btnV.disabled = true;

    _currentTranscriptItems = [];
    resetSteps();
    setStep(1, 'active');

    for (var i = 1; i <= 5; i++) {
      var el = document.getElementById('ls' + i);
      if (el) el.className = 'loading-step';
    }
    var fill = document.getElementById('progressFill');
    var pct = document.getElementById('loadingPct');
    var lbl = document.getElementById('loadingLabel');
    if (fill) fill.style.width = '0%';
    if (pct) pct.textContent = '0%';
    if (lbl) lbl.textContent = type === 'text' ? t('index.loading.text') : t('index.loading.voice');

    var stepTimings = [
      { ls: 1, flow: 2, pct: 20, delay: 200 },
      { ls: 2, flow: 3, pct: 40, delay: 1200 },
      { ls: 3, flow: 4, pct: 60, delay: 2400 },
      { ls: 4, flow: 5, pct: 80, delay: 3400 },
      { ls: 5, flow: 6, pct: 95, delay: 4400 },
    ];

    stepTimings.forEach(function (s) {
      setTimeout(function () {
        if (s.ls > 1) {
          var prev = document.getElementById('ls' + (s.ls - 1));
          if (prev) prev.className = 'loading-step done';
          setStep(s.flow - 1, 'done');
        }
        var cur = document.getElementById('ls' + s.ls);
        if (cur) cur.className = 'loading-step active';
        setStep(s.flow, 'active');
        var f = document.getElementById('progressFill');
        var p = document.getElementById('loadingPct');
        if (f) f.style.width = s.pct + '%';
        if (p) p.textContent = s.pct + '%';
      }, s.delay);
    });

    setTimeout(function () {
      var ls5 = document.getElementById('ls5');
      if (ls5) ls5.className = 'loading-step done';
      setStep(6, 'done');
      var f = document.getElementById('progressFill');
      var p = document.getElementById('loadingPct');
      if (f) f.style.width = '100%';
      if (p) p.textContent = '100%';
      setTimeout(function () {
        var la = document.getElementById('loadingArea');
        if (la) la.classList.remove('visible');
        showResult(scenario, type);
        _isAnalyzing = false;
        var bT = document.getElementById('btnText');
        var bV = document.getElementById('btnVoice');
        if (bT) bT.disabled = false;
        if (bV) bV.disabled = false;
      }, 400);
    }, 5000);
  }

  function showResult(scenario, type) {
    _currentTranscriptItems = [];
    _currentScenario = scenario;
    _currentScenarioType = type;

    var scoreEl = document.getElementById('scoreNumber');
    if (scoreEl) { scoreEl.textContent = scenario.score + '%'; scoreEl.className = 'score-number ' + scenario.risk; }

    var badgeEl = document.getElementById('riskBadge');
    if (badgeEl) { badgeEl.textContent = t('index.risk.' + scenario.risk); badgeEl.className = 'risk-badge ' + scenario.risk; }

    var summary = document.getElementById('scoreSummary');
    if (summary) summary.textContent = scenario.summary;
    var note = document.getElementById('scoreNote');
    if (note) note.textContent = '';

    var now = new Date();
    _currentAnalyzedTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');

    var caseBadge = document.getElementById('caseTypeBadge');
    if (caseBadge) caseBadge.textContent = type === 'text' ? t('index.case.text') : t('index.case.voice');

    var typeLabel = type === 'text' ? t('index.type.sms') : t('index.type.voice_call');
    var langLabel = scenario.lang === 'lv' ? t('index.lang.lv') : scenario.lang === 'ru' ? t('index.lang.ru') : t('index.lang.en');

    var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('metaType', typeLabel);
    set('metaDuration', FraudaData.formatDuration(scenario));
    set('metaCaller', scenario.caller);
    set('metaOrigin', scenario.caller_origin);
    set('metaLang', langLabel);
    set('metaTime', _currentAnalyzedTime);

    var tLabel = document.getElementById('transcriptLabel');
    if (tLabel) tLabel.textContent = type === 'text' ? t('index.transcript.text_content') : t('index.transcript.call_transcript');

    var tBody = document.getElementById('transcriptBody');
    if (tBody) tBody.innerHTML = buildTranscriptHTML(scenario);

    var indicators = FraudaData.parseIndicators(scenario.indicators);
    var indList = document.getElementById('indicatorsList');
    if (indList) {
      indList.innerHTML = '';
      indicators.forEach(function (ind, i) {
        var div = document.createElement('div');
        div.className = 'indicator-item';
        div.innerHTML = '<div class="indicator-rank ' + ind.rank + '" translate="no">' + (i + 1) + '</div>'
          + '<div class="indicator-text"><strong>' + escapeHtml(ind.label) + '</strong><span>' + escapeHtml(ind.detail) + '</span></div>';
        indList.appendChild(div);
      });
    }

    // Render report button based on risk score
    renderReportButton(scenario);

    var resultArea = document.getElementById('resultArea');
    if (resultArea) {
      resultArea.classList.add('visible', 'fade-in');
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  var _hasReported = false;

  function renderReportButton(scenario) {
    var container = document.getElementById('reportBtnContainer');
    var banner = document.getElementById('reportSuccessBanner');
    if (!container) return;

    container.style.display = '';

    // If already reported, show disabled state
    if (_hasReported) {
      container.innerHTML = '<button class="btn btn-sm btn-report-reported" type="button" disabled>'
        + '<span data-i18n="verify.report.reported">' + t('verify.report.reported') + '</span></button>';
      return;
    }

    var score = parseInt(scenario.score, 10) || 0;
    var isActive = score >= 40; // 40% or higher = active

    if (isActive) {
      // Active state: red button
      container.innerHTML = '<button class="btn btn-sm btn-report-active" id="btnReportScammer" type="button">'
        + '<span data-i18n="verify.btn.report">' + t('verify.btn.report') + '</span></button>';
      var btn = document.getElementById('btnReportScammer');
      if (btn) btn.addEventListener('click', openReportConfirmModal);
    } else {
      // Inactive state: gray button with tooltip
      container.innerHTML = '<button class="btn btn-sm btn-report-inactive" id="btnReportScammer" type="button">'
        + '<span data-i18n="verify.btn.report">' + t('verify.btn.report') + '</span>'
        + '<span class="report-help-icon">?</span>'
        + '<div class="report-tooltip">'
        + '  <p data-i18n="verify.report.inactive.tooltip">' + t('verify.report.inactive.tooltip') + '</p>'
        + '  <a href="https://www.cert.lv/lv/incidenta-pieteikums" target="_blank" rel="noopener" data-i18n="verify.report.inactive.link">' + t('verify.report.inactive.link') + '</a>'
        + '</div>'
        + '</button>';
    }
  }

  function openReportConfirmModal() {
    var modals = document.getElementById('modals');
    if (!modals) return;

    modals.innerHTML = ''
      + '<div class="report-modal-overlay" id="reportModalOverlay">'
      + '  <div class="report-modal">'
      + '    <h3 class="report-modal-title" data-i18n="verify.report.modal.title">' + t('verify.report.modal.title') + '</h3>'
      + '    <p class="report-modal-body" data-i18n="verify.report.modal.body">' + t('verify.report.modal.body') + '</p>'
      + '    <div class="report-modal-checkbox">'
      + '      <input type="checkbox" id="reportEmailCheckbox" />'
      + '      <label for="reportEmailCheckbox" data-i18n="verify.report.modal.email_checkbox">' + t('verify.report.modal.email_checkbox') + '</label>'
      + '    </div>'
      + '    <div class="report-modal-actions">'
      + '      <button class="btn-cancel" id="reportModalCancel" type="button" data-i18n="verify.report.modal.cancel">' + t('verify.report.modal.cancel') + '</button>'
      + '      <button class="btn-confirm" id="reportModalConfirm" type="button" data-i18n="verify.report.modal.confirm">' + t('verify.report.modal.confirm') + '</button>'
      + '    </div>'
      + '  </div>'
      + '</div>';

    var overlay = document.getElementById('reportModalOverlay');
    var cancelBtn = document.getElementById('reportModalCancel');
    var confirmBtn = document.getElementById('reportModalConfirm');

    function closeModal() {
      if (modals) modals.innerHTML = '';
    }

    if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (confirmBtn) confirmBtn.addEventListener('click', function () {
      var emailCheckbox = document.getElementById('reportEmailCheckbox');
      var notifyEmail = emailCheckbox ? emailCheckbox.checked : false;
      submitReport(notifyEmail);
      closeModal();
    });

    // Close on Escape
    var escHandler = function (e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function submitReport(notifyEmail) {
    // Mock POST request
    var payload = {
      case_id: _currentScenario ? _currentScenario.id : null,
      risk_score: _currentScenario ? _currentScenario.score : null,
      notify_email: notifyEmail,
      reported_at: new Date().toISOString()
    };

    console.log('Submitting report:', payload);

    // Show success banner
    var banner = document.getElementById('reportSuccessBanner');
    if (banner) {
      banner.textContent = t('verify.report.success_banner');
      banner.style.display = '';
    }

    // Update button to reported state
    _hasReported = true;
    if (_currentScenario) renderReportButton(_currentScenario);
  }

  function extractHighlights(scenario) {
    var indicators = FraudaData.parseIndicators(scenario.indicators);
    var highlights = [];
    indicators.forEach(function (ind) {
      var matches = ind.detail.match(/'([^']{3,})'/g) || [];
      matches.forEach(function (m) { highlights.push({ text: m.slice(1, -1), rank: ind.rank }); });
    });
    var urlRe = /https?:\/\/\S+/g;
    var m;
    while ((m = urlRe.exec(scenario.transcript_text || '')) !== null) {
      highlights.push({ text: m[0], rank: 'red' });
    }
    return highlights;
  }

  function buildHighlightedText(text, highlights) {
    if (!highlights.length) return escapeHtml(text);
    var lower = text.toLowerCase();
    var found = [];
    highlights.forEach(function (h) {
      var phrase = h.text.toLowerCase();
      var pos = lower.indexOf(phrase);
      while (pos !== -1) {
        found.push({ start: pos, end: pos + h.text.length, rank: h.rank });
        pos = lower.indexOf(phrase, pos + 1);
      }
    });
    if (!found.length) return escapeHtml(text);
    found.sort(function (a, b) { return a.start - b.start; });
    var clean = [];
    var maxEnd = 0;
    found.forEach(function (f) { if (f.start >= maxEnd) { clean.push(f); maxEnd = f.end; } });
    var result = '', last = 0;
    clean.forEach(function (f) {
      result += escapeHtml(text.slice(last, f.start));
      result += '<mark class="hl hl-' + f.rank + '">' + escapeHtml(text.slice(f.start, f.end)) + '</mark>';
      last = f.end;
    });
    return result + escapeHtml(text.slice(last));
  }

  function buildTranscriptHTML(scenario) {
    var parsed = FraudaData.parseTranscript(scenario.transcript_text, scenario.type);
    if (!parsed) { _currentTranscriptItems = []; return '<div class="text-msg">' + escapeHtml(t('index.no_transcript')) + '</div>'; }
    var highlights = extractHighlights(scenario);
    if (parsed.type === 'sms') {
      _currentTranscriptItems = [{ role: 'caller', text: parsed.text }];
      return '<div class="text-msg" translate="no">' + buildHighlightedText(parsed.text, highlights) + '</div>';
    }
    var isScam = scenario.risk === 'red' || scenario.risk === 'yellow';
    var callerLabel = isScam ? t('index.caller.scammer') : t('index.caller.agent');
    var recipientLabel = t('index.recipient');
    var transcriptItems = [];
    var bubbles = parsed.turns.map(function (turn) {
      var isVictim = turn.role === 'V';
      var cls = isVictim ? 'victim' : 'scammer';
      var avatar = isVictim ? 'V' : 'S';
      var roleLabel = isVictim ? recipientLabel : callerLabel;
      transcriptItems.push({ role: isVictim ? 'recipient' : 'caller', text: turn.text });
      return '<div class="msg ' + cls + '" translate="no"><div class="msg-avatar">' + avatar + '</div><div><div class="msg-role">' + roleLabel + '</div><div class="msg-bubble">' + buildHighlightedText(turn.text, highlights) + '</div></div></div>';
    });
    _currentTranscriptItems = transcriptItems;
    return bubbles.join('');
  }

  function copyTranscript() {
    if (!_currentTranscriptItems.length) return;
    var formatted = _currentTranscriptItems.map(function (item) {
      var label = item.role === 'recipient' ? t('index.copy.recipient') : t('index.copy.unknown');
      return '[' + label + ']\n' + item.text;
    }).join('\n\n');
    function showSuccess() {
      var el = document.getElementById('copySuccess');
      if (el) { el.classList.add('show'); setTimeout(function () { el.classList.remove('show'); }, 2500); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formatted).then(showSuccess).catch(function () { fallbackCopy(formatted, showSuccess); });
    } else {
      fallbackCopy(formatted, showSuccess);
    }
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) { console.warn('Copy failed:', e); }
    document.body.removeChild(ta);
  }

  function resetTool() {
    var ra = document.getElementById('resultArea');
    var aa = document.getElementById('awaitingArea');
    if (ra) ra.classList.remove('visible');
    if (aa) aa.style.display = '';
    resetSteps();
    _currentTranscriptItems = [];
    _currentScenario = null;
    _currentScenarioType = '';
    _currentAnalyzedTime = '';
    _hasReported = false;
    var reportContainer = document.getElementById('reportBtnContainer');
    if (reportContainer) reportContainer.innerHTML = '';
    var banner = document.getElementById('reportSuccessBanner');
    if (banner) banner.style.display = 'none';
  }

  function getStatusLabel(status) {
    if (status === 'success') return t('index.report.status.success');
    if (status === 'fail') return t('index.report.status.fail');
    return t('index.report.status.in_work');
  }

  function renderReportHistory() {
    var authGate = document.getElementById('reportAuthGate');
    var empty = document.getElementById('reportHistoryEmpty');
    var list = document.getElementById('reportHistoryList');
    var filter = document.getElementById('reportFilter');
    if (!authGate || !empty || !list || !window.FraudaShell) return;

    var auth = window.FraudaShell.getAuth();
    if (!auth.isAuthenticated) {
      authGate.style.display = '';
      empty.style.display = 'none';
      list.innerHTML = '';
      list.style.display = 'none';
      return;
    }
    authGate.style.display = 'none';

    var statusFilter = filter ? filter.value || 'all' : 'all';
    var reports = window.FraudaShell.getReports();
    var filtered = statusFilter === 'all' ? reports : reports.filter(function (r) { return r.status === statusFilter; });

    if (!filtered.length) {
      empty.style.display = '';
      list.innerHTML = '';
      list.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    list.style.display = '';

    list.innerHTML = filtered.map(function (r) {
      var ts = new Date(r.created_at);
      var time = String(ts.getDate()).padStart(2, '0') + '.' + String(ts.getMonth() + 1).padStart(2, '0') + '.' + ts.getFullYear() + ' ' + String(ts.getHours()).padStart(2, '0') + ':' + String(ts.getMinutes()).padStart(2, '0');
      var expanded = _expandedReportId === r.id;
      var input = r.input || {};
      var fullText = input.message_text || input._summary || r.summary || '';
      var transcription = input.transcription || '';
      return ''
        + '<div class="report-item report-item-detail" data-report-id="' + escapeHtml(r.id) + '">'
        + '  <button class="report-expand" type="button" data-report-toggle="' + escapeHtml(r.id) + '">'
        + '    <div>'
        + '      <div class="report-title" translate="no">' + escapeHtml(r.summary || 'Report') + '</div>'
        + '      <div class="report-meta" translate="no">' + time + ' · ' + escapeHtml(r.id) + '</div>'
        + '    </div>'
        + '    <span class="status-pill ' + r.status.replace(' ', '-') + '" translate="no">' + getStatusLabel(r.status) + '</span>'
        + '  </button>'
        + '  <div class="report-detail-body" style="display:' + (expanded ? '' : 'none') + '">'
        + '    <div class="report-body"><strong>' + t('verify.history.full_message') + '</strong><div translate="no">' + escapeHtml(fullText) + '</div></div>'
        + (transcription ? ('<div class="report-body"><strong>' + t('verify.history.transcription') + '</strong><div translate="no">' + escapeHtml(transcription) + '</div></div>') : '')
        + '    <div class="report-body"><strong>' + t('verify.history.status') + '</strong> <span class="status-pill ' + r.status.replace(' ', '-') + '" translate="no">' + getStatusLabel(r.status) + '</span></div>'
        + '  </div>'
        + '</div>';
    }).join('');

    list.querySelectorAll('[data-report-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-report-toggle');
        _expandedReportId = _expandedReportId === id ? null : id;
        pushRouteState({ reportId: _expandedReportId });
        renderReportHistory();
      });
    });
  }

  function openReportPanel() {
    var modals = document.getElementById('modals');
    modals.innerHTML = ''
      + '<div class="panel-overlay visible" id="panelOverlay"></div>'
      + '<div class="slide-panel open" id="reportPanel">'
      + '  <div class="panel-header">'
      + '    <h3 data-i18n="verify.report.title">' + t('verify.report.title') + '</h3>'
      + '    <button class="panel-close" id="closeReportPanel" type="button">&times;</button>'
      + '  </div>'
      + '  <div class="panel-body">'
      + '    <p style="margin-bottom:16px;color:var(--text-2)" data-i18n="verify.report.desc">' + t('verify.report.desc') + '</p>'
      + '    <form id="reportForm" novalidate>'
      + '      <div class="form-field" style="margin-bottom:12px"><label>' + t('verify.report.identifier') + '</label><input id="reportIdentifier" type="text" placeholder="+371... / email / id" /></div>'
      + '      <div class="form-field" style="margin-bottom:12px"><label>' + t('verify.report.additional_info') + '</label><textarea id="reportAdditional" rows="3" placeholder="' + t('verify.report.additional_placeholder') + '"></textarea></div>'
      + '      <div class="form-field" style="margin-bottom:12px"><label>' + t('verify.report.datetime') + '</label><input id="reportDateTime" type="datetime-local" /></div>'
      + '      <div class="inline-error" id="reportError"></div>'
      + '      <button type="submit" class="btn btn-danger">' + t('verify.report.submit') + '</button>'
      + '    </form>'
      + '  </div>'
      + '</div>';

    _openPanel = 'report';
    pushRouteState({ panel: 'report' });

    var closeBtn = document.getElementById('closeReportPanel');
    var overlay = document.getElementById('panelOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (overlay) overlay.addEventListener('click', closePanel);

    var form = document.getElementById('reportForm');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var identifier = (document.getElementById('reportIdentifier').value || '').trim();
      var additional = (document.getElementById('reportAdditional').value || '').trim();
      var datetime = (document.getElementById('reportDateTime').value || '').trim();
      var errEl = document.getElementById('reportError');
      if (!identifier || !additional || !datetime) {
        if (errEl) {
          errEl.textContent = t('verify.report.error.required');
          errEl.style.display = 'block';
        }
        return;
      }
      if (errEl) {
        errEl.textContent = '';
        errEl.style.display = 'none';
      }
      if (!window.FraudaShell || !window.FraudaShell.submitScammerReport) {
        showToast(t('verify.report.toast.fail'), 'error');
        return;
      }
      window.FraudaShell.submitScammerReport({
        scammer_identifier: identifier,
        additional_information: additional,
        incident_datetime: datetime,
      }).then(function (res) {
        if (res && res.ok) {
          showToast(t('verify.report.toast.success'), 'success');
          closePanel();
        } else {
          showToast(t('verify.report.toast.fail'), 'error');
        }
      }).catch(function () {
        showToast(t('verify.report.toast.fail'), 'error');
      });
    });
  }

  function openApiPanel() {
    var modals = document.getElementById('modals');
    modals.innerHTML = ''
      + '<div class="panel-overlay visible" id="panelOverlay"></div>'
      + '<div class="slide-panel open" id="apiPanel">'
      + '  <div class="panel-header">'
      + '    <h3 data-i18n="verify.api.title">' + t('verify.api.title') + '</h3>'
      + '    <button class="panel-close" id="closeApiPanel" type="button">&times;</button>'
      + '  </div>'
      + '  <div class="panel-body">'
      + '    <p data-i18n="verify.api.desc">' + t('verify.api.desc') + '</p>'
      + '    <form id="apiRequestForm" novalidate>'
      + '      <div class="form-field" style="margin-bottom:12px">'
      + '        <label for="apiContactEmail" data-i18n="verify.api.contact_label">' + t('verify.api.contact_label') + '</label>'
      + '        <input id="apiContactEmail" type="email" value="api@frauda.lv" placeholder="api@frauda.lv" />'
      + '      </div>'
      + '      <div class="inline-success" id="apiRequestSuccess"></div>'
      + '      <button class="btn btn-primary" type="submit" data-i18n="verify.api.request_btn">' + t('verify.api.request_btn') + '</button>'
      + '    </form>'
      + '  </div>'
      + '</div>';

    _openPanel = 'api';
    pushRouteState({ panel: 'api' });

    var closeBtn = document.getElementById('closeApiPanel');
    var overlay = document.getElementById('panelOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (overlay) overlay.addEventListener('click', closePanel);

    var form = document.getElementById('apiRequestForm');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = document.getElementById('apiRequestSuccess');
      if (ok) {
        ok.textContent = t('verify.api.requested');
        ok.style.display = 'block';
      }
    });
  }

  function closePanel() {
    var modals = document.getElementById('modals');
    if (modals) modals.innerHTML = '';
    _openPanel = null;
    pushRouteState({ panel: null });
  }

  function showToast(message, type) {
    var existing = document.getElementById('verifyTopToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'verifyTopToast';
    toast.className = 'top-toast ' + (type === 'error' ? 'error' : 'success');
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () { toast.classList.add('visible'); }, 10);
    window.setTimeout(function () {
      toast.classList.remove('visible');
      window.setTimeout(function () { toast.remove(); }, 220);
    }, 2600);
  }

  return {
    render: render,
    init: init,
    destroy: destroy,
    restoreState: restoreState,
  };
})();
