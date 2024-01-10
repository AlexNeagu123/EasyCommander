const httpClient = new HttpRequest();

const leftSelected = new Set();
const rightSelected = new Set();

let isModalActive = false;

let [leftPath, rightPath, isLeftOn] =
    [SEARCH_PARAMS.get('left_path'), SEARCH_PARAMS.get('right_path'), SEARCH_PARAMS.get('tab') !== '1']

let [leftIndex, rightIndex] = [1, 1];

function toggleClassOnElementById(elementId, className) {
    const element = document.getElementById(elementId);
    element.classList.toggle(className);
}

document.addEventListener("DOMContentLoaded", () => {
    if (isLeftOn) {
        toggleClassOnElementById(`L${leftIndex}`, 'focused');
    } else {
        toggleClassOnElementById(`R${rightIndex}`, 'focused');
    }
    focusElement();
});

document.addEventListener("keydown", async (event) => {
    if (isModalActive) {
        return;
    }

    event.preventDefault();
    switch(event.key) {
        case "Tab": handlePanelSwitch(); break;
        case "ArrowDown": changeFocused(true); break;
        case "ArrowUp": changeFocused(false); break;
        case "F4": await openModalWithSelection("copy"); break;
        case "F5": await openModalWithSelection("move"); break;
        case "F6": await openMkItemModal("mkdir"); break;
        case "F7": await openMkItemModal("mkfile"); break;
        case "F8": await openModalWithSelection("delete"); break;
    }
});

async function handleKeyPressOnFocused(event, path, baseName, fileType) {
    if (isModalActive) {
        return;
    }
    event.preventDefault();
    if (event.key === 'Enter' && fileType === 'folder-name') {
        await changeFolder(path);
    }
    if (baseName === "..") {
        return;
    }
    if ((event.key === 'F2' || event.key === 'Enter') && fileType === 'file-name') {
        await openFilePage(baseName, "view");
        return;
    }
    if (event.key === 'F3' && fileType === 'file-name') {
        await openFilePage(baseName, "edit");
        return;
    }
    switch(event.key) {
        case "Control": selectElement(path); break;
        case "F1": await openRenameModal(baseName); break;
    }
}

const changeFolder = async (folderPath) => {
    let [oldLeftPath, oldRightPath] = [leftPath, rightPath];
    if (isLeftOn) {
        leftPath = folderPath;
    } else {
        rightPath = folderPath;
    }

    const encodedLeftPath = encodeURIComponent(leftPath);
    const encodedRightPath = encodeURIComponent(rightPath);
    const encodedTab = encodeURIComponent(isLeftOn ? '0' : '1');

    // See if the url can be changed
    const isSuccess = await makeHttpRequest("GET",
        `${LOCALHOST}/?left_path=${encodedLeftPath}&right_path=${encodedRightPath}&tab=${encodedTab}`);

    if(!isSuccess) {
        [leftPath, rightPath] = [oldLeftPath, oldRightPath];
        return;
    }
    
    window.location.href = `${LOCALHOST}/?left_path=${encodedLeftPath}&right_path=${encodedRightPath}&tab=${encodedTab}`
}

function togglePathInSet(selectedSet, path) {
    if (selectedSet.has(path)) {
        selectedSet.delete(path);
    } else {
        selectedSet.add(path);
    }
}

function selectElement(resourcePath) {
    if (isLeftOn) {
        togglePathInSet(leftSelected, resourcePath);
        toggleClassOnElementById(`L${leftIndex}`, 'selected');
    } else {
        togglePathInSet(rightSelected, resourcePath);
        toggleClassOnElementById(`R${rightIndex}`, 'selected');
    }
    focusElement();
}

const renameFocusedItem = async (event, oldName) => {
    const newName = document.getElementById("rename-option").value;
    const requestBody = {
        old_name: isLeftOn ? `${leftPath}/${oldName}` : `${rightPath}/${oldName}`,
        new_name: isLeftOn ? `${leftPath}/${newName}` : `${rightPath}/${newName}`
    };
    const isSuccess = await makeHttpRequest("POST", `${LOCALHOST}/${API_PATH}/rename`, requestBody);
    if(isSuccess) {
        window.location.reload();
    }
}

const deleteSelectedItems = async (event, selectedSet) => {
    let isSuccess = true;
    for (let item of selectedSet) {
        item = encodeURIComponent(item);
        isSuccess = await makeHttpRequest("DELETE", `${LOCALHOST}/${API_PATH}/delete?path=${item}`);
        if(!isSuccess) {
            break;
        }
    }
    if(isSuccess) {
        window.location.reload();
    }
}

const createNewItem = async(itemType) => {
    const baseName = document.getElementById(`${itemType}-name-input`).value;
    const requestBody = {
        path: isLeftOn ? `${leftPath}/${baseName}` : `${rightPath}/${baseName}`
    }
    const isSuccess = await makeHttpRequest("POST", `${LOCALHOST}/${API_PATH}/${itemType}`, requestBody);
    if(isSuccess) {
        window.location.reload();
    }
}

