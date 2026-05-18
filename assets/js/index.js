const intro = document.querySelector('.intro');
const introNumber = document.querySelector('.intro__number');
const introSign = document.querySelector('.intro__sign-image');

const INTRO_DURATION = 2200;

// easeInOut 이징
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// 인트로 종료 후 위로 슬라이드 아웃
function exitIntro() {
  intro.classList.add('is-done');
  intro.addEventListener('transitionend', () => {
    intro.style.display = 'none';
    lenis.start();
  }, { once: true });
}

// 퍼센트 카운터 + sign 애니메이션 실행
function runIntro() {
  // sign 드로잉 시작 (현재는 clip-path reveal, 추후 stroke-dashoffset으로 교체)
  introSign.classList.add('is-animating');

  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / INTRO_DURATION, 1);
    const eased = easeInOut(progress);

    // 숫자 업데이트
    introNumber.textContent = Math.floor(eased * 100);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      introNumber.textContent = 100;
      // 완료 후 잠깐 대기 후 종료
      setTimeout(exitIntro, 400);
    }
  }

  requestAnimationFrame(tick);
}

// runIntro();

// ── SVG 텍스트 한 글자씩 등장 애니메이션 ──
// 각 문자를 tspan으로 분리하고 순차 딜레이 적용
function initSignAnimation() {
  const textEl = document.querySelector('.sign-text');
  if (!textEl) return;

  const text = textEl.textContent.trim();
  textEl.textContent = '';

  const CHAR_DELAY = 0.1;  // 글자 간 딜레이 (초)
  const BASE_DELAY = 0.3;  // 시작 전 기본 대기 (초)

  text.split('').forEach((char, index) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    // 공백은 &nbsp; 처리 (SVG에서 공백 렌더링 보장)
    tspan.textContent = char === ' ' ? ' ' : char;
    tspan.classList.add('sign-char');
    tspan.style.animationDelay = `${(BASE_DELAY + index * CHAR_DELAY).toFixed(2)}s`;
    textEl.appendChild(tspan);
  });
}

initSignAnimation();

// ── Hero 타이틀 글자 bounce 애니메이션 (rAF + squash&stretch) ──
function initHeroAnimation() {
  const heroTitle = document.querySelector('.hero_title');
  if (!heroTitle) return;

  const text = heroTitle.textContent;
  heroTitle.textContent = '';

  const CHAR_DELAY = 90;   // 글자 간 딜레이 ms
  const DURATION = 1200;   // 글자 하나의 전체 이동 시간 ms
  const BOUNCES = 3;       // 바운스 횟수
  const BOUNCE_H = 62;     // 첫 바운스 높이 px
  const DECAY = 0.48;      // 바운스 감쇠율

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  const spans = [...text].map(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? ' ' : char;
    span.style.display = 'inline-block';
    span.style.transformOrigin = 'bottom center';
    span.style.opacity = '0';
    heroTitle.appendChild(span);
    return span;
  });

  spans.forEach((span, index) => {
    // 먼저 출발하는 글자일수록 더 멀리서 시작
    const startX = 180 + (spans.length - 1 - index) * 12;

    setTimeout(() => {
      let startTime = null;

      function tick(now) {
        if (!startTime) startTime = now;
        const t = Math.min((now - startTime) / DURATION, 1);

        // X: easeOut으로 오른쪽 밖에서 자기 자리로
        const x = startX * (1 - easeOutQuad(t));

        // Y: 구간별 감쇠 bounce
        const segLen = 1 / BOUNCES;
        const segIndex = Math.min(Math.floor(t / segLen), BOUNCES - 1);
        const segT = (t - segIndex * segLen) / segLen;
        const segH = BOUNCE_H * Math.pow(DECAY, segIndex);
        const y = segH * Math.sin(Math.PI * segT);

        // squash & stretch: 공중에서 늘고 착지 시 납작해짐
        const phase = Math.sin(Math.PI * segT);
        const scaleX = 1 + (1 - phase) * 0.3 - phase * 0.1;
        const scaleY = 1 - (1 - phase) * 0.28 + phase * 0.14;

        span.style.transform = `translateX(${x}px) translateY(${-y}px) scaleX(${scaleX}) scaleY(${scaleY})`;
        span.style.opacity = '1';

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          // squash 상태에서 즉시 리셋하면 튀어보이므로 짧게 transition 후 해제
          span.style.transition = 'transform 0.13s ease-out';
          span.style.transform = 'none';
          setTimeout(() => { span.style.transition = ''; }, 150);
        }
      }

      requestAnimationFrame(tick);
    }, index * CHAR_DELAY);
  });
}

