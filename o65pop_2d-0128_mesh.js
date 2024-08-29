mapboxgl.accessToken = 'pk.eyJ1IjoidmFsdWVjcmVhdGlvbiIsImEiOiJja2swcm9pdWMwazk2MnB0ZzZ5NTVwMXAxIn0.9klPq_GB5cZ0lRZVdZR2_g';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [139.657125, 35.661236],
  zoom: 10, // starting zoom
  pitch: 40
});

/************** Map Control *******************/
map.addControl(new mapboxgl.NavigationControl());

let scale = new mapboxgl.ScaleControl({
  maxWidth: 250,
  unit: 'metric'
});

map.addControl(scale);

// Create a popup, but don't add it to the map yet.
let popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

let hoveredStateId = null;

map.on("mousemove", "2DmeshLayer", function(e) {

  map.getCanvas().style.cursor = 'pointer';

  if (e.features.length > 0) {
      if (hoveredStateId) {
        map.setFeatureState({source: 'meshdata', id: hoveredStateId}, { hover: false});
      }
      hoveredStateId = e.features[0].layer.id;
      map.setFeatureState({source: 'meshdata', id: hoveredStateId}, { hover: true});
  }

  popup.setLngLat(e.lngLat)
    .setHTML(
      "<div><b>City Code &nbsp;</b>" + e.features[0].properties.SHICODE + "</div>" + 
      "<div><b>Heat Stroke Risk（over65)</b></div>" + 
      "<div>" + Math.round(e.features[0].properties.PTC_2020) + " 人</div>")
    .addTo(map);

});
   
// When the mouse leaves the state-fill layer, update the feature state of the
// previously hovered feature.
map.on("mouseleave", "2DmeshLayer", function() {
  map.getCanvas().style.cursor = '';
  popup.remove();
  if (hoveredStateId) {
    map.setFeatureState({source: 'meshdata', id: hoveredStateId}, { hover: false});
  }
  hoveredStateId =  null;
});

let PTC_2020_1 = ["<", ["get", "PTC_2020"], 1000];
let PTC_2020_2 = ["all", [">=", ["get", "PTC_2020"], 1000], ["<", ["get", "PTC_2020"], 2000]];
let PTC_2020_3 = ["all", [">=", ["get", "PTC_2020"], 2000], ["<", ["get", "PTC_2020"], 4000]];
let PTC_2020_4 = ["all", [">=", ["get", "PTC_2020"], 4000], ["<", ["get", "PTC_2020"], 5000]];
let PTC_2020_5 = ["all", [">=", ["get", "PTC_2020"], 5000], ["<", ["get", "PTC_2020"], 6000]];
let PTC_2020_6 = ["all", [">=", ["get", "PTC_2020"], 6000], ["<", ["get", "PTC_2020"], 7000]];
let PTC_2020_7 = ["all", [">=", ["get", "PTC_2020"], 7000], ["<", ["get", "PTC_2020"], 8000]];
let PTC_2020_8 = ["all", [">=", ["get", "PTC_2020"], 8000], ["<", ["get", "PTC_2020"], 9000]];
let PTC_2020_9 = ["all", [">=", ["get", "PTC_2020"], 9000], ["<", ["get", "PTC_2020"], 10000]];
let PTC_2020_10 = ["all", [">=", ["get", "PTC_2020"], 10000], ["<", ["get", "PTC_2020"], 11000]];

let colors = ['rgb(44, 123, 182)',
           	'rgb(100, 165, 205)',
		'rgb(157, 207, 228)',
	        'rgb(199, 230, 219)',
		'rgb(237, 247, 201)',
          	'rgb(255, 237, 170)',
		'rgb(254, 201, 128)',
         	'rgb(249, 158, 89)',
		'rgb(232, 91, 58)',
		'rgb(215, 25, 28)'] 

const meshToMap = (meshdata) => {
 
  map.addSource('meshdata',{
    type: 'geojson',
    data: meshdata,
  });

  map.addLayer({
    'id': '2DmeshLayer',
    'type': 'fill',
    'source': 'meshdata',
    'layout': {},
    'paint': {
        "fill-color": 
          ["case",
            PTC_2020_1, colors[0],
            PTC_2020_2, colors[1],
            PTC_2020_3, colors[2],
            PTC_2020_4, colors[3], 
            PTC_2020_5, colors[4], 
            PTC_2020_6, colors[5], 
            PTC_2020_7, colors[6], 
            PTC_2020_8, colors[7], 
            PTC_2020_9, colors[8], 
            PTC_2020_10, colors[9], 
            colors[9]
          ],
        "fill-outline-color": "white",
        "fill-opacity": ["case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5
        ]
      }
  });

};

let meshGeoJsonURL = 'https://miraimeisatu.github.io/nasa2021/1km_mesh_2018_13.geojson';

const handleGetData = (err, meshdata) => {
  meshToMap(meshdata);
}

d3.queue()
  .defer(d3.json, meshGeoJsonURL)
  .await(handleGetData);

function updateTooltip({x, y, object}) {
  const tooltip = document.getElementById('tooltip');
  if (object) {
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = `
      <div><b>Tile ID &nbsp;</b></div>
      <div><div>${object.properties.SHICODE}</div></div>
      <div><b>Risk</b></div>
      <div>${Math.round(object.properties.PTC_2020)}老人人口</div>
      `;
  } else { 
    tooltip.innerHTML = '';
  }
}

