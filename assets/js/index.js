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
