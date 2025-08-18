import React, { useState, useEffect, useRef } from 'react'
import { paper } from 'paper'

const Paper = ({ bezierPoints }) => {
    console.log({bezierPoints})
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const tool = new paper.Tool()
    const hitResultRef = useRef(null);
    // for use with the tool
    const hitOptions = {
        segments: true,
        handles: true,
        stroke: true,
        fill: true,
        tolerance: 5
    }

    const [display, setDisplay] = useState({ width: 0, height: 0})

    useEffect(() => {
        console.log(`useeffect [] draw`)
        const element = parentRef.current
        if (!element) return;
      
        const observer = new ResizeObserver((entries) => {
          for (let entry of entries) {
            initPaper()
            const { width, height } = entry.contentRect;
            setDisplay({ width, height })

            const canvas = document.getElementById(`paper`)
            if(canvas) {
                paper.view.viewSize = new paper.Size(width, height)
                paper.view.update()
            }
            drawInitLine()
            
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

      const drawInitLine = () => {
        const { view } = paper
        new paper.Path({
            segments: [
                [0, view.size.height],
                [view.size.width, 0]                 
            ],
            strokeColor: `white`,
            strokeWidth: 8,
            strokeCap: `round`,
            fullySelected: true,
            name: `bezierLine`
        })
      }

      const clearBezierLine = () => {
        console.log(paper)
        // const bezierLine = paper.project?.activeLayer?.namedItem('bezierLine');
        const find = paper?.project?.getItems({ name: `bezierLine` })
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
        const path = new paper.Path({
          segments: [start],
          strokeColor: `white`,
          strokeWidth: 8,
          strokeCap: `round`,
          fullySelected: true,
          name: `bezierLine`
        });


      
        let prevPoint = start;
      
        beziers.forEach((bezier, i) => {
          const endX = ((i + 1) / beziers.length) * w;
          const endY = 0;
          const end = new paper.Point(endX, endY);
      
          const cp1 = new paper.Point(bezier.x1 * w, (1 - bezier.y1) * h);
          const cp2 = new paper.Point(bezier.x2 * w, (1 - bezier.y2) * h);
      
          path.add(end);
      
          path.segments[path.segments.length - 2].handleOut = cp1.subtract(prevPoint);
          path.segments[path.segments.length - 1].handleIn  = cp2.subtract(end);
      
          prevPoint = end;
        });

      
        return path;
    }

    tool.onMouseMove = function(event) {
        // console.log(event.point)
        const hitResult = paper.project.hitTest(event.point, hitOptions)
        if (hitResult) {
            document.body.style.cursor = "grab"
          } else {
            document.body.style.cursor = "default"
          }
        
    }

    tool.onMouseDown = function(event) {
        const hitResult = paper.project.hitTest(event.point, hitOptions)
        hitResultRef.current = hitResult

        if(hitResult) {
            document.body.style.cursor = "grabbing"
            console.log({hitResult})
            if(hitResult.type === `stroke` && hitResult.item) {
                const path = hitResult.item
                const index = hitResult.location.index + 1
                const newSegment = path.insert(hitResult.location.index + 1, event.point)
                path.smooth()
                // path.smooth()
                hitResultRef.current = { type: 'segment', segment: newSegment, index }

            }
        } else {
            console.log(`ummm`)
        }
        // if([`handle-in`, `handle-out`].includes(hitResult.type)) {
        //     selectedHandleRef.current = hitResult
        // }
        
        return
    };

    tool.onMouseDrag = function(event) {
        event.preventDefault()
        const hitResult = hitResultRef.current
        if(hitResult) {
            let xDeltaIsZero = false
            if(hitResult.type === `segment`) {
                const path = hitResult.segment.path
                const segments = path.segments
                console.log({ segments })
                
                const hitResultPoint = hitResult.segment.point
                console.log({hitResultPoint, segments})
                const [firstPoint, lastPoint] = [segments[0]?.point, segments[segments.length - 1]?.point]

                if(hitResultPoint.equals(firstPoint) || hitResultPoint.equals(lastPoint)) {
                    xDeltaIsZero = true
                }

                const index = hitResult.segment.index
                const getPreviousPoint = () => {
                    if(index - 1 < 0) {
                        return
                    } 
                    console.log({index})
                    console.log(segments[index - 1])
                    return segments[index - 1]?.point
                }
                const getNextPoint = () => {
                    if(index + 1 > segments.length) {
                        return
                    } 
                    return segments[index + 1]?.point
                }

                const eventDelta = event.delta
                const [previousPointX, nextPointX] = [getPreviousPoint()?.x, getNextPoint()?.x]
                if(event.point.x < previousPointX || event.point.x > nextPointX) {
                    xDeltaIsZero = true
                }

                // if(canMoveSegment) {
                    if(xDeltaIsZero) {
                        eventDelta.x = 0
                    }
                    hitResult.segment.point = hitResult.segment.point.add(eventDelta)
                    path.smooth()
                // }
            } else if(hitResult.type === `handle-in`) {
                hitResult.segment.handleIn = hitResult.segment.handleIn.add(event.delta)
            } else if(hitResult.type === `handle-out`) {
                hitResult.segment.handleOut = hitResult.segment.handleOut.add(event.delta)
            } else {
                console.log(hitResult.type)
            }

        }
        
    };

      

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