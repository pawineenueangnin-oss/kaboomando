// Kaboomando — game logic: endless procedural stages, physics, enemies, bosses, rendering, touch controls.
'use strict';
const cv=$('c'),X=cv.getContext('2d');let LB,L,S=3,VW=256,VH=500,GY=320,DPR=1,CW=0,CH=0,SAT=0,SAB=0;
function resize(){CW=innerWidth;CH=innerHeight;DPR=Math.min(window.devicePixelRatio||1,3);const dw=Math.round(CW*DPR),dh=Math.round(CH*DPR);cv.width=dw;cv.height=dh;cv.style.width=CW+'px';cv.style.height=CH+'px';
 let s=dw/216;s=Math.min(s,dh/300);if(s>=2.6)s=Math.round(s);S=Math.max(1,s);VW=Math.ceil(dw/S);VH=Math.ceil(dh/S);
 const ctrl=Math.max(120,Math.min(VH*.36,(CH*.36)*DPR/S));GY=Math.floor(VH-ctrl);if(G.lvl&&G.mode!=='menu'&&G.lvl.gy<VH-100)GY=G.lvl.gy;
 [LB,L]=mk(VW,VH);const pr=getComputedStyle($('probe'));SAT=parseFloat(pr.paddingTop)||0;SAB=parseFloat(pr.paddingBottom)||0;
 const ui=$('ui');ui.style.left='0';ui.style.top='0';ui.style.width=CW+'px';ui.style.height=CH+'px';ui.style.setProperty('--s',Math.min(1.25,Math.max(.8,Math.min(CW/380,CH/700))));ui.style.setProperty('--st',SAT+'px');ui.style.setProperty('--sb',SAB+'px');
 if(G.lvl&&G.mode!=='menu')G.bg=buildBG(G.th,G.variant,VW,VH,GY,G.stage*13+5);else G.bg=null;}
const TILE=16;
const G={mode:'menu',stage:1,t:0,camX:0,lvl:null,score:0,coinsRun:0,kills:0,hurtCount:0,boss:null,lock:false,shake:0,flash:0,slow:1,slowT:0,intro:0,warn:0,th:0,variant:0,cyc:0,cpX:0,cpOn:false,stT:0,clearT:-1,menuX:0,bg:null};
const P={x:40,y:0,vx:0,vy:0,onG:false,face:1,crouch:false,hearts:3,maxH:3,lives:2,inv:0,wep:'b',wl:1,fireT:0,alive:true,shield:0,shieldHP:0,drop:0,coy:0,jbuf:0,safeX:40,ax:1,ay:0,run:false,anim:0,respawn:0};
let EN=[],PB=[],EB=[],PU=[],CO=[],FX=[],GL=[],POP=[],nid=1;
const IN={l:0,r:0,u:0,d:0,jump:0,fire:0,jp:0};
const diffOf=n=>Math.min(1,(n-1)/16);
// ---------- level generation (endless; seeded per stage) ----------
function genLevel(n){const R=rngF(n*7919+17),D=diffOf(n),th=(n-1)%8;const len=130+Math.min(n,24)*4;
 const cols=new Array(len).fill(GY),plats=[],sp=[],coins=[];let i=14,h=0;const top=k=>cols[k];
 const pool=[['runner',3],['gunner',n>=1?3:0],['turret',n>=2?2:0],['drone',n>=2?2:0],['hopper',n>=3?2:0],['brute',n>=5?1:0]];const tw=pool.reduce((a,p)=>a+p[1],0);
 const pick=()=>{let r=R()*tw;for(const p of pool){r-=p[1];if(r<=0)return p[0];}return'runner';};
 const enemy=(x,y)=>{const t=pick();if(t==='drone')sp.push({x,t,y:GY-120-R()*60});else sp.push({x,t,y});};
 const arc=(x0,x1,y0,hh)=>{const m=Math.max(2,Math.round((x1-x0)/14));for(let k=0;k<=m;k++){const f=k/m;coins.push({x:x0+(x1-x0)*f,y:y0-Math.sin(f*Math.PI)*hh});}};
 let lastPod=0;
 while(i<len-28){const r=R();const y=GY-h*24;
  if(r<.2&&i>18){const w=2+(R()<.25+D*.35?1:0);for(let k=0;k<w;k++)cols[i+k]=null;if(w>=3&&R()<.5)plats.push({x:i*TILE+8,w:(w-1)*TILE,y:y-26});arc(i*TILE-8,(i+w)*TILE+8,y-14,36);
   i+=w;const seg=3+(R()*4|0);for(let k=0;k<seg;k++)cols[i+k]=y;if(R()<.6)enemy((i+seg-1)*TILE,y);i+=seg;}
  else if(r<.4){const nh=Math.max(0,Math.min(2,h+(R()<.5||h===2?(h===0?1:-1):1)));h=nh;const yy=GY-h*24,seg=4+(R()*5|0);for(let k=0;k<seg;k++)cols[i+k]=yy;
   if(R()<.55+D*.3)enemy((i+2+(R()*(seg-2)|0))*TILE+8,yy);if(R()<.3)coins.push({x:(i+1)*TILE,y:yy-10},{x:(i+2)*TILE,y:yy-10},{x:(i+3)*TILE,y:yy-10});i+=seg;}
  else if(r<.62){const seg=6+(R()*4|0);for(let k=0;k<seg;k++)cols[i+k]=y;const pw=3+(R()*3|0),px=(i+1)*TILE,py=y-42;plats.push({x:px,w:pw*TILE,y:py});
   for(let k=0;k<pw;k++)coins.push({x:px+k*TILE+8,y:py-10});if(R()<.5+D*.3)sp.push({x:px+pw*TILE-12,t:R()<.5?'gunner':'turret',y:py});
   if(R()<.35&&h<2){const p2=px+pw*TILE*.5;plats.push({x:p2,w:3*TILE,y:py-40});coins.push({x:p2+24,y:py-52});}
   if(R()<.4+D*.3)enemy((i+seg-1)*TILE,y);i+=seg;}
  else{const seg=4+(R()*6|0);for(let k=0;k<seg;k++)cols[i+k]=y;const ex=(i+2+(R()*(seg-2)|0))*TILE+8;
   if(R()<.22)sp.push({x:ex,t:'crate',y});else if(R()<.5+D*.35)enemy(ex,y);i+=seg;}
  if(i*TILE-lastPod>560+R()*300){lastPod=i*TILE;const d=['s','l','r','f','h','s','l','f'][(R()*8)|0];sp.push({x:i*TILE,t:'pod',y:GY-150-R()*40,drop:R()<.18?'heart':R()<.08?'shield':d});}
  if(R()<.35+D*.25)sp.push({x:i*TILE+40,t:'wave',y:0});}
 // flatten ramp to boss arena
 for(let k=Math.max(0,i);k<len;k++)cols[k]=GY;
 if(cols[i-1]!==GY&&cols[i-1]!==null&&GY-cols[i-1]>24)cols[i-1]=GY-24;
 // never allow consecutive step > 24
 for(let k=1;k<len;k++){if(cols[k]!==null&&cols[k-1]!==null&&cols[k-1]-cols[k]>24)cols[k]=cols[k-1]-24;}
 const cpT=Math.floor(len*.5);let cx=cpT;while(cols[cx]===null||cols[cx+1]===null)cx++;
 sp.sort((a,b)=>a.x-b.x);
 return{cols,plats,sp,spI:0,coins,len,endX:len*TILE,get arenaX(){return this.endX-VW;},cpX:cx*TILE+8,th,gy:GY};}
function colTop(x){const L_=G.lvl;const i=Math.floor(x/TILE);if(i<0)return GY;if(i>=L_.len)return GY;return L_.cols[i];}
function groundAt(x0,x1){let best=null;for(let x=x0;x<=x1;x+=Math.min(TILE,x1-x0||1)){const t=colTop(x);if(t!==null&&(best===null||t<best))best=t;if(x1===x0)break;}const t=colTop(x1);if(t!==null&&(best===null||t<best))best=t;return best;}
// generic physics for player & walkers: o.x center, o.y feet
function phys(o,dt,hw,dropOk){const prevB=o.y;o.vy=Math.min(o.vy+(o.g||640)*dt,420);
 let nx=o.x+o.vx*dt;const g2=groundAt(nx-hw,nx+hw);if(g2!==null&&g2<o.y-6){nx=o.x;o.hitWall=1;}else o.hitWall=0;o.x=nx;
 o.y+=o.vy*dt;o.onG=false;if(o.vy>=0){const g=groundAt(o.x-hw,o.x+hw);if(g!==null&&o.y>=g&&prevB<=g+6){o.y=g;o.vy=0;o.onG=true;o.onPlat=null;}
  if(!o.onG&&!(dropOk&&o.drop>0))for(const p of G.lvl.plats){if(o.x+hw>p.x&&o.x-hw<p.x+p.w&&prevB<=p.y+1&&o.y>=p.y){o.y=p.y;o.vy=0;o.onG=true;o.onPlat=p;break;}}}}
