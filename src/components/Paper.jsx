import React, { useState, useEffect, useRef } from 'react'
import { paper } from 'paper'

const Paper = ({ form, setFrames, bezierPoints }) => {
    // console.log({bezierPoints})
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const tool = new paper.Tool()
    const hitResultRef = useRef(null)
    const isCreatingNewSegmentRef = useRef(false)
    // for use with the tool
    const hitOptions = {
        segments: true,
        // handles: true,
        stroke: true,
        fill: true,
        tolerance: 5
    }

    const [display, setDisplay] = useState({ width: 0, height: 0})

    const toFixedIfNecessary = ( value, dp ) => {
        return +parseFloat(value).toFixed( dp );
    }

    useEffect(() => {
        let { minVal, maxVal, time, fps } = form;
        [minVal, maxVal, time] = [Number(minVal), Number(maxVal), Number(time)]
        const find = paper?.project?.getItems({ name: `bezierLine` })
        if(find) {
            const path = find[0]
            const DECIMAL_POINTS = 3
            // const NUM_FRAMES = Math.ceil(60 * form.time)
            // we want to render in 60 fps ideally, but the update rate looks crazy, switching to 6 fps to make video look better.
            const NUM_FRAMES = Math.ceil(fps * form.time)
            const EVEN_PART = path.length / NUM_FRAMES
            const range = maxVal - minVal
            const { width, height } = display

            const frames = []
            // console.log({minVal, maxVal, time})
            console.log({path})
            
            for(let i = 0; i <= NUM_FRAMES; i ++) {
                const offset = EVEN_PART * i
                const point = path.getPointAt(offset)
                const yPercent = (height - point.y) / height
                frames.push({
                    index: i,
                    val: toFixedIfNecessary(range * yPercent + minVal, DECIMAL_POINTS)
                })
            }
            setFrames(frames)
        }
    }, [form])

    useEffect(() => {
        console.log(`useeffect [] draw`)
        const element = parentRef.current
        if (!element) return
      
        const observer = new ResizeObserver((entries) => {
          for (let entry of entries) {
            initPaper()
            const { width, height } = entry.contentRect
            setDisplay({ width, height })

            const canvas = document.getElementById(`paper`)
            if(canvas) {
                paper.view.viewSize = new paper.Size(width, height)
                paper.view.update()
            }
            drawInitLine()
            
          }
        })
      
        observer.observe(element)
        
      
        return () => {
          observer.unobserve(element)
          observer.disconnect()
        }
      }, [])

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
        // console.log(paper)
        // const bezierLine = paper.project?.activeLayer?.namedItem('bezierLine');
        const find = paper?.project?.getItems({ name: `bezierLine` })
        if(!find || find?.length === 0) return
        else {
            // console.log({ find })
            const bezierLine = find[0]
            bezierLine.remove()
        }
      }

      const sampleBezierX = (seg1, seg2, steps = 10) => {
        const P0 = seg1.point
        const P1 = seg1.point.add(seg1.handleOut)
        const P2 = seg2.point.add(seg2.handleIn)
        const P3 = seg2.point
        let prevX = P0.x
        for(let i=1; i<=steps; i++) {
            const t = i / steps
            const x = cubicBezier(P0.x, P1.x, P2.x, P3.x, t)
            if(x < prevX) return false
            prevX = x
        }
        return true
    }
    const cubicBezier = (p0, p1, p2, p3, t) => {
        return Math.pow(1-t,3)*p0 + 3*Math.pow(1-t,2)*t*p1 + 3*(1-t)*t*t*p2 + Math.pow(t,3)*p3
    }




      const bezierPath = (beziers) => {
        const { view } = paper
        if(!view) return 
        const w = view.size.width
        const h = view.size.height
      
        if (!beziers || beziers.length === 0) return null
      
        const start = new paper.Point(0, h);
        const path = new paper.Path({
          segments: [start],
          strokeColor: `white`,
          strokeWidth: 8,
          strokeCap: `round`,
          fullySelected: true,
          name: `bezierLine`
        })


      
        let prevPoint = start
      
        beziers.forEach((bezier, i) => {
          const endX = ((i + 1) / beziers.length) * w
          const endY = 0
          const end = new paper.Point(endX, endY)
      
          const cp1 = new paper.Point(bezier.x1 * w, (1 - bezier.y1) * h)
          const cp2 = new paper.Point(bezier.x2 * w, (1 - bezier.y2) * h)
      
          path.add(end)
      
          path.segments[path.segments.length - 2].handleOut = cp1.subtract(prevPoint)
          path.segments[path.segments.length - 1].handleIn  = cp2.subtract(end)
      
          prevPoint = end
        })

        return path
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
            // console.log({hitResult})
            if(hitResult.type === `stroke` && hitResult.item) {
                isCreatingNewSegmentRef.current = true
                const path = hitResult.item
                const index = hitResult.location.index + 1
                const newSegment = path.insert(hitResult.location.index + 1, event.point)

                // path.smooth({ from: index - 1, to: index + 1})
                path.smooth()

                hitResultRef.current = { type: 'segment', segment: newSegment, index }

            }
        } else {
            // console.log(`ummm`)
        }
        
        return
    }

    tool.onMouseDrag = function(event) {
        event.preventDefault()
        const hitResult = hitResultRef.current
        if(hitResult) {
            const path = hitResult.segment.path
            const segments = path.segments
            if(hitResult.type === `segment`) {
                let xDeltaIsZero = false
                let yDeltaIsZero = false
                // console.log({ segments })
                
                const hitResultPoint = hitResult.segment.point
                // console.log({hitResultPoint, segments})
                const [firstPoint, lastPoint] = [segments[0]?.point, segments[segments.length - 1]?.point]

                if(hitResultPoint.equals(firstPoint) || hitResultPoint.equals(lastPoint)) {
                    xDeltaIsZero = true
                }

                const index = hitResult.segment.index
                

                const eventDelta = event.delta
                if(!xDeltaIsZero) {
                    const checkPrevious = sampleBezierX(segments[index - 1], segments[index])
                    const checkNext = sampleBezierX(segments[index], segments[index + 1])
                    // console.log({checkPrevious, checkNext})
                    if(!checkPrevious || !checkNext) {
                        // console.log({ checkPrevious, checkNext})
                        if(eventDelta.x > 0 && !checkNext) {
                            // eventDelta.x = 0
                            xDeltaIsZero = true
                        } else if(eventDelta.x < 0 && !checkPrevious) {
                            // eventDelta.x = 0
                            xDeltaIsZero = true
                        }
                        // xDeltaIsZero = true

                    }
                }
                if(xDeltaIsZero) {
                    eventDelta.x = 0
                } if(yDeltaIsZero) {
                    eventDelta.y = 0
                }

                const addWithRespectToDisplay = (point, delta) => {
                    const added = point.add(delta)
                    if(added.y > paper.view.viewSize.height) {
                        added.y = paper.view.viewSize.height
                    } else if(added.y < 0) {
                        added.y = 0
                    }
                    return added
                }
                
                hitResult.segment.point = addWithRespectToDisplay(hitResult.segment.point, eventDelta)
                // path.smooth({ from: index - 1, to: index + 1})
                path.smooth()
            } else if(hitResult.type === `handle-in`) {
                hitResult.segment.handleIn = hitResult.segment.handleIn.add(event.delta)
            } else if(hitResult.type === `handle-out`) {
                hitResult.segment.handleOut = hitResult.segment.handleOut.add(event.delta)
            } else {
                console.log(hitResult.type)
            }

        }
        
    }

    // tool.onMouseUp = (event) => {
    //     event.preventDefault()
    //     console.log(`up`)
    //     if(isCreatingNewSegmentRef.current) {
    //         console.log(`re render the beziers`)
    //     }
    // }

      

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

export default Paper