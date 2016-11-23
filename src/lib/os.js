"use strict";

const container = require("./di-container");
const browser   = require("bowser");

class HESTER_OS {
    constructor () {
        let self = this;

        self.name      = "HESTER_OS";
        self.version   = "v1.0.0";
        self.browser   = {};
        self.processes = {};
        self.browser   = browser;
    }

    _init () {
        let self = this;

        self.fs = container.getSingle("fs", container.get("localStorage").get("fs"));
        self.fs.write('program', { type: container.get("fs").FILE_TYPE.FOLDER });

        self.gui = container.getSingle("gui");
    }

    start () {
        let self = this;

        self._init();
    }

    shutdown () {

    }

    loadProgram () {

    }

    terminateProgram () {

    }
}

module.exports = HESTER_OS;