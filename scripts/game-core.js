// minimal game core helpers: audio, celebration, and ad placeholders
window.gameCore = (function(){
  function playTone(freq,duration=0.08){ const ctx = window.__gc_audio_ctx = window.__gc_audio_ctx || ((window.AudioContext||window.webkitAudioContext)?new (window.AudioContext||window.webkitAudioContext)():null); if(!ctx) return; const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.value=freq; g.gain.value=0.06; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+duration); }
  function celebrate(type){ // simple confetti placeholder
    if (type==='confetti' || type==='balloons' || true){
      // small DOM confetti using emojis for portability
      const root = document.createElement('div'); root.style.position='fixed'; root.style.inset='0'; root.style.pointerEvents='none'; root.style.zIndex='1200'; document.body.appendChild(root);
      for(let i=0;i<18;i++){ const s=document.createElement('div'); s.textContent = ['🎉','🎈','✨','🌟'][i%4]; s.style.position='absolute'; s.style.left=(10+Math.random()*80)+'%'; s.style.top='-10%'; s.style.fontSize=(18+Math.random()*36)+'px'; s.style.transform='translateY(0)'; s.style.transition='transform 3s linear, top 3s linear, opacity 3s'; root.appendChild(s); setTimeout(()=>{ s.style.top=(20+Math.random()*100)+'%'; s.style.transform='translateY(200px)'; s.style.opacity='0'; },50); }
      setTimeout(()=>root.remove(),3500);
    }
  }
  return { playTone, celebrate };
})();

