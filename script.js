// 路線データ
const trainData = {
    yamanote: {
        name: '山手線',
        stations: {
            tokyo: { name: '東京', directions: ['内回り', '外回り'] },
            shinagawa: { name: '品川', directions: ['内回り', '外回り'] },
            shibuya: { name: '渋谷', directions: ['内回り', '外回り'] },
            shinjuku: { name: '新宿', directions: ['内回り', '外回り'] },
            ikebukuro: { name: '池袋', directions: ['内回り', '外回り'] }
        }
    },
    chuo: {
        name: '中央線',
        stations: {
            tokyo: { name: '東京', directions: ['高尾方面', '東京方面'] },
            shinjuku: { name: '新宿', directions: ['高尾方面', '東京方面'] },
            nakano: { name: '中野', directions: ['高尾方面', '東京方面'] },
            kichijoji: { name: '吉祥寺', directions: ['高尾方面', '東京方面'] },
            tachikawa: { name: '立川', directions: ['高尾方面', '東京方面'] }
        }
    },
    sobu: {
        name: '総武線',
        stations: {
            tokyo: { name: '東京', directions: ['千葉方面', '東京方面'] },
            akihabara: { name: '秋葉原', directions: ['千葉方面', '東京方面'] },
            kinshicho: { name: '錦糸町', directions: ['千葉方面', '東京方面'] },
            funabashi: { name: '船橋', directions: ['千葉方面', '東京方面'] },
            chiba: { name: '千葉', directions: ['千葉方面', '東京方面'] }
        }
    },
    'keihin-tohoku': {
        name: '京浜東北線',
        stations: {
            omiya: { name: '大宮', directions: ['大宮方面', '横浜方面'] },
            ueno: { name: '上野', directions: ['大宮方面', '横浜方面'] },
            tokyo: { name: '東京', directions: ['大宮方面', '横浜方面'] },
            shinagawa: { name: '品川', directions: ['大宮方面', '横浜方面'] },
            yokohama: { name: '横浜', directions: ['大宮方面', '横浜方面'] }
        }
    }
};

// DOM要素
const lineSelect = document.getElementById('line');
const stationSelect = document.getElementById('station');
const directionSelect = document.getElementById('direction');
const timeTypeSelect = document.getElementById('time-type');
const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const timetableDiv = document.getElementById('timetable');
const qrBtn = document.getElementById('qr-btn');
const qrCodeDiv = document.getElementById('qr-code');
const qrCanvas = document.getElementById('qr-canvas');

// イベントリスナー
lineSelect.addEventListener('change', handleLineChange);
stationSelect.addEventListener('change', handleStationChange);
searchBtn.addEventListener('click', handleSearch);
qrBtn.addEventListener('click', handleQRGenerate);

function handleLineChange() {
    const selectedLine = lineSelect.value;

    // リセット
    stationSelect.innerHTML = '<option value="">駅を選択してください</option>';
    directionSelect.innerHTML = '<option value="">方面を選択してください</option>';
    directionSelect.disabled = true;
    searchBtn.disabled = true;
    resultsDiv.style.display = 'none';

    if (selectedLine) {
        stationSelect.disabled = false;
        const stations = trainData[selectedLine].stations;

        for (const [key, station] of Object.entries(stations)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = station.name;
            stationSelect.appendChild(option);
        }
    } else {
        stationSelect.disabled = true;
    }
}

function handleStationChange() {
    const selectedLine = lineSelect.value;
    const selectedStation = stationSelect.value;

    directionSelect.innerHTML = '<option value="">方面を選択してください</option>';
    searchBtn.disabled = true;
    resultsDiv.style.display = 'none';

    if (selectedStation) {
        directionSelect.disabled = false;
        const directions = trainData[selectedLine].stations[selectedStation].directions;

        directions.forEach((direction, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = direction;
            directionSelect.appendChild(option);
        });
    } else {
        directionSelect.disabled = true;
    }
}

directionSelect.addEventListener('change', () => {
    searchBtn.disabled = !directionSelect.value;
});

function handleSearch() {
    const selectedLine = lineSelect.value;
    const selectedStation = stationSelect.value;
    const selectedDirection = directionSelect.value;
    const timeType = timeTypeSelect.value;

    if (!selectedLine || !selectedStation || !selectedDirection) {
        return;
    }

    // 時刻表を生成
    const timetable = generateTimetable(timeType);

    // 結果を表示
    displayResults(selectedLine, selectedStation, selectedDirection, timetable);
}

function generateTimetable(timeType) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let startHour, endHour, interval;

    switch (timeType) {
        case 'weekday-morning':
            startHour = 6;
            endHour = 9;
            interval = [3, 4, 5]; // 3-5分間隔
            break;
        case 'weekday-day':
            startHour = 9;
            endHour = 17;
            interval = [6, 8, 10];
            break;
        case 'weekday-evening':
            startHour = 17;
            endHour = 21;
            interval = [4, 5, 6];
            break;
        case 'holiday':
            startHour = 6;
            endHour = 23;
            interval = [8, 10, 12];
            break;
        case 'now':
        default:
            startHour = currentHour;
            endHour = currentHour + 3;
            interval = [5, 7, 10];
            break;
    }

    const trains = [];
    const trainTypes = ['普通', '快速', '特快'];

    for (let hour = startHour; hour <= endHour; hour++) {
        let minute = (timeType === 'now' && hour === startHour) ? currentMinute : 0;

        while (minute < 60) {
            if (hour === endHour && minute > 0) break;

            const randomInterval = interval[Math.floor(Math.random() * interval.length)];
            minute += randomInterval;

            if (minute < 60) {
                const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
                trains.push({
                    hour: hour,
                    minute: minute,
                    type: type,
                    isCurrent: timeType === 'now' && hour === currentHour && minute >= currentMinute && minute <= currentMinute + 5
                });
            }
        }
    }

    return trains;
}

function displayResults(line, station, direction, timetable) {
    const lineName = trainData[line].name;
    const stationName = trainData[line].stations[station].name;
    const directionName = trainData[line].stations[station].directions[direction];

    let html = `
        <div class="info-box">
            <p><strong>路線:</strong> ${lineName}</p>
            <p><strong>駅:</strong> ${stationName}</p>
            <p><strong>方面:</strong> ${directionName}</p>
        </div>
        <div class="timetable-grid">
    `;

    timetable.forEach(train => {
        const currentClass = train.isCurrent ? 'current' : '';
        html += `
            <div class="time-item ${currentClass}">
                <div class="time">${String(train.hour).padStart(2, '0')}:${String(train.minute).padStart(2, '0')}</div>
                <div class="type">${train.type}</div>
            </div>
        `;
    });

    html += '</div>';

    timetableDiv.innerHTML = html;
    resultsDiv.style.display = 'block';

    // 結果までスクロール
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleQRGenerate() {
    // 既存のQRコードをクリア
    qrCanvas.innerHTML = '';

    // 現在のページURLを取得
    const currentURL = window.location.href;

    // QRコードを生成
    new QRCode(qrCanvas, {
        text: currentURL,
        width: 200,
        height: 200,
        colorDark: '#667eea',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // QRコードエリアを表示
    qrCodeDiv.style.display = 'block';

    // QRコードまでスクロール
    qrCodeDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
