const LEFT_COUNT = document.querySelectorAll('.left-row').length
const RIGHT_COUNT = document.querySelectorAll('.right-row').length

const searchParams = new URLSearchParams(window.location.search)

let leftPath = searchParams.get('left_path');
let rightPath = searchParams.get('right_path');

let leftIndex = 1;
let rightIndex = 1;
let isLeftOn = searchParams.get('tab') !== '1';

changeFolder = async (folderPath) => {
    if (isLeftOn) {
        leftPath = folderPath;
    } else {
        rightPath = folderPath;
    }

    const encodedLeftPath = encodeURIComponent(leftPath);
    const encodedRightPath = encodeURIComponent(rightPath);
    const encodedTab = encodeURIComponent(isLeftOn ? '0' : '1');

    window.location.href = `http://127.0.0.1:5000/?left_path=${encodedLeftPath}&right_path=${encodedRightPath}&tab=${encodedTab}`
}

handleKeyPress = async (event, folderPath) => {
    event.preventDefault();
    if (event.key === "Enter") {
        await changeFolder(folderPath);
    }
}

function toggleClassOnElementById(elementId, className) {
    const element = document.getElementById(elementId);
    element.classList.toggle(className);
}

handleChangeSelectedClick = async(event, clickedId) => {
    event.preventDefault();
    isLeftOn ? toggleClassOnElementById(`L${leftIndex}`, 'selected') :
        toggleClassOnElementById(`R${rightIndex}`, 'selected');

    toggleClassOnElementById(clickedId, 'selected');

    const newIndex = Number(clickedId.substring(1));
    clickedId.startsWith('L') ? leftIndex = newIndex : rightIndex = newIndex;
    clickedId.startsWith('L') ? isLeftOn = true : isLeftOn  = false;
}

function focusSelectedElement() {
    const selectedElement = document.querySelector('.selected');
    if (selectedElement) {
        selectedElement.focus();
    }
}

function handlePanelSwitch() {
    toggleClassOnElementById(`L${leftIndex}`, 'selected');
    toggleClassOnElementById(`R${rightIndex}`, 'selected');
    isLeftOn = !isLeftOn;
    focusSelectedElement();
}

function changeSelected(isDown = true) {
    if (isLeftOn) {
        toggleClassOnElementById(`L${leftIndex}`, 'selected');
        leftIndex = isDown ? Math.min(leftIndex + 1, LEFT_COUNT) : Math.max(1, leftIndex - 1);
        toggleClassOnElementById(`L${leftIndex}`, 'selected');
    } else {
        toggleClassOnElementById(`R${rightIndex}`, 'selected');
        rightIndex = isDown ? Math.min(rightIndex + 1, RIGHT_COUNT) : Math.max(1, rightIndex - 1);
        toggleClassOnElementById(`R${rightIndex}`, 'selected');
    }
    focusSelectedElement();
}

document.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (event.key === "Tab") {
        handlePanelSwitch();
    }
    if (event.key === "ArrowDown") {
        changeSelected(true);
    }
    if (event.key === "ArrowUp") {
        changeSelected(false);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (isLeftOn) {
        toggleClassOnElementById(`L${leftIndex}`, 'selected');
    } else {
        toggleClassOnElementById(`R${rightIndex}`, 'selected');
    }
    focusSelectedElement();
});