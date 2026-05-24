// Lenis 인스턴스 생성 (전역 접근을 위해 window에 할당하지 않고 전역 스코프에 선언)
var lenis = new Lenis();

// requestAnimationFrame 루프로 Lenis 매 프레임 업데이트
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ── Nav Overlay ──

const hamburger = document.querySelector('.header__hamburger');
const overlay = document.querySelector('.nav-overlay');

// 지정 범위 내 랜덤 소수 반환
function randomRange(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// 링크 텍스트를 개별 .char div로 분리
function splitTextToChars(link) {
  const text = link.textContent.trim();
  link.textContent = '';
  text.split('').forEach(char => {
    const element = document.createElement('div');
    element.classList.add('char');
    element.textContent = char;
    link.appendChild(element);
  });
}

// 각 문자에 transform 적용
// X: -40% ~ +40% 균등 분산 (위치 기반)
// Y: 절댓값 7% ~ 18% 균등 분산, 짝수 인덱스 위(음수) / 홀수 인덱스 아래(양수)
// rotate: -8deg ~ +8deg 랜덤
const Y_MIN = 7;
const Y_MAX = 18;

function applyScatterEffect(link) {
  const chars = link.querySelectorAll('.char');
  const count = chars.length;

  chars.forEach((char, index) => {
    const xPercent = ((index / (count - 1)) * 80 - 40).toFixed(2);
    const yMagnitude = Y_MIN + (index / (count - 1)) * (Y_MAX - Y_MIN);
    const yPercent = (index % 2 === 0 ? -yMagnitude : yMagnitude).toFixed(2);
    const rotateDeg = randomRange(-8, 8);
    char.style.transform = `translate(${xPercent}%, ${yPercent}%) rotate(${rotateDeg}deg)`;
  });
}

// 문자 transform 초기화
function resetScatterEffect(link) {
  link.querySelectorAll('.char').forEach(char => {
    char.style.transform = '';
  });
}

// 링크 초기화: 텍스트 분리 + 호버/클릭 이벤트 등록
document.querySelectorAll('.nav-overlay__link').forEach(link => {
  splitTextToChars(link);

  link.addEventListener('mouseenter', () => applyScatterEffect(link));
  link.addEventListener('mouseleave', () => resetScatterEffect(link));

  // 링크 클릭 시 오버레이 닫기
  link.addEventListener('click', () => {
    hamburger.classList.remove('is-active');
    overlay.classList.remove('is-active');
    document.body.classList.remove('nav-open');
  });
});

// ── 헤더 링크 RoughNotation 밑줄 효과 ──
if (typeof RoughNotation !== 'undefined') {

  // 로고 동그라미 애니메이션
  const headerLogo = document.querySelector('.header__logo');
  const circle = RoughNotation.annotate(headerLogo, {
    type: 'circle',
    color: '#111',
    strokeWidth: 1,
    padding: 8,
    roughness: 2,
    animationDuration: 350,
    iterations: 2,
  })
  headerLogo.addEventListener('mouseenter', () => {
    circle.show();
  });

  headerLogo.addEventListener('mouseleave', () => {
    circle.hide();
  });
}

// 햄버거 버튼 클릭 시 오버레이 열기/닫기 및 스크롤 제어
hamburger.addEventListener('click', () => {
  const isActive = hamburger.classList.toggle('is-active');
  overlay.classList.toggle('is-active');
  document.body.classList.toggle('nav-open');

  // aria 상태 업데이트
  hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  hamburger.setAttribute('aria-label', isActive ? '메뉴 닫기' : '메뉴 열기');
  overlay.setAttribute('aria-hidden', isActive ? 'false' : 'true');

  // 오버레이가 열리면 스크롤 정지, 닫히면 재개
  if (isActive) {
    lenis.stop();
  } else {
    lenis.start();
  }
});
