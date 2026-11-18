// Kaboomando — procedural pixel art (themes, parallax, heroes, robots, bosses). Original designs by P-Prece Studio.
'use strict';
const TH=[ // sky top, sky bottom, far, mid, groundTop, groundTop2, dirt, dirtDark, accent
 {k:'th0',sky:['#4fb8ff','#c9f1ff'],far:'#4a9f9a',mid:'#2f7f3e',top:'#63d64c',top2:'#3aa83a',dirt:'#8f5c2c',dk:'#6a4220',ac:'#ffe14a'},
 {k:'th1',sky:['#ff9f5a','#ffe6a8'],far:'#c96f3d',mid:'#d98d48',top:'#f5cd6e',top2:'#e0a850',dirt:'#c98a45',dk:'#a46a32',ac:'#3a9f4a'},
 {k:'th2',sky:['#7fb0ff','#eaf3ff'],far:'#b5c6ea',mid:'#3d6d8f',top:'#ffffff',top2:'#cfe4ff',dirt:'#86a8d0',dk:'#6688b4',ac:'#9ff0ff'},
 {k:'th3',sky:['#2e0c18','#ff6a2a'],far:'#2a1418',mid:'#4a2420',top:'#74402c',top2:'#5a3022',dirt:'#3a1a14',dk:'#2a100c',ac:'#ff8a20'},
 {k:'th4',sky:['#10093a','#ff4aa8'],far:'#2a1a5e',mid:'#170f42',top:'#5a5a86',top2:'#3d3d64',dirt:'#25253e',dk:'#1a1a2c',ac:'#2affe8'},
 {k:'th5',sky:['#ffd08e','#8ddcb0'],far:'#5f8a62',mid:'#8a7a58',top:'#b3ac6c',top2:'#8f8a50',dirt:'#7a6a4a',dk:'#5c4e36',ac:'#4adc6a'},
 {k:'th6',sky:['#2f96ff','#c6ecff'],far:'#ffffff',mid:'#7fc0a0',top:'#eef0ff',top2:'#c4cae8',dirt:'#9aa8c8',dk:'#7a88a8',ac:'#ffd84a'},
 {k:'th7',sky:['#0f0526','#3c1a70'],far:'#4a2290',mid:'#2a1460',top:'#7a56c0',top2:'#5a3a98',dirt:'#2a1a4a',dk:'#1c1034',ac:'#4af6ff'}];