// ---------- start a stage ----------
function begin(n,opt){opt=opt||{};G.lvl=null;resize();G.stage=n;G.th=(n-1)%8;G.cyc=Math.floor((n-1)/8);G.variant=G.cyc%3;G.lvl=genLevel(n);G.bg=buildBG(G.th,G.variant,VW,VH,GY,n*13+5);
 Object.assign(G,{mode:'play',t:0,camX:0,score:0,coinsRun:0,kills:0,hurtCount:0,boss:null,lock:false,shake:0,flash:0,slow:1,slowT:0,intro:2.6,warn:0,cpOn:false,stT:0,clearT:-1,waveT:3});
 EN=[];PB=[];EB=[];PU=[];FX=[];GL=[];POP=[];CO=G.lvl.coins.map(c=>({x:c.x,y:c.y,t:Math.random()*6}));
 const sx=opt.cp?G.lvl.cpX:40;if(opt.cp){G.cpOn=true;G.camX=Math.max(0,sx-VW*.4);G.lvl.spI=G.lvl.sp.findIndex(s=>s.x>G.camX+VW+8);if(G.lvl.spI<0)G.lvl.spI=G.lvl.sp.length;CO=CO.filter(c=>c.x>sx);}
 G.maxH=3+SAVE.upg.hp;Object.assign(P,{x:sx,y:colTop(sx)||GY,vx:0,vy:0,onG:true,face:1,crouch:false,maxH:G.maxH,hearts:G.maxH,lives:2,inv:1.5,wep:'b',wl:1+Math.min(2,SAVE.upg.pow),fireT:0,alive:true,shield:0,shieldHP:0,drop:0,safeX:sx,respawn:0});
 Ads.stageRewards=0;Ads.banner(false);AU.init();AU.play(n%8===0?8:n);UI.hud(true);LOG('begin stage',n,'theme',G.th,'len',G.lvl.len);}
// ---------- spawning ----------
function spawn(s){const D=diffOf(G.stage),T=TH[G.th],cyc=G.cyc;const base={id:nid++,x:s.x,y:s.y,vx:0,vy:0,flash:0,t:0,face:-1,cd:1+Math.random()*1.5,col:T.ac==='#ffe14a'?'#e84a4a':shade(['#e84a4a','#3a8aff','#ff7a2a','#7a4aff','#ff4ad8','#e8a020','#4ac08a','#ff5a5a'][G.th],0),eye:'#ffe84a',onG:false};
 const bs=72+48*D;let e;
 switch(s.t){
  case'runner':e={...base,type:'runner',hp:1,w:6,h:14,spd:34+18*D,shoots:G.stage>=3&&Math.random()<.35+D*.3,pts:100};break;
  case'gunner':e={...base,type:'gunner',hp:2+(D>.5?1:0),w:7,h:17,cd:1.2+Math.random(),rate:2.6-1.1*D,pts:150,bs};break;
  case'turret':e={...base,type:'turret',hp:4+Math.round(2*D),w:9,h:14,cd:1.5,rate:2.8-1*D,pts:200,bs,col:'#7a8aa0'};break;
  case'drone':e={...base,type:'drone',hp:2,w:8,h:10,y0:s.y,spd:30+14*D,cd:2,pts:150,bs,fly:1};break;
  case'hopper':e={...base,type:'hopper',hp:2,w:7,h:14,cd:1,pts:150,col:'#4ad86a'};break;
  case'brute':e={...base,type:'brute',hp:9+Math.round(4*D),w:12,h:28,spd:14,cd:2,rate:3-.8*D,pts:500,bs};break;
  case'crate':e={...base,type:'crate',hp:3,w:8,h:16,pts:50,still:1};break;
  case'pod':e={...base,type:'pod',hp:2,w:11,h:12,y0:s.y,drop:s.drop,fly:1,pts:300,x:G.camX+VW+20};break;
  case'wave':{if(G.lock||EN.length>7)return;const fromL=G.stage>=4&&Math.random()<.25;const k=1+(Math.random()<.3+D*.4?1:0)+(D>.6&&Math.random()<.4?1:0);
   for(let j=0;j<k;j++){const x=fromL?G.camX-10-j*18:G.camX+VW+10+j*18;const y=colTop(x);if(y===null)continue;spawn({x,t:'runner',y});if(fromL)EN[EN.length-1].face=1;}return;}
 }
 if(!e)return;if(e.type!=='pod'&&e.type!=='drone'){const g=s.y;e.y=g;}EN.push(e);}
// ---------- weapons ----------
const WEP={b:{rate:.19},s:{rate:.3},l:{rate:.34},r:{rate:.085},f:{rate:.24},h:{rate:.26}};
function aimVec(){if(P.assist&&!IN.u&&!IN.d)return P.assist;let ax=0,ay=0;const f=P.face;if(IN.u)ay=-1;if(IN.d&&!P.onG)ay=1;if(IN.l||IN.r)ax=f;if(IN.d&&P.onG&&(IN.l||IN.r))ay=0;if(!ax&&!ay)ax=f;const m=Math.hypot(ax,ay);return{x:ax/m,y:ay/m};}
function shoot(){const a=aimVec(),lv=P.wl;P.ax=a.x;P.ay=a.y;const ox=P.x+a.x*10,oy=P.y-(P.crouch?8:13)+a.y*8;const B=(vx,vy,d,k,o)=>PB.push(Object.assign({x:ox,y:oy,vx,vy,dmg:d,k,life:1.4},o||{}));
 switch(P.wep){
  case'b':B(a.x*280,a.y*280,1+(lv-1)*.35,'b');if(lv>=3)B(a.x*280,a.y*280,.6,'b',{x:ox-a.y*3,y:oy+a.x*3});AU.sfx('shot');break;
  case's':{const n=[3,5,5][lv-1],sp=[.2,.17,.22][lv-1],A=Math.atan2(a.y,a.x);for(let k=0;k<n;k++){const an=A+(k-(n-1)/2)*sp;B(Math.cos(an)*250,Math.sin(an)*250,.8+lv*.15,'s',{life:.9});}AU.sfx('spread');break;}
  case'l':B(a.x*380,a.y*380,2.2+lv*.8,'l',{pierce:1,hits:{},ang:Math.atan2(a.y,a.x)});AU.sfx('laser');break;
  case'r':{const j=(Math.random()-.5)*.08,A=Math.atan2(a.y,a.x)+j;B(Math.cos(A)*330,Math.sin(A)*330,.55+lv*.15,'r');AU.sfx('rapid');break;}
  case'f':B(a.x*200,a.y*200,1.5+lv*.45,'f',{ph:0,ox:ox,oy:oy,dx:a.x,dy:a.y,big:lv>=3});AU.sfx('flame');break;
  case'h':{B(a.x*190,a.y*190,1+lv*.25,'h',{life:2});if(lv>=2)B(a.x*190-a.y*40,a.y*190+a.x*40,1+lv*.2,'h',{life:2});AU.sfx('homing');break;}}
 P.fireT=WEP[P.wep].rate*(P.wep==='b'?1-(lv-1)*.1:1);G.muzzle=.05;}
// ---------- effects ----------
function burst(x,y,n,cols,sp,sz){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(.3+Math.random())*(sp||80);FX.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:.4+Math.random()*.5,max:.9,c:cols[(Math.random()*cols.length)|0],s:sz||(1+(Math.random()*2|0)),g:180});}}
function boom(x,y,size){const z=size||1;burst(x,y,8+z*8,['#ffffff','#ffe84a','#ff9a2a','#ff5a2a'],60+z*50,z>1?2:1);burst(x,y,4+z*3,['#9aa8b8','#5a6a7a','#ffd84a'],50+z*30,2);
 GL.push({x,y,r:10+z*10,c:'255,180,60',life:.3+z*.1,max:.3+z*.1});FX.push({x,y,ring:1,r:2,vr:60+z*60,life:.3,max:.3,c:'#fff3b0'});G.shake=Math.max(G.shake,z*2.5);}
function pop(x,y,txt,c){POP.push({x,y,txt,c:c||'#fff',life:.9});}
// ---------- player ----------
function hurt(){if(P.inv>0||!P.alive||G.mode!=='play'||(window.DBG&&DBG.god))return;
 if(P.shield>0){P.shieldHP--;AU.sfx('shieldhit');P.inv=.8;if(P.shieldHP<=0)P.shield=0;return;}
 P.hearts--;G.hurtCount++;P.inv=1.6;AU.sfx('hurt');vib(60);G.shake=5;G.flash=.15;P.vy=-150;burst(P.x,P.y-10,10,['#ffffff','#ffe84a','#ff8aa8'],70);
 if(P.hearts<=0)loseLife();}
function loseLife(){boom(P.x,P.y-10,2);if(P.lives>0){P.lives--;P.hearts=P.maxH;P.wl=Math.max(1,P.wl-1);P.inv=2.4;P.y=Math.min(P.y,GY-140);P.vy=0;P.respawn=.6;pop(P.x,P.y-30,'1UP-','#ffd84a');}
 else{P.alive=false;P.hearts=0;G.mode='dead';G.deadT=1.2;AU.sfx('over');AU.play(-1);}}
