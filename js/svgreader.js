/**
 * Image conversion
 * All the heavy lifting done here
 *
 * Uses chroma.js for color conversions. Make sure that's loaded!
 * https://github.com/gka/chroma.js
 */

var colormapChromaJS = chroma.scale(viridis);


function convertFigure(element) {
  var object = element;

  var unmappedColors = false;

  var jetInLabSpace = createJetInLabSpace();

  // check that the pixel doesn't correspond more closely to black or white
  // presumably text on the page
  var outOfScope = [chroma([0, 0, 0]).lab(),         // black
                    chroma([255, 255, 255]).lab()]   // white


  if (object.class == "raster-figure") {
    // get image from page
    var ctx = object.getContext('2d');
    var imageData = ctx.getImageData(0, 0, object.width, object.height);

    // find closest viridis color for each jet pixel
    // i += 4 since each pixel is [R, G, B, alpha]
    for (var i = 0; i < imageData.data.length; i += 4) {
      var pxlRGB = Array.from(imageData.data.slice(i, i + 3));
      var mappedValue = invertValue(chroma(pxlRGB).lab(), jetInLabSpace, outOfScope);
      if (mappedValue == null)
        unmappedColors = true;
      else {
        var newRGBColor = colormapChromaJS(mappedValue).rgb();
        imageData.data[i] = newRGBColor[0];
        imageData.data[i + 1] = newRGBColor[1];
        imageData.data[i + 2] = newRGBColor[2];
      }
    }
    ctx.putImageData(imageData, 0, 0);

  } else if (object.class == "vector-figure") {
    var elements = object.getElementsByTagName('*');
    for (var i = 0; i < elements.length; i++) {
      var jetColor = elements[i].getAttribute('fill');

      // check if a fill attribute exists
      if (jetColor != null)
        jetColor = chroma(jetColor)
      // otherwise check if the style.fill exists
      else if (elements[i].style.fill != "") {
        var str = elements[i].style.fill;
        jetColor = str.substring(4, str.length - 1).replace(/ /g, '').split(',');
        jetColor = chroma(jetColor);
      } else
        continue;

      var mappedValue = invertValue(jetColor.lab(), jetInLabSpace, outOfScope);

      if (mappedValue == null)
        unmappedColors = true;
      else {
        var newRGBColor = colormapChromaJS(mappedValue).hex();

        if (elements[i].getAttribute('fill') != null)
          elements[i].setAttribute('fill', newRGBColor);
        else if (elements[i].style.fill != "")
          elements[i].style.fill = newRGBColor;
      }
    }
  }

  if (unmappedColors)
    alert("Your image contains some path elements not in the jet colormap." +
          " We have left these alone and converted the rest of the image");
}


/**
 * Finds the value that gives rise to the given color within the mapping
 * @param {number[]}
 * @param {number[][]}
 * @param {number[][]}
 * @returns {number}
 */
function invertValue(value, mapping, outOfScope) {
  var lowestIndex = 0;
  var lowestDistance = euclideanDist(value, mapping[lowestIndex]);
  for (var i = 1; i < mapping.length; i++)
    if (euclideanDist(mapping[i], value) < lowestDistance) {
      lowestDistance = euclideanDist(mapping[i], value);
      lowestIndex = i;
    }

  for (var i = 0; i < outOfScope.length; i++)
    if (euclideanDist(outOfScope[i], value) < lowestDistance)
      return null;

  return lowestIndex / mapping.length;
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
