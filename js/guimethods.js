/**
 * Look and feel of the site
 *
 */

var previewNode = document.querySelector("#template");
previewNode.id = "";
var previewTemplate = previewNode.parentNode.innerHTML;
previewNode.parentNode.removeChild(previewNode);
var currentImgIndex = 0;


//**********FILE INPUT METHODS***********************
function handleFileSelect(evt, files) {
  var uploadedID = "uploaded";
  // Loop through the FileList and render image files as thumbnails.
  createImgSpace(currentImgIndex + 1);

  for (var i = 0, f = files[i]; i < files.length; i++) {
    var type = "nonimg";
    if (f.type.match('image/svg')) {
      type = "svg";
    } else if (f.type.match('image/png')) {
      type = "png";
    }
    // Only process image files.
    if (type == "nonimg") {
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(f) {
      return function(e) {
        var index = currentImgIndex;
        var data = e.target.result;
        //console.log(f);
        var obj = document.createElement('div');
        obj.setAttribute('id', 'image-container');
        if (type == "svg") {
          data = addSVGID(data, "id=" + uploadedID + index + " ");
          obj.innerHTML = [data].join('');
        } else if (f.type.match('image/png')) {
          var canvas = document.createElement("canvas");
          canvas.id = uploadedID + index;
          obj.appendChild(canvas);
          context = canvas.getContext('2d');
          var image = new Image(); //document.createElement("IMG");
          //image.height = 200;
          //image.id = uploadedID;
          image.src = data;
          image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
          }

        }
        document.getElementById('list' + index).insertBefore(obj, null);
      };
    })(f);

    // Read in the image file as a data URL.
    if (type == "svg") {
      reader.readAsText(f);
    } else if (type == "png") {
      reader.readAsDataURL(f);
    }
  }
  currentImgIndex++;
}

function createImgSpace(index) {
  var div = document.createElement('DIV');
  var workerNum = "worker" + index;
  div.className = "worker";
  div.id = workerNum;
  var inner = "<output class=\"imgs\" id=\"list" + index + "\"></output>" +
    "<div class=\"button-container\">" +
    "<button id=\"convert-btn\" class=\"btn btn-success\" onClick=\"convert(" + index + ")\">" +
    "<span>Convert </span><i class=\"glyphicon glyphicon-flash\"></i></button>" +
    "<button id=\"download-btn" + index + "\" class=\"btn btn-info\">" +
    "<span>Download </span><i class=\"glyphicon glyphicon-download\"></i></button>" +
    "<button id=\"delete-btn\" class =\"btn btn-danger delete\" onClick=\"del(" + index + ")\">" +
    "<span>Delete </span><i class=\"glyphicon glyphicon-remove\"></i></button>" +
    "</div>";

  div.innerHTML = inner;
  document.getElementById('image-list').appendChild(div);
  document.getElementById('download-btn' + index).addEventListener('click', function() {
    download(this, 'uploaded' + index, 'converted');
  }, false);
}

//WARNING: THIS METHOD IS VERY SKETCHY AND SHOULD EVENTUALLY BE MADE BETTER
var addSVGID = function(data, id) {
  var indexToInsert = data.indexOf("xmlns");
  var newData = data.slice(0, indexToInsert) + id + data.slice(indexToInsert);
  //alert(data.slice(0, indexToInsert));
  return newData;
};

//var uploadForm = document.getElementById('js-upload-form');

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
  if (b) {
    dropZone.className = "upload-drop-zone drop";
  } else {
    dropZone.className = "upload-drop-zone";
  }
}

dropZone.ondrop = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
  this.className = 'upload-drop-zone';

  //startUpload(e.dataTransfer.files);
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
  //e.preventDefault();
  //alert("Clicked");
};

function del(index) {
  var list = document.getElementById("image-list");
  var child = document.getElementById("worker" + index);
  list.removeChild(child);
}

//************DOWNLOAD METHODS***********************
function download(link, canvasID, filename) {
  var element = document.getElementById('image-container')
  var type = getType(element);
  //TODO: Implement getType() method that gets proper type
  var data = "";
  var url = "";
  var file = null;
  if (type == "image/svg+xml") {
    data = element.innerHTML;

    file = new Blob([data], {
      type: type
    });
    url = URL.createObjectURL(file);
    filename += ".png";
  } else if (type == "image/png") {
    var canvas = element.childNodes[0];
    url = canvas.toDataURL();
    file = new Blob([url], {
      type: type
    });
  }


  if (window.navigator.msSaveOrOpenBlob) {
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);

  } else {
    // Others
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  //console.log("Done");

}

function getType(element) {
  var c = element.childNodes;
  var name = "";
  if (c.length != 0) {
    for (var i = 0; i < c.length; i++) {
      if ((c[i].nodeName).includes("#")) {
        continue;
      }
      name = c[i].nodeName;
      break;
    }
  }
  name = name.toUpperCase();
  //console.log(name);
  if (name == "CANVAS") {
    return "image/png";
  } else if (name == "SVG") {
    return "image/svg+xml";
  } else {
    return NULL;
  }
}
