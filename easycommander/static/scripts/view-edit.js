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

    if (event.key === 'F1' || (event.key === 'F2' && pageType === 'Edit')) {
        event.preventDefault();
        const previousPage = localStorage.getItem('previousPage');
        if (!previousPage) {
            window.location.href = `${LOCALHOST}/`;
        } else {
            localStorage.removeItem('previousPage');
            window.location.href = `${previousPage}`;
        }
    }
});
