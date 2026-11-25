// navbar-footer.js
// Dynamically injects the site navbar and footer into the page

export function injectNavbar() {
  const navbar = `
  <header class="site-header">
    <a href="/index.html" class="brand" style="text-decoration:none;display:flex;align-items:center;gap:8px;">
      <img src="/kiddoxy.png" alt="Kiddoxy logo" class="brand-logo" width="48" height="48">
      <span class="brand-text">Kiddoxy</span>
    </a>
    <nav class="actions">
      <button id="parent-btn" class="small-btn">Parent</button>
    </nav>
  </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', navbar);
}

export function injectFooter() {
  const year = new Date().getFullYear();
  const footer = `
  <footer class="site-footer dark-footer">
    <div class="footer-main">
      <div class="footer-col footer-brand-col">
        <div class="footer-logo-row">
          <img src="/kiddoxy.png" alt="Kiddoxy logo" class="footer-logo" width="48" height="48">
          <span class="footer-brand">Kiddoxy</span>
        </div>
        <div class="footer-tagline">Fun & Safe Games for Kids</div>
        <div class="footer-social-row">
          <a href="https://twitter.com/" target="_blank" aria-label="Twitter" class="footer-icon dark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1DA1F2"/><path d="M19 8.5C18.4 8.8 17.8 9 17.1 9.1C17.8 8.7 18.3 8 18.5 7.2C17.9 7.6 17.2 7.9 16.4 8C15.8 7.4 14.9 7 14 7C12.3 7 11 8.3 11 10C11 10.2 11 10.4 11.1 10.6C8.7 10.5 6.6 9.3 5.2 7.5C5 7.9 4.9 8.3 4.9 8.7C4.9 9.6 5.4 10.4 6.1 10.8C5.6 10.8 5.1 10.7 4.7 10.5C4.7 10.5 4.7 10.5 4.7 10.6C4.7 12 5.7 13.2 7.1 13.5C6.8 13.6 6.5 13.7 6.2 13.7C6 13.7 5.8 13.7 5.6 13.6C6 14.8 7.1 15.7 8.4 15.7C7.4 16.5 6.1 17 4.7 17C4.5 17 4.3 17 4.1 17C5.4 17.9 7 18.5 8.7 18.5C14 18.5 17.2 14.1 17.2 10.3C17.2 10.1 17.2 9.9 17.2 9.7C17.8 9.3 18.3 8.9 19 8.5Z" fill="#fff"/></svg></a>
          <a href="https://instagram.com/" target="_blank" aria-label="Instagram" class="footer-icon dark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#E1306C"/><path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" stroke="#fff" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="#fff"/></svg></a>
          <a href="https://www.youtube.com/@Kiddoxy" target="_blank" aria-label="YouTube" class="footer-icon dark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FF0000"/><path d="M10 15.5V8.5L16 12L10 15.5Z" fill="#fff"/></svg></a>
          <a href="mailto:info@kiddoxy.com" aria-label="Mail" class="footer-icon dark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#6366F1"/><path d="M6 8.5L12 13L18 8.5V16C18 16.8 17.3 17.5 16.5 17.5H7.5C6.7 17.5 6 16.8 6 16V8.5Z" fill="#fff"/><path d="M6 8.5L12 13L18 8.5" stroke="#fff" stroke-width="1.5"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Games</div>
        <a href="/game/memory.html">Memory Match</a>
        <a href="/game/word-builder.html">Word Builder</a>
        <a href="/game/odd-one-out.html">Odd One Out</a>
        <a href="/game/alphabet-catch.html">Alphabet Catch</a>
        <a href="/game/color-shape-match.html">Color & Shape Match</a>
        <a href="/game/star-catcher.html">Star Catcher</a>
        <a href="/game/tic-tac-toe.html">Tic-Tac-Toe</a>
        <a href="/game/lane-racer.html">Lane Racer</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Resources</div>
        <a href="/privacy.html">Privacy & Safety</a>
        <a href="/help.html">Help & FAQ</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">About</div>
        <a href="/about.html">About Kiddoxy</a>
        <a href="#">For Parents</a>
        <a href="/terms.html">Terms of Service</a>
      </div>
    </div>
    <div style="border-top:1px solid #232a36;margin-top:0;padding:18px 0 12px 0;text-align:center;color:#7a8599;font-size:15px;margin-left:auto;margin-right:auto;padding-left:32px;padding-right:32px;">
      &copy; ${year} Kiddoxy. All rights reserved.
    </div>
  </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', footer);
}