function fallHurt(){if(window.DBG&&DBG.god){P.y=GY-120;P.vy=0;P.x=P.safeX;return;}P.hearts--;G.hurtCount++;AU.sfx('hurt');vib(60);G.shake=4;
 if(P.hearts<=0){P.x=P.safeX;P.y=(colTop(P.safeX)||GY)-60;loseLife();return;}P.x=Math.max(G.camX+12,P.safeX);P.y=(colTop(P.x)??GY)-90;P.vy=0;P.inv=1.8;}
function updatePlayer(dt){if(!P.alive)return;if(P.respawn>0)P.respawn-=dt;
 P.crouch=IN.d&&P.onG&&!IN.l&&!IN.r;const sp=78;let mv=0;if(!P.crouch){if(IN.l)mv-=1;if(IN.r)mv+=1;}if(mv)P.face=mv;P.vx=mv*sp;P.run=!!mv&&P.onG;
 if(IN.jp){P.jbuf=.12;IN.jp=0;}P.jbuf-=dt;P.coy=P.onG?.09:P.coy-dt;
 if(P.jbuf>0&&P.coy>0){if(IN.d&&P.onPlat){P.drop=.25;P.onG=false;P.y+=2;}else{P.vy=-262;AU.sfx('jump');burst(P.x,P.y,4,['#ffffff','#dddddd'],30,1);}P.jbuf=0;P.coy=0;}
 if(!IN.jump&&P.vy<-110)P.vy=-110;P.drop-=dt;
 const wasG=P.onG;phys(P,dt,4,true);if(P.onG&&!wasG&&P.vy===0)AU.sfx('land');
 const minX=G.camX+6,maxX=G.lock?G.camX+VW-6:G.lvl.endX-6;if(P.x<minX)P.x=minX;if(P.x>maxX)P.x=maxX;
 if(P.onG&&colTop(P.x-4)!==null&&colTop(P.x+4)!==null&&!P.onPlat)P.safeX=P.x;
 if(P.y>GY+70)fallHurt();
 P.inv-=dt;if(P.shield>0)P.shield-=dt;P.fireT-=dt;
 // aim assist (kid-friendly): with no up/down input, the gun snaps to forward / diagonal-up / up toward the nearest target
 P.assist=null;if(!IN.u&&!IN.d){let tg=null,bd=1e9;const gy=P.y-13;const B=G.boss;
  if(B&&!B.dead&&!B.hidden){const bx=bossBox(B);tg={x:B.x,y:(bx.y0+bx.y1)/2};}
  else for(const e of EN){if(e.x<G.camX-4||e.x>G.camX+VW+4)continue;const d=Math.abs(e.x-P.x)+Math.abs(e.y-P.y)*.5+((e.x-P.x)*P.face<0?60:0);if(d<bd){bd=d;tg={x:e.x,y:e.y-e.h/2};}}
  if(tg){let f=P.face;if(!IN.l&&!IN.r&&Math.abs(tg.x-P.x)>6)f=P.face=tg.x<P.x?-1:1;const dx=tg.x-P.x,dy=tg.y-gy,m=Math.hypot(dx,dy)||1;const C=[[f,0],[f*.7071,-.7071],[0,-1]];if(!P.onG)C.push([f*.7071,.7071]);let best=C[0],bv=-2;for(const c of C){const v=(c[0]*dx+c[1]*dy)/m;if(v>bv){bv=v;best=c;}}if(P.crouch)best=[f,0];P.assist={x:best[0],y:best[1]};}}
 const auto=SAVE.auto&&(EN.some(e=>e.type!=='crate'&&e.x>G.camX-4&&e.x<G.camX+VW+4)||(G.boss&&!G.boss.dead&&!G.boss.hidden));
 if((IN.fire||auto)&&P.fireT<=0)shoot();else{const a=aimVec();P.ax=a.x;P.ay=a.y;}
 if(!G.cpOn&&P.x>=G.lvl.cpX){G.cpOn=true;AU.sfx('check');pop(P.x,P.y-30,T('checkpoint'),'#5affb0');burst(G.lvl.cpX,colTop(G.lvl.cpX)-30,14,['#5affb0','#ffffff','#ffe84a'],70);}}
// ---------- enemies ----------
function eShot(x,y,tx,ty,spd,o){const a=Math.atan2(ty-y,tx-x);EB.push(Object.assign({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,k:'o',r:3,life:5},o||{}));}
function killEnemy(e){e.dead=1;G.kills++;G.score+=e.pts;pop(e.x,e.y-e.h-4,'+'+e.pts,'#ffe84a');boom(e.x,e.y-e.h/2,e.type==='brute'?2:1);AU.sfx(e.type==='brute'?'boom':'pop');
 burst(e.x,e.y-e.h/2,6,['#ffd84a','#9aa8b8','#ffffff'],70,2);
 const r=Math.random();if(e.type==='crate'){if(r<.22)PU.push({k:'heart',x:e.x,y:e.y-8,vy:-120,vx:0});else for(let i=0;i<4;i++)CO.push({x:e.x,y:e.y-10,vx:(i-1.5)*30,vy:-140-i*15,t:0,phys:1});}
 else if(e.type==='pod'){PU.push({k:e.drop,x:e.x,y:e.y,vy:-80,vx:-10});}
 else if(r<.35)CO.push({x:e.x,y:e.y-8,vx:(Math.random()-.5)*40,vy:-130,t:0,phys:1});}
function updateEnemies(dt){const D=diffOf(G.stage);
 for(const e of EN){e.t+=dt;e.flash-=dt;const dx=P.x-e.x,dy=(P.y-10)-(e.y-e.h/2);
  switch(e.type){
   case'runner':e.vx=e.face*e.spd;phys(e,dt,3);if(e.hitWall&&e.onG){e.vy=-200;}if(e.onG&&colTop(e.x+e.face*6)===null&&!e.onPlat&&Math.random()<.5)e.vy=-210;
    if(e.shoots){e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<VW*.7){e.cd=2.6+Math.random()*1.5;eShot(e.x,e.y-9,P.x,P.y-10,65+40*D);}}break;
   case'gunner':e.face=dx<0?-1:1;{const m=Math.hypot(dx,dy)||1;e.ax=dx/m;e.ay=Math.max(-.9,Math.min(.9,dy/m));}phys(e,dt,3);e.cd-=dt;
    if(e.cd<=0&&Math.abs(dx)<VW*.8){e.cd=e.rate+Math.random()*.6;eShot(e.x+e.ax*10,e.y-11+e.ay*10,P.x,P.y-10,e.bs);AU.sfx('tick');}break;
   case'turret':{const m=Math.hypot(dx,dy+2)||1;e.ax=dx/m;e.ay=Math.min(.2,dy/m);e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<VW*.8){e.cd=e.rate;const n=G.stage>=6?3:2;for(let k=0;k<n;k++)setTimeout(()=>{if(!e.dead&&G.mode==='play')eShot(e.x+e.ax*14,e.y-12+e.ay*14,P.x,P.y-10,e.bs*.95);},k*180);}break;}
   case'drone':e.x-=e.spd*dt*(dx<0?1:-.3);e.y=e.y0+Math.sin(e.t*2)*14;e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<40){e.cd=2.2-D*.6;EB.push({x:e.x,y:e.y,vx:0,vy:20,k:'bomb',r:3,g:300,life:4});}break;
   case'hopper':phys(e,dt,3);e.cd-=dt;if(e.onG){e.face=dx<0?-1:1;e.vx=0;if(e.cd<=0){e.cd=1.1+Math.random()*.6;e.vy=-200-Math.random()*60;e.vx=e.face*(40+20*D);}}break;
   case'brute':e.face=dx<0?-1:1;e.vx=Math.abs(dx)>50?e.face*e.spd:0;phys(e,dt,6);e.cd-=dt;if(e.cd<=0&&Math.abs(dx)<VW*.7){e.cd=e.rate;for(let k=-1;k<=1;k++){const a=Math.atan2(dy,dx)+k*.25;EB.push({x:e.x+e.face*12,y:e.y-18,vx:Math.cos(a)*e.bs*.9,vy:Math.sin(a)*e.bs*.9,k:'o',r:3,life:5});}}break;
   case'crate':phys(e,dt,6);break;
   case'pod':e.x-=40*dt;e.y=e.y0+Math.sin(e.t*2.5)*18;if(e.x<G.camX-40)e.dead=1;break;}
  if(!e.fly&&e.y>GY+80)e.dead=1;
  if(e.x<G.camX-60||e.x>G.camX+VW+120)e.dead=1;
  if(e.type!=='crate'&&e.type!=='pod'&&P.alive&&Math.abs(dx)<e.w+3&&P.y>e.y-e.h&&P.y-(P.crouch?11:18)<e.y)hurt();}
 EN=EN.filter(e=>!e.dead);}
