const httpClient = new HttpRequest();

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
        toggleClassOnElementById(`L${leftIndex}`, 'selected');
    } else {
        toggleClassOnElementById(`R${rightIndex}`, 'selected');
    }
    focusSelectedElement();
});

document.addEventListener("keydown", (event) => {
    if (isModalActive) {
        return;
    }
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


async function handleKeyPressOnSelect(event, path, baseName, fileType) {
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
    if (event.key === 'F1') {
        await openRenameModal(baseName);
    }
    if((event.key === 'F2' || event.key === 'Enter') && fileType === 'file-name') {
        await openViewPage(baseName);
    }
    if(event.key === 'F3' && fileType === 'file-name') {
        await openEditPage(baseName);
    }
    if(event.key === 'F6') {
        await openMkDirModal();
    }
    if (event.key === 'F7') {
        await openMkFileModal();
    }
    if (event.key === 'F8') {
        await openDeleteModal(baseName);
    }
}

const renameSelectedFolder = async (event, oldName) => {
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

const deleteSelectedFolder = async (event, fileName) => {
    let fullPath = isLeftOn ? `${leftPath}/${fileName}` : `${rightPath}/${fileName}`;
    fullPath = encodeURIComponent(fullPath);
    try {
        await httpClient.delete(`${LOCALHOST}/${API_PATH}/delete?path=${fullPath}`);
        window.location.reload();
    } catch (err) {
        alert(`Delete Failed: ${err}`);
    }
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

const createNewFolder = async() => {
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

const handleChangeSelectedClick = async (event, clickedId) => {
    event.preventDefault();
    isLeftOn ? toggleClassOnElementById(`L${leftIndex}`, 'selected') :
        toggleClassOnElementById(`R${rightIndex}`, 'selected');

    toggleClassOnElementById(clickedId, 'selected');

    const newIndex = Number(clickedId.substring(1));
    clickedId.startsWith('L') ? leftIndex = newIndex : rightIndex = newIndex;
    clickedId.startsWith('L') ? isLeftOn = true : isLeftOn = false;
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

const openRenameModal = async (baseName) => {
    const renameModal = document.getElementById('rename-modal');
    document.getElementById("rename-option").value = `${baseName}`;
    document.getElementById("rename-label").textContent = `Rename ${baseName} to:`;
    renameModal.style.display = "flex";
    isModalActive = true;
    document.getElementById("rename-button").addEventListener('click', async (event) =>
        renameSelectedFolder(event, baseName));
}

const openDeleteModal = async (baseName) => {
    const deleteModal = document.getElementById('delete-modal');
    document.getElementById("delete-label").textContent = `Are you sure you want to move ${baseName} to the Recycle Bin?`;
    deleteModal.style.display = "flex";
    isModalActive = true;
    document.getElementById("delete-button").addEventListener('click', async (event) =>
        deleteSelectedFolder(event, baseName));
}

const openMkFileModal = async () => {
    const mkFileModal = document.getElementById('mkfile-modal');
    mkFileModal.style.display = "flex";
    isModalActive = true;
    document.getElementById('mkfile-button').addEventListener('click', async (event) =>
        createNewFile(event));
}

const openMkDirModal = async() => {
    const mkDirModal = document.getElementById('mkdir-modal');
    mkDirModal.style.display = "flex";
    isModalActive = true;
    document.getElementById('mkdir-button').addEventListener('click', async (event) =>
        createNewFolder(event));
}

const openViewPage = async(baseName) => {
    let fullPath = isLeftOn ? `${leftPath}\\${baseName}` : `${rightPath}\\${baseName}`;
    fullPath = encodeURIComponent(fullPath);
    localStorage.setItem('previousPage', window.location.href);
    window.location.href = `${LOCALHOST}/view?path=${fullPath}`;
}

const openEditPage = async(baseName) => {
    let fullPath = isLeftOn ? `${leftPath}\\${baseName}` : `${rightPath}\\${baseName}`;
    fullPath = encodeURIComponent(fullPath);
    localStorage.setItem('previousPage', window.location.href);
    window.location.href = `${LOCALHOST}/edit?path=${fullPath}`;
}

const closeModal = (modalId) => {
    isModalActive = false;
    document.getElementById(modalId).style.display = "none";
    focusSelectedElement();
}
