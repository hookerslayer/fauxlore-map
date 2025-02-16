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

// ID Google Таблицы и Client ID
var spreadsheetId = '1JhCygdVpq-13xNVrUQVvGzFXhYETviRZKWYhDv-ky_k';
var clientId = '1038367339519-iff9iocnsab7plcbqhrihm4lpc83udtj.apps.googleusercontent.com';

// Инициализация клиента и аутентификация
function initClient() {
    gapi.client.init({
        clientId: clientId,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('User is signed in.');
        loadData();
    } else {
        console.log('User is not signed in.');
        gapi.auth2.getAuthInstance().signIn();
    }
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

window.onload = handleClientLoad;

// Загружаем данные с Google Sheets
function loadData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1:E100'
    }).then(function(response) {
        var data = response.result;
        console.log("Полученные данные из Google Sheets:", data);
        var rows = data.values;
        rows.slice(1).forEach(function(row) {
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
                    // Добавляем метку в соответствующую группу
                    layers[type].addLayer(marker);
                }
            }
        });
    }).catch(function(error) {
        console.error("Ошибка загрузки данных с Google Sheets:", error);
    });
}

// Добавляем контрол для включения/выключения групп меток
L.control.layers(null, {
    'Столицы': layers['Столица'],
    'Города': layers['Город'],
    'Крепости': layers['Крепость'],
    'Порты': layers['Порт']
}).addTo(map);

// Добавляем перемещаемый маркер столицы
var capitalMarker = L.marker([4500, 4500], {
    icon: iconTypes['Столица'],
    draggable: true // Маркер можно перемещать
}).addTo(map);

// Функция для создания формы в всплывающем окне
function createPopupForm(marker) {
    var position = marker.getLatLng();
    var formHtml = `
        <form id="markerForm">
            <label for="markerName">Название:</label>
            <input type="text" id="markerName" name="markerName" required><br>
            <label for="markerType">Тип маркера:</label>
            <select id="markerType" name="markerType" required>
                <option value="Столица">Столица</option>
                <option value="Город">Город</option>
                <option value="Крепость">Крепость</option>
                <option value="Порт">Порт</option>
            </select><br>
            <label for="markerCoords">Координаты:</label>
            <input type="text" id="markerCoords" name
