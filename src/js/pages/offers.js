/** Offers: the live site's current promotions, each with a real next step. */
import { ready } from '../app.js';
import { qs, html, toHTML, icon, esc } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes, localizeLinks } from '../core/routes.js';
import { PRODUCTION } from '../core/env.js';
import { getOffers } from '../data/api.js';
import { createDialog } from '../components/dialog.js';

/* Next step for each promotion (all targets exist in the catalog). */
const ACTIONS = {
  'vzryv-emocij': [{ label: 'Смотреть комплекты', href: () => routes.category('komplekty'), primary: true }],
  'skidki-na-konfetti-puski-i-stvoly-do-konca-marta': [
    { label: 'Конфетти-пушки', href: () => routes.categoryFiltered('konfetti-masiny', { type: 'Конфетти-пушки' }), primary: true },
    { label: 'Одноразовые стволы', href: () => routes.category('stvoly') },
  ],
  'free-samples-snow': [
    { label: 'Заказать образцы', samples: true, primary: true },
    { label: 'Весь искусственный снег', href: () => routes.category('iskusstvennyj-sneg') },
  ],
  'poluci-skidku-za-foto-ili-video': [{ label: 'Отправить фото или видео', href: () => 'mailto:info@globaleffects.ru', primary: true }],
};

ready(async () => {
  const list = qs('[data-offers]');
  const offers = await getOffers();

  list.innerHTML = offers
    .map((o, i) =>
      toHTML(html`<li class="promo" id="${o.slug}" data-reveal>
        <figure class="promo__media">
          <img src="${o.image}" alt="" width="570" height="500" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" />
          <span class="promo__num tabular" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        </figure>
        <div class="promo__body">
          <p class="eyebrow">Акция ${String(i + 1).padStart(2, '0')}</p>
          <h2 class="promo__title">${o.title}</h2>
          <div class="prose" data-promo-body="${i}"></div>
          <div class="promo__actions">
            ${(ACTIONS[o.slug] || []).map((a) =>
              a.samples
                ? PRODUCTION
                  ? html`<a class="btn btn--primary btn--lg" href="/offers/free-samples"><span class="btn__label">${a.label}</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 20)}</span></a>`
                  : html`<button type="button" class="btn btn--primary btn--lg" data-samples aria-haspopup="dialog"><span class="btn__label">${a.label}</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 20)}</span></button>`
                : a.primary
                  ? html`<a class="btn btn--primary btn--lg" href="${a.href()}"><span class="btn__label">${a.label}</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 20)}</span></a>`
                  : html`<a class="btn btn--ghost" href="${a.href()}"><span class="btn__label">${a.label}</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>`,
            )}
          </div>
        </div>
      </li>`),
    )
    .join('');

  offers.forEach((o, i) => {
    const body = qs(`[data-promo-body="${i}"]`, list);
    body.innerHTML = o.body; // sanitized at build time (tools/)
    localizeLinks(body);
  });
  list.removeAttribute('aria-busy');

  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-samples]');
    if (b) openSamplesForm(b);
  });
  reveal();
});

/**
 * Mirrors the EXISTING form /offers/free-samples (FreeSamplesOfferForm[...],
 * Yandex SmartCaptcha on submit). Prototype only: validated, not sent.
 */
