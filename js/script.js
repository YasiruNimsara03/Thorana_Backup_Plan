let map;
let scene, camera, renderer, model, animationId;
let is3Dshow = false;
let isVideoShow = false;
let directionsService;
let infoWindow = null;
let infoWin = null;
let currentMarker = null;
let userMarker = null;
let endMarker = null;
let panorama = null;
let currentLat = null;
let currentLng = null;
let currentLoc = null;
let watchID = null;
let AUTO_DESTINATION = null;
let drawRoute = false;
let autoNavRoutes = {};
let userInfoWindow = null;
const mapDiv = document.getElementById("map");
const u_dot = document.getElementById("u-dot-img");
const more = document.getElementById("more");
const more_cont = document.getElementById("more-cont");
const loader_nav = document.getElementById("loader_nav");
const nav_btn = document.getElementById("nav_btn");
const warning = document.getElementById("ask-for-google-map-cont-bg");
let warning_link = null;
const warning_text = document.getElementById("ask-text-cont");
const warning_close = document.getElementById("ask-close");
const warning_navigate = document.getElementById("ask-btn");
const msg_cont = document.getElementById("msg-cont");
let msg_txt = document.getElementById("msg-txt");
let lat = 7.2549;
let lng = 80.5974;

const wus = document.getElementById("wus");
const thorana = document.getElementById("thorana");
const carPark = document.getElementById("carPark");
const washrooms = document.getElementById("washrooms");
const canteens = document.getElementById("canteen");
const auditorium = document.getElementById("auditorium");
const facBoard = document.getElementById("facBoard");
const boc = document.getElementById("boc");
const peoples = document.getElementById("peoples");
const senate = document.getElementById("senate");
const library = document.getElementById("library");
const gym = document.getElementById("gym");
const AB = document.getElementById("ab");
const mainhall = document.getElementById("mainhall");
const ictLab = document.getElementById("ict");
const ground = document.getElementById("ground");
const communication = document.getElementById("communication");
const geography = document.getElementById("geography");
const jp = document.getElementById("jamesPeiris");
const sarasaviMedura = document.getElementById("sarasaviMedura");

const streetview_video = document.getElementById("streetview-video");
const streetview_cont = document.getElementById("streetview-cont");
const _3d_cont = document.getElementById("_3d-cont");
const streetview_video_loader = document.getElementById("video-loader");
const streetview_video_title = document.getElementById("video-title");
const streetview_3d = document.getElementById("streetview-3d");
const streetview_close = document.getElementById("streetview-close-img");
const streetview_loader_img = document.getElementById("video-loader-img");

const streetview_tap_to_close = document.getElementById("streetview-tap-close-cont");
const centerUser = document.getElementById("cur-loc");
const animation = document.getElementById("ani-cont");

let qrstart = null;
let qrend = null;
let autostart = null;
let autoend = null;
let startInfo = null;
let endInfo = null;
let autoInfo = null;

function isValidLatLng(lat, lng) {
  return typeof lat === "number" && typeof lng === "number" &&  !isNaN(lat) && !isNaN(lng);
}

function waitForGPS(cb) {
  const t = setInterval(() => {
    if (isValidLatLng(currentLat, currentLng)) {
      clearInterval(t);
      cb();
    }
  }, 500);
}

let msgTimer = null;

function show_msg(msg) {
  if (msgTimer) clearTimeout(msgTimer);
    msg_txt.textContent = msg;
    msg_cont.style.top = "10px";
    more_cont.style.top = "100px";
    msgTimer = setTimeout(() => {
      msg_cont.style.top = "-100px";
      more_cont.style.top = "10px";
      msg_txt.textContent = "";
    }, 2000);
}


