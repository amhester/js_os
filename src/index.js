"use strict";

const container = require("./lib/di-container");

container.getSingle("os").start();