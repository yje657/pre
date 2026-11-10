
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
let selectedLocationMarker = null;
let geocoder = null;
let mapSelectionRequestId = 0;

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
  geocoder = new google.maps.Geocoder();
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

/* 장소 검색 자동완성 (결과 없을 때 목록 숨김) */
function filterPlaces(query) {
  const listEl = document.getElementById('autocompleteList');
  listEl.innerHTML = '';

  if (!query.trim()) {
    listEl.style.display = 'none';
    return;
  }

  const filtered = TOKYO_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

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
  localStorage.setItem('tokyo_planner_v30_complete', JSON.stringify(tripData));
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

/* 지도 위에 추천 장소 표시 (기본 핀 완벽 제거 + 프라이머리 원형 번호 뱃지 + 리스트 연동) */
function initExplorationMarkers() {
  TOKYO_PLACES.forEach((place, index) => {
    const placeNum = index + 1;

    // 기본 핀 아이콘을 제거하고 SVG 원형 뱃지만 생성
    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: map,
      title: place.name,
      label: {
        text: String(placeNum),
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: "11px"
      },
      icon: {
        path: "M 0,0 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0", // 원형 SVG 경로 (scale 조정 가능)
        fillColor: "#2563eb", // 프라이머리 블루
        fillOpacity: 1,
        strokeColor: "#ffffff", // 흰색 테두리
        strokeWeight: 2,
        scale: 1,
        labelOrigin: new google.maps.Point(0, 0) // 라벨을 원 중앙에 정렬
      }
    });

    const infowindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px 12px; font-family: sans-serif; min-width: 160px;">
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${placeNum}. ${place.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${place.address}</div>
          <button onclick="addPlaceFromMap('${place.name.replace(/'/g, "\\'")}', ${place.lat}, ${place.lng})" style="width: 100%; margin-top: 8px; background: #2563eb; color: white; border: none; border-radius: 8px; padding: 6px 0; font-size: 11px; font-weight: 700; cursor: pointer;">+ Day ${currentDay} 일정에 추가</button>
        </div>
      `
    });

    marker.addListener('click', () => {
      if (activeInfoWindow) activeInfoWindow.close();
      infowindow.open(map, marker);
      activeInfoWindow = infowindow;
    });

    // 리스트 클릭 시 해당 마커 인포윈도우를 열기 위해 전역 배열에 저장
    markers.push({ name: place.name, marker: marker, infowindow: infowindow });
  });
}

/* 리스트 항목 클릭 시 지도 이동 및 해당 핀의 인포윈도우 열기 */
function focusMarker(placeName) {
  const found = markers.find(m => m.name === placeName);
  if (found) {
    map.setCenter(found.marker.getPosition());
    map.setZoom(14);
    if (activeInfoWindow) activeInfoWindow.close();
    found.infowindow.open(map, found.marker);
    activeInfoWindow = found.infowindow;
  }
}

function locationToLiteral(location) {
  if (!location) return null;
  const lat = typeof location.lat === 'function' ? location.lat() : Number(location.lat);
  const lng = typeof location.lng === 'function' ? location.lng() : Number(location.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function distanceInMeters(a, b) {
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

async function getAddressForLocation(latLng) {
  try {
    if (!geocoder) geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({ location: latLng });
    return response.results?.[0]?.formatted_address || '';
  } catch (error) {
    console.warn('선택한 위치의 주소를 찾지 못했습니다.', error);
    return '';
  }
}

async function getPlaceDetailsById(placeId) {
  try {
    const { Place } = await google.maps.importLibrary('places');
    const place = new Place({ id: placeId });
    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'location', 'primaryTypeDisplayName']
    });
    return place;
  } catch (error) {
    console.warn('선택한 장소의 상세 정보를 가져오지 못했습니다.', error);
    return null;
  }
}

async function getNearestPlace(latLng) {
  try {
    // Places API (New)가 활성화되어 있으면 선택 지점 주변의 실제 장소명을 검색합니다.
    const { Place, SearchNearbyRankPreference } =
      await google.maps.importLibrary('places');

    const response = await Place.searchNearby({
      fields: [
        'displayName',
        'location',
        'formattedAddress',
        'primaryTypeDisplayName'
      ],
      locationRestriction: {
        center: latLng,
        radius: 120
      },
      maxResultCount: 5,
      rankPreference: SearchNearbyRankPreference.DISTANCE
    });

    return response.places?.[0] || null;
  } catch (error) {
    // Places API가 활성화되지 않았더라도 아래 역지오코딩 주소로 저장할 수 있습니다.
    console.warn('주변 장소 검색을 사용할 수 없어 주소로 대체합니다.', error);
    return null;
  }
}

function makeSelectionInfoContent(name, address, category, day, saveLocation) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'min-width:210px;max-width:260px;padding:4px 2px;font-family:Arial,sans-serif;color:#0f172a;';

  const heading = document.createElement('div');
  heading.textContent = name;
  heading.style.cssText = 'font-size:14px;font-weight:800;line-height:1.4;margin:2px 26px 5px 0;';
  wrap.appendChild(heading);

  if (category) {
    const categoryEl = document.createElement('div');
    categoryEl.textContent = category;
    categoryEl.style.cssText = 'font-size:11px;color:#2563eb;font-weight:700;margin-bottom:4px;';
    wrap.appendChild(categoryEl);
  }

  const addressEl = document.createElement('div');
  addressEl.textContent = address || '주소 정보를 찾지 못했습니다.';
  addressEl.style.cssText = 'font-size:11px;line-height:1.45;color:#64748b;margin-bottom:10px;white-space:normal;';
  wrap.appendChild(addressEl);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.textContent = `Day ${day} 일정에 저장`;
  saveButton.style.cssText = 'width:100%;border:0;border-radius:9px;background:#2563eb;color:#fff;padding:9px 12px;font-size:12px;font-weight:800;cursor:pointer;';
  saveButton.addEventListener('click', () => {
    addPlaceFromMap(name, saveLocation.lat, saveLocation.lng,
      category ? `${category}${address ? ` · ${address}` : ''}` : address || '지도에서 선택한 위치');
  });
  wrap.appendChild(saveButton);

  const hint = document.createElement('div');
  hint.textContent = `현재 선택 날짜: Day ${day}`;
  hint.style.cssText = 'font-size:10px;color:#94a3b8;text-align:center;margin-top:6px;';
  wrap.appendChild(hint);

  return wrap;
}

async function showSelectedLocation(latLng, exactPlaceId = null) {
  const requestId = ++mapSelectionRequestId;
  const clickedLocation = locationToLiteral(latLng);
  if (!clickedLocation) return;

  if (selectedLocationMarker) selectedLocationMarker.setMap(null);
  selectedLocationMarker = new google.maps.Marker({
    map,
    position: latLng,
    title: '선택한 위치',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: '#f97316',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2
    }
  });

  if (activeInfoWindow) activeInfoWindow.close();
  activeInfoWindow = new google.maps.InfoWindow({
    content: '<div style="padding:8px 12px;font-size:12px;color:#475569;">주변 장소 정보를 찾는 중...</div>'
  });
  activeInfoWindow.open(map, selectedLocationMarker);

  const [address, nearbyPlace] = await Promise.all([
    getAddressForLocation(latLng),
    exactPlaceId ? getPlaceDetailsById(exactPlaceId) : getNearestPlace(latLng)
  ]);

  // 사용자가 다른 위치를 다시 눌렀다면 이전 검색 결과는 무시합니다.
  if (requestId !== mapSelectionRequestId) return;

  const nearbyLocation = nearbyPlace ? locationToLiteral(nearbyPlace.location) : null;
  const isSameNearbyPlace = Boolean(nearbyPlace) && (
    Boolean(exactPlaceId) || (nearbyLocation &&
      distanceInMeters(clickedLocation, nearbyLocation) <= 120)
  );

  const placeName = isSameNearbyPlace && nearbyPlace.displayName
    ? nearbyPlace.displayName
    : '선택한 위치';
  const placeAddress = (isSameNearbyPlace && nearbyPlace.formattedAddress)
    ? nearbyPlace.formattedAddress
    : address;
  const category = isSameNearbyPlace
    ? (nearbyPlace.primaryTypeDisplayName || '')
    : '';
  const saveLocation = (isSameNearbyPlace && nearbyLocation) ? nearbyLocation : clickedLocation;

  activeInfoWindow.setContent(
    makeSelectionInfoContent(placeName, placeAddress, category, currentDay, saveLocation)
  );
  activeInfoWindow.open(map, selectedLocationMarker);
}

window.addPlaceFromMap = function(name, lat, lng, description) {
  if (!tripData[currentDay]) tripData[currentDay] = [];

  const dayPlaces = tripData[currentDay];
  let defaultTime = '12:00';

  if (dayPlaces.length > 0) {
    const lastPlace = [...dayPlaces].reverse().find(place => !place.isMemo && place.time);
    if (lastPlace) {
      let [hour, min] = lastPlace.time.split(':').map(Number);
      hour = (hour + 2) % 24;
      defaultTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
  }

  tripData[currentDay].push({
    time: defaultTime,
    name,
    sub: description || '지도에서 저장',
    lat,
    lng,
    isMemo: false
  });

  saveTripData();
  if (activeInfoWindow) activeInfoWindow.close();
  if (selectedLocationMarker) {
    selectedLocationMarker.setMap(null);
    selectedLocationMarker = null;
  }
  renderDay(currentDay);
};

function makeNumberedPinIcon(number) {
  const fontSize = number > 9 ? 11 : 13;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <path d="M20 1C9.5 1 1 9.5 1 20c0 13 19 27 19 27s19-14 19-27C39 9.5 30.5 1 20 1Z" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
      <circle cx="20" cy="19" r="11.5" fill="#1d4ed8"/>
      <text x="20" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${number}</text>
    </svg>`;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(40, 48),
    anchor: new google.maps.Point(20, 47)
  };
}

