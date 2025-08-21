import React, {useState, useEffect } from 'react'
import EasingFunctionButtons from './EasingFunctionButtons'
import Paper from './Paper'
import Form from './Form'
import RenderedVideo from './RenderedVideo'

const Body = () => {
    const [height, setHeight] = useState(300)
    const [frames, setFrames] = useState([])
    const [form, setForm] = useState({ minVal: 0, maxVal: 10, time: 5, fps: 10 })
    const [bezierPoints, setBezierPoints] = useState([])

    useEffect(() => {
        const bullshitHeight = 400
        setHeight(window.innerHeight - bullshitHeight)
    }, [])

    return (
        <div className="container mx-auto pb-6">
            <EasingFunctionButtons setBezierPoints={setBezierPoints} />
            <div style={{ height }}>
            <div className="border b-1 border-x-0 md:border-x-1 border-black h-[100%] w-full">
                <Paper bezierPoints={bezierPoints} form={form} setFrames={setFrames}/> 
            </div>
            </div>
            <Form form={form} setForm={setForm}/>
            <RenderedVideo frames={frames} fps={form.fps} />
        </div>
    );
}

export default Body;