function rngF(seed){let s=(seed*2654435761)>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function hsh(n){n=(n^61)^(n>>>16);n=n+(n<<3);n=n^(n>>>4);n=Math.imul(n,0x27d4eb2d);n=n^(n>>>15);return (n>>>0)/4294967296;}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x];}
function shade(hex,f){let n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;if(f<0){r*=1+f;g*=1+f;b*=1+f;}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f;}return'#'+((1<<24)|(r<<16)|(g<<8)|b|0).toString(16).slice(1);}
// periodic silhouette height (tiles every 512px)
function per(x,seed,amps){let y=0;for(let i=0;i<amps.length;i++){const k=[1,2,3,5,8,13][i];y+=amps[i]*Math.sin((x/512)*Math.PI*2*k+seed*(i+1)*1.7);}return y;}
// ---------- background builder: returns layers for the current view height ----------
function buildBG(th,variant,VW,VH,GY,seed){const P=TH[th];const R=rngF(seed);
 const [sky,sx]=mk(4,VH);const g=sx.createLinearGradient(0,0,0,GY+20);g.addColorStop(0,P.sky[0]);g.addColorStop(1,P.sky[1]);sx.fillStyle=g;sx.fillRect(0,0,4,VH);
 if(variant===1){sx.globalAlpha=.35;const g2=sx.createLinearGradient(0,0,0,GY);g2.addColorStop(0,'#5a1a6a');g2.addColorStop(1,'#ff7a3a');sx.fillStyle=g2;sx.fillRect(0,0,4,VH);sx.globalAlpha=1;}
 if(variant===2){sx.globalAlpha=.55;sx.fillStyle='#0a0630';sx.fillRect(0,0,4,VH);sx.globalAlpha=1;}
 const tint=(c,ex)=>variant===2?shade(c,-.45-(ex||0)):variant===1?shade(c,-.18):c;
 // stars / sun / decorations painted into a 512-wide sky layer
 const [deco,dx]=mk(512,GY);
 if(variant===2||th===7||th===3||th===4){for(let i=0;i<70;i++){dx.fillStyle=i%7?'rgba(255,255,255,.7)':'#fff8b0';dx.fillRect((R()*512)|0,(R()*GY*.7)|0,1+(R()<.15),1);}}
 const sunY=(GY*.22)|0;
 if(th===4){for(let r=34;r>0;r-=1){dx.fillStyle=r%6<2&&r<26?'rgba(0,0,0,0)':(r>20?'#ff7ab0':'#ffd25a');if(r%6<2&&r<26)continue;dx.beginPath();dx.arc(380,sunY+20,r,0,7);dx.fill();}
  for(let y=0;y<14;y+=3){dx.clearRect(340,sunY+22+y*1.6,80,1+y*.15);}}
 else if(th!==7){dx.fillStyle=variant===2?'#fffbe0':th===3?'#ffcf5a':'#fff3a0';dx.globalAlpha=.25;dx.beginPath();dx.arc(380,sunY,26,0,7);dx.fill();dx.globalAlpha=1;dx.beginPath();dx.arc(380,sunY,15,0,7);dx.fill();
  if(variant===2){dx.fillStyle=tint(P.sky[0],-.2);dx.beginPath();dx.arc(386,sunY-4,13,0,7);dx.fill();}}
 // clouds
 if(th!==7&&th!==3){dx.fillStyle=variant===2?'rgba(200,210,255,.25)':'rgba(255,255,255,.85)';for(let i=0;i<9;i++){const cx=R()*512,cy=GY*.08+R()*GY*.45,w=20+R()*40;for(let j=0;j<5;j++){dx.beginPath();dx.ellipse((cx+j*w/5)%512,cy-Math.sin(j/4*Math.PI)*w*.12,w*.22,w*.12,0,0,7);dx.fill();}}}
 // far layer
 const [far,fx]=mk(512,VH);fx.fillStyle=tint(P.far);const fb=GY-40;
 for(let x=0;x<512;x++){let h;
  if(th===4){h=0;} else if(th===1){h=Math.max(0,per(x,seed,[18,8,0,4]))+(Math.floor(x/60)%3===0?26:10);} else if(th===6){h=22+per(x,seed,[8,10,6]);} else h=34+per(x,seed,[20,14,6,3]);
  if(th===4)continue;fx.fillRect(x,fb-h,1,VH);
  if(th===2){const cap=Math.max(0,h-38);if(cap>0){fx.fillStyle=tint('#ffffff');fx.fillRect(x,fb-h,1,cap*.7+2);fx.fillStyle=tint(P.far);}}}
 if(th===4){for(let i=0;i<26;i++){const x=(i*20+R()*8)|0,w=12+R()*14,h=30+R()*70;fx.fillStyle=tint(P.far);fx.fillRect(x,fb-h+20,w,VH);fx.fillStyle=R()<.5?'#ffd25a':'#7af0ff';for(let wy=fb-h+24;wy<fb+20;wy+=5)for(let wx=x+2;wx<x+w-2;wx+=4)if(R()<.35)fx.fillRect(wx,wy,2,2);}}
 if(th===3){fx.fillStyle=tint('#3a1414');fx.beginPath();fx.moveTo(150,fb+10);fx.lineTo(220,fb-90);fx.lineTo(250,fb-90);fx.lineTo(330,fb+10);fx.fill();fx.fillStyle='#ff6a1a';fx.fillRect(222,fb-92,26,4);fx.fillStyle='rgba(255,120,40,.5)';fx.fillRect(230,fb-88,3,60);}
 if(th===5){fx.fillStyle=tint(shade(P.far,-.15));for(const tx of [90,330]){for(let s=0;s<5;s++)fx.fillRect(tx-30+s*6,fb-20-s*10,60-s*12,12);fx.fillRect(tx-4,fb-74,8,8);}}
 if(th===6){fx.fillStyle=tint('#e8f4ff');for(let i=0;i<14;i++){const cx=R()*512,cy=fb-10+R()*40,w=40+R()*50;fx.beginPath();fx.ellipse(cx,cy,w*.5,w*.2,0,0,7);fx.fill();}}
 if(th===7){fx.fillStyle=tint(P.far);for(let x=0;x<512;x+=14){const h=20+hsh(x+seed)*70;fx.beginPath();fx.moveTo(x,0);fx.lineTo(x+7,h);fx.lineTo(x+14,0);fx.fill();}}
 // mid layer
 const [mid,mx]=mk(512,VH);const mb=GY-8;mx.fillStyle=tint(P.mid,.05);
 const tree=(x,h)=>{if(th===0){mx.fillStyle=tint('#6a4a2a');mx.fillRect(x-2,mb-h,4,h);mx.fillStyle=tint(P.mid);for(let k=0;k<5;k++){mx.beginPath();mx.ellipse(x+[-10,10,-7,7,0][k],mb-h+[-2,-2,-8,-8,-12][k],12,5,[.4,-.4,.3,-.3,0][k],0,7);mx.fill();}}
  else if(th===1){mx.fillStyle=tint('#3e9a4a');mx.fillRect(x-3,mb-h,6,h);mx.fillRect(x-10,mb-h*.6,4,10);mx.fillRect(x-10,mb-h*.6+6,8,4);mx.fillRect(x+6,mb-h*.75,4,12);mx.fillRect(x+2,mb-h*.75+8,8,4);}
  else if(th===2){mx.fillStyle=tint(P.mid);for(let k=0;k<4;k++){mx.beginPath();mx.moveTo(x,mb-h+k*h*.18);mx.lineTo(x-6-k*3,mb-h*.55+k*h*.18);mx.lineTo(x+6+k*3,mb-h*.55+k*h*.18);mx.fill();}mx.fillStyle=tint('#ffffff');mx.fillRect(x-2,mb-h,4,3);}
  else if(th===3){mx.fillStyle=tint(P.mid);mx.beginPath();mx.moveTo(x-14,mb);mx.lineTo(x-4,mb-h);mx.lineTo(x+6,mb-h*.8);mx.lineTo(x+14,mb);mx.fill();mx.fillStyle='#ff7a20';mx.fillRect(x-2,mb-h*.6,2,h*.4);}
  else if(th===4){mx.fillStyle=tint(P.mid);mx.fillRect(x-12,mb-h,24,h+10);mx.fillStyle=['#ff4ad8','#2affe8','#ffe84a'][(x>>4)%3];mx.fillRect(x-9,mb-h+6,18,3);mx.globalAlpha=.25;mx.fillRect(x-11,mb-h+4,22,7);mx.globalAlpha=1;}
  else if(th===5){mx.fillStyle=tint(P.mid);mx.fillRect(x-5,mb-h,10,h);mx.fillRect(x-8,mb-h,16,4);mx.fillStyle=tint('#4a8a3a');mx.fillRect(x-6,mb-h+4,3,h*.5);}
  else if(th===6){mx.fillStyle=tint('#9a7a5a');mx.beginPath();mx.moveTo(x-18,mb-h);mx.lineTo(x+18,mb-h);mx.lineTo(x,mb-h+18);mx.fill();mx.fillStyle=tint(P.mid);mx.fillRect(x-18,mb-h-3,36,4);}
  else {mx.fillStyle=tint(P.mid);mx.beginPath();mx.moveTo(x-6,mb);mx.lineTo(x,mb-h);mx.lineTo(x+6,mb);mx.fill();mx.fillStyle=P.ac;mx.globalAlpha=.6;mx.fillRect(x-1,mb-h+4,2,h-6);mx.globalAlpha=1;}};
 for(let i=0;i<11;i++){const x=(i*47+R()*20)%512;tree(x,26+R()*30);}
 mx.fillStyle=tint(shade(P.mid,-.1));for(let x=0;x<512;x++){const h=6+per(x,seed+3,[3,2,1]);mx.fillRect(x,mb-h,1,VH);}
 // dirt pattern 16x16
 const [pat,px]=mk(16,16);px.fillStyle=P.dirt;px.fillRect(0,0,16,16);px.fillStyle=P.dk;
 if(th===4||th===5||th===6){px.fillRect(0,7,16,1);px.fillRect(0,15,16,1);px.fillRect(7,0,1,7);px.fillRect(15,8,1,7);px.fillStyle=shade(P.dirt,.12);px.fillRect(1,1,5,1);px.fillRect(9,9,5,1);}
 else for(let i=0;i<10;i++){px.fillRect((R()*15)|0,(R()*15)|0,2,1+(R()<.4));}
 if(th===7||th===3){px.fillStyle=P.ac;px.fillRect(3,5,1,2);px.fillRect(11,12,2,1);}
 return{sky,deco,far,mid,pat,P,tint,variant};}
