var fs = require('../index.js')(64 * 1024 * 1024, ['audio/mp3', 'audio/wav', 'audio/ogg'])

// Get a file from the filesystem and display it's contents
function getFile (file) {
  // OR: fs.getData to get a data url blob
  fs.get(file, function (err, url) {
    if (err) throw err
    window.open(url)
  })
}

// Add a file to the filesystem
function addFiles (files) {
  var fileArray = []

  for (var i = 0; i !== files.length; i++) {
    fileArray.push({file: files[i]})
  }

  fs.addMultiple(fileArray, showFiles)
}

// Delete a file from the filesystem
function deleteFile (file) {
  fs.delete(file, function () {
    showFiles()
  })
}

// Clear the filesystem
function clearFiles () {
  fs.clear(showFiles)
}

// Show all files of the filesystem
function showFiles () {
  fs.list(function (err, files) {
    if (err) throw err
    var fragment = document.createDocumentFragment()

    for (var i in files) {
      var file = files[i]
      var li = document.createElement('li')
      li.innerHTML = ['<a href="#" onclick="getFile(\'' + file.name + '\')">', file.name, '</a> &mdash; <a href="#" onclick="deleteFile(\'' + file.name + '\')">delete</a>'].join('')
      fragment.appendChild(li)
    }

    var list = document.querySelector('#list')
    list.innerHTML = ''
    list.appendChild(fragment)
  })
}

// Handle drag & drop by adding the dropped files
function windowDrop (event) {
  // get window.event if e argument missing (in IE)
  event = event || window.event

  // stops the browser from redirecting off to the image.
  if (event.preventDefault) {
    event.preventDefault()
  }

  var files = event.dataTransfer.files

  // Check if the item is a folder
  if (files[0].type === '') {
    console.error('Folders are not supported, but need a custom helper like peermusic/subfolders-too')
    return
  }

  addFiles(files)
}

// Cancel this event
function cancel (e) {
  if (e.preventDefault) {
    e.preventDefault()
  }

  return false
}

// Event listeners -------------------------------------------------------------

window.getFile = getFile
window.deleteFile = deleteFile

window.addEventListener('load', function () {
  showFiles()

  document.querySelector('#myfile').onchange = function (e) {
    addFiles(this.files)
  }

  document.querySelector('#deleteFSContent').onclick = clearFiles
})

window.addEventListener('dragover', cancel)
window.addEventListener('dragenter', cancel)
window.addEventListener('dragleave', cancel)
window.addEventListener('dragdrop', windowDrop)
window.addEventListener('drop', windowDrop)
