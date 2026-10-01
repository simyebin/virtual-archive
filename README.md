# Virtual Archive — 책과 공간

내가 읽은 책(3D 책장)과 다녀온 멋진 공간(폴라로이드 벽)을 모아 둔 개인 아카이브.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 를 Vercel·Netlify 등에 배포
```

## 내 데이터로 바꾸기

- **책** — `src/data/books.ts`의 `seeds` 배열. Goodreads에서 `goodreads_library_export.csv`를 내보내 프로젝트 폴더에 두고
  Claude에게 "이 CSV로 books.ts를 다시 만들어줘"라고 하면 됩니다. 책등 색은 표지에서 자동으로 뽑혀요.
- **공간** — `src/data/places.ts`. 사진을 `public/places/`에 넣고 `photo: "/places/파일명.jpg"`로 연결하세요.
  사진이 없으면 `tones` 세 색으로 그린 빛 그라데이션이 대신 보여요. `kind`가 필터 칩이 됩니다.