function initMap() {
  const FACULTY_BOUNDS = {
    north: 7.271305109522693,
    south: 7.241272143676761,
    west: 80.59207275410844,
    east: 80.6005066188864
  };

  google.maps.event.trigger(map, "resize");

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 7.2549, lng: 80.5974 },
    zoom: 18,
    fullscreenControl: false,
    zoomControl: false,
    mapTypeControl: true,
    streetViewControl: true,
    gestureHandling: "greedy",
    disableDoubleClickZoom: false,
    restriction: {
      latLngBounds: FACULTY_BOUNDS,
      strictBounds: true
    },
    mapTypeId: "terrain"
  });

  directionsService = new google.maps.DirectionsService();

  map.getStreetView().addListener("visible_changed", () => {
    if (map.getStreetView().getVisible()) {
      if (is3Dshow) {
        remove3D();
      }
      removeVideo();
      clear_qr();
      more_cont.classList.add("hide");
      centerUser.style.display = "none";
      animation.style.display = "none";
      nav_btn.style.display = "none";
    } else {
      more_cont.classList.remove("hide");
      centerUser.style.display = "block";
      animation.style.display = "block";
      nav_btn.style.display = "block";
    }
  });

  userMarker = new google.maps.Marker({
    map: map,
    icon: {
      url: "Assets/userMarker2.gif",
      scaledSize: new google.maps.Size(80, 80)
    },
  });
  
  const facultyRectangle = new google.maps.Rectangle({
    strokeColor: "#0BA6DF",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FFCCCC",
    fillOpacity: 0.0,
    bounds: FACULTY_BOUNDS,
    map: map
  });

  google.maps.event.addListenerOnce(map, 'idle', () => {
    show_sikka_points();
  });

  navigator.geolocation.getCurrentPosition(
    pos => console.log("ONE-TIME:", pos.coords.latitude, pos.coords.longitude),
    err => console.error("ERROR:", err.code, err.message)
  );

  startTracking();

  document.getElementById("site-loading").style.display = "none";

  setTimeout(() => {
    navigate_user_to_WUS();
  }, 1000);
}

function requestTypes(startPoint, endPoint) {
  const milkbarLat = 7.258395410950548;
  const ivorStatueLat = 7.253468931135237;

  if (startPoint.lat >= milkbarLat && endPoint.lat <= milkbarLat) {
    return {
      origin: startPoint,
      destination: endPoint,
      travelMode: google.maps.TravelMode.WALKING,
      avoidHighways: false,
      avoidFerries: true,
      optimizeWaypoints: true,
      waypoints: [
        {
          location: { lat: 7.2558771295856594, lng: 80.59920940610606 },
          stopover: false
        }
      ]
    };
  } 
  else if ((startPoint.lat <= ivorStatueLat && endPoint.lat >= ivorStatueLat) || (startPoint.lat >= ivorStatueLat && endPoint.lat <= ivorStatueLat)) {
    return {
      origin: startPoint,
      destination: endPoint,
      travelMode: google.maps.TravelMode.WALKING,
      avoidHighways: false,
      avoidFerries: true,
      optimizeWaypoints: true,
      waypoints: [
        {
          location: { lat: 7.253386079621317, lng: 80.59774189137629 },
          stopover: false
        }
      ]
    };
  } 
  else {
    return {
      origin: startPoint,
      destination: endPoint,
      travelMode: google.maps.TravelMode.WALKING,
      avoidHighways: false,
      avoidFerries: true,
      optimizeWaypoints: true
    };
  }
}


const routeRenderers = {};
function drawRoadRoute(id, start, end, routeColor) {
  const startPlace = start;
  const endPlace = end;
  
  const request = requestTypes(startPlace, endPlace);

  const renderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    preserveViewport: true,
    polylineOptions: {
      strokeColor: routeColor,
      strokeWeight: 6,
      strokeOpacity: 1
    }
  });

  routeRenderers[id] = renderer;

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      loader_nav.style.display = "none";
      nav_btn.style.display = "block";
      renderer.setDirections(result);
      drawRoute = true;
      
      autoNavRoutes = {nav: true, lat: endPlace.lat, lng: endPlace.lng};
    } else {
      console.error("Route failed:", status);
      show_msg('Website can’t provide directions right now. You can navigate using Google Maps by clicking the “Navigate” button.');
      clearRoute(id);
      drawRoute = false;
    }

    loader_nav.style.display = "none";

    if (id === "RouteAUTO") {
      if (drawRoute){
        warning.style.display = "flex";
        more_cont.style.display = "none";
        warning_link = `https://www.google.com/maps/dir/?api=1&destination=${endPlace.lat},${endPlace.lng}&travelmode=walking`;
      }
    }
  });
}

