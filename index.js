/* ==========================================================================
   瓶子的跋涉 · foryouos   —   index.js
   无依赖，纯原生。功能：昼夜主题 / 一言（含离线兜底）/ 视差 / 点击涟漪 / 场景自适配
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var sceneSvg = document.getElementById('sceneSvg');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------------------------------------------------------------
     1. 昼夜主题
     --------------------------------------------------------------- */
  var STORE_KEY = 'foryouos-theme';
  var themeBtn = document.getElementById('themeBtn');

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) themeBtn.setAttribute('aria-pressed', theme === 'night' ? 'true' : 'false');

    var color = theme === 'night' ? '#0d2543' : '#ffce00';
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.setAttribute('content', color);
    });

    if (persist) {
      try { localStorage.setItem(STORE_KEY, theme); } catch (e) { /* 隐私模式下忽略 */ }
    }
  }

  function themeFromUrl() {
    var m = /[?&]theme=(day|night)\b/.exec(window.location.search);
    return m ? m[1] : null;
  }

  function initTheme() {
    var fromUrl = themeFromUrl();
    if (fromUrl) { applyTheme(fromUrl, true); }   // 支持 ?theme=night 直达，便于分享与调试

    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }

    if (fromUrl) {
      /* 已由 URL 指定，跳过自动逻辑 */
    } else if (saved === 'day' || saved === 'night') {
      applyTheme(saved, false);
    } else {
      // 未设置过：按本地时间自动判断（6:00 - 18:00 为白天）
      var hour = new Date().getHours();
      applyTheme(hour >= 6 && hour < 18 ? 'day' : 'night', false);
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'night' ? 'day' : 'night';
        applyTheme(next, true);
      });
    }
  }

  /* ---------------------------------------------------------------
     2. 一言（远端失败时使用本地兜底文案）
     --------------------------------------------------------------- */
  var FALLBACK = [
    { text: '所有的伟大，都源于一个勇敢的开始。', from: '瓶子的跋涉' },
    { text: '长路漫漫，未来可期。', from: '瓶子的跋涉' },
    { text: '慢慢来，比较快。', from: '编程笔记' },
    { text: '不驰于空想，不骛于虚声。', from: '李大钊' },
    { text: '流水不争先，争的是滔滔不绝。', from: '道德经' },
    { text: '道阻且长，行则将至。', from: '荀子' },
    { text: '把每一个今天，都过成值得记录的日子。', from: '瓶子的跋涉' },
    { text: '一箪食，一瓢饮，在陋巷，人不堪其忧，回也不改其乐。', from: '论语' }
  ];

  var quoteEl = document.getElementById('quote');
  var quoteText = document.getElementById('quoteText');
  var quoteFrom = document.getElementById('quoteFrom');
  var fallbackIndex = 0;
  var remoteFailures = 0;
  var remoteDisabled = false;

  function renderQuote(text, from) {
    if (!quoteText) return;
    if (reduceMotion) {
      quoteText.textContent = text;
      quoteFrom.textContent = '— ' + from;
      return;
    }
    if (quoteEl) quoteEl.classList.add('is-swap');
    window.setTimeout(function () {
      quoteText.textContent = text;
      quoteFrom.textContent = '— ' + from;
      if (quoteEl) quoteEl.classList.remove('is-swap');
    }, 300);
  }

  function nextFallback() {
    var item = FALLBACK[fallbackIndex % FALLBACK.length];
    fallbackIndex++;
    renderQuote(item.text, item.from);
  }

  function loadQuote() {
    if (remoteDisabled || !window.fetch) { nextFallback(); return; }

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (controller) controller.abort(); }, 6000);

    fetch('https://v1.hitokoto.cn/?encode=json', { signal: controller ? controller.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        window.clearTimeout(timer);
        if (!data || !data.hitokoto) throw new Error('bad payload');
        remoteFailures = 0;
        renderQuote(data.hitokoto, data.from || data.from_who || '一言');
      })
      .catch(function () {
        window.clearTimeout(timer);
        remoteFailures++;
        // 连续失败 3 次即放弃远端，转为本地文案轮播，避免反复请求
        if (remoteFailures >= 3) remoteDisabled = true;
        nextFallback();
      });
  }

  function initQuote() {
    if (!quoteText) return;
    loadQuote();

    if (quoteEl) {
      quoteEl.addEventListener('click', function () {
        if (quoteEl.classList.contains('is-swap')) return;
        remoteDisabled ? nextFallback() : loadQuote();
      });
    }

    window.setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      remoteDisabled ? nextFallback() : loadQuote();
    }, 11000);
  }

  /* ---------------------------------------------------------------
     3. 场景视差（仅精细指针设备）
     --------------------------------------------------------------- */
  function initParallax() {
    if (!finePointer || reduceMotion) return;

    var ticking = false;
    var nextX = 0;
    var nextY = 0;

    function flush() {
      root.style.setProperty('--px', nextX.toFixed(3));
      root.style.setProperty('--py', nextY.toFixed(3));
      ticking = false;
    }

    window.addEventListener('pointermove', function (e) {
      nextX = (e.clientX / window.innerWidth - 0.5) * 2;
      nextY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(flush);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      nextX = 0;
      nextY = 0;
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(flush);
      }
    });
  }

  /* ---------------------------------------------------------------
     4. 点击涟漪 + 气泡
     --------------------------------------------------------------- */
  function initRipple() {
    if (reduceMotion) return;
    var layer = document.getElementById('rippleLayer');
    if (!layer) return;

    document.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;

      var ring = document.createElement('span');
      var size = 30 + Math.random() * 26;
      ring.className = 'ripple';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
      ring.style.width = size + 'px';
      ring.style.height = size + 'px';
      layer.appendChild(ring);
      window.setTimeout(function () { ring.remove(); }, 1100);

      for (var i = 0; i < 3; i++) {
        var dot = document.createElement('span');
        var d = 6 + Math.random() * 9;
        dot.className = 'ripple-bubble';
        dot.style.left = (e.clientX + (Math.random() - 0.5) * 46) + 'px';
        dot.style.top = (e.clientY + (Math.random() - 0.5) * 18) + 'px';
        dot.style.width = d + 'px';
        dot.style.height = d + 'px';
        dot.style.animationDelay = (i * 70) + 'ms';
        layer.appendChild(dot);
        (function (node) {
          window.setTimeout(function () { node.remove(); }, 1600);
        })(dot);
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     5. 场景自适配：按视口比例调整 viewBox，保证关键元素不被裁切
     --------------------------------------------------------------- */
  function fitScene() {
    if (!sceneSvg) return;
    var w = window.innerWidth || 1440;
    var h = window.innerHeight || 900;
    var H = 900;
    var aspect = w / Math.max(1, h);

    // 宽度范围限制：超宽屏不无限拉伸，窄屏保证主体（太阳/漂流瓶）居中完整
    var vbw = Math.min(2600, Math.max(520, H * aspect));
    var vbx = 720 - vbw / 2;

    sceneSvg.setAttribute('viewBox',
      vbx.toFixed(1) + ' 0 ' + vbw.toFixed(1) + ' ' + H);
  }

  function initSceneFit() {
    fitScene();
    var raf = 0;
    window.addEventListener('resize', function () {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () {
        fitScene();
        raf = 0;
      });
    }, { passive: true });
    window.addEventListener('orientationchange', fitScene, { passive: true });
  }

  /* ---------------------------------------------------------------
     6. 杂项
     --------------------------------------------------------------- */
  function initMisc() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // 禁止长按选中拖拽背景，保持「应用感」
    document.addEventListener('dragstart', function (e) {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
  }

  /* ---------------------------------------------------------------
     启动
     --------------------------------------------------------------- */
  function boot() {
    initTheme();
    initSceneFit();
    initQuote();
    initParallax();
    initRipple();
    initMisc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
