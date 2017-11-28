/**
 * Image conversion
 * All the heavy lifting done here
 *
 */

 var viridis = ["#440154", "#440256", "#450457", "#450559", "#46075a", "#46085c", "#460a5d", "#460b5e", "#470d60", "#470e61", "#471063", "#471164", "#471365", "#481467", "#481668", "#481769", "#48186a", "#481a6c", "#481b6d", "#481c6e", "#481d6f", "#481f70", "#482071", "#482173", "#482374", "#482475", "#482576", "#482677", "#482878", "#482979", "#472a7a", "#472c7a", "#472d7b", "#472e7c", "#472f7d", "#46307e", "#46327e", "#46337f", "#463480", "#453581", "#453781", "#453882", "#443983", "#443a83", "#443b84", "#433d84", "#433e85", "#423f85", "#424086", "#424186", "#414287", "#414487", "#404588", "#404688", "#3f4788", "#3f4889", "#3e4989", "#3e4a89", "#3e4c8a", "#3d4d8a", "#3d4e8a", "#3c4f8a", "#3c508b", "#3b518b", "#3b528b", "#3a538b", "#3a548c", "#39558c", "#39568c", "#38588c", "#38598c", "#375a8c", "#375b8d", "#365c8d", "#365d8d", "#355e8d", "#355f8d", "#34608d", "#34618d", "#33628d", "#33638d", "#32648e", "#32658e", "#31668e", "#31678e", "#31688e", "#30698e", "#306a8e", "#2f6b8e", "#2f6c8e", "#2e6d8e", "#2e6e8e", "#2e6f8e", "#2d708e", "#2d718e", "#2c718e", "#2c728e", "#2c738e", "#2b748e", "#2b758e", "#2a768e", "#2a778e", "#2a788e", "#29798e", "#297a8e", "#297b8e", "#287c8e", "#287d8e", "#277e8e", "#277f8e", "#27808e", "#26818e", "#26828e", "#26828e", "#25838e", "#25848e", "#25858e", "#24868e", "#24878e", "#23888e", "#23898e", "#238a8d", "#228b8d", "#228c8d", "#228d8d", "#218e8d", "#218f8d", "#21908d", "#21918c", "#20928c", "#20928c", "#20938c", "#1f948c", "#1f958b", "#1f968b", "#1f978b", "#1f988b", "#1f998a", "#1f9a8a", "#1e9b8a", "#1e9c89", "#1e9d89", "#1f9e89", "#1f9f88", "#1fa088", "#1fa188", "#1fa187", "#1fa287", "#20a386", "#20a486", "#21a585", "#21a685", "#22a785", "#22a884", "#23a983", "#24aa83", "#25ab82", "#25ac82", "#26ad81", "#27ad81", "#28ae80", "#29af7f", "#2ab07f", "#2cb17e", "#2db27d", "#2eb37c", "#2fb47c", "#31b57b", "#32b67a", "#34b679", "#35b779", "#37b878", "#38b977", "#3aba76", "#3bbb75", "#3dbc74", "#3fbc73", "#40bd72", "#42be71", "#44bf70", "#46c06f", "#48c16e", "#4ac16d", "#4cc26c", "#4ec36b", "#50c46a", "#52c569", "#54c568", "#56c667", "#58c765", "#5ac864", "#5cc863", "#5ec962", "#60ca60", "#63cb5f", "#65cb5e", "#67cc5c", "#69cd5b", "#6ccd5a", "#6ece58", "#70cf57", "#73d056", "#75d054", "#77d153", "#7ad151", "#7cd250", "#7fd34e", "#81d34d", "#84d44b", "#86d549", "#89d548", "#8bd646", "#8ed645", "#90d743", "#93d741", "#95d840", "#98d83e", "#9bd93c", "#9dd93b", "#a0da39", "#a2da37", "#a5db36", "#a8db34", "#aadc32", "#addc30", "#b0dd2f", "#b2dd2d", "#b5de2b", "#b8de29", "#bade28", "#bddf26", "#c0df25", "#c2df23", "#c5e021", "#c8e020", "#cae11f", "#cde11d", "#d0e11c", "#d2e21b", "#d5e21a", "#d8e219", "#dae319", "#dde318", "#dfe318", "#e2e418", "#e5e419", "#e7e419", "#eae51a", "#ece51b", "#efe51c", "#f1e51d", "#f4e61e", "#f6e620", "#f8e621", "#fbe723", "#fde725", "#ffffff", "#000000", "#ff0000"];
