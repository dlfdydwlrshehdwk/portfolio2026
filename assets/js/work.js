const tabletBreakpoint = window.matchMedia('(max-width: 1024px)');

// ── info-content annotation 관리 ──
const contentAnnotationMap = new Map();

function setupContentAnnotations(infoContent) {
  if (!window.RoughNotation) return;

  const accentColor = infoContent.dataset.accent || '#c6eb33';
  const roughEl = infoContent.querySelector('.project__name .rough');
  const descSpan = infoContent.querySelector('.project__desc span');
  const annotations = [];

  if (roughEl) {
    annotations.push(RoughNotation.annotate(roughEl, {
      type: 'highlight',
      color: accentColor,
      strokeWidth: 200,
      padding: 0,
      roughness: 2000,
      animationDuration: 350,
      iterations: 3,
    }));
  }

  if (descSpan) {
    annotations.push(RoughNotation.annotate(descSpan, {
      type: 'underline',
      color: '#111111',
      strokeWidth: 2,
      roughness: 1,
      animationDuration: 400,
      iterations: 1,
    }));
  }

  contentAnnotationMap.set(infoContent, annotations);
}

function showContentAnnotations(infoContent) {
  const annotations = contentAnnotationMap.get(infoContent);
  if (!annotations) return;
  // 재등장 시 항상 처음부터 애니메이션 실행
  annotations.forEach(a => a.hide());
  // highlight 먼저, 200ms 후 underline
  annotations.forEach((a, i) => setTimeout(() => a.show(), i * 200));
}

function hideContentAnnotations(infoContent) {
  const annotations = contentAnnotationMap.get(infoContent);
  if (!annotations) return;
  annotations.forEach(a => a.hide());
}

// ── info-content 교체 (패널 내 컨텍스트로 탐색) ──
function switchInfoContent(id, panel) {
  const currentActive = panel.querySelector('.info-content.is-active');
  if (currentActive) hideContentAnnotations(currentActive);

  panel.querySelectorAll('.info-content').forEach(el => {
    el.classList.remove('is-active');
  });

  const target = panel.querySelector(`.info-content[data-project="${id}"]`);
  if (!target) return;

  requestAnimationFrame(() => {
    target.classList.add('is-active');
    // fade in(0.7s) 시작 후 annotation 실행
    setTimeout(() => showContentAnnotations(target), 300);
  });
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

  if (tabletBreakpoint.matches) return;

  // 첫 번째 프로젝트 즉시 활성화
  const firstProject = panel.querySelector('.project[data-project]');
  if (firstProject) {
    const firstContent = panel.querySelector(`.info-content[data-project="${firstProject.dataset.project}"]`);
    if (firstContent) {
      firstContent.classList.add('is-active');
      setTimeout(() => showContentAnnotations(firstContent), 300);
    }
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

// ── info-content DOM 재배치 (반응형) ──
function rearrangeInfoContents(panel, isTablet) {
  const infoPanel = panel.querySelector('.project-info-panel');
  if (!infoPanel) return;

  if (isTablet) {
    // 각 info-content를 해당 project 앞으로 이동
    panel.querySelectorAll('.info-content').forEach(infoContent => {
      const projectId = infoContent.dataset.project;
      const project = panel.querySelector(`.project[data-project="${projectId}"]`);
      if (!project) return;
      const gridWrap = project.querySelector('.project__grid-wrap');
      project.insertBefore(infoContent, gridWrap);
    });
  } else {
    // 모든 info-content를 project-info-panel로 복귀
    panel.querySelectorAll('.project[data-project] .info-content').forEach(infoContent => {
      infoPanel.appendChild(infoContent);
    });
  }
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
    rearrangeInfoContents(activePanel, tabletBreakpoint.matches);
    initProjectObserver(activePanel);
  });
});

// 미디어쿼리 변경 시 재초기화
tabletBreakpoint.addEventListener('change', () => {
  const activePanel = document.querySelector('.tab-panel.is-active');
  if (!activePanel) return;
  rearrangeInfoContents(activePanel, tabletBreakpoint.matches);
  initProjectObserver(activePanel);
});

// 초기 실행
const initialPanel = document.querySelector('.tab-panel.is-active');
rearrangeInfoContents(initialPanel, tabletBreakpoint.matches);
initProjectObserver(initialPanel);


// view project 호버 밑줄
if (typeof RoughNotation !== 'undefined') {

  // 모든 info-content annotation 사전 등록
  document.querySelectorAll('.info-content').forEach(infoContent => {
    setupContentAnnotations(infoContent);
  });

  document.querySelectorAll('.info-content').forEach(infoContent => {
    const accentColor = infoContent.dataset.accent || '#c6eb33';
    const link = infoContent.querySelector('.project__link a');
    if (!link) return;

    const labelSpan = link.querySelector('.view-label');
    if (!labelSpan) return;

    // accent 굵은 밑줄
    const accentLine = RoughNotation.annotate(labelSpan, {
      type: 'underline',
      color: accentColor,
      strokeWidth: 6,
      padding: 8,
      roughness: 1,
      animationDuration: 350,
      iterations: 1,
    });
    // 검은색 얇은 밑줄
    const blackLine = RoughNotation.annotate(labelSpan, {
      type: 'underline',
      color: '#111111',
      strokeWidth: 2,
      padding: 6,
      roughness: 1,
      animationDuration: 350,
      iterations: 1,
    });

    link.addEventListener('mouseenter', () => {
      accentLine.show();
      blackLine.show();

      // accent 아래(z:1), black 위(z:2)
      link.querySelectorAll('svg.rough-annotation').forEach(svg => {
        const path = svg.querySelector('path');
        if (!path) return;
        const stroke = path.getAttribute('stroke');
        if (stroke === accentColor) svg.style.zIndex = '1';
        if (stroke === '#111111') svg.style.zIndex = '2';
      });
    });

    link.addEventListener('mouseleave', () => {
      accentLine.hide();
      blackLine.hide();

      link.querySelectorAll('svg.rough-annotation').forEach(svg => {
        svg.style.zIndex = '';
      });
    });
  });
}