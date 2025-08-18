import { easingFunctions } from '../const/easingFunctions.js'

const EasingFunctionButtons = ({ setBezierPoints}) => {
    const callSetSegments = (easingFunction) => {
        const map = {
            'EASE_IN_SINE': easingFunctions.easeInSine(),
            'EASE_OUT_SINE': easingFunctions.easeOutSine(),
            'EASE_IN_OUT_SINE': easingFunctions.easeInSine(),
            'EASE_IN_QUAD': easingFunctions.easeInQuad(),
            'EASE_OUT_QUAD': easingFunctions.easeOutQuad(),
            'EASE_IN_OUT_QUAD': easingFunctions.easeInOutQuad()
        }
        const bezierPoints = map[easingFunction]
        // console.log({ points, setSegments })
        // setSegments(points)
        setBezierPoints(bezierPoints)

    }
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button onClick={() => callSetSegments('EASE_IN_SINE')}>EASE IN SINE</button>
            <button onClick={() => callSetSegments('EASE_OUT_SINE')}>EASE OUT SINE</button>
            <button onClick={() => callSetSegments('EASE_IN_OUT_SINE')}>EASE IN OUT SINE</button>
            <button onClick={() => callSetSegments('EASE_IN_QUAD')}>EASE IN QUAD</button>
            <button onClick={() => callSetSegments('EASE_OUT_QUAD')}>EASE OUT QUAD</button>
            <button onClick={() => callSetSegments('EASE_IN_OUT_QUAD')}>EASE IN OUT QUAD</button>
        </div>
    );
}

export default EasingFunctionButtons;