// ---------- sprite helpers (draw into low-res ctx) ----------
const HERO=[{hair:'#3a2414',band:'#e8322a',skin:'#f2b98a',vest:'#2f6fd8',vest2:'#1f4aa0',pants:'#3a4a5a',boot:'#2a1a12',gun:'#5a6a7a'},
            {hair:'#1a1a2a',band:'#9a4aff',skin:'#e8a878',vest:'#ff8a2a',vest2:'#c8601a',pants:'#3a3a5a',boot:'#2a1a2a',gun:'#6a5a8a'}];
function drawHero(x,y,h,st){ // x,y = feet center (screen coords); st:{face,aimX,aimY,crouch,air,run,t,inv,hero}
 const C=HERO[h||0];const f=st.face;x=Math.round(x);y=Math.round(y);
 if(st.inv>0&&((st.t*20)|0)%2)return;
 L.save();L.translate(x,y);if(f<0)L.scale(-1,1);
 const r=(c,a,b,w,hh)=>{L.fillStyle=c;L.fillRect(a,b,w,hh);};
 const cr=st.crouch?6:0,ph=st.run?(Math.floor(st.t*12)%4):0;
 // legs
 if(st.air){r(C.pants,-4,-8,3,4);r(C.pants,1,-9,3,4);r(C.boot,-5,-5,3,2);r(C.boot,2,-6,3,2);}
 else if(st.crouch){r(C.pants,-5,-5,4,3);r(C.pants,1,-5,4,3);r(C.boot,-6,-2,4,2);r(C.boot,2,-2,4,2);}
 else{const a=[0,2,0,-2][ph],b=-a;r(C.pants,-4+a*.5,-8,3,6);r(C.pants,1+b*.5,-8,3,6);r(C.boot,-5+a,-2,4,2);r(C.boot,1+b,-2,4,2);}
 const by=-16+cr+(st.air?-2:0)+(ph%2&&!st.air?-1:0);
 // body
 r(C.vest2,-4,by,8,8);r(C.vest,-4,by,7,7);r('#ffd84a',-4,by+6,8,1);r(C.vest2,-1,by+1,1,5);
 // head
 const hy=by-8;r(C.skin,-3,hy,7,7);r(C.hair,-4,hy-1,8,3);r(C.hair,-4,hy,2,5);
 if(h===1){r(C.hair,-7,hy+1,3,2);r(C.hair,-8,hy+3,2,3);}
 r(C.band,-4,hy+1,8,2);r(C.band,-6,hy+2,2,1);r(C.band,-7,hy+3,2,1);
 r('#ffffff',1,hy+3,2,2);r('#1a1a2a',2,hy+3,1,2);r('#c8785a',1,hy+6,2,1);
 // arm + blaster toward aim (aimX is already facing-relative positive)
 const ax=st.aimX*f>=0?Math.abs(st.aimX):Math.abs(st.aimX),ay=st.aimY;const sx=0,sy=by+3;
 L.save();L.translate(sx,sy);L.rotate(Math.atan2(ay,ax));r(C.skin,-1,-1,4,3);r(C.gun,2,-2,7,3);r('#9aa8b8',2,-2,7,1);r('#2a2a3a',8,-1,2,2);L.restore();
 L.restore();}
