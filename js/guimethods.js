/**
 * Look and feel of the site
 *
 */


//**********FILE INPUT METHODS***********************
function handleFileSelect(evt, files) {
  // Loop through the FileList and set up images
  for (var i = 0; i < files.length; i++)
    if (files[i].type.match('image/svg'))
      prepareSVG(files[i]);
    else if (files[i].type.match('image/png'))
      preparePNG(files[i]);
}

function preparePNG(file) {
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(f) {
      return function(e) {
        var data = e.target.result;

        var obj = document.createElement('div');
        obj.setAttribute('id', 'image-container');
          var canvas = document.createElement("canvas");
          obj.appendChild(canvas);
          context = canvas.getContext('2d');

          var image = new Image();
          image.src = data;
          image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
          }
          createFigureSection();
      };
    })(file);

  // Read in the image file as a data URL.
  reader.readAsDataURL(file);
}

function prepareSVG(file) {
  var reader = new FileReader();
  // Closure to capture the file information.
  reader.onload = (function(f) {
    return function(e) {
      var data = e.target.result;
      var obj = document.createElement('div');
      obj.setAttribute('id', 'image-container');
      obj.innerHTML = [data].join('');
      createFigureSection();
    };
  })(file);
  reader.readAsText(file);
}

function createFigureSection(data) {
  var newDiv = tmpl("section-template", data);
  document.getElementById('figure-list').appendChild(div);
}

//************Dropzone METHODS***********************
var dropZone = document.getElementById('drop-zone');

document.getElementById('files').addEventListener('change', function(evt) {
  handleFileSelect(evt, evt.target.files);
});
document.getElementById('to-click').addEventListener('mouseover', function() {
  changeDropStyle(true);
});
document.getElementById('to-click').addEventListener('mouseout', function() {
  changeDropStyle(false);
});

function changeDropStyle(b) {
  if (b)
    dropZone.className = "upload-drop-zone drop";
  else
    dropZone.className = "upload-drop-zone";
}
dropZone.ondrop = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
  this.className = 'upload-drop-zone';
  handleFileSelect(evt, evt.dataTransfer.files);
};
dropZone.ondragover = function() {
  this.className = 'upload-drop-zone drop';
  return false;
};
dropZone.ondragleave = function() {
  this.className = 'upload-drop-zone';
  return false;
};
dropZone.onclick = function() {
  var uploadFiles = document.getElementById('drop-zone').files;
};


function deleteSection(index) {
  var list = document.getElementById("image-list");
  var child = document.getElementById("worker" + index);
  list.removeChild(child);
}


//************DOWNLOAD METHODS***********************
function downloadFigure(element) {
  var data = "";
  var url = "";
  var file = null;
  if (type == "image/svg+xml") {
    data = element.innerHTML;

    file = new Blob([data], {
      type: type
    });
    url = URL.createObjectURL(file);
    filename = "converted.png";
  } else if (type == "image/png") {
    var canvas = element.childNodes[0];
    url = canvas.toDataURL();
    file = new Blob([url], {
      type: type
    });
  }

  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a");
    a.href = url;
    a.download = "converted";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}


function getType(element) {
  var c = element.childNodes;
  var name = "";
  if (c.length != 0)
    for (var i = 0; i < c.length; i++) {
      if ((c[i].nodeName).includes("#"))
        continue;
      name = c[i].nodeName;
      break;
    }
  name = name.toUpperCase();

  if (name == "CANVAS")
    return "image/png";
  else if (name == "SVG")
    return "image/svg+xml";
  else
    return NULL;
}
