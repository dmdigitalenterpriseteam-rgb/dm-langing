/* error-guard.js — bezbednosna mreža da stranica ne “zamrzne” */
(function(){
  // 1) Globalni hvatač JS grešaka
  window.onerror = function(msg, src, line, col, err){
    try{
      console.warn('JS error:', msg, 'at', src, line+':'+col, err);
      safeFallback('JS error');
    }catch(e){}
  };

  // 2) Hvatač neobrađenih Promise odbijanja
  window.addEventListener('unhandledrejection', function(e){
    try{
      console.warn('Unhandled promise rejection:', e.reason);
      safeFallback('Promise rejection');
    }catch(_){}
  });

  // 3) “Asset guard” za video — ako se ne pokrene brzo, uklanjamo ga
  window.addEventListener('load', function(){
    document.querySelectorAll('video').forEach(function(v){
      v.setAttribute('preload','none');
      v.muted = true;
      var timeout = setTimeout(function(){
        try{
          v.pause();
          v.outerHTML = "";
          console.warn('Video removed by error-guard (timeout).');
        }catch(_){}
      }, 2000);
      var tryPlay = v.play();
      if (tryPlay && typeof tryPlay.catch === 'function'){
        tryPlay.catch(function(){ /* tišina */ }).finally(function(){ clearTimeout(timeout); });
      } else {
        clearTimeout(timeout);
      }
    });
  });

  // 4) Fallback — ukloni teške delove i obavesti korisnika
  function safeFallback(reason){
    try{
      document.querySelectorAll('.heavy,[data-heavy],video,[data-parallax],[data-3d]')
        .forEach(function(n){ n.remove(); });
      if(!document.getElementById('safeBanner')){
        var div = document.createElement('div');
        div.id = 'safeBanner';
        div.setAttribute('style',
          'position:fixed;bottom:12px;left:12px;background:#111;color:#fff;'+
          'padding:10px 14px;border-radius:10px;z-index:99999;font:600 14px/1.4 system-ui;'+
          'box-shadow:0 8px 24px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15)');
        div.innerHTML = 'Stranica je prebačena u “safe” prikaz zbog: <b>'+ (reason||'greške') +'</b>.';
        document.body.appendChild(div);
        setTimeout(function(){ try{ div.remove(); }catch(_){ } }, 6000);
      }
    }catch(_){}
  }
})();
