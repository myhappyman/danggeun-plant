// 물주기 주의사항 문구 (체크박스 설명 + 결과 글에서 공통 사용)
const WATER_NOTE = '집 환경에 따라 물주기는 달라질 수 있어요.';

// 단계 정의: 한 항목 = 한 화면 (꼼꼼 작성 = 전체 12단계)
const ALL_STEPS = [
  { name: 'plantName',   emoji: '🌿', label: '식물명 / 품종', hint: '어떤 식물인가요? 품종까지 적으면 좋아요', placeholder: '예: 몬스테라 델리시오사', type: 'input' },
  { name: 'size',        emoji: '📏', label: '크기',          hint: '화분 포함 높이 또는 몇 호분에 심어져 있는지 적어주세요', placeholder: '예: 화분 포함 약 45cm',           type: 'input' },
  { name: 'condition',   emoji: '🌱', label: '상태',          hint: '잎 수, 새순, 병충해 여부 등',           placeholder: '예: 잎 6장, 새순 중 / 병충해 없음', type: 'input' },
  { name: 'period',      emoji: '📅', label: '키운 기간',     hint: '얼마나 키우셨나요?',                    placeholder: '예: 작년 봄부터 1년 넘게',         type: 'input' },
  { name: 'light',       emoji: '☀️', label: '광량',          hint: '어떤 빛을 좋아하는 아이인가요?',        placeholder: '예: 밝은 음지 (직사광 X)',         type: 'input' },
  { name: 'water',       emoji: '💧', label: '물주기',        hint: '물 주는 주기를 적어주세요',             placeholder: '예: 겉흙 마르면, 보통 주 1회',     type: 'input',
    checkbox: { name: 'waterNote', label: '주의사항 추가하기', desc: WATER_NOTE, warn: true } },
  { name: 'pot',         emoji: '🪴', label: '화분 포함 여부', hint: '화분 포함인지, 분갈이가 필요한지',      placeholder: '예: 토분 포함 / 분갈이 불필요',    type: 'input' },
  { name: 'tradeMethod', emoji: '📦', label: '거래 방식',     hint: '희망하는 거래 방식을 모두 선택하세요',   type: 'checks', options: ['직거래', '문고리 거래', '택배'] },
  { name: 'price',       emoji: '💰', label: '가격',          hint: '판매 가격을 적어주세요',                placeholder: '예: 25,000원',                     type: 'input',
    checkbox: { name: 'shippingSeparate', label: '택배비 별도', reveal: { name: 'shippingFee', placeholder: '예: 택배비 3,500원' } } },
  { name: 'location',    emoji: '📍', label: '거래 위치',     hint: '동네나 거래 가능한 지점',               placeholder: '예: 망원동 / 합정역 인근',         type: 'input' },
  { name: 'time',        emoji: '⏰', label: '거래 가능 시간', hint: '언제 거래가 가능하세요?',              placeholder: '예: 평일 저녁, 주말 종일',         type: 'input' },
  { name: 'message',     emoji: '💬', label: '한마디',        hint: '분양 이유나 키우기 팁을 자유롭게',      placeholder: '예: 화분이 늘어 정리 중이에요 🙂', type: 'textarea' },
];

// 간단 작성: 꼭 필요한 7가지만 (ALL_STEPS 순서를 유지하며 골라냄)
const SIMPLE_NAMES = ['plantName', 'condition', 'tradeMethod', 'price', 'location', 'time', 'message'];
const SIMPLE_STEPS = ALL_STEPS.filter((s) => SIMPLE_NAMES.includes(s.name));

let steps = ALL_STEPS;  // 현재 선택된 모드의 단계 목록 (시작 화면에서 결정)
const data = {};        // 입력값 누적 저장소
let current = 0;        // 현재 단계 (steps.length 이면 결과 화면)

// ----- 화면 요소 -----
const $ = (id) => document.getElementById(id);
const fieldContainer = $('field-container');
const extraContainer = $('extra-container');
let field = null;        // 현재 단계의 입력 요소 (input/textarea)
let checkbox = null;      // 현재 단계의 주의사항 체크박스 (없으면 null)
let choiceInputs = null;  // 'checks' 타입 단계의 옵션 체크박스 배열 (없으면 null)
let revealInput = null;   // 체크 시 나타나는 추가 입력칸 (없으면 null)