function clearRoute(id) {
  if (routeRenderers[id]) {
    nav_btn.style.display = "none";
    loader_nav.style.display = "none";
    routeRenderers[id].setMap(null);
    delete routeRenderers[id];
    autoNavRoutes = {nav: false, lat: 0, lng: 0};
  }
}

function clear_qr(){
  if (qrstart && qrend && startInfo && endInfo){
    try{
      qrstart.setMap(null);
      qrend.setMap(null);
      startInfo.close();
      endInfo.close();
    } catch{
      console.log("/");
    }
  }
}

function get_user_current_location() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

let unlocked = false;
warning_text.addEventListener("scroll", () => {
  const isBottom = warning_text.scrollTop + warning_text.clientHeight >= warning_text.scrollHeight - 5;

  if (isBottom && !unlocked) {
    warning_navigate.style.display = "flex";
  }
})

warning_close.addEventListener("click", () => {
  warning_text.scrollTop = 0;
  setTimeout(() => {
    warning_navigate.style.display = "none";
  }, 0);
  warning.style.display = "none";
  more_cont.style.display = "block";
});

function navigate_googlemap(){
  const url = warning_link;
  window.open(url, "_blank");
}

warning_navigate.addEventListener("click", () => {
  warning_text.scrollTop = 0;
  setTimeout(() => {
    warning_navigate.style.display = "none";
  }, 0);
  warning.style.display = "none";
  more_cont.style.display = "block";
  navigate_googlemap();
});

nav_btn.addEventListener("click", () => {
  if (drawRoute) {
    nav_btn.style.display = "none";
    map.setZoom(10);
    
    if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteQR")) {
      clearRoute("RouteQR");
      if (is3Dshow){
        remove3D();
      }
      removeVideo();
    }
    if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteAUTO")) {
      clearRoute("RouteAUTO");
      if (is3Dshow){
        remove3D();
      }
      removeVideo();
    }

    clear_qr();
    
    drawRoute = false;
  } else {
    if (is3Dshow){
      remove3D();
    }
    removeVideo();

    if (AUTO_DESTINATION.lat || AUTO_DESTINATION.lng){
      drawRoute = false;
      navigate_auto();
    } else {
      show_msg("Click where you to go!!!");
    }
  }

  markers.forEach(marker => marker.setMap(null));
  markers = [];
});

