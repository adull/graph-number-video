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
            const omgg = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
            const b  = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
            console.log({omgg, b})
            const ffmpeg = new FFmpeg({ 
                log: true,
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            console.log(ffmpeg)
            if(!ffmpeg.loaded) {
                await ffmpeg.load();
                console.log(`ffmpeg loaded`)

            }
            setFfmpegLoaded(true)
            ffmpegRef.current = ffmpeg
        }
        loadFfmpeg()
        
    }, [])

  useEffect(() => {
    console.log(`rendered video...`)
    console.log({ frames })
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
    console.log({ mimeType })

    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    // console.log({ mediaRecorder })
    // setRecorder(mediaRecorder);

    let chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        // setIsRendering(true)
        setVideoMeta({ ...videoMeta, isRendering: true})
        const blob = new Blob(chunks, { type: "video/webm" });
        console.log('final blob size:', blob.size);
        try {
            console.log(`try.?`)
            const file = await webmToMp4(blob)
            console.log(`should be good..`)
            setVideoMeta({ isRendering: false, mp4Blob: file, isLoaded: true, hasError: false})
        } catch(e) {
            console.error('Error in rendering video file')
            console.log(e)
            setVideoMeta({ ...videoMeta, isRendering: false, isLoaded: true, hasError: true})
        }
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
        // if(!ffmpegLoaded) {
        //     console.log(`ffmpeg not loaded yet,,`)
        //     return
        // }
    
        console.log(ffmpeg)
    
        // Write WebM file to FFmpeg FS
        console.log({webmBlob})
        // const hmm = await webmBlob.arrayBuffer()
        // const uhh = new Response(webmBlob)
        // console.log({uhh})
        // console.log(uhh.body)
        // const hmm = await (uhh).arrayBuffer();
        // console.log({ hmm })
        // const uint8Array = new Uint8Array(hmm);
        const uint8Array = await webmBlob.bytes()
        console.log(`**`)
        console.log(uint8Array.slice(0, 32)); //
        // console.log({ uint8Array})
        

        // const lol = await ffmpeg.readFile('input.webm');
        // console.log({ lol })
    
        // console.log(`Starting conversion..`)
        // await ffmpeg.exec('-i', 'input.webm', '-c:v', 'libx264', '-crf', '23', '-preset', 'fast', 'output.mp4');
        // const encoders = await ffmpeg.exec('-encoders');
        // console.log({ encoders })

        console.log(`getting`)
        // const get = await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm')
        console.log(`writing`)
        await ffmpeg.writeFile('input.webm', uint8Array);
        // await ffmpeg.writeFile('input.webm', get);
        console.log(`executing`)
        await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-crf', '23', '-preset', 'fast', 'output.mp4']);
        console.log(`reading`)
        const data = await ffmpeg.readFile('output.mp4');

        // await ffmpeg.exec(
        //     '-f', 'webm',        // force input format
        //     '-i', 'input.webm',
        //     '-c:v', 'libx264',
        //     '-preset', 'fast',
        //     '-crf', '23',
        //     '-c:a', 'aac',
        //     '-b:a', '128k',
        //     '-f', 'mp4',
        //     'output.mp4'
        //   );
          


        // console.log(`Finished conversion.`)
    
        // const data = await ffmpeg.readFile('output.mp4');
        

        console.log({ data })
    
        const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
        return mp4Blob;
        // return webmBlob
    } catch(e) {
        console.error(`error in webmtomp4 fn`)
        console.log(e)
        throw new Error('')

    }
  }


  const download = (e) => {
    e.preventDefault();
    console.log(videoMeta)
    // if (!videoMeta.file) return;
  
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(videoMeta.mp4Blob);
    console.log({ url })
  
    // Create a temporary <a> element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video.mp4'; // or 'video.mp4' if you converted it
  
    // Append, click, remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  
    // Revoke the URL to free memory
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* {frames.length > 0 && videoMeta.isLoaded ? <canvas ref={canvasRef} width={640} height={480}></canvas> : <></>} */}
      <canvas ref={canvasRef} width={640} height={480}></canvas>
      {videoMeta.isRendering ? <div>Rendering..</div> : <></>}
      {videoMeta.isLoaded ? <button className="border b-1 border-black p-3" onClick={download}>Download</button>:<></> }
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
