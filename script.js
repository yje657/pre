
const TOKYO_PLACES = [
  { name: "나리타 공항 T3", address: "Chiba, Narita, Furugome", lat: 35.7647, lng: 140.3863 },
  { name: "신주쿠역", address: "Shinjuku City, Tokyo", lat: 35.6905, lng: 139.7006 },
  { name: "시부야 스크램블 교차로", address: "Shinjuku City, Tokyo", lat: 35.6595, lng: 139.7004 },
  { name: "아사쿠사 센소지", address: "2 Chome-3-1 Asakusa, Taito City, Tokyo", lat: 35.7148, lng: 139.7967 },
  { name: "아키하바라 전기상가", address: "Sotokanda, Chiyoda City, Tokyo", lat: 35.6983, lng: 139.7731 },
  { name: "긴자 팡메종", address: "3 Chome-5-2 Ginza, Chuo City, Tokyo", lat: 35.6713, lng: 139.7695 },
  { name: "도쿄타워", address: "4 Chome-2-8 Shibakoen, Minato City, Tokyo", lat: 35.6586, lng: 139.7454 },
  { name: "도쿄 스카이트리", address: "1 Chome-1-2 Oshiage, Sumida City, Tokyo", lat: 35.7100, lng: 139.8107 },
  { name: "롯폰기 힐즈", address: "6 Chome-10-1 Roppongi, Minato City, Tokyo", lat: 35.6604, lng: 139.7292 },
  { name: "메이지 신궁", address: "1-1 Yoyogikamizonocho, Shibuya City, Tokyo", lat: 35.6764, lng: 139.6993 },
  { name: "시부야 마크시티", address: "1 Chome-12-1 Dogenzaka, Shibuya City, Tokyo", lat: 35.6581, lng: 139.6995 },
  { name: "바스타 신주쿠", address: "5 Chome-24 Sendagaya, Shibuya City, Tokyo", lat: 35.6887, lng: 139.7005 },
  { name: "후지큐 하이랜드", address: "5 Chome-6-1 Shinishihara, Fujiyoshida, Yamanashi", lat: 35.4872, lng: 138.7806 },
  { name: "도쿄 디즈니씨", address: "1-1 Maihama, Urayasu, Chiba", lat: 35.6267, lng: 139.8881 },
  { name: "돈키호테 신주쿠가부키초점", address: "1 Chome-16-5 Kabukicho, Shinjuku City, Tokyo", lat: 35.6954, lng: 139.7020 }
];

const INITIAL_DATA = {
  1: [
    { time: "10:55", name: "나리타 공항 T3", sub: "도착 & N'EX 이동", lat: 35.7647, lng: 140.3863, isMemo: false },
    { time: "12:30", name: "신주쿠역", sub: "짐 맡기기 및 주변 탐방", lat: 35.6905, lng: 139.7006, isMemo: false },
    { time: "14:00", name: "시부야 마크시티", sub: "쇼핑 및 점심 식사", lat: 35.6581, lng: 139.6995, isMemo: false }
  ],
  2: [
    { time: "09:30", name: "아사쿠사 센소지", sub: "전통 거리 산책", lat: 35.7148, lng: 139.7967, isMemo: false },
    { time: "12:00", name: "아키하바라 전기상가", sub: "거리 구경 & 점심", lat: 35.6983, lng: 139.7731, isMemo: false },
    { time: "14:30", name: "긴자 팡메종", sub: "원조 소금빵 테이크아웃", lat: 35.6713, lng: 139.7695, isMemo: false },
    { time: "16:00", name: "도쿄타워", sub: "일몰 및 야경 감상", lat: 35.6586, lng: 139.7454, isMemo: false }
  ],
  3: [
    { time: "06:45", name: "바스타 신주쿠", sub: "고속버스 탑승", lat: 35.6887, lng: 139.7005, isMemo: false },
    { time: "09:00", name: "후지큐 하이랜드", sub: "어트랙션 즐기기", lat: 35.4872, lng: 138.7806, isMemo: false }
  ],
  4: [
    { time: "08:30", name: "도쿄 디즈니씨", sub: "종일 관람", lat: 35.6267, lng: 139.8881, isMemo: false }
  ],
  5: [
    { time: "07:18", name: "신주쿠역", sub: "공항철도 탑승", lat: 35.6905, lng: 139.7006, isMemo: false },
    { time: "11:50", name: "나리타 공항 T3", sub: "귀국", lat: 35.7647, lng: 140.3863, isMemo: false }
  ]
};

let currentDay = 1;
let tripData = {};
let map = null;
let markers = [];
let activeInfoWindow = null;
let flightPath = null;

