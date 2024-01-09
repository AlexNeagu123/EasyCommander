class HttpRequest {
    get(url) {
        return fetch(url, {
            method: 'GET'
        }).then(this.handleResponseHTMLWithJsonError);
    }

    post(url, body) {
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }).then(this.handleResponseJson);
    }

    put(url, body) {
        return fetch(url, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }).then(this.handleResponseJson);
    }

    delete(url) {
        return fetch(url, {
            method: 'DELETE'
        }).then(this.handleResponseJson);
    }

    async handleResponseJson(response) {
        const data = await response.json();
        if(!data.success) {
            throw new Error(data.message);
        }
        return data.message;
    }

    async handleResponseHTMLWithJsonError(response) {
       if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        return await response.text();
    }
}

const makeHttpRequest = async (method, url, body= null) => {
    try {
        switch(method) {
            case "GET": await httpClient.get(url); break;
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