// ---------- boss ----------
function startBoss(){const i=G.th,Bd=BOSS[i],D=diffOf(G.stage),cyc=Math.min(G.cyc,5);const ax=G.lvl.arenaX;
 const hp=Math.round((100+110*D+Math.min(cyc,4)*10)*({emerge:.65,hover:.8,ceil:.8}[Bd.move]||1));const col=cyc?shade(Bd.col,0):Bd.col;
 const b={i,x:ax+VW*.74,y:GY,hp,max:hp,flash:0,t:0,at:2.6,ai:0,col:G.cyc?[Bd.col,'#4a9aff','#ffb02a','#e84ab0','#4ad88a','#ffffff'][G.cyc%6]:Bd.col,rage:false,vx:0,vy:0,onG:true,hidden:false,ph:'idle',pt:0,dir:-1,q:[],name:Bd.n+(G.cyc?' '+['','II','III','IV','V','VI','VII','VIII'][Math.min(7,G.cyc)]:''),parts:[1,1,1]};
 if(Bd.move==='hover')b.y=GY-95;if(Bd.move==='ceil'){b.y=GY-118;b.ceil=1;}if(Bd.move==='emerge'){b.hidden=true;b.ph='under';b.pt=1.2;b.y=GY+80;}
 G.boss=b;G.warn=2.4;AU.sfx('warn');AU.play(100+i);vib(120);}
function bossBox(b){const Bd=BOSS[b.i];return{x0:b.x-Bd.w*.46,x1:b.x+Bd.w*.46,y0:b.y-Bd.h-4,y1:b.y+(Bd.move==='hover'||Bd.move==='ceil'?6:0)};}
function bossAtk(b,k){const Bd=BOSS[b.i],D=diffOf(G.stage),bs=78+44*D,ox=b.x,oy=b.y-Bd.h*.6,ax=G.lvl.arenaX,R=b.rage;
 const later=(t,fn)=>b.q.push({t,fn});
 switch(k){
  case'fan':{const n=R?5:3,A=Math.atan2(P.y-10-oy,P.x-ox);for(let j=0;j<n;j++){const a=A+(j-(n-1)/2)*.24;EB.push({x:ox,y:oy,vx:Math.cos(a)*bs,vy:Math.sin(a)*bs,k:'o',r:4,life:6});}AU.sfx('spread');break;}
  case'burst':for(let j=0;j<(R?4:3);j++)later(j*.18,()=>{eShot(b.x,b.y-10,P.x,P.y-10,bs*1.1,{r:4});AU.sfx('tick');});break;
  case'ring':{const n=R?12:8;for(let j=0;j<n;j++){const a=j/n*6.283+b.t;EB.push({x:ox,y:oy,vx:Math.cos(a)*bs*.8,vy:Math.sin(a)*bs*.8,k:'o',r:4,life:6});}AU.sfx('spread');break;}
  case'shock':b.slam=.3;for(const d of[-1,1])EB.push({x:b.x+d*Bd.w*.4,y:GY,vx:d*(95+25*D),vy:0,k:'wave',r:6,life:4});G.shake=5;AU.sfx('boom');break;
  case'lob':for(let j=0;j<(R?4:3);j++){const tx=P.x+(j-1)*30+(Math.random()-.5)*20,tt=1.1;EB.push({x:ox,y:oy,vx:(tx-ox)/tt,vy:-200,k:'bomb',r:4,g:360,life:5});}AU.sfx('missile');break;
  case'rain':{const n=R?7:5;for(let j=0;j<n;j++){const x=j===0?P.x:ax+16+Math.random()*(VW-32);EB.push({x,y:GY,k:'mark',life:.9,r:0,vx:0,vy:0,then:'rock'});}break;}
  case'beam':{const xs=[P.x,ax+VW*(.15+Math.random()*.2),ax+VW*(.55+Math.random()*.3)];if(!R)xs.pop();for(const x of xs)EB.push({x,y:0,k:'beam',life:1.5,bt:0,r:0,vx:0,vy:0});AU.sfx('charge');break;}
  case'minion':{const n=EN.filter(e=>e.type==='drone'||e.type==='runner').length;if(n<3)for(let j=0;j<2;j++){EN.push({id:nid++,type:'drone',x:ax+VW*(.3+j*.4),y:GY-170,y0:GY-140-j*20,hp:2,w:8,h:10,spd:20,cd:1.5,pts:100,bs,fly:1,flash:0,t:0,face:-1,col:'#ff4ad8',eye:'#2affe8',vx:0,vy:0});}break;}
  case'tri':for(let j=0;j<3;j++)if(b.parts[j]>0)later(j*.35,()=>{const yy=b.y-j*28-16,A=Math.atan2(P.y-10-yy,P.x-b.x);for(let q=-1;q<=1;q++){const a=A+q*.22;EB.push({x:b.x-20,y:yy,vx:Math.cos(a)*bs,vy:Math.sin(a)*bs,k:'o',r:4,life:6});}AU.sfx('tick');});break;
  case'bombs':for(let j=0;j<(R?6:4);j++)later(j*.25,()=>{EB.push({x:b.x-30+j*14,y:b.y-6,vx:(P.x-b.x)*.3,vy:30,k:'bomb',r:4,g:300,life:5});AU.sfx('missile');});break;
  case'drop':b.ph='drop';b.pt=0;break;}}
function updateBoss(dt){const b=G.boss;if(!b)return;const Bd=BOSS[b.i],ax=G.lvl.arenaX,D=diffOf(G.stage);b.t+=dt;b.flash-=dt;b.slam=(b.slam||0)-dt;b.lookX=P.x-b.x;
 if(b.dead){b.dt=(b.dt||0)+dt;if(Math.random()<dt*14){const bx=bossBox(b);boom(bx.x0+Math.random()*(bx.x1-bx.x0),bx.y0+Math.random()*(bx.y1-bx.y0),1+(Math.random()<.3?1:0));AU.sfx('boom');}if(b.dt>2.2&&G.clearT<0){G.clearT=0;}return;}
 b.rage=b.hp<b.max*.5;
 for(const q of b.q)q.t-=dt;b.q.filter(q=>q.t<=0).forEach(q=>q.fn());b.q=b.q.filter(q=>q.t>0);
 const spd=(R=>R?1.5:1)(b.rage);
 switch(Bd.move){
  case'walk':b.x+=b.dir*(22+10*D)*spd*dt;if(b.x<ax+VW*.45)b.dir=1;if(b.x>ax+VW*.84)b.dir=-1;break;
  case'stand':b.x=ax+VW*.8;b.y=GY;b.parts=[b.hp>b.max*.0?1:0,b.hp>b.max*.34?1:0,b.hp>b.max*.67?1:0];break;
  case'hover':b.x=ax+VW*.6+Math.sin(b.t*.6*spd)*VW*.25;b.y=GY-92+Math.sin(b.t*1.3)*12-(b.i===6?14:0);break;
  case'hop':if(b.onG){b.pt-=dt;if(b.pt<=0){b.pt=1.6/spd;const tx=ax+VW*(.3+Math.random()*.55);b.vx=(tx-b.x)/0.9;b.vy=-260;b.onG=false;}}else{b.vy+=580*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>=GY){b.y=GY;b.onG=true;b.vx=0;bossAtk(b,'shock');}}break;
  case'emerge':b.pt-=dt;if(b.ph==='under'){b.hidden=true;b.y=GY+80;b.x+=Math.sign(b.tx-b.x||1)*80*dt;if(Math.random()<dt*20)burst(b.x,GY,2,[TH[G.th].top,TH[G.th].dirt],40,2);if(b.pt<=0){b.ph='rise';b.pt=.5;b.hidden=false;G.shake=4;AU.sfx('boom');}}
   else if(b.ph==='rise'){b.y=GY+80*(b.pt/.5);if(b.pt<=0){b.ph='up';b.pt=2.8/spd;b.y=GY;bossAtk(b,'ring');}}
   else if(b.ph==='up'){if(b.pt<=0){b.ph='sink';b.pt=.5;}}
   else if(b.ph==='sink'){b.y=GY+80*(1-b.pt/.5);if(b.pt<=0){b.ph='under';b.pt=1.3;b.tx=Math.max(ax+30,Math.min(ax+VW-30,P.x+(Math.random()<.5?-1:1)*(50+Math.random()*40)));}}
   if(b.tx===undefined)b.tx=ax+VW*.7;break;
  case'ceil':if(b.ph==='drop'){b.pt+=dt;b.ceil=0;if(b.pt<.6)b.y=Math.min(GY,b.y+300*dt);else if(b.pt<.65){if(!b.sl){b.sl=1;bossAtk(b,'shock');}}else if(b.pt>1.3){b.y-=200*dt;if(b.y<=GY-118){b.y=GY-118;b.ph='idle';b.ceil=1;b.sl=0;}}}
   else{b.x=ax+VW*.55+Math.sin(b.t*.7*spd)*VW*.32;}break;}
 if(Bd.move!=='emerge'||b.ph==='up'){b.at-=dt;if(b.at<=0){const k=Bd.atk[b.ai%Bd.atk.length];b.ai++;bossAtk(b,k);b.at=(2.1-.6*D)*(b.rage?.72:1);}}
 const bx=bossBox(b);if(!b.hidden&&P.alive&&P.x>bx.x0-3&&P.x<bx.x1+3&&P.y>bx.y0&&P.y-16<bx.y1)hurt();}
