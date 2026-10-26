(function(){
  var C=window.AD_CONFIG||{};var q=new URLSearchParams(location.search);
  var NS=q.get('ns')||C.ns;var API=C.api||'https://abacus.jasoncameron.dev';
  var LK='ad-like:'+(q.get('ns')?NS+':':'');
  function hit(key){try{return fetch(API+'/hit/'+encodeURIComponent(NS)+'/'+encodeURIComponent(key),{mode:'cors',cache:'no-store'}).then(function(r){return r.json()}).then(function(j){window.__lastHit={key:key,res:j};return j}).catch(function(){})}catch(e){}}
  // like buttons
  document.querySelectorAll('.like').forEach(function(b){
    var id=b.getAttribute('data-id');var on=false;
    try{on=localStorage.getItem(LK+id)==='1'}catch(e){}
    function paint(){b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.querySelector('span').textContent=on?'已喜欢':'喜欢'}
    paint();
    b.addEventListener('click',function(){on=!on;try{on?localStorage.setItem(LK+id,'1'):localStorage.removeItem(LK+id)}catch(e){}paint();hit(id+(on?'-like':'-unlike'))});
  });
  // expandable text
  document.querySelectorAll('.txt').forEach(function(t){
    var m=t.nextElementSibling;if(!m||!m.classList.contains('more'))return;
    if(t.scrollHeight>t.clientHeight+2)m.classList.add('show');
    m.addEventListener('click',function(){var o=t.classList.toggle('open');m.textContent=o?'收起':'展开全文'});
  });
  // players
  var twLoading=null;
  function loadTw(){if(twLoading)return twLoading;twLoading=new Promise(function(res,rej){if(window.twttr&&twttr.widgets)return res();var s=document.createElement('script');s.src='https://platform.twitter.com/widgets.js';s.async=true;s.onload=function(){(window.twttr&&twttr.ready)?twttr.ready(function(){res()}):res()};s.onerror=rej;document.head.appendChild(s)});return twLoading}
  function dark(){return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches}
  document.querySelectorAll('.player[data-embed]').forEach(function(p){
    p.addEventListener('click',function(ev){
      if(p.classList.contains('playing'))return;ev.preventDefault();
      var type=p.getAttribute('data-type'),u=p.getAttribute('data-embed');
      if(type==='x'){
        var cover=p.innerHTML;p.classList.add('playing','tweet','loading');p.innerHTML='';
        var box=document.createElement('div');p.appendChild(box);
        var fail=function(){p.classList.remove('tweet','loading');p.innerHTML=cover+'<div class="fail">X 帖子加载失败（可能需要代理），点下方链接看原帖</div>'};
        var t=setTimeout(fail,12000);
        loadTw().then(function(){return twttr.widgets.createTweet(u,box,{theme:dark()?'dark':'light',dnt:true,conversation:'none',align:'center'})}).then(function(el){clearTimeout(t);p.classList.remove('loading');if(!el)fail()}).catch(function(){clearTimeout(t);fail()});
        return;
      }
      var f=document.createElement('iframe');
      f.src=u+(u.indexOf('?')<0?'?':'&')+'autoplay=1';
      f.setAttribute('allow','autoplay; fullscreen; picture-in-picture; encrypted-media');
      f.setAttribute('allowfullscreen','');f.setAttribute('playsinline','');
      f.title=p.getAttribute('aria-label')||'video';
      p.classList.add('playing');p.innerHTML='';p.appendChild(f);
    });
  });
})();
