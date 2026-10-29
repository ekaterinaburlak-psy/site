// Меню: кнопка-бургер открывает список разделов; на компьютере кнопка появляется после первого экрана.
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  var hero = document.getElementById('top');

  function setOpen(open) {
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.setAttribute('aria-hidden', String(!open));
  }

  toggle.addEventListener('click', function () { setOpen(!root.classList.contains('menu-open')); });
  // на телефоне меню открывают три линии в шапке каждого раздела
  document.querySelectorAll('.m-burger, .m-burger-hit').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); setOpen(true); }); });
  // пока меню открыто, прокрутка страницы заблокирована: сначала закрываем, потом едем к разделу
  menu.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.getAttribute('href') === '#close') { e.preventDefault(); setOpen(false); return; }
    var target = document.querySelector(link.getAttribute('href'));
    e.preventDefault();
    setOpen(false);
    if (target) {
      target.scrollIntoView();
      history.replaceState(null, '', link.getAttribute('href'));
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  // клик мимо окошка меню (по затемнению) закрывает его
  document.addEventListener('click', function (e) {
    if (root.classList.contains('menu-open') && !menu.contains(e.target) && !e.target.closest('.menu-toggle, .m-burger, .m-burger-hit')) setOpen(false);
  });

  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (entries) {
      toggle.classList.toggle('is-visible', !entries[0].isIntersecting);
    }).observe(hero);
  }
})();

// Частые вопросы: на компьютере место под список ограничено макетом, поэтому открыт один вопрос за раз.
(function () {
  var items = document.querySelectorAll('.faq-ui details');
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open || !window.matchMedia('(min-width: 1024px)').matches) return;
      items.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();

// Запись на консультацию: заявка уходит письмом Екатерине через Formspree (как форма на reprintseva.pro).
// FORM_ENDPOINT — адрес формы в Formspree (https://formspree.io/f/…); пока он пустой, форма открывает
// готовое письмо в почтовой программе.
(function () {
  var form = document.getElementById('signup');
  if (!form) return;
  var status = form.querySelector('.f-status');
  var send = form.querySelector('.f-send');
  var TO = 'ekaterinaburlak@gmail.com';
  var FORM_ENDPOINT = 'https://formspree.io/f/mkjokaog';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.email, name = form.name;
    var bad = [email, name].filter(function (f) { return !f.value.trim() || !f.checkValidity(); });
    [email, name].forEach(function (f) { f.setAttribute('aria-invalid', String(bad.indexOf(f) !== -1)); });
    if (bad.length) {
      status.textContent = 'Заполните, пожалуйста, почту и имя.';
      bad[0].focus();
      return;
    }
    var data = { 'Имя': name.value.trim(), 'Почта': email.value.trim(), 'Комментарий': form.comment.value.trim(),
                 _replyto: email.value.trim(), _subject: 'Запись на консультацию — ' + name.value.trim() };
    if (!FORM_ENDPOINT) {
      var body = 'Имя: ' + data['Имя'] + '\nПочта: ' + data['Почта'] + (data['Комментарий'] ? '\n\n' + data['Комментарий'] : '');
      window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent('Запись на консультацию') +
        '&body=' + encodeURIComponent(body);
      status.textContent = 'Открываем почту с готовым письмом. Если не открылась — напишите на ' + TO;
      return;
    }
    send.disabled = true;
    status.textContent = 'Отправляем…';
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                           body: JSON.stringify(data) })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        status.textContent = 'Спасибо! Заявка отправлена — Екатерина ответит вам на почту.';
      })
      .catch(function () {
        status.textContent = 'Не получилось отправить. Напишите, пожалуйста, на ' + TO + ' или в Telegram.';
      })
      .then(function () { send.disabled = false; });
  });
})();

// Панель меню (компьютер): появляется, как только меню первого экрана уходит за край, и видна дальше всё время.
(function () {
  var bar = document.querySelector('.topbar');
  if (!bar) return;
  function update() { bar.classList.toggle('is-visible', window.scrollY > 110); }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// «Частые вопросы» на компьютере: если раскрытый ответ длиннее экрана из макета — экран вытягивается вниз,
// под картинкой продолжается кремовый фон, следующий экран сдвигается.
(function () {
  var sec = document.getElementById('faq');
  var box = sec && sec.querySelector('.faq-ui');
  var art = sec && sec.querySelector('.art');
  if (!box || !art) return;
  function fit() {
    if (!window.matchMedia('(min-width: 1024px)').matches) { sec.style.paddingBottom = ''; return; }
    var over = box.getBoundingClientRect().bottom - art.getBoundingClientRect().bottom + 40;
    sec.style.paddingBottom = over > 0 ? over + 'px' : '';
  }
  box.querySelectorAll('details').forEach(function (d) { d.addEventListener('toggle', fit); });
  window.addEventListener('resize', fit);
  fit();
})();
