import React, {useState, useEffect } from 'react'


const Form = ({ form, setForm }) => {
    const [minVal, setMinVal] = useState(form.minVal)
    const [maxVal, setMaxVal] = useState(form.maxVal)
    const [time, setTime] = useState(form.time)
    const [fps, setFps] = useState(form.fps)


    const updateForm = (e) => {
        console.log(e)
        e.preventDefault()
        setForm({ minVal, maxVal, time, fps })
    }
    return (
        <form>
            <div className="flex">
                <label className="mr-4" for={`minVal`}>Minimum Value</label>
                <input value={minVal} onChange={(e) => setMinVal(e.target.value)} type="number"></input>
            </div>
            <div className="flex">
                <label className="mr-4" for={`minVal`}>Maximum Value</label>
                <input value={maxVal} onChange={(e) => setMaxVal(e.target.value)} type="number"></input>
            </div>
            <div className="flex">
                <label className="mr-4" for={`minVal`}>Time</label>
                <input value={time} onChange={(e) => setTime(e.target.value)} type="number"></input>
            </div>
            <div className="flex">
                <label className="mr-4" for={`minVal`}>FPS</label>
                <input value={fps} min={1} max={60} onChange={(e) => setFps(e.target.value)} type="range"></input>
                <span>{fps}</span>
            </div>
            <input type="submit" onClick={(e) => updateForm(e)} value="Render"></input>
        </form>
    );
}

export default Form
