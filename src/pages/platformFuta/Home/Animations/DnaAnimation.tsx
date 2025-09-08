import React from 'react';

const DnaAnimation: React.FC = () => {
    // Constants for customization
    const dotCount = 10; // Number of dots
    const dotSize = 4; // Radius of dots
    const dotSizeLarge = 7; // Radius of dots
    const lineStroke = 1;
    const spacing = 40; // Space between dots
    const movement = 80; // Space between dots
    const delay = 0.5;

    const width = spacing * dotCount + 2 * spacing;
    const height = 480;

    // Generate lines and circles
    const lines: React.ReactNode[] = [];
    const circles: React.ReactNode[] = [];

    for (let i = 0; i < dotCount; i++) {
        const x = i * spacing + spacing; // x position based on index and spacing

        // Line elements
        lines.push(
            <line
                key={`line-${i}`}
                x1={x}
                y1={height / 2 + movement}
                x2={x}
                y2={height / 2 - movement}
                stroke='#4D5255' // Line color
                strokeWidth={lineStroke}
                className='line'
                style={{ animationDelay: `${i * delay}s` }} // Set delay
            />,
        );

        // Circle elements
        circles.push(
            <circle
                key={`circle-${i}`}
                cx={x}
                cy={height / 2}
                r={dotSize}
                fill='#4D5255' // Initial color
                className='circle'
                style={{ animationDelay: `${i * delay}s` }} // Set delay
            />,
        );

        // Alternate circle elements
        circles.push(
            <circle
                key={`circle-${i + dotCount + 1}`}
                cx={x}
                cy={height / 2}
                r={dotSize}
                fill='#4D5255' // Initial color
                className='circlealt'
                style={{ animationDelay: `${i * delay}s` }} // Set delay
            />,
        );
    }

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio='xMidYMid meet'
            style={{ width: '100%', height: 'auto' }} // Make the SVG responsive
        >
            <style>
                {`
                    @keyframes fadeIn {
                        0% { opacity: 0; }
                        100% { opacity: 1; }
                    }

                    @keyframes translateY {
                        0% { transform: translateY(-${movement}px); }
                        50% { transform: translateY(${movement}px); }
                        100% { transform: translateY(-${movement}px); }
                    }

                    @keyframes changeColor {
                        0%, 100% { fill: #81979A; }
                        75% { fill: #4D5255; }
                        25% { fill: #AACFD1; }
                    }

                    @keyframes changeRadius {
                        25% { r: ${dotSizeLarge}; }
                        0%, 100% { r: ${dotSize + (dotSizeLarge - dotSize) / 2}; }
                        75% { r: ${dotSize}; }
                    }

                    .circle {
                        opacity: 0;
                        animation: fadeIn ${delay * dotCount}s forwards, translateY ${delay * dotCount}s infinite cubic-bezier(0.42, 0, 0.58, 1), changeColor ${delay * dotCount}s infinite cubic-bezier(0.42, 0, 0.58, 1), changeRadius ${delay * dotCount}s infinite cubic-bezier(0.42, 0, 0.58, 1);
                    }

                    .line {
                        opacity: 0;
                        animation: fadeIn ${delay * dotCount}s forwards, lineLengthChange ${delay * dotCount}s infinite cubic-bezier(0.42, 0, 0.58, 1);
                    }

                    @keyframes lineLengthChange {
                        0%, 100% {
                            transform: scaleY(1.0); /* Original size */
                            transform-origin: center; /* Default center */
                        }
                        32%, 68% {
                            transform: scaleY(0); /* Stretch */
                            transform-origin: center; /* Default center */
                        }
                        42%, 58% {
                            transform: scaleY(1); /* Stretch */
                            transform-origin: center; /* Default center */
                        }
                    }
                    .circlealt {
                        opacity: 0;
                        animation: fadeIn ${delay * dotCount}s forwards, translateY2 ${delay * dotCount}s infinite cubic-bezier(0.42, 0, 0.58, 1), changeColor2 ${delay * dotCount}s infinite cubic-bezier(0.42, 0, 0.58, 1), changeRadius2 ${delay * dotCount}s infinite cubic-bezier(0.42, 0, 0.58, 1);
                    }

                    @keyframes translateY2 {
                        0% { transform: translateY(${movement}px); }
                        50% { transform: translateY(-${movement}px); }
                        100% { transform: translateY(${movement}px); }
                    }

                    @keyframes changeColor2 {
                        0%, 100% { fill: #81979A; }
                        25% { fill: #4D5255; }
                        75% { fill: #AACFD1; }
                    }

                    @keyframes changeRadius2 {
                        25% { r: ${dotSize}; }
                        0%, 100% { r: ${dotSize + (dotSizeLarge - dotSize) / 2}; }
                        75% { r: ${dotSizeLarge}; }
                    }

                    .rotating-group {
                        transform: rotate(-45deg);
                        transform-origin: 50% 50%; /* Keep the center point responsive */
                    }
                `}
            </style>
            <g className='rotating-group'>
                <g>{lines}</g>
                <g>{circles}</g>
            </g>
        </svg>
    );
};

export default DnaAnimation;