let dialog;
function openSamplesForm(trigger) {
  dialog ||= createDialog({ className: 'dlg--form', labelledBy: 'fs-title' });
  const f = (name) => `FreeSamplesOfferForm[${name}]`;
  const field = (id, label, { type = 'text', required = true, auto = '', area = false } = {}) => `
    <div class="field">
      <label class="field__label" for="fs-${id}">${label}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
      ${area
        ? `<textarea class="field__input field__input--area" id="fs-${id}" name="${f(id)}" rows="3"></textarea>`
        : `<input class="field__input" id="fs-${id}" name="${f(id)}" type="${type}" ${auto ? `autocomplete="${auto}"` : ''} ${required ? 'required' : ''} aria-describedby="fs-${id}-err">`}
      <p class="field__error" id="fs-${id}-err"></p>
    </div>`;

  dialog.setContent(`
    <div class="dlg__panel">
      <button type="button" class="dlg__close icon-btn" data-dialog-close aria-label="Закрыть">${toHTML(icon('i-close', 22))}</button>
      <p class="eyebrow">Бесплатные образцы</p>
      <h2 class="dlg__title h3" id="fs-title">Образцы снега и конфетти</h2>
      <p class="dlg__intro text-2">Отправим комплект за наш счёт в любой город России СДЭКом до терминала.</p>
      <div class="form-summary" role="alert" tabindex="-1" hidden></div>
      <form class="form" action="/offers/free-samples" method="post" novalidate>
        ${field('name', 'Фамилия Имя', { auto: 'name' })}
        ${field('organization', 'Организация', { auto: 'organization' })}
        <div class="form__row">
          ${field('phone', 'Телефон', { type: 'tel', auto: 'tel' })}
          ${field('email', 'Email', { type: 'email', auto: 'email' })}
        </div>
        ${field('city', 'Город', { auto: 'address-level2' })}
        ${field('cdekTerminalAddress', 'Адрес терминала СДЭК (если необходимо)', { required: false, area: true })}
        <label class="check check--form"><input type="checkbox" name="${f('isStandardBundle')}" value="1" checked><span class="check__box" aria-hidden="true"></span><span class="check__label">Стандартный комплект (Изморозь, Снегопад, Шорох, Хлопья, Пепел, Конфетти 10х10мм)</span></label>
        ${field('additionalSamples', 'Дополнительные образцы', { required: false, area: true })}
        <label class="check check--form"><input type="checkbox" id="fs-agreement" name="${f('agreement')}" value="1" required><span class="check__box" aria-hidden="true"></span><span class="check__label">Я согласен на обработку персональных данных <span aria-hidden="true">*</span></span></label>
        <p class="field__error" id="fs-agreement-err"></p>
        <p class="form__legal text-3">Данные нужны для оформления документов по отгрузке и не передаются третьим лицам. <a href="${routes.page('/page/politika-konfidencialnosti')}">Политика конфиденциальности</a>.</p>
        <button type="submit" class="btn btn--primary btn--lg"><span class="btn__label">Отправить заявку</span><span class="btn__icon" aria-hidden="true">${toHTML(icon('i-arrow', 20))}</span></button>
        <p class="proto-note" role="note">Прототип: на сайте заявка уходит в существующий обработчик <code>/offers/free-samples</code> с проверкой Яндекс SmartCaptcha.</p>
      </form>
    </div>`);

  const form = qs('form', dialog.el);
  const summary = qs('.form-summary', dialog.el);
  const MSG = {
    name: 'Укажите фамилию и имя.',
    organization: 'Укажите организацию.',
    phone: 'Укажите телефон в формате +7 900 000-00-00.',
    email: 'Укажите e-mail, например name@company.ru.',
    city: 'Укажите город доставки.',
    agreement: 'Без согласия мы не сможем оформить отправку.',
  };
  const check = (input) => {
    const key = input.id.replace('fs-', '');
    let ok = input.type === 'checkbox' ? input.checked : input.value.trim().length > 0;
    if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    if (ok && input.type === 'tel') ok = input.value.replace(/\D/g, '').length >= 10;
    input.setAttribute('aria-invalid', String(!ok));
    const err = document.getElementById(`${input.id}-err`);
    if (err) err.textContent = ok ? '' : MSG[key];
    return ok;
  };
  const required = [...form.querySelectorAll('[required]')];
  required.forEach((i) => i.addEventListener('blur', () => (i.value || i.type === 'checkbox') && check(i)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = required.filter((i) => !check(i));
    if (bad.length) {
      summary.hidden = false;
      summary.innerHTML = `<p>Проверьте поля:</p><ul>${bad.map((i) => `<li><a href="#${i.id}">${esc(MSG[i.id.replace('fs-', '')])}</a></li>`).join('')}</ul>`;
      summary.focus();
      return;
    }
    form.innerHTML = `<div class="form-done" role="status">${toHTML(icon('i-check', 28))}
      <p class="h3">Данные проверены</p>
      <p class="text-2">В прототипе нет сервера, поэтому заявка не отправлена. На сайте её примет обработчик <code>/offers/free-samples</code>.</p>
      <button type="button" class="btn btn--secondary btn--md" data-dialog-close><span class="btn__label">Закрыть</span></button></div>`;
  });
  summary.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.hash.slice(1))?.focus();
  });
  dialog.show(trigger);
}
