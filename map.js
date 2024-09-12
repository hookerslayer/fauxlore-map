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

var signatureControl = L.control({position: 'bottomright'});

signatureControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'developer-signature');
    div.innerHTML = `
        <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.5); padding: 5px; border-radius: 5px;">
            <img src="1.png" width="41" height="41" alt="Developer Logo">
            <span style="margin-left: 5px; font-size: 1.2em;">
                🇷🇺 🇵🇸 <a href="https://vk.com/mistershsh" target="_blank" style="text-decoration: none; color: black;">
                    Mister Sh from Sixieme Terre Solutions
                </a>
            </span>
        </div>
    `;
    return div;
};

signatureControl.addTo(map);
