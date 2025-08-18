import React, { useState, useEffect, useRef } from 'react'
import { paper } from 'paper'

const Paper = ({ bezierPoints }) => {
    console.log({bezierPoints})
    const parentRef = useRef(null)
    const childRef = useRef(null)

    const [display, setDisplay] = useState({ width: 0, height: 0})

    useEffect(() => {
        console.log(`useeffect [] draw`)
        const element = parentRef.current
        if (!element) return;
      
        const observer = new ResizeObserver((entries) => {
            console.log({ entries })
          for (let entry of entries) {
            initPaper()
            const { width, height } = entry.contentRect;
            setDisplay({ width, height })

            const canvas = document.getElementById('paper')
            if(canvas) {
                console.log({ width, height})
                paper.view.viewSize = new paper.Size(width, height)
                paper.view.update()
            }
            drawLine()
            
          }
        });
      
        observer.observe(element);
        
      
        return () => {
          observer.unobserve(element);
          observer.disconnect();
        };
      }, []);

      useEffect(() => {
        clearBezierLine()
        
        bezierPath(bezierPoints)
      }, [bezierPoints])

      const initPaper = () => {
        paper.setup("paper")
      }

      const drawLine = () => {
        const { view } = paper
        new paper.Path({
        segments: [
            [0, view.size.height],
            [view.size.width, 0]                 
        ],
        strokeColor: 'black',
        strokeWidth: 2,
        strokeCap: 'round',
        name: 'bezierLine'
        })
      }

      const clearBezierLine = () => {
        console.log(paper)
        // const bezierLine = paper.project?.activeLayer?.namedItem('bezierLine');
        const find = paper?.project?.getItems({ name: 'bezierLine' })
        if(!find || find?.length === 0) return
        else {
            console.log({ find })
            const bezierLine = find[0]
            bezierLine.remove(); 
        }
      };

      const bezierPath = (beziers) => {
        const { view } = paper
        if(!view) return 
        const w = view.size.width;
        const h = view.size.height;
      
        if (!beziers || beziers.length === 0) return null;
      
        const start = new paper.Point(0, h);
        let path = new paper.Path({
          segments: [start],
          strokeColor: 'black',
          strokeWidth: 4,
          strokeCap: 'round',
          name: 'bezierLine'
        });
      
        let prevPoint = start;
      
        // Loop through all Bezier segments
        beziers.forEach((bez, i) => {
          const endX = ((i + 1) / beziers.length) * w; // evenly distribute endpoints
          const endY = 0; // top (you can make this dynamic if needed)
          const end = new paper.Point(endX, endY);
      
          const cp1 = new paper.Point(bez.x1 * w, (1 - bez.y1) * h);
          const cp2 = new paper.Point(bez.x2 * w, (1 - bez.y2) * h);
      
          // Add a new segment at the end
          path.add(end);
      
          // Set handles for smooth curve
          path.segments[path.segments.length - 2].handleOut = cp1.subtract(prevPoint);
          path.segments[path.segments.length - 1].handleIn  = cp2.subtract(end);
      
          prevPoint = end;
        });
      
        return path;
      }

      

    return (
        <div className="w-full h-full flex flex-col" ref={parentRef}>
            <canvas 
                id="paper"
                width={display.width}
                height={display.height}
                ref={childRef}
                style={{ 
                    position: `relative`, 
                    top: 0,
                    left: 0, 
                    // width: display.width,
                    height: display.height,
                }}
            >                
            </canvas>
        </div>
    )
}

export default Paper;