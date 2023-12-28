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
    if (event.key === "Tab") {
        handlePanelSwitch();
    }
    if (event.key === "ArrowDown") {
        changeFocused(true);
    }
    if (event.key === "ArrowUp") {
        changeFocused(false);
    }
    if (event.key === 'F4') {
        await openCopyModal();
    }
    if (event.key === 'F5') {
        await openMoveModal();
    }
    if (event.key === 'F6') {
        await openMkDirModal();
    }
    if (event.key === 'F7') {
        await openMkFileModal();
    }
});
const changeFolder = async (folderPath) => {
    if (isLeftOn) {
        leftPath = folderPath;
    } else {
        rightPath = folderPath;
    }

    const encodedLeftPath = encodeURIComponent(leftPath);
    const encodedRightPath = encodeURIComponent(rightPath);
    const encodedTab = encodeURIComponent(isLeftOn ? '0' : '1');

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
    if (event.key === 'Control') {
        selectElement(path);
    }
    if (event.key === 'F1') {
        await openRenameModal(baseName);
    }
    if ((event.key === 'F2' || event.key === 'Enter') && fileType === 'file-name') {
        await openViewPage(baseName);
    }
    if (event.key === 'F3' && fileType === 'file-name') {
        await openEditPage(baseName);
    }
    if (event.key === 'F8') {
        await openDeleteModal(baseName);
    }
}

const renameFocusedResource = async (event, oldName) => {
    const oldPath = isLeftOn ? `${leftPath}/${oldName}` : `${rightPath}/${oldName}`;
    const newName = document.getElementById("rename-option").value;
    const newPath = isLeftOn ? `${leftPath}/${newName}` : `${rightPath}/${newName}`;

    try {
        await httpClient.post(`${LOCALHOST}/${API_PATH}/rename`, {
            old_name: oldPath,
            new_name: newPath
        });
        window.location.reload();
    } catch (err) {
        alert(`Rename Failed: ${err}`);
    }
}

const deleteFocusedResource = async (event, selectedSet) => {
    for (let item of selectedSet) {
        item = encodeURIComponent(item);
        try {
            await httpClient.delete(`${LOCALHOST}/${API_PATH}/delete?path=${item}`);
        } catch (err) {
            alert(`Delete Failed: ${err}`);
        }
    }
    window.location.reload();
}

const createNewFile = async (event) => {
    const baseName = document.getElementById('file-name-input').value;
    const fullPath = isLeftOn ? `${leftPath}/${baseName}` : `${rightPath}/${baseName}`;
    try {
        await httpClient.post(`${LOCALHOST}/${API_PATH}/file`, {
            file_path: fullPath
        });
        window.location.reload();
    } catch (err) {
        alert(`Make File Failed: ${err}`);
    }
}

const createNewFolder = async () => {
    const baseName = document.getElementById('folder-name-input').value;
    const fullPath = isLeftOn ? `${leftPath}/${baseName}` : `${rightPath}/${baseName}`;
    try {
        await httpClient.post(`${LOCALHOST}/${API_PATH}/folder`, {
            folder_path: fullPath
        });
        window.location.reload();
    } catch (err) {
        alert(`Make Folder Failed: ${err}`);
    }
}

const copySelectedItems = async(selectedSet, destinationPath) => {
    destinationPath = encodeURIComponent(destinationPath);
    try {
        await httpClient.post(`${LOCALHOST}/${API_PATH}/copy?dest_path=${destinationPath}`, {
            items: Array.from(selectedSet)
        });
        window.location.reload()
    } catch (err) {
        alert(`Copy Failed: ${err}`);
    }
}

const moveSelectedItems = async(selectedSet, destinationPath) => {
    destinationPath = encodeURIComponent(destinationPath);
    try {
        await httpClient.post(`${LOCALHOST}/${API_PATH}/move?dest_path=${destinationPath}`, {
            items: Array.from(selectedSet)
        });
        window.location.reload()
    } catch (err) {
        alert(`Copy Failed: ${err}`);
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
        renameFocusedResource(event, baseName));
}


const openDeleteModal = async () => {
    const selectedSet = isLeftOn ? leftSelected : rightSelected;
    const itemsNo = selectedSet.size
    if (itemsNo === 0) {
        return;
    }

    const deleteModal = document.getElementById('confirm-modal');
    document.getElementById("confirm-label").textContent = `Are you sure you want to move ${itemsNo} items to the Recycle Bin?`;
    deleteModal.style.display = "flex";
    isModalActive = true;
    document.getElementById("confirm-button").textContent = "Delete";
    document.getElementById("confirm-button").addEventListener('click', async (event) =>
        deleteFocusedResource(event, selectedSet));
}

const openCopyModal = async () => {
    const selectedSet = isLeftOn ? leftSelected : rightSelected;
    let destinationPath = isLeftOn ? rightPath : leftPath;
    const itemsNo = selectedSet.size
    if (itemsNo === 0) {
        return;
    }

    const copyModal = document.getElementById('confirm-modal');
    document.getElementById("confirm-label").textContent = `Are you sure you want to copy ${itemsNo} items to ${destinationPath}?`;
    copyModal.style.display = "flex";
    isModalActive = true;

    document.getElementById("confirm-button").textContent = "Copy";
    document.getElementById("confirm-button").addEventListener('click', async (event) =>
        copySelectedItems(selectedSet, destinationPath));
}

const openMoveModal = async () => {
    const selectedSet = isLeftOn ? leftSelected : rightSelected;
    let destinationPath = isLeftOn ? rightPath : leftPath;
    const itemsNo = selectedSet.size
    if (itemsNo === 0) {
        return;
    }

    const moveModal = document.getElementById('confirm-modal');
    document.getElementById("confirm-label").textContent = `Are you sure you want to move ${itemsNo} items to ${destinationPath}?`;
    moveModal.style.display = "flex";
    isModalActive = true;

    document.getElementById("confirm-button").textContent = "Move";
    document.getElementById("confirm-button").addEventListener('click', async (event) =>
        moveSelectedItems(selectedSet, destinationPath));
}

const openMkFileModal = async () => {
    const mkFileModal = document.getElementById('mkfile-modal');
    mkFileModal.style.display = "flex";
    isModalActive = true;
    document.getElementById('mkfile-button').addEventListener('click', async (event) =>
        createNewFile(event));
}

const openMkDirModal = async () => {
    const mkDirModal = document.getElementById('mkdir-modal');
    mkDirModal.style.display = "flex";
    isModalActive = true;
    document.getElementById('mkdir-button').addEventListener('click', async (event) =>
        createNewFolder(event));
}

const openViewPage = async (baseName) => {
    let fullPath = isLeftOn ? `${leftPath}\\${baseName}` : `${rightPath}\\${baseName}`;
    fullPath = encodeURIComponent(fullPath);
    localStorage.setItem('previousPage', window.location.href);
    window.location.href = `${LOCALHOST}/view?path=${fullPath}`;
}

const openEditPage = async (baseName) => {
    let fullPath = isLeftOn ? `${leftPath}\\${baseName}` : `${rightPath}\\${baseName}`;
    fullPath = encodeURIComponent(fullPath);
    localStorage.setItem('previousPage', window.location.href);
    window.location.href = `${LOCALHOST}/edit?path=${fullPath}`;
}

const closeModal = (modalId) => {
    isModalActive = false;
    document.getElementById(modalId).style.display = "none";
    focusElement();
}
