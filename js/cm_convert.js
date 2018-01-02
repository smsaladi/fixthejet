/**
 * Image conversion
 * All the heavy lifting done here
 *
 * Uses chroma.js for color conversions. Make sure that's loaded!
 * https://github.com/gka/chroma.js
 */

var colormapChromaJS = chroma.scale(viridis);

/**
 * Main conversion handler responds to "convert button"
 * @param {element} value: the current button that was clicked
 * @returns none
 */
function convertFigure(element) {
  var figSection = element.parentNode.parentNode;
  var fig = figSection.getElementsByClassName('figure-container')[0];

  var unmappedColors = false;

  var jetInLabSpace = createJetInLabSpace();

  // check that the pixel doesn't correspond more closely to black or white
  // presumably text on the page
  var outOfScope = [chroma([0, 0, 0]).lab(),         // black
                    chroma([255, 255, 255]).lab()];   // white

  if (figSection.classList.contains("canvas"))
    unmappedColors = convertCanvas(fig.getElementsByTagName("canvas")[0],
                  jetInLabSpace, outOfScope, unmappedColors);
  else if (figSection.classList.contains("svg")) {
    function toNewCm(frac) {
      return colormapChromaJS(frac).hex();
    }

    var elems = fig.firstElementChild.getElementsByTagName('*');
    for (var i = 0; i < elems.length; i++) {
      // various locations for color-type attributes
      if (elems[i].getAttribute('fill') != null)
        [elems[i].attributes.fill.value, unmappedColors] =
          invertColor(elems[i].getAttribute('fill'), jetInLabSpace, outOfScope, toNewCm);
      else if (elems[i].style.fill != "" && elems[i].style.fill != "none")
        [elems[i].style.fill, unmappedColors] =
          invertColor(elems[i].style.fill, jetInLabSpace, outOfScope, toNewCm);
      else if (elems[i].style.fill != "" && elems[i].style.fill != "none")
        [elems[i].style.stroke, unmappedColors] =
          invertColor(elems[i].style.stroke, jetInLabSpace, outOfScope, toNewCm);
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

          convertCanvas(canvas, jetInLabSpace, outOfScope, unmappedColors);
          img.setAttribute("xlink:href", canvas.toDataURL());
      };
      image.src = img.getAttribute("xlink:href");
    }
  }

  if (unmappedColors) {
    var alert = document.createElement("div");
    alert.className = "alert alert-warning";
    alert.innerText = "Your image contains some colors (e.g. white, black) not in the jet colormap. We have left these alone and converted the rest of the image.";
    figSection.insertBefore(alert, figSection.firstElementChild);
  }
}

/**
 * Conversion for canvas objects
 * @param {number[]} cvs: the canvas
 * @param {number[][]} jetInLabSpace: original colormap to match to (in lab space)
 * @param {number[][]} outOfScope: colors to ignore
 * @returns whether there were unmapped colors
 */
function convertCanvas(cvs, jetInLabSpace, outOfScope) {
  var ctx = cvs.getContext('2d');
  var imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
  var unmappedColors = false;

  function toNewCm(frac) {
    return colormapChromaJS(frac).rgb();
  }

  // find closest viridis color for each jet pixel
  // i += 4 since each pixel is [R, G, B, alpha]
  for (var i = 0; i < imageData.data.length; i += 4)
      [[imageData.data[i],
       imageData.data[i + 1],
       imageData.data[i + 2]], unmappedColors] =
        invertColor(Array.from(imageData.data.slice(i, i + 3)),
                    jetInLabSpace, outOfScope, toNewCm);
  ctx.putImageData(imageData, 0, 0);

  return unmappedColors;
}

/**
 * Finds the value that gives rise to the given color within the original space
 * @param {number[]} value: color in RGB space
 * @param {number[][]} origValues: original colormap to match to (in lab space)
 * @param {number[][]} outOfScope: colors to ignore
 * @param {function} cm: callable that accepts a fractional value
 * @returns {number} outcome of callable
 */
function invertColor(value, origValues, outOfScope, cm) {
  if (value == "none")
    return [value, true];
  var mappedValue = invertValue(chroma(value).lab(), origValues, outOfScope);
  if (mappedValue == null)
    return [value, true];
  else
    return [cm(mappedValue), false];
}

/**
 * Finds the value that gives rise to the given color within the original space
 * @param {number[]} value: outcome of original space
 * @param {number[][]} origValues: original space to match to
 * @param {number[][]} outOfScope: values to ignore
 * @returns {number} mapped value (fractional)
 */
function invertValue(value, origValues, outOfScope) {
  var lowestIndex = 0;
  var lowestDistance = euclideanDist(value, origValues[lowestIndex]);
  for (var i = 1; i < origValues.length; i++)
    if (euclideanDist(origValues[i], value) < lowestDistance) {
      lowestDistance = euclideanDist(origValues[i], value);
      lowestIndex = i;
    }

  for (var i = 0; i < outOfScope.length; i++)
    if (euclideanDist(outOfScope[i], value) < lowestDistance)
      return null;

  return lowestIndex / origValues.length;
}


/**
 * Create an array of Jet values in the Lab colorspace
 *
 * @param {number} [bitDepth]
 * @returns {number[number[]]}
 */
function createJetInLabSpace(bitDepth = 8) {
  var jetInLab = new Array(Math.pow(2, bitDepth));

  for (var i = 0; i < jetInLab.length; i++) {
    var rgbJet = [0, 0, 0];
    var iFrac = i / jetInLab.length;

    // find the fractional R, G, B colors for each Jet value
    if (iFrac < .125) {
      rgbJet[2] = 0.5 + 4 * iFrac;
    } else if (iFrac < 0.375) {
      rgbJet[1] = -0.5 + 4 * iFrac;
      rgbJet[2] = 1;
    } else if (iFrac < 0.625) {
      rgbJet[0] = -1.5 + 4 * iFrac;
      rgbJet[1] = 1;
      rgbJet[2] = 2.5 - 4 * iFrac;
    } else if (iFrac < 0.875) {
      rgbJet[0] = 1;
      rgbJet[1] = 3.5 - 4 * iFrac;
    } else {
      rgbJet[0] = 4.5 - 4 * iFrac;
    }

    // Convert fractional values into ints of the given bitDepth
    for (var j = 0; j < 3; j++)
      rgbJet[j] = Math.round(rgbJet[j] * (jetInLab.length - 1));

    jetInLab[i] = chroma(rgbJet).lab();
  }
  return jetInLab;
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
