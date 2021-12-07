const docQ = document.querySelector.bind(document),
    docQA = document.querySelectorAll.bind(document);

pannellum.viewer('pano', {
    "type": "equirectangular",
    "panorama": "./dist/img/pier-39.jpeg",
    "autoRotate": 0,
    "autoLoad": true,
    "hotSpotDebug": true,
    "compass": false,
    "showControls": true,
    "hotSpots": [
        { // Intro Video
            "pitch": -15,
            "yaw": -15,
            "cssClass": "custom-tooltip-vid",
            "createTooltipFunc": videoHotspot,
            "createTooltipArgs": {
                title: "Walking Tour of Pier 39",
                src: "pier-39.mp4"
            }
        },
        { // The Carousel
            "pitch": 3,
            "yaw": 9.5,
            "cssClass": "custom-tooltip-img",
            "createTooltipFunc": imgHotspot,
            "createTooltipArgs": {
                title: "The San Francisco Carousel",
                src: "merry-go-round.png"
            }
        },
        { // Mango's Cantina
            "pitch": -2,
            "yaw": 82.8,
            "type": "info",
            "text": "Mango's Cantina",
            "URL": "http://places.singleplatform.com/mangos-taqueria-and-cantina/menu"
        },
        { // Crepe Cafe
            "pitch": -1,
            "yaw": -158,
            "type": "info",
            "text": "<strong style='color: red; font-size: 1.25rem;'>Crepe Cafe</strong>\n<p style='text-align: left;'>Small eatery with outdoor seating serving sweet & savory crêpes that you can watch being made.</p>",
            "URL": "http://www.the-crepe-cafe.com"
        }
    ]
});

function addSpan(hotspotDiv) {
    // Create span
    hotspotDiv.classList.add('custom-tooltip');
    const span = document.createElement('span');
    hotspotDiv.appendChild(span);

    // Hover Events
    function onTop(el, mode) { // mode is a boolean
        mode ? mode = 9999 : mode = '100';
        el.style.zIndex = mode;
    }
    hotspotDiv.addEventListener('mouseover', () => {
        onTop(hotspotDiv, true);
    });
    hotspotDiv.addEventListener('mouseout', () => {
        onTop(hotspotDiv, false);
    });
    span.addEventListener('mouseout', () => {
        onTop(hotspotDiv, false);
    });

    return span;
}

function videoHotspot(hotspotDiv, args) {
    // Init Hotspot...
    const span = addSpan(hotspotDiv);
    // Custom Logic...
    span.innerHTML = `<div class="tooltip-title" style="color: white; text-align: center; font-size: 1.25rem;">${args.title}</div><video poster="./dist/videos/pier-39-thumb.png" class="hotspot-vid" width="320" height="240" src="./dist/videos/${args.src}" controls></video>`;
    const vidObj = span.querySelector('video');
    vidObj.addEventListener('mouseout', vidObj.pause);
}

function imgHotspot(hotspotDiv, args) {
    // Init Hotspot...
    const span = addSpan(hotspotDiv);
    // Custom Logic...
    span.innerHTML = `<div class="tooltip-title" style="color: white; text-align: center; font-size: 1.25rem;">${args.title}</div><img onclick="window.open('./dist/img/${args.src}', '_blank');" class="hotspot-img" src="dist/img/${args.src}"/>`;
}