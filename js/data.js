const ACCOMMODATION = {
  lat: 37.5569974,
  lng: 126.937875,
  name: "住宿",
  address: "" // 待填
};

const REGIONS = [
  {
    id: "hongdae",
    name: "弘大・新村・合井",
    nameKo: "홍대·신촌·합정",
    color: "#F7C59F",
    center: { lat: 37.555, lng: 126.922 },
    zoomLevel: 4,
    bounds: { minLat: 37.540, maxLat: 37.572, minLng: 126.900, maxLng: 126.945 },
    subways: [
      { name: "홍대입구", line: "2", color: "#00a84d", lat: 37.5573, lng: 126.9248 },
      { name: "신촌", line: "2", color: "#00a84d", lat: 37.5553, lng: 126.9368 },
      { name: "합정", line: "2", color: "#00a84d", lat: 37.5499, lng: 126.9148 },
      { name: "망원", line: "6", color: "#cd6e2c", lat: 37.5558, lng: 126.9101 },
    ]
  },
  {
    id: "seongsu",
    name: "聖水・纛島",
    nameKo: "성수·뚝섬",
    color: "#C8E6C9",
    center: { lat: 37.543, lng: 127.055 },
    zoomLevel: 4,
    bounds: { minLat: 37.530, maxLat: 37.558, minLng: 127.030, maxLng: 127.075 },
    subways: [
      { name: "성수", line: "2", color: "#00a84d", lat: 37.5445, lng: 127.0560 },
      { name: "뚝섬", line: "2", color: "#00a84d", lat: 37.5475, lng: 127.0473 },
    ]
  },
  {
    id: "gangnam",
    name: "江南・蠶室・松坡",
    nameKo: "강남·잠실·송파",
    color: "#E1BEE7",
    center: { lat: 37.510, lng: 127.060 },
    zoomLevel: 5,
    bounds: { minLat: 37.495, maxLat: 37.530, minLng: 127.020, maxLng: 127.115 },
    subways: [
      { name: "강남", line: "2", color: "#00a84d", lat: 37.4979, lng: 127.0276 },
      { name: "잠실", line: "2", color: "#00a84d", lat: 37.5133, lng: 127.1001 },
      { name: "선릉", line: "2", color: "#00a84d", lat: 37.5047, lng: 127.0489 },
    ]
  },
  {
    id: "gyeongbok",
    name: "景福宮・北村・仁寺洞",
    nameKo: "경복궁·북촌·인사동",
    color: "#FFECB3",
    center: { lat: 37.578, lng: 126.982 },
    zoomLevel: 4,
    bounds: { minLat: 37.565, maxLat: 37.592, minLng: 126.968, maxLng: 126.998 },
    subways: [
      { name: "경복궁", line: "3", color: "#ef7c1c", lat: 37.5760, lng: 126.9769 },
      { name: "안국", line: "3", color: "#ef7c1c", lat: 37.5784, lng: 126.9851 },
    ]
  },
  {
    id: "myeongdong",
    name: "明洞・鐘路",
    nameKo: "명동·종로",
    color: "#FFCDD2",
    center: { lat: 37.563, lng: 126.988 },
    zoomLevel: 4,
    bounds: { minLat: 37.554, maxLat: 37.575, minLng: 126.975, maxLng: 127.005 },
    subways: [
      { name: "명동", line: "4", color: "#00a5de", lat: 37.5606, lng: 126.9854 },
      { name: "을지로입구", line: "2", color: "#00a84d", lat: 37.5663, lng: 126.9826 },
    ]
  },
  {
    id: "yeouido",
    name: "汝矣島",
    nameKo: "여의도",
    color: "#B3E5FC",
    center: { lat: 37.526, lng: 126.928 },
    zoomLevel: 4,
    bounds: { minLat: 37.518, maxLat: 37.538, minLng: 126.912, maxLng: 126.945 },
    subways: [
      { name: "여의도", line: "5", color: "#9c27b0", lat: 37.5217, lng: 126.9244 },
      { name: "여의나루", line: "5", color: "#9c27b0", lat: 37.5283, lng: 126.9323 },
    ]
  },
  {
    id: "incheon",
    name: "仁川",
    nameKo: "인천",
    color: "#CFD8DC",
    center: { lat: 37.464, lng: 126.370 },
    zoomLevel: 4,
    bounds: { minLat: 37.450, maxLat: 37.480, minLng: 126.350, maxLng: 126.395 },
    subways: []
  }
];