const copyOrMoveSelectedItems = async(selectedSet, destinationPath, operationType) => {
    const requestBody = {
        items: Array.from(selectedSet),
        destination: destinationPath
    };
    const isSuccess = await makeHttpRequest("POST", `${LOCALHOST}/${API_PATH}/${operationType}`, requestBody);
    if(isSuccess) {
        window.location.reload();
    }
}

const handleChangeFocusedClick = async (event, clickedId) => {
    event.preventDefault();
    isLeftOn ? toggleClassOnElementById(`L${leftIndex}`, 'focused') :
        toggleClassOnElementById(`R${rightIndex}`, 'focused');

    toggleClassOnElementById(clickedId, 'focused');

    const newIndex = Number(clickedId.substring(1));
    clickedId.startsWith('L') ? leftIndex = newIndex : rightIndex = newIndex;
    clickedId.startsWith('L') ? isLeftOn = true : isLeftOn = false;
}

function focusElement() {
    const focusedElement = document.querySelector('.focused');
    if (focusedElement) {
        focusedElement.focus();
    }
}

function handlePanelSwitch() {
    toggleClassOnElementById(`L${leftIndex}`, 'focused');
    toggleClassOnElementById(`R${rightIndex}`, 'focused');
    isLeftOn = !isLeftOn;
    focusElement();
}

function changeFocused(isDown = true) {
    if (isLeftOn) {
        toggleClassOnElementById(`L${leftIndex}`, 'focused');
        leftIndex = isDown ? Math.min(leftIndex + 1, LEFT_COUNT) : Math.max(1, leftIndex - 1);
        toggleClassOnElementById(`L${leftIndex}`, 'focused');
    } else {
        toggleClassOnElementById(`R${rightIndex}`, 'focused');
        rightIndex = isDown ? Math.min(rightIndex + 1, RIGHT_COUNT) : Math.max(1, rightIndex - 1);
        toggleClassOnElementById(`R${rightIndex}`, 'focused');
    }
    focusElement();
}

const openRenameModal = async (baseName) => {
    const renameModal = document.getElementById('rename-modal');
    document.getElementById("rename-option").value = `${baseName}`;
    document.getElementById("rename-label").textContent = `Rename ${baseName} to:`;
    renameModal.style.display = "flex";
    isModalActive = true;
    document.getElementById("rename-button").addEventListener('click', async (event) =>
        renameFocusedItem(event, baseName));
}

const openModalWithSelection = async(operationType) => {
    const selectedSet = isLeftOn ? leftSelected : rightSelected;
    let destinationPath = isLeftOn ? rightPath : leftPath;
    let action = operationType === "delete" ? "move" : operationType;
    if(operationType === "delete") {
        destinationPath = "Recycle Bin";
    }

    const itemsNo = selectedSet.size
    if (itemsNo === 0) {
        return;
    }

    const modal = document.getElementById('confirm-modal');
    document.getElementById("confirm-label").textContent = `Are you sure 
        you want to ${action} ${itemsNo} items to ${destinationPath}?`;

    modal.style.display = "flex";
    isModalActive = true;
    document.getElementById("confirm-button").textContent = operationType[0].toUpperCase() + operationType.slice(1);

    document.getElementById("confirm-button").addEventListener('click', async (event) => {
        switch (operationType) {
            case "delete": await deleteSelectedItems(event, selectedSet); break;
            case "move": await copyOrMoveSelectedItems(selectedSet, destinationPath, operationType); break;
            case "copy": await copyOrMoveSelectedItems(selectedSet, destinationPath, operationType); break;
        }
    });
}

const openMkItemModal = async(operationType) => {
    const modal = document.getElementById(`${operationType}-modal`);
    modal.style.display = "flex";
    isModalActive = true;
    document.getElementById(`${operationType}-button`).addEventListener('click', async (event) => {
        switch (operationType) {
            case "mkfile": await createNewItem('file'); break;
            case "mkdir": await createNewItem('folder'); break;
        }
    });
};

const openFilePage = async (baseName, pageType) => {
    let fullPath = isLeftOn ? `${leftPath}/${baseName}` : `${rightPath}/${baseName}`;
    fullPath = encodeURIComponent(fullPath);
    const isSuccess = await makeHttpRequest("GET", `${LOCALHOST}/${pageType}?path=${fullPath}`);
    if(!isSuccess) {
        return;
    }
    window.location.href = `${LOCALHOST}/${pageType}?path=${fullPath}`;
    localStorage.setItem('previousPage', window.location.href);
}

const closeModal = (modalId) => {
    isModalActive = false;
    document.getElementById(modalId).style.display = "none";
    focusElement();
}
