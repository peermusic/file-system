# file-system

A slim wrapper around the google chrome file API.


## Install

```sh
# Clone this repo into `node_modules`
# require it
var fs = require('file-system')(size)
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
var fs = require('file-system')(size);

// Get a file as a data url from the filesystem based on name
fs.get(file, callback);

// Add an array of files to the filesystem
fs.add(files, callback);

// Get all files in the file system
fs.list(callback);

// Delete a single file from the file system
fs.delete(file, callback);

// Clear all files from the file system
fs.clear(callback);
```
