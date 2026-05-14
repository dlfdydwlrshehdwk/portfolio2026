if (typeof RoughNotation !== 'undefined') {

const ACCENT = 'rgb(27, 94, 32)';
const ACCENT2 = 'rgb(255, 213, 79)';
const ACCENT3 = 'rgb(255, 241, 118)';
const BLACK  = '#111111';
const RED = 'rgb(244, 67, 54)'
const BLUE = 'rgb(13, 71, 161)';
const PURPLE = 'rgb(74, 20, 140)';
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
  type: 'box', color: BLUE, strokeWidth: 1.5, roughness: 1.5,
  animationDuration: D, iterations: 2,
});

const mainDescHighlight = RoughNotation.annotate(document.querySelector('.main-desc'), {
  type: 'highlight', color: ACCENT2, roughness: 1,
  animationDuration: D, iterations: 1,
});

// desc 줄별 밑줄: 각 span을 순차적으로 그려서 위에서 아래로 흐르는 느낌
const descLines = [...document.querySelectorAll('.desc .desc-line')].map(el =>
  RoughNotation.annotate(el, {
    type: 'underline', color: RED, strokeWidth: 1.5, roughness: 1,
    animationDuration: D, iterations: 1,
  })
);

const descBox = RoughNotation.annotate(document.querySelector('.desc-box'), {
  type: 'box', color: PURPLE, strokeWidth: 1.5, roughness: 1.5,
  animationDuration: D, iterations: 2,
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