function renderDay(day) {
  const places = tripData[day] || [];
  const listEl = document.getElementById('timelineList');
  listEl.innerHTML = '';

  // 이전 날짜의 번호 핀을 모두 지운 다음 현재 날짜 핀만 다시 표시합니다.
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  if (flightPath) flightPath.setMap(null);

  const bounds = new google.maps.LatLngBounds();
  const pathCoords = [];
  let placeNumber = 0;

  places.forEach((place, index) => {
    const pos = { lat: Number(place.lat), lng: Number(place.lng) };
    const isMemo = Boolean(place.isMemo);
    const displayNumber = isMemo ? null : ++placeNumber;

    if (!isMemo) {
      pathCoords.push(pos);
      bounds.extend(pos);

      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: `${displayNumber}. ${place.name}`,
        icon: makeNumberedPinIcon(displayNumber),
        optimized: true
      });

      marker.addListener('click', () => {
        map.panTo(pos);
        map.setZoom(Math.max(map.getZoom() || 13, 14));
      });
      markers.push(marker);
    }

    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item';

    if (!isMemo) {
      itemEl.onclick = () => {
        map.setCenter(pos);
        map.setZoom(14);
      };
    }

    const isLast = index === places.length - 1;
    itemEl.innerHTML = `
      <div class="timeline-left">
        <div class="number-badge" style="${isMemo ? 'background:#94a3b8;' : ''}">${isMemo ? '📌' : displayNumber}</div>
        ${!isLast ? '<div class="timeline-line"></div>' : ''}
      </div>
      <div class="place-card" style="${isMemo ? 'background:#fef9c3; border-color:#fef08a;' : ''}">
        <button class="delete-btn" onclick="event.stopPropagation(); deletePlace(${index})">✕</button>
        <div class="place-time">${place.time || ''}</div>
        <div class="place-title"></div>
        <div class="place-sub"></div>
      </div>
    `;

    itemEl.querySelector('.place-title').textContent = place.name || '';
    itemEl.querySelector('.place-sub').textContent = place.sub || '';
    listEl.appendChild(itemEl);

    if (!isLast && !isMemo) {
      const nextPlace = places.slice(index + 1).find(item => !item.isMemo);
      if (nextPlace) {
        const dist = calculateDistance(place.lat, place.lng, nextPlace.lat, nextPlace.lng);
        const distEl = document.createElement('div');
        distEl.className = 'distance-wrapper';
        distEl.innerHTML = `<div class="distance-badge">${dist}km</div>`;
        listEl.appendChild(distEl);
      }
    }
  });

  if (pathCoords.length > 1 && map) {
    flightPath = new google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: '#2563eb',
      strokeOpacity: 0.85,
      strokeWeight: 3
    });
    flightPath.setMap(map);
    map.fitBounds(bounds, 48);
  } else if (pathCoords.length === 1 && map) {
    map.setCenter(pathCoords[0]);
    map.setZoom(14);
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

  if (!tripData[currentDay]) tripData[currentDay] = [];
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

  if (!tripData[currentDay]) tripData[currentDay] = [];
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
