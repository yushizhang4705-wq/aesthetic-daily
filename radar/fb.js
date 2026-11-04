(function(){
  var C=window.XR_CONFIG||{};var q=new URLSearchParams(location.search);
  var NS=q.get('ns')||C.ns;var API=C.api||'https://abacus.jasoncameron.dev';
  var LK='xr-like:'+(q.get('ns')?NS+':':'');
  function hit(key){try{return fetch(API+'/hit/'+encodeURIComponent(NS)+'/'+encodeURIComponent(key),{mode:'cors',cache:'no-store'}).then(function(r){return r.json()}).then(function(j){window.__lastHit={key:key,res:j};return j}).catch(function(){})}catch(e){}}
  // like / dislike buttons: mutually exclusive per device (localStorage), Abacus keys <id>-like/-unlike and <id>-dislike/-undislike
  var DK='xr-dislike:'+(q.get('ns')?NS+':':'');
  document.querySelectorAll('.like').forEach(function(b){
    var id=b.getAttribute('data-id');var d=b.parentNode.querySelector('.dislike');
    function g(k){try{return localStorage.getItem(k+id)==='1'}catch(e){return false}}
    function st(k,v){try{v?localStorage.setItem(k+id,'1'):localStorage.removeItem(k+id)}catch(e){}}
    var on=g(LK),dn=g(DK);if(on&&dn){dn=false;st(DK,false)}
    function paint(){b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.querySelector('span').textContent=on?'已喜欢':'喜欢';
      if(d){d.classList.toggle('on',dn);d.setAttribute('aria-pressed',dn?'true':'false');d.querySelector('span').textContent=dn?'已踩':'踩'}}
    paint();
    b.addEventListener('click',function(){on=!on;st(LK,on);hit(id+(on?'-like':'-unlike'));if(on&&dn){dn=false;st(DK,false);hit(id+'-undislike')}paint()});
    if(d)d.addEventListener('click',function(){dn=!dn;st(DK,dn);hit(id+(dn?'-dislike':'-undislike'));if(dn&&on){on=false;st(LK,false);hit(id+'-unlike')}paint()});
  });
  // comments: one note per item, stored in TextDB (key <NS>-c-<id>), localStorage copy for instant display / offline retry
  var CAPI=C.capi||'https://api.textdb.online',CREAD=C.cread||'https://textdb.online';
  var CK='xr-cmt:'+(q.get('ns')?NS+':':'');
  function ckey(id){return NS+'-c-'+id}
  function lget(id){try{return JSON.parse(localStorage.getItem(CK+id)||'null')}catch(e){return null}}
  function lset(id,v){try{v?localStorage.setItem(CK+id,JSON.stringify(v)):localStorage.removeItem(CK+id)}catch(e){}}
  function fmt(ts){var d=new Date(ts);if(isNaN(d))return '';try{return d.toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).replace(/\//g,'-').replace(/\u65e5|\u6708/g,'')}catch(e){};var z=function(n){return(n<10?'0':'')+n};return (d.getMonth()+1)+'-'+z(d.getDate())+' '+z(d.getHours())+':'+z(d.getMinutes())}
  function push(id,v){var b='key='+encodeURIComponent(ckey(id))+'&value='+encodeURIComponent(v&&v.text?JSON.stringify({id:id,text:v.text,ts:v.ts}):'');
    return fetch(CAPI+'/update/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:b,cache:'no-store'}).then(function(r){return r.json()}).then(function(j){if(!j||j.status!==1)throw 0;return j})}
  document.querySelectorAll('.cmt[data-id]').forEach(function(box){
    var id=box.getAttribute('data-id');
    box.innerHTML='<div class="cview"><p class="ctext"></p><div class="cbar"><span class="cstat"></span><button type="button" class="cedit">修改</button></div></div>'+
      '<div class="cform"><textarea rows="2" maxlength="2000" placeholder="写点反馈：好或不好都行，原话记录"></textarea><div class="cbar"><span class="cstat"></span><button type="button" class="csave">保存</button></div></div>';
    var view=box.querySelector('.cview'),form=box.querySelector('.cform'),ta=form.querySelector('textarea'),
        vs=view.querySelector('.cstat'),fs=form.querySelector('.cstat'),save=form.querySelector('.csave');
    var cur=lget(id);
    function show(){if(cur&&cur.text){view.querySelector('.ctext').textContent=cur.text;vs.textContent=(cur.pending?'还没同步上，下次打开自动重试 · ':'我的想法 · ')+fmt(cur.ts);box.classList.add('has');view.hidden=false;form.hidden=true}
      else{box.classList.remove('has');view.hidden=true;form.hidden=false}}
    function send(v){fs.textContent='保存中…';save.disabled=true;
      return push(id,v).then(function(){if(v){v.pending=false;}cur=v;lset(id,v);fs.textContent='';save.disabled=false;show()})
        .catch(function(){if(v){v.pending=true;cur=v;lset(id,v);show()}else{fs.textContent='没删掉，网络不通，稍后再试'}save.disabled=false})}
    view.querySelector('.cedit').addEventListener('click',function(){ta.value=cur&&cur.text||'';view.hidden=true;form.hidden=false;fs.textContent='清空后保存就是删除';ta.focus()});
    save.addEventListener('click',function(){var t=ta.value.trim();if(!t&&!(cur&&cur.text)){fs.textContent='先写点什么';return}
      send(t?{text:t,ts:new Date().toISOString()}:null)});
    show();
    if(cur&&cur.pending)send(cur);
    else if(!cur)fetch(CREAD+'/'+encodeURIComponent(ckey(id)),{cache:'no-store'}).then(function(r){return r.text()}).then(function(s){
      if(!s||lget(id))return;try{var v=JSON.parse(s);if(v&&v.text){cur={text:v.text,ts:v.ts};lset(id,cur);show()}}catch(e){}}).catch(function(){});
  });
})();
