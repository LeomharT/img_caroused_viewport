let IMG_URLS = [];

let IS_MODBILE_DEVICE = false;

if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
  IS_MODBILE_DEVICE = true;
}

const body = document.querySelector("body");

/**
 * Get all img element
 */
const embedImageEl = document.querySelectorAll(".embedImage-img");

let enabled = true;

/**
 * No img need to preview
 */
if (embedImageEl.length === 0) {
  console.error("No image");
}

for (const el of embedImageEl) {
  IMG_URLS.push(el.getAttribute("src"));
}

IMG_URLS = IMG_URLS.concat(IMG_URLS.slice(0, 4));

/**
 * Root element node
 */
const PREVIEW_NODE = document.createElement("div");
PREVIEW_NODE.className = "embed-preview";

/**
 * Big image list
 */
const IMAGE_CAROUSED = document.createElement("div");
IMAGE_CAROUSED.className = "image-caroused";
PREVIEW_NODE.append(IMAGE_CAROUSED);

/**
 * Preview element width
 */
const SIZE = {
  width: 720,
};

const DOWN = {
  x: 0,
};

let OFFSET_X = 0;
let TARGET_INDEX = 0;

function onPointDown(e) {
  if (!IS_MODBILE_DEVICE) {
    DOWN.x = e.clientX;
    IMAGE_CAROUSED.addEventListener("pointermove", onPointMove);
  } else {
    DOWN.x = e.touches[0].clientX;
    IMAGE_CAROUSED.addEventListener("touchmove", onPointMove);
  }
}

function onPointUp() {
  IMAGE_CAROUSED.removeEventListener("touchmove", onPointMove);
  IMAGE_CAROUSED.removeEventListener("pointermove", onPointMove);

  const OFFSET_PERCENTAGE = OFFSET_X / SIZE.width;

  if (OFFSET_PERCENTAGE % 1 <= 0.5) {
    TARGET_INDEX = Math.floor(OFFSET_PERCENTAGE % IMG_URLS.length);
  } else {
    TARGET_INDEX = Math.ceil(OFFSET_PERCENTAGE % IMG_URLS.length);
  }

  OFFSET_X = TARGET_INDEX * SIZE.width;

  IMAGE_CAROUSED.style.transition = "all 0.3s ease 0s";
  IMAGE_CAROUSED.style.transform = `translateX(${-OFFSET_X}px)`;

  setTimeout(() => {
    console.log(TARGET_INDEX, embedImageEl.length);

    CAROUSED_LIST.style.transform = `translateX(${-TARGET_INDEX * offset}px)`;
    CAROUSED_ITEMS.forEach((_el, _index, _arr) => {
      _el.style.zIndex = _arr.length - _index;
      if (_index === TARGET_INDEX) _el.style.zIndex = 50;
    });

    IMAGE_CAROUSED.style.transition = "none";
    if (TARGET_INDEX >= embedImageEl.length) {
      OFFSET_X = (TARGET_INDEX % embedImageEl.length) * SIZE.width;
      IMAGE_CAROUSED.style.transform = `translateX(${-OFFSET_X}px)`;

      setTimeout(() => {
        console.log("No style");
        CAROUSED_LIST.style.transition = "none";
        CAROUSED_LIST.style.transform = `translateX(${
          -(TARGET_INDEX % embedImageEl.length) * offset
        }px)`;
      }, 600);

      setTimeout(() => {
        CAROUSED_LIST.style.transition = "all 0.3s ease 0s";
      }, 700);
    }
  }, 400);
}
/**
 * @param {PointerEvent | TouchEvent} e
 */
function onPointMove(e) {
  let MOVE_X = e.clientX;
  if (IS_MODBILE_DEVICE) MOVE_X = e.touches[0].clientX;

  OFFSET_X += DOWN.x - MOVE_X;
  OFFSET_X = Math.max(0.0, OFFSET_X);
  OFFSET_X = Math.min(SIZE.width * (IMG_URLS.length - 1), OFFSET_X);

  IMAGE_CAROUSED.style.transform = `translateX(${-OFFSET_X}px)`;
  DOWN.x = MOVE_X;
}

if (!IS_MODBILE_DEVICE) {
  // Desktop events
  IMAGE_CAROUSED.addEventListener("pointerdown", onPointDown);
  window.addEventListener("pointerup", onPointUp);
} else {
  // Mobile events
  IMAGE_CAROUSED.addEventListener("touchstart", onPointDown);
  window.addEventListener("touchend", onPointUp);
}

IMG_URLS.forEach((url, index) => {
  const CURRENT_IMAGE = document.createElement("img");
  CURRENT_IMAGE.className = "current-image";
  CURRENT_IMAGE.src = url;
  CURRENT_IMAGE.style.transform = `translateX(${SIZE.width * index}px)`;

  IMAGE_CAROUSED.append(CURRENT_IMAGE);
  IMAGE_CAROUSED.style.width = `${SIZE.width * (index + 1)}px`;
});

/**
 * Preview caroused
 */
const CAROUSED = document.createElement("div");
CAROUSED.className = "embed-caroused";
PREVIEW_NODE.append(CAROUSED);

const CAROUSED_LIST = document.createElement("div");
CAROUSED_LIST.classList = "embed-caroused-list";
CAROUSED.append(CAROUSED_LIST);

/**
 * @type {HTMLDivElement[]}
 */
const CAROUSED_ITEMS = [];

// Half image width
const offset = 128 / 2;
let current = 0;

IMG_URLS.forEach((url, index) => {
  const item = document.createElement("div");
  item.className = "embed-caroused-item";
  item.style.transform = `translateX(${offset * index}px)`;
  item.style.backgroundImage = `url(${url})`;
  item.style.zIndex = IMG_URLS.length - index;

  CAROUSED_ITEMS.push(item);
});

CAROUSED_LIST.append(...CAROUSED_ITEMS);

CAROUSED_ITEMS.forEach((el, index, arr) => {
  el.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!enabled) return;

    enabled = false;

    current = index;
    if (current === index) {
      el.style.zIndex = 50;
    }

    OFFSET_X = current * SIZE.width;
    TARGET_INDEX = current;
    IMAGE_CAROUSED.style.transition = "all 0.3s ease 0s";
    IMAGE_CAROUSED.style.transform = `translateX(${-OFFSET_X}px)`;

    // CURRENT_IMAGE.src = IMG_URLS[current];
    CAROUSED_LIST.style.transform = `translateX(${-current * offset}px)`;

    // Wait for animation
    setTimeout(() => {
      enabled = true;
      IMAGE_CAROUSED.style.transition = "none";
    }, 350);

    if (index >= embedImageEl.length) {
      current = index % embedImageEl.length;

      setTimeout(() => {
        CAROUSED_LIST.style.transition = "none";
        CAROUSED_LIST.style.transform = `translateX(${-current * offset}px)`;

        arr.forEach((_el, _index) => {
          _el.style.zIndex = arr.length - _index;

          if (_index === current) _el.style.zIndex = 50;
        });
      }, 500);

      setTimeout(() => {
        CAROUSED_LIST.style.transition = "all 0.3s ease 0s";
      }, 600);
    }
  });
});

body.prepend(PREVIEW_NODE);