// robot enemies — friendly-looking toy robots that pop into bolts and stars
function drawBot(e,x,y,t){x=Math.round(x);y=Math.round(y);const r=(c,a,b,w,h)=>{L.fillStyle=c;L.fillRect(x+a,y+b,w,h);};
 const hit=e.flash>0;const B=hit?'#ffffff':e.col,D=hit?'#ffffff':shade(e.col,-.35),EY=e.eye||'#ffe84a';const f=e.face||-1;
 switch(e.type){
  case'runner':{const ph=Math.floor(t*10+e.id)%2;r(D,-5+(ph?1:0),-4,3,4);r(D,2-(ph?1:0),-4,3,4);r(B,-6,-14,12,10);r(D,-6,-6,12,2);r('#1a1a2a',-4+(f>0?2:0),-12,6,5);r(EY,-2+(f>0?2:0),-11,3,3);r(D,-1,-17,2,3);r(EY,-1,-18,2,1);break;}
  case'gunner':{r(D,-5,-5,4,5);r(D,1,-5,4,5);r(B,-7,-17,14,12);r(D,-7,-7,14,2);r('#1a1a2a',-5,-15,10,5);r(e.cd<.5?'#ff4a4a':EY,-3+(f>0?3:0),-14,4,3);
   L.save();L.translate(x,y-11);L.rotate(Math.atan2(e.ay||0,e.ax||f));L.fillStyle=D;L.fillRect(2,-2,10,4);L.fillStyle='#2a2a3a';L.fillRect(10,-1,3,2);L.restore();break;}
  case'turret':{r(D,-10,-6,20,6);r(B,-8,-12,16,7);L.fillStyle=B;L.beginPath();L.arc(x,y-11,7,Math.PI,0);L.fill();r('#1a1a2a',-3,-15,6,3);r(e.cd<.5?'#ff4a4a':EY,-1,-14,2,2);
   L.save();L.translate(x,y-12);L.rotate(Math.atan2(e.ay||0,e.ax||-1));L.fillStyle=D;L.fillRect(3,-2,11,4);L.fillStyle='#2a2a3a';L.fillRect(12,-2,3,4);L.restore();break;}
  case'drone':{const p=Math.floor(t*30)%2;r('#cfd8e8',-9+(p?2:0),-13,7,1);r('#cfd8e8',2-(p?2:0),-13,7,1);r(D,-1,-12,2,3);L.fillStyle=B;L.beginPath();L.ellipse(x,y-5,8,5,0,0,7);L.fill();r(D,-8,-4,16,2);r('#1a1a2a',-3,-8,6,4);r(EY,-1,-7,2,2);r(D,-1,0,2,2);break;}
  case'hopper':{const sq=e.onG?2:0;r('#9aa8b8',-3,-4+sq,1,4-sq);r('#9aa8b8',2,-4+sq,1,4-sq);r('#9aa8b8',-1,-5+sq,2,5-sq);L.fillStyle=B;L.beginPath();L.arc(x,y-10+sq,7,0,7);L.fill();r('#ffffff',-4,-14+sq,3,3);r('#ffffff',1,-14+sq,3,3);r('#1a1a2a',-3+(f>0?1:0),-13+sq,1,2);r('#1a1a2a',2+(f>0?1:0),-13+sq,1,2);r(D,-3,-8+sq,6,1);break;}
  case'brute':{const ph=Math.floor(t*6+e.id)%2;r(D,-9,-7,6,7+ph);r(D,3,-7,6,8-ph);r(B,-12,-28,24,21);r(D,-12,-10,24,3);r('#1a1a2a',-9,-25,18,7);r(e.cd<.6?'#ff4a4a':EY,-6+(f>0?4:0),-23,8,3);r(D,-15,-24,4,12);r(D,11,-24,4,12);r('#ffd84a',-4,-15,8,3);break;}
  case'crate':{r(hit?'#fff':'#b8803a',-8,-16,16,16);r(hit?'#fff':'#8a5a24',-8,-16,16,2);r(hit?'#fff':'#8a5a24',-8,-9,16,2);r(hit?'#fff':'#8a5a24',-8,-16,2,16);r(hit?'#fff':'#8a5a24',6,-16,2,16);r('#ffd84a',-2,-12,4,4);break;}
  case'pod':{const p=Math.floor(t*30)%2;r('#e8eef8',-12+(p?3:0),-16,9,1);r('#e8eef8',3-(p?3:0),-16,9,1);r('#7a8aa0',-1,-15,2,3);L.fillStyle=hit?'#fff':'#ff4a8a';L.beginPath();L.ellipse(x,y-6,11,7,0,0,7);L.fill();r('#ffffff',-7,-10,4,2);r('#ffd84a',-4,-9,8,7);L.fillStyle='#1a1a2a';L.font='bold 7px monospace';L.textAlign='center';L.fillText(e.drop==='heart'?'♥':e.drop==='shield'?'O':e.drop.toUpperCase(),x,y-3);break;}
 }}