const sikka_points = [
    {place: "Colombo Halt 01", lat: 7.265605625646994, lng: 80.59574492748523, sikka1: "Geeth", sikka2: "Althaf", sikka1_no: "0743872070", sikka2_no: "0756418890"},
    {place: "Colombo Halt 02", lat: 7.265539108835222, lng: 80.59598900850628, sikka1: "Kaveen", sikka2: "Bometh", sikka1_no: "0754770670", sikka2_no: "0716053616"},
    {place: "Galaha Junction", lat: 7.265580379799675, lng: 80.59667092902211, sikka1: "Krishan", sikka2: "Theekshana", sikka1_no: "0769470571", sikka2_no: "0728476584"},
    {place: "Medical Faculty", lat: 7.263029575538976, lng: 80.5983716659132, sikka1: "Bingun", sikka2: "Arham", sikka1_no: "0769848159", sikka2_no: "0769007323"},
    {place: "Wijewardhana Hall", lat: 7.260736962351374, lng: 80.59974725113602, sikka1: "Isuru", sikka2: "Achalitha", sikka1_no: "0767633875", sikka2_no: "0776835215"},
    // {place: "Near the Ground car Park", lat: 7.258576468051648, lng: 80.59874947019904, sikka1: "", sikka2: ""},
    {place: "Alwis pond", lat: 7.2587760369564185, lng: 80.59960512922707, sikka1: "Anjana", sikka2: "Sejinthan", sikka1_no: "0762731128", sikka2_no: ""},
    {place: "Hela Bojun", lat: 7.262394596711491, lng: 80.59619015015559, sikka1: "Binuka", sikka2: "Kayoj", sikka1_no: "", sikka2_no: "0764746821"},
    {place: "Near the preschool", lat: 7.258922322141049, lng: 80.5953386656956, sikka1: "Randima", sikka2: "Rushi", sikka1_no: "0783544968", sikka2_no: "0776249887"},
    {place: "Otu Gaha", lat: 7.255459383699053, lng: 80.5990955006636, sikka1: "Duminda", sikka2: "Hasitha", sikka1_no: "0710635408", sikka2_no: "0711137755"},
    {place: "Rajathel Mawatha", lat: 7.255931607497495, lng: 80.5991273150183, sikka1: "Sadika", sikka2: "Shashidaran", sikka1_no: "0704172379", sikka2_no: ""},
    {place: "Rasthiyadu Mawatha", lat: 7.255962490007838, lng: 80.59675630838161, sikka1: "Hansamal", sikka2: "Dinukshan", sikka1_no: "0704114208", sikka2_no: ""},
    {place: "WUS", lat: 7.255968490117731, lng: 80.5960639730417, sikka1: "Anushka", sikka2: "Nirosha", sikka1_no: "0703013754", sikka2_no: ""},
    {place: "ATM", lat: 7.253776295547575, lng: 80.59724705400275, sikka1: "Hirusha", sikka2: "Hasini", sikka1_no: "0762846205", sikka2_no: "0756418890"},
    // {place: "Near the Sir Ivor Jennings Statue", lat: 7.253454495381876, lng: 80.59775536149242, sikka1: "Bingun", sikka2: "Randima"},
    {place: "Wala", lat: 7.251333776221646, lng: 80.59767307009217, sikka1: "Hirusha", sikka2: "Anojan", sikka1_no: "0712583582", sikka2_no: ""},
    {place: "Akbar Bridge", lat: 7.252751019772638, lng: 80.5936339731747, sikka1: "Malindu", sikka2: "Yalisan", sikka1_no: "0715870838", sikka2_no: ""},
    {place: "Akbar Halt", lat: 7.25234727239802, lng: 80.59346817433996, sikka1: "Dihen", sikka2: "Umar", sikka1_no: "", sikka2_no: "0774278808"},
    {place: "Gymnasium Car Park", lat: 7.255633537860069, lng: 80.59474840204452, sikka1: "Yasiru", sikka2: "Charith", sikka1_no: "0714799732", sikka2_no: "0787888538"},
  ];

function show_sikka_points() {
  sikka_points.forEach(point => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.place,
      icon: {
        url: "Assets/sikka2.png",
        scaledSize: new google.maps.Size(80, 80)
      },
      animation: google.maps.Animation.DROP
    });
    const info = new google.maps.InfoWindow({
      content: `<div style="background:white;border-radius:20px;z-index:99;">
                  <div style="font-size:18px;font-weight:600">${point.place}</div> <br>
                  <div style="font-family:monospace;font-weight:300;font-size:16px">${point.sikka1} and ${point.sikka2}</div>
                </div>`
    });

    marker.addListener("click", () => {
      info.open(map, marker);
      setTimeout(() => {
        info.close();
      }, 2000);
    });
  });
};


