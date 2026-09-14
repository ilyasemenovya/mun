const navigation = document.querySelector('#site-nav');
const navToggle = document.querySelector('.nav-toggle');
function closeNavigation() {
  navigation?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Открыть навигацию');
}
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navigation?.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Закрыть навигацию' : 'Открыть навигацию');
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNavigation(); });
const bookingDialog = document.querySelector('#booking-dialog');
const bookingTitle = document.querySelector('#booking-title');
const bookingDescription = document.querySelector('#booking-description');
const bookingCopy = {
 table: ['Договоримся о встрече.', 'Сообщите дату, время и количество гостей. Менеджер проверит наличие мест и подтвердит бронь.'],
 karaoke: ['Планируем караоке.', 'Уточните программу на выбранную дату, время начала и наличие столов. Менеджер поможет спланировать вечер.'],
 event: ['Обсудим ваш повод.', 'Напишите дату, повод и примерное количество гостей. Обсудим размещение, меню и условия мероприятия.'],
 delivery: ['МУН к вашему столу.', 'Сообщите блюда, количество порций, адрес и желаемое время. Сотрудник подтвердит доступные позиции, сумму и возможность доставки.'],
 pickup: ['Забрать в МУН.', 'Сообщите блюда, количество порций и удобное время. Сотрудник подтвердит сумму и время готовности. Адрес самовывоза: Льва Толстого, 3, 3 этаж.']
};
document.querySelectorAll('[data-booking]').forEach(link => link.addEventListener('click', event => {
 if (!bookingDialog || typeof bookingDialog.showModal !== 'function') return;
 event.preventDefault();
 const [title, description] = bookingCopy[link.dataset.booking] || bookingCopy.table;
 bookingTitle.textContent = title; bookingDescription.textContent = description;
 const isOrder = ['delivery', 'pickup'].includes(link.dataset.booking);
 bookingDialog.querySelector('.eyebrow').textContent = isOrder ? 'МУН / Заказ с собой' : 'МУН / Бронирование';
 bookingDialog.querySelector('.dialog-note').textContent = isOrder ? 'Заказ принят только после подтверждения сотрудником.' : 'Бронь действует после подтверждения менеджером.';
 closeNavigation(); bookingDialog.showModal(); document.body.classList.add('modal-open');
}));
bookingDialog?.querySelector('.dialog-close')?.addEventListener('click', () => bookingDialog.close());
bookingDialog?.addEventListener('close', () => document.body.classList.remove('modal-open'));
bookingDialog?.addEventListener('click', event => {
 if (event.target !== bookingDialog) return;
 const b = bookingDialog.getBoundingClientRect();
 if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) bookingDialog.close();
});
const menuSections = document.querySelectorAll('.menu-panel');
function showMenu() {
 if (!menuSections.length) return;
 const active = window.location.hash === '#bar' ? 'bar' : 'kitchen';
 menuSections.forEach(section => { section.hidden = section.id !== active; });
 document.querySelectorAll('[data-menu-tab]').forEach(link => link.setAttribute('aria-current', String(link.dataset.menuTab === active)));
}
window.addEventListener('hashchange', showMenu); showMenu();

const photoDialog = document.querySelector('#photo-dialog');
const photos = [...document.querySelectorAll('[data-gallery]')];
let activePhoto = 0;
function showPhoto(index) {
 if (!photoDialog || !photos.length) return;
 activePhoto = (index + photos.length) % photos.length;
 const link = photos[activePhoto];
 const image = photoDialog.querySelector('#photo-image');
 image.src = link.href;
 image.alt = link.querySelector('img').alt;
 photoDialog.querySelector('#photo-caption').textContent = link.dataset.caption;
 photoDialog.querySelector('#photo-counter').textContent = `${activePhoto + 1} / ${photos.length}`;
}
photos.forEach((link, index) => link.addEventListener('click', event => {
 if (!photoDialog || typeof photoDialog.showModal !== 'function') return;
 event.preventDefault();
 showPhoto(index);
 photoDialog.showModal();
 document.body.classList.add('modal-open');
}));
photoDialog?.querySelector('.dialog-close')?.addEventListener('click', () => photoDialog.close());
photoDialog?.addEventListener('close', () => document.body.classList.remove('modal-open'));
photoDialog?.querySelector('#photo-prev')?.addEventListener('click', () => showPhoto(activePhoto - 1));
photoDialog?.querySelector('#photo-next')?.addEventListener('click', () => showPhoto(activePhoto + 1));
photoDialog?.addEventListener('keydown', event => {
 if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
  event.preventDefault();
  showPhoto(activePhoto + (event.key === 'ArrowLeft' ? -1 : 1));
 }
});
photoDialog?.addEventListener('click', event => {
 if (event.target !== photoDialog) return;
 const bounds = photoDialog.getBoundingClientRect();
 if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close();
});
