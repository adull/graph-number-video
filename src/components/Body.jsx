import React, {useState, useEffect } from 'react'
import Paper from './Paper'
import EasingFunctionButtons from './EasingFunctionButtons'

const Body = () => {
    const [height, setHeight] = useState(300)
    const [bezierPoints, setBezierPoints] = useState([])

    useEffect(() => {
        const bullshitHeight = 400
        setHeight(window.innerHeight - bullshitHeight)
    }, [])

    return (
        <div className="container mx-auto pb-6" style={{ height }}>
            <EasingFunctionButtons setBezierPoints={setBezierPoints} />
            <div className="border b-1 border-x-0 md:border-x-1 border-black h-[100%] w-full">
                <Paper bezierPoints={bezierPoints} /> 
            </div>
        </div>
    );
}

export default Body;