const endPoints = {
  wus: [
    {name: "WUS", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  thorana: [
    {name: "Thorana", lat: 7.255633537860069, lng: 80.59474840204452}
  ],
  washrooms: [
    {name: "WUS", lat: 7.255968490117731, lng: 80.5960639730417},
    {name: "Gymnasium", lat: 7.255633537860069, lng: 80.59474840204452},
    {name: "Auditorium", lat: 7.255968490117731, lng: 80.5960639730417},
    {name: "Mainhall", lat: 7.255968490117731, lng: 80.5960639730417},
    {name: "AB Hall", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  canteens: [
    {name: "Milkbar", lat: 7.255459383699053, lng: 80.5990955006636},
	  {name: "WUS", lat: 7.255968490117731, lng: 80.5960639730417},
	  {name: "JuiceBar WUS", lat: 7.255968490117731, lng: 80.5960639730417},
	  {name: "Gemba", lat: 7.255931607497495, lng: 80.5991273150183},
    {name: "Hela Bojun", lat: 7.262394596711491, lng: 80.5961901501555}
  ],
  auditorium: [
    {name: "Auditorium", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  facBoard: [
    {name: "Faculty_Board", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  senate: [
    {name: "Senate", lat: 7.253776295547575, lng: 80.59724705400275}
  ],
  library: [
    {name: "Library", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  gym: [
    {name: "Gymnasium", lat: 7.255633537860069, lng: 80.59474840204452}
  ],
  ictLab: [
    {name: "ICT Lab", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  AB: [
    {name: "AB_Hall", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  mainhall: [
    {name: "Main_Hall", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  ground: [
    {name: "Ground", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  boc: [
    {name: "BOC", lat: 7.253776295547575, lng: 80.59724705400275}
  ],
  peoples: [
    {name: "Peoples", lat: 7.253776295547575, lng: 80.59724705400275}
  ],
  carPark: [
    {name: "Gymnasium", lat: 7.255633537860069, lng: 80.59474840204452},
    {name: "Gemba", lat: 7.255962490007838, lng: 80.59675630838161},
    {name: "Wala", lat: 7.251333776221646, lng: 80.59767307009217},
    {name: "WUS", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  communication: [
    {name: "Communication", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  geography: [
    {name: "Geography_Building", lat: 7.255968490117731, lng: 80.5960639730417}
  ],
  jamesPeiris: [
    {name: "James_Peiris_Hostel", lat: 7.251333776221646, lng: 80.59767307009217}
  ],
  nadan: [
    {name: "sarasavi_Medura", lat: 7.251333776221646, lng: 80.59767307009217}
  ]
}

let markers = [];
more_cont.addEventListener("click", () => {
  more.classList.toggle("show-more");
  more_cont.classList.toggle("show-more-cont");
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  if (is3Dshow){
    is3Dshow = false;
    _3d_cont.style.display = "none";
    remove3D();
  }
  isVideoShow = false;
  removeVideo();
  clear_qr();
});

mapDiv.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
});

wus.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("wus");
});

thorana.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("thorana");
});

carPark.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("carPark");
});

washrooms.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("washrooms");
});

canteens.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("canteens");
});

auditorium.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("auditorium");
});

facBoard.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("facBoard");
});

boc.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("boc");
});

peoples.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("peoples");
});

senate.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("senate");
});

library.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("library");
});

gym.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("gym");
});

AB.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("AB");
});

mainhall.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("mainhall");
});

ictLab.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("ictLab");
});

ground.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("ground");
});

communication.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("communication");
});

geography.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("geography");
});

jp.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("jamesPeiris");
});

sarasaviMedura.addEventListener("click", () => {
  more.classList.remove("show-more");
  more_cont.classList.remove("show-more-cont");
  showPlaces("nadan");
});

function showPlaces(type) {
  if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteQR")) {
    clearRoute("RouteQR");
  }
  if (Object.prototype.hasOwnProperty.call(routeRenderers, "RouteAUTO")) {
    clearRoute("RouteAUTO");
  }
  
  // Remove existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // Hide Street View initially
  document.getElementById("streetview-cont").style.display = "none";

  const places = endPoints[type];
  if (!places || places.length === 0) return;

  // Center map to first place (simple & safe)
  map.panTo({ lat: places[0].lat, lng: places[0].lng });
  map.setZoom(20);

  places.forEach(place_ => {
    const each_lat = place_.lat;
    const each_lng = place_.lng;
    const marker = new google.maps.Marker({
      position: { lat: each_lat, lng: each_lng },
      map: map,
      icon: {
        url: "Assets/red-dot.png",
        scaledSize: new google.maps.Size(100, 50)
      },
      title: place_.name,
      animation: google.maps.Animation.DROP
    });

    const content = place_.name.split(" ").map(word => `${word}<br>`).join(""); 
    // const contentId = `info-${each_lat}-${each_lng}`.replace(/\./g, "_");
    infoWin = new google.maps.InfoWindow({
      content: `<div style="background:white;border-radius:20px;font-weight:800;font-size:16px;justify-content:center;align-items:center;display:flex;">${content}</div>
      <div style="background:white;border-radius:20px;font-weight:300;font-size:8px;justify-content:center;align-items:center;display:flex;">Click the pin</div>`
    });

    infoWin.open(map, marker);

    marker.addListener("click", () => {
      drawRoute = false;

      map.setCenter({ lat: each_lat, lng: each_lng });
      map.setZoom(20);

      AUTO_DESTINATION = { lat: each_lat, lng: each_lng };

      openStreetView(place_);

      nav_btn.style.display = "flex";
      navigate_auto();
    });


    markers.push(marker);
  });

  // Auto-open Street View if only one place
  if (places.length === 1) {
    drawRoute = false;
    map.setCenter({ lat: places[0], lng: places[0].lng });
    map.setZoom(20);
    AUTO_DESTINATION = {lat: places[0].lat, lng: places[0].lng}
    openStreetView(places[0]);
    nav_btn.style.display = "flex";
    navigate_auto();

  } else {
    // Multiple places → fit all markers nicely
    const bounds = new google.maps.LatLngBounds();

    places.forEach(place_ => {
      bounds.extend({ lat: place_.lat, lng: place_.lng });
    });

    map.fitBounds(bounds);

    if (map.getZoom() > 20) {
      map.setZoom(20);
    }
  }
}

