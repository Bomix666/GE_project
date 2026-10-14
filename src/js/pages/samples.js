/**
 * «Бесплатные образцы»: the offer (/offers/free-samples-snow) and its form (/offers/free-samples) on one page.
 * The form mirrors the EXISTING Yii form 1:1:
 *   POST /offers/free-samples   FreeSamplesOfferForm[...]   Yandex SmartCaptcha (invisible) → yaCaptcha
 * Production: native POST, server-side validation and captcha stay authoritative.
 * Prototype: submission is intercepted (no backend) and explained.
 */
import { ready } from '../app.js';
import { qs, esc } from '../core/dom.js';
import { PRODUCTION, ORIGIN } from '../core/env.js';
import { reveal } from '../core/motion.js';
import { fitAll } from '../core/fit.js';
import { routes } from '../core/routes.js';
import { wireValidation } from '../components/request-form.js';

const ACTION = '/offers/free-samples';
const SITEKEY = 'ysc1_NbFmeRbannGwfE5IYRJ8phLDYD5WgOB5Bhbx1PZBc3a5fc4a'; // public key of the live form's captcha
const n = (name) => `FreeSamplesOfferForm[${name}]`;
const id = (name) => `freesamplesofferform-${name.toLowerCase()}`;
const page = (slug) => (PRODUCTION ? '' : ORIGIN) + `/page/${slug}`;

const input = (name, label, attrs = '') => `<div class="field">
    <label class="field__label" for="${id(name)}">${label}${attrs.includes('required') ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <input class="field__input" id="${id(name)}" name="${n(name)}" ${attrs} aria-describedby="${id(name)}-err">
    <p class="field__error" id="${id(name)}-err"></p>
  </div>`;
const area = (name, label, hint = '') => `<div class="field">
    <label class="field__label" for="${id(name)}">${label}</label>
    ${hint ? `<p class="field__hint text-3" id="${id(name)}-hint">${hint}</p>` : ''}
    <textarea class="field__input field__input--area" id="${id(name)}" name="${n(name)}" rows="3"${hint ? ` aria-describedby="${id(name)}-hint"` : ''}></textarea>
  </div>`;
// a checkbox posts 0 when unchecked, as the Yii field does
const check = (name, label, attrs = '') => `<div class="field">
    <input type="hidden" name="${n(name)}" value="0">
    <label class="check" for="${id(name)}"><input type="checkbox" id="${id(name)}" name="${n(name)}" value="1" ${attrs} aria-describedby="${id(name)}-err"><span class="check__box" aria-hidden="true"></span><span class="check__label">${label}</span></label>
    <p class="field__error" id="${id(name)}-err"></p>
  </div>`;

