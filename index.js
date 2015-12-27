/* global FileReader, FileError */
var async = require('async')

module.exports = FileSystem

function FileSystem (size, types) {
  if (!(this instanceof FileSystem)) {
    return new FileSystem(size, types)
  }

  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
  this.size = size
  this.types = types || null
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

// Get a file as a data url from the filesystem based on name
FileSystem.prototype.getData = function (filename, callback) {
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
  window.requestFileSystem(window.PERMANENT, this.size, callback, errorHandler)
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