function show3Dmodel() {
  if (renderer) return;

  streetview_3d.style.display = "block";
  if (typeof _3d_cont !== 'undefined') _3d_cont.style.display = "block";

  scene = new THREE.Scene();
  
  // -- Setup Camera --
  camera = new THREE.PerspectiveCamera(
    45,
    streetview_3d.clientWidth / streetview_3d.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 4);

  // -- Setup Renderer --
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(streetview_3d.clientWidth, streetview_3d.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  streetview_3d.appendChild(renderer.domElement);

  // -- Lights (Same as your code) --
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 5, 0);
  scene.add(hemiLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
  frontLight.position.set(5, 5, 5);
  frontLight.target.position.set(0, 0, 0);
  frontLight.castShadow = true;
  frontLight.shadow.mapSize.width = 1024;
  frontLight.shadow.mapSize.height = 1024;
  frontLight.shadow.bias = -0.0005;
  scene.add(frontLight);
  scene.add(frontLight.target);

  const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
  backLight.position.set(-5, 3, -5);
  backLight.target.position.set(0, 0, 0);
  backLight.castShadow = false;
  scene.add(backLight);
  scene.add(backLight.target);

  const fillLight = new THREE.PointLight(0xffffff, 0.6);
  fillLight.position.set(0, 3, 2);
  scene.add(fillLight);

  // -- Ground --
  const groundGeo = new THREE.PlaneGeometry(8, 8);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  // -- Load Model --
  const loader = new THREE.GLTFLoader();
  loader.load("Assets/3Dmodel.glb", gltf => {
    if (!scene) return; 

    model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    model.position.set(0, 0.5, -0.7);
    model.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material.side = THREE.DoubleSide;
      }
    });
    scene.add(model);
  });

  function animate() {
    animationId = requestAnimationFrame(animate);
    if (model) model.rotation.y += 0.005;
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
  }
  animate();
}

streetview_cont.addEventListener("click", () => {
  isVideoShow = false;
  removeVideo();
  streetview_cont.style.display = "none";
});

_3d_cont.addEventListener("click", () => {
  if (is3Dshow) {
    remove3D();
  }
  _3d_cont.style.display = "none";
});

streetview_cont.addEventListener("touchstart", () => {
  streetview_tap_to_close.style.display = "flex";
});

streetview_cont.addEventListener("touchend", () => {
  streetview_tap_to_close.style.display = "none";
});

function openStreetView(place) {
  if (place.name === "Thorana"){
    if (is3Dshow) return;
    is3Dshow = true;
    streetview_cont.style.display = "none";
    _3d_cont.style.display = "block";
    streetview_3d.style.display = "block";
    streetview_3d.innerHTML = "";
    show3Dmodel();
  } else {
    // if (isVideoShow) return;
    isVideoShow = true;
    _3d_cont.style.display = "none";
    streetview_cont.style.display = "block";
    streetview_cont.style.top = "100px";
    streetview_cont.style.height = "auto";
    streetview_cont.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
    streetview_cont.style.background = "white";
    streetview_video.style.display = "none";
    streetview_video_title.textContent = place.name;

    streetview_video.src = `Assets/StreetViews/${place.videoName}.mp4`;
    streetview_video.loop = true;
    streetview_video.muted = true;
    streetview_video.autoplay = true;
    streetview_video.playsInline = true;
    streetview_video.load();

    streetview_video.oncanplay = () => {
      streetview_video_loader.style.display = "none";
      streetview_video.style.display = "block";
      streetview_video.play();
    };

    streetview_video.onerror = () => {
      console.log("video error.");
    };
  }
}

