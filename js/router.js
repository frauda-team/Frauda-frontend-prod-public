/* ══════════════════════════════════════════════════════════════════════
   FraudaRouter — Hash-based SPA router
   Routes: #/ (landing), #/verify (verify), #/dashboard (dashboard), #/profile (profile)
   Renders themed navbar (navy dark / light blue-gray light) with profile/login state.
   Logo uses assets/frauda-full.png. Mobile hamburger menu at ≤768px.
══════════════════════════════════════════════════════════════════════ */

const FraudaRouter = (function (window, document) {
  'use strict';

  const ROUTES = {
    '': 'landing',
    'verify': 'verify',
    'dashboard': 'dashboard',
    'profile': 'profile',
  };

  let _currentPage = null;
  let _mobileMenuOpen = false;
  let _routeState = {
    panel: null,
    reportId: null,
    modal: null,
  };

  function i18nT(key, vars) {
    if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') {
      return window.FraudaI18n.t(key, vars);
    }
    return key;
  }

  function getPage() {
    const pages = {
      landing: window.FraudaLanding,
      verify: window.FraudaVerify,
      dashboard: window.FraudaDashboard,
      profile: window.FraudaProfile,
    };
    return pages;
  }

  function getRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return ROUTES[hash] || 'landing';
  }

  function navigate(path) {
    window.location.hash = '#/' + path;
  }

  /* ── Navbar ───────────────────────────────────────────────────────── */
  // Use branded logo from assets
  const LOGO_IMG = `<img src="assets/frauda-full.png" alt="Frauda" class="nav-logo-img" style="height:32px;width:auto;" />`;

  function renderNavbar(route) {
    const auth = window.FraudaShell ? window.FraudaShell.getAuth() : { isAuthenticated: false, username: 'guest' };
    const theme = window.FraudaShell ? window.FraudaShell.getTheme() : 'light';

    const navLinks = `
      <a href="#/" class="nav-link ${route === 'landing' ? 'active' : ''}" aria-label="Home" title="Home">
        <span class="material-symbols-outlined" style="font-size:1.15rem;line-height:1">home</span>
      </a>
      <a href="#/verify" class="nav-link ${route === 'verify' ? 'active' : ''}" aria-label="Verify" title="Verify">
        <span class="material-symbols-outlined" style="font-size:1.15rem;line-height:1">policy</span>
      </a>
      <a href="#/dashboard" class="nav-link ${route === 'dashboard' ? 'active' : ''}" aria-label="Dashboard" title="Dashboard">
        <span class="material-symbols-outlined" style="font-size:1.15rem;line-height:1">monitoring</span>
      </a>
    `;

    const authSection = auth.isAuthenticated
      ? `<button class="nav-btn nav-btn-profile" data-nav-profile type="button" title="Profile" aria-label="Profile">
           <span class="material-symbols-outlined" style="font-size:1rem;line-height:1">person</span>
           <span translate="no">${escapeHtml(auth.username)}</span>
         </button>`
      : `<button class="nav-btn nav-btn-profile" data-nav-login type="button" aria-label="Sign in">
           <span class="material-symbols-outlined" style="font-size:1rem;line-height:1">login</span>
           <span data-i18n="nav.login">Sign in</span>
         </button>`;

    document.getElementById('navbar').innerHTML = `
      <div class="nav-left">
        <a href="#/" style="display:flex;align-items:center;gap:10px;text-decoration:none">
          ${LOGO_IMG}
          <span class="nav-brand" translate="no">Frauda</span>
        </a>
        <div class="nav-sep"></div>
        <div class="nav-links">${navLinks}</div>
      </div>
      <div class="nav-right">
        <button id="btnLang" class="lang-btn" type="button" aria-label="Switch language">EN</button>
        <button id="btnTheme" class="theme-btn" type="button" aria-label="Toggle theme" title="Toggle theme">
          <span class="theme-icon" id="themeIcon" aria-hidden="true">${theme === 'dark' ? '☀' : '🌙'}</span>
        </button>
        <div class="nav-user-area">${authSection}</div>
        <button class="nav-hamburger" id="navHamburger" type="button" aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    `;

    // Mobile menu with close button and logout
    document.getElementById('mobileMenu').innerHTML = `
      <button class="nav-mobile-close" id="mobileMenuClose" type="button" aria-label="Close menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      ${navLinks}
      <div style="padding:16px 0; border-top:1px solid var(--navbar-border); margin-top:auto;">
        ${authSection}
      </div>
    `;

    // Bind navbar events
    bindNavEvents();
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function bindNavEvents() {
    const langBtn = document.getElementById('btnLang');
    if (langBtn) langBtn.addEventListener('click', () => {
      if (window.FraudaI18n) window.FraudaI18n.toggleLanguage();
    });

    const themeBtn = document.getElementById('btnTheme');
    const themeIcon = document.getElementById('themeIcon');
    if (themeBtn) themeBtn.addEventListener('click', () => {
      if (window.FraudaShell) {
        const current = window.FraudaShell.getTheme();
        // Add rotation animation
        if (themeIcon) {
          themeIcon.classList.add('rotating');
          setTimeout(() => themeIcon.classList.remove('rotating'), 400);
        }
        window.FraudaShell.setTheme(current === 'dark' ? 'light' : 'dark');
      }
    });

    document.querySelectorAll('[data-nav-login]').forEach((loginBtn) => {
      loginBtn.addEventListener('click', () => {
        if (window.FraudaShell) window.FraudaShell.openAuthModal('auth.default_message');
      });
    });

    document.querySelectorAll('[data-nav-profile]').forEach((profileBtn) => {
      profileBtn.addEventListener('click', () => {
        // Navigate to profile page instead of opening panel
        const auth = window.FraudaShell ? window.FraudaShell.getAuth() : { isAuthenticated: false };
        if (auth.isAuthenticated) {
          navigate('profile');
        } else {
          // Redirect to login
          if (window.FraudaShell) window.FraudaShell.openAuthModal('auth.required_for_profile');
        }
      });
    });

    const hamburger = document.getElementById('navHamburger');
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on link click
    document.getElementById('mobileMenu').querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => closeMobileMenu());
    });

    // Close button in mobile menu
    const mobileClose = document.getElementById('mobileMenuClose');
    if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

    // Close on backdrop click
    const backdrop = document.getElementById('mobileBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeMobileMenu);
  }

  function toggleMobileMenu() {
    _mobileMenuOpen = !_mobileMenuOpen;
    document.getElementById('mobileMenu').classList.toggle('open', _mobileMenuOpen);
    const backdrop = document.getElementById('mobileBackdrop');
    if (backdrop) backdrop.classList.toggle('open', _mobileMenuOpen);
  }

  function closeMobileMenu() {
    _mobileMenuOpen = false;
    document.getElementById('mobileMenu').classList.remove('open');
    const backdrop = document.getElementById('mobileBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  // Keep the old profile panel function for backwards compatibility (e.g. post-registration flow)
  function openProfilePanel(fromRegistration) {
    if (!window.FraudaShell || !window.FraudaShell.getAuth().isAuthenticated) return;
    const profile = window.FraudaShell.getCurrentProfile() || {};
    const auth = window.FraudaShell.getAuth();
    const modals = document.getElementById('modals');
    modals.innerHTML = `
      <div class="panel-overlay visible" id="profilePanelOverlay"></div>
      <aside class="slide-panel open" id="profilePanel">
        <div class="panel-header">
          <h3 data-i18n="common.profile.title">Profile</h3>
          <button class="panel-close" id="closeProfilePanel" type="button">&times;</button>
        </div>
        <div class="panel-body">
          <p data-i18n="${fromRegistration ? 'common.profile.onboarding_desc' : 'common.profile.desc'}">${i18nT(fromRegistration ? 'common.profile.onboarding_desc' : 'common.profile.desc')}</p>
          <form id="profileForm" novalidate>
            <div class="form-field" style="margin-bottom:12px">
              <label for="profileName" data-i18n="common.profile.full_name">Full name</label>
              <input id="profileName" type="text" value="${escapeHtml(profile.full_name || auth.username || '')}" />
            </div>
            <div class="form-field" style="margin-bottom:12px">
              <label for="profileEmail" data-i18n="common.profile.email">Email</label>
              <input id="profileEmail" type="email" value="${escapeHtml(profile.email || auth.email || '')}" />
            </div>
            <div class="form-field" style="margin-bottom:12px">
              <label for="profilePhone" data-i18n="common.profile.phone">Phone</label>
              <input id="profilePhone" type="tel" value="${escapeHtml(profile.phone || '')}" />
            </div>
            <div class="form-field" style="margin-bottom:12px">
              <label for="profileAge" data-i18n="common.profile.age">Age</label>
              <input id="profileAge" type="number" min="18" max="100" value="${escapeHtml(profile.age || '')}" />
            </div>
            <div class="inline-error" id="profileError"></div>
            <div class="inline-success" id="profileSuccess"></div>
            <button class="btn btn-primary" type="submit" data-i18n="common.profile.save">Save profile</button>
          </form>
        </div>
      </aside>
    `;
    bindProfilePanelHandlers();
    window.dispatchEvent(new CustomEvent('frauda:route-state', { detail: { modal: 'profile' } }));
  }

  function bindProfilePanelHandlers() {
    const closeBtn = document.getElementById('closeProfilePanel');
    const overlay = document.getElementById('profilePanelOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closeProfilePanel);
    if (overlay) overlay.addEventListener('click', closeProfilePanel);

    const form = document.getElementById('profileForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const error = document.getElementById('profileError');
      const success = document.getElementById('profileSuccess');
      const profileNameEl = document.getElementById('profileName');
      const profileEmailEl = document.getElementById('profileEmail');
      const profilePhoneEl = document.getElementById('profilePhone');
      const profileAgeEl = document.getElementById('profileAge');
      const full_name = ((profileNameEl && profileNameEl.value) || '').trim();
      const email = ((profileEmailEl && profileEmailEl.value) || '').trim();
      const phone = ((profilePhoneEl && profilePhoneEl.value) || '').trim();
      const age = ((profileAgeEl && profileAgeEl.value) || '').trim();
      if (error) { error.style.display = 'none'; error.textContent = ''; }
      if (success) { success.style.display = 'none'; success.textContent = ''; }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!full_name || !emailOk) {
        if (error) {
          error.textContent = i18nT('common.profile.error');
          error.style.display = 'block';
        }
        return;
      }

      window.FraudaShell.submitUserProfile({ full_name, email, phone, age }).then((res) => {
        if (res.ok && res.status === 200) {
          if (success) {
            success.textContent = i18nT('common.profile.saved');
            success.style.display = 'block';
          }
        } else {
          if (error) {
            error.textContent = i18nT('common.profile.save_fail');
            error.style.display = 'block';
          }
        }
      }).catch(() => {
        if (error) {
          error.textContent = i18nT('common.profile.save_fail');
          error.style.display = 'block';
        }
      });
    });
  }

  function closeProfilePanel() {
    const modals = document.getElementById('modals');
    if (modals) modals.innerHTML = '';
    window.dispatchEvent(new CustomEvent('frauda:route-state', { detail: { modal: null } }));
  }

  /* ── Page Rendering ───────────────────────────────────────────────── */
  function render() {
    const route = getRoute();
    const pages = getPage();
    const page = pages[route];

    if (!page) {
      document.getElementById('app').innerHTML = '<div style="padding:60px;text-align:center"><h2>Page not found</h2><p><a href="#/">Go home</a></p></div>';
      return;
    }

    // Destroy previous page instance before re-rendering
    if (_currentPage) {
      const prevPage = pages[_currentPage];
      if (prevPage && typeof prevPage.destroy === 'function') {
        prevPage.destroy();
      }
    }

    _currentPage = route;

    // Close mobile menu on navigation
    closeMobileMenu();

    // Render navbar
    renderNavbar(route);

    // Render page content
    const app = document.getElementById('app');
    app.innerHTML = page.render();
    page.init();
    page.restoreState && page.restoreState(_routeState);
    if (_routeState.modal === 'profile' && !document.getElementById('profilePanel')) {
      openProfilePanel(false);
    }

    // Apply i18n translations to new content
    if (window.FraudaI18n) {
      window.FraudaI18n.applyTranslations(document);
    }

    // Update page title
    const titleMap = {
      landing: 'Frauda',
      verify: 'Frauda — ' + i18nT('nav.verify'),
      dashboard: 'Frauda — ' + i18nT('nav.dashboard'),
    };
    document.title = titleMap[route] || 'Frauda';

    if (!(_routeState.panel || _routeState.modal || _routeState.reportId)) {
      window.scrollTo(0, 0);
    }
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  function init() {
    window.addEventListener('hashchange', render);
    window.addEventListener('frauda:auth-changed', () => renderNavbar(getRoute()));
    window.addEventListener('frauda:registration-success', () => {
      openProfilePanel(true);
    });
    window.addEventListener('frauda:route-state', (e) => {
      _routeState = Object.assign({}, _routeState, e.detail || {});
    });
    window.addEventListener('frauda:lang-changed', () => {
      // Re-render current page on language change
      render();
    });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  return { navigate, render, getRoute };
})(window, document);
