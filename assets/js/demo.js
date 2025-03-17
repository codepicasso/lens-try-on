const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
let irisColor = 'green';

function selectColor(color) {
  console.log(irisColor);
  irisColor = color;
}

function drawCircleAroundIris(ctx, landmarks, irisLandmarks, options, center) {  
  const irisPoints = irisLandmarks.map(index => {
    return {
      x: landmarks[index].x,
      y: landmarks[index].y
    };
  });

  if (irisPoints.length === 0) return;
 
  // Calculate the average position of the iris points
  const avgX = landmarks[center].x * canvasElement.width;
  const avgY = landmarks[center].y * canvasElement.height;
 
  // Estimate the radius based on the distance between points (you may need to adjust this)
  const radius = Math.sqrt(
    Math.pow(irisPoints[0].x * canvasElement.width - avgX, 2) +
    Math.pow(irisPoints[0].y * canvasElement.height - avgY, 2)
  );
  
  const gradient = ctx.createRadialGradient(avgX, avgY, radius/2, avgX, avgY, radius);
  // const gradient = ctx.createLinearGradient(avgX - radius, avgY - radius, avgX + radius, avgY + radius);

  if (options.color == 'green') {
    gradient.addColorStop(0, 'green'); // Center color
    gradient.addColorStop(1, 'transparent'); // Outer color
  } else if (options.color == 'red') {
    gradient.addColorStop(0, 'red'); // Center color
    gradient.addColorStop(1, 'transparent'); // Outer color
  } else if (options.color == 'blue') {
    gradient.addColorStop(0, 'blue'); // Center color
    gradient.addColorStop(1, 'transparent'); // Outer color
  }

  // Draw the circle  
  ctx.beginPath();
  ctx.arc(avgX, avgY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function onResults(results) {  
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);  
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {

      let leftIrisLandmarks = [469, 470, 471, 472];
      let rightIrisLandmarks = [474, 475, 476, 477];

      drawCircleAroundIris(canvasCtx, landmarks, leftIrisLandmarks, {color: irisColor}, 468);
      drawCircleAroundIris(canvasCtx, landmarks, rightIrisLandmarks, {color: irisColor}, 473);
    }
  }
  canvasCtx.restore();
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  console.log(file);
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
  },
  width: 640,
  height: 480
});
camera.start();