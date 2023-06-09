export default function volumeBarCanvas() {
    return (
        <d3fc-canvas
            // ref={d3CanvasBar}
            className='volume-canvas'
            style={{
                position: 'relative',
                height: '50%',
                top: '50%',
            }}
        ></d3fc-canvas>
    );
}
