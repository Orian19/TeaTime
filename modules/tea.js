class Tea {
    constructor(id, name, description, price, category, origin, lat, lng, caffeine, temperature, imageUrl, quantity=0) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.origin = origin;
        this.lat = lat;
        this.lng = lng;
        this.caffeine = caffeine;
        this.temperature = temperature;
        this.imageUrl = imageUrl;
        this.quantity = quantity;
    }
}

module.exports = Tea;
