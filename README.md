# 뽑! — 인형뽑기 지도 POC

정적 HTML/JavaScript + Leaflet 지도. 실제 LOCALDATA 영업 등록 업소를 사용합니다. 이름·제공게임물명 키워드 기반 후보 분류이며 전문점 여부·실제 영업은 미검증입니다. 공공데이터와 방문자 입력을 구분하고 가짜 리뷰나 가격을 생성하지 않습니다.

## 개발 및 검증

Node.js 20 이상, Python 3 사용.

- `npm install`
- `npm run dev` — http://localhost:4173
- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build` — 정적 배포 파일과 데이터 무결성 검사

## 데이터 갱신

원본 CSV는 개인 연락처 등이 포함될 수 있어 저장소에 넣지 않습니다. `curl -L --fail -e https://www.localdata.go.kr/ https://file.localdata.go.kr/file/download/youth_game_providers/info -o /tmp/ppop-youth.csv` 로 받고, pyproj가 설치된 Python 환경에서 `python scripts/import-data.py /tmp/ppop-youth.csv` 실행. 공개 산출물에는 매장 식별자·상호·주소·좌표·갱신일·후보 여부만 포함합니다. EPSG:5174를 WGS84로 변환합니다. 필드가 바뀌면 실패하므로 원천을 확인한 뒤 수정해야 합니다.

지도 배경은 OSM 표준 타일을 사용합니다. 대규모 공개 서비스 전 타일 제공 정책과 트래픽에 맞는 공급자를 선정하세요. 현재 지도에서 가까운 최대 200개 마커 / 60개 목록을 표시합니다. 검색·저장한 가게는 전국 기준입니다. 후보 필터를 해제하면 일반 오락실도 표시됩니다.

## POC 범위

매장 검색, 지역 이동, 현재 위치, 저장, 매장 상세, 리뷰·날짜·평점·도전 수·득템 수·게임당 가격·인형·머신 기록, 제보, 필터, 통계, JSON 내보내기. 방문자 데이터는 localStorage에만 저장됩니다. 로그인·공유 DB·사진 업로드·실시간 영업시간·서버 검증은 없습니다. 타인과 공유되는 운영 서비스 전 서버 데이터 모델과 인증·신고·운영 도구가 필요합니다. 제보 좌표는 현재 지도 중심이며 수정 가능합니다.

참고 사진은 로컬에서 UI 참고로만 열람했고 소스·배포에 포함하지 않았습니다.
