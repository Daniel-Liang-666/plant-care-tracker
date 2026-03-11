// 全局变量
let plants = [];
let waterings = [];
let selectedPlant = null;
let currentTemperature = 0;
let currentHumidity = 0;

// 常见植物类型
const commonPlants = [
    { id: 1, name: '绿萝', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20pothos%20plant%20with%20heart-shaped%20leaves&image_size=square' },
    { id: 2, name: '多肉', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=succulent%20plant%20with%20thick%20leaves&image_size=square' },
    { id: 3, name: '吊兰', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spider%20plant%20with%20long%20green%20leaves&image_size=square' },
    { id: 4, name: '芦荟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aloe%20vera%20plant%20with%20thick%20green%20leaves&image_size=square' },
    { id: 5, name: '仙人掌', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cactus%20plant%20with%20spines&image_size=square' },
    { id: 6, name: '富贵竹', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lucky%20bamboo%20plant%20with%20green%20stems&image_size=square' },
    { id: 7, name: '鸡冠子', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cockscomb%20flower%20with%20red%20crest&image_size=square' },
    { id: 8, name: '夜来香', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=evening%20primrose%20flower%20with%20yellow%20petals&image_size=square' },
    { id: 9, name: '玫瑰花', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rose%20flower%20with%20red%20petals&image_size=square' }
];

// 初始化
function init() {
    loadFromLocalStorage();
    renderPlants();
    renderCalendar();
    updateStats();
    updatePlantHistorySelect();
}

// 从本地存储加载数据
function loadFromLocalStorage() {
    const savedPlants = localStorage.getItem('plants');
    const savedWaterings = localStorage.getItem('waterings');
    
    if (savedPlants) {
        plants = JSON.parse(savedPlants);
    } else {
        // 添加预生成数据
        plants = commonPlants;
        localStorage.setItem('plants', JSON.stringify(plants));
    }
    
    if (savedWaterings) {
        waterings = JSON.parse(savedWaterings);
    } else {
        // 添加预生成浇水记录
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        waterings = [
            {
                id: 1,
                plantId: 1,
                date: now.toISOString(),
                status: '植物生长良好',
                photo: null
            },
            {
                id: 2,
                plantId: 2,
                date: yesterday.toISOString(),
                status: '土壤有点干',
                photo: null
            }
        ];
        localStorage.setItem('waterings', JSON.stringify(waterings));
    }
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('plants', JSON.stringify(plants));
    localStorage.setItem('waterings', JSON.stringify(waterings));
}

// 渲染植物选择区域
function renderPlants() {
    const plantGrid = document.getElementById('plant-grid');
    plantGrid.innerHTML = '';
    
    plants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.className = `plant-card ${selectedPlant && selectedPlant.id === plant.id ? 'selected' : ''}`;
        plantCard.onclick = () => selectPlant(plant);
        
        plantCard.innerHTML = `
            <img src="${plant.image}" alt="${plant.name}" class="plant-image">
            <div class="plant-name">${plant.name}</div>
        `;
        
        plantGrid.appendChild(plantCard);
    });
}

// 选择植物
function selectPlant(plant) {
    selectedPlant = plant;
    const selectedPlantElement = document.getElementById('selected-plant');
    selectedPlantElement.innerHTML = `
        <img src="${plant.image}" alt="${plant.name}" class="plant-image">
        <div>${plant.name}</div>
    `;
    document.getElementById('water-btn').disabled = false;
    renderPlants();
}

// 浇水记录
function recordWatering() {
    if (!selectedPlant) return;
    
    const statusDesc = document.getElementById('status-desc').value;
    const photoUpload = document.getElementById('photo-upload');
    let photo = null;
    
    // 处理照片上传
    if (photoUpload.files && photoUpload.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photo = e.target.result;
            saveWateringRecord(statusDesc, photo);
        };
        reader.readAsDataURL(photoUpload.files[0]);
    } else {
        saveWateringRecord(statusDesc, photo);
    }
}

// 保存浇水记录
function saveWateringRecord(status, photo) {
    const newWatering = {
        id: Date.now(),
        plantId: selectedPlant.id,
        date: new Date().toISOString(),
        status: status,
        photo: photo,
        temperature: currentTemperature,
        humidity: currentHumidity
    };
    
    waterings.push(newWatering);
    saveToLocalStorage();
    
    // 重置表单
    document.getElementById('status-desc').value = '';
    document.getElementById('photo-upload').value = '';
    
    // 更新界面
    renderCalendar();
    updateStats();
    updatePlantHistorySelect();
    
    // 显示成功提示
    alert('浇水记录已保存！');
}

// 渲染日历
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // 清空日历
    calendar.innerHTML = '';
    
    // 添加星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.style.fontWeight = 'bold';
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });
    
    // 获取当月第一天
    const firstDay = new Date(year, month, 1);
    // 获取当月最后一天
    const lastDay = new Date(year, month + 1, 0);
    // 获取当月第一天是星期几
    const startDay = firstDay.getDay();
    
    // 添加上个月的日期
    for (let i = 0; i < startDay; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        calendar.appendChild(dayElement);
    }
    
    // 添加当月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // 检查是否是今天
        if (i === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        // 检查是否有浇水记录
        const currentDate = new Date(year, month, i);
        const hasWatering = waterings.some(watering => {
            const wateringDate = new Date(watering.date);
            return wateringDate.getDate() === i && 
                   wateringDate.getMonth() === month && 
                   wateringDate.getFullYear() === year;
        });
        
        if (hasWatering) {
            dayElement.classList.add('has-watering');
            dayElement.onclick = () => showCalendarDetails(currentDate);
        }
        
        dayElement.textContent = i;
        calendar.appendChild(dayElement);
    }
}

// 显示日历详情
function showCalendarDetails(date) {
    const calendarDetails = document.getElementById('calendar-details');
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // 筛选当天的浇水记录
    const dayWaterings = waterings.filter(watering => {
        const wateringDate = new Date(watering.date);
        return wateringDate.getDate() === day && 
               wateringDate.getMonth() === month && 
               wateringDate.getFullYear() === year;
    });
    
    if (dayWaterings.length === 0) {
        calendarDetails.innerHTML = `<p>${year}年${month + 1}月${day}日没有浇水记录</p>`;
        return;
    }
    
    let detailsHTML = `<h3>${year}年${month + 1}月${day}日浇水记录</h3>`;
    
    dayWaterings.forEach(watering => {
        const plant = plants.find(p => p.id === watering.plantId);
        if (plant) {
            detailsHTML += `
                <div class="history-item">
                    <div class="history-date">${new Date(watering.date).toLocaleString()}</div>
                    <div class="history-desc">植物：${plant.name}</div>
                    ${watering.status ? `<div class="history-desc">状态：${watering.status}</div>` : ''}
                    ${watering.temperature ? `<div class="history-desc">温度：${watering.temperature}°C</div>` : ''}
                    ${watering.humidity ? `<div class="history-desc">湿度：${watering.humidity}%</div>` : ''}
                    ${watering.photo ? `<img src="${watering.photo}" alt="浇水照片" class="history-photo">` : ''}
                </div>
            `;
        }
    });
    
    calendarDetails.innerHTML = detailsHTML;
}

// 更新统计数据
function updateStats() {
    const statsContent = document.getElementById('stats-content');
    
    // 统计每盆花的浇水次数
    const wateringCounts = plants.map(plant => {
        const count = waterings.filter(watering => watering.plantId === plant.id).length;
        return { plant, count };
    });
    
    let statsHTML = '';
    wateringCounts.forEach(item => {
        statsHTML += `
            <div class="stat-item">
                <span class="stat-label">${item.plant.name}</span>
                <span class="stat-value">${item.count}次</span>
            </div>
        `;
    });
    
    // 添加总浇水次数
    const totalWaterings = waterings.length;
    statsHTML += `
        <div class="stat-item">
            <span class="stat-label">总浇水次数</span>
            <span class="stat-value">${totalWaterings}次</span>
        </div>
    `;
    
    statsContent.innerHTML = statsHTML;
}

// 更新植物历史记录选择器
function updatePlantHistorySelect() {
    const select = document.getElementById('plant-history-select');
    select.innerHTML = '<option value="">选择植物查看历史</option>';
    
    plants.forEach(plant => {
        const option = document.createElement('option');
        option.value = plant.id;
        option.textContent = plant.name;
        select.appendChild(option);
    });
}

// 显示植物历史记录
function showPlantHistory() {
    const select = document.getElementById('plant-history-select');
    const plantId = parseInt(select.value);
    const plantHistory = document.getElementById('plant-history');
    
    if (!plantId) {
        plantHistory.innerHTML = '<p>请选择植物查看历史记录</p>';
        return;
    }
    
    // 筛选该植物的浇水记录
    const plantWaterings = waterings
        .filter(watering => watering.plantId === plantId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (plantWaterings.length === 0) {
        plantHistory.innerHTML = '<p>该植物暂无浇水记录</p>';
        return;
    }
    
    let historyHTML = '';
    plantWaterings.forEach(watering => {
        historyHTML += `
            <div class="history-item">
                <div class="history-date">${new Date(watering.date).toLocaleString()}</div>
                ${watering.status ? `<div class="history-desc">状态：${watering.status}</div>` : ''}
                ${watering.temperature ? `<div class="history-desc">温度：${watering.temperature}°C</div>` : ''}
                ${watering.humidity ? `<div class="history-desc">湿度：${watering.humidity}%</div>` : ''}
                ${watering.photo ? `<img src="${watering.photo}" alt="浇水照片" class="history-photo">` : ''}
            </div>
        `;
    });
    
    plantHistory.innerHTML = historyHTML;
}

// 事件监听
function setupEventListeners() {
    // 浇水按钮点击事件
    document.getElementById('water-btn').addEventListener('click', recordWatering);
    
    // 植物历史记录选择事件
    document.getElementById('plant-history-select').addEventListener('change', showPlantHistory);
}

// 获取当前温湿度（模拟数据）
function getCurrentWeather() {
    // 模拟温湿度数据，实际应用中可以通过传感器或API获取
    currentTemperature = (Math.random() * 10 + 15).toFixed(1); // 15-25度
    currentHumidity = (Math.random() * 30 + 40).toFixed(1); // 40-70%
    
    // 更新界面显示
    updateWeatherDisplay();
}

// 更新温湿度显示
function updateWeatherDisplay() {
    const wateringSection = document.getElementById('watering-section');
    // 检查是否已存在温湿度显示元素
    let weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay) {
        weatherDisplay = document.createElement('div');
        weatherDisplay.id = 'weather-display';
        weatherDisplay.className = 'weather-display';
        // 插入到浇水按钮之前
        const waterBtn = document.getElementById('water-btn');
        wateringSection.insertBefore(weatherDisplay, waterBtn);
    }
    
    weatherDisplay.innerHTML = `
        <div class="weather-info">
            <span>当前温度：${currentTemperature}°C</span>
            <span>当前湿度：${currentHumidity}%</span>
        </div>
    `;
}

// 初始化应用
window.onload = function() {
    init();
    setupEventListeners();
    // 初始化获取温湿度
    getCurrentWeather();
    // 每30秒更新一次温湿度
    setInterval(getCurrentWeather, 30000);
};