// weapon pickup capsule
const WCOL={b:'#ffe84a',s:'#ff5a5a',l:'#4ad8ff',r:'#ffa22a',f:'#ff7a1a',h:'#c86aff',heart:'#ff4a7a',shield:'#5affb0'};
function drawPick(p,x,y,t){x=Math.round(x);y=Math.round(y+Math.sin(t*5)*1.5);const c=WCOL[p.k]||'#fff';
 L.fillStyle='rgba(0,0,0,.35)';L.fillRect(x-6,y+1,12,2);L.fillStyle=shade(c,-.4);L.fillRect(x-7,y-12,14,12);L.fillStyle=c;L.fillRect(x-6,y-11,12,10);L.fillStyle='#fff';L.fillRect(x-5,y-10,4,2);
 L.fillStyle='#1a1a2a';if(p.k==='heart'){L.fillRect(x-3,y-8,2,2);L.fillRect(x+1,y-8,2,2);L.fillRect(x-4,y-7,8,2);L.fillRect(x-3,y-5,6,1);L.fillRect(x-2,y-4,4,1);L.fillRect(x-1,y-3,2,1);}
 else if(p.k==='shield'){L.fillRect(x-3,y-9,6,1);L.fillRect(x-4,y-8,1,4);L.fillRect(x+3,y-8,1,4);L.fillRect(x-3,y-4,6,1);}
 else{L.font='bold 8px monospace';L.textAlign='center';L.fillText(p.k.toUpperCase(),x,y-3);}}
