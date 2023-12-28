const httpClient = new HttpRequest();
const filePath = SEARCH_PARAMS.get('path');

document.addEventListener("keydown", async (event) => {
    if (event.key === 'F2' && pageType === 'Edit') {
        try {
            const content = document.getElementById('content-container').innerText;
            const encodedPath = encodeURI(filePath);
            await httpClient.put(`${LOCALHOST}/${API_PATH}/file?path=${encodedPath}`, {
                content: content
            });
        } catch(err) {
            alert(`Saving failed: ${err}`)
        }
    }

    if (event.key === 'F1' || event.key === 'F2') {
        event.preventDefault();
        const previousPage = localStorage.getItem('previousPage');
        if (!previousPage) {
            window.location.href = `${LOCALHOST}/`;
        } else {
            localStorage.removeItem('previousPage');
            window.location.href = `${previousPage}`;
        }
    }
})

const loadFileContent = async (filePath) => {
    try {
        const textContent = await httpClient.get(`${LOCALHOST}/api/v1/file?path=${filePath}`);
        const fileContentContainer = document.getElementById('content-container');
        fileContentContainer.innerText = textContent;
    } catch (err) {
        alert(`Loading Failed: ${err}`);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadFileContent(filePath);
});