function damageBoss(b,d){if(b.dead||b.hidden)return;d=Math.min(d,b.hp);b.hp-=d;b.flash=.06;G.score+=Math.round(d*10);if(b.hp<=0){b.hp=0;b.dead=true;G.slow=.35;G.slowT=.9;G.flash=.5;G.shake=10;AU.sfx('bossboom');vib(200);const pts=5000+G.stage*200;G.score+=pts;pop(b.x,b.y-BOSS[b.i].h-10,'+'+pts,'#ffe84a');
  EB=[];for(let k=0;k<14;k++)CO.push({x:b.x,y:b.y-30,vx:(Math.random()-.5)*160,vy:-160-Math.random()*120,t:0,phys:1});EN.forEach(e=>{if(e.type!=='crate')killEnemy(e);});}}
// ---------- bullets & pickups ----------
function updateBullets(dt){
 for(const b of PB){b.life-=dt;
  if(b.k==='f'){b.ph+=dt*16;b.ox+=b.vx*dt;b.oy+=b.vy*dt;const rr=b.big?9:6;b.x=b.ox-b.dy*Math.sin(b.ph)*rr;b.y=b.oy+b.dx*Math.sin(b.ph)*rr;}
  else{if(b.k==='h'){let best=null,bd=1e9;for(const e of EN){if(e.type==='crate')continue;const d=Math.hypot(e.x-b.x,e.y-e.h/2-b.y);if(d<bd){bd=d;best=e;}}const B=G.boss;if(B&&!B.dead&&!B.hidden){const d=Math.hypot(B.x-b.x,B.y-BOSS[B.i].h/2-b.y);if(d<bd){best={x:B.x,y:B.y,h:BOSS[B.i].h};}}
    if(best){const a=Math.atan2(best.y-best.h/2-b.y,best.x-b.x),c=Math.atan2(b.vy,b.vx);let da=a-c;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;const na=c+Math.max(-5*dt,Math.min(5*dt,da)),v=Math.hypot(b.vx,b.vy)+60*dt;b.vx=Math.cos(na)*v;b.vy=Math.sin(na)*v;}}
   b.x+=b.vx*dt;b.y+=b.vy*dt;}
  if(b.x<G.camX-20||b.x>G.camX+VW+20||b.y<-20||b.y>GY+60)b.life=0;
  for(const e of EN){if(b.life<=0)break;if(b.hits&&b.hits[e.id])continue;if(Math.abs(b.x-e.x)<e.w+2&&b.y>e.y-e.h-2&&b.y<e.y+2){e.hp-=b.dmg;e.flash=.07;AU.sfx('hit');burst(b.x,b.y,3,['#ffffff','#ffe84a'],50,1);if(e.hp<=0&&!e.dead)killEnemy(e);if(b.pierce)b.hits[e.id]=1;else b.life=0;}}
  const B=G.boss;if(B&&b.life>0&&!B.dead&&!B.hidden){const bx=bossBox(B);if(b.x>bx.x0&&b.x<bx.x1&&b.y>bx.y0&&b.y<bx.y1&&!(b.hits&&b.hits.boss)){damageBoss(B,b.dmg);AU.sfx('hit');burst(b.x,b.y,3,['#ffffff','#ffe84a'],60,1);if(b.pierce)b.hits.boss=1;else b.life=0;}}}
 PB=PB.filter(b=>b.life>0);
 const ph=P.crouch?10:18;
 for(const b of EB){b.life-=dt;
  if(b.k==='mark'){if(b.life<=0&&b.then==='rock'){EB.push({x:b.x,y:GY-280,vx:0,vy:150+60*diffOf(G.stage),k:'rock',r:5,life:4});}continue;}
  if(b.k==='beam'){b.bt+=dt;b.on=b.bt>1&&b.bt<1.45;if(b.on&&!b.sfx){b.sfx=1;AU.sfx('beam');G.shake=3;}if(b.on&&Math.abs(P.x-b.x)<8)hurt();if(b.bt>1.5)b.life=0;continue;}
  if(b.g)b.vy+=b.g*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.k==='wave'){if(colTop(b.x)===null)b.life=0;else b.y=colTop(b.x);if(Math.abs(P.x-b.x)<7&&P.y>b.y-12&&P.y-ph<b.y)hurt();}
  else{const gt=colTop(b.x);if((gt!==null&&b.y>gt&&b.y<gt+12)||b.y>GY+60){if(b.k==='bomb'||b.k==='rock'){boom(b.x,Math.min(b.y,gt??GY),1);AU.sfx('pop');if(Math.abs(P.x-b.x)<14&&Math.abs(P.y-b.y)<16)hurt();}b.life=0;}
   else if(Math.abs(P.x-b.x)<4+b.r&&b.y>P.y-ph-b.r&&b.y<P.y+b.r)hurt(),b.life=0;}
  if(b.x<G.camX-40||b.x>G.camX+VW+40)b.life=0;}
 EB=EB.filter(b=>b.life>0);
 const mag=18+SAVE.upg.mag*14;
 for(const c of CO){c.t+=dt;if(c.phys){c.vy+=500*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;const g=colTop(c.x);if(g!==null&&c.y>g-4&&c.vy>0){c.y=g-4;c.vy*=-.35;c.vx*=.7;if(Math.abs(c.vy)<30){c.vy=0;c.phys=c.t<6?2:0;}}if(c.y>GY+70)c.gone=1;}
  const dx=P.x-c.x,dy=P.y-10-c.y,d=Math.hypot(dx,dy);if(d<mag&&P.alive){c.x+=dx/d*200*dt;c.y+=dy/d*200*dt;c.phys=0;}if(d<8&&P.alive){c.gone=1;G.coinsRun++;G.score+=10;AU.sfx('coin');FX.push({x:c.x,y:c.y,vx:0,vy:-40,life:.3,max:.3,c:'#fff8a0',s:2,g:0});}}
 CO=CO.filter(c=>!c.gone&&c.x>G.camX-30);
 for(const p of PU){p.vy+=400*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const g=groundAt(p.x-4,p.x+4);if(g!==null&&p.y>=g&&p.vy>0){p.y=g;p.vy=0;p.vx=0;}for(const pl of G.lvl.plats)if(p.x>pl.x&&p.x<pl.x+pl.w&&p.y>=pl.y&&p.y-p.vy*dt<=pl.y+1&&p.vy>=0){p.y=pl.y;p.vy=0;p.vx=0;}
  if(Math.abs(P.x-p.x)<10&&Math.abs(P.y-p.y)<18&&P.alive){p.gone=1;collect(p.k);}if(p.y>GY+80||p.x<G.camX-20)p.gone=1;}
 PU=PU.filter(p=>!p.gone);}
function collect(k){if(k==='heart'){if(P.hearts<P.maxH){P.hearts++;}else G.score+=500;AU.sfx('heart');pop(P.x,P.y-28,T('pHeart'),'#ff8aa8');return;}
 if(k==='shield'){P.shield=10;P.shieldHP=3;AU.sfx('pickup');pop(P.x,P.y-28,T('pShield'),'#5affb0');return;}
 if(P.wep===k)P.wl=Math.min(3,P.wl+1);else{P.wep=k;}AU.sfx('pickup');vib(30);pop(P.x,P.y-28,T('w_'+k)+(P.wl>1?' Lv'+P.wl:''),WCOL[k]);burst(P.x,P.y-10,14,[WCOL[k],'#ffffff'],80);G.flash=.08;}
// ---------- main update ----------
function update(dt){G.t+=dt;
 if(G.mode==='menu'){G.menuX+=dt*40;return;}
 if(G.mode==='dead'){G.deadT-=dt;updFX(dt);if(G.deadT<=0&&G.mode==='dead'){G.mode='over';UI.over();}return;}
 if(G.mode!=='play')return;
 if(G.slowT>0){G.slowT-=dt;if(G.slowT<=0)G.slow=1;}dt*=G.slow;G.stT+=dt;G.intro-=dt;G.warn-=dt;
 updatePlayer(dt);
 if(!G.lock){G.camX=Math.max(G.camX,Math.min(P.x-VW*.42,G.lvl.arenaX));if(G.camX>=G.lvl.arenaX-.5){G.camX=G.lvl.arenaX;G.lock=true;startBoss();}}
 const L_=G.lvl;while(L_.spI<L_.sp.length&&L_.sp[L_.spI].x<G.camX+VW+8){const s=L_.sp[L_.spI++];if(!G.lock)spawn(s);}
 updateEnemies(dt);updateBoss(dt);updateBullets(dt);updFX(dt);
 if(G.clearT>=0){G.clearT+=dt;if(G.clearT>.6&&G.mode==='play'){G.mode='clear';stageClear();}}}