function drawCoin(x,y,t){x=Math.round(x);y=Math.round(y);const w=Math.max(1,Math.round(Math.abs(Math.cos(t*4))*3));L.fillStyle='#c88a10';L.fillRect(x-w-1,y-4,w*2+2,8);L.fillStyle='#ffd84a';L.fillRect(x-w,y-3,w*2,6);L.fillStyle='#fff8c0';L.fillRect(x-w,y-3,1,2);}
// ---------- bosses ----------
const BOSS=[
 {n:'Thornclaw',move:'walk',w:64,h:44,col:'#e8503a',atk:['fan','shock','lob','fan']},
 {n:'Drillworm',move:'emerge',w:34,h:70,col:'#c8a040',atk:['ring','rain']},
 {n:'Frostbyte',move:'hop',w:50,h:52,col:'#e8f4ff',atk:['lob','rain','fan']},
 {n:'Magmaw',move:'walk',w:62,h:58,col:'#6a3a2a',atk:['rain','fan','shock','lob']},
 {n:'Neon Vortex',move:'hover',w:70,h:34,col:'#3a2aa8',atk:['beam','burst','minion','burst']},
 {n:'Totem Titan',move:'stand',w:40,h:84,col:'#8a7a4a',atk:['tri','beam','lob','tri']},
 {n:'Thunder Blimp',move:'hover',w:84,h:40,col:'#5a6a9a',atk:['bombs','minion','beam','bombs']},
 {n:'Prism Spider',move:'ceil',w:56,h:34,col:'#9a5aff',atk:['rain','ring','drop','fan']}];
