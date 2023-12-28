class HttpRequest {
    get(url) {
        return fetch(url, {
            method: 'GET'
        }).then(this.handleResponse);
    }

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
        return data;
    }
}