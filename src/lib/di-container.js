"use strict";

const OS  = require("./os");
const FS  = require("./fs");
const GUI = require("./gui");

const singles = {};

const container = {
    window: window || {},
    localStorage: localStorage ||  {},
    location: location || {},
    os: OS,
    fs: FS,
    gui: GUI
};

module.exports = {
    get (key) {
        return container[key];
    },

    set (key, instance) {
        return container[key] = instance;
    },

    create (key, ...opts) {
        return new container[key](...opts);
    },

    getSingle (key, ...opts) {
        if(singles[key] && singles[key] instanceof container[key]) {
            return singles[key];
        } else {
            singles[key] = new container[key](...opts);
            return singles[key];
        }
    }
};