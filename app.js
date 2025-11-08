// 전역 변수
let map;
let markers = [];
let userLocation = null;
let selectedHospital = null;

// 지도 초기화 (한국 중심)
function initMap() {
    const mapContainer = document.getElementById('map');
    
    // 기본 중심 좌표 (서울)
    const defaultCenter = { lat: 37.5665, lng: 126.9780 };
    
    // 캔버스 기반 지도 렌더링
    const canvas = document.createElement('canvas');
    canvas.width = mapContainer.clientWidth;
    canvas.height = mapContainer.clientHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    mapContainer.appendChild(canvas);
    
    map = {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        center: defaultCenter,
        zoom: 7,
        markers: []
    };
    
    renderMap();
    addHospitalMarkers();
}

// 지도 렌더링
function renderMap() {
    const { ctx, canvas, center, zoom } = map;
    
    // 배경
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 격자 그리기
    ctx.strokeStyle = '#d0e8f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // 마커 그리기
    map.markers.forEach(marker => {
        const pos = latLngToPixel(marker.lat, marker.lng);
        
        // 마커 그림자
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(pos.x + 2, pos.y + 2, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 마커 배경
        if (marker.type === 'user') {
            ctx.fillStyle = '#dc3545';
        } else {
            ctx.fillStyle = '#667eea';
        }
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 마커 테두리
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 마커 아이콘
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(marker.icon, pos.x, pos.y);
        
        // 라벨
        if (marker.label) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(pos.x - 60, pos.y + 20, 120, 25);
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.fillText(marker.label, pos.x, pos.y + 32);
        }
    });
}

// 위경도를 픽셀 좌표로 변환
function latLngToPixel(lat, lng) {
    const { canvas, center, zoom } = map;
    
    // 간단한 메르카토르 투영
    const scale = Math.pow(2, zoom) * 100;
    const x = canvas.width / 2 + (lng - center.lng) * scale;
    const y = canvas.height / 2 - (lat - center.lat) * scale;
    
    return { x, y };
}

// 픽셀 좌표를 위경도로 변환
function pixelToLatLng(x, y) {
    const { canvas, center, zoom } = map;
    const scale = Math.pow(2, zoom) * 100;
    
    const lng = center.lng + (x - canvas.width / 2) / scale;
    const lat = center.lat - (y - canvas.height / 2) / scale;
    
    return { lat, lng };
}

// 병원 마커 추가
function addHospitalMarkers() {
    map.markers = [];
    
    const selectedType = document.getElementById('hospitalType').value;
    
    hospitalData.forEach(hospital => {
        if (selectedType === 'all' || hospital.type === selectedType) {
            map.markers.push({
                lat: hospital.lat,
                lng: hospital.lng,
                icon: '🏥',
                label: hospital.name,
                type: 'hospital',
                data: hospital
            });
        }
    });
    
    if (userLocation) {
        map.markers.push({
            lat: userLocation.lat,
            lng: userLocation.lng,
            icon: '📍',
            label: '내 위치',
            type: 'user'
        });
    }
    
    renderMap();
}

// 거리 계산 (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 병원 목록 업데이트
function updateHospitalList() {
    const listContent = document.getElementById('listContent');
    const selectedType = document.getElementById('hospitalType').value;
    
    let hospitals = hospitalData.filter(h => 
        selectedType === 'all' || h.type === selectedType
    );
    
    // 사용자 위치가 있으면 거리순 정렬
    if (userLocation) {
        hospitals = hospitals.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng)
        })).sort((a, b) => a.distance - b.distance);
    }
    
    listContent.innerHTML = hospitals.map(hospital => `
        <div class="hospital-item" onclick="showHospitalInfo(${hospital.id})">
            <div class="hospital-name">${hospital.name}</div>
            <div class="hospital-info">📍 ${hospital.address}</div>
            <div class="hospital-info">🏥 ${hospital.type} | 🛏️ ${hospital.beds}병상</div>
            <div class="hospital-info">⚕️ ${hospital.departments.slice(0, 3).join(', ')}${hospital.departments.length > 3 ? ' 외' : ''}</div>
            ${hospital.distance ? `<div class="hospital-distance">📏 거리: ${hospital.distance.toFixed(2)} km</div>` : ''}
        </div>
    `).join('');
}

