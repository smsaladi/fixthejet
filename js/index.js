var img = new Image();
img.src = 'jetairy.png';
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
img.onload = function() {
  ctx.drawImage(img, 0, 0);
  img.style.display = 'none';
};
var color = document.getElementById('color');
function pick(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = ctx.getImageData(x, y, 1, 1);
  var data = pixel.data;
  var rgba = 'rgba(' + data[0] + ', ' + data[1] +
             ', ' + data[2] + ', ' + (data[3] / 255) + ')' + jet_to_val(data[0]/255, data[1]/255, data[2]/255);
  color.style.background =  rgba;
  color.textContent = rgba;
}
canvas.addEventListener('mousemove', pick);

function jet_to_val(r, g, b) {
    /* convert a jet pixel into it's value
    http://blogs.mathworks.com/cleve/2015/02/02/origins-of-colormaps/
    */

    if (g == 0 && r == 0) {
      return b/4 - 1/8;
    } else if (b == 1) {
      if (r != 0) {
        return -1;
      }
      return g/4 + 1/8;
    } else if (g == 1) {
      return r/4 + 3/8;
    } else if (r == 1) {
        if (b != 0) {
          return -1;
        }
      return -g/4 + 7/8;
    } else if (g == 0 && b == 0) {
      return -r/4 + 9/8;
    } else {
      return -1;
    }
}