function removeVideo(){
  streetview_video.style.display = "none";
  streetview_cont.style.display = "none";
  more_cont.style.display = "block";
  isVideoShow = false;
}

function remove3D() {
  if (animationId) cancelAnimationFrame(animationId);

  if (scene) {
    scene.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => cleanMaterial(mat));
          } else {
            cleanMaterial(object.material);
          }
        }
      }
    });
    scene.clear();
  }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
  }

  scene = null;
  camera = null;
  model = null;
  animationId = null;

  streetview_3d.style.display = "none";
  if (typeof _3d_cont !== 'undefined') _3d_cont.style.display = "none";
  if (typeof is3Dshow !== 'undefined') is3Dshow = false;
  is3Dshow = false;
}

function cleanMaterial(material) {
  material.dispose();
  if (material.map) material.map.dispose();
  if (material.lightMap) material.lightMap.dispose();
  if (material.bumpMap) material.bumpMap.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.specularMap) material.specularMap.dispose();
  if (material.emissiveMap) material.emissiveMap.dispose();
}

async function locateUser() {
  loader_nav.style.display = "flex";
  let pos = null;
  try {
    if (!currentLat || !currentLng) {
      show_msg("Location Tracking doesn't track location yet or Location service still turn off.");
      console.log("Location Tracking doesn't track location yet.");
      const { lat, lng } = await get_user_current_location();
      pos = { lat: lat, lng: lng };
    } else {
      pos = { lat: currentLat, lng: currentLng };
    }
    map.setCenter(pos);
    map.setZoom(20);

    if (userMarker) {
      userMarker.setPosition(pos);
    } else {
      userMarker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: {
          url: "Assets/userMarker2.gif",
          scaledSize: new google.maps.Size(80, 80)
        },
      });
    }

    more_cont.style.display = "none";
    warning.style.display = "flex";
    warning_link = `https://www.google.com/maps/@?api=1&map_action=map`;

  } catch (e) {
    console.log("Location access failed. Please Wait!!!");
  }
  if (is3Dshow) {
    remove3D();
  }
  removeVideo();
  loader_nav.style.display = 'none';
}

centerUser.addEventListener("click", () => {
  locateUser();
});

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function navigate_user_to_WUS() {
  const userLat = getQueryParam("lat");
  const userLng = getQueryParam("lng");

  if (!userLat || !userLng) {
    console.log("No location in URL (empty or missing)");
    return;
  }

  const startPoint = {lat: parseFloat(userLat), lng: parseFloat(userLng)};

  AUTO_DESTINATION = {lat: 7.255968490117731, lng: 80.5960639730417};

  // QR code method
  navigate_QR(startPoint, AUTO_DESTINATION);
  // location tracking method
  navigate_auto();
}

function navigate_QR(startPoint, endPoint) {
  if (!startPoint || !endPoint) {
    show_msg("startPoint or endPoint is null");
    console.log("startPoint or endPoint is null");
    return;
  }

  // Start marker
  qrstart = new google.maps.Marker({
    position: startPoint,
    map,
    title: "Management Faculty Route",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#2e94e7",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white"
    }
  });
  
  startInfo = new google.maps.InfoWindow({
    content: `
      <div style="font-weight:800;font-size:16px">
        Management Faculty <br> Route
      </div>
    `
  });

  startInfo.open({ anchor: qrstart, map });

  // Destination marker
  qrend = new google.maps.Marker({
    position: endPoint,
    map,
    title: "WUS is here",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#FF7F11",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white"
    }
  });

  endInfo = new google.maps.InfoWindow({
    content: `
      <div style="font-weight:800;font-size:16px">
        WUS
      </div>
    `
  });

  endInfo.open({ anchor: qrend, map });

  // Fit map to both points
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(startPoint);
  bounds.extend(endPoint);
  map.fitBounds(bounds);

  drawRoadRoute("RouteQR", startPoint, endPoint, "#0BA6DF");
}

