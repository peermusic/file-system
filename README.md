# file-system

A slim wrapper around the Chrome filesystem API.


## Install

```sh
npm install https://github.com/peermusic/file-system
```

```js
var fs = require('file-system')(size, types)
```

For reference see the [Browserify Handbook](https://github.com/substack/browserify-handbook#how-node_modules-works).

## Demo

```sh
npm install -g wzrd
cd example
wzrd index.js:bundle.js
```

**Note:** If no local webserver (eg. wzrd) is used Chrome has to be started with the `--allow-file-access-from-files` flag.

## Usage

```js
// Require the module with the desired size and allowed file types
var size = 64 * 1024 * 1024
var types = ['audio/mp3', 'audio/wav', 'audio/ogg']
var fs = require('file-system')(size, types)

// Callback is a Node.js-typical callback that takes an error as the first
// parameter and a possible result as the second
var callback = function (err, result) {
  if (err) throw err
  console.log(result)
}

// Add a single file to the filesystem
// If filename is not set, file.name will be used
fs.add({filename: '...', file: File}, callback)

// Add multiple files to the filesystem
fs.addMultiple([{filename: '...', file: File}, /* ... */], callback)

// Get the url to a file from the filesystem based on name
fs.get(filename, callback)

// Get a file as a data url from the filesystem based on name
fs.getData(filename, callback)

// Get all files in the filesystem
fs.list(callback)

// Delete a single file from the filesystem based on filename
fs.delete(filename, callback)

// Delete all files from the filesystem
fs.clear(callback)
```
