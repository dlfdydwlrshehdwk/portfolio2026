if (typeof RoughNotation !== 'undefined') {

const ACCENT = '#cfff00';
const BLACK  = '#111111';
const D      = 400;   // 기본 애니메이션 지속 시간 ms
const GAP    = 120;   // 단계 사이 간격 ms

const roleFe = RoughNotation.annotate(document.querySelector('.role-fe'), {
  type: 'circle', color: ACCENT, strokeWidth: 1.5, roughness: 1.5,
  animationDuration: D, iterations: 1,
});

const roleWp = RoughNotation.annotate(document.querySelector('.role-wp'), {
  type: 'circle', color: ACCENT, strokeWidth: 1.5, roughness: 1.5,
  animationDuration: D, iterations: 1,
});

const nameBox = RoughNotation.annotate(document.querySelector('.name-kdh'), {
  type: 'box', color: BLACK, strokeWidth: 1.5, roughness: 1.5,
  animationDuration: D, iterations: 1,
});

const mainDescHighlight = RoughNotation.annotate(document.querySelector('.main-desc'), {
  type: 'highlight', color: ACCENT, roughness: 1,
  animationDuration: D, iterations: 1,
});

// desc 줄별 밑줄: 각 span을 순차적으로 그려서 위에서 아래로 흐르는 느낌
const descLines = [...document.querySelectorAll('.desc .desc-line')].map(el =>
  RoughNotation.annotate(el, {
    type: 'underline', color: BLACK, strokeWidth: 1.5, roughness: 1,
    animationDuration: D, iterations: 1,
  })
);

const descBox = RoughNotation.annotate(document.querySelector('.desc-box'), {
  type: 'box', color: ACCENT, strokeWidth: 1.5, roughness: 1.5,
  animationDuration: D, iterations: 1,
});

// 위에서 아래로 순차 실행
let cursor = 0;

function at(offset) {
  cursor += offset;
  return cursor;
}

setTimeout(() => roleFe.show(),            at(0));
setTimeout(() => roleWp.show(),            at(D + GAP));
setTimeout(() => nameBox.show(),           at(D + GAP));
setTimeout(() => mainDescHighlight.show(), at(D + GAP));
descLines.forEach(line => {
  setTimeout(() => line.show(), at(D + GAP));
});
setTimeout(() => descBox.show(), at(D + GAP));

}
