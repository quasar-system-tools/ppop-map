"""Import official LOCALDATA CP949 CSV. Raw source stays outside repository."""
import csv,json,sys,re,datetime
from pathlib import Path
from pyproj import Transformer
transform=Transformer.from_crs('EPSG:5174','EPSG:4326',always_xy=True)
rows=[]; total=active=missing=0; seen=set()
with open(sys.argv[1],encoding='cp949') as f:
 for r in csv.DictReader(f):
  total+=1
  if r['영업상태코드'].strip()!='01': continue
  active+=1
  name=r['사업장명'].strip(); games=r.get('제공게임물명','')
  match=bool(re.search(r'인형|뽑기|크레인|토이|캐쳐|캐처|뽑아|뽑자|뽑방|뽑샵|뽑스|뽑으|뽑는|뽑다|뽑고|뽑타',name+' '+games,re.I))
  try: lng,lat=transform.transform(float(r['좌표정보(X)']),float(r['좌표정보(Y)']))
  except (ValueError,TypeError): missing+=1; continue
  if not (124<lng<132 and 33<lat<39): missing+=1; continue
  uid=r['개방자치단체코드']+'-'+r['관리번호']
  if uid in seen: continue
  seen.add(uid)
  rows.append(dict(id=uid,name=name,address=(r['도로명주소'] or r['지번주소']).strip(),lat=round(lat,6),lng=round(lng,6),candidate=match,updated=r['데이터갱신시점'],source='localdata'))
out=Path(__file__).resolve().parents[1]/'dist/data'
(out/'stores.json').write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')))
meta=dict(source='행정안전부 지방행정 인허가 데이터 · 청소년게임제공업',url='https://www.data.go.kr/data/15045069/fileData.do',downloadUrl='https://file.localdata.go.kr/file/download/youth_game_providers/info',fetchedAt=datetime.date.today().isoformat(),total=total,active=active,mapped=len(rows),candidates=sum(x['candidate'] for x in rows),missingCoordinates=missing,crs='EPSG:5174 → EPSG:4326',classification='상호명·제공게임물명 키워드 기반 후보. 인형뽑기 전문점 여부와 실제 영업 여부 미검증.')
(out/'meta.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)); print(json.dumps(meta,ensure_ascii=False))
