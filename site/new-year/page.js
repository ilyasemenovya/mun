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
