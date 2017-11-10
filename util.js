function download(filename, data) {
    var pom = document.createElement('a');
    var blob = new Blob([data], {type:"octet/stream"});
    var url = window.URL.createObjectURL(blob);
    pom.setAttribute('href', url);
    pom.setAttribute('download', filename);
    pom.click();
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function hsl(h, s, l) {
    return "hsl(" + h + "," + s + "%," + l + "%)";
}

function randomMut(prev, step, max, prob) {
    var result = prev;
    if (Math.random() < prob) {
        if (randomInt(2)) {
            result += randomInt(step);
        } else {
            result -= randomInt(step);
        }
        return (result + step * max) % max;
    }
    return result;
}

function geneticMut(a, b) {
    var trit = randomInt(3);
    if (trit === 0) {
        return a;
    } else if (trit === 1) {
        return b;
    } else {
        return Math.floor((a + b) / 2);
    }
}

function median(arr) {
    var middle = Math.floor(arr.length / 2);
    if(middle % 2 == 1) {
        //odd length
        return arr[Math.floor(arr.length / 2)];
    } else {
        //even length
        return (arr[middle] + arr[middle - 1]) / 2;
    }
}

function standardDeviation(values){
  var avg = average(values);

  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function graph(ctx, arr, max, count, x, y, width, height, style, text) {
    if(text && arr.length <= 0) {
        ctx.fillStyle = "Black";
        var current = parseFloat(arr[arr.length - 1].toFixed(3));
        ctx.fillText(text + ": " + current + " Max: " + parseFloat(max.toFixed(3)), x, y + 10);
    }

    ctx.strokeStyle = style;
    var px = 0;
    var step = width / count;
    var range = max/height;
    var startY = y + height;

    var i = Math.max(0, arr.length - count); //display the last (max) events
    ctx.moveTo(x, startY - arr[i]/height);
    ctx.beginPath();
    while(i < arr.length) {
        ctx.lineTo(x + px++ * step, startY - arr[i]/range);
        i++;
    }
    ctx.stroke();
}

function labelGraph(ctx, yMax, xMax, x, y, width, height, title) {
    var startX = x;
    var startY = y + height + 15;

    ctx.font="12px Sans-Serif";
    ctx.fillStyle = "Black";
    ctx.fillText(title, startX, startY - height - 20);

    ctx.font="10px Sans-Serif";
    ctx.fillText(parseFloat(xMax).toFixed(0), startX + width - 25, startY);
    ctx.fillText(parseFloat(xMax * 0.75).toFixed(0), startX + width * 0.75, startY);
    ctx.fillText(parseFloat(xMax * 0.50).toFixed(0), startX + width * 0.50, startY);
    ctx.fillText(parseFloat(xMax * 0.25).toFixed(0), startX + width * 0.25, startY);
    ctx.fillText("0", startX, startY);

    startX = width + 5;
    startY = y + 8;
    ctx.fillText(parseFloat(yMax).toFixed(2), startX, startY);
    ctx.fillText(parseFloat(yMax * 0.75).toFixed(2), startX, startY + height * 0.25);
    ctx.fillText(parseFloat(yMax * 0.50).toFixed(2), startX, startY + height * 0.50);
    ctx.fillText(parseFloat(yMax * 0.25).toFixed(2), startX, startY + height * 0.75);
    ctx.fillText("0", width + 5, y + height);

}
