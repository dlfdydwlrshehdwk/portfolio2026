export function createStickerManager(area) {
  let resetFunction;
  let cleanup;
  let resizeTimeout;

  // 전역 상태 초기화, 커서 애니메이션과 클릭 방지 플래그 관리
  window._stickerState = window._stickerState || {
    mouse: { x: 0, y: 0 },        // 마우스 위치 추적
    cursorAnimating: false,       // 커서 애니메이션 상태
    preventNextClick: false       // 드래그 후 클릭 방지
  };

  const stickerArea = document.querySelector(area);  // 스티커를 추가할 영역
  if (!stickerArea) return;

  const customCursor = document.querySelector('.custom_cursor_sticker'); // 커서 요소
  if (!customCursor) return;

  const MAX_STICKERS = 16; // 최대 스티커 개수
  const activeStickers = []; // 현재 생성된 스티커들
  const lastFourTypes = []; // 마지막으로 생성된 스티커 타입
  let stickerSizeFactor = calculateSizeFactor(); // 스티커 크기 비율

  // 스티커 세트 (앞, 뒤 이미지, 크기 정보)
  const stickerSets = {
    a: { front: './image/sticker/1.png', back: './image/sticker/back1.png', width: 80, height: 80 },
    b: { front: './image/sticker/2.png', back: './image/sticker/back2.png', width: 120, height: 120 },
    c: { front: './image/sticker/3.png', back: './image/sticker/back3.png', width: 122, height: 96 },
    d: { front: './image/sticker/4.png', back: './image/sticker/back4.png', width: 120, height: 120 },
    e: { front: './image/sticker/5.png', back: './image/sticker/back5.png', width: 186.5, height: 186.5 },
    f: { front: './image/sticker/6.png', back: './image/sticker/back6.png', width: 80, height: 80 }
  };

  // 화면 크기에 따라 스티커 크기 비율을 설정하는 함수
  function calculateSizeFactor() {
    const w = window.innerWidth;
    return w < 576 ? 0.6 :
           w < 768 ? 0.75 :
           w < 992 ? 0.85 :
           w < 1200 ? 0.9 : 1;
  }

  // 범위 내에서 랜덤한 숫자를 반환하는 함수
  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  // 랜덤 스티커 세트를 가져오는 함수
  function getRandomStickerSet() {
    const allTypes = Object.keys(stickerSets); // 모든 스티커 타입을 가져옴
    const availableTypes = allTypes.filter(t => !lastFourTypes.includes(t)); // 마지막 4개 타입을 제외
    const randomSet = availableTypes.length ?
      availableTypes[Math.floor(Math.random() * availableTypes.length)] :
      allTypes[Math.floor(Math.random() * allTypes.length)];

    // 최근 4개 타입을 추적하여 같은 타입이 연속해서 나오지 않도록 처리
    lastFourTypes.push(randomSet);
    if (lastFourTypes.length > 4) lastFourTypes.shift();

    return { ...stickerSets[randomSet], type: randomSet }; // 선택된 스티커 세트 반환
  }

  // 스티커를 생성하는 함수
  function createSticker(x, y) {
    const set = getRandomStickerSet(); // 랜덤 스티커 세트 가져오기
    const rotation = getRandomNumber(-60, 60); // 스티커 회전 각도
    const scale = getRandomNumber(1, 1.2) * stickerSizeFactor; // 스케일 (크기 비율 적용)
    const w = set.width * scale; // 최종 너비
    const h = set.height * scale; // 최종 높이

    const box = document.createElement('div');
    box.className = 'sticker-box';
    box.style.position = 'absolute';
    box.style.left = `${x - w / 2}px`; // 스티커의 가로 중심을 맞추기 위해 왼쪽 위치 조정
    box.style.top = `${y - h}px`; // 스티커의 세로 위치를 맞추기 위해 위쪽 위치 조정

    const anim = document.createElement('div');
    anim.className = 'sticker-anim';
    anim.style.width = `${w}px`;
    anim.style.height = `${h * 2}px`; // 스티커의 애니메이션 영역을 두 배로 설정 (확장된 애니메이션 효과)
    anim.style.transform = `rotate(${rotation}deg) scale(0)`; // 초기에는 축소 상태
    anim.style.opacity = '0'; // 초기에는 보이지 않게 설정

    anim.innerHTML = `
      <div class="sticker sticker-back"><img src="${set.back}" alt></div>
      <div class="sticker sticker-front"><img src="${set.front}" alt></div>
    `;

    anim.querySelectorAll('.sticker').forEach(s => {
      s.style.width = `${w}px`;
      s.style.height = `${h}px`;
    });

    box.appendChild(anim);
    stickerArea.appendChild(box);
    activeStickers.push(box); // 생성된 스티커를 activeStickers에 추가

    requestAnimationFrame(() => {
      anim.classList.add('active'); // 애니메이션 시작
      anim.style.transform = `rotate(${rotation}deg) scale(1)`; // 스티커를 확대
      anim.style.opacity = '1'; // 투명도를 1로 설정하여 보이게 만듦
      setTimeout(() => box.classList.add('active'), 300); // 애니메이션 후 클래스를 추가하여 활성화
    });

    const front = anim.querySelector('.sticker-front');
    if (front) makeDraggable(front, box); // 스티커의 앞면을 드래그 가능하게 설정
  }

  // 드래그 가능한 스티커로 만드는 함수
  function makeDraggable(handleEl, moveTarget) {
    let isDragging = false; // 드래그 여부
    let dragMoved = false; // 드래그 이동 여부
    let offsetX = 0; // 마우스와 스티커의 x 오프셋
    let offsetY = 0; // 마우스와 스티커의 y 오프셋

    handleEl.addEventListener('mousedown', e => {
      e.preventDefault();
      isDragging = true; // 드래그 시작
      dragMoved = false;
      const rect = moveTarget.getBoundingClientRect();
      offsetX = e.clientX - rect.left; // 마우스 위치에서 스티커의 왼쪽 좌표를 빼서 오프셋 계산
      offsetY = e.clientY - rect.top; // 마우스 위치에서 스티커의 위쪽 좌표를 빼서 오프셋 계산
      moveTarget.style.zIndex = '1000'; // 드래그 중인 스티커의 z-index를 높여서 위로 올리기
      customCursor.style.opacity = 1; // 드래그 중에는 커서를 보이도록 설정
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      dragMoved = true;
      const parentRect = moveTarget.parentElement.getBoundingClientRect();
      const x = e.clientX - parentRect.left - offsetX; // 마우스 위치에 오프셋을 더하여 스티커 이동
      const y = e.clientY - parentRect.top - offsetY;
      moveTarget.style.left = `${x}px`;
      moveTarget.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging && dragMoved) {
        setTimeout(() => {
          window._stickerState.preventNextClick = true; // 클릭 방지
        }, 0);
      }
      isDragging = false;
      moveTarget.style.zIndex = ''; // 드래그 후 z-index를 원래대로 복원
      customCursor.style.opacity = 0; // 드래그가 끝나면 커서를 숨김
    });

    handleEl.addEventListener('mouseenter', () => customCursor.style.opacity = 1); // 마우스가 스티커에 올라가면 커서 보이기
    handleEl.addEventListener('mouseleave', () => customCursor.style.opacity = 0); // 마우스가 스티커를 벗어나면 커서 숨기기

    if (!window._stickerState.cursorAnimating) {
      window._stickerState.cursorAnimating = true;
      let speed = 0.1;
      const animate = () => {
        window._stickerState.mouse = window._stickerState.mouse || { x: 0, y: 0 };
        customCursor.style.transform = `translate(${window._stickerState.mouse.x}px, ${window._stickerState.mouse.y}px)`; // 커서를 마우스 위치에 맞게 이동
        requestAnimationFrame(animate);
      };
      document.addEventListener('mousemove', e => {
        window._stickerState.mouse.x = e.clientX;
        window._stickerState.mouse.y = e.clientY + window.scrollY;
      });
      animate(); // 커서 애니메이션 시작
    }
  }

  // 클릭 시 스티커 생성하는 함수
  function handleClick(e) {
    const isSticker = e.target.closest('.sticker-box'); // 클릭한 대상이 이미 스티커라면 생성하지 않음
    if (isSticker || window._stickerState.preventNextClick) {
      window._stickerState.preventNextClick = false;
      return;
    }

    const isRefreshBtn = e.target.closest('.btn_refresh');
    const isThumbnail = e.target.closest('.thumbnail');
    if (isRefreshBtn || isThumbnail) return;

    const targetArea = e.target.closest(area);
    if (!targetArea) return;

    const rect = targetArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const adjustedMax = window.innerWidth < 768 ? Math.floor(MAX_STICKERS * 0.75) : MAX_STICKERS;
    if (activeStickers.length >= adjustedMax) removeOldestSticker(); // 스티커 개수 제한
    createSticker(x, y); // 스티커 생성
  }

  // 가장 오래된 스티커를 제거하는 함수
  function removeOldestSticker() {
    if (activeStickers.length > 0) {
      const oldest = activeStickers.shift();
      oldest.classList.add('remove'); // 제거 애니메이션
      setTimeout(() => oldest.remove(), 300); // 제거 후 삭제
    }
  }

  // 윈도우 크기 변경 시 스티커 크기 재계산
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      stickerSizeFactor = calculateSizeFactor();
    }, 200);
  }

  // 스티커 리셋 함수
  function reset(shouldRecreate = true) {
    activeStickers.forEach(s => s.classList.add('remove'));
    setTimeout(() => {
      activeStickers.forEach(s => s.remove());
      activeStickers.length = 0;
      lastFourTypes.length = 0;
      stickerSizeFactor = calculateSizeFactor();
      const mainCenter = document.querySelector('.main_center');
      if(mainCenter) {
        mainCenter.remove();
      }
      if(shouldRecreate) placeRandomStickers(); // 리셋 후 랜덤 스티커 생성
    }, 300);
  }

  // 랜덤 스티커 배치 함수
  function placeRandomStickers() {
    const rect = stickerArea.getBoundingClientRect();
    const usedTypes = new Set();

    activeStickers.forEach(s => s.classList.add('remove'));
    setTimeout(() => {
      activeStickers.forEach(s => s.remove());
      activeStickers.length = 0;
      lastFourTypes.length = 0;

      const num = window.innerWidth < 768 ? 3 : 5;
      const allTypes = Object.keys(stickerSets);

      for (let i = 0; i < num; i++) {
        const available = allTypes.filter(t => !usedTypes.has(t));
        if (!available.length) break;
        const randomType = available[Math.floor(Math.random() * available.length)];
        usedTypes.add(randomType);

        const set = stickerSets[randomType];
        const scaledW = set.width * stickerSizeFactor;
        const scaledH = set.height * stickerSizeFactor;
        const margin = Math.max(scaledW, scaledH);

        const x = getRandomNumber(margin, rect.width - margin);
        const y = getRandomNumber(margin, rect.height - margin);
        createSticker(x, y); // 랜덤 스티커 생성
      }
    }, 300);
  }

  // 클릭 이벤트 리스너 등록
  document.addEventListener('click', handleClick);
  window.addEventListener('resize', handleResize);

  cleanup = () => {
    document.removeEventListener('click', handleClick);
    window.removeEventListener('resize', handleResize);
  };

  resetFunction = reset;

  return {
    reset: resetFunction,
    clear: () => resetFunction(false),
    createRandom: placeRandomStickers,
    cleanup
  };
}