function bossTint(i,cyc){const hue=[0,40,200,330,100,170][cyc%6];return hue?`hue-rotate(${hue}deg)`:'none';}
function drawBoss(b,x,y,t){ // x,y = center bottom of boss body (screen)
 x=Math.round(x);y=Math.round(y);const D=BOSS[b.i],w=D.w,h=D.h,fl=b.flash>0;const col=fl?'#ffffff':b.col,dk=fl?'#ffffff':shade(b.col,-.4),lt=fl?'#ffffff':shade(b.col,.3);
 const r=(c,a,bb,ww,hh)=>{L.fillStyle=c;L.fillRect(x+a,y+bb,ww,hh);};const el=(c,a,bb,rx,ry,rot)=>{L.fillStyle=c;L.beginPath();L.ellipse(x+a,y+bb,rx,ry,rot||0,0,7);L.fill();};
 const eye=(a,bb,s)=>{r('#ffffff',a-s,bb-s,s*2,s*2);r(b.rage?'#ff3a3a':'#1a1a2a',a-s/2+Math.round(Math.sign(b.lookX||-1)*s/3),bb-s/2,s,s);};
 switch(b.i){
  case 0:{const ph=Math.sin(t*10);for(let k=0;k<3;k++){r(dk,-26+k*7,-12+(k%2?ph:-ph)*2,3,12);r(dk,18-k*7,-12+(k%2?-ph:ph)*2,3,12);}
   el(dk,0,-20,34,15);el(col,0,-22,32,14);el(lt,-8,-28,14,5);for(let k=-3;k<=3;k++){L.fillStyle=dk;L.beginPath();L.moveTo(x+k*8-3,y-33+Math.abs(k));L.lineTo(x+k*8,y-42+Math.abs(k)*2);L.lineTo(x+k*8+3,y-33+Math.abs(k));L.fill();}
   const cl=b.slam>0?8:0;el(dk,-38,-18+cl,13,9,.3);el(col,-38,-19+cl,11,7,.3);r(col,-50,-28+cl,8,6);r(dk,-48,-22+cl,10,2);el(dk,38,-18+cl,13,9,-.3);el(col,38,-19+cl,11,7,-.3);r(col,42,-28+cl,8,6);
   r(dk,-12,-44,2,10);r(dk,10,-44,2,10);eye(-11,-46,4);eye(11,-46,4);r('#3a3a4a',-4,-40,8,6);r('#1a1a2a',-3,-44,6,4);break;}
  case 1:{if(b.hidden)break;const segs=6;for(let k=segs;k>=0;k--){const sy=-k*10,sx=Math.sin(t*3+k*.7)*3;el(k%2?dk:col,sx,sy-6,16-k*.6,7);el(lt,sx-5,sy-8,4,2);}
   const hy=-segs*10-14;el(col,0,hy+8,17,12);r('#5a5a6a',-16,hy+2,32,5);eye(-7,hy+4,4);eye(7,hy+4,4);
   L.fillStyle=fl?'#fff':'#c0c8d8';L.beginPath();L.moveTo(x-12,hy-2);L.lineTo(x,hy-26);L.lineTo(x+12,hy-2);L.fill();L.fillStyle='#7a8498';for(let k=0;k<4;k++)L.fillRect(x-9+k*2,hy-4-k*5,18-k*4,2);break;}
  case 2:{const sq=b.onG?0:-2;el(dk,0,-22+sq,26,24);el(col,0,-24+sq,24,22);for(let k=0;k<8;k++)el(lt,-20+k*6,-40+sq+(k%2)*3,4,4);
   r('#3a4a6a',-16,-36+sq,32,10);r(b.rage?'#ff5a5a':'#5af0ff',-14,-34+sq,28,4);r(col,-34,-30+sq,10,18);r(col,24,-30+sq,10,18);r(dk,-36,-14+sq,12,6);r(dk,24,-14+sq,12,6);r(dk,-14,-4,10,4);r(dk,4,-4,10,4);r('#ffffff',-6,-20+sq,12,3);break;}
  case 3:{const ph=Math.floor(t*4)%2;r(dk,-22,-12,14,12+ph);r(dk,8,-12,14,13-ph);el(dk,0,-32,30,24);el(col,0,-34,28,22);
   L.strokeStyle=fl?'#fff':'#ff8a20';L.lineWidth=2;L.beginPath();L.moveTo(x-18,y-48);L.lineTo(x-8,y-36);L.lineTo(x-14,y-22);L.moveTo(x+16,y-50);L.lineTo(x+6,y-38);L.lineTo(x+14,y-24);L.stroke();
   r(col,-40,-46,14,24);r(col,26,-46,14,24);el(dk,-33,-20,8,6);el(dk,33,-20,8,6);r('#ffcf3a',-12,-48,8,5);r('#ffcf3a',4,-48,8,5);r('#ff5a1a',-8,-36,16,4+Math.sin(t*8)*2);break;}
  case 4:{const bob=Math.sin(t*3)*2;el('rgba(0,0,0,.0)',0,0,1,1);el(dk,0,-14+bob,36,10);el(col,0,-16+bob,34,9);el(lt,0,-24+bob,18,8);r('#1a1a2a',-12,-28+bob,24,6);eye(-6,-25+bob,3);eye(6,-25+bob,3);
   for(let k=0;k<6;k++)r(['#ff4ad8','#2affe8','#ffe84a'][k%3],-30+k*11,-15+bob,6,2);L.globalAlpha=.6;L.fillStyle='#2affe8';L.fillRect(x-20,y-6+bob,8,4+Math.sin(t*20)*2);L.fillRect(x+12,y-6+bob,8,4+Math.cos(t*20)*2);L.globalAlpha=1;
   r(dk,-40,-18+bob,8,4);r(dk,32,-18+bob,8,4);break;}
  case 5:{for(let k=0;k<3;k++){const hy=-k*28,alive=!b.parts||b.parts[k]>0,c=alive?(fl?'#fff':[col,shade(b.col,.15),shade(b.col,-.15)][k]):'#4a4438';
    r(shade(c,-.3),-20,hy-28,40,28);r(c,-18,hy-26,36,24);r(shade(c,.2),-18,hy-26,36,3);
    if(alive){r('#1a1a2a',-12,hy-20,8,6);r('#1a1a2a',4,hy-20,8,6);r(b.rage?'#ff4a4a':'#4adc6a',-10,hy-18,4,3);r(b.rage?'#ff4a4a':'#4adc6a',6,hy-18,4,3);r('#1a1a2a',-8,hy-10,16,4);for(let q=0;q<4;q++)r('#ffffff',-7+q*4,hy-10,2,2);}
    else{r('#2a2620',-10,hy-18,6,2);r('#2a2620',4,hy-18,6,2);}
    r(dk,-24,hy-22,4,12);r(dk,20,hy-22,4,12);}
   r('#ffd84a',-8,-92,16,6);break;}
  case 6:{const bob=Math.sin(t*2)*3;el(dk,0,-26+bob,44,17);el(col,0,-28+bob,42,15);el(lt,-10,-35+bob,24,5);for(let k=-2;k<=2;k++)r(dk,k*14-1,-42+bob,2,28);
   L.fillStyle=dk;L.beginPath();L.moveTo(x+38,y-30+bob);L.lineTo(x+52,y-44+bob);L.lineTo(x+52,y-14+bob);L.fill();r('#3a3a4a',-16,-12+bob,32,10);r('#ffe84a',-12,-10+bob,4,4);r('#ffe84a',-4,-10+bob,4,4);r('#ffe84a',4,-10+bob,4,4);
   const p=Math.floor(t*30)%2;r('#cfd8e8',-48,-38+bob+(p?0:6),3,10);r('#cfd8e8',-46,-28+bob,2,2);eye(-30,-28+bob,4);
   if(b.rage){L.strokeStyle='#ffff6a';L.lineWidth=1;L.beginPath();L.moveTo(x-20,y-44+bob);L.lineTo(x-14,y-50+bob);L.lineTo(x-18,y-52+bob);L.lineTo(x-10,y-60+bob);L.stroke();}break;}
  case 7:{const ph=Math.sin(t*8),inv=b.ceil?-1:1;for(let k=0;k<4;k++){const lx=10+k*6,ly=(k%2?ph:-ph)*3;L.strokeStyle=fl?'#fff':dk;L.lineWidth=2;L.beginPath();L.moveTo(x-6,y-16);L.lineTo(x-lx-8,y-26-ly);L.lineTo(x-lx-14,y-ly*.5);L.moveTo(x+6,y-16);L.lineTo(x+lx+8,y-26+ly);L.lineTo(x+lx+14,y+ly*.5);L.stroke();}
   L.fillStyle=col;L.beginPath();L.moveTo(x,y-34);L.lineTo(x+20,y-18);L.lineTo(x,y-4);L.lineTo(x-20,y-18);L.fill();L.fillStyle=lt;L.beginPath();L.moveTo(x,y-34);L.lineTo(x+20,y-18);L.lineTo(x,y-20);L.fill();
   L.fillStyle=fl?'#fff':'#4af6ff';L.globalAlpha=.8;L.fillRect(x-1,y-30,2,22);L.globalAlpha=1;eye(-6,-18,3);eye(6,-18,3);r('#ff4ad8',-2,-12,4,2);if(b.ceil){r('#e8e8ff',-1,-200,1,166);}break;}
 }}
