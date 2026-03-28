/* ══════════════════════════════════════════════════════════════════════
   FraudaProfile — Profile page (/profile)
   Personal info form (email, username, DOB, occupation) with mock save.
   Verification history table from data/scenarios.csv, paginated at 10 rows.
   In-table reporting uses same modal as Verify page. Risk column from 'score'.
══════════════════════════════════════════════════════════════════════ */

window.FraudaProfile = (function () {
  'use strict';

  var _historyData = [];
  var _currentPage = 1;
  var _itemsPerPage = 10;
  var _formChanged = false;

  function t(key, vars) {
    if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') return window.FraudaI18n.t(key, vars);
    return key;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render() {
    var auth = window.FraudaShell ? window.FraudaShell.getAuth() : { isAuthenticated: false, username: '', email: '' };
    var profile = window.FraudaShell ? window.FraudaShell.getCurrentProfile() || {} : {};

    return ''
    + '<div class="profile-layout">'
    + '  <div class="profile-section">'
    + '    <h2 class="profile-section-title" data-i18n="profile.section.personal">' + t('profile.section.personal') + '</h2>'
    + '    <div class="profile-form-grid">'
    + '      <div class="form-field">'
    + '        <label for="profileEmail" data-i18n="profile.field.email">' + t('profile.field.email') + '</label>'
    + '        <input type="email" id="profileEmail" value="' + escapeHtml(profile.email || auth.email || '') + '" />'
    + '      </div>'
    + '      <div class="form-field">'
    + '        <label for="profileUsername" data-i18n="profile.field.username">' + t('profile.field.username') + '</label>'
    + '        <input type="text" id="profileUsername" value="' + escapeHtml(auth.username || '') + '" />'
    + '      </div>'
    + '      <div class="form-field">'
    + '        <label for="profileDob" data-i18n="profile.field.dob">' + t('profile.field.dob') + '</label>'
    + '        <input type="date" id="profileDob" value="' + escapeHtml(profile.dob || '') + '" />'
    + '      </div>'
    + '      <div class="form-field">'
    + '        <label for="profileOccupation" data-i18n="profile.field.occupation">' + t('profile.field.occupation') + '</label>'
    + '        <input type="text" id="profileOccupation" value="' + escapeHtml(profile.occupation || '') + '" placeholder="' + t('profile.field.occupation_placeholder') + '" />'
    + '      </div>'
    + '    </div>'
    + '    <div style="margin-top:20px">'
    + '      <button class="profile-save-btn" id="profileSaveBtn" type="button" disabled data-i18n="profile.save">' + t('profile.save') + '</button>'
    + '      <span class="profile-save-success" id="profileSaveSuccess" style="display:none" data-i18n="profile.saved">' + t('profile.saved') + '</span>'
    + '    </div>'
    + '  </div>'
    + '  <div class="profile-section">'
    + '    <h2 class="profile-section-title" data-i18n="profile.section.history">' + t('profile.section.history') + '</h2>'
    + '    <div id="historyContainer"></div>'
    + '  </div>'
    + '  <div class="profile-section profile-danger-section">'
    + '    <h2 class="profile-section-title profile-danger-title">Account</h2>'
    + '    <div class="profile-danger-content">'
    + '      <button class="btn btn-danger profile-logout-btn" id="profileLogoutBtn" type="button">'
    + '        <span class="material-symbols-outlined" style="font-size:1rem;line-height:1">logout</span>'
    + '        Sign out'
    + '      </button>'
    + '      <span class="profile-danger-hint">You will be securely logged out of your account.</span>'
    + '    </div>'
    + '  </div>'
    + '</div>';
  }

  function init() {
    bindEvents();
    loadHistory();
    updatePageTitle();
  }

  function updatePageTitle() {
    document.title = t('profile.title');
  }

  function bindEvents() {
    var saveBtn = document.getElementById('profileSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveProfile);

    var logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', function() {
      if (window.FraudaShell) {
        var confirmed = window.confirm('Are you sure you want to sign out?');
        if (confirmed) {
          window.FraudaShell._logout();
          if (window.FraudaRouter) window.FraudaRouter.navigate('');
          else window.location.hash = '#/';
        }
      }
    });

    // Track form changes
    ['profileEmail', 'profileUsername', 'profileDob', 'profileOccupation'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function() {
        _formChanged = true;
        updateSaveButton();
      });
    });
  }

  function updateSaveButton() {
    var btn = document.getElementById('profileSaveBtn');
    if (btn) btn.disabled = !_formChanged;
  }

  function saveProfile() {
    var email = (document.getElementById('profileEmail').value || '').trim();
    var username = (document.getElementById('profileUsername').value || '').trim();
    var dob = (document.getElementById('profileDob').value || '').trim();
    var occupation = (document.getElementById('profileOccupation').value || '').trim();

    // Mock save - in reality would call API
    console.log('Saving profile:', { email: email, username: username, dob: dob, occupation: occupation });

    // Show success message
    var successEl = document.getElementById('profileSaveSuccess');
    if (successEl) {
      successEl.style.display = 'inline';
      setTimeout(function() { successEl.style.display = 'none'; }, 3000);
    }

    _formChanged = false;
    updateSaveButton();
  }

  function loadHistory() {
    // Load from scenarios.csv
    fetch('data/scenarios.csv')
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load scenarios');
        return response.text();
      })
      .then(function(csv) {
        _historyData = parseCSV(csv);
        renderHistory();
      })
      .catch(function(err) {
        console.error('Could not load history:', err);
        renderEmptyHistory();
      });
  }

  function parseCSV(csv) {
    var lines = csv.split('\n');
    if (lines.length < 2) return [];

    var headers = parseCSVLine(lines[0]);
    var data = [];

    for (var i = 1; i < lines.length && data.length < 20; i++) {
      if (!lines[i].trim()) continue;
      var values = parseCSVLine(lines[i]);
      var row = {};
      headers.forEach(function(h, idx) {
        row[h.trim().toLowerCase()] = values[idx] || '';
      });
      data.push(row);
    }

    // Map to history format with mock dates and statuses
    var now = new Date();
    return data.map(function(row, idx) {
      // CSV column is 'score' — try multiple fallback names
      var rawScore = row.score || row.risk_score || row.suspiciousness_score || '0';
      var score = parseFloat(rawScore);
      // If score is on 0-1 scale, convert to percentage
      if (score > 0 && score <= 1) score = Math.round(score * 100);
      // Ensure score is a valid number
      if (isNaN(score)) score = 0;

      // Generate mock date (spread across last 30 days)
      var date = new Date(now.getTime() - (idx * 24 * 60 * 60 * 1000 * (Math.random() * 2 + 0.5)));

      // Determine type from CSV 'type' column directly
      var type = (row.type || 'sms').toLowerCase();
      if (type !== 'voice' && type !== 'sms') {
        type = 'sms'; // fallback
      }

      // Get summary from transcript_text (the actual message content)
      var text = row.transcript_text || row.summary || row.message || row.scenario || '';
      var summaryText = text.slice(0, 60) + (text.length > 60 ? '…' : '');

      // Determine status based on score
      var status = 'checked';
      if (score >= 80) {
        status = Math.random() > 0.5 ? 'blocked' : 'reported';
      } else if (score >= 40) {
        status = Math.random() > 0.7 ? 'reported' : 'checked';
      }

      return {
        id: idx + 1,
        date: date,
        type: type,
        summary: summaryText,
        score: score,
        risk: score >= 70 ? 'red' : score >= 40 ? 'yellow' : 'green',
        status: status
      };
    });
  }

  function parseCSVLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;

    for (var i = 0; i < line.length; i++) {
      var char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  function renderHistory() {
    var container = document.getElementById('historyContainer');
    if (!container) return;

    if (_historyData.length === 0) {
      renderEmptyHistory();
      return;
    }

    var totalPages = Math.ceil(_historyData.length / _itemsPerPage);
    var start = (_currentPage - 1) * _itemsPerPage;
    var end = start + _itemsPerPage;
    var pageData = _historyData.slice(start, end);

    // Desktop table
    var tableHtml = '<table class="profile-history-table">'
      + '<thead><tr>'
      + '<th data-i18n="profile.history.col.number">' + t('profile.history.col.number') + '</th>'
      + '<th data-i18n="profile.history.col.date">' + t('profile.history.col.date') + '</th>'
      + '<th data-i18n="profile.history.col.type">' + t('profile.history.col.type') + '</th>'
      + '<th data-i18n="profile.history.col.summary">' + t('profile.history.col.summary') + '</th>'
      + '<th data-i18n="profile.history.col.risk">' + t('profile.history.col.risk') + '</th>'
      + '<th data-i18n="profile.history.col.status">' + t('profile.history.col.status') + '</th>'
      + '<th data-i18n="profile.history.col.actions">' + t('profile.history.col.actions') + '</th>'
      + '</tr></thead><tbody>';

    pageData.forEach(function(item) {
      var dateStr = formatDate(item.date);
      var typeLabel = item.type === 'voice' ? t('profile.history.type.voice') : t('profile.history.type.sms');
      var statusLabel = t('profile.history.status.' + item.status);
      var riskClass = item.risk;

      tableHtml += '<tr>'
        + '<td>' + item.id + '</td>'
        + '<td>' + dateStr + '</td>'
        + '<td>' + typeLabel + '</td>'
        + '<td class="profile-history-summary" title="' + escapeHtml(item.summary) + '">' + escapeHtml(item.summary) + '</td>'
        + '<td><span class="profile-risk-badge ' + riskClass + '">' + item.score + '%</span></td>'
        + '<td><span class="profile-status-badge ' + item.status + '">' + statusLabel + '</span></td>'
        + '<td>' + renderActionButton(item) + '</td>'
        + '</tr>';
    });

    tableHtml += '</tbody></table>';

    // Mobile cards
    var cardsHtml = '<div class="profile-history-cards">';
    pageData.forEach(function(item) {
      var dateStr = formatDate(item.date);
      var typeLabel = item.type === 'voice' ? t('profile.history.type.voice') : t('profile.history.type.sms');
      var statusLabel = t('profile.history.status.' + item.status);

      cardsHtml += '<div class="profile-history-card">'
        + '<div class="profile-history-card-row">'
        + '  <span class="profile-history-card-label">#' + item.id + '</span>'
        + '  <span class="profile-history-card-value">' + dateStr + '</span>'
        + '</div>'
        + '<div class="profile-history-card-row">'
        + '  <span class="profile-history-card-label">' + t('profile.history.col.type') + '</span>'
        + '  <span class="profile-history-card-value">' + typeLabel + '</span>'
        + '</div>'
        + '<div class="profile-history-card-row">'
        + '  <span class="profile-history-card-label">' + t('profile.history.col.summary') + '</span>'
        + '  <span class="profile-history-card-value">' + escapeHtml(item.summary) + '</span>'
        + '</div>'
        + '<div class="profile-history-card-row">'
        + '  <span class="profile-history-card-label">' + t('profile.history.col.risk') + '</span>'
        + '  <span class="profile-risk-badge ' + item.risk + '">' + item.score + '%</span>'
        + '</div>'
        + '<div class="profile-history-card-row">'
        + '  <span class="profile-status-badge ' + item.status + '">' + statusLabel + '</span>'
        + '  ' + renderActionButton(item)
        + '</div>'
        + '</div>';
    });
    cardsHtml += '</div>';

    // Pagination
    var paginationHtml = '';
    if (totalPages > 1) {
      paginationHtml = '<div class="profile-pagination">'
        + '<button class="profile-pagination-btn" id="prevPage" ' + (_currentPage <= 1 ? 'disabled' : '') + ' data-i18n="profile.history.prev">' + t('profile.history.prev') + '</button>'
        + '<span class="profile-pagination-info">' + t('profile.history.page', { page: _currentPage, total: totalPages }) + '</span>'
        + '<button class="profile-pagination-btn" id="nextPage" ' + (_currentPage >= totalPages ? 'disabled' : '') + ' data-i18n="profile.history.next">' + t('profile.history.next') + '</button>'
        + '</div>';
    }

    container.innerHTML = tableHtml + cardsHtml + paginationHtml;

    // Bind pagination events
    var prevBtn = document.getElementById('prevPage');
    var nextBtn = document.getElementById('nextPage');
    if (prevBtn) prevBtn.addEventListener('click', function() { _currentPage--; renderHistory(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { _currentPage++; renderHistory(); });

    // Bind report buttons
    container.querySelectorAll('[data-report-item]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = parseInt(btn.getAttribute('data-report-item'), 10);
        openReportModalForItem(id);
      });
    });
  }

  function renderActionButton(item) {
    if (item.status === 'reported' || item.status === 'blocked') {
      return ''; // No action needed
    }

    if (item.score >= 40) {
      // Active report button
      return '<button class="btn btn-sm btn-report-active" data-report-item="' + item.id + '" type="button">'
        + '<span data-i18n="profile.history.btn.report">' + t('profile.history.btn.report') + '</span>'
        + '</button>';
    } else {
      // Inactive button with tooltip
      return '<button class="btn btn-sm btn-report-inactive" type="button" style="position:relative">'
        + '<span>?</span>'
        + '<div class="report-tooltip">'
        + '  <p data-i18n="verify.report.inactive.tooltip">' + t('verify.report.inactive.tooltip') + '</p>'
        + '  <a href="https://www.cert.lv/lv/incidenta-pieteikums" target="_blank" rel="noopener" data-i18n="verify.report.inactive.link">' + t('verify.report.inactive.link') + '</a>'
        + '</div>'
        + '</button>';
    }
  }

  function formatDate(date) {
    var d = String(date.getDate()).padStart(2, '0');
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var y = date.getFullYear();
    var h = String(date.getHours()).padStart(2, '0');
    var min = String(date.getMinutes()).padStart(2, '0');
    return d + '.' + m + '.' + y + ' ' + h + ':' + min;
  }

  function renderEmptyHistory() {
    var container = document.getElementById('historyContainer');
    if (container) {
      container.innerHTML = '<div class="profile-history-empty" data-i18n="profile.history.empty">' + t('profile.history.empty') + '</div>';
    }
  }

  function openReportModalForItem(itemId) {
    var item = _historyData.find(function(i) { return i.id === itemId; });
    if (!item) return;

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

    if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (confirmBtn) confirmBtn.addEventListener('click', function() {
      // Update item status
      item.status = 'reported';
      closeModal();
      renderHistory();
    });

    // Close on Escape
    var escHandler = function(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function destroy() {
    _historyData = [];
    _currentPage = 1;
    _formChanged = false;
  }

  function restoreState(state) {
    // No state to restore for profile page
  }

  return {
    render: render,
    init: init,
    destroy: destroy,
    restoreState: restoreState
  };
})();