window.onload = () => {
  loadTripData();
  initBottomSheetGesture();
};

window.initMap = function() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: 35.6812, lng: 139.7671 },
    disableDefaultUI: true,
    zoomControl: false
  });

  renderDay(currentDay);
  initExplorationMarkers();
};

setTimeout(() => {
  if (!map && typeof google !== 'undefined' && google.maps) {
    initMap();
  }
}, 1000);

function initBottomSheetGesture() {
  const sheet = document.getElementById('bottomSheet');
  const handleBar = document.getElementById('sheetHandleBar');
  const container = document.getElementById('appContainer');

  let startY = 0;
  let startHeight = 0;
  let isDragging = false;

  function onStart(e) {
    isDragging = true;
    sheet.classList.add('dragging');
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startHeight = sheet.getBoundingClientRect().height;
  }

  function onMove(e) {
    if (!isDragging) return;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = startY - currentY;
    const containerHeight = container.getBoundingClientRect().height;
    let newHeight = startHeight + deltaY;

    const minHeight = containerHeight * 0.3;
    const maxHeight = containerHeight * 0.88;

    if (newHeight < minHeight) newHeight = minHeight;
    if (newHeight > maxHeight) newHeight = maxHeight;

    sheet.style.height = `${newHeight}px`;
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    sheet.classList.remove('dragging');
  }

  handleBar.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onEnd);

  handleBar.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
}

/* 장소 검색 자동완성 */
function filterPlaces(query) {
  const listEl = document.getElementById('autocompleteList');
  listEl.innerHTML = '';

  if (!query.trim()) {
    listEl.style.display = 'none';
    return;
  }

  const filtered = TOKYO_PLACES.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) {
    listEl.style.display = 'none';
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'autocomplete-item';
    div.innerHTML = `
      <span>📍</span>
      <div>
        <div style="font-weight:700; font-size:0.9rem;">${item.name}</div>
        <div style="font-size:0.75rem; color:#64748b;">${item.address}</div>
      </div>
    `;

    div.onclick = () => {
      document.getElementById('placeSearchInput').value = item.name;
      document.getElementById('placeLat').value = item.lat;
      document.getElementById('placeLng').value = item.lng;
      listEl.style.display = 'none';
    };

    listEl.appendChild(div);
  });

  listEl.style.display = 'block';
}

function loadTripData() {
  const saved = localStorage.getItem('tokyo_planner_v30_complete');

  if (saved) {
    tripData = JSON.parse(saved);
  } else {
    tripData = JSON.parse(JSON.stringify(INITIAL_DATA));
    saveTripData();
  }
}

function saveTripData() {
  localStorage.setItem(
    'tokyo_planner_v30_complete',
    JSON.stringify(tripData)
  );
}

