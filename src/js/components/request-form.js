/**
 * "Под заказ" / "Запросить цену" dialogs.
 *
 * Mirrors the EXISTING Yii ActiveForms 1:1 (field names, captcha actions):
 *   demand → POST /product/demand          DemandProductForm[...]
 *   price  → POST /product/price-request   PriceRequestForm[...]
 * Production: native POST, server-side validation/captcha stay authoritative.
 * Prototype: submission is intercepted (no backend) and explained.
 */
import { esc, qs, qsa } from '../core/dom.js';
import { PRODUCTION, ORIGIN } from '../core/env.js';
import { createDialog } from './dialog.js';

const FORMS = {
  demand: {
    model: 'DemandProductForm',
    action: '/product/demand',
    captcha: '/site/demand-captcha',
    title: 'Сообщить о поступлении',
    intro: 'Товар сейчас под заказ. Оставьте контакты — менеджер свяжется с вами, когда он появится на складе.',
    submit: 'Отправить заявку',
  },
  price: {
    model: 'PriceRequestForm',
    action: '/product/price-request',
    captcha: '/site/price-request-captcha',
    title: 'Запросить цену',
    intro: 'Оставьте контакты — менеджер отправит актуальную цену и условия поставки.',
    submit: 'Запросить цену',
  },
};

let dialog;

export function openRequestForm(kind, product, trigger) {
  const f = FORMS[kind];
  dialog ||= createDialog({ className: 'dlg--form', labelledBy: 'rf-title' });
  const csrf = qs('meta[name="csrf-token"]');
  const csrfParam = qs('meta[name="csrf-param"]');
  const id = (name) => `${f.model.toLowerCase()}-${name}`;
  const n = (name) => `${f.model}[${name}]`;
  const captchaSrc = `${f.captcha}?v=${Date.now()}`;

  dialog.setContent(`
    <div class="dlg__panel">
      <button type="button" class="dlg__close icon-btn" data-dialog-close aria-label="Закрыть"><svg width="22" height="22" aria-hidden="true"><use href="#i-close"/></svg></button>
      <p class="eyebrow">${esc(f.title)}</p>
      <h2 class="dlg__title h3" id="rf-title">${esc(product.name)}</h2>
      <p class="dlg__intro text-2">${esc(f.intro)}</p>

      <div class="form-summary" role="alert" tabindex="-1" hidden></div>

      <form class="form" action="${f.action}" method="post" novalidate>
        ${csrf && csrfParam ? `<input type="hidden" name="${esc(csrfParam.content)}" value="${esc(csrf.content)}">` : ''}
        <input type="hidden" name="${n('product_id')}" value="${product.id}">
        <div class="field">
          <label class="field__label" for="${id('name')}">ФИО <span aria-hidden="true">*</span></label>
          <input class="field__input" id="${id('name')}" name="${n('name')}" type="text" autocomplete="name" required maxlength="255" aria-describedby="${id('name')}-err" data-autofocus>
          <p class="field__error" id="${id('name')}-err"></p>
        </div>
        <div class="form__row">
          <div class="field">
            <label class="field__label" for="${id('phone')}">Телефон <span aria-hidden="true">*</span></label>
            <input class="field__input" id="${id('phone')}" name="${n('phone')}" type="tel" autocomplete="tel" inputmode="tel" required maxlength="30" aria-describedby="${id('phone')}-err">
            <p class="field__error" id="${id('phone')}-err"></p>
          </div>
          <div class="field">
            <label class="field__label" for="${id('email')}">E-mail <span aria-hidden="true">*</span></label>
            <input class="field__input" id="${id('email')}" name="${n('email')}" type="email" autocomplete="email" required maxlength="254" aria-describedby="${id('email')}-err">
            <p class="field__error" id="${id('email')}-err"></p>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="${id('message')}">Сообщение</label>
          <textarea class="field__input field__input--area" id="${id('message')}" name="${n('message')}" rows="4"></textarea>
        </div>
        <div class="field field--captcha">
          <label class="field__label" for="${id('verifycode')}">Проверочный код <span aria-hidden="true">*</span></label>
          <div class="captcha">
            ${PRODUCTION
              ? `<img class="captcha__img" src="${captchaSrc}" alt="Проверочный код — введите символы с картинки" width="120" height="50" data-captcha>
            <button type="button" class="captcha__refresh" data-captcha-refresh>Обновить код</button>`
              : '<span class="captcha__img captcha__img--proto" data-captcha>Код<br>с сайта</span>'}
            <input class="field__input" id="${id('verifycode')}" name="${n('verifyCode')}" type="text" autocomplete="off" required maxlength="32" aria-describedby="${id('verifycode')}-err">
          </div>
          <p class="field__error" id="${id('verifycode')}-err"></p>
        </div>
        <p class="form__legal text-3">Нажимая кнопку, вы соглашаетесь с <a href="${PRODUCTION ? '' : ORIGIN}/page/politika-konfidencialnosti" target="_blank" rel="noopener">политикой конфиденциальности</a>.</p>
        <button type="submit" class="btn btn--primary btn--md">
          <span class="btn__label">${esc(f.submit)}</span>
          <span class="btn__icon" aria-hidden="true"><svg width="18" height="18"><use href="#i-arrow"/></svg></span>
        </button>
        ${PRODUCTION ? '' : `<p class="proto-note" role="note">Прототип: в рабочей версии форма отправляется в существующий обработчик <code>${f.action}</code> вместе с проверочным кодом.</p>`}
      </form>
    </div>`);

  const form = qs('form', dialog.el);
  const summary = qs('.form-summary', dialog.el);
  const refresh = qs('[data-captcha-refresh]', dialog.el);
  if (refresh) {
    const img = qs('[data-captcha]', dialog.el);
    refresh.addEventListener('click', () => {
      img.src = `${f.captcha}?v=${Date.now()}`;
    });
  }

  wireValidation(form, summary, () => {
    if (PRODUCTION) {
      form.submit();
      return;
    }
    form.innerHTML = `<div class="form-done" role="status"><svg width="28" height="28" aria-hidden="true"><use href="#i-check"/></svg>
      <p class="h3">Данные проверены</p>
      <p class="text-2">В прототипе нет сервера, поэтому заявка не отправлена. На сайте её примет обработчик <code>${f.action}</code>.</p>
      <button type="button" class="btn btn--secondary btn--md" data-dialog-close><span class="btn__label">Закрыть</span></button></div>`;
  });

  dialog.show(trigger);
}