// Category definitions
const CATEGORIES = {
  "逛逛逛": { icon: "🛍️", color: "#7EC8E3", label: "逛逛逛" },
  "衣食行": { icon: "🍽️", color: "#F4A460", label: "餐廳食物" },
  "SVT":    { icon: "💎", color: "#9B7EC8", label: "SVT" },
  "PLAVE":  { icon: "🎮", color: "#7EC8A0", label: "PLAVE" },
};

const PLACES = [
  // === 逛逛逛 ===
  {
    id: 1, category: "逛逛逛", region: "hongdae",
    nameCn: "有貓文創", nameKo: "고양이가 있는 액자가게",
    lat: 37.5608615, lng: 126.9259885,
    address: "", note: "15:00-20:00"
  },
  {
    id: 2, category: "逛逛逛", region: "seongsu",
    nameCn: "metamong PLAYGROUND 展覽＆商店", nameKo: "metamong PLAYGROUND",
    lat: 37.5411231, lng: 127.0548807,
    address: "서울 성동구 성수일로7가길 9", note: "5/1～6/21 | 10:00–21:00"
  },
  {
    id: 3, category: "逛逛逛", region: "gyeongbok",
    nameCn: "韓服男（漢服租借）", nameKo: "한복 대여",
    lat: 37.5761968, lng: 126.9732928,
    address: "", note: "9:00-19:00"
  },
  {
    id: 4, category: "逛逛逛", region: "seongsu",
    nameCn: "Olive Young N Seongsu", nameKo: "올리브영 N 성수",
    lat: 37.5441151, lng: 127.054556,
    address: "", note: "Pokémon 30th 限定 | 5/1～5/31 | 10:00–22:00"
  },
  {
    id: 5, category: "逛逛逛", region: "seongsu",
    nameCn: "首爾林公園（寶可夢秘密森林）", nameKo: "서울숲공원",
    lat: 37.5443878, lng: 127.0374424,
    address: "", note: "5/1～6/21 | 12:00–19:00"
  },
  {
    id: 6, category: "逛逛逛", region: "gangnam",
    nameCn: "奉恩寺（追星求符）", nameKo: "봉은사",
    lat: 37.514852, lng: 127.0573766,
    address: "", note: "追星求符"
  },
  {
    id: 7, category: "逛逛逛", region: "hongdae",
    nameCn: "KT&G想像廣場", nameKo: "KT&G 상상마당",
    lat: 37.550912, lng: 126.921127,
    address: "", note: "11:00-21:00"
  },
  {
    id: 8, category: "逛逛逛", region: "seongsu",
    nameCn: "大狗勾 HAUS NOWHERE SEOUL", nameKo: "하우스 노웨어 서울",
    lat: 37.5380654, lng: 127.0589486,
    address: "", note: "11:00-21:00"
  },
  {
    id: 9, category: "逛逛逛", region: "hongdae",
    nameCn: "貓咖 Roof Cat Me", nameKo: "루프캣미 고양이카페 홍대점",
    lat: 37.5549057, lng: 126.9221227,
    address: "", note: "12:00-22:00 | 入場費₩20000 | 放飯秀13:30＆18:30 | 每月1・3週一休"
  },
  {
    id: 10, category: "逛逛逛", region: "hongdae",
    nameCn: "Object文創", nameKo: "오브젝트 서교점",
    lat: 37.5557157, lng: 126.9297943,
    address: "", note: "11:00-21:00"
  },
  {
    id: 11, category: "逛逛逛", region: "hongdae",
    nameCn: "KPOP店 POCA SPOT", nameKo: "POCA SPOT Hong-dae",
    lat: 37.5559974, lng: 126.9278006,
    address: "", note: "11:00-21:00"
  },
  {
    id: 12, category: "逛逛逛", region: "gyeongbok",
    nameCn: "北村韓屋村", nameKo: "북촌 한옥마을",
    lat: 37.5814696, lng: 126.9849519,
    address: "", note: "10:00-17:00"
  },
  {
    id: 13, category: "逛逛逛", region: "yeouido",
    nameCn: "汝矣島現代百貨 Tiffany", nameKo: "티파니앤코 더현대서울점",
    lat: 37.526056, lng: 126.9283112,
    address: "", note: "10:20-20:00"
  },
  {
    id: 14, category: "逛逛逛", region: "hongdae",
    nameCn: "卡套娃包 DUCKY WORLD", nameKo: "더키월드",
    lat: 37.556163, lng: 126.9270205,
    address: "", note: "10:00-23:00"
  },
  {
    id: 15, category: "逛逛逛", region: "hongdae",
    nameCn: "合井 Homeplus 超市", nameKo: "홈플러스 합정점",
    lat: 37.5508451, lng: 126.9136823,
    address: "", note: "10:00-22:00"
  },
  {
    id: 16, category: "逛逛逛", region: "hongdae",
    nameCn: "望遠市場", nameKo: "망원시장",
    lat: 37.5559018, lng: 126.9062854,
    address: "", note: "9:00-21:00"
  },
  {
    id: 17, category: "逛逛逛", region: "gyeongbok",
    nameCn: "景福宮 夜景", nameKo: "경복궁 야간관람",
    lat: 37.579617, lng: 126.977041,
    address: "", note: "19:00-21:30 | 前一天預約 | 一・二公休"
  },
  {
    id: 18, category: "逛逛逛", region: "gangnam",
    nameCn: "漢江公園", nameKo: "한강공원",
    lat: 37.5270005, lng: 127.0198894,
    address: "", note: ""
  },
  {
    id: 19, category: "逛逛逛", region: "myeongdong",
    nameCn: "韓國國立中央博物館", nameKo: "국립중앙박물관",
    lat: 37.5238506, lng: 126.9804702,
    address: "", note: ""
  },
  {
    id: 20, category: "逛逛逛", region: "hongdae",
    nameCn: "安利美特 弘大店", nameKo: "애니메이트 홍대점",
    lat: 37.5580543, lng: 126.9260821,
    address: "", note: ""
  },
  {
    id: 21, category: "逛逛逛", region: "hongdae",
    nameCn: "彩妝 Hemeko", nameKo: "Hemeko cosmetics",
    lat: 37.5544781, lng: 126.922186,
    address: "", note: ""
  },
  {
    id: 22, category: "逛逛逛", region: "hongdae",
    nameCn: "Chaakan Shoes 鞋店", nameKo: "Chaakan Shoes",
    lat: 37.5552022, lng: 126.9257315,
    address: "", note: ""
  },
  {
    id: 23, category: "逛逛逛", region: "hongdae",
    nameCn: "潮牌衣服 Å LAND", nameKo: "Å LAND Hongdae",
    lat: 37.5531753, lng: 126.9211488,
    address: "", note: ""
  },

  // === 衣食行 ===
  {
    id: 101, category: "衣食行", region: "hongdae",
    nameCn: "薄朱世界", nameKo: "요거브릭 MintChoco World",
    lat: 37.5653622, lng: 126.9220697,
    address: "", note: ""
  },
  {
    id: 102, category: "衣食行", region: "hongdae",
    nameCn: "兔子停 Tokkijung", nameKo: "홍대 레스토랑 토끼정 프로젝트",
    lat: 37.5517138, lng: 126.9206841,
    address: "", note: ""
  },
  {
    id: 103, category: "衣食行", region: "seongsu",
    nameCn: "好食包 Haz Bakery", nameKo: "Haz Bakery",
    lat: 37.5432858, lng: 127.0537459,
    address: "", note: ""
  },
  {
    id: 104, category: "衣食行", region: "hongdae",
    nameCn: "豚壽百 豬肉湯飯", nameKo: "돈수백 홍대직영",
    lat: 37.5568937, lng: 126.9252929,
    address: "", note: "00:00–24:00 | 週日21:00～週一09:00休"
  },
  {
    id: 105, category: "衣食行", region: "gyeongbok",
    nameCn: "1人1杯 韓屋景觀咖啡", nameKo: "1인1잔",
    lat: 37.6410605, lng: 126.9378889,
    address: "", note: "10:00-20:50 | 週一休"
  },
  {
    id: 106, category: "衣食行", region: "gangnam",
    nameCn: "防彈姨母食堂（有情食堂）", nameKo: "유정식당",
    lat: 37.518326, lng: 127.0280524,
    address: "", note: "11:00-21:00"
  },
  {
    id: 107, category: "衣食行", region: "myeongdong",
    nameCn: "米其林炸雞 Jadam Chicken", nameKo: "자담치킨 서울종로점",
    lat: 37.5694613, lng: 126.9864278,
    address: "", note: "11:00-00:00"
  },
  {
    id: 108, category: "衣食行", region: "seongsu",
    nameCn: "歐式麵包 오뜨르베이커리", nameKo: "오뜨르베이커리",
    lat: 37.5363207, lng: 127.124696,
    address: "", note: "9:00-20:00"
  },
  {
    id: 109, category: "衣食行", region: "hongdae",
    nameCn: "牛腸 Uweol Korean BBQ", nameKo: "우월소곱창 마포직영점",
    lat: 37.5423977, lng: 126.9489678,
    address: "", note: "14:30-23:00"
  },
  {
    id: 110, category: "衣食行", region: "gangnam",
    nameCn: "歐洲甜品咖啡店 Antique Coffee", nameKo: "앤티크커피 잠실점",
    lat: 37.5075951, lng: 127.1063569,
    address: "", note: "12:00-22:00"
  },
  {
    id: 111, category: "衣食行", region: "myeongdong",
    nameCn: "明洞布丁 GONGGANGAB", nameKo: "공간갑",
    lat: 37.5654498, lng: 126.9902755,
    address: "", note: "11:45-21:50"
  },
  {
    id: 112, category: "衣食行", region: "hongdae",
    nameCn: "明太魚湯 진시황북어국", nameKo: "진시황북어국",
    lat: 37.5434957, lng: 126.9528366,
    address: "", note: "07:00-19:00 | 韓牛牛骨+明太魚幹"
  },
  {
    id: 113, category: "衣食行", region: "incheon",
    nameCn: "仁川百年教堂咖啡館 MADELIM", nameKo: "메이드림",
    lat: 37.4637063, lng: 126.3697273,
    address: "", note: "10:00-20:30"
  },
  {
    id: 114, category: "衣食行", region: "hongdae",
    nameCn: "山山炸雞 신촌본점", nameKo: "산산바베큐치킨 신촌본점",
    lat: 37.5584656, lng: 126.934829,
    address: "", note: ""
  },
  {
    id: 115, category: "衣食行", region: "hongdae",
    nameCn: "Isaac Toast 弘大店", nameKo: "이삭토스트 홍대점",
    lat: 37.5527498, lng: 126.9239655,
    address: "", note: "8:00-21:00"
  },
  {
    id: 116, category: "衣食行", region: "hongdae",
    nameCn: "Egg Drop 弘大店", nameKo: "에그드랍 홍대입구점",
    lat: 37.5537548, lng: 126.9229814,
    address: "", note: "8:00-22:30"
  },
  {
    id: 117, category: "衣食行", region: "gangnam",
    nameCn: "烏冬 Tebo", nameKo: "Tebo",
    lat: 37.5219682, lng: 127.0204442,
    address: "", note: ""
  },
  {
    id: 118, category: "衣食行", region: "hongdae",
    nameCn: "新村復古麻辣居酒屋 기중상점", nameKo: "기중상점",
    lat: 37.5581239, lng: 126.9358523,
    address: "", note: "17:00-03:00"
  },
  {
    id: 119, category: "衣食行", region: "hongdae",
    nameCn: "魔法感咖啡 holzwege", nameKo: "숲길 holzwege",
    lat: 37.5551221, lng: 126.9133203,
    address: "", note: ""
  },

  // === SVT ===
  {
    id: 201, category: "SVT", region: "gangnam",
    nameCn: "牛骨 백년손님", nameKo: "백년손님 BNSN",
    lat: 37.5305228, lng: 127.007148,
    address: "", note: ""
  },
  {
    id: 202, category: "SVT", region: "hongdae",
    nameCn: "韓菓 T.nomad", nameKo: "T.nomad",
    lat: 37.5569333, lng: 126.9046728,
    address: "", note: ""
  },
  {
    id: 203, category: "SVT", region: "myeongdong",
    nameCn: "banila co.", nameKo: "banila co.",
    lat: 37.5620404, lng: 126.9847427,
    address: "", note: ""
  },
  {
    id: 204, category: "SVT", region: "hongdae",
    nameCn: "Yudeullen（DK）", nameKo: "Yudeullen",
    lat: 37.5545156, lng: 126.9261009,
    address: "", note: ""
  },
  {
    id: 205, category: "SVT", region: "seongsu",
    nameCn: "Bree Coffee（JOSHUA）", nameKo: "Bree Coffee",
    lat: 37.5229622, lng: 127.0566269,
    address: "", note: "8:00-20:00"
  },
  {
    id: 206, category: "SVT", region: "myeongdong",
    nameCn: "SVT應援咖啡 마린커피", nameKo: "마린커피 빅히트사옥점",
    lat: 37.5244515, lng: 126.9647697,
    address: "", note: "5/22-5/26 | 平日12-19 | 週末11-19"
  },
  {
    id: 207, category: "SVT", region: "gangnam",
    nameCn: "Alver Coffee Gangnam（SVT MV拍攝地）", nameKo: "Alver Coffee",
    lat: 37.503075, lng: 127.0281117,
    address: "서울 강남구 강남대로102길 34", note: "10:00-23:00"
  },
  {
    id: 208, category: "SVT", region: "myeongdong",
    nameCn: "Bree Coffee Sinyongsan（JOSHUA）", nameKo: "Bree Coffee 신용산점",
    lat: 37.5291734, lng: 126.9698692,
    address: "", note: ""
  },
  {
    id: 209, category: "SVT", region: "gangnam",
    nameCn: "Cercle Hannam（JEONGHAN）", nameKo: "Cercle Hannam",
    lat: 37.5355528, lng: 126.9983639,
    address: "", note: ""
  },
  {
    id: 210, category: "SVT", region: "gangnam",
    nameCn: "Yogurbrick 석촌호수점（Joshua）", nameKo: "요거브릭 석촌호수점",
    lat: 37.5037975, lng: 127.0986398,
    address: "", note: ""
  },
  {
    id: 211, category: "SVT", region: "myeongdong",
    nameCn: "Hybe Headquarters", nameKo: "HYBE 본사",
    lat: 37.5244204, lng: 126.9640498,
    address: "", note: ""
  },
  {
    id: 212, category: "SVT", region: "gangnam",
    nameCn: "CAFE ichi seoul", nameKo: "카페 이치 서울",
    lat: 37.5192314, lng: 127.0205123,
    address: "", note: ""
  },
  {
    id: 213, category: "SVT", region: "seongsu",
    nameCn: "Ki bakery", nameKo: "Ki bakery",
    lat: 37.5419211, lng: 127.048477,
    address: "", note: ""
  },
  {
    id: 214, category: "SVT", region: "myeongdong",
    nameCn: "水芹料理 Neungdong Minari", nameKo: "능동미나리",
    lat: 37.5300853, lng: 126.9707875,
    address: "", note: ""
  },
  {
    id: 215, category: "SVT", region: "seongsu",
    nameCn: "Podong Pudding", nameKo: "Podong Pudding",
    lat: 37.5470396, lng: 127.0410594,
    address: "", note: ""
  },

  // === PLAVE ===
  {
    id: 301, category: "PLAVE", region: "gangnam",
    nameCn: "都銀虎刀削麵 Hwangdo Bajirak Kalguksu", nameKo: "황도바지락칼국수",
    lat: 37.5042618, lng: 127.1060332,
    address: "", note: "10:00-22:00"
  },
  {
    id: 302, category: "PLAVE", region: "hongdae",
    nameCn: "蔡斑比冷麵 乙密臺", nameKo: "을밀대 본점",
    lat: 37.5475184, lng: 126.9455288,
    address: "", note: "11:00-22:00"
  },
  {
    id: 303, category: "PLAVE", region: "hongdae",
    nameCn: "蔡斑比飯 Haejubang", nameKo: "Haejubang",
    lat: 37.5548665, lng: 126.9127965,
    address: "", note: "11:30–15:00、17:30–23:00"
  },
  {
    id: 304, category: "PLAVE", region: "hongdae",
    nameCn: "ASTERUM 433-10（5/26 12:30 已訂位）", nameKo: "ASTERUM 433-10",
    lat: 37.5670752, lng: 126.9269455,
    address: "", note: "✅ BOOKED 5/26 12:30"
  },
  {
    id: 305, category: "PLAVE", region: "hongdae",
    nameCn: "VLAST 블래스트（1）", nameKo: "VLAST 블래스트",
    lat: 37.5515438, lng: 126.9197803,
    address: "", note: ""
  },
  {
    id: 306, category: "PLAVE", region: "gangnam",
    nameCn: "VLAST 블래스트（2）", nameKo: "VLAST 블래스트",
    lat: 37.5177699, lng: 127.0292406,
    address: "", note: ""
  },
];
