/* ══════════════════════════════════════════════════════════════════════
   FraudaShell — Frontend auth, theme, and storage for B2C SaaS.
   AUTH IS BROWSER-ONLY (localStorage) — PROTOTYPE/TESTING ONLY.
   In production, replace with real server-side authentication.
══════════════════════════════════════════════════════════════════════ */

(function (window, document) {
  const KEYS = {
    onboarded: 'frauda_onboarded',
    theme: 'frauda_theme',
    shieldSeen: 'frauda_shield_seen',
    auth: 'frauda_auth',
    reports: 'frauda_reports',
    scenariosTest: 'scenarios_test',
    users: 'frauda_users', // PROTOTYPE: registered users stored in localStorage
    profiles: 'frauda_profiles',
  };

  // PROTOTYPE: Test credentials still work alongside registration
  const TEST_CREDENTIALS = { username: 'test', password: 'test' };

  const state = {
    auth: { isAuthenticated: false, username: 'guest', email: '' },
    pendingAction: null,
    customMessageRequest: { inFlight: false },
  };

  /* ── localStorage helpers ─────────────────────────────────────────── */
  function getLS(key, fallback) {
    if (fallback === undefined) fallback = null;
    try {
      const val = window.localStorage.getItem(key);
      return val === null ? fallback : val;
    } catch (err) {
      console.warn('localStorage read failed', err);
      return fallback;
    }
  }

  function setLS(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch (err) { console.warn('localStorage write failed', err); }
  }

  function removeLS(key) {
    try { window.localStorage.removeItem(key); }
    catch (err) { console.warn('localStorage remove failed', err); }
  }

  function i18nT(key, vars) {
    if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') {
      return window.FraudaI18n.t(key, vars);
    }
    return key;
  }

  /* ── Theme ────────────────────────────────────────────────────────── */
  function setTheme(theme) {
    const normalized = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', normalized);
    setLS(KEYS.theme, normalized);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.textContent = normalized === 'dark' ? '☀' : '🌙';
  }

  function applyThemeFromStorage() {
    // Respect prefers-color-scheme on first visit
    const stored = getLS(KEYS.theme, null);
    if (stored) {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  /* ── Reports (localStorage) ───────────────────────────────────────── */
  function readReports() {
    const raw = getLS(KEYS.reports, '[]');
    try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
    catch (err) { return []; }
  }

  function writeReports(reports) {
    setLS(KEYS.reports, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('frauda:reports-changed'));
  }

  function createReport(inputData) {
    const userId = state.auth.username || 'anonymous';
    const report = {
      id: 'rep_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
      created_at: new Date().toISOString(),
      user_id: userId,
      input: inputData,
      status: 'in work',
      summary: reportSummaryFromInput(inputData),
    };
    const reports = readReports();
    reports.unshift(report);
    writeReports(reports);

    // Simulate async status update
    window.setTimeout(function () {
      const updated = readReports();
      const idx = updated.findIndex(function (r) { return r.id === report.id; });
      if (idx === -1) return;
      updated[idx].status = Math.random() > 0.2 ? 'success' : 'fail';
      writeReports(updated);
    }, 2200);

    return report;
  }

  function reportSummaryFromInput(inputData) {
    if (inputData && inputData._summary) return inputData._summary;
    const name = inputData.fullName || inputData.email || 'Unknown';
    const channel = inputData.channel || 'n/a';
    return name + ' \u00b7 ' + channel;
  }

  /* ── Test Submissions (localStorage) ──────────────────────────────── */
  function readTestSubmissions() {
    const raw = getLS(KEYS.scenariosTest, '[]');
    try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
    catch (err) { return []; }
  }

  function writeTestSubmissions(items) {
    setLS(KEYS.scenariosTest, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('frauda:test-submissions-changed'));
  }

  function addTestSubmission(payload) {
    const userId = state.auth.username || 'anonymous';
    const entry = {
      id: 'test_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
      created_at: new Date().toISOString(),
      user_id: userId,
      type: payload.type,
      text_message: payload.type === 'text' ? payload.text_message : '',
      voice_file_name: payload.type === 'voice' ? payload.voice_file_name : '',
      source: 'user',
      status: 'in work',
    };
    const current = readTestSubmissions();
    current.unshift(entry);
    writeTestSubmissions(current);
    return entry;
  }

  function requestApiSuccess(payload) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve({
          ok: true,
          status: 200,
          payload: payload || {},
        });
      }, 280);
    });
  }

  function submitCustomMessage(message) {
    if (!message || typeof message !== 'string') {
      return Promise.resolve({ ok: false, status: 400 });
    }
    if (state.customMessageRequest.inFlight) {
      return Promise.resolve({ ok: false, status: 429 });
    }
    state.customMessageRequest.inFlight = true;
    var trimmed = message.trim();
    return requestApiSuccess({ message: trimmed }).then(function (res) {
      addTestSubmission({ type: 'text', text_message: trimmed });
      return res;
    }).finally(function () {
      state.customMessageRequest.inFlight = false;
    });
  }

  /* ── User Registration (PROTOTYPE — localStorage only) ────────────── */
  function readUsers() {
    const raw = getLS(KEYS.users, '[]');
    try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
    catch (err) { return []; }
  }

  function writeUsers(users) {
    setLS(KEYS.users, JSON.stringify(users));
  }

  function readProfiles() {
    const raw = getLS(KEYS.profiles, '{}');
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function writeProfiles(profiles) {
    setLS(KEYS.profiles, JSON.stringify(profiles));
  }

  function profileKey(username, email) {
    return String((email || username || '').toLowerCase());
  }

  function ensureProfileRecord(username, email) {
    if (!username && !email) return null;
    const key = profileKey(username, email);
    const profiles = readProfiles();
    if (!profiles[key]) {
      profiles[key] = {
        full_name: username || '',
        email: email || '',
        phone: '',
        age: '',
        profile_completed: false,
        updated_at: new Date().toISOString(),
      };
      writeProfiles(profiles);
    }
    return profiles[key];
  }

  function getCurrentProfile() {
    if (!state.auth.isAuthenticated) return null;
    const key = profileKey(state.auth.username, state.auth.email);
    const profiles = readProfiles();
    return profiles[key] || ensureProfileRecord(state.auth.username, state.auth.email);
  }

  function submitUserProfile(profileData) {
    var current = state.auth;
    if (!current.isAuthenticated) return Promise.resolve({ ok: false, status: 401 });
    var payload = {
      full_name: (profileData.full_name || current.username || '').trim(),
      email: (profileData.email || current.email || '').trim(),
      phone: (profileData.phone || '').trim(),
      age: String(profileData.age || '').trim(),
    };
    return requestApiSuccess(payload).then(function (res) {
      const key = profileKey(current.username, current.email || payload.email);
      const profiles = readProfiles();
      profiles[key] = {
        full_name: payload.full_name,
        email: payload.email || current.email,
        phone: payload.phone,
        age: payload.age,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };
      writeProfiles(profiles);
      window.dispatchEvent(new CustomEvent('frauda:profile-updated', { detail: profiles[key] }));
      return res;
    });
  }

  function submitScammerReport(reportData) {
    return requestApiSuccess(reportData);
  }

  function showShieldReveal(reason) {
    var existing = document.getElementById('shieldRevealOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'shieldRevealOverlay';
    overlay.className = 'shield-reveal playing';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = ''
      + '<div class="shield-reveal-core">'
      + '  <div class="shield-leaf shield-left"></div>'
      + '  <div class="shield-leaf shield-right"></div>'
      + '  <div class="shield-symbol">🛡</div>'
      + '</div>';
    document.body.appendChild(overlay);
    window.setTimeout(function () { overlay.classList.add('open'); }, 20);
    window.setTimeout(function () {
      overlay.classList.remove('playing');
      overlay.classList.add('done');
    }, 1400);
    window.setTimeout(function () { overlay.remove(); }, 1750);

    if (reason === 'initial') {
      setLS(KEYS.shieldSeen, '1');
    }
  }

  function registerUser(name, email, password) {
    if (!name || !email || !password) return { ok: false, error: 'auth.register.error.required' };
    if (password.length < 4) return { ok: false, error: 'auth.register.error.password_short' };
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return { ok: false, error: 'auth.register.error.email_invalid' };

    const users = readUsers();
    if (users.find(function (u) { return u.email === email; })) {
      return { ok: false, error: 'auth.register.error.exists' };
    }

    // PROTOTYPE: store plain text — NEVER do this in production
    users.push({ name: name, email: email, password: password, created: new Date().toISOString() });
    writeUsers(users);

    ensureProfileRecord(name, email);
    setAuthenticated(name, email, { source: 'register' });
    return { ok: true };
  }

  function loginUser(emailOrUsername, password) {
    // Check test credentials first
    if (emailOrUsername === TEST_CREDENTIALS.username && password === TEST_CREDENTIALS.password) {
      ensureProfileRecord('test', 'test@frauda.lv');
      setAuthenticated('test', 'test@frauda.lv', { source: 'login' });
      return { ok: true };
    }

    // Check registered users
    const users = readUsers();
    var user = users.find(function (u) {
      return (u.email === emailOrUsername || u.name === emailOrUsername) && u.password === password;
    });
    if (user) {
      ensureProfileRecord(user.name, user.email);
      setAuthenticated(user.name, user.email, { source: 'login' });
      return { ok: true };
    }

    return { ok: false, error: 'auth.error.invalid' };
  }

  /* ── Auth State ───────────────────────────────────────────────────── */
  function restoreAuth() {
    const raw = getLS(KEYS.auth, null);
    if (!raw) return fireAuthChanged();
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isAuthenticated) {
        state.auth = {
          isAuthenticated: true,
          username: parsed.username || 'user',
          email: parsed.email || '',
        };
      }
    } catch (err) {
      state.auth = { isAuthenticated: false, username: 'guest', email: '' };
    }
    fireAuthChanged();
  }

  function setAuthenticated(username, email, options) {
    if (!options) options = {};
    state.auth = { isAuthenticated: true, username: username, email: email || '' };
    setLS(KEYS.auth, JSON.stringify(state.auth));
    closeAuthModal();
    fireAuthChanged();
    window.dispatchEvent(new CustomEvent('frauda:login-success', { detail: { ...state.auth, source: options.source || 'login' } }));
    if (options.source === 'register') {
      window.dispatchEvent(new CustomEvent('frauda:registration-success', { detail: { ...state.auth } }));
      window.dispatchEvent(new CustomEvent('frauda:auth-changed', { detail: { ...state.auth, onboardingRequired: true } }));
    }
    if (typeof state.pendingAction === 'function') {
      var fn = state.pendingAction;
      state.pendingAction = null;
      fn();
    }
  }

  function logout() {
    removeLS(KEYS.auth);
    state.auth = { isAuthenticated: false, username: 'guest', email: '' };
    fireAuthChanged();
  }

  function fireAuthChanged() {
    window.dispatchEvent(new CustomEvent('frauda:auth-changed', { detail: { ...state.auth } }));
  }

  function ensureAuth(options) {
    if (!options) options = {};
    if (state.auth.isAuthenticated) return true;
    state.pendingAction = typeof options.onSuccess === 'function' ? options.onSuccess : null;
    openAuthModal(options.messageKey || 'auth.default_message', options.showRegister);
    return false;
  }

  /* ── Auth Modal ───────────────────────────────────────────────────── */
  function openAuthModal(messageKey, showRegister) {
    closeAuthModal(); // Remove any existing modal

    var isRegister = showRegister === true;

    var html = '<div class="overlay visible" id="authOverlay" role="dialog" aria-modal="true">'
      + '<div class="modal-card">'
      + '<h2 id="authTitle">' + i18nT(isRegister ? 'auth.register.title' : 'auth.title') + '</h2>'
      + '<p id="authMessage">' + i18nT(messageKey || 'auth.default_message') + '</p>'
      + '<div id="authTabBar" style="display:flex;gap:0;margin-bottom:16px;border-bottom:1px solid var(--border)">'
      + '  <button class="verify-tab ' + (isRegister ? '' : 'active') + '" id="tabLogin" type="button">' + i18nT('auth.tab.login') + '</button>'
      + '  <button class="verify-tab ' + (isRegister ? 'active' : '') + '" id="tabRegister" type="button">' + i18nT('auth.tab.register') + '</button>'
      + '</div>'
      + '<form id="authForm" novalidate>'
      // Registration fields (hidden by default unless showRegister)
      + '<div id="registerFields" style="display:' + (isRegister ? 'block' : 'none') + '">'
      + '  <div class="form-field" style="margin-bottom:10px">'
      + '    <label for="authRegName">' + i18nT('auth.register.name') + '</label>'
      + '    <input id="authRegName" type="text" autocomplete="name" />'
      + '  </div>'
      + '  <div class="form-field" style="margin-bottom:10px">'
      + '    <label for="authRegEmail">' + i18nT('auth.register.email') + '</label>'
      + '    <input id="authRegEmail" type="email" autocomplete="email" />'
      + '  </div>'
      + '  <div class="form-field" style="margin-bottom:10px">'
      + '    <label for="authRegPassword">' + i18nT('auth.register.password') + '</label>'
      + '    <input id="authRegPassword" type="password" autocomplete="new-password" />'
      + '  </div>'
      + '</div>'
      // Login fields
      + '<div id="loginFields" style="display:' + (isRegister ? 'none' : 'block') + '">'
      + '  <div class="form-field" style="margin-bottom:10px">'
      + '    <label for="authUsername">' + i18nT('auth.username') + '</label>'
      + '    <input id="authUsername" type="text" autocomplete="username" />'
      + '  </div>'
      + '  <div class="form-field" style="margin-bottom:10px">'
      + '    <label for="authPassword">' + i18nT('auth.password') + '</label>'
      + '    <input id="authPassword" type="password" autocomplete="current-password" />'
      + '  </div>'
      + '</div>'
      + '<div class="inline-error" id="authError"></div>'
      + '<div class="modal-actions">'
      + '  <button type="button" class="btn btn-ghost" id="btnAuthCancel">' + i18nT('auth.cancel') + '</button>'
      + '  <button type="submit" class="btn btn-primary" id="btnAuthSubmit">'
      +     i18nT(isRegister ? 'auth.register.submit' : 'auth.submit')
      + '  </button>'
      + '</div>'
      + '<div class="credentials-hint" translate="no">' + i18nT('auth.hint') + '</div>'
      + '</form>'
      + '</div>'
      + '</div>';

    document.getElementById('modals').innerHTML = html;

    // Bind events
    var form = document.getElementById('authForm');
    var _isRegisterMode = isRegister;

    document.getElementById('tabLogin').addEventListener('click', function () {
      _isRegisterMode = false;
      document.getElementById('tabLogin').classList.add('active');
      document.getElementById('tabRegister').classList.remove('active');
      document.getElementById('loginFields').style.display = 'block';
      document.getElementById('registerFields').style.display = 'none';
      document.getElementById('btnAuthSubmit').textContent = i18nT('auth.submit');
      document.getElementById('authTitle').textContent = i18nT('auth.title');
      document.getElementById('authError').textContent = '';
      document.getElementById('authError').style.display = 'none';
    });

    document.getElementById('tabRegister').addEventListener('click', function () {
      _isRegisterMode = true;
      document.getElementById('tabRegister').classList.add('active');
      document.getElementById('tabLogin').classList.remove('active');
      document.getElementById('registerFields').style.display = 'block';
      document.getElementById('loginFields').style.display = 'none';
      document.getElementById('btnAuthSubmit').textContent = i18nT('auth.register.submit');
      document.getElementById('authTitle').textContent = i18nT('auth.register.title');
      document.getElementById('authError').textContent = '';
      document.getElementById('authError').style.display = 'none';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errEl = document.getElementById('authError');

      if (_isRegisterMode) {
        var name = (document.getElementById('authRegName').value || '').trim();
        var email = (document.getElementById('authRegEmail').value || '').trim();
        var pass = (document.getElementById('authRegPassword').value || '').trim();
        var result = registerUser(name, email, pass);
        if (!result.ok) {
          errEl.textContent = i18nT(result.error);
          errEl.style.display = 'block';
        }
      } else {
        var user = (document.getElementById('authUsername').value || '').trim();
        var password = (document.getElementById('authPassword').value || '').trim();
        if (!user || !password) {
          errEl.textContent = i18nT('auth.error.required');
          errEl.style.display = 'block';
          return;
        }
        var loginResult = loginUser(user, password);
        if (!loginResult.ok) {
          errEl.textContent = i18nT(loginResult.error);
          errEl.style.display = 'block';
        }
      }
    });

    document.getElementById('btnAuthCancel').addEventListener('click', closeAuthModal);

    // Focus first input
    setTimeout(function () {
      var first = isRegister ? document.getElementById('authRegName') : document.getElementById('authUsername');
      if (first) first.focus();
    }, 100);
  }

  function closeAuthModal() {
    document.getElementById('modals').innerHTML = '';
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  function init() {
    applyThemeFromStorage();
    restoreAuth();
  }

  window.FraudaShell = {
    getAuth: function () { return { ...state.auth }; },
    ensureAuth: ensureAuth,
    createReport: createReport,
    getReports: readReports,
    setReports: writeReports,
    addTestSubmission: addTestSubmission,
    submitCustomMessage: submitCustomMessage,
    submitScammerReport: submitScammerReport,
    getCurrentProfile: getCurrentProfile,
    submitUserProfile: submitUserProfile,
    getTestSubmissions: readTestSubmissions,
    setTestSubmissions: writeTestSubmissions,
    openAuthModal: openAuthModal,
    closeAuthModal: closeAuthModal,
    registerUser: registerUser,
    loginUser: loginUser,
    setTheme: setTheme,
    getTheme: getTheme,
    _logout: logout,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);