function updFX(dt){for(const f of FX){f.life-=dt;if(f.ring){f.r+=f.vr*dt;continue;}f.vy+=(f.g||0)*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;}FX=FX.filter(f=>f.life>0);if(FX.length>420)FX.splice(0,FX.length-420);
 for(const g of GL)g.life-=dt;GL=GL.filter(g=>g.life>0);for(const p of POP){p.life-=dt;p.y-=24*dt;}POP=POP.filter(p=>p.life>0);G.shake=Math.max(0,G.shake-dt*14);G.flash=Math.max(0,G.flash-dt);G.muzzle=Math.max(0,(G.muzzle||0)-dt);}
function stageClear(){AU.sfx('clear');AU.play(-1);const n=G.stage,nohit=G.hurtCount===0;const tb=Math.max(0,Math.round(3000-G.stT*15));
 const res={n,kills:G.kills,coins:G.coinsRun,nohit,tb,score:G.score};res.total=G.score+G.coinsRun*10+(nohit?2000:0)+tb;res.earn=G.coinsRun+10+(nohit?15:0);
 SAVE.far=Math.max(SAVE.far,n+1);SAVE.coins+=res.earn;SAVE.stagesCleared++;const nb=res.total>(SAVE.best[n]||0);if(nb)SAVE.best[n]=res.total;SAVE.hi=Math.max(SAVE.hi,res.total);res.newBest=nb;persist();UI.hud(false);UI.result(res);}
// ---------- rendering ----------
function render(){const s=S;L.setTransform(1,0,0,1,0,0);
 const th=G.mode==='menu'?0:G.th;if(!G.bg||G.bg.th!==th){if(G.mode==='menu'||!G.lvl){G.bg=buildBG(0,0,VW,VH,GY,5);G.bg.th=0;}else G.bg.th=th;}
 const bg=G.bg,P_=bg.P,cam=G.mode==='menu'?G.menuX:G.camX;const ci=Math.floor(cam);
 L.drawImage(bg.sky,0,0,VW,VH);
 const lay=(img,f,yo)=>{const o=-((cam*f)%512);for(let x=o;x<VW;x+=512)L.drawImage(img,Math.floor(x),yo||0);};
 lay(bg.deco,.04);lay(bg.far,.14);lay(bg.mid,.32);
 // ground
 const lv=G.mode==='menu'?null:G.lvl;const i0=Math.floor(cam/TILE)-1,i1=i0+Math.ceil(VW/TILE)+2;
 for(let i=i0;i<=i1;i++){const top=lv?(i<0||i>=lv.len?GY:lv.cols[i]):GY+(Math.floor(i/9)%3===2?-24:0);const x=i*TILE-ci;if(top===null){let pt=GY;for(let q=i-3;q<=i+3;q++){const v=lv.cols[q];if(v!=null&&v<pt)pt=v;}pt+=5;const pg=L.createLinearGradient(0,pt,0,GY+44);pg.addColorStop(0,shade(P_.dk,-.5));pg.addColorStop(1,'#05040a');L.fillStyle=pg;L.fillRect(x,pt,TILE,GY+48-pt);continue;}
  L.save();L.translate(-ci,0);L.fillStyle=bg.patF||(bg.patF=L.createPattern(bg.pat,'repeat'));L.fillRect(i*TILE,top,TILE,GY+48-top);L.restore();
  L.fillStyle=P_.top;L.fillRect(x,top,TILE,3);L.fillStyle=P_.top2;L.fillRect(x,top+3,TILE,2);
  const lt=lv?(i-1<0?GY:lv.cols[i-1]):top,rt=lv?(i+1>=lv.len?GY:lv.cols[i+1]):top;L.fillStyle=P_.dk;if(lt===null||lt>top)L.fillRect(x,top,2,GY+48-top);if(rt===null||rt>top)L.fillRect(x+TILE-2,top,2,GY+48-top);
  if(lt!==null&&rt!==null&&lt===top&&rt===top)drawDeco(th,x,top,i,bg.tint);}
 if(lv){for(const p of lv.plats){const x=Math.round(p.x-ci);if(x>VW||x+p.w<0)continue;L.fillStyle=P_.dk;L.fillRect(x,p.y,p.w,7);L.fillStyle=P_.top;L.fillRect(x,p.y,p.w,3);L.fillStyle=P_.top2;L.fillRect(x,p.y+3,p.w,1);L.fillStyle=shade(P_.dk,-.3);for(let k=4;k<p.w;k+=12)L.fillRect(x+k,p.y+7,2,3);}
  const fx=lv.cpX-ci,fy=colTop(lv.cpX);if(fx>-20&&fx<VW+20&&fy!==null){L.fillStyle='#ddd';L.fillRect(fx,fy-30,2,30);L.fillStyle=G.cpOn?'#5affb0':'#ff5a5a';const w=Math.sin(G.t*6)*2;L.fillRect(fx+2,fy-30,10,3);L.fillRect(fx+2,fy-27,9+w,3);L.fillRect(fx+2,fy-24,8,3);}}
 // world objects
 for(const c of CO)if(c.x-ci>-8&&c.x-ci<VW+8)drawCoin(c.x-ci,c.y,c.t);
 for(const p of PU)drawPick(p,p.x-ci,p.y,G.t);
 for(const e of EN)drawBot(e,e.x-ci,e.y,e.t);
 if(G.boss){const b=G.boss;if(!(b.dead&&b.dt>2))drawBoss(b,b.x-ci,b.y,b.t);if(b.i===1&&b.hidden){L.fillStyle=P_.top2;const x=b.x-ci;for(let k=-2;k<=2;k++)L.fillRect(x+k*5,GY-2-Math.abs(Math.sin(G.t*20+k))*3,3,3);}}
 if(G.mode!=='menu'&&P.alive){if(P.respawn<=0||((P.respawn*20)|0)%2)drawHero(P.x-ci,P.y,SAVE.hero,{face:P.face,aimX:P.ax,aimY:P.ay,crouch:P.crouch,air:!P.onG,run:P.run,t:G.t,inv:P.inv>0?P.inv:0,hero:SAVE.hero});
  if(P.shield>0){L.strokeStyle=`rgba(90,255,176,${.5+Math.sin(G.t*10)*.3})`;L.lineWidth=1;L.beginPath();L.arc(P.x-ci,P.y-10,13,0,7);L.stroke();}
  if(G.muzzle>0){L.fillStyle='#fff8c0';L.fillRect(P.x-ci+P.ax*13-2,P.y-(P.crouch?8:13)+P.ay*10-2,4,4);}}
 if(G.mode==='menu'){const hx=VW*.32+Math.sin(G.t*.8)*20;drawHero(hx,GY,SAVE.hero,{face:1,aimX:1,aimY:0,run:true,t:G.t});drawHero(hx-22,GY,1-SAVE.hero,{face:1,aimX:.7,aimY:-.7,run:true,t:G.t+.3});}
 // bullets
 for(const b of PB){const x=b.x-ci;L.fillStyle=WCOL[b.k]||'#fff';
  if(b.k==='l'){L.save();L.translate(x,b.y);L.rotate(b.ang);L.fillStyle='#4ad8ff';L.fillRect(-12,-2,18,4);L.fillStyle='#ffffff';L.fillRect(-10,-1,16,2);L.restore();}
  else if(b.k==='f'){const r=b.big?4:3;L.fillStyle='#ff5a1a';L.fillRect(x-r,b.y-r,r*2,r*2);L.fillStyle='#ffe84a';L.fillRect(x-r+1,b.y-r+1,r*2-2,r*2-2);}
  else if(b.k==='h'){L.fillRect(x-2,b.y-1,5,3);L.fillRect(x-1,b.y-2,3,5);L.fillStyle='#fff';L.fillRect(x,b.y,1,1);}
  else{L.fillRect(x-2,b.y-2,4,4);L.fillStyle='#fff';L.fillRect(x-1,b.y-1,2,2);}}
 for(const b of EB){const x=b.x-ci;
  if(b.k==='mark'){if(((b.life*12)|0)%2){L.fillStyle='#ff4a4a';L.fillRect(x-5,b.y-2,10,2);L.fillRect(x-1,b.y-8,2,4);}continue;}
  if(b.k==='beam'){if(b.on){L.fillStyle='rgba(255,80,200,.5)';L.fillRect(x-9,0,18,GY);L.fillStyle='#ffd0f8';L.fillRect(x-5,0,10,GY);L.fillStyle='#fff';L.fillRect(x-2,0,4,GY);}else if(((b.bt*14)|0)%2){L.fillStyle='rgba(255,80,120,.7)';L.fillRect(x-1,0,2,GY);L.fillRect(x-6,GY-3,12,3);}continue;}
  if(b.k==='wave'){const ph=Math.sin(G.t*30)*1.5;L.fillStyle=P_.top2;L.beginPath();L.ellipse(x,b.y,8,10+ph,0,Math.PI,0);L.fill();L.fillStyle='rgba(255,255,255,.85)';L.beginPath();L.ellipse(x+Math.sign(b.vx)*2,b.y,4,7+ph,0,Math.PI,0);L.fill();L.fillStyle=P_.dk;L.fillRect(x-9,b.y-2,3,2);L.fillRect(x+6,b.y-3,3,3);continue;}
  if(b.k==='bomb'){L.fillStyle='#2a2a3a';L.fillRect(x-3,b.y-3,6,6);L.fillStyle=((G.t*10)|0)%2?'#ff4a4a':'#ffd84a';L.fillRect(x-1,b.y-5,2,2);continue;}
  if(b.k==='rock'){const c=[ '#8a6a4a','#c89a5a','#cfefff','#ff6a1a','#ff4ad8','#9a9a7a','#ffe84a','#4af6ff'][G.th];L.fillStyle=c;L.fillRect(x-4,b.y-5,8,10);L.fillStyle='#fff';L.fillRect(x-2,b.y-3,2,2);continue;}
  L.fillStyle='#ff3a6a';L.fillRect(x-3,b.y-3,6,6);L.fillStyle='#ffd0e0';L.fillRect(x-2,b.y-2,3,3);}
 for(const f of FX){if(f.ring){L.strokeStyle=f.c;L.globalAlpha=Math.max(0,f.life/f.max);L.lineWidth=2;L.beginPath();L.arc(f.x-ci,f.y,f.r,0,7);L.stroke();L.globalAlpha=1;continue;}L.fillStyle=f.c;L.fillRect(Math.round(f.x-ci),Math.round(f.y),f.s,f.s);}
 // control deck
 const dy=GY+44;const gr=L.createLinearGradient(0,dy,0,VH);gr.addColorStop(0,'#14112a');gr.addColorStop(1,'#07060f');L.fillStyle=gr;L.fillRect(0,dy,VW,VH-dy);L.fillStyle=P_.ac;L.globalAlpha=.7;L.fillRect(0,dy,VW,1);L.globalAlpha=.15;for(let x=(-ci*1)%8;x<VW;x+=8)L.fillRect(x,dy+3,4,1);L.globalAlpha=1;
 // blit
 X.setTransform(1,0,0,1,0,0);X.imageSmoothingEnabled=false;let sx=0,sy=0;if(G.shake>0&&SAVE.shake){sx=(Math.random()-.5)*G.shake*S;sy=(Math.random()-.5)*G.shake*S;}
 X.fillStyle='#000';X.fillRect(0,0,cv.width,cv.height);X.drawImage(LB,0,0,VW,VH,Math.round(sx),Math.round(sy),VW*s,VH*s);
 // additive glows (full-res)
 X.globalCompositeOperation='lighter';
 for(const g of GL){const a=g.life/g.max,x=(g.x-ci)*s+sx,y=g.y*s+sy,r=g.r*s*(1.4-a*.4);const gg=X.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,`rgba(${g.c},${.55*a})`);gg.addColorStop(1,`rgba(${g.c},0)`);X.fillStyle=gg;X.fillRect(x-r,y-r,r*2,r*2);}
 if(PB.length<60)for(const b of PB){const c=b.k==='l'?'74,216,255':b.k==='f'?'255,120,30':b.k==='h'?'200,106,255':'255,232,74';const x=(b.x-ci)*s+sx,y=b.y*s+sy,r=6*s;X.fillStyle=glowSpr(c);X.globalAlpha=.6;X.drawImage(glowSpr(c),x-r,y-r,r*2,r*2);X.globalAlpha=1;}
 for(const b of EB){if(b.k!=='o')continue;const x=(b.x-ci)*s+sx,y=b.y*s+sy,r=7*s;X.globalAlpha=.7;X.drawImage(glowSpr('255,58,106'),x-r,y-r,r*2,r*2);X.globalAlpha=1;}
 X.globalCompositeOperation='source-over';
 if(G.mode!=='menu')drawHUD();
 if(G.flash>0){X.fillStyle=`rgba(255,255,255,${Math.min(.7,G.flash*1.4)})`;X.fillRect(0,0,cv.width,cv.height);}}
