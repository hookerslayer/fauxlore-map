var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2
});

var bounds = [[0, 0], [2154, 2652]];

var image1 = L.imageOverlay('2652x2154.png', bounds);
var image2 = L.imageOverlay('2652x2154_res.png', bounds);
var image3 = L.imageOverlay('2652x2154_rel.png', bounds);
var image4 = L.imageOverlay('2652x2154_rac.png', bounds);
var image5 = L.imageOverlay('2652x2154_geo.png', bounds);

var baseMaps = {
    "Политическая карта": image1,
    "Ресурсная карта": image2,
    "Религиозная карта": image3,
    "Расовая карта": image4,
    "Географическая карта": image5
};

image1.addTo(map);

L.control.layers(baseMaps).addTo(map);

map.fitBounds(bounds);

// Иконки для разных типов меток
var iconTypes = {
    'Столица': L.icon({iconUrl: 'capital-icon.png', iconSize: [26, 37], iconAnchor:   [13, 37], popupAnchor: [13, 0]}),
    'Город': L.icon({iconUrl: 'city-icon.png'}),
    'Крепость': L.icon({iconUrl: 'fortress-icon.png'}),
    'Порт': L.icon({iconUrl: 'port-icon.png'})
};

// Группы слоев для разных типов меток
var layers = {
    'Столица': L.layerGroup().addTo(map),
    'Город': L.layerGroup().addTo(map),
    'Крепость': L.layerGroup().addTo(map),
    'Порт': L.layerGroup().addTo(map)
};

// ID Google Таблицы и API Key
var url = `https://sheets.googleapis.com/v4/spreadsheets/1JhCygdVpq-13xNVrUQVvGzFXhYETviRZKWYhDv-ky_k/values/Sheet1!A1:E100?key=AIzaSyBdhS5jcD7VLxHDWwy1cC8pZUM0p6_S4xU`;

// Загружаем данные с Google Sheets
fetch(url)
    .then(response => response.json())
    .then(data => {
        // Логируем полученные данные для отладки
        console.log("Полученные данные из Google Sheets:", data);

        // Получаем строки значений из таблицы
        var rows = data.values;

        // Пропускаем первую строку, если это заголовки
        rows.slice(1).forEach(function(row) {
            // Важно убедиться, что все необходимые поля присутствуют
            if (row.length >= 5) {
                var name = row[0]; // Имя
                var description = row[1]; // Описание
                var lat = parseFloat(row[2]); // Широта
                var lng = parseFloat(row[3]); // Долгота
                var type = row[4]; // Тип метки

                // Проверяем корректность данных перед добавлением метки
                if (!isNaN(lat) && !isNaN(lng) && iconTypes[type]) {
                    // Создаем метку
                    var marker = L.marker([lat, lng], { icon: iconTypes[type] })
                        .bindPopup(`<b>${name}</b><br>${description}`);

                    // Добавляем метку в соответствующую группу
                    layers[type].addLayer(marker);
                }
            }
        });
    })
    .catch(error => {
        console.error("Ошибка загрузки данных с Google Sheets:", error);
    });

// Добавляем контрол для включения/выключения групп меток
L.control.layers(null, {
    'Столицы': layers['Столица'],
    'Города': layers['Город'],
    'Крепости': layers['Крепость'],
    'Порты': layers['Порт']
}).addTo(map);

// Добавляем перемещаемый маркер столицы
var capitalMarker = L.marker([1000, 1000], {
    icon: iconTypes['Столица'],
    draggable: true // Маркер можно перемещать
}).addTo(map);

// Всплывающее окно с координатами
capitalMarker.bindPopup(`<b>Столица</b><br>Координаты: ${capitalMarker.getLatLng().lat}, ${capitalMarker.getLatLng().lng}`).openPopup();


// Обновляем координаты при перемещении маркера
capitalMarker.on('dragend', function(event) {
    var marker = event.target;
    var position = marker.getLatLng(); // Получаем новые координаты
    
    marker.setPopupContent(`<b>Столица</b><br>Координаты: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`).openPopup();
    console.log(`Новые координаты: ${position.lat}, ${position.lng}`); // Лог координат
});

//Меняет рендер карты при близком приближении
function RenderingChanger(){
    let curZoom = map.getZoom();
    let mapContainer = map.getContainer();

    // Выбираем все элементы img внутри контейнера карты
    let images = mapContainer.querySelectorAll('img');

    // Изменяем стили для каждого элемента img
    images.forEach(function(img) {
        if( curZoom >= 2){
            img.style.imageRendering = "pixelated";
        }
        else{
            img.style.imageRendering = "auto";
        }
    });
}

//вызывает функцию при изменении приближения карты
map.on('zoomend', function(){
    RenderingChanger();
});