function findSikkaByLatLng(targetLat, targetLng) {
  for (let i = 0; i < sikka_points.length; i++) {
    if (
      sikka_points[i].lat === targetLat &&
      sikka_points[i].lng === targetLng
    ) {
      return {
        sikka1: sikka_points[i].sikka1,
        sikka2: sikka_points[i].sikka2,
        sikka1_no: sikka_points[i].sikka1_no,
        sikka2_no: sikka_points[i].sikka2_no
      };
    }
  }
  return null;
}

async function navigate_auto() {
  let pos = null;

  if (!AUTO_DESTINATION || !AUTO_DESTINATION.lat || !AUTO_DESTINATION.lng) {
    console.warn("AUTO_DESTINATION not ready");
    return;
  }

  clearRoute("RouteAUTO");
  drawRoute = false;

  if (!currentLat || !currentLng) {
    show_msg(`Waiting for location. Please turn on GPS`);
    const { lat, lng } = await get_user_current_location();
    pos = { lat: lat, lng: lng };
  } else {
    pos = { lat: currentLat, lng: currentLng };
  }
  const destination = {lat: AUTO_DESTINATION.lat, lng: AUTO_DESTINATION.lng};

  if (!userMarker) {
    userMarker = new google.maps.Marker({
      map: map,
      icon: {
        url: "Assets/userMarker2.gif",
        scaledSize: new google.maps.Size(80, 80)
      },
    });
  }

  // Start marker
  autostart = new google.maps.Marker({
    position: pos,
    map,
    title: "Start here",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#2e94e7",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white"
    }
  });

  // Destination marker
  autoend = new google.maps.Marker({
    position: destination,
    map,
    title: "Destination",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#2e94e7",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white"
    }
  });

  infoWin.close();

  const sikka = findSikkaByLatLng(destination.lat, destination.lng);

  autoInfo = new google.maps.InfoWindow({
    content: `
      <div style="font-weight:800;font-size:16px">
        Please feel free to talk with your senior batchmates For further guidance. <br><br>
        ඔබට අවශ්‍ය සහය සදහා ජ්‍යෙෂ්ඨ මිතුරන් හමුවන්න. <br><br>
        <center>
        <table style="border:1px solid white;">
          <tr>
            <th style="border:1px solid white; padding:5px; border-right: 1px solid black; border-bottom: 1px solid black;">${sikka.sikka1}</th><th style="border:1px solid white; padding:5px; border-bottom: 1px solid black;">${sikka.sikka2}</th>
          </tr>
          <tr>
            <td style="border:1px solid white; padding:5px; border-right: 1px solid black;">${sikka.sikka1_no}</td><td style="border:1px solid white; padding:5px">${sikka.sikka2_no}</td>
          </tr>
        </table>
        </center>
      </div>
    `
  });

  autoInfo.open({ anchor: autoend, map });

  nav_btn.style.display = "none";
  loader_nav.style.display = "flex";

  clearRoute("RouteAUTO");
  drawRoadRoute("RouteAUTO", pos, destination, "#FF9D23");
}

// location tracking
function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  watchID = navigator.geolocation.watchPosition(
    (position) => {
      const lat = Number(position.coords.latitude);
      const lng = Number(position.coords.longitude);

      if (!isValidLatLng(lat, lng)) {
        console.warn("Invalid GPS values:", lat, lng);
        get_user_current_location().then(location => {
          const lat = location.lat;
          const lng = location.lng;
        });
      }

      currentLat = lat;
      currentLng = lng;

      if (userMarker && map) {
        userMarker.setPosition({ lat, lng });
      }
    },
    (error) => {
      console.warn("Location error:", error.code, error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    }
  );
}

function stopTracking() {
  if (watchID !== null) {
    navigator.geolocation.clearWatch(watchID);
    watchID = null;
  }
}

// AR
animation.addEventListener("click", () => {
  loader_nav.style.display = "flex";

  const site_link = "https://yasiru-nimsara.github.io/AR_Animations/";

  fetch(site_link, { method: "HEAD" })
    .then(response => {
      if (response.ok) {
        loader_nav.style.display = "none";
        window.open(site_link, "_blank");
      } else {
        loader_nav.style.display = "none";
        console.log("The page does not exist!");
      }
    })
    .catch(err => {
      loader_nav.style.display = "none";
      console.error("Error checking page:", err);
    });
});
