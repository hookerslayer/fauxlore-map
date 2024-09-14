var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5
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
    'Столица': L.icon({iconUrl: 'capital-icon.png', iconSize: [32, 32]}),
    'Город': L.icon({iconUrl: 'city-icon.png', iconSize: [32, 32]}),
    'Крепость': L.icon({iconUrl: 'fortress-icon.png', iconSize: [32, 32]}),
    'Порт': L.icon({iconUrl: 'port-icon.png', iconSize: [32, 32]})
};

// Группы слоев для разных типов меток
var layers = {
    'Столица': L.layerGroup().addTo(map),
    'Город': L.layerGroup().addTo(map),
    'Крепость': L.layerGroup().addTo(map),
    'Порт': L.layerGroup().addTo(map)
};

// ID Google Таблицы
var spreadsheetId = '1JhCygdVpq-13xNVrUQVvGzFXhYETviRZKWYhDv-ky_k';
var url = `https://spreadsheets.google.com/feeds/list/${spreadsheetId}/od6/public/values?alt=json`;

// Загружаем данные с Google Sheets
fetch(url)
    .then(response => response.json())
    .then(data => {
        var entries = data.feed.entry;
        entries.forEach(function(entry) {
            var name = entry.gsx$name.$t;
            var description = entry.gsx$description.$t;
            var lat = parseFloat(entry.gsx$lat.$t);
            var lng = parseFloat(entry.gsx$lng.$t);
            var type = entry.gsx$type.$t;

            // Создаем метку
            var marker = L.marker([lat, lng], { icon: iconTypes[type] })
                .bindPopup(`<b>${name}</b><br>${description}`);

            // Добавляем метку в соответствующую группу
            layers[type].addLayer(marker);
        });
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

// Легенда карты
var legends = {
    "Политическая карта": {src: '713x877.png', width: 713, height: 877},
    "Ресурсная карта": {src: '395x720.png', width: 395, height: 720},
    "Религиозная карта": {src: '396x721_rel.png', width: 396, height: 721},
    "Расовая карта": {src: '396x721_rac.png', width: 396, height: 721},
    "Географическая карта": {src: '396x721.png', width: 395, height: 720}
};

var legendControl = L.control({position: 'bottomleft'});

legendControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML = '<img src="713x877.png" id="map-legend" width="' + (713 / 1.5) + '" height="' + (877 / 1.5) + '">';
    return div;
};

legendControl.addTo(map);

map.on('baselayerchange', function(e) {
    var legendImage = document.getElementById('map-legend');
    var legendData = legends[e.name];
    legendImage.src = legendData.src;
    legendImage.width = legendData.width / 1.8;
    legendImage.height = legendData.height / 1.8;
});

// Кнопка для показа/скрытия легенды
var legendToggleBtn = document.getElementById('legend-toggle');
legendToggleBtn.addEventListener('click', function() {
    var legendElement = document.querySelector('.legend');
    if (legendElement.style.display === 'none' || legendElement.style.display === '') {
        legendElement.style.display = 'block';
        legendToggleBtn.textContent = 'Скрыть легенду';
    } else {
        legendElement.style.display = 'none';
        legendToggleBtn.textContent = 'Показать легенду';
    }
});

if (window.innerWidth <= 768) {
    document.querySelector('.legend').style.display = 'none';
    legendToggleBtn.textContent = 'Показать легенду';
}

// Подпись автора
var signatureControl = L.control({position: 'bottomright'});

signatureControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'developer-signature');
    div.innerHTML = `
        <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.5); padding: 5px; border-radius: 5px;">
            <img src="1.png" width="41" height="41" alt="Developer Logo">
            <img src="ru.png" width="24" height="24" alt="Russia Flag" style="margin-left: 3px;">
            <img src="pl.png" width="24" height="24" alt="Palestine Flag" style="margin-left: 0px;">
            <a href="https://vk.com/mistershsh" target="_blank" style="margin-left: 3px; text-decoration: underline; color: blue; font-size: 1em;">
                Mister Sh from Sixieme Terre
            </a>
        </div>
    `;
    return div;
};

signatureControl.addTo(map);