ready(() => {
  const root = qs('[data-ed-root]');
  const csrf = qs('meta[name="csrf-token"]');
  const csrfParam = qs('meta[name="csrf-param"]');

  root.innerHTML = `<section class="ed-hero" aria-labelledby="ed-title"><div class="container">
      <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="${routes.home()}">Главная</a></li><li><span aria-current="page">Бесплатные образцы</span></li></ol></nav>
      <div class="ed-hero__grid">
        <h1 class="ed-hero__title" id="ed-title" data-reveal="mask" data-fit><span class="line"><span>Бесплатные</span></span><span class="line"><span class="accent">образцы</span></span></h1>
        <p class="lead text-2" data-reveal>Отправляем образцы снега и конфетти в любой город России!</p>
      </div>
    </div></section>
    <div class="container samples">
      <aside class="samples__about" aria-labelledby="samples-about" data-reveal>
        <h2 class="label" id="samples-about">Описание акции</h2>
        <div class="prose">
          <p>Мы отправим вам комплект образцов искусственного снега за наш счет в любой город России СДЭКом до терминала.</p>
          <p>Стандартный комплект включает: 4 вида искусственного снега нашего производства: «Изморозь», «Снегопад», «Хлопья», «Шорох», а также Черный крупный пепел и Бумажное конфетти 10х10мм Белое (Снежные хлопья).</p>
          <p>Также вы можете заказать дополнительно образцы конфетти по Вашему желанию.</p>
        </div>
      </aside>
      <div class="samples__form" data-reveal>
      <div class="form-summary" role="alert" tabindex="-1" hidden></div>
      <form class="form" action="${ACTION}" method="post" novalidate>
        ${csrf && csrfParam ? `<input type="hidden" name="${esc(csrfParam.content)}" value="${esc(csrf.content)}">` : ''}
        ${input('name', 'Фамилия Имя', 'type="text" autocomplete="name" required maxlength="255"')}
        ${input('organization', 'Организация', 'type="text" autocomplete="organization" required maxlength="255"')}
        <div class="form__row">
          ${input('phone', 'Телефон', 'type="tel" autocomplete="tel" inputmode="tel" required maxlength="30"')}
          ${input('email', 'Email', 'type="email" autocomplete="email" required maxlength="254"')}
        </div>
        ${input('city', 'Город', 'type="text" autocomplete="address-level2" required maxlength="255"')}
        ${area('cdekTerminalAddress', 'Адрес терминала СДЭК (если необходимо)')}
        ${check('isStandardBundle', 'Стандартный комплект <span class="text-3">(Изморозь, Снегопад, Шорох, Хлопья, Пепел, Конфетти 10х10мм)</span>')}
        ${area('additionalSamples', 'Дополнительные образцы')}
        ${check('agreement', 'Я согласен на обработку персональных данных', 'required')}
        <p class="form__legal text-3">Ваши данные нужны для оформления необходимых документов по отгрузке товара и не будут передаваться третьим лицам или использоваться каким-либо иным образом, кроме как для оформления данной сделки.</p>
        <p class="form__legal text-3"><a href="${page('politika-konfidencialnosti')}" target="_blank" rel="noopener">Политика конфиденциальности</a>&nbsp;&nbsp; <a href="${page('pravila-prodazi-tovarov')}" target="_blank" rel="noopener">Правила продажи</a></p>
        <input type="hidden" id="${id('yaCaptcha')}" name="${n('yaCaptcha')}">
        <div data-captcha-box></div>
        <button type="submit" class="btn btn--primary btn--lg samples__submit">
          <span class="btn__label">Отправить</span>
          <span class="btn__icon" aria-hidden="true"><svg width="20" height="20"><use href="#i-arrow"/></svg></span>
        </button>
        ${PRODUCTION ? '' : `<p class="proto-note" role="note">Прототип: в рабочей версии форма отправляется в существующий обработчик <code>${ACTION}</code> вместе с проверкой Яндекс SmartCaptcha.</p>`}
      </form>
      </div>
    </div>`;

  const form = qs('form', root);
  let widget;
  if (PRODUCTION) {
    // the live form's widget: invisible, the token goes to yaCaptcha, then the form posts
    window.geSamplesCaptcha = () => {
      widget = window.smartCaptcha.render(qs('[data-captcha-box]', form), {
        sitekey: SITEKEY,
        hl: 'ru',
        invisible: true,
        callback: (token) => {
          qs(`#${id('yaCaptcha')}`, form).value = token;
          form.submit();
        },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=geSamplesCaptcha';
    s.async = true;
    document.head.append(s);
  }

  wireValidation(form, qs('.form-summary', root), () => {
    if (PRODUCTION) {
      if (widget !== undefined) window.smartCaptcha.execute(widget);
      else form.submit(); // no captcha script: the server answers with its own captcha error
      return;
    }
    form.innerHTML = `<div class="form-done" role="status" tabindex="-1"><svg width="28" height="28" aria-hidden="true"><use href="#i-check"/></svg>
      <p class="h3">Данные проверены</p>
      <p class="text-2">В прототипе нет сервера, поэтому заявка не отправлена. На сайте её примет обработчик <code>${ACTION}</code>.</p></div>`;
    qs('.form-done', form).focus();
  });

  root.removeAttribute('aria-busy');
  reveal();
  fitAll();
});
