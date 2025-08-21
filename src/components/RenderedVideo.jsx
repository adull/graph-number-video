import React, { useRef, useEffect, useState } from "react";

const RenderedVideo = ({ frames, fps }) => {
  const canvasRef = useRef(null);
//   const [recorder, setRecorder] = useState(null);

  useEffect(() => {
    console.log(`rendered video...`)
    console.log({ frames })
    if (!frames || frames.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Setup recorder
    const stream = canvas.captureStream(6);

    const options = [
        "video/webm;codecs=vp9",    // best quality if supported
        "video/webm;codecs=vp8",    // widely supported
        "video/webm",               // generic, usually VP8
        "video/webm;codecs=vp8,opus", // VP8 video + Opus audio
        "video/webm;codecs=vp9,opus"  // VP9 video + Opus audio
      ];
      
    const mimeType = options.find(type => MediaRecorder.isTypeSupported(type));
    console.log({ mimeType })

    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    // console.log({ mediaRecorder })
    // setRecorder(mediaRecorder);

    let chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      
      console.log({ a })
      a.innerHTML='DOWNLOAD'
      a.href = url;
      a.download = "animation.webm";
      document.body.appendChild(a)
    };

    let frameIndex = 0;

    console.log({ frames })
    const draw = () => {
        if (frameIndex >= frames.length) {
            mediaRecorder.stop();
            return;
        }

        const value = frames[frameIndex].val; 
        console.log({ frameIndex, value})

        // Clear
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw value
        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif";
        ctx.fillText(value.toFixed(0), 100, 100);

        frameIndex++;

        setTimeout(() => requestAnimationFrame(draw), 500 / fps);
    }; 

    // Start recording + animation
    mediaRecorder.start();
    requestAnimationFrame(draw);

  }, [frames]);

  return (
    <div>
      <canvas ref={canvasRef} width={640} height={480}></canvas>
    </div>
  );
};

// Linear interpolation
function getInterpolated(frames, timeSec) {
  const frameNum = timeSec * 60; // current frame index
  let i = 0;
  while (i < frames.length - 1 && frameNum > frames[i + 1].index) {
    i++;
  }
  const f1 = frames[i];
  const f2 = frames[Math.min(i + 1, frames.length - 1)];

  const t = (frameNum - f1.index) / (f2.index - f1.index || 1);
  return f1.val + t * (f2.val - f1.val);
}

export default RenderedVideo;
