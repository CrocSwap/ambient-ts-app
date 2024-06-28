import { useRef /* useState */ } from 'react';

export default function Xaxis() {
    const d3XaxisRef = useRef<HTMLInputElement | null>(null);
    // const [xAxis, setXaxis] = useState<any>();

    return (
        <d3fc-svg
            ref={d3XaxisRef}
            id='x-axis'
            className='x-axis'
            style={{
                flex: 1,
            }}
        >
            xAxis
        </d3fc-svg>
    );
}
