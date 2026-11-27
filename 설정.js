/*
  ┌────────────────────────────────────────────────────────┐
  │  방 만들기 — 설정 파일                                   │
  │  이 파일만 고치면 사이트의 가격·폼 주소·가구 치수가 바뀝니다. │
  │  따옴표(" ")와 쉼표(,)는 지우지 마세요.                    │
  │  자세한 방법은 사용법.md 를 보세요.                        │
  └────────────────────────────────────────────────────────┘
*/
window.ROOM_CONFIG = {

  // ① 구글 폼 "미리 채워진 링크"에서 물음표(?) 앞부분을 붙여 넣으세요.
  //    예: "https://docs.google.com/forms/d/e/1FAIpQL.../viewform"
  //    비어 있으면 신청 버튼을 눌렀을 때 "아직 폼이 연결되지 않았어요"라고 나옵니다.
  formUrl: "",

  // ② 폼에 자동으로 적어 넣을 질문의 번호(entry.숫자)입니다.
  //    price     : "본 렌더 가격" 질문 (가격 시험 기록용)
  //    saveCount : "배치 저장 횟수" 질문
  //    예: price: "entry.123456789"
  formFields: {
    price: "",
    saveCount: ""
  },

  // ③ 렌더 가격 후보(원). 방문자마다 이 중 하나를 무작위로 보여 줍니다.
  //    예: [3000, 5000, 9000]
  //    비워 두면 화면에 "가격 미정"으로 나옵니다.
  renderPrices: [],

  // ④ 무료 렌더 횟수 '표시용' 숫자입니다. 실제로 세는 횟수는 서버(Vercel 환경 변수 RENDER_FREE_COUNT, 기본 2)가 정하고,
  //    화면은 서버가 알려 주는 값을 먼저 보여 줍니다. 서버를 못 부를 때만 이 숫자를 씁니다.
  freeRenders: 2,

  // ⑤ 첫 화면 안내 문구. 빈 따옴표("")로 두면 숨겨집니다.
  pilotNotice: "지금은 시범 운영 중이에요. AI 렌더는 처음 2회 무료예요.",

  // ⑥ 방 사진·도면 보관 기간(일). 정하면 숫자로 바꾸세요. null 이면 "아직 정하지 않음"으로 안내합니다.
  retentionDays: null,

  // ⑦ 가구 예시 치수(cm)와 색. 치수는 흔한 예시 값이라 실제 제품 치수로 바꿔 주세요.
  //    w = 가로, h = 세로(깊이), color = 배치도에서 칠할 색 (#으로 시작하는 색 코드)
  //    group = 「가구 추가」에서 묶어 보여 줄 이름. 같은 이름끼리 한 묶음이 됩니다.
  furniture: [
    { group: "침대",      name: "싱글 침대",     w: 100, h: 200, color: "#7CA7EB" },  // 연한 올리브
    { group: "침대",      name: "슈퍼싱글 침대", w: 110, h: 200, color: "#9BBBEF" },  // 올리브
    { group: "침대",      name: "퀸 침대",       w: 150, h: 200, color: "#B7CDF3" },  // 진한 올리브
    { group: "책상·의자", name: "책상",          w: 120, h: 60,  color: "#FFD230" },  // 머스터드
    { group: "책상·의자", name: "의자",          w: 50,  h: 50,  color: "#F0E6DA" },  // 회색
    { group: "침대",      name: "협탁",          w: 40,  h: 40,  color: "#CBB290" },  // 민트 (침대 옆에 놓임)
    { group: "수납",      name: "옷장",          w: 100, h: 60,  color: "#FFA175" },  // 연한 주황
    { group: "수납",      name: "서랍장",        w: 80,  h: 45,  color: "#FC703C" },  // 연보라
    { group: "수납",      name: "책장",          w: 80,  h: 30,  color: "#E1FB62" },  // 연한 파랑
    { group: "수납",      name: "TV장",          w: 150, h: 40,  color: "#FFEDAB" },  // 베이지
    { group: "거실·주방", name: "2인 소파",      w: 150, h: 80,  color: "#D2C7FF" },  // 연한 빨강
    { group: "거실·주방", name: "3인 소파",      w: 200, h: 90,  color: "#A99BE8" },  // 진한 빨강
    { group: "거실·주방", name: "거실 테이블",   w: 100, h: 50,  color: "#FFC4A3" },  // 분홍 (소파 앞에 놓임)
    { group: "거실·주방", name: "식탁",          w: 120, h: 70,  color: "#DCC8A6" },  // 연두
    { group: "거실·주방", name: "냉장고",        w: 60,  h: 65,  color: "#BFE0F5" }   // 하늘색
  ],

  // ⑦-2 「직접 입력」한 가구에 차례대로 돌아가며 칠할 색
  extraColors: ["#FFEDAB", "#D2C7FF", "#FFA175", "#E1FB62", "#7CA7EB", "#CBB290"],

  // ⑧ 문·창문 예시 치수(cm)
  openings: [
    { name: "문",   w: 90,  h: 10, type: "door" },
    { name: "창문", w: 120, h: 10, type: "window" }
  ],

  // ⑧-2 방 종류별 필수 가구 (「자동 배치」를 가구 없이 눌렀을 때 자동으로 넣어 줌)
  //   name = 위 furniture 의 이름, minArea = 방 면적이 이 값(㎡) 이상일 때만 넣음
  //   bed: true 는 방 크기에 맞는 침대 하나, sofa: true 는 방 크기에 맞는 소파 하나
  roomTypes: {
    bedroom: [ { bed: true }, { name: "옷장" }, { name: "협탁", minArea: 8 }, { name: "책상", minArea: 12 }, { name: "의자", minArea: 12 } ],
    living:  [ { sofa: true }, { name: "TV장" }, { name: "거실 테이블", minArea: 9 }, { name: "책장", minArea: 16 } ],
    studio:  [ { bed: true, compact: true }, { name: "책상" }, { name: "의자" }, { name: "옷장" }, { name: "냉장고" }, { name: "협탁", minArea: 14 } ],
    study:   [ { name: "책상" }, { name: "의자" }, { name: "책장" }, { name: "서랍장", minArea: 9 } ],
    kitchen: [ { name: "냉장고" }, { name: "식탁" }, { name: "의자" } ]
  },

  // ⑨ 처음 열었을 때의 방 크기(cm)
  defaultRoom: { w: 300, h: 400 }
};