const _gs={};function glowSpr(c){if(_gs[c])return _gs[c];const [g,x]=mk(32,32);const gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,`rgba(${c},.9)`);gr.addColorStop(.4,`rgba(${c},.35)`);gr.addColorStop(1,`rgba(${c},0)`);x.fillStyle=gr;x.fillRect(0,0,32,32);return _gs[c]=g;}
// ---------- HUD + touch controls (full-res canvas, css px * DPR) ----------
const CTRL={jx:0,jy:0,jr:0,bJ:{x:0,y:0,r:0},bF:{x:0,y:0,r:0},stick:null,knob:{x:0,y:0},ptr:{}};
function layoutCtrl(){const deckTop=(GY+44)*S/DPR,h=CH-deckTop-SAB;const cy=deckTop+h*.52;const R=Math.min(h*.3,CW*.15,62);
 CTRL.jr=R;CTRL.jx=CW*.2+8;CTRL.jy=cy;CTRL.bJ={x:CW-R*1.15-10,y:cy+R*.35,r:R*.82};CTRL.bF={x:CW-R*3.1-12,y:cy-R*.25,r:R*.72};}
function drawHUD(){const k=DPR,X_=X;X_.save();X_.scale(k,k);const top=SAT+8,rtl=document.documentElement.dir==='rtl';
 // hearts
 for(let i=0;i<P.maxH;i++){heart(X_,12+i*20,top+4,i<P.hearts);}
 X_.font='800 13px system-ui,sans-serif';X_.textBaseline='middle';X_.textAlign='left';X_.fillStyle='#fff';X_.strokeStyle='rgba(0,0,0,.6)';X_.lineWidth=3;
 const lt='×'+P.lives;X_.strokeText(lt,14+P.maxH*20,top+12);X_.fillText(lt,14+P.maxH*20,top+12);
 // coins & weapon row
 const y2=top+34;X_.fillStyle='#ffd84a';X_.beginPath();X_.arc(18,y2,6,0,7);X_.fill();X_.fillStyle='#fff8c0';X_.fillRect(16,y2-3,2,4);X_.fillStyle='#fff';const ct=''+G.coinsRun;X_.strokeText(ct,28,y2);X_.fillText(ct,28,y2);
 const wx=70;X_.fillStyle=WCOL[P.wep];rr(X_,wx,y2-10,22,20,5);X_.fill();X_.fillStyle='#1a1a2a';X_.font='900 12px monospace';X_.textAlign='center';X_.fillText(P.wep.toUpperCase(),wx+11,y2+1);
 for(let i=0;i<3;i++){X_.fillStyle=i<P.wl?'#fff':'rgba(255,255,255,.25)';X_.fillRect(wx+26+i*7,y2-3,5,6);}
 // stage title center
 X_.textAlign='center';X_.font='900 14px PS2P,monospace';const st=T('stage')+' '+G.stage;X_.lineWidth=4;X_.strokeText(st,CW/2,top+12);X_.fillStyle='#fff';X_.fillText(st,CW/2,top+12);
 X_.font='800 12px system-ui,sans-serif';const sc=(''+G.score).padStart(6,'0');X_.strokeText(sc,CW/2,top+32);X_.fillStyle='#ffe84a';X_.fillText(sc,CW/2,top+32);
 // progress bar (stage) or boss bar
 const bw=Math.min(CW*.6,260),bx=CW/2-bw/2,by=top+46;
 if(G.boss&&!G.boss.dead){const b=G.boss;X_.fillStyle='rgba(0,0,0,.55)';rr(X_,bx-2,by-2,bw+4,12,6);X_.fill();const f=b.hp/b.max;const gg=X_.createLinearGradient(bx,0,bx+bw,0);gg.addColorStop(0,'#ff3a5a');gg.addColorStop(1,'#ffb03a');X_.fillStyle=gg;rr(X_,bx,by,bw*f,8,4);X_.fill();
  X_.font='800 11px system-ui,sans-serif';X_.fillStyle='#fff';X_.strokeText(b.name,CW/2,by+20);X_.fillText(b.name,CW/2,by+20);}
 else if(G.lvl){const f=Math.min(1,G.camX/G.lvl.arenaX);X_.fillStyle='rgba(0,0,0,.45)';rr(X_,bx,by,bw,6,3);X_.fill();X_.fillStyle='#5affb0';rr(X_,bx,by,Math.max(6,bw*f),6,3);X_.fill();const cpx=bx+bw*Math.min(1,(G.lvl.cpX-VW*.42)/G.lvl.arenaX);X_.fillStyle=G.cpOn?'#5affb0':'#fff';X_.fillRect(cpx-1,by-3,2,12);X_.fillStyle='#ff5a5a';X_.beginPath();X_.arc(bx+bw,by+3,5,0,7);X_.fill();}
 // stage intro banner
 if(G.intro>0){const a=Math.min(1,G.intro*2,(2.6-G.intro)*4);X_.globalAlpha=a;const y=CH*.26;X_.fillStyle='rgba(0,0,0,.45)';X_.fillRect(0,y-34,CW,70);X_.font='900 22px PS2P,monospace';X_.lineWidth=5;X_.strokeStyle='#2a0a3a';X_.strokeText(st,CW/2,y-8);
  const g=X_.createLinearGradient(0,y-20,0,y+4);g.addColorStop(0,'#fff6b0');g.addColorStop(1,'#ff7a1a');X_.fillStyle=g;X_.fillText(st,CW/2,y-8);X_.font='800 15px system-ui,sans-serif';X_.fillStyle='#fff';X_.lineWidth=3;X_.strokeText(T(TH[G.th].k),CW/2,y+20);X_.fillText(T(TH[G.th].k),CW/2,y+20);X_.globalAlpha=1;}
 if(G.warn>0){const a=((G.warn*4)|0)%2?1:.5;const y=CH*.3;X_.globalAlpha=a;X_.fillStyle='rgba(200,0,30,.5)';X_.fillRect(0,y-26,CW,52);X_.fillStyle='#ffd84a';for(let x=-40+((G.t*80)%40);x<CW;x+=40){X_.beginPath();X_.moveTo(x,y-26);X_.lineTo(x+16,y-26);X_.lineTo(x+6,y-20);X_.lineTo(x-10,y-20);X_.fill();X_.beginPath();X_.moveTo(x,y+20);X_.lineTo(x+16,y+20);X_.lineTo(x+6,y+26);X_.lineTo(x-10,y+26);X_.fill();}
  X_.font='900 20px PS2P,monospace';X_.fillStyle='#fff';X_.lineWidth=4;X_.strokeStyle='#5a0010';X_.strokeText(T('warning'),CW/2,y);X_.fillText(T('warning'),CW/2,y);X_.globalAlpha=1;}
 // controls
 if(G.mode==='play'||G.mode==='dead'){layoutCtrl();const C=CTRL;
  const jx=C.stick?C.stick.bx:C.jx,jy=C.stick?C.stick.by:C.jy;X_.fillStyle='rgba(255,255,255,.08)';X_.strokeStyle='rgba(255,255,255,.35)';X_.lineWidth=2;X_.beginPath();X_.arc(jx,jy,C.jr,0,7);X_.fill();X_.stroke();
  X_.fillStyle='rgba(255,255,255,.3)';for(let a=0;a<4;a++){const an=a*Math.PI/2;X_.save();X_.translate(jx+Math.cos(an)*C.jr*.72,jy+Math.sin(an)*C.jr*.72);X_.rotate(an);X_.beginPath();X_.moveTo(6,0);X_.lineTo(-4,-6);X_.lineTo(-4,6);X_.fill();X_.restore();}
  const kx=jx+(C.stick?C.knob.x:0)*C.jr*.6,ky=jy+(C.stick?C.knob.y:0)*C.jr*.6;const kg=X_.createRadialGradient(kx-6,ky-6,2,kx,ky,C.jr*.45);kg.addColorStop(0,'#ffffff');kg.addColorStop(1,'#8a9ab8');X_.fillStyle=kg;X_.beginPath();X_.arc(kx,ky,C.jr*.42,0,7);X_.fill();
  btn(X_,C.bJ,'#ff9a2a','#c04a00',IN.jump,'▲',T('jump'));btn(X_,C.bF,SAVE.auto?'#3ad86a':'#ff4a6a',SAVE.auto?'#1a8a3a':'#a01a3a',IN.fire,SAVE.auto?'AUTO':'✹',T('fire'));}
 X_.restore();}
