// Kaboomando — DOM screens: menu, stage map (endless), upgrades, settings, pause, results, game over.
'use strict';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.tm);toast.tm=setTimeout(()=>t.classList.remove('on'),1800);}
const THUMB={};function thumb(th){if(THUMB[th])return THUMB[th];const W=96,H=96,gy=70;const b=buildBG(th,0,W,H,gy,th*13+5);const [c,x]=mk(W,H);
 x.drawImage(b.sky,0,0,W,H);x.drawImage(b.deco,-300,0);x.drawImage(b.far,-60,0);x.drawImage(b.mid,-40,0);x.fillStyle=x.createPattern(b.pat,'repeat');x.fillRect(0,gy,W,H-gy);x.fillStyle=b.P.top;x.fillRect(0,gy,W,3);x.fillStyle=b.P.top2;x.fillRect(0,gy+3,W,2);
 return THUMB[th]=c.toDataURL();}
const UI={cur:'',mapPage:null,
 show(html,cls){const s=$('scr');s.className='scr on '+(cls||'');s.innerHTML=html;s.scrollTop=0;},
 hide(){$('scr').className='scr';$('scr').innerHTML='';},
 hud(on){$('hudb').style.display=on?'flex':'none';},
 menu(){this.cur='menu';G.mode='menu';G.boss=null;this.hud(false);$('pz').className='scr pz';AU.play(50);Ads.banner(true);
  const far=SAVE.far;
  this.show(`<div class="logo"><div class="l1">KABOOM</div><div class="l2">ANDO</div></div><div class="tag">${esc(T('tag'))}</div>
   <div class="heroes">${[0,1].map(h=>`<button class="hero ${SAVE.hero===h?'sel':''}" data-a="hero" data-i="${h}"><canvas width="28" height="28" data-h="${h}"></canvas><b>${h?'Mira':'Tiko'}</b></button>`).join('')}</div>
   <div class="sp"></div>
   <button class="b big" data-a="play">▶ ${esc(T('play'))} <span class="sn">${esc(T('stage'))} ${far}</span></button>
   <div class="row"><button class="b" data-a="map">${esc(T('stages'))}</button><button class="b" data-a="upg">${esc(T('upgrades'))}</button></div>
   <div class="row"><button class="b sm" data-a="set">⚙ ${esc(T('settings'))}</button><button class="b sm" data-a="how">? ${esc(T('howto'))}</button></div>
   <div class="stat">${esc(T('furthest'))}: <b>${far}</b> · <span class="coin">●</span> ${SAVE.coins}</div>
   <div class="credit"><img src="studio-logo.png" alt=""> P-Prece Studio</div>`,'menu');
  document.querySelectorAll('canvas[data-h]').forEach(c=>{const x=c.getContext('2d');x.imageSmoothingEnabled=false;const old=L;L=x;drawHero(14,26,+c.dataset.h,{face:1,aimX:1,aimY:0,t:0});L=old;});},
 map(){this.cur='map';Ads.banner(true);const per=10,far=SAVE.far;const maxPage=Math.floor((far-1)/per);if(this.mapPage===undefined||this.mapPage===null)this.mapPage=maxPage;this.mapPage=Math.max(0,Math.min(maxPage,this.mapPage));
  const p0=this.mapPage*per+1;let nodes='';for(let k=0;k<per;k++){const n=p0+k,th=(n-1)%8,lock=n>far,boss=BOSS[th];const best=SAVE.best[n];
   nodes+=`<button class="node ${lock?'lock':''} ${n===far?'cur':''} ${k%2?'r':'l'}" data-a="stage" data-i="${n}" ${lock?'disabled':''} style="background-image:url(${thumb(th)})"><span class="nn">${n}</span><span class="nt">${esc(T(TH[th].k))}</span>${best?`<span class="nb">★ ${best}</span>`:''}${lock?'<span class="lk">🔒</span>':''}</button>`;}
  this.show(`<h2>${esc(T('stages'))}</h2><div class="sub">${esc(T('endless'))}</div><div class="path">${nodes}</div>
   <div class="row"><button class="b sm" data-a="mpg" data-i="-1" ${this.mapPage<=0?'disabled':''}>${document.documentElement.dir==='rtl'?'▶':'◀'}</button><span class="pg" dir="ltr">${p0}–${p0+per-1}</span><button class="b sm" data-a="mpg" data-i="1" ${this.mapPage>=maxPage?'disabled':''}>${document.documentElement.dir==='rtl'?'◀':'▶'}</button></div>
   <button class="b" data-a="menu">${esc(T('back'))}</button>`,'map');},
 upg(){this.cur='upg';Ads.banner(true);const C={hp:[200,500,1000],pow:[150,400,900],mag:[100,300,700]};
  const row=k=>{const lv=SAVE.upg[k],mx=lv>=3,cost=mx?0:C[k][lv];return`<div class="up"><div class="ui ${k}"></div><div class="ut"><b>${esc(T('up_'+k))}</b><small>${esc(T('up_'+k+'D'))}</small><div class="pips">${[0,1,2].map(i=>`<i class="${i<lv?'on':''}"></i>`).join('')}</div></div>
   <button class="b sm" data-a="buy" data-k="${k}" ${mx||SAVE.coins<cost?'disabled':''}>${mx?esc(T('max')):`<span class="coin">●</span> ${cost}`}</button></div>`;};
  this.show(`<h2>${esc(T('upgrades'))}</h2><div class="stat"><span class="coin">●</span> ${SAVE.coins}</div>${row('hp')}${row('pow')}${row('mag')}<button class="b" data-a="menu">${esc(T('back'))}</button>`,'upg');this.costs=C;},
 settings(){this.cur='set';Ads.banner(true);const tg=(k,lab)=>`<button class="tg ${SAVE[k]?'on':''}" data-a="tog" data-k="${k}"><span>${esc(T(lab))}</span><i>${SAVE[k]?'ON':'OFF'}</i></button>`;
  let sel=`<select id="langSel"><option value="auto">${esc(T('auto'))}</option>${Object.keys(LANG_NAMES).map(l=>`<option value="${l}" ${localStorage.getItem('kbm_lang')===l?'selected':''}>${LANG_NAMES[l]}</option>`).join('')}</select>`;
  this.show(`<h2>${esc(T('settings'))}</h2>${tg('snd','sound')}${tg('mus','music')}${tg('vib','vibration')}${tg('shake','shake')}${tg('auto','autofire')}<label class="tg"><span>${esc(T('language'))}</span>${sel}</label>
   <a class="lnk" href="privacy.html" target="_blank" rel="noopener">${esc(T('privacy'))}</a><button class="b" data-a="menu">${esc(T('back'))}</button><div class="credit">${esc(T('madeBy'))} P-Prece Studio · v1</div>`,'settings');
  $('langSel').onchange=e=>{const v=e.target.value;try{if(v==='auto')localStorage.removeItem('kbm_lang');else localStorage.setItem('kbm_lang',v);}catch(_){}LANG=v==='auto'?(localStorage.removeItem('kbm_lang'),detectLang()):v;applyLang();this.settings();};},
 how(after){this.cur='how';this.show(`<h2>${esc(T('howto'))}</h2><div class="how"><p>🕹 ${esc(T('how1'))}</p><p>▲ ${esc(T('how2'))}</p><p>✹ ${esc(T('how3'))}</p><p>📦 ${esc(T('how4'))}</p></div><button class="b big" data-a="${after?'howgo':'menu'}">${esc(T('ok'))}</button>`,'how');},
 start(n,opt){SAVE.howto?this._go(n,opt):(this.after=()=>this._go(n,opt),this.how(true));},
 _go(n,opt){SAVE.howto=1;persist();this.hide();this.cur='play';begin(n,opt);},
 pause(){if(G.mode!=='play')return;G.mode='pause';this.cur='pause';for(const k in IN)IN[k]=0;CTRL.ptr={};CTRL.stick=null;const z=$('pz');z.className='scr pz on';
  z.innerHTML=`<h2>${esc(T('paused'))}</h2><div class="stat">${esc(T('stage'))} ${G.stage}</div><button class="b big" data-a="resume">${esc(T('resume'))}</button><button class="b" data-a="restart">${esc(T('restart'))}</button>
   <div class="row">${['snd','mus'].map(k=>`<button class="tg sm ${SAVE[k]?'on':''}" data-a="ptog" data-k="${k}"><span>${esc(T(k==='snd'?'sound':'music'))}</span><i>${SAVE[k]?'ON':'OFF'}</i></button>`).join('')}</div><button class="b" data-a="quit">${esc(T('quit'))}</button>`;},
 resume(){$('pz').className='scr pz';$('pz').innerHTML='';G.mode='play';this.cur='play';lastT=performance.now();},
 result(res){this.cur='result';Ads.banner(true);this.res=res;const lines=[['enemies',res.kills,''],['coins',res.coins,'coin'],['timebonus',res.tb,''],['nohit',res.nohit?2000:0,'']];
  this.show(`<div class="clear">${esc(T('clear'))}</div><div class="stat">${esc(T('stage'))} ${res.n}</div><div class="tally">${lines.map((l,i)=>`<div class="tl" data-i="${i}"><span>${esc(T(l[0]))}</span><b data-v="${l[1]}">0</b></div>`).join('')}
   <div class="tl tot"><span>${esc(T('total'))}</span><b id="totV" data-v="${res.total}">0</b></div></div><div id="nbest" class="nbest hid">${esc(T('newBest'))}</div>
   <div class="earn"><span class="coin">●</span> +<b id="earnV">${res.earn}</b></div><div class="tapskip">${esc(T('tapSkip'))}</div>
   <div class="after hid"><button class="b big" data-a="next">${esc(T('next'))} ▶ ${esc(T('stage'))} ${res.n+1}</button>
   ${Ads.canReward()?`<button class="b ad" data-a="dbl">▶ ${esc(T('double'))}</button>`:''}<button class="b sm" data-a="map">${esc(T('map'))}</button></div>`,'result');
  const els=[...document.querySelectorAll('.tally b')];let i=0,t0=performance.now();const step=()=>{if(this.cur!=='result'||this.skip)return;const el=els[i];if(!el){this.finishTally();return;}const v=+el.dataset.v,p=Math.min(1,(performance.now()-t0)/(v?550:150));el.textContent=Math.round(v*p);if(Math.random()<.5)AU.sfx('tick');if(p>=1){i++;t0=performance.now();}requestAnimationFrame(step);};
  this.skip=false;requestAnimationFrame(step);$('scr').onclick=e=>{if(!e.target.closest('button'))this.finishTally();};},
 finishTally(){if(this.skip)return;this.skip=true;document.querySelectorAll('.tally b').forEach(b=>b.textContent=b.dataset.v);document.querySelector('.after').classList.remove('hid');const ts=document.querySelector('.tapskip');if(ts)ts.remove();if(this.res.newBest){$('nbest').classList.remove('hid');AU.sfx('power');}},
 over(){this.cur='over';this.hud(false);Ads.banner(true);
  this.show(`<div class="over">${esc(T('gameover'))}</div><div class="stat">${esc(T('stage'))} ${G.stage} · ${esc(T('score'))} ${G.score}</div>
   ${Ads.canReward()?`<button class="b big ad" data-a="cont">▶ ${esc(T('cont'))}</button>`:''}<button class="b" data-a="retry">${esc(T('retry'))}${G.cpOn?' ⚑':''}</button><button class="b sm" data-a="map">${esc(T('map'))}</button>`,'result');},
 act(a,el){AU.init();AU.sfx('ui');switch(a){
  case'play':this.start(SAVE.far);break;case'map':this.mapPage=null;G.mode='menu';this.map();break;case'menu':this.menu();break;case'upg':this.upg();break;case'set':this.settings();break;case'how':this.how(false);break;
  case'howgo':{const f=this.after;this.after=null;f&&f();break;}
  case'hero':SAVE.hero=+el.dataset.i;persist();this.menu();break;
  case'stage':this.start(+el.dataset.i);break;case'mpg':this.mapPage+=+el.dataset.i;this.map();break;
  case'buy':{const k=el.dataset.k,lv=SAVE.upg[k],c=this.costs[k][lv];if(lv<3&&SAVE.coins>=c){SAVE.coins-=c;SAVE.upg[k]++;persist();AU.sfx('power');}this.upg();break;}
  case'tog':{const k=el.dataset.k;SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();if(k==='mus'&&SAVE.mus){AU.songId=-2;AU.play(50);}this.settings();break;}
  case'ptog':{const k=el.dataset.k;SAVE[k]=SAVE[k]?0:1;persist();AU.setVol();G.mode='play';this.pause();break;}
  case'resume':this.resume();break;case'restart':$('pz').className='scr pz';this.start(G.stage);break;case'quit':$('pz').className='scr pz';this.mapPage=null;G.mode='menu';this.map();break;
  case'next':{const n=this.res.n+1;el.disabled=true;Ads.interThen(this.res.n,()=>this.start(n));break;}
  case'dbl':{el.disabled=true;Ads.rewarded().then(ok=>{if(ok){SAVE.coins+=this.res.earn;persist();this.res.earn*=2;const e=$('earnV');if(e)e.textContent=this.res.earn;AU.sfx('power');el.remove();}else{toast(T('noVideo'));el.disabled=false;}});break;}
  case'cont':{el.disabled=true;Ads.rewarded().then(ok=>{if(!ok){toast(T('noVideo'));el.disabled=false;return;}this.hide();this.cur='play';Object.assign(P,{alive:true,hearts:P.maxH,inv:3,lives:0,x:P.safeX,y:(colTop(P.safeX)??GY)-80,vy:0,respawn:.6});EB=[];G.mode='play';this.hud(true);AU.play(G.boss?100+G.th:G.stage);});break;}
  case'retry':this.start(G.stage,{cp:G.cpOn});break;}}};
document.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b||b.disabled)return;e.stopPropagation();UI.act(b.dataset.a,b);});
$('pauseB').onclick=e=>{e.stopPropagation();UI.pause();};
function applyLang(){document.documentElement.lang=LANG;document.documentElement.dir=LANG==='ar'?'rtl':'ltr';}
applyLang();resize();UI.menu();requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
addEventListener('pointerdown',()=>AU.init(),{once:true});
