# FileSystem

A slim wrapper around the google chrome file API.

## Compiling

`browserify app.js -o bundle.js`

## Usage

You can see a usage demo in `app.js` and `demo.html`

```javascript
// Require the module with the desired size
var FileSystem = require('./FileSystem.js')(size);

// Get a file as a data url from the filesystem based on name
FileSystem.get(file, callback);

// Add an array of files to the filesystem
FileSystem.add(files, callback);

// Get all files in the file system
FileSystem.list(callback);

// Delete a single file from the file system
FileSystem.delete(file, callback);

// Clear all files from the file system
FileSystem.clear(callback);
```