//TODO: switch to scale-color-perceptual once website is done.

function convert(index) {
  //  const scale = require('scale-color-perceptual');
  //Use "scale.viridis(t)" to get viridis color, where 0<t<1.
  //Works with inferno, magma, and plasma as well.
  var object = document.getElementById("uploaded" + index);
  var name = (object.nodeName).toUpperCase();
  if (name == "CANVAS") {
    var ctx = object.getContext('2d');
    var width = object.width;
    var height = object.height;
    var imageData = ctx.getImageData(0, 0, width, height);
    var img = new Array(width);
    var lab_array = createJetInLabSpace();
    var lastIndex = 0;
    console.log(width);
    //var j = 0;
    var viridisColor;
    var currentDistance;
    for (var i = 0; i < imageData.data.length; i += 4) {
      var pxl = new Array(3);
      // imageData.data[i] = imageData.data[i+1];
      // imageData.data[i+1] = imageData.data[i+2];
      // imageData.data[i+2] = place;

      pxl[0] = imageData.data[i];
      pxl[1] = imageData.data[i + 1];
      pxl[2] = imageData.data[i + 2];

      //console.log(pxl);
      //Convert pxl to lab color
      var lab = sRGBToLab(pxl);
      var j = 0;
      var lowestDistance = euclideanDist(lab, lab_array[0]);
      for (var k = 0; k < 256; k++) {
        if (euclideanDist(lab_array[k], lab) < lowestDistance) {
          lowestDistance = euclideanDist(lab_array[k], lab);
          j = k;
        }
      }

      // if ((i / 4) % width == 0) {
      //   //If first in column, find best color from scratch
      //   currentDistance = euclideanDist(lab, lab_array[0]);
      //  j = 0;
      //   while (euclideanDist(lab, lab_array[j]) < currentDistance && j < 255) {
      //     currentDistance = euclideanDist(lab, lab_array[j]);
      //     j++;
      //   }
      // } else { //if not first in the row
      //   currentDistance = euclidean_dist(lab, lab_array[lastIndex]); // Use previous best index
      //   if (lastIndex == 0) { // if we are at the first index, only look at greater indices
      //     j = lastIndex + 1;
      //     while (euclideanDist(lab, lab_array[j]) < currentDistance && j < 255) {
      //       currentDistance = euclideanDist(lab, lab_array[j]);
      //       j++;
      //     }
      //   } else if (lastIndex == 255) { // if we are at the last index, only look at smaller ones.
      //     j = lastIndex - 1;
      //     while (j > 0 && euclideanDist(lab, lab_array[j]) < currentDistance ) {
      //       currentDistance = euclideanDist(lab, lab_array[j]);
      //       j--;
      //     }
      //   } else { // If not at the endpoints of labscale (will probably go here).
      //     //
      //     if (euclidean_dist(lab, lab_array[lastIndex]) < euclidean_dist(lab, lab_array[lastIndex + 1]) && //If the previous distance is best, use it again.
      //     euclidean_dist(lab, lab_array[lastIndex]) < euclidean_dist(lab, lab_array[lastIndex - 1])) {
      //       //Do nothing, keep lastIndex
      //
      //     } else if (euclidean_dist(lab, lab_array[lastIndex - 1]) < euclidean_dist(lab, lab_array[lastIndex + 1])) { //Go to lower indices
      //       j = lastIndex - 1;
      //       while (j > 0 && euclideanDist(lab, lab_array[j]) < currentDistance) {
      //         currentDistance = euclideanDist(lab, lab_array[j]);
      //         j--;
      //       }
      //     } else { // Go to higher indices
      //       j = lastIndex + 1;
      //       while (j < 255 && euclideanDist(lab, lab_array[j]) < currentDistance) {
      //         currentDistance = euclideanDist(lab, lab_array[j]);
      //         j++;
      //       }
      //     }
      //     //
      //   }
      //
      // }
      //console.log(j);
      if (i < 30) {
        console.log(j + ",  " + lastIndex);
        console.log(euclideanDist(lab, lab_array[j]) + ",  " + euclideanDist(lab, lab_array[lastIndex]));
      }
      viridisColor = viridis[j];
      lastIndex = j;
      var black = sRGBToLab([0, 0, 0]);
      var white = sRGBToLab([255, 255, 255]);
      if (euclideanDist(black, lab) > euclideanDist(lab, lab_array[j]) &&
        euclideanDist(white, lab) > euclideanDist(lab, lab_array[j])) {
        imageData.data[i] = hexToNumber(viridisColor.substring(1, 3));
        imageData.data[i + 1] = hexToNumber(viridisColor.substring(3, 5));
        imageData.data[i + 2] = hexToNumber(viridisColor.substring(5));
        //imageData.data[i+3] = 255;
      }
    }
    //console.log(imageData.data)
    //console.log(arr.length);
    //predictImageWithCNN(arr);
    ctx.putImageData(imageData, 0, 0);
  } else if (name == "SVG") {
    var elements = object.getElementsByTagName('*');
    var isRed = false;
    for (var i = 0; i < elements.length; i++) {
      var jetColor = elements[i].getAttribute('fill');
      var index = -1;
      if (jetColor == null) {
        jetColor = elements[i].style.fill;
        if (jetColor != "") {
          var rgb = jetColor.substring(4, jetColor.length - 1).replace(/ /g, '').split(',');

          rgb[0] /= 255;
          rgb[1] /= 255;
          rgb[2] /= 255;
          // alert(rgb[0] + " " + rgb[1] + " " + rgb[2]);
          index = Math.floor(jet_to_val(rgb[0], rgb[1], rgb[2]) * 255);
        } else {
          index = 256;
        }
      } else {
        var r = hexToNumber(jetColor.substring(1, 3)) / 255;
        var g = hexToNumber(jetColor.substring(3, 5)) / 255;
        var b = hexToNumber(jetColor.substring(5)) / 255;

        index = Math.floor(jet_to_val(r, g, b) * 255);

      }
      if (index == 255 * 2) {
        // VERY INEFFICIENT BUT IT WORKS
        index = 256;
        //#fffff (white?)
      } else if (index == 255 * 3) {
        index = 257;
        //#000000 (black?)
      } else if (index == 255 * 4) {
        index = 258;
        //Red for invalid colors
        //
        //Put code to notify user of invalid colors.
        //
        isRed = true;
      }
      //alert(index);
      var viridisColor = viridis[index];

      //alert(viridisColor);
      if (elements[i].getAttribute('fill') != null) {
        elements[i].setAttribute('fill', viridisColor);
      } else if (elements[i].style.fill != "") {
        elements[i].style.fill = viridisColor;
      }
    }
    if (isRed) {
      alert("Your image contains some path elements not in the jet colormaps." +
        " We have colored those in red and converted the rest of the image");
    }
  }
}
//document.getElementById("convert-btn").onclick = convert;


