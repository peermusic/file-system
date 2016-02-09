/* global FileReader, FileError, Blob, atob */
var async = require('async')

module.exports = FileSystem

function FileSystem (types) {
  if (!(this instanceof FileSystem)) {
    return new FileSystem(types)
  }

  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
  this.types = types || []
}

// Add a single file to the filesystem
// If filename is not set, file.name will be used
FileSystem.prototype.add = function (options, callback) {
  var errorHandler = createErrorHandler(callback)

  // No custom filename set, let's grab it from the file object
  if (!options.filename) {
    options.filename = options.file.name
  }

  // Check if the file passes the set types
  if (this.types && !this.check(options.file)) {
    callback('INVALID_FILE_TYPE')
    return
  }

  this.requestFilesystem(function (fileSystem) {
    fileSystem.root.getFile(options.filename, {create: true, exclusive: true}, function (entry) {
      entry.createWriter(function (writer) {
        // Setup our error and success handlers
        writer.onerror = errorHandler
        writer.onwriteend = function () {
          callback(null)
        }

        // Write the file into the filesystem
        writer.write(options.file)
      }, errorHandler)
    }, errorHandler)
  }, errorHandler)
}

// Add a single file to the filesystem using a array buffer
FileSystem.prototype.addArrayBuffer = function (options, callback) {
  if (!options.filename) throw new Error('filename property missing.')
  options.file = new Blob([options.arrayBuffer], {type: 'audio/mp3'})
  delete options.arrayBuffer
  this.add(options, callback)
}

// Add a single file to the filesystem using a dataUrl
FileSystem.prototype.addDataUrl = function (options, callback) {
  if (!options.filename) throw new Error('filename property missing.')
  function dataURLtoBlob (dataUrl) {
    var parts = dataUrl.split(',')
    var mime = parts[0].match(/:(.*?);/)[1]
    var binary = atob(parts[1])
    var array = []
    for (var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i))
    return new Blob([new Uint8Array(array)], {type: mime})
  }
  options.file = dataURLtoBlob(options.dataUrl)
  delete options.dataUrl
  this.add(options, callback)
}

// Add a single file to the filesystem using a blob
FileSystem.prototype.addBlob = function (options, callback) {
  if (!options.filename) throw new Error('filename property missing.')
  options.file = options.blob
  delete options.arrayBuffer
  this.add(options, callback)
}

// Add multiple files to the filesystem
FileSystem.prototype.addMultiple = function (array, callback) {
  var self = this
  async.map(array, function (file, callback) {
    self.add(file, callback)
  }, callback)
}

// Get the url to a file from the filesystem based on name
FileSystem.prototype.get = function (filename, callback) {
  var errorHandler = createErrorHandler(callback)

  this.requestFilesystem(function (fileSystem) {
    fileSystem.root.getFile(filename, {}, function (fileEntry) {
      callback(null, fileEntry.toURL())
    }, errorHandler)
  }, errorHandler)
}

// Get a file as a array buffer from the filesystem based on name
FileSystem.prototype.getArrayBuffer = function (filename, callback) {
  var errorHandler = createErrorHandler(callback)

  this.requestFilesystem(function (fileSystem) {
    fileSystem.root.getFile(filename, {}, function (fileEntry) {
      fileEntry.file(function (file) {
        var reader = new FileReader()

        // Setup our error and success handlers
        reader.onerror = errorHandler
        reader.onloadend = function (e) {
          callback(null, this.result)
        }

        reader.readAsArrayBuffer(file)
      }, errorHandler)
    }, errorHandler)
  }, errorHandler)
}

// Get a file as a data url from the filesystem based on name
FileSystem.prototype.getDataUrl = function (filename, callback) {
  var errorHandler = createErrorHandler(callback)

  this.requestFilesystem(function (fileSystem) {
    fileSystem.root.getFile(filename, {}, function (fileEntry) {
      fileEntry.file(function (file) {
        var reader = new FileReader()

        // Setup our error and success handlers
        reader.onerror = errorHandler
        reader.onloadend = function (e) {
          callback(null, this.result)
        }

        reader.readAsDataURL(file)
      }, errorHandler)
    }, errorHandler)
  }, errorHandler)
}

// Get all files in the filesystem
FileSystem.prototype.list = function (callback) {
  var errorHandler = createErrorHandler(callback)

  this.requestFilesystem(function (fileSystem) {
    var directoryReader = fileSystem.root.createReader()
    var entries = []

    // Call the reader.readEntries() until no more results are returned.
    var readEntries = function () {
      directoryReader.readEntries(function (results) {
        if (!results.length) {
          callback(null, entries.sort())
        } else {
          entries = entries.concat(Array.prototype.slice.call(results || [], 0))
          readEntries()
        }
      }, errorHandler)
    }

    // Start reading dirs.
    readEntries()
  }, errorHandler)
}

// Delete a single file from the filesystem based on filename
FileSystem.prototype.delete = function (filename, callback) {
  var errorHandler = createErrorHandler(callback)

  this.requestFilesystem(function (fileSystem) {
    fileSystem.root.getFile(filename, {}, function (entry) {
      entry.remove(function () {
        callback()
      }, errorHandler)
    }, errorHandler)
  }, errorHandler)
}

// Delete all files from the filesystem
FileSystem.prototype.clear = function (callback) {
  this.list(function (err, entries) {
    if (err) callback(err)
    async.map(entries, function (entry) {
      entry.remove(
        function () { callback(null) },
        function (e) { callback(e) }
      )
    }, callback)
  })
}

// Check if a file is passing the specified types
FileSystem.prototype.check = function (file) {
  return this.types.indexOf(file.type) !== -1
}

// Request a filesystem object from the window object
FileSystem.prototype.requestFilesystem = function (callback, errorHandler) {
  // Check if we are still within the quota
  navigator.webkitPersistentStorage.queryUsageAndQuota(function (usedBytes, grantedBytes) {
    var requestBytes = grantedBytes

    // If we have 0 bytes granted, get at least 1GB to work with
    if (grantedBytes === 0) {
      requestBytes = 1000 * 1024 * 1024
    }

    // If we are going over half the limit, increase it so we can save things
    if (usedBytes > grantedBytes * 0.5) {
      requestBytes = Math.max(grantedBytes * 2, usedBytes * 2)
    }

    navigator.webkitPersistentStorage.requestQuota(requestBytes, function (grantedBytes) {
      window.requestFileSystem(window.PERSISTENT, grantedBytes, callback, errorHandler)
    }, errorHandler)
  }, errorHandler)
}

// Create an error handler for a callback
function createErrorHandler (callback) {
  return function (e) { callback(getErrorString(e)) }
}

// Handle any file errors
function getErrorString (e) {
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      return 'QUOTA_EXCEEDED_ERR'
    case FileError.NOT_FOUND_ERR:
      return 'NOT_FOUND_ERR'
    case FileError.SECURITY_ERR:
      return 'SECURITY_ERR'
    case FileError.INVALID_MODIFICATION_ERR:
      return 'INVALID_MODIFICATION_ERR'
    case FileError.INVALID_STATE_ERR:
      return 'INVALID_STATE_ERR'
    default:
      return 'Unknown Error'
  }
}
