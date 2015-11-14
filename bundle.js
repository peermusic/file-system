(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = FileSystem;

function FileSystem(size) {

    if (!(this instanceof FileSystem)) {
        return new FileSystem();
    }

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    this.size = size;

}

FileSystem.prototype.get = function (file, callback) {

    requestFilesystem(this.size, function (fs) {

        fs.root.getFile(file, {}, function (fileEntry) {

            fileEntry.file(function (file) {

                var reader = new FileReader();

                reader.onloadend = function (e) {
                    callback(this.result);
                };

                reader.readAsDataURL(file);

            }, errorHandler);

        }, errorHandler);

    });

};

FileSystem.prototype.add = function (files, callback) {

    requestFilesystem(this.size, function (file_system) {

        for (var i = 0; i != files.length; i++) {
            addFile(file_system, files[i]);
        }

        callback();

    });

};

var addFile = function (file_system, file) {

    file_system.root.getFile(file.name, {create: true, exclusive: true}, function (entry) {

        entry.createWriter(function (writer) {
            writer.write(file);
        }, errorHandler);

    }, errorHandler);

};

FileSystem.prototype.list = function (callback) {

    requestFilesystem(this.size, function (file_system) {

        var directory_reader = file_system.root.createReader();
        var entries = [];

        // Call the reader.readEntries() until no more results are returned.
        var readEntries = function () {
            directory_reader.readEntries (function (results) {
                if (!results.length) {
                    callback(entries.sort());
                } else {
                    entries = entries.concat(toArray(results));
                    readEntries();
                }
            }, errorHandler);
        };

        // Start reading dirs.
        readEntries();

    });

};

FileSystem.prototype.delete = function (file, callback) {

    requestFilesystem(this.size, function (fs) {

        fs.root.getFile(file, {}, function (entry) {

            entry.remove(function () {
                callback();
            }, errorHandler);

        }, errorHandler);

    });

};

FileSystem.prototype.clear = function (callback) {

    this.list(function (entries) {

        entries.forEach(function (entry) {

            entry.remove(function () {
            }, errorHandler);

        });

        callback();

    });

};

function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
}

function requestFilesystem(size, callback) {
    window.requestFileSystem(window.PERMANENT, size, callback, errorHandler);
}

function errorHandler(e) {

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            console.error('QUOTA_EXCEEDED_ERR');
            break;
        case FileError.NOT_FOUND_ERR:
            console.error('NOT_FOUND_ERR');
            break;
        case FileError.SECURITY_ERR:
            console.error('SECURITY_ERR');
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            console.error('INVALID_MODIFICATION_ERR');
            break;
        case FileError.INVALID_STATE_ERR:
            console.error('INVALID_STATE_ERR');
            break;
        default:
            console.error('Unknown Error');
            break;
    }

}
},{}],2:[function(require,module,exports){
var FileSystem = require('./FileSystem.js')(64 * 1024 * 1024);

function getFile(file) {
    FileSystem.get(file, function (content) {
        window.open(content);
    });
}

function addFiles(files) {
    FileSystem.add(files, showFiles);
}

function deleteFile(file) {
    FileSystem.delete(file, function () {
        showFiles();
    });
}

function clearFiles() {
    FileSystem.clear(showFiles);
}

function showFiles() {

    FileSystem.list(function (files) {

        var fragment = document.createDocumentFragment();

        for (var i in files) {
            var file = files[i];
            var li = document.createElement('li');
            li.innerHTML = ['<a href="#" onclick="getFile(\'' + file.name + '\')">', file.name, '</a> &mdash; <a href="#" onclick="deleteFile(\'' + file.name + '\')">delete</a>'].join('');
            fragment.appendChild(li);
        }

        var list = document.querySelector('#list');
        list.innerHTML = '';
        list.appendChild(fragment);

    });

}

function windowDrop(event) {

    // get window.event if e argument missing (in IE)
    event = event || window.event;

    // stops the browser from redirecting off to the image.
    if (event.preventDefault) {
        event.preventDefault();
    }

    var files = event.dataTransfer.files;

    // Check if the item is a folder
    if (files[0].type == "") {
        console.error('Folder are not supported for drag \'n\' drop yet');
        return;
    }

    addFiles(files);

}

function cancel(e) {

    if (e.preventDefault) {
        e.preventDefault();
    }

    return false;

}

///////////////// Event listeners ///////////////////

window.getFile = getFile;
window.deleteFile = deleteFile;

window.addEventListener("load", function () {

    showFiles();

    document.querySelector('#myfile').onchange = function (e) {
        addFiles(this.files);
    };

    document.querySelector('#deleteFSContent').onclick = clearFiles;

});

window.addEventListener('dragover', cancel);
window.addEventListener('dragenter', cancel);
window.addEventListener('dragleave', cancel);
window.addEventListener('dragdrop', windowDrop);
window.addEventListener('drop', windowDrop);
},{"./FileSystem.js":1}]},{},[2]);
