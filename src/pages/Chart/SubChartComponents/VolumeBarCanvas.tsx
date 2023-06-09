import { useRef } from 'react';

export default function volumeBarCanvas() {
    const d3CanvasBar = useRef<HTMLInputElement | null>(null);

    return (
        <d3fc-canvas
            ref={d3CanvasBar}
            className='volume-canvas'
            style={{
                position: 'relative',
                height: '50%',
                top: '50%',
            }}
        ></d3fc-canvas>
    );
}
