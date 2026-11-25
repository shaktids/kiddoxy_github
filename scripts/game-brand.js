(function(){
  if (window.__kiddoxyBrandLoaded) return;
  window.__kiddoxyBrandLoaded = true;

  function injectStyles(){
    if (document.getElementById('kiddoxy-brand-styles')) return;
    var style = document.createElement('style');
    style.id = 'kiddoxy-brand-styles';
    style.textContent = [
      'html,body{-webkit-text-size-adjust:100%;overflow-x:hidden;}',
      'img,svg,canvas,video{max-width:100%;height:auto;}',
      'button,input,select,textarea{font:inherit;}',
      'body{margin:0;word-break:break-word;}',
      'header,.game-header,.site-header{flex-wrap:wrap;gap:10px;align-items:center;}',
      'main,.game-root,.wrap{min-width:0;}',
      'section,article,aside,div{box-sizing:border-box;}',
      '.kiddoxy-brand{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.94);color:#1f2937;text-decoration:none;font-weight:800;box-shadow:0 6px 18px rgba(15,23,42,.12);}',
      '.kiddoxy-brand-logo{width:28px;height:28px;object-fit:contain;border-radius:8px;flex:none;}',
      '.kiddoxy-brand-fixed{position:fixed;left:12px;top:12px;z-index:10000;}',
      '@media (max-width:900px){main{grid-template-columns:1fr !important;}.panel,.dialog,.intro-card,.board,.tray,.play-area,.stage,.clock,.game-board{max-width:100%;}.controls{max-width:100%;flex-wrap:wrap;}.controls .btn,.controls button,.controls a{min-width:0;flex:1 1 120px;}}',
      '@media (max-width:480px){.kiddoxy-brand{padding:5px 8px;font-size:13px}.kiddoxy-brand-logo{width:24px;height:24px}.kiddoxy-brand-fixed{left:8px;top:8px}.pill{min-width:0}.btn,.small-btn{width:auto}}'
    ].join('');
    document.head.appendChild(style);
  }

  function createBrand(){
    var link = document.createElement('a');
    link.className = 'kiddoxy-brand';
    link.href = '/index.html';
    link.setAttribute('aria-label', 'Kiddoxy home');
    link.innerHTML = '<img class="kiddoxy-brand-logo" src="/kiddoxy.png" alt="" /><span>Kiddoxy</span>';
    return link;
  }

  function injectBrand(){
    injectStyles();
    if (document.querySelector('.kiddoxy-brand')) return;

    var brand = createBrand();
    var header = document.querySelector('body > .wrap > header, body > header, header.game-header, .site-header');
    if (header){
      header.insertBefore(brand, header.firstChild);
    } else {
      brand.className += ' kiddoxy-brand-fixed';
      document.body.appendChild(brand);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBrand);
  } else {
    injectBrand();
  }
})();