const MESSAGES = {
  name: 'Укажите имя — так менеджер поймёт, к кому обращаться.',
  phone: 'Укажите телефон в формате +7 900 000-00-00.',
  email: 'Укажите e-mail, например name@company.ru.',
  verifycode: 'Введите символы с картинки. Если их не видно — нажмите «Обновить код».',
};

function validateField(input) {
  const key = input.id.split('-').pop();
  let ok = input.value.trim().length > 0 && (input.maxLength < 0 || input.value.length <= input.maxLength);
  if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
  // a phone is digits with the usual separators, 10–15 digits (E.164); no words
  if (ok && input.type === 'tel') {
    const digits = input.value.replace(/\D/g, '').length;
    ok = /^[+\d\s()\-.]+$/.test(input.value.trim()) && digits >= 10 && digits <= 15;
  }
  const err = document.getElementById(`${input.id}-err`);
  input.setAttribute('aria-invalid', String(!ok));
  if (err) err.textContent = ok ? '' : MESSAGES[key] || 'Заполните поле.';
  return ok;
}

function wireValidation(form, summary, onValid) {
  const required = qsa('[required]', form);
  required.forEach((input) => {
    input.addEventListener('blur', () => input.value && validateField(input));
    input.addEventListener('input', () => input.getAttribute('aria-invalid') === 'true' && validateField(input));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = required.filter((input) => !validateField(input));
    if (invalid.length) {
      summary.hidden = false;
      summary.innerHTML = `<p>Проверьте ${invalid.length === 1 ? 'поле' : 'поля'}:</p><ul>${invalid
        .map((i) => `<li><a href="#${i.id}">${esc(form.querySelector(`label[for="${i.id}"]`).firstChild.textContent.trim())}</a></li>`)
        .join('')}</ul>`;
      summary.focus();
      return;
    }
    summary.hidden = true;
    onValid();
  });
  summary.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.hash.slice(1))?.focus();
  });
}
