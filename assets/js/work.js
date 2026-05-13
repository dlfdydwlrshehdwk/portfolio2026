const mobileBreakpoint = window.matchMedia('(max-width: 767px)');

// ── info-content 교체 (패널 내 컨텍스트로 탐색) ──
function switchInfoContent(id, panel) {
  panel.querySelectorAll('.info-content').forEach(el => {
    el.classList.remove('is-active');
  });

  const target = panel.querySelector(`.info-content[data-project="${id}"]`);
  if (!target) return;

  requestAnimationFrame(() => target.classList.add('is-active'));
}

// ── 프로젝트 IntersectionObserver ──
let projectObserver = null;

function initProjectObserver(panel) {
  if (projectObserver) {
    projectObserver.disconnect();
    projectObserver = null;
  }

  panel.querySelectorAll('.info-content').forEach(el => {
    el.classList.remove('is-active', 'enter-down', 'enter-up');
  });

  if (mobileBreakpoint.matches) return;

  // 첫 번째 프로젝트 즉시 활성화
  const firstProject = panel.querySelector('.project[data-project]');
  if (firstProject) {
    const firstContent = panel.querySelector(`.info-content[data-project="${firstProject.dataset.project}"]`);
    if (firstContent) firstContent.classList.add('is-active');
  }

  projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      switchInfoContent(entry.target.dataset.project, panel);
    });
  }, {
    // 뷰포트 위아래 35%를 제외한 중앙 30% 구간 진입 시 트리거
    // 창 크기와 무관하게 요소가 화면 중앙에 올 때 작동
    rootMargin: '-35% 0px -35% 0px',
    threshold: 0,
  });

  panel.querySelectorAll('.project[data-project]').forEach(p => projectObserver.observe(p));
}

// ── 탭 전환 ──
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;

    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('is-active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));

    button.classList.add('is-active');
    const activePanel = document.querySelector(`.tab-panel[data-panel="${target}"]`);
    activePanel.classList.add('is-active');

    lenis.scrollTo(0, { immediate: true });
    initProjectObserver(activePanel);
  });
});

// 미디어쿼리 변경 시 재초기화
mobileBreakpoint.addEventListener('change', () => {
  const activePanel = document.querySelector('.tab-panel.is-active');
  if (activePanel) initProjectObserver(activePanel);
});

// 초기 실행
initProjectObserver(document.querySelector('.tab-panel.is-active'));