// small themed ground decorations in front of the mid layer (deterministic per column)
function drawDeco(th,x,y,n,tint){const v=hsh(n*31+th)*10|0;if(v>3)return;L.fillStyle=tint(TH[th].mid);
 switch(th){case 0:L.fillStyle=tint('#2f9f3a');L.fillRect(x+2,y-5,9,5);L.fillRect(x+4,y-7,5,2);if(v===1){L.fillStyle='#ff5a8a';L.fillRect(x+6,y-8,2,2);}break;
  case 1:L.fillStyle=tint('#a07040');L.fillRect(x+3,y-4,8,4);L.fillRect(x+5,y-6,4,2);break;
  case 2:L.fillStyle=tint('#ffffff');L.fillRect(x+2,y-3,11,3);L.fillStyle=tint('#cfe0ff');L.fillRect(x+4,y-5,6,2);break;
  case 3:L.fillStyle='#ff6a1a';L.fillRect(x+4,y-2,6,2);L.fillStyle='#ffcf3a';L.fillRect(x+6,y-3,2,1);break;
  case 4:L.fillStyle=tint('#6a6a9a');L.fillRect(x+6,y-22,2,22);L.fillStyle='#ffe84a';L.fillRect(x+4,y-24,6,2);L.globalAlpha=.2;L.fillRect(x+1,y-26,12,6);L.globalAlpha=1;break;
  case 5:L.fillStyle=tint('#8a8a6a');L.fillRect(x+3,y-8,8,8);L.fillStyle=tint('#4a9a3a');L.fillRect(x+3,y-8,8,2);break;
  case 6:L.fillStyle=tint('#ffffff');L.fillRect(x+1,y-3,12,3);L.fillRect(x+3,y-5,7,2);break;
  case 7:L.fillStyle=TH[7].ac;L.fillRect(x+5,y-7,2,7);L.fillRect(x+3,y-4,2,4);L.fillRect(x+8,y-5,2,5);break;}}
