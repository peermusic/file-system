var level = require('level-browserify')
var db = level('./mydb')
var Blob        = window.Blob ||
                  window.WebKitBlob ||
                  window.MozBlob ||
                  window.MsBlob ||
                  undefined
var BlobBuilder = window.BlobBuilder ||
                  window.WebKit

// Source:
// https://github.com/agektmr/BrowserStorageAbuser/blob/master/js/BrowserStorageAbuser.js

var chunk_size = 1024 * 1024 * 5 * 10
var quantity = 50
var fill = function() {
  var size = chunk_size / 4 // chunk will be repetition of 4B
  var content = (new Array(size+1)).join('aあ')
  for (var i = 0 i < quantity i++) {
    var blob = null
    if (Blob !== undefined || BlobBuilder !== undefined) {
      // Android 4.2 Browser has "Blob" object but generates exception
      try {
        blob = new Blob([content], {type: 'text/plain'})
      } catch(e) {
        var bb = new BlobBuilder()
        bb.append(content)
        blob = bb.getBlob({type: 'text/plain'})
      }
    } else {
      blob = {
        size:     $scope.chunk_size,
        payload:  content
      }
    }
    // now is the generated time
    blob.lastModifiedDate = new Date()
    // Name it random so key won't conflict
    blob.name = (~~(Math.random()*100000)+100000)+'.txt'
    dbPut(blob.name, blob)
  }
}

var dbPut = function (name, blob) {
  db.put(name, blob, function (err) {
    if (err) return console.log('Ooops!', err) // some kind of I/O error
   
    // 3) fetch by key
    db.get(name, function (err, value) {
      if (err) return console.log('Ooops!', err) // likely the key was not found
   
      // ta da!
      console.log('fetched by name (' + name + ') the value: ' + value)
    })
  })
}

window.fill = fill

document.write(`
  Developer console -> Ressources -> IndexedDB -> ...<br>
  <button onClick=fill()>Fill DB</button>`)
