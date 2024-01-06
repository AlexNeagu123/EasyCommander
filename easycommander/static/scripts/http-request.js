class HttpRequest {
    post(url, body) {
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }).then(this.handleResponse);
    }

    put(url, body) {
        return fetch(url, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }).then(this.handleResponse);
    }

    delete(url) {
        return fetch(url, {
            method: 'DELETE'
        }).then(this.handleResponse);
    }

    async handleResponse(response) {
        const data = await response.json();
        if(!data.success) {
            throw new Error(data.message);
        }
        return data.message;
    }
}

const makeHttpRequest = async (method, url, body= null) => {
    try {
        switch(method) {
            case "POST": await httpClient.post(url, body); break;
            case "PUT": await httpClient.put(url, body); break;
            case "DELETE": await httpClient.delete(url); break;
        }
        return true;
    } catch(err) {
        alert(`Operation Failed: ${err}`);
    }
    return false;
}