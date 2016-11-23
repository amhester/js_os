"use strict";

const container = require("./di-container");

class HESTER_FS {
    constructor (state) {
        let self = this;

        state = !state ? {} : typeof state === "string" ? JSON.parse(state) : state;

        let defaultState = {
            root: {
                __meta__: {
                    type: 0x01
                },
                items: {

                }
            }
        };

        self.state = Object.assign({}, defaultState, state);
    }

    _resolvePath (path) {
        let self = this,
            pathParts = path.split(/\\/),
            cursor = self.state.root.items;

        while(pathParts.length) {
            let _thisPart = pathParts.shift();
            if (cursor[_thisPart]) {
                if(cursor[_thisPart].__meta__.type === HESTER_FS.FILE_TYPE.FOLDER) {
                    cursor = cursor[_thisPart].items;
                } else {
                    if(pathParts.length) {
                        throw new Error(`No such directory ${_thisPart} for path ${path}.`);
                    } else {
                        cursor = cursor[_thisPart];
                    }
                }
            } else {
                throw new Error(`Invalid path: ${path}. ${_thisPart} doesn't exist at the specified location.`);
            }
        }

        return cursor;
    }

    _persistState () {
        let self = this;

        //Use setTimeout or nextTick so that the cost of serialization and writing to localstorage doesn't affect performance of current task.
        //Will potentially need to consider failures in between updates and persistance, but for now whatever.
        setTimeout(function () {
            container.get("localStorage").setItem("fs", JSON.stringify(self.state));
        }, 0);
    }

    read (path) {
        var self = this;

        return self._resolvePath(path);
    }

    write (path, content, options) {
        var self = this;

        let defaultOptions = {
            type: HESTER_FS.FILE_TYPE.FOLDER,
            mode: HESTER_FS.WRITE_MODE.REPLACE
        };

        let _options = Object.assign({}, defaultOptions, options);

        let cursor = null;
        if(_options.type === HESTER_FS.FILE_TYPE.FOLDER) {
            let parts = path.split(/\\/),
                folderName = parts.pop();

            cursor = self._resolvePath(parts.join("\\"));
            if(!cursor[folderName]) { //optimize by checking just undefined
                cursor[folderName] = {
                    __meta__: {
                        type: HESTER_FS.FILE_TYPE.FOLDER
                    },
                    items: {}
                };
            }
        } else if (_options.type === HESTER_FS.FILE_TYPE.TEXT) {
            cursor = self._resolvePath(path);
            switch (options.mode) {
                case HESTER_FS.WRITE_MODE.PREPEND:
                    cursor.content = content + cursor.content;
                    break;
                case HESTER_FS.WRITE_MODE.APPEND:
                    cursor.content += content;
                    break;
                case HESTER_FS.WRITE_MODE.REPLACE:
                default:
                    cursor.content = content;
                    break;
            }
        } else {
            throw new Error("Unknown File Type.");
        }

        self._persistState();

        return true;
    }

    remove (path) {
        let self   = this,
            parts  = path.split(/\\/),
            name   = parts.pop(),
            cursor = self._resolvePath(parts.join("\\"));

        delete cursor[name];

        return true;
    }

    static get FILE_TYPE () {
        return {
            FOLDER: 0x01,
            TEXT: 0x02,
            PROGRAM: 0x03
        };
    }

    static get WRITE_MODE () {
        return {
            PREPEND: 0x01,
            APPEND: 0x02,
            REPLACE: 0x03
        };
    }
}