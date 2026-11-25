// game-shell.js — minimal scaffolding for games, ad hooks, and parental gate logic

const App = (function(){
  const CHILD_AGE_THRESHOLD = 13;
  let isChildMode = false;

  function showParentalGate(){
    document.getElementById('ageModal').classList.remove('hidden');
  }
  function closeParentalModal(){
    document.getElementById('ageModal').classList.add('hidden');
  }
  function handleParentalConfirm(year){
    const nowYear = new Date().getFullYear();
    const age = nowYear - year;
    if (age >= 18){
      // assume parent — show parental settings (placeholder)
      alert('Parental access granted. Configure settings in future.');
      closeParentalModal();
    } else {
      alert('Sorry, parental access requires an adult.');
    }
  }

  function init(){
    // Basic accessibility & large-tap improvements
    document.documentElement.style.fontSize = '16px';

    // Wire export to global for index.html to call
    window.showParentalGate = showParentalGate;
    window.handleParentalConfirm = handleParentalConfirm;
    window.closeParentalModal = closeParentalModal;

    // Setup ad placeholders / events
    setupAdPlaceholders();
  }

  function setupAdPlaceholders(){
    // Example: show a placeholder text where a real ad integration should go
    const adBanner = document.getElementById('ad-banner-bottom');
    if (adBanner){
      adBanner.textContent = 'Banner ad placeholder — integrate AdSense/AdMob here (non-personalized).';
    }
  }

  // Hook points for games to request ads
  function showInterstitial(){
    // Developers: replace this with real interstitial calls to Ad network SDK
    console.log('showInterstitial requested');
    alert('Interstitial ad placeholder');
  }
  function showRewarded(){
    console.log('showRewarded requested');
    alert('Rewarded ad placeholder — reward after watch');
  }

  return {init, showInterstitial, showRewarded};
})();

// Auto init
document.addEventListener('DOMContentLoaded', App.init);

// Celebration overlay: confetti + balloons for win states
(() => {
  function createOverlay(){
    let ov = document.getElementById('celebration-overlay');
    if(ov) return ov;
    ov = document.createElement('div');
    ov.id = 'celebration-overlay';
    ov.style.position = 'fixed';
    ov.style.inset = '0';
    ov.style.pointerEvents = 'none';
    ov.style.zIndex = '9999';
    ov.style.overflow = 'hidden';
    document.body.appendChild(ov);
    return ov;
  }

  const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#06b6d4'];

  function confetti(count=60, duration=2500){
    const ov = createOverlay();
    for(let i=0;i<count;i++){
      const el = document.createElement('div');
      const size = 6 + Math.random()*6;
      el.style.position='absolute';
      el.style.left = Math.random()*100 + 'vw';
      el.style.top = (-10 - Math.random()*30) + 'px';
      el.style.width = size+'px'; el.style.height=size+'px';
      el.style.background = COLORS[i % COLORS.length];
      el.style.borderRadius = '2px';
      el.style.opacity = '0.9';
      el.style.transform = `translate3d(0,0,0) rotate(${Math.random()*180}deg)`;
      el.style.transition = `transform ${1.5+Math.random()}s cubic-bezier(.2,.7,.2,1), top ${1.6+Math.random()}s ease-in`;
      ov.appendChild(el);
      requestAnimationFrame(()=>{
        el.style.top = (window.innerHeight + 40) + 'px';
        el.style.transform = `translate3d(${(Math.random()*100-50)}px,0,0) rotate(${360+Math.random()*360}deg)`;
      });
    }
    setTimeout(()=>{ if(ov){ while(ov.firstChild && ov.children.length>80){ ov.removeChild(ov.firstChild); } } }, duration);
  }

  function balloons(count=12, duration=3000){
    const ov = createOverlay();
    for(let i=0;i<count;i++){
      const el = document.createElement('div');
      const color = COLORS[i % COLORS.length];
      const size = 26 + Math.random()*26;
      el.style.position='absolute';
      el.style.left = Math.random()*100 + 'vw';
      el.style.top = (window.innerHeight + 20) + 'px';
      el.style.width=size+'px'; el.style.height=size*1.3+'px';
      el.style.background=color;
      el.style.borderRadius='999px';
      el.style.boxShadow='inset -6px -10px 0 rgba(255,255,255,.25)';
      el.style.transition = `transform ${duration/1000}s ease-out, top ${duration/1000}s ease-out`;
      ov.appendChild(el);
      requestAnimationFrame(()=>{
        el.style.top = (-60 - Math.random()*60) + 'px';
        el.style.transform = `translateX(${(Math.random()*80-40)}px)`;
      });
    }
    setTimeout(()=>{ if(ov){ while(ov.firstChild && ov.children.length>80){ ov.removeChild(ov.firstChild); } } }, duration+500);
  }

  function celebrate(){ confetti(80,2600); balloons(10,3000); }

  window.Celebration = { confetti, balloons, celebrate };
})();

