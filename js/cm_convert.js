/**
 * Image conversion
 * All the heavy lifting done here
 *
 * Libraries:
 *    chroma.js       https://github.com/gka/chroma.js
 * 
 * Make sure they are loaded!
 * 
 */

function getSelection(element, selName) {
  return element.getElementsByClassName(selName)[0].getElementsByClassName('filter-option')[0].innerText;
}


/**
 * Main conversion handler responds to "convert button"
 * @param {element} value: the current button that was clicked
 * @returns none
 */
function convertFigure(figSection) {
  var fig = figSection.getElementsByClassName('figure-container')[0];
  var fromMapName = getSelection(figSection, 'from-colormap');
  var toMapName = getSelection(figSection, 'to-colormap');
  var lookup = new ColormapLookup(fromMapName, toMapName);
  if (figSection.classList.contains("canvas")) {
    convertCanvas(fig.getElementsByTagName("canvas")[0], lookup.toNewRGB);
  }
  else if (figSection.classList.contains("svg")) {
    var elems = fig.firstElementChild.getElementsByTagName('*');
    for (var i = 0; i < elems.length; i++) {
      // various locations for color-type attributes
      if (elems[i].getAttribute('fill') != null)
        elems[i].attributes.fill.value =
          lookup.toNewHex(elems[i].getAttribute('fill'));
      else if (elems[i].style.fill != "" && elems[i].style.fill != "none")
        elems[i].style.fill = lookup.toNewHex(elems[i].style.fill);
      else if (elems[i].style.fill != "" && elems[i].style.fill != "none")
        elems[i].style.stroke = lookup.toNewHex(elems[i].style.stroke);
      // TODO: other elements?
      // gradients?
    }

    // image within svg ("rasterized object")
    var elems = fig.firstElementChild.getElementsByTagName('image');
    for (var i = 0; i < elems.length; i++) {
      var img = elems[i];

      var image = new Image();
      image.onload = function(evt) {
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");

          canvas.width = evt.target.width;
          canvas.height = evt.target.height;
          ctx.drawImage(evt.target, 0, 0);

          convertCanvas(canvas, lookup.toNewRGB);

          img.setAttribute("xlink:href", canvas.toDataURL());
      };
      image.src = img.getAttribute("xlink:href");
    }
  }

  if (lookup.unmapped) {
    var alert = document.createElement("div");
    alert.className = "alert alert-warning";
    alert.innerText = "Your image contains some colors (e.g. white, black) not in the jet colormap. We have left these alone and converted the rest of the image.";
    figSection.insertBefore(alert, figSection.firstElementChild);
  }
}

/**
 * Conversion for canvas objects
 * @param {number[]} cvs: the canvas
 * @param {function} func: callback to convert each pixel/RGB array 
 */
function convertCanvas(cvs, func) {
  var ctx = cvs.getContext('2d');
  var imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);

  // find closest viridis color for each jet pixel
  // i += 4 since each pixel is [R, G, B, alpha]
  for (var i = 0; i < imageData.data.length; i += 4)
      [imageData.data[i],
       imageData.data[i + 1],
       imageData.data[i + 2]] =
        func(Array.from(imageData.data.slice(i, i + 3)));
  ctx.putImageData(imageData, 0, 0);

}

/**
 * Finds the value that gives rise to the given color within the original space
 * @param {number[]} value: color in RGB space
 * @param {number[][]} cm_kdt: original colormap as kd tree
 * @param {number[][]} maxDist: colors to ignore
 * @returns {number} outcome of callable
 */
class ColormapLookup {
  constructor(fromMapName, toMapName, maxDist = 1) {
    var self = this;
    self.maxDist = maxDist;
    self.unmapped = false;
    self.reset = function() {
      self.unmapped = false;
    };

    self.fromCm = self.convertHexToLab(colorscales[fromMapName]);
    // self.kdt = createKDTree(self.fromCm);
    self.toCm = chroma.scale(colorscales[toMapName]);

    /**
     * Finds the value that gives rise to the given color within the original space
     * @param {number[]} value: color in RGB space
     */
    self.toFrac = function(value) {
      if (value == "none"){
        self.unmapped = true;
        return -1;
      }

      // var mappedValue = self.kdt.nn(chroma(value).lab(), self.maxDist);
      var mappedValue = invertValue(chroma(value).lab(), self.fromCm); 
      return mappedValue / self.fromCm.length;
    };

    self.toNewRGB = function(value) {
      var frac = self.toFrac(value);
      if (frac < 0) {
        self.unmapped = true;
        return value;
      } else
        return self.toCm(frac).rgb();
    };

    self.toNewHex = function(value) {
      var frac = self.toFrac(value);
      if (frac < 0) {
        self.unmapped = true;
        return value;
      } else
        return self.toCm(frac).hex();
    };
  }

  convertHexToLab(arr) {
    var labArr = new Array(arr.length);
    for (var i = 0; i < arr.length; i++) {
      labArr[i] = chroma(arr[i]).lab();
    }
    return labArr;
  }
}

/**
 * Simple Euclidean distance for 3 dimensions
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function euclideanDist(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) +
                   Math.pow(a[1] - b[1], 2) +
                   Math.pow(a[2] - b[2], 2));
}

/**
 * Finds the value that gives rise to the given color within the original space
 * @param {number[]} value: outcome of original space
 * @param {number[][]} origValues: original space to match to
 * @returns {number} mapped value (fractional)
 */
function invertValue(value, origValues, maxDist) {
  // check that the pixel doesn't correspond more closely to black or white
  // presumably text on the page
  var outOfScope = [chroma([0, 0, 0]).lab(),         // black
                    chroma([255, 255, 255]).lab()];   // white

  var lowestIndex = 0;
  var lowestDistance = euclideanDist(value, origValues[lowestIndex]);
  for (var i = 1; i < origValues.length; i++)
    if (euclideanDist(origValues[i], value) < lowestDistance) {
      lowestDistance = euclideanDist(origValues[i], value);
      lowestIndex = i;
    }

  for (var i = 0; i < outOfScope.length; i++)
    if (euclideanDist(outOfScope[i], value) < lowestDistance)
      return -1;

  if (lowestDistance > maxDist)
    return -1;

  return lowestIndex;
}