// 병원 상세 정보 표시
function showHospitalInfo(hospitalId) {
    const hospital = hospitalData.find(h => h.id === hospitalId);
    if (!hospital) return;
    
    selectedHospital = hospital;
    
    let distance = '';
    if (userLocation) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng);
        distance = `<div class="hospital-distance">📏 거리: ${dist.toFixed(2)} km</div>`;
    }
    
    const infoPanel = document.getElementById('infoPanel');
    const infoPanelContent = document.getElementById('infoPanelContent');
    
    infoPanelContent.innerHTML = `
        <div class="detail-section">
            <h3>${hospital.name}</h3>
            ${distance}
        </div>
        
        <div class="detail-section">
            <div class="detail-item">
                <span class="detail-label">병원 종류:</span>
                <span class="detail-value">${hospital.type}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">병상 수:</span>
                <span class="detail-value">${hospital.beds}병상</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">전화번호:</span>
                <span class="detail-value">${hospital.phone}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>주소</h3>
            <div class="detail-item">
                <span class="detail-value">${hospital.address}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>진료과</h3>
            ${hospital.departments.map(dept => `
                <div class="detail-item">
                    <span class="detail-value">⚕️ ${dept}</span>
                </div>
            `).join('')}
        </div>
        
        <button class="btn-direction" onclick="getDirections()">🚗 교통편 찾기</button>
    `;
    
    infoPanel.classList.remove('hidden');
    
    // 지도 중심 이동
    map.center = { lat: hospital.lat, lng: hospital.lng };
    renderMap();
}

// 교통편 찾기
function getDirections() {
    if (!selectedHospital) return;
    
    if (userLocation) {
        // 카카오맵 길찾기 URL
        const url = `https://map.kakao.com/link/to/${encodeURIComponent(selectedHospital.name)},${selectedHospital.lat},${selectedHospital.lng}`;
        window.open(url, '_blank');
    } else {
        alert('먼저 "내 위치에서 병원 찾기" 버튼을 클릭하여 위치를 설정해주세요.');
    }
}

// 내 위치 가져오기
function getMyLocation() {
    if ('geolocation' in navigator) {
        document.getElementById('myLocationBtn').textContent = '위치 확인 중...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                map.center = userLocation;
                map.zoom = 9;
                
                addHospitalMarkers();
                updateHospitalList();
                
                document.getElementById('myLocationBtn').textContent = '📍 내 위치에서 병원 찾기';
                alert('위치를 확인했습니다. 거리순으로 병원을 정렬합니다.');
            },
            (error) => {
                console.error('위치 정보를 가져올 수 없습니다:', error);
                
                // 테스트용 서울 기본 위치
                userLocation = { lat: 37.5665, lng: 126.9780 };
                map.center = userLocation;
                addHospitalMarkers();
                updateHospitalList();
                
                document.getElementById('myLocationBtn').textContent = '📍 내 위치에서 병원 찾기';
                alert('위치 정보를 가져올 수 없어 서울 중심으로 설정했습니다.');
            }
        );
    } else {
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
}

// 캔버스 클릭 이벤트
function handleMapClick(event) {
    const rect = map.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 클릭한 위치 근처의 마커 찾기
    for (let marker of map.markers) {
        if (marker.type !== 'hospital') continue;
        
        const pos = latLngToPixel(marker.lat, marker.lng);
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        
        if (distance < 20) {
            showHospitalInfo(marker.data.id);
            break;
        }
    }
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updateHospitalList();
    
    document.getElementById('myLocationBtn').addEventListener('click', getMyLocation);
    document.getElementById('hospitalType').addEventListener('change', () => {
        addHospitalMarkers();
        updateHospitalList();
    });
    document.getElementById('closeInfo').addEventListener('click', () => {
        document.getElementById('infoPanel').classList.add('hidden');
    });
    
    map.canvas.addEventListener('click', handleMapClick);
    
    // 캔버스 크기 조정
    window.addEventListener('resize', () => {
        const mapContainer = document.getElementById('map');
        map.canvas.width = mapContainer.clientWidth;
        map.canvas.height = mapContainer.clientHeight;
        renderMap();
    });
});
