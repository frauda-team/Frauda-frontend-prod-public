/* ══════════════════════════════════════════════════════════════════════
   FraudaLanding — Homepage with unified gradient background (#0D1F3C → #122E55).
   Localized demo result card shows EN/LV content based on language toggle.
   Scaled typography (~20-25% larger). Two CTAs: Verify + Learn how it works.
══════════════════════════════════════════════════════════════════════ */

window.FraudaLanding = (function () {
  'use strict';

  let _scrollHandler = null;

  function t(key, vars) {
    if (window.FraudaI18n && typeof window.FraudaI18n.t === 'function') {
      return window.FraudaI18n.t(key, vars);
    }
    return key;
  }

  function render() {
    return ''
      + '<div class="landing-page">'
      + '  <header class="landing-hero">'
      + '    <div class="landing-hero-geo">'
      + '      <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">'
      + '        <path d="M-100 600Q200 400 500 500T1100 350T1600 500" stroke="rgba(255,255,255,.04)" stroke-width="1" fill="none"/>'
      + '        <path d="M-100 650Q250 450 550 550T1150 400T1600 550" stroke="rgba(255,255,255,.03)" stroke-width="1" fill="none"/>'
      + '        <path d="M-100 300Q300 200 600 280T1200 180T1600 300" stroke="rgba(255,255,255,.035)" stroke-width="1" fill="none"/>'
      + '        <circle cx="150" cy="200" r="180" stroke="rgba(255,255,255,.025)" stroke-width="1" fill="none"/>'
      + '        <circle cx="1300" cy="650" r="220" stroke="rgba(255,255,255,.02)" stroke-width="1" fill="none"/>'
      + '        <circle cx="900" cy="150" r="120" stroke="rgba(255,255,255,.03)" stroke-width="1" fill="none"/>'
      + '        <circle cx="350" cy="350" r="2" fill="rgba(255,255,255,.06)"/>'
      + '        <circle cx="700" cy="250" r="2.5" fill="rgba(255,255,255,.05)"/>'
      + '        <circle cx="1050" cy="400" r="2" fill="rgba(255,255,255,.06)"/>'
      + '        <circle cx="200" cy="550" r="1.5" fill="rgba(255,255,255,.04)"/>'
      + '        <circle cx="850" cy="600" r="2" fill="rgba(255,255,255,.05)"/>'
      + '        <circle cx="1200" cy="300" r="1.5" fill="rgba(255,255,255,.04)"/>'
      + '        <line x1="350" y1="350" x2="700" y2="250" stroke="rgba(255,255,255,.02)" stroke-width="1"/>'
      + '        <line x1="700" y1="250" x2="1050" y2="400" stroke="rgba(255,255,255,.02)" stroke-width="1"/>'
      + '        <line x1="200" y1="550" x2="350" y2="350" stroke="rgba(255,255,255,.015)" stroke-width="1"/>'
      + '        <line x1="850" y1="600" x2="1050" y2="400" stroke="rgba(255,255,255,.015)" stroke-width="1"/>'
      + '        <line x1="1050" y1="400" x2="1200" y2="300" stroke="rgba(255,255,255,.02)" stroke-width="1"/>'
      + '        <radialGradient id="landing-g1"><stop offset="0%" stop-color="rgba(59,125,221,.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'
      + '        <radialGradient id="landing-g2"><stop offset="0%" stop-color="rgba(0,201,177,.06)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'
      + '        <circle cx="250" cy="350" r="200" fill="url(#landing-g1)"/>'
      + '        <circle cx="1150" cy="550" r="250" fill="url(#landing-g2)"/>'
      + '      </svg>'
      + '    </div>'
      + '    <div class="landing-hero-inner">'
      + '      <div class="landing-hero-text">'
      + '        <h1 data-i18n="landing.hero.title">' + t('landing.hero.title') + '</h1>'
      + '        <p data-i18n="landing.hero.sub">' + t('landing.hero.sub') + '</p>'
      + '        <div class="landing-hero-buttons">'
      + '          <a class="landing-btn-primary" href="#/verify" data-i18n="landing.cta.verify">' + t('landing.cta.verify') + '</a>'
      + '          <button class="landing-btn-secondary" type="button" data-scroll-how data-i18n="landing.cta.learn">' + t('landing.cta.learn') + '</button>'
      + '        </div>'
      + '      </div>'
      + '      <div class="landing-hero-card-wrap">'
      + '        <div class="landing-demo">'
      + '          <div class="landing-demo-head">'
      + '            <div>'
      + '              <div class="landing-demo-score-row">'
      + '                <div><div class="landing-demo-score">93%</div><div class="landing-demo-score-sub" data-i18n="landing.demo.risk">' + t('landing.demo.risk') + '</div></div>'
      + '                <div><div class="landing-demo-badge" data-i18n="landing.demo.badge">' + t('landing.demo.badge') + '</div></div>'
      + '              </div>'
      + '              <div class="landing-demo-verdict" data-i18n="landing.demo.verdict">' + t('landing.demo.verdict') + '</div>'
      + '            </div>'
      + '            <div class="landing-demo-type" data-i18n="landing.demo.type">' + t('landing.demo.type') + '</div>'
      + '          </div>'
      + '          <div class="landing-demo-meta">'
      + '            <div class="landing-demo-meta-item"><div class="landing-demo-meta-label" data-i18n="landing.demo.meta.type">' + t('landing.demo.meta.type') + '</div><div class="landing-demo-meta-value" data-i18n="landing.demo.meta.typeValue">' + t('landing.demo.meta.typeValue') + '</div></div>'
      + '            <div class="landing-demo-meta-item"><div class="landing-demo-meta-label" data-i18n="landing.demo.meta.length">' + t('landing.demo.meta.length') + '</div><div class="landing-demo-meta-value" data-i18n="landing.demo.meta.lengthValue">' + t('landing.demo.meta.lengthValue') + '</div></div>'
      + '            <div class="landing-demo-meta-item"><div class="landing-demo-meta-label" data-i18n="landing.demo.meta.origin">' + t('landing.demo.meta.origin') + '</div><div class="landing-demo-meta-value" data-i18n="landing.demo.meta.originValue">' + t('landing.demo.meta.originValue') + '</div></div>'
      + '            <div class="landing-demo-meta-item"><div class="landing-demo-meta-label" data-i18n="landing.demo.meta.language">' + t('landing.demo.meta.language') + '</div><div class="landing-demo-meta-value" data-i18n="landing.demo.meta.languageValue">' + t('landing.demo.meta.languageValue') + '</div></div>'
      + '          </div>'
      + '          <div class="landing-demo-message">'
      + '            <div class="landing-demo-block-title" data-i18n="landing.demo.message_label">' + t('landing.demo.message_label') + '</div>'
      + '            <div class="landing-demo-message-box">'
      + '              <p class="landing-demo-message-text" data-i18n-html="landing.demo.message_content">' + t('landing.demo.message_content') + '</p>'
      + '            </div>'
      + '          </div>'
      + '          <div class="landing-demo-indicators">'
      + '            <div class="landing-demo-block-title" data-i18n="landing.demo.indicators_label">' + t('landing.demo.indicators_label') + '</div>'
      + '            <div class="landing-demo-indicator"><div class="landing-demo-indicator-num">1</div><div><div class="landing-demo-indicator-title" data-i18n="landing.demo.indicator1.title">' + t('landing.demo.indicator1.title') + '</div><div class="landing-demo-indicator-desc" data-i18n="landing.demo.indicator1.desc">' + t('landing.demo.indicator1.desc') + '</div></div></div>'
      + '            <div class="landing-demo-indicator"><div class="landing-demo-indicator-num">2</div><div><div class="landing-demo-indicator-title" data-i18n="landing.demo.indicator2.title">' + t('landing.demo.indicator2.title') + '</div><div class="landing-demo-indicator-desc" data-i18n="landing.demo.indicator2.desc">' + t('landing.demo.indicator2.desc') + '</div></div></div>'
      + '          </div>'
      + '          <div class="landing-demo-actions">'
      + '            <button type="button" class="landing-demo-btn-outline" data-i18n="landing.demo.copy">' + t('landing.demo.copy') + '</button>'
      + '            <div class="landing-demo-actions-right">'
      + '              <button type="button" class="landing-demo-btn-danger" data-i18n="landing.demo.report">' + t('landing.demo.report') + '</button>'
      + '              <button type="button" class="landing-demo-btn-ghost" data-i18n="landing.demo.another">' + t('landing.demo.another') + '</button>'
      + '            </div>'
      + '          </div>'
      + '        </div>'
      + '        <div class="landing-hero-glow"></div>'
      + '      </div>'
      + '    </div>'
      + '  </header>'
      + '  <section class="landing-stats">'
      + '    <div class="landing-stats-inner">'
      + '      <div class="landing-stats-intro">'
      + '        <h2 data-i18n="landing.stats.title">' + t('landing.stats.title') + '</h2>'
      + '        <p data-i18n="landing.stats.sub">' + t('landing.stats.sub') + '</p>'
      + '      </div>'
      + '      <div class="landing-stats-grid">'
      + '        <div><div class="landing-stat-number">&euro;23.7M</div><p class="landing-stat-label" data-i18n="landing.stats.item1">' + t('landing.stats.item1') + '</p></div>'
      + '        <div><div class="landing-stat-number">8,701</div><p class="landing-stat-label" data-i18n="landing.stats.item2">' + t('landing.stats.item2') + '</p></div>'
      + '        <div><div class="landing-stat-number">6,475</div><p class="landing-stat-label" data-i18n="landing.stats.item3">' + t('landing.stats.item3') + '</p></div>'
      + '      </div>'
      + '      <p class="landing-stats-source" data-i18n="landing.stats.source">' + t('landing.stats.source') + '</p>'
      + '    </div>'
      + '  </section>'
      + '  <section class="landing-trust">'
      + '    <div class="landing-trust-inner">'
      + '      <div class="landing-trust-item"><span class="material-symbols-outlined">verified_user</span><span data-i18n="landing.trust.item1">' + t('landing.trust.item1') + '</span></div>'
      + '      <div class="landing-trust-item"><span class="material-symbols-outlined">lock_open</span><span data-i18n="landing.trust.item2">' + t('landing.trust.item2') + '</span></div>'
      + '      <div class="landing-trust-item"><span class="material-symbols-outlined">bolt</span><span data-i18n="landing.trust.item3">' + t('landing.trust.item3') + '</span></div>'
      + '      <div class="landing-trust-item"><span class="material-symbols-outlined">payments</span><span data-i18n="landing.trust.item4">' + t('landing.trust.item4') + '</span></div>'
      + '    </div>'
      + '  </section>'
      + '  <section class="landing-how" id="howSection">'
      + '    <div class="landing-how-inner">'
      + '      <h2 class="landing-how-title" data-i18n="landing.how.title">' + t('landing.how.title') + '</h2>'
      + '      <div class="landing-how-grid">'
      + '        <div class="landing-how-line"></div>'
      + '        <div class="landing-how-step"><div class="landing-how-icon"><span class="material-symbols-outlined">upload_file</span></div><div class="landing-how-card"><h3 data-i18n="landing.how.submit.title">' + t('landing.how.submit.title') + '</h3><p data-i18n="landing.how.submit.desc">' + t('landing.how.submit.desc') + '</p></div></div>'
      + '        <div class="landing-how-step"><div class="landing-how-icon"><span class="material-symbols-outlined">psychology</span></div><div class="landing-how-card"><h3 data-i18n="landing.how.analyze.title">' + t('landing.how.analyze.title') + '</h3><p data-i18n="landing.how.analyze.desc">' + t('landing.how.analyze.desc') + '</p></div></div>'
      + '        <div class="landing-how-step"><div class="landing-how-icon"><span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">verified</span></div><div class="landing-how-card"><h3 data-i18n="landing.how.result.title">' + t('landing.how.result.title') + '</h3><p data-i18n="landing.how.result.desc">' + t('landing.how.result.desc') + '</p></div></div>'
      + '      </div>'
      + '    </div>'
      + '  </section>'
      + '  <section class="landing-community">'
      + '    <div class="landing-community-inner">'
      + '      <div class="landing-community-text">'
      + '        <h2 data-i18n="landing.community.title">' + t('landing.community.title') + '</h2>'
      + '        <p data-i18n="landing.community.desc">' + t('landing.community.desc') + '</p>'
      + '        <div class="landing-community-features">'
      + '          <div class="landing-community-feature"><div class="landing-community-feature-icon"><span class="material-symbols-outlined">search_check</span></div><div><h4 data-i18n="landing.community.feature1.title">' + t('landing.community.feature1.title') + '</h4><p data-i18n="landing.community.feature1.text">' + t('landing.community.feature1.text') + '</p></div></div>'
      + '          <div class="landing-community-feature"><div class="landing-community-feature-icon"><span class="material-symbols-outlined">flag</span></div><div><h4 data-i18n="landing.community.feature2.title">' + t('landing.community.feature2.title') + '</h4><p data-i18n="landing.community.feature2.text">' + t('landing.community.feature2.text') + '</p></div></div>'
      + '          <div class="landing-community-feature"><div class="landing-community-feature-icon"><span class="material-symbols-outlined">groups</span></div><div><h4 data-i18n="landing.community.feature3.title">' + t('landing.community.feature3.title') + '</h4><p data-i18n="landing.community.feature3.text">' + t('landing.community.feature3.text') + '</p></div></div>'
      + '        </div>'
      + '      </div>'
      + '      <div class="landing-community-visual">'
      + '        <div class="landing-community-stat-card">'
      + '          <div class="landing-community-stat-big">12,480</div>'
      + '          <div class="landing-community-stat-label" data-i18n="landing.community.card1.label">' + t('landing.community.card1.label') + '</div>'
      + '        </div>'
      + '        <div class="landing-community-stat-row">'
      + '          <div class="landing-community-stat-small"><div class="landing-community-small-num">4,912</div><div class="landing-community-small-label" data-i18n="landing.community.card2.label">' + t('landing.community.card2.label') + '</div></div>'
      + '          <div class="landing-community-stat-small"><div class="landing-community-small-num">94.3%</div><div class="landing-community-small-label" data-i18n="landing.community.card3.label">' + t('landing.community.card3.label') + '</div></div>'
      + '        </div>'
      + '        <p class="landing-community-disclaimer" data-i18n="landing.community.disclaimer">' + t('landing.community.disclaimer') + '</p>'
      + '      </div>'
      + '    </div>'
      + '  </section>'
      + '  <footer class="landing-footer">'
      + '    <div class="landing-footer-inner">'
      + '      <div><div class="landing-footer-brand">Frauda</div><p class="landing-footer-copy" data-i18n="landing.footer.copyright">' + t('landing.footer.copyright') + '</p></div>'
      + '      <div class="landing-footer-links"><a href="#" data-i18n="landing.footer.privacy">' + t('landing.footer.privacy') + '</a><a href="#" data-i18n="landing.footer.terms">' + t('landing.footer.terms') + '</a><a href="#" data-i18n="landing.footer.contact">' + t('landing.footer.contact') + '</a></div>'
      + '      <div class="landing-footer-universities"><div class="landing-footer-university"><span class="material-symbols-outlined">school</span><span data-i18n="landing.footer.uni1">' + t('landing.footer.uni1') + '</span></div><div class="landing-footer-university"><span class="material-symbols-outlined">school</span><span data-i18n="landing.footer.uni2">' + t('landing.footer.uni2') + '</span></div></div>'
      + '    </div>'
      + '  </footer>'
      + '</div>';
  }

  function init() {
    _scrollHandler = function () {
      const howSection = document.getElementById('howSection');
      if (howSection) howSection.scrollIntoView({ behavior: 'smooth' });
    };
    const scrollBtn = document.querySelector('[data-scroll-how]');
    if (scrollBtn) scrollBtn.addEventListener('click', _scrollHandler);
  }

  function destroy() {
    const scrollBtn = document.querySelector('[data-scroll-how]');
    if (scrollBtn && _scrollHandler) scrollBtn.removeEventListener('click', _scrollHandler);
    _scrollHandler = null;
  }

  return { render: render, init: init, destroy: destroy };
})();
