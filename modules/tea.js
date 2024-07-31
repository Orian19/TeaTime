class Tea {
    constructor(id, name, description, price, category, origin, caffeine, brewingTime, temperature, imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.origin = origin;
        this.caffeine = caffeine;
        this.brewingTime = brewingTime;
        this.temperature = temperature;
        this.imageUrl = imageUrl;
    }
}

module.exports = Tea;