function btn(c,b,c1,c2,on,ic,lab){const g=c.createLinearGradient(0,b.y-b.r,0,b.y+b.r);g.addColorStop(0,c1);g.addColorStop(1,c2);c.globalAlpha=on?1:.82;c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.arc(b.x,b.y+4,b.r,0,7);c.fill();c.fillStyle=g;c.beginPath();c.arc(b.x,b.y+(on?3:0),b.r,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.stroke();
 c.fillStyle='#fff';c.textAlign='center';c.font=`900 ${ic.length>2?b.r*.38:b.r*.62}px system-ui,sans-serif`;c.fillText(ic,b.x,b.y+(on?3:0)-b.r*.08);c.font=`800 ${Math.max(10,b.r*.26)}px system-ui,sans-serif`;c.globalAlpha=.85;c.fillText(lab,b.x,b.y+b.r+12);c.globalAlpha=1;}
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,Math.max(0,w),h,r);else c.rect(x,y,Math.max(0,w),h);}
function heart(c,x,y,on){c.fillStyle=on?'#ff3a6a':'rgba(0,0,0,.4)';const p=[[1,0,2],[4,0,2],[0,1,7],[0,2,7],[1,3,5],[2,4,3],[3,5,1]];for(const [a,b,w] of p)c.fillRect(x+a*2.2,y+b*2.2,w*2.2,2.3);if(on){c.fillStyle='#ffd0dc';c.fillRect(x+2.2,y+2.2,2.2,2.2);}c.strokeStyle='rgba(0,0,0,.5)';}
// ---------- input ----------
function ptrDown(e){if(G.mode!=='play')return;AU.init();const x=e.clientX,y=e.clientY;layoutCtrl();const C=CTRL;
 if(x<CW*.45){const by=Math.max((GY+44)*S/DPR+C.jr*.8,Math.min(CH-SAB-C.jr*.8,y)),bx=Math.max(C.jr+6,Math.min(CW*.45-C.jr*.4,x));C.stick={id:e.pointerId,bx:y>(GY+20)*S/DPR?bx:C.jx,by:y>(GY+20)*S/DPR?by:C.jy};C.ptr[e.pointerId]='stick';stickMove(x,y);}
 else{const b=whichBtn(x,y);C.ptr[e.pointerId]=b;applyBtns();}
 e.preventDefault();}
function whichBtn(x,y){const C=CTRL,dj=Math.hypot(x-C.bJ.x,y-C.bJ.y),df=Math.hypot(x-C.bF.x,y-C.bF.y);return dj<df*1.1?'jump':'fire';}
function applyBtns(){const v=Object.values(CTRL.ptr);const j=v.includes('jump');if(j&&!IN.jump)IN.jp=1;IN.jump=j?1:0;IN.fire=v.includes('fire')?1:0;}
function stickMove(x,y){const C=CTRL;if(!C.stick)return;let dx=(x-C.stick.bx)/C.jr,dy=(y-C.stick.by)/C.jr;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}C.knob={x:dx,y:dy};
 const a=Math.atan2(dy,dx),mm=Math.min(1,m);IN.l=IN.r=IN.u=IN.d=0;if(mm>.28){const o=Math.round(a/(Math.PI/4));const dirs={0:'r',1:'rd',2:'d',3:'ld',4:'l','-4':'l','-3':'lu','-2':'u','-1':'ru'}[o];for(const ch of dirs)IN[ch]=1;}}
function ptrMove(e){const k=CTRL.ptr[e.pointerId];if(!k)return;if(k==='stick')stickMove(e.clientX,e.clientY);else{CTRL.ptr[e.pointerId]=whichBtn(e.clientX,e.clientY);applyBtns();}}
function ptrUp(e){const k=CTRL.ptr[e.pointerId];if(!k)return;delete CTRL.ptr[e.pointerId];if(k==='stick'){CTRL.stick=null;CTRL.knob={x:0,y:0};IN.l=IN.r=IN.u=IN.d=0;}else applyBtns();}
cv.addEventListener('pointerdown',ptrDown,{passive:false});addEventListener('pointermove',ptrMove);addEventListener('pointerup',ptrUp);addEventListener('pointercancel',ptrUp);
const KM={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d',Space:'jump',KeyZ:'jump',KeyK:'jump',KeyX:'fire',KeyJ:'fire'};
addEventListener('keydown',e=>{const k=KM[e.code];if(k){if(k==='jump'&&!IN.jump)IN.jp=1;IN[k]=1;e.preventDefault();AU.init();}if((e.code==='Escape'||e.code==='KeyP')&&G.mode==='play')UI.pause();});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)IN[k]=0;});
addEventListener('blur',()=>{for(const k in IN)IN[k]=0;CTRL.ptr={};CTRL.stick=null;if(G.mode==='play')UI.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.mode==='play')UI.pause();if(AU.ac){if(document.hidden)AU.ac.suspend();else AU.ac.resume();}});
// ---------- loop ----------
let lastT=0;function frame(ts){const dt=Math.min(.033,(ts-lastT)/1000||0);lastT=ts;try{update(dt);render();}catch(err){console.error(err);}requestAnimationFrame(frame);}
addEventListener('resize',()=>{resize();});
// ---------- debug hooks (only with ?debug=1) ----------
if(DEBUG){window.DBG={god:false,start(n){begin(n||1);},toBoss(){G.lvl.spI=G.lvl.sp.length;EN=[];P.x=G.lvl.arenaX+VW*.45;P.y=GY;P.vy=0;G.camX=G.lvl.arenaX-1;},winBoss(){if(G.boss)damageBoss(G.boss,1e9);},
 sim(sec){for(let i=0;i<sec*60;i++)update(1/60);return{stage:G.stage,mode:G.mode,x:P.x,hearts:P.hearts,boss:!!G.boss};},give(k){collect(k);}};}
