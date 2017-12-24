/**
 * Look and feel of the site
 *
 */

//**********CHECK BROWSER SUPPORT********************
if (!document.createElement("canvas").getContext) {
  var alert = document.createElement("div");
  alert.className = "alert alert-warning";
  alert.innerText = "Canvas doesn't seem to be working in your browser. No guarantee raster images will be processed properly. Please try another browser or proceed with caution.";
  document.getElementById("alert-section").appendChild(alert);
}
if (typeof SVGRect == "undefined") {
  var alert = document.createElement("div");
  alert.className = "alert alert-warning";
  alert.innerText = "SVG images don't seem to be working in your browser. No guarantee vector images will be processed properly. Please try another browser or proceed with caution.";
  document.getElementById("alert-section").appendChild(alert);
}


//*****PARSE HTML TEMPLATE FOR EACH FIGURE SECTION*******
function parseTemplate() {
  orig = document.getElementById('section-template');
  newdoc = document.createElement('div');
  newdoc.classList = orig.classList //'figure-section';
  newdoc.innerHTML = orig.innerText;
  orig.remove();
  return newdoc;
}
sectionTemplate = parseTemplate();


//**********FILE INPUT METHODS***********************
function handleFileSelect(evt, files) {
  // Loop through the FileList and set up images
  for (var i = 0; i < files.length; i++)
    if (files[i].type.match('image/svg'))
      prepareSVG(files[i]);
    else if (files[i].type.match('image/png'))
      preparePNG(files[i]);
    else
      console.log("File not recognized. Type: " + files[i].type)
}

function preparePNG(file) {
    var reader = new FileReader();
    reader.fileName = file.name;
    reader.onload = function(evt) {
        var canvas = document.createElement("canvas");
        var image = new Image();
        image.src = evt.target.result;
        image.onload = function() {
          canvas.width = image.width;
          canvas.height = image.height;
          canvas.getContext('2d').drawImage(image, 0, 0);
        }
        createFigureSection(canvas, evt.target.fileName, "png");
      };
  // Read in the image file as a data URL.
  reader.readAsDataURL(file);
}

function prepareSVG(file) {
  var reader = new FileReader();
  reader.fileName = file.name;
  reader.onload = function(evt) {
      createFigureSection(evt.target.result, evt.target.fileName, "svg");
  };
  reader.readAsText(file);
}

function createFigureSection(data, sectid, cls) {
  var figSection = sectionTemplate.cloneNode(true);
  figSection.id = sectid;
  figSection.classList.add(cls);
  try {
    figSection.getElementsByClassName("figure-container")[0].appendChild(data);
  } catch(err) {
    figSection.getElementsByClassName("figure-container")[0].innerHTML = data;
  }
  document.getElementById('figure-list').appendChild(figSection);
  return figSection;
}

function deleteSection(element) {
  element.parentNode.parentNode.remove();
}

//************DROPZONE METHODS***********************
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

//************DOWNLOAD METHODS***********************
function splitFilename(fn) {
  var parts = fn.split(".");
  var ext = parts.pop(-1);
  var name = parts.join(".");
  return [name, ext];
}

function downloadFigure(element) {
  // Get current figure section and figure out download file name
  var figSection = element.parentNode.parentNode;
  var [name, ext] = splitFilename(figSection.id);
  var dlName = name + "_converted." + ext;
  console.log(dlName)

  var fig = figSection.getElementsByClassName('figure-container')[0];

  // Setup download url and file
  var url = "";
  var file = null;
  if (figSection.classList.contains("svg")) {
    file = new Blob([fig.innerHTML], { type: "image/svg+xml" });
    url = URL.createObjectURL(file);
  } else if (figSection.classList.contains("png")) {
    var canvas = fig.getElementsByTagName("canvas")[0];
    url = canvas.toDataURL();
    file = new Blob([url], { type: "image/png" });
  } else
    alert("We've run into an error.")

  console.log(url, file);

  // Launch the download
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+ only
    window.navigator.msSaveOrOpenBlob(file, dlName);
  else {
    var a = document.createElement("a");
    a.href = url;
    a.download = dlName;
    document.body.appendChild(a);
    a.click();
    // Remove url immediately after "clicking"
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
