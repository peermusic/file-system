# FileSystem

A slim wrapper around the google chrome file API.


## Install

```sh
# Clone this repo into `node_modules`
# require it
var fileSystem = require('file-system')(size)
# ... should work
```


## Demo

```sh
npm install -g wzrd
cd example
wrd index.js:bundle.js
```


## Usage

```js
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
