var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    attributionControl: false,
    fullscreenControl: true,
    fullscreenControlOptions: {
        position: 'topleft'
    }
});

var bounds = [[0, 0], [10000, 10000]];

var image1 = L.imageOverlay('fauxlore_map.png', bounds);
var image2 = L.imageOverlay('res_fauxlore_map.png', bounds);
var image3 = L.imageOverlay('rel_fauxlore_map.png', bounds);
var image4 = L.imageOverlay('rac_fauxlore_map.png', bounds);
var image5 = L.imageOverlay('geo_fauxlore_map.png', bounds);

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
    'Столица': L.IconMaterial.icon({
        icon: 'star', // Name of Material icon
        iconColor: 'white', // Material icon color (could be rgba, hex, html name...)
        markerColor: '#B22222', // Marker fill color
        outlineColor: 'black', // Marker outline color
        outlineWidth: 2, // Marker outline width
        iconSize: [25, 34], // Width and height of the icon
        popupAnchor: [0, -34]
    }),
    'Город': L.IconMaterial.icon({
        icon: 'home', // Name of Material icon
        iconColor: 'white', // Material icon color (could be rgba, hex, html name...)
        markerColor: 'Orange', // Marker fill color
        outlineColor: 'black', // Marker outline color
        outlineWidth: 2, // Marker outline width
        iconSize: [25, 34], // Width and height of the icon
        popupAnchor: [0, -34]
    }),
    'Крепость': L.IconMaterial.icon({
        icon: 'castle', // Name of Material icon
        iconColor: 'white', // Material icon color (could be rgba, hex, html name...)
        markerColor: 'Gray', // Marker fill color
        outlineColor: 'black', // Marker outline color
        outlineWidth: 2, // Marker outline width
        iconSize: [25, 34], // Width and height of the icon
        popupAnchor: [0, -34]
    }),
    'Порт': L.IconMaterial.icon({
        icon: 'anchor', // Name of Material icon
        iconColor: 'white', // Material icon color (could be rgba, hex, html name...)
        markerColor: 'SteelBlue', // Marker fill color
        outlineColor: 'black', // Marker outline color
        outlineWidth: 2, // Marker outline width
        iconSize: [12, 16], // Width and height of the icon
        popupAnchor: [0, -16]
    })
};

// Группы слоев для разных типов меток
var layers = {
    'Столица': L.layerGroup().addTo(map),
    'Город': L.layerGroup().addTo(map),
    'Крепость': L.layerGroup().addTo(map),
    'Порт': L.layerGroup().addTo(map)
};

// Создаем отдельный слой для маркера с координатами
var coordinateTrackingLayer = L.layerGroup();

// Добавляем перемещаемый маркер столицы в слой "Отслеживание координат"
var capitalMarker = L.marker([4500, 4500], {
    icon: iconTypes['Столица'],
    draggable: true // Маркер можно перемещать
}).addTo(coordinateTrackingLayer);

// Всплывающее окно с координатами
capitalMarker.bindPopup(`<b>Столица</b><br>Координаты: ${capitalMarker.getLatLng().lat}, ${capitalMarker.getLatLng().lng}`);

// Обновляем координаты при перемещении маркера
capitalMarker.on('dragend', function(event) {
    var marker = event.target;
    var position = marker.getLatLng(); // Получаем новые координаты
    
    marker.setPopupContent(`<b>Столица</b><br>Координаты: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`).openPopup();
    console.log(`Новые координаты: ${position.lat}, ${position.lng}`); // Лог координат
});

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
                        .bindPopup(`
                            <div class="popup-header">${name}</div>
                            <div class="popup-description">${description}</div>
                        `);

                    if (type !== 'Порт') {
                        marker.bindTooltip(name, { permanent: true, direction: 'right', offset: L.point(11, -15) });
                    }

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
    'Порты': layers['Порт'],
    'Отслеживание координат': coordinateTrackingLayer // Добавляем слой для маркера с координатами
}).addTo(map);

//Меняет рендер карты при близком приближении
function RenderingChanger(){
    let curZoom = map.getZoom();
    let mapContainer = map.getContainer();

    // Выбираем все элементы img внутри контейнера карты
    let images = mapContainer.querySelectorAll('img');

    // Изменяем стили для каждого элемента img
    images.forEach(function(img) {
        if( curZoom >= 1){
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

// Подпись автора
var signatureControl = L.control({position: 'bottomright'});

signatureControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'developer-signature');
    div.innerHTML = 
        '<div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.5); padding: 0px; border-radius: 0px;">' +
            '<img src="1.png" width="41" height="41" alt="Developer Logo">' +
            '<img src="ru.png" width="24" height="24" alt="Russia Flag" style="margin-left: 3px;">' +
            '<img src="pl.png" width="24" height="24" alt="Palestine Flag" style="margin-left: 0px;">' +
            '<a href="https://vk.com/mistershsh" target="_blank" style="margin-left: 3px; text-decoration: underline; color: blue; font-size: 1em;">' +
                'Mister Sh from Sixieme Terre' +
            '</a>' +
        '</div>';
    return div;
};

signatureControl.addTo(map);
