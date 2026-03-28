(function (window, document) {
  const KEYS = {
    onboarded: 'frauda_onboarded',
    theme: 'frauda_theme',
    auth: 'frauda_auth',
    reports: 'frauda_reports',
    scenariosTest: 'scenarios_test',
  };

  const TEST_CREDENTIALS = { username: 'test', password: 'test' };
  const USER_ID = 'test-user';

  const state = {
    auth: { isAuthenticated: false, username: 'guest' },
    pendingAction: null,
  };

  function getLS(key, fallback = null) {
    try {
      const val = window.localStorage.getItem(key);
      return val === null ? fallback : val;
    } catch (err) {
      console.warn('localStorage read failed', err);
      return fallback;
    }
  }

  function setLS(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      console.warn('localStorage write failed', err);
    }
  }

  function removeLS(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn('localStorage remove failed', err);
    }
  }

  function i18nT(key, vars) {
    if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') {
      return window.FraudaI18n.t(key, vars);
    }
    return key;
  }

  function setTheme(theme) {
    const normalized = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', normalized);
    setLS(KEYS.theme, normalized);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.textContent = normalized === 'dark' ? '☾' : '◐';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  function applyThemeFromStorage() {
    const stored = getLS(KEYS.theme, 'light');
    setTheme(stored);
  }

  function readReports() {
    const raw = getLS(KEYS.reports, '[]');
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeReports(reports) {
    setLS(KEYS.reports, JSON.stringify(reports));
  }

  function readTestSubmissions() {
    const raw = getLS(KEYS.scenariosTest, '[]');
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeTestSubmissions(items) {
    setLS(KEYS.scenariosTest, JSON.stringify(items));
  }

  function reportSummaryFromInput(inputData) {
    if (inputData && inputData._summary) return inputData._summary;
    const name = inputData.fullName || 'Unknown';
    const channel = inputData.channel || 'n/a';
    return `${name} · ${channel}`;
  }

  function createReport(inputData) {
    const report = {
      id: `rep_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      created_at: new Date().toISOString(),
      user_id: USER_ID,
      input: inputData,
      status: 'in work',
      summary: reportSummaryFromInput(inputData),
    };
    const reports = readReports();
    reports.unshift(report);
    writeReports(reports);
    window.dispatchEvent(new CustomEvent('frauda:reports-changed'));

    window.setTimeout(() => {
      const updated = readReports();
      const idx = updated.findIndex(r => r.id === report.id);
      if (idx === -1) return;
      updated[idx].status = Math.random() > 0.2 ? 'success' : 'fail';
      writeReports(updated);
      window.dispatchEvent(new CustomEvent('frauda:reports-changed'));
    }, 2200);

    return report;
  }

  function addTestSubmission(payload) {
    const entry = {
      id: `test_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      created_at: new Date().toISOString(),
      user_id: USER_ID,
      type: payload.type,
      text_message: payload.type === 'text' ? payload.text_message : '',
      voice_file_name: payload.type === 'voice' ? payload.voice_file_name : '',
      source: 'user',
      status: 'in work',
    };
    const current = readTestSubmissions();
    current.unshift(entry);
    writeTestSubmissions(current);
    window.dispatchEvent(new CustomEvent('frauda:test-submissions-changed'));
    return entry;
  }

  function updateAuthUI() {
    const navUser = document.getElementById('navbarUser');
    if (navUser) navUser.textContent = state.auth.username || 'guest';
    const logout = document.getElementById('btnLogout');
    if (logout) logout.style.display = state.auth.isAuthenticated ? '' : 'none';
    window.dispatchEvent(new CustomEvent('frauda:auth-changed', { detail: { ...state.auth } }));
  }

  function restoreAuth() {
    const raw = getLS(KEYS.auth, null);
    if (!raw) return updateAuthUI();
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isAuthenticated) {
        state.auth = { isAuthenticated: true, username: parsed.username || TEST_CREDENTIALS.username };
      }
    } catch {
      state.auth = { isAuthenticated: false, username: 'guest' };
    }
    updateAuthUI();
  }

  function setAuthenticated(username) {
    state.auth = { isAuthenticated: true, username };
    setLS(KEYS.auth, JSON.stringify(state.auth));
    closeAuthModal();
    updateAuthUI();
    if (typeof state.pendingAction === 'function') {
      const fn = state.pendingAction;
      state.pendingAction = null;
      fn();
    }
  }

  function logout() {
    removeLS(KEYS.auth);
    state.auth = { isAuthenticated: false, username: 'guest' };
    updateAuthUI();
  }

  function ensureAuth(options = {}) {
    if (state.auth.isAuthenticated) return true;
    state.pendingAction = typeof options.onSuccess === 'function' ? options.onSuccess : null;
    openAuthModal(options.messageKey || 'auth.default_message');
    return false;
  }

  function showOnboardingIfNeeded() {
    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay) return;
    const onboarded = getLS(KEYS.onboarded, '0') === '1';
    if (onboarded) {
      overlay.classList.remove('visible');
      return;
    }
    overlay.classList.add('visible');
  }

  function completeOnboarding() {
    setLS(KEYS.onboarded, '1');
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) overlay.classList.remove('visible');
  }

  function openAuthModal(messageKey) {
    const overlay = document.getElementById('authOverlay');
    if (!overlay) return;
    const msg = document.getElementById('authMessage');
    const err = document.getElementById('authError');
    const user = document.getElementById('authUsername');
    const pass = document.getElementById('authPassword');
    if (msg) msg.textContent = i18nT(messageKey || 'auth.default_message');
    if (err) err.textContent = '';
    if (user) user.value = '';
    if (pass) pass.value = '';
    overlay.classList.add('visible');
    if (user) user.focus();
  }

  function closeAuthModal() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.remove('visible');
  }

  function setupAuthHandlers() {
    const form = document.getElementById('authForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('authUsername');
        const pass = document.getElementById('authPassword');
        const err = document.getElementById('authError');
        const u = (user?.value || '').trim();
        const p = (pass?.value || '').trim();
        if (!u || !p) {
          if (err) err.textContent = i18nT('auth.error.required');
          return;
        }
        if (u !== TEST_CREDENTIALS.username || p !== TEST_CREDENTIALS.password) {
          if (err) err.textContent = i18nT('auth.error.invalid');
          return;
        }
        setAuthenticated(u);
      });
    }

    const cancelBtn = document.getElementById('btnAuthCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeAuthModal);
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
  }

  function setupThemeHandlers() {
    const btn = document.getElementById('btnTheme');
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  function setupOnboardingHandlers() {
    const btn = document.getElementById('btnOnboardingStart');
    if (btn) {
      btn.addEventListener('click', () => {
        completeOnboarding();
      });
    }
  }

  function init() {
    applyThemeFromStorage();
    restoreAuth();
    setupThemeHandlers();
    setupOnboardingHandlers();
    setupAuthHandlers();
    showOnboardingIfNeeded();
  }

  window.FraudaShell = {
    getAuth: () => ({ ...state.auth }),
    ensureAuth,
    createReport,
    getReports: readReports,
    setReports: writeReports,
    addTestSubmission,
    getTestSubmissions: readTestSubmissions,
    setTestSubmissions: writeTestSubmissions,
    openAuthModal,
    completeOnboarding,
    setTheme,
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);