/**
 * Inteprets a hex value of length 2 as an integer value
 * @param {string}
 * @returns {number}
 */
function hexToNumber(hex) {
  hex = hex.toUpperCase();
  return 16 * sixteenBitToDec(hex.charAt(0)) + sixteenBitToDec(hex.charAt(1));
}


/**
 * Parses a character into it's hexidecimal value
 * @param {string}
 * @returns {number}
 */
function sixteenBitToDec(bit) {
  switch (bit) {
    case 'A':
      return 10;
    case 'B':
      return 11;
    case 'C':
      return 12;
    case 'D':
      return 13;
    case 'E':
      return 14;
    case 'F':
      return 15;
    default:
      return parseInt(bit);
  }
}


/**
 * Convert a jet pixel into it's value
 * http://blogs.mathworks.com/cleve/2015/02/02/origins-of-colormaps/
 * @param {number[]}
 * @returns {number}
 */
function approxJetToValue(sRGB) {
  var r = sRGB[0];
  var g = sRGB[1];
  var b = sRGB[2];

  if (g == 0 && r == 0) {
    return b / 4 - 1 / 8;
  } else if (b == 1) {
    if (r != 0)
      return -1;
    return g / 4 + 1 / 8;
  } else if (g == 1) {
    return r / 4 + 3 / 8;
  } else if (r == 1) {
    if (b != 0)
      return -1;
    return -g / 4 + 7 / 8;
  } else if (g == 0 && b == 0) {
    return -r / 4 + 9 / 8;
  }
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

    jetInLab[i] = sRGBToLab(rgbJet);
  }
  return jetInLab;
}


