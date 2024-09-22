const API = {
    async getAllPoints() {
        return await fetch('http://localhost:5163/api/points'); // URL'yi backend endpointinle değiştir
    },

    async addPoint(x, y, name) {
        return await fetch('http://localhost:5163/api/points', { // URL'yi backend endpointinle değiştir
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ x, y, name })
        });
    },

    async updatePoint(id, name) {
        return await fetch(`http://localhost:5163/api/points/${id}`, { // URL'yi backend endpointinle değiştir
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
    },

    async deletePoint(id) {
        return await fetch(`http://localhost:5163/api/points/${id}`, { // URL'yi backend endpointinle değiştir
            method: 'DELETE'
        });
    }
};
