window.onload = function(){
  [].slice.call(document.getElementsByTagName('button')).forEach(function(button) {
    button.addEventListener('click', click, false);
  });
  
  document.getElementById('hue').addEventListener('change', changeHue, false);
  
  function changeHue(e) {
    var el = e.target;
    var h = el.value / 100;
    
    var h2 = h + 0.5;
    if (h2 > 1) h2 -= 1;
    var rgb = hslToRgb(h, .5, .5);
    var rgb2 = hslToRgb(h2, .5, .5);
    document.getElementById('title').style.backgroundColor = 'rgb('+parseInt(rgb[0], 10)+','+parseInt(rgb[1], 10)+','+parseInt(rgb[2], 10)+')';
    document.getElementById('title').style.color = 'rgb('+parseInt(rgb2[0], 10)+','+parseInt(rgb2[1], 10)+','+parseInt(rgb2[2], 10)+')';
  }
  
  function click(e){
    var imgEl = document.getElementById(e.target.getAttribute('data-id'));
    
    [].slice.call(document.getElementsByTagName('img')).forEach(function(el){ el.style.display = 'none'; });
    imgEl.style.display = 'block';
    
    
    
    
    
    
    return;
    /*var rgb = getAverageRGB(imgEl);
    document.body.style.backgroundColor = 'rgb('+rgb.r+','+rgb.b+','+rgb.g+')';
    */
    var color = getDeterministicRGB(imgEl);
    var hsl = rgbToHsl(color.r, color.g, color.b);
    var h = hsl[0],
        s = hsl[1],
        l = hsl[2];
    // Calculate the opposite hue, h2
    var h2 = h + 0.5;
    if (h2 > 1) h2 -= 1;
    var rgb = hslToRgb(h2, s, l);
    document.getElementById('title').style.backgroundColor = 'rgb('+parseInt(rgb[0], 10)+','+parseInt(rgb[1], 10)+','+parseInt(rgb[2], 10)+')';
    document.getElementById('title').style.color = 'rgb('+color.r+','+color.g+','+color.b+')';
  }
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

function getDeterministicRGB(imgEl) {
  var blockSize = 5, // only visit every 5 pixels
      defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
      rgb = {r:0,g:0,b:0},
      canvas = document.createElement('canvas'),
      context = canvas.getContext && canvas.getContext('2d'),
      data, width, height,
      i = -4,
      length,
      rMap = {},
      gMap = {},
      bMap = {},
      offset = 256,
      count = offset;
  
  if (!context) {
      return defaultRGB;
  }

  height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
      data = context.getImageData(0, 0, width, height);
  } catch(e) {
      /* security error, img on diff domain */
      return defaultRGB;
  }
  
  // Fill RGB maps
  while (count--) {
    rMap[count] = 0;
    gMap[count] = 0;
    bMap[count] = 0;
  }
  
  length = data.data.length;
  
  while ( (i += blockSize * 4) < length ) {
      ++count;
      rMap[data.data[i]]++;
      gMap[data.data[i+1]]++;
      bMap[data.data[i+2]]++;
  }
  
  count = offset;
  var rCount = gCount = bCount = 0;
  while (count--) {
    if (rMap[count] > rCount) {
      rCount = rMap[count];
      rgb.r = count;
    }
    if (gMap[count] > gCount) {
      gCount = gMap[count];
      rgb.g = count;
    }
    if (bMap[count] > bCount) {
      bCount = bMap[count];
      rgb.b = count;
    }
  }
  
  return rgb;
}

function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;

}