function selectDay(day) {
  currentDay = day;

  const chips = document.querySelectorAll('.day-chip');

  chips.forEach((chip, index) => {
    if (index + 1 === day) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  renderDay(day);
}

/* 지도 위 추천 장소 핀 표시 */
function initExplorationMarkers() {
  TOKYO_PLACES.forEach(place => {
    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: map,
      title: place.name,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    });

    const infowindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px 12px; font-family: sans-serif; min-width: 160px;">
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">
            ${place.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            ${place.address}
          </div>
          <button
            onclick="addPlaceFromMap('${place.name.replace(/'/g, "\\'")}', ${place.lat}, ${place.lng})"
            style="width: 100%; margin-top: 8px; background: #2563eb; color: white; border: none; border-radius: 8px; padding: 6px 0; font-size: 11px; font-weight: 700; cursor: pointer;">
            + Day ${currentDay} 일정에 추가
          </button>
        </div>
      `
    });

    marker.addListener('click', () => {
      if (activeInfoWindow) activeInfoWindow.close();
      infowindow.open(map, marker);
      activeInfoWindow = infowindow;
    });
  });
}

window.addPlaceFromMap = function(name, lat, lng) {
  const dayPlaces = tripData[currentDay] || [];
  let defaultTime = "12:00";

  if (dayPlaces.length > 0) {
    const lastTime = dayPlaces[dayPlaces.length - 1].time;

    if (lastTime) {
      let [hour, min] = lastTime.split(':').map(Number);
      hour = (hour + 2) % 24;
      defaultTime =
        `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
  }

  tripData[currentDay].push({
    time: defaultTime,
    name: name,
    sub: "지도에서 추가됨",
    lat: lat,
    lng: lng,
    isMemo: false
  });

  saveTripData();
  renderDay(currentDay);

  if (activeInfoWindow) activeInfoWindow.close();

  alert(`Day ${currentDay} 일정에 '${name}'이(가) 추가되었습니다!`);
};

function renderDay(day) {
  const places = tripData[day] || [];
  const listEl = document.getElementById('timelineList');
  listEl.innerHTML = '';

  if (flightPath) flightPath.setMap(null);

  const bounds = new google.maps.LatLngBounds();
  const pathCoords = [];

  places.forEach((place, index) => {
    const placeNum = index + 1;
    const pos = { lat: place.lat, lng: place.lng };

    if (!place.isMemo) {
      pathCoords.push(pos);
      bounds.extend(pos);
    }

    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item';

    if (!place.isMemo) {
      itemEl.onclick = () => {
        map.setCenter(pos);
        map.setZoom(14);
      };
    }

    const isLast = index === places.length - 1;

    itemEl.innerHTML = `
      <div class="timeline-left">
        <div class="number-badge"
          style="${place.isMemo ? 'background:#94a3b8;' : ''}">
          ${place.isMemo ? '📌' : placeNum}
        </div>
        ${!isLast ? '<div class="timeline-line"></div>' : ''}
      </div>

      <div class="place-card"
        style="${place.isMemo ? 'background:#fef9c3; border-color:#fef08a;' : ''}">
        <button class="delete-btn"
          onclick="event.stopPropagation(); deletePlace(${index})">✕</button>
        <div class="place-time">${place.time || ''}</div>
        <div class="place-title">${place.name}</div>
        <div class="place-sub">${place.sub}</div>
      </div>
    `;

    listEl.appendChild(itemEl);

    if (!isLast && !place.isMemo) {
      const nextPlace = places[index + 1];

      if (nextPlace && !nextPlace.isMemo) {
        const dist = calculateDistance(
          place.lat, place.lng,
          nextPlace.lat, nextPlace.lng
        );

        const distEl = document.createElement('div');
        distEl.className = 'distance-wrapper';
        distEl.innerHTML =
          `<div class="distance-badge">${dist}km</div>`;

        listEl.appendChild(distEl);
      }
    }
  });

  if (pathCoords.length > 0 && map) {
    flightPath = new google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: '#2563eb',
      strokeOpacity: 0.85,
      strokeWeight: 3
    });

    flightPath.setMap(map);
    map.fitBounds(bounds);
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d < 10 ? d.toFixed(1) : Math.round(d);
}

function openPage(pageId) {
  document.getElementById(pageId).classList.add('active');
}

function closePage(pageId) {
  document.getElementById(pageId).classList.remove('active');

  if (pageId === 'addPage') {
    document.getElementById('placeTimeInput').value = '';
    document.getElementById('placeSearchInput').value = '';
    document.getElementById('placeSubInput').value = '';
    document.getElementById('placeLat').value = '';
    document.getElementById('placeLng').value = '';
    document.getElementById('autocompleteList').style.display = 'none';
  } else {
    document.getElementById('memoTimeInput').value = '';
    document.getElementById('memoTextInput').value = '';
  }
}

function addPlace() {
  const time = document.getElementById('placeTimeInput').value;
  const name = document.getElementById('placeSearchInput').value.trim();
  const sub = document.getElementById('placeSubInput').value.trim();

  let lat = parseFloat(document.getElementById('placeLat').value);
  let lng = parseFloat(document.getElementById('placeLng').value);

  if (!time) {
    alert('시간을 선택해 주세요.');
    return;
  }

  if (!name) {
    alert('장소명을 입력하거나 선택해 주세요.');
    return;
  }

  if (isNaN(lat) || isNaN(lng)) {
    lat = 35.6812 + (Math.random() - 0.5) * 0.03;
    lng = 139.7671 + (Math.random() - 0.5) * 0.03;
  }

  tripData[currentDay].push({
    time,
    name,
    sub: sub || "일정",
    lat,
    lng,
    isMemo: false
  });

  saveTripData();
  closePage('addPage');
  renderDay(currentDay);
}

function addMemo() {
  const time = document.getElementById('memoTimeInput').value;
  const text = document.getElementById('memoTextInput').value.trim();

  if (!time) {
    alert('시간을 선택해 주세요.');
    return;
  }

  if (!text) {
    alert('메모 내용을 입력해 주세요.');
    return;
  }

  tripData[currentDay].push({
    time,
    name: text,
    sub: "메모",
    lat: 35.6812,
    lng: 139.7671,
    isMemo: true
  });

  saveTripData();
  closePage('memoPage');
  renderDay(currentDay);
}

function deletePlace(index) {
  if (confirm('이 항목을 삭제하시겠습니까?')) {
    tripData[currentDay].splice(index, 1);
    saveTripData();
    renderDay(currentDay);
  }
}