initHeroAnimation();

// hero 애니메이션 완료 후 scroll indicator 등장
(function () {
  const text = 'kdh portfolio';
  const CHAR_DELAY = 90;
  const DURATION   = 1200;
  const totalMs    = (text.length - 1) * CHAR_DELAY + DURATION + 200;
  setTimeout(() => {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;
    indicator.classList.add('is-visible');
    // si-line(0.6s) + si-head delay(0.5s) + si-head duration(0.5s) = 1.6s 후 bob 시작
    setTimeout(() => indicator.classList.add('is-bobbing'), 1600);
  }, totalMs);
})();

/* ── paper-card ── */

// view project 버튼
if (typeof RoughNotation !== 'undefined') {

  // 카드별 accent 색상 맵
  const cardColorMap = {
    'paper-card-1': '#c6eb33',
    'paper-card-2': '#e16ca3',
    'paper-card-3': '#c9ea35',
  };

  // 밑줄 애니메이션
  const btnViewProejct = document.querySelectorAll('.paper-card .info .view-project');

  btnViewProejct.forEach(btn => {
    const target = btn.querySelector('span');

    // 가장 가까운 paper-card-N 클래스에서 accent 색상 추출
    const cardEl = btn.closest('[class*="paper-card-"]');
    const cardClass = cardEl ? [...cardEl.classList].find(cls => cardColorMap[cls]) : null;
    const accentColor = cardClass ? cardColorMap[cardClass] : '#c6eb33';

    // accent 색상 굵은 밑줄
    const accentLine = RoughNotation.annotate(target, {
      type: 'underline',
      color: accentColor,
      strokeWidth: 6,
      padding: 8,
      roughness: 1,
      animationDuration: 350,
      iterations: 1,
    });
    // 검은색 얇은 밑줄
    const blackLine = RoughNotation.annotate(target, {
      type: 'underline',
      color: '#111111',
      strokeWidth: 2,
      padding: 6,
      roughness: 1,
      animationDuration: 350,
      iterations: 1,
    });

    btn.addEventListener('mouseenter', () => {
      accentLine.show();
      blackLine.show();

      // SVG는 btn 형제로 삽입되므로 parentElement에서 탐색
      // accent 아래, black 위로 z-index 적용
      btn.parentElement.querySelectorAll('svg.rough-annotation').forEach(svg => {
        const path = svg.querySelector('path');
        if (!path) return;
        const stroke = path.getAttribute('stroke');
        if (stroke === accentColor) svg.style.zIndex = '1';
        if (stroke === '#111111') svg.style.zIndex = '2';
      });
    });

    btn.addEventListener('mouseleave', () => {
      accentLine.hide();
      blackLine.hide();

      btn.parentElement.querySelectorAll('svg.rough-annotation').forEach(svg => {
        svg.style.zIndex = '';
      });
    });
  })

  // 타이틀 하이라이트 — annotate만 해두고 show()는 scroll trigger 후 실행
  // { highlight, afterCallback } 구조로 저장해 순서 제어
  const cardActionMap = new Map();

  // paper-card-1 desc underline 미리 annotate
  const descUnderlineEl = document.querySelector('.paper-card-1 .desc .desc-underline');
  const descUnderline = descUnderlineEl
    ? RoughNotation.annotate(descUnderlineEl, {
        type: 'underline',
        color: cardColorMap['paper-card-1'],
        strokeWidth: 2,
        roughness: 1,
        animationDuration: 400,
        iterations: 1,
      })
    : null;

  // paper-card-2 desc underline + circle 미리 annotate
  const card2UnderlineEl = document.querySelector('.paper-card-2 .desc .desc-underline');
  const card2Circle1El   = document.querySelector('.paper-card-2 .desc .desc-circle-1');
  const card2Circle2El   = document.querySelector('.paper-card-2 .desc .desc-circle-2');

  const card2Underline = card2UnderlineEl
    ? RoughNotation.annotate(card2UnderlineEl, {
        type: 'underline',
        color: cardColorMap['paper-card-2'],
        strokeWidth: 2,
        roughness: 1,
        animationDuration: 400,
        iterations: 1,
      })
    : null;

  const card2Circle1 = card2Circle1El
    ? RoughNotation.annotate(card2Circle1El, {
        type: 'circle',
        color: cardColorMap['paper-card-2'],
        strokeWidth: 1.5,
        roughness: 1.5,
        animationDuration: 400,
        iterations: 1,
      })
    : null;

  const card2Circle2 = card2Circle2El
    ? RoughNotation.annotate(card2Circle2El, {
        type: 'circle',
        color: cardColorMap['paper-card-2'],
        strokeWidth: 1.5,
        roughness: 1.5,
        animationDuration: 400,
        iterations: 1,
      })
    : null;

  const card2HighlightEl = document.querySelector('.paper-card-2 .desc .desc-highlight');
  const card2Highlight = card2HighlightEl
    ? RoughNotation.annotate(card2HighlightEl, {
        type: 'box',
        color: cardColorMap['paper-card-2'],
        strokeWidth: 1.5,
        roughness: 1.5,
        animationDuration: 400,
        iterations: 3,
      })
    : null;

  // paper-card-3 desc box + highlight 미리 annotate
  const descBoxEl = document.querySelector('.paper-card-3 .desc .desc-box');
  const descHighlightEl = document.querySelector('.paper-card-3 .desc .desc-highlight');

  const descBox = descBoxEl
    ? RoughNotation.annotate(descBoxEl, {
        type: 'box',
        color: cardColorMap['paper-card-3'],
        strokeWidth: 1.5,
        roughness: 1.5,
        animationDuration: 400,
        iterations: 1,
      })
    : null;

  const descHighlight = descHighlightEl
    ? RoughNotation.annotate(descHighlightEl, {
        type: 'highlight',
        color: cardColorMap['paper-card-3'],
        roughness: 1,
        animationDuration: 400,
        iterations: 2,
      })
    : null;

  document.querySelectorAll('.paper-card .info .title .rough').forEach(title => {
    const cardEl = title.closest('[class*="paper-card-"]');
    const cardClass = cardEl ? [...cardEl.classList].find(cls => cardColorMap[cls]) : null;
    const accentColor = cardClass ? cardColorMap[cardClass] : '#c6eb33';

    const highlight = RoughNotation.annotate(title, {
      type: 'highlight',
      color: accentColor,
      strokeWidth: 200,
      padding: 0,
      roughness: 2000,
      animationDuration: 350,
      iterations: 3,
    });

    // 카드별 afterCallback 정의
    let afterCallback = null;

    let stickerDelay = 400;

    if (cardEl && cardEl.classList.contains('paper-card-1') && descUnderline) {
      afterCallback = () => descUnderline.show();
      // highlight(350) + afterCallback delay(400) + descUnderline(400)
      stickerDelay = 900;
    } else if (cardEl && cardEl.classList.contains('paper-card-2') && (card2Underline || card2Circle1 || card2Circle2 || card2Highlight)) {
      afterCallback = () => {
        if (card2Underline) card2Underline.show();
        if (card2Circle1)   setTimeout(() => card2Circle1.show(),   450);
        if (card2Circle2)   setTimeout(() => card2Circle2.show(),   850);
        if (card2Highlight) setTimeout(() => card2Highlight.show(), 1250);
      };
      // highlight + afterCallback delay(400) + 마지막 show 시작(1250) + 지속(400)
      stickerDelay = 2100;
    } else if (cardEl && cardEl.classList.contains('paper-card-3') && (descBox || descHighlight)) {
      afterCallback = () => {
        if (descBox) descBox.show();
        if (descHighlight) setTimeout(() => descHighlight.show(), 450);
      };
      // highlight + afterCallback delay(400) + descBox(400) + 450 + descHighlight(400)
      stickerDelay = 1300;
    }

    if (cardEl) cardActionMap.set(cardEl, { highlight, afterCallback, stickerDelay });
  });

  // paper-card scroll trigger — 아래에서 fade in 후 highlight → afterCallback 순서 실행
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const card = entry.target;
      card.classList.add('is-visible');

      card.addEventListener('transitionend', (event) => {
        if (event.propertyName !== 'opacity') return;
        const action = cardActionMap.get(card);
        if (!action) return;
        action.highlight.show();
        if (action.afterCallback) setTimeout(action.afterCallback, 400);

        // RoughNotation 완료 후 스티커 등장
        setTimeout(() => {
          card.querySelectorAll('.sticker-box').forEach(sticker => sticker.classList.add('active'));
        }, action.stickerDelay ?? 400);
      }, { once: true });

      cardObserver.unobserve(card);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.paper-card').forEach(card => cardObserver.observe(card));
}