/**
 * Convert an sRGB color to CIEL*a*b* 1976, i.e. "Lab"
 * Based on Python code given here: https://stackoverflow.com/a/16020102
 *
 * @param {number[]} sRGB
 * @param {number} [bitDepth]
 * @returns {number[]}
 */
function sRGBToLab(sRGB, bitDepth = 8) {
  var valueRange = Math.pow(2, bitDepth) - 1;

  // convert to RGB linear values [R_linear, G_linear, B_linear]
  var RGBLin = [0, 0, 0];
  for (var i = 0; i < 3; i++) {
    RGBLin[i] = sRGB[i] / valueRange;

    // gamma correction
    if (RGBLin[i] >= .04045)
      RGBLin[i] = Math.pow((RGBLin[i] + .055) / 1.055, 2.4);
    else
      RGBLin[i] /= 12.92;

    RGBLin[i] *= 100;
  }

  // convert to CIEXYZ [X, Y, Z]
  var cieXYZ = [
    RGBLin[0] * .4124 + RGBLin[1] * .3576 + RGBLin[2] * .1805,
    RGBLin[0] * .2126 + RGBLin[1] * .7152 + RGBLin[2] * .0722,
    RGBLin[0] * .0193 + RGBLin[1] * .1192 + RGBLin[2] * .9505
  ];

  for (var i = 0; i < 3; i++)
    cieXYZ[i] = Math.round(10000 * cieXYZ[i]) / 10000;

  // account for standard illuminant of sRGB
  // Observer: 2°, Illuminant: D65
  cieXYZ[0] /= 95.047;
  cieXYZ[1] /= 100.0;
  cieXYZ[2] /= 108.883;

  // convert to CIEL*a*b* 1976 [L, a, b]
  for (var i = 0; i < 3; i++)
    if (cieXYZ[i] > .008856)
      cieXYZ[i] = Math.pow(cieXYZ[i], 1 / 3);
    else
      cieXYZ[i] = 7.787 * cieXYZ[i] + 16 / 116;

  var cieLab = [0, 0, 0];
  cieLab[0] = 116 * cieXYZ[1] - 16;
  cieLab[1] = 500 * (cieXYZ[0] - cieXYZ[1]);
  cieLab[2] = 200 * (cieXYZ[1] - cieXYZ[2]);

  for (var i = 0; i < 3; i++)
    cieLab[i] = Math.round(10000 * cieLab[i]) / 10000;

  return cieLab;
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

// function predictImageWithCNN(data) {
//   var final = [];
//   //instantiating model from json and buf files
//   var model = new KerasJS.Model({
//     filepaths: {
//       model: 'dist/model.json',
//       weights: 'dist/model_weights.buf',
//       metadata: 'dist/model_metadata.json'
//     },
//     gpu: true //MAY NEED TO CHANGE (NOT SURE REALLY)
//   });
//
//   //Ready the model.
//   model.ready()
//   .then(function() {
//     //This matches our input data with the input key (b/c Sequential Model)
//     var inputData = {
//       'input_1': new Float32Array(data)
//     };
//     // make predictions based on inputData
//     return model.predict(inputData);
//   })
//   .then(function(outputData) {
//     //Here we take the outputData and parse it to get a result.
//
//     var probs = outputData['output']; //Gets output data
//
//     //**********FOR MNIST DATA ONLY*********
//     //Self-explanatory code that simply finds digit most likely to have been
//     //the number that the user 'wrote'
//     // var sum = 0;
//     // var maxProbindex=0;
//     //
//     // for (var i = 0; i < probs.length; i++) {
//     //   sum += probs[i];
//     //   console.log(probs[i]);
//     //   if (probs[i] > probs[maxProbindex]) {
//     //     maxProbindex = i;
//     //   }
//     // }
//     // console.log(maxProbindex);
//     //*****************************************
//     console.log(probs);
//     //TODO: Put in code to assign outPutData to 'final' so we can then convert it
//     //      This shuould not be too hard to do.
//
//   })
//   .catch(function(err) {
//     console.log(err);
//     // handle error
//   });
//   return final; //Returns nxmx1 array of vals 0-1.
// }
