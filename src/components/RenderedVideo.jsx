import React, { useRef, useEffect, useState } from "react";
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile,toBlobURL } from "@ffmpeg/util";




const RenderedVideo = ({ frames, fps }) => {
    const ffmpegRef = useRef(null)
    const canvasRef = useRef(null);

    const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
    const [videoMeta, setVideoMeta] = useState({isRendering: false, mp4Blob: null, isLoaded: false, hasError: false})
//   const [recorder, setRecorder] = useState(null);

    useEffect(() => {
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'
        
        const loadFfmpeg = async () => {
            const ffmpeg = new FFmpeg({ 
                log: true,
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            if(!ffmpeg.loaded) {
                await ffmpeg.load();
            }
            setFfmpegLoaded(true)
            ffmpegRef.current = ffmpeg
        }
        loadFfmpeg()
        
    }, [])

  useEffect(() => {
    if (!frames || frames.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Setup recorder
    const stream = canvas.captureStream(fps);

    const options = [
        "video/webm;codecs=vp9",    // best quality if supported
        "video/webm;codecs=vp8",    // widely supported
        "video/webm",               // generic, usually VP8
        "video/webm;codecs=vp8,opus", // VP8 video + Opus audio
        "video/webm;codecs=vp9,opus"  // VP9 video + Opus audio
      ];
      
    const mimeType = options.find(type => MediaRecorder.isTypeSupported(type));
    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    let chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        // setIsRendering(true)
        setVideoMeta({ ...videoMeta, isRendering: true})
        const blob = new Blob(chunks, { type: "video/webm" });
        try {
            const file = await webmToMp4(blob)
            setVideoMeta({ isRendering: false, mp4Blob: file, isLoaded: true, hasError: false})
        } catch(e) {
            console.error('Error in rendering video file')
            console.log(e)
            setVideoMeta({ ...videoMeta, isRendering: false, isLoaded: true, hasError: true})
        }
    };

    let frameIndex = 0;

    const draw = () => {
        if (frameIndex >= frames.length) {
            mediaRecorder.stop();
            return;
        }

        const value = frames[frameIndex].val; 

        // Clear
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw value
        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif";
        ctx.fillText(value.toFixed(0), 100, 100);

        frameIndex++;

        setTimeout(() => requestAnimationFrame(draw), 1000 / fps);
    }; 

    // Start recording + animation
    mediaRecorder.start();
    requestAnimationFrame(draw);

  }, [frames]);

  const webmToMp4 = async function (webmBlob) {
    try {
        console.log(`webmtomp4 start`)
        const ffmpeg = ffmpegRef.current

        ffmpeg.on('log', ({ message }) => {
            // messageRef.current.innerHTML = message;
            console.log(message);
        });
        if(!ffmpeg) {
            console.log('no ffmpeg')
            return
        }
        
        const uint8Array = await webmBlob.bytes()
        await ffmpeg.writeFile('input.webm', uint8Array);
        await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-crf', '23', '-preset', 'fast', 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');

    
        const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
        return mp4Blob;
    } catch(e) {
        console.error(`error in webmtomp4 fn`)
        console.log(e)
        throw new Error('')

    }
  }


  const download = (e) => {
    e.preventDefault();
    if(videoMeta.mp4Blob) {
        const url = URL.createObjectURL(videoMeta.mp4Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video.mp4';
    
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    
        URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={640} height={480}></canvas>
      {videoMeta.isRendering ? <div>Rendering..</div> : <></>}
      {videoMeta.isLoaded ? <button className="border b-1 border-black p-3" onClick={download}>Download</button>:<></> }
    </div>
  );
};

export default RenderedVideo;