// 아이콘 모양 데이터 (stroke 기반, currentColor를 따라감)
const ICON_SHAPES = {
  prev:    [['polyline', { points: '15 18 9 12 15 6' }]],
  skip:    [['polyline', { points: '13 17 18 12 13 7' }], ['polyline', { points: '6 17 11 12 6 7' }]],
  next:    [['polyline', { points: '9 18 15 12 9 6' }]],
  check:   [['polyline', { points: '20 6 9 17 4 12' }]],
  restart: [['polyline', { points: '1 4 1 10 7 10' }], ['path', { d: 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10' }]],
  copy:    [['rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }], ['path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }]],
  home:    [['path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }], ['polyline', { points: '9 22 9 12 15 12 15 22' }]],
  warn:    [['path', { d: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }], ['line', { x1: '12', y1: '9', x2: '12', y2: '13' }], ['line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }]],
};

// 모양 데이터로 SVG 아이콘 요소를 생성
function icon(name, size = 18) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const [tag, attrs] of ICON_SHAPES[name]) {
    const el = document.createElementNS(ns, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    svg.appendChild(el);
  }
  return svg;
}

// 버튼에 아이콘 + 글자를 설정 (iconRight=true 면 아이콘을 글자 오른쪽에)
function setButton(el, iconName, text, iconRight = false) {
  el.textContent = '';
  const span = document.createElement('span');
  span.textContent = text;
  if (iconRight) el.append(span, icon(iconName));
  else el.append(icon(iconName), span);
}

function updateProgress() {
  const total = steps.length;
  const done = Math.min(current + 1, total); // 현재 단계까지 포함 → 마지막 단계에서 100%
  $('progress-fill').style.width = (done / total) * 100 + '%';
  $('progress-text').textContent = current < total
    ? `${current + 1} / ${total}`
    : '완료';
}

function renderStep() {
  if (current >= steps.length) { renderResult(); return; }

  $('step-screen').classList.remove('hidden');
  $('result-screen').classList.add('hidden');
  $('btn-home').classList.remove('hidden'); // 작성 중에는 "처음으로" 노출

  const step = steps[current];
  $('step-emoji').textContent = step.emoji;
  $('step-label').textContent = step.label;
  $('step-hint').textContent = step.hint;

  // 입력 영역 초기화
  fieldContainer.innerHTML = '';
  field = null;
  choiceInputs = null;
  checkbox = null;
  revealInput = null;

  // "다음/확인" 활성화 조건
  //  - 텍스트: 1글자 이상 / 옵션: 1개 이상 선택
  //  - 펼침 입력칸(reveal)이 켜져 있으면 그 칸도 1글자 이상 필요 (예: 택배비 별도)
  const toggleConfirm = () => {
    let hasValue = choiceInputs
      ? choiceInputs.some((cb) => cb.checked)
      : field.value.trim().length >= 1;
    if (hasValue && revealInput && checkbox && checkbox.checked) {
      hasValue = revealInput.value.trim().length >= 1;
    }
    $('btn-confirm').disabled = !hasValue;
  };

  if (step.type === 'checks') {
    // 복수 선택 체크박스: 옵션 정의 순서대로 렌더
    choiceInputs = [];
    const selected = Array.isArray(data[step.name]) ? data[step.name] : [];
    for (const opt of step.options) {
      const row = document.createElement('label');
      row.className = 'choice-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = opt;
      cb.checked = selected.includes(opt); // 이전 선택 복원
      cb.addEventListener('change', toggleConfirm);
      const span = document.createElement('span');
      span.textContent = opt;
      row.append(cb, span);
      fieldContainer.appendChild(row);
      choiceInputs.push(cb);
    }
  } else {
    // 텍스트 입력 (input 또는 textarea)
    field = document.createElement(step.type === 'textarea' ? 'textarea' : 'input');
    field.className = 'field';
    field.placeholder = step.placeholder;
    field.value = data[step.name] || '';   // 이전에 입력했던 값 복원
    fieldContainer.appendChild(field);
    field.focus({ preventScroll: true });
    field.addEventListener('input', toggleConfirm);
    // Enter 키로도 확인 (textarea 제외)
    // e.isComposing: 한글 등 조합 중에 누른 Enter(글자 확정용)는 무시 → 중복 이동 방지
    if (step.type !== 'textarea') {
      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing && !$('btn-confirm').disabled) {
          e.preventDefault(); // 엔터의 기본 입력 동작 차단 → 다음 textarea에 줄바꿈이 새는 것 방지
          confirmStep();
        }
      });
    }
  }
  toggleConfirm();

  // 선택: 보조 체크박스 (step.checkbox 가 있을 때만)
  //   warn:   빨간 경고 스타일 + 경고 아이콘
  //   desc:   설명 줄
  //   reveal: 체크 시 나타나는 추가 입력칸
  extraContainer.innerHTML = '';
  checkbox = null;
  revealInput = null;
  if (step.checkbox) {
    const cfg = step.checkbox;
    const row = document.createElement('label');
    row.className = cfg.warn ? 'checkbox-row warn' : 'checkbox-row';
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!data[cfg.name]; // 이전 선택 상태 복원

    const text = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'cb-label';
    if (cfg.warn) label.appendChild(icon('warn'));
    const labelText = document.createElement('span');
    labelText.textContent = cfg.label;
    label.appendChild(labelText);
    text.appendChild(label);
    if (cfg.desc) {
      const desc = document.createElement('div');
      desc.className = 'cb-desc';
      desc.textContent = cfg.desc;
      text.appendChild(desc);
    }
    row.append(checkbox, text);
    extraContainer.appendChild(row);

    // 체크 시 나타나는 추가 입력칸
    if (cfg.reveal) {
      const wrap = document.createElement('div');
      wrap.className = 'reveal-wrap';
      revealInput = document.createElement('input');
      revealInput.className = 'field';
      revealInput.placeholder = cfg.reveal.placeholder || '';
      revealInput.value = data[cfg.reveal.name] || ''; // 이전 입력 복원
      revealInput.addEventListener('input', toggleConfirm);
      wrap.appendChild(revealInput);
      extraContainer.appendChild(wrap);

      const syncReveal = () => {
        wrap.style.display = checkbox.checked ? 'block' : 'none';
        toggleConfirm(); // 체크 상태 변화에 따라 활성화 재평가
      };
      syncReveal(); // 초기 상태 (자동 포커스 없음)
      checkbox.addEventListener('change', () => {
        syncReveal();
        // 체크하는 순간(사용자 제스처)에만 자동 포커스 + 화면 안으로 스크롤
        if (checkbox.checked) {
          revealInput.focus();
          revealInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
    }
  }

  // 마지막 단계에서만 "확인"(체크), 그 외에는 "다음"(화살표)
  const isLast = current === steps.length - 1;
  // 다음: 화살표를 글자 오른쪽 / 확인: 체크를 글자 왼쪽
  setButton($('btn-confirm'), isLast ? 'check' : 'next', isLast ? '확인' : '다음', !isLast);

  $('btn-prev').disabled = current === 0;
  $('step-screen').scrollTop = 0; // 새 단계는 항상 최상단부터 보이게
  updateProgress();
}

// 현재 단계의 입력값 + 체크박스 상태를 함께 저장
function saveCurrent() {
  const step = steps[current];
  if (choiceInputs) {
    // 옵션 정의 순서를 유지한 채 체크된 값만 저장
    data[step.name] = choiceInputs.filter((cb) => cb.checked).map((cb) => cb.value);
  } else if (field) {
    data[step.name] = field.value.trim();
  }
  if (step.checkbox) {
    data[step.checkbox.name] = checkbox ? checkbox.checked : false;
    if (step.checkbox.reveal && revealInput) data[step.checkbox.reveal.name] = revealInput.value.trim();
  }
}

function confirmStep() {
  saveCurrent();
  current++;
  renderStep();
}
function skipStep() {
  const step = steps[current];
  data[step.name] = step.type === 'checks' ? [] : ''; // 비우고 건너뜀
  if (step.checkbox) {
    data[step.checkbox.name] = false;
    if (step.checkbox.reveal) data[step.checkbox.reveal.name] = '';
  }
  current++;
  renderStep();
}
function prevStep() {
  if (current === 0) return;
  saveCurrent();                                   // 입력 중이던 값·체크 보존
  current--;
  renderStep();
}

function renderResult() {
  $('step-screen').classList.add('hidden');
  $('result-screen').classList.remove('hidden');
  $('btn-home').classList.add('hidden'); // 결과 화면엔 이미 "처음부터" 버튼이 있음
  $('output').textContent = buildListingText(data);
  updateProgress();
}

/**
 * 폼 데이터를 당근에 올릴 거래글 텍스트로 변환합니다.
 *
 * @param {Object} data - { plantName, size, condition, period, light, water,
 *                          pot, price, tradeMethod, location, time, message }
 * @returns {string} 완성된 거래글 텍스트
 *
 * TODO(당신의 차례입니다): 이 함수 본문을 작성해주세요.
 *   핵심 결정 → "비어 있는(건너뛴) 항목을 글에서 생략할지, 표시할지"
 */
function buildListingText(data) {
  const lines = [];

  // 제목: 식물명
  if (data.plantName) lines.push(`🌿 ${data.plantName}\n`);

  // 물주기: 주의사항 체크 시 안내 문구를 한 줄 덧붙임
  const waterText = (data.water && data.waterNote)
    ? `${data.water}\n   ※ ${WATER_NOTE}`
    : data.water;

  // 거래 방식: 선택한 옵션들을 " / "로 연결 (예: 직거래 / 문고리 거래 / 택배)
  const tradeText = Array.isArray(data.tradeMethod)
    ? data.tradeMethod.join(' / ')
    : data.tradeMethod;

  // 가격: 택배비 별도 체크 시 괄호로 덧붙임
  let priceText = data.price;
  if (data.price && data.shippingSeparate) {
    priceText = data.shippingFee
      ? `${data.price} (택배비 별도 ${data.shippingFee})`
      : `${data.price} (택배비 별도)`;
  }

  // 본문 항목: 화면(STEPS) 단계 순서와 동일
  const rows = [
    [data.size,        '📏 크기'],
    [data.condition,   '🌱 상태'],
    [data.period,      '📅 키운 기간'],
    [data.light,       '☀️ 광량'],
    [waterText,        '💧 물주기'],
    [data.pot,         '🪴 화분 포함'],
    [tradeText,        '📦 거래 방식'],
    [priceText,        '💰 가격'],
    [data.location,    '📍 거래 위치'],
    [data.time,        '⏰ 거래 가능 시간'],
  ];

  // 건너뛴(빈) 항목은 줄째로 생략
  rows
    .filter(([value]) => value)
    .forEach(([value, label]) => lines.push(`${label}: ${value}`));

  // 한마디는 맨 아래 별도 문단
  if (data.message) lines.push(`\n💬 ${data.message}`);

  return lines.join('\n') || '입력한 내용이 없어요. 처음부터 다시 채워주세요.';
}

// 선택한 모드로 작성 시작
function startFlow(mode) {
  steps = mode === 'simple' ? SIMPLE_STEPS : ALL_STEPS;
  for (const k in data) delete data[k]; // 새 작성 — 입력 초기화
  current = 0;
  $('start-screen').classList.add('hidden');
  $('result-screen').classList.add('hidden');
  $('progress').classList.remove('hidden');
  renderStep();
}

// 시작 화면(모드 선택)으로 되돌아가기
function goToStart() {
  for (const k in data) delete data[k];
  current = 0;
  $('step-screen').classList.add('hidden');
  $('result-screen').classList.add('hidden');
  $('progress').classList.add('hidden');
  $('start-screen').classList.remove('hidden');
}

// 처음으로 돌아가기 확인 모달 열기/닫기
function openConfirm() { $('confirm-modal').classList.remove('hidden'); }
function closeConfirm() { $('confirm-modal').classList.add('hidden'); }

// ----- 버튼 연결 -----
$('btn-simple').addEventListener('click', () => startFlow('simple'));
$('btn-detail').addEventListener('click', () => startFlow('detail'));
$('btn-confirm').addEventListener('click', confirmStep);
$('btn-skip').addEventListener('click', skipStep);
$('btn-prev').addEventListener('click', prevStep);
$('btn-back').addEventListener('click', () => { current = steps.length - 1; renderStep(); });
$('btn-restart').addEventListener('click', goToStart);

// "처음으로": 작성 내용이 초기화되므로 모달로 한 번 더 확인
$('btn-home').addEventListener('click', openConfirm);
$('btn-modal-cancel').addEventListener('click', closeConfirm);
$('btn-modal-confirm').addEventListener('click', () => { closeConfirm(); goToStart(); });
// 배경(딤) 클릭 시 닫기 — 모달 내부 클릭은 무시
$('confirm-modal').addEventListener('click', (e) => {
  if (e.target === $('confirm-modal')) closeConfirm();
});
// Esc 키로 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('confirm-modal').classList.contains('hidden')) closeConfirm();
});
$('btn-copy').addEventListener('click', async () => {
  const text = $('output').textContent;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove();
  }
  const toast = $('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
});

// 고정 버튼 아이콘 (확인/다음 버튼은 단계마다 renderStep에서 갱신)
setButton($('btn-prev'), 'prev', '이전');
setButton($('btn-skip'), 'skip', '건너뛰기', true);
setButton($('btn-back'), 'prev', '이전');
setButton($('btn-restart'), 'restart', '처음부터');
setButton($('btn-copy'), 'copy', '복사하기');
$('btn-home').appendChild(icon('home', 18)); // 아이콘만 (라벨은 aria-label)

// 키보드가 올라와도 진행바가 보이도록, 앱 높이를 "실제로 보이는 영역"에 맞춤
const appEl = document.querySelector('.app');
const vv = window.visualViewport;
function fitToViewport() {
  if (!vv) return;
  appEl.style.height = vv.height + 'px';
  // iOS에서 키보드로 화면이 밀릴 때 보이는 영역 상단에 맞춰 보정
  appEl.style.transform = `translateY(${vv.offsetTop}px)`;
}
if (vv) {
  vv.addEventListener('resize', fitToViewport);
  vv.addEventListener('scroll', fitToViewport);
  fitToViewport();
}

// 시작 화면(모드 선택)이 기본으로 표시됨 — 모드 선택 시 renderStep() 진입
