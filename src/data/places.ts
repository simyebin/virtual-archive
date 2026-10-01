export type Place = {
  id: string;
  name: string; // 공간 이름
  city: string; // 도시 · 나라
  kind: string; // 필터 칩: 카페, 서점, 미술관, 건축, 자연, 숙소 …
  visited: string; // e.g. "Aug 2026"
  note: string; // 한 줄 감상
  story?: string; // 상세 보기의 긴 메모
  photo?: string; // /places/파일명.jpg — public/places 폴더에 사진을 넣으세요
  tones: [string, string, string]; // 사진이 없을 때 그려지는 그라데이션 '빛'
  rating?: number; // 0–5, 다시 가고 싶은 정도
  lat: number; // 지도 위치 (위도)
  lng: number; // 지도 위치 (경도)
};

// 샘플 공간. 사진을 public/places/에 넣고 photo: "/places/xxx.jpg"로 연결하면 실제 사진이 보여요.
// lat/lng는 구글 지도에서 장소를 우클릭하면 나오는 좌표를 그대로 넣으면 돼요.
export const places: Place[] = [
  {
    id: "leeum",
    name: "리움미술관",
    city: "서울 · 한남동",
    kind: "미술관",
    visited: "Sep 2026",
    note: "어두운 원통 계단을 따라 내려가는 동안 소리가 사라졌다.",
    story:
      "마리오 보타, 장 누벨, 렘 콜하스 세 건축가의 건물이 한 언덕에 모여 있다. 로툰다 계단에서 위를 올려다보면 천창의 빛이 천천히 떨어진다.",
    tones: ["#2b2622", "#8a7a68", "#e9e2d6"],
    rating: 5,
    lat: 37.5384,
    lng: 126.999,
  },
  {
    id: "choiceok",
    name: "최인아책방",
    city: "서울 · 선릉",
    kind: "서점",
    visited: "Aug 2026",
    note: "천장까지 닿는 서가와 사다리, 책마다 붙은 손글씨 추천.",
    tones: ["#3b2a1d", "#a7744a", "#f0dcc0"],
    rating: 5,
    lat: 37.5045,
    lng: 127.049,
  },
  {
    id: "bonte",
    name: "본태박물관",
    city: "제주 · 안덕",
    kind: "건축",
    visited: "Jun 2026",
    note: "안도 다다오의 노출 콘크리트 위로 물과 하늘이 겹쳐 보였다.",
    story:
      "얕은 수공간을 따라 걷다 보면 벽 사이로 산방산이 액자처럼 걸린다. 쿠사마 야요이의 호박 방도 이곳에 있다.",
    tones: ["#9aa4a8", "#d9dcd8", "#5f7480"],
    rating: 4,
    lat: 33.303,
    lng: 126.394,
  },
  {
    id: "anthracite",
    name: "앤트러사이트 합정",
    city: "서울 · 합정",
    kind: "카페",
    visited: "May 2026",
    note: "신발 공장의 철골과 벽돌이 그대로 남은 곳에서 마신 핸드드립.",
    tones: ["#2f2a26", "#7b5a43", "#c9b59a"],
    rating: 4,
    lat: 37.5468,
    lng: 126.9145,
  },
  {
    id: "teshima",
    name: "테시마 미술관",
    city: "일본 · 테시마",
    kind: "미술관",
    visited: "Apr 2026",
    note: "물방울 하나가 바닥을 굴러가는 걸 한참 동안 바라봤다.",
    story:
      "기둥 하나 없는 하얀 셸 구조물, 천장의 두 개의 구멍으로 바람과 빛이 들어온다. 신발을 벗고 들어가 말없이 앉아 있게 되는 곳.",
    tones: ["#eef0ec", "#c9d3c4", "#7f9a7b"],
    rating: 5,
    lat: 34.4886,
    lng: 134.0899,
  },
  {
    id: "seongsan",
    name: "섭지코지 언덕",
    city: "제주 · 성산",
    kind: "자연",
    visited: "Jun 2026",
    note: "바람이 너무 세서 웃음이 났던 노을 무렵.",
    tones: ["#2e4a63", "#e59a6a", "#f6d8b0"],
    rating: 4,
    lat: 33.424,
    lng: 126.93,
  },
  {
    id: "the-ritual",
    name: "한옥 스테이 '고요'",
    city: "경주 · 황남동",
    kind: "숙소",
    visited: "Mar 2026",
    note: "창호지 너머로 아침 해가 번져 오는 걸 이불 속에서 봤다.",
    tones: ["#4a3a2a", "#c7a678", "#f3e7d2"],
    rating: 5,
    lat: 35.837,
    lng: 129.211,
  },
  {
    id: "louisiana",
    name: "루이지애나 현대미술관",
    city: "덴마크 · 훔레베크",
    kind: "미술관",
    visited: "Jan 2026",
    note: "자코메티 방의 커다란 창 너머로 바다가 계속 움직였다.",
    tones: ["#3e5560", "#9fb4b8", "#e3e7e2"],
    rating: 5,
    lat: 55.969,
    lng: 12.543,
  },
];
