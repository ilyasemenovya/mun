const dates=[18,19,23,24,25,26,27,29];
const dateSelect=document.querySelector('#date');
const grid=document.querySelector('.date-grid');
for(const day of dates){
 const value=`2026-12-${day}`;
 const weekday=new Intl.DateTimeFormat('ru',{weekday:'short',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));
 const button=document.createElement('button');button.type='button';button.dataset.date=value;button.setAttribute('aria-label',`${day} декабря 2026`);button.setAttribute('aria-pressed','false');
 const number=document.createElement('strong');number.textContent=day;const label=document.createElement('span');label.textContent=weekday;button.append(number,label);grid.append(button);
 dateSelect.add(new Option(`${day} декабря`,value));
 button.addEventListener('click',()=>{dateSelect.value=dateSelect.value===value?'':value;syncDates();});
}
dateSelect.add(new Option('Другая дата — обсудим','other'));
function syncDates(){for(const button of grid.children)button.setAttribute('aria-pressed',String(button.dataset.date===dateSelect.value));}
dateSelect.addEventListener('change',syncDates);
for(const link of document.querySelectorAll('[data-hall]'))link.addEventListener('click',()=>{document.querySelector('#hall').value=link.dataset.hall;});
document.querySelector('form').addEventListener('submit',event=>event.preventDefault());

const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const snowLayer=document.createElement('div');
snowLayer.className='snowfall';
snowLayer.setAttribute('aria-hidden','true');
for(let i=0;i<36;i++){
 const flake=document.createElement('span');
 flake.className='snowflake';
 flake.style.cssText=`--x:${Math.random()*100}%;--size:${2+Math.random()*3}px;--opacity:${.18+Math.random()*.32};--duration:${12+Math.random()*12}s;--delay:-${Math.random()*24}s;--drift:${Math.random()*90-45}px`;
 snowLayer.append(flake);
}
document.body.append(snowLayer);
const snowToggle=document.querySelector('.snow-toggle');
let snowEnabled=true;
function updateSnow(){
 snowLayer.hidden=!snowEnabled||motionPreference.matches;
 snowLayer.classList.toggle('is-paused',document.hidden||snowLayer.hidden);
 snowToggle.hidden=motionPreference.matches;
 snowToggle.setAttribute('aria-pressed',String(snowEnabled));
 snowToggle.textContent=snowEnabled?'Снег: вкл.':'Снег: выкл.';
}
snowToggle.addEventListener('click',()=>{snowEnabled=!snowEnabled;updateSnow();});
motionPreference.addEventListener('change',updateSnow);
document.addEventListener('visibilitychange',updateSnow);
updateSnow();
