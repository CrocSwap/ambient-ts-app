import React from 'react';

interface AnimatedGradientPathsProps {
    color1?: string;
    color2?: string;
    color3?: string;
    beamLength?: number;
    skew?: number;
    duration?: string;
    strokeWidth?: string;
}

const AnimatedGradientPaths: React.FC<AnimatedGradientPathsProps> = ({
    color1 = '#1E1E24',
    color2 = '#7371FC',
    color3 = '#CDC1FF',
    beamLength = 6,
    skew = 0.8,
    duration = '10s',
    strokeWidth = '1',
}) => {
    const gradientId1 = `gradient1-${Math.random().toString(36).substr(2, 9)}`;
    const gradientId2 = `gradient2-${Math.random().toString(36).substr(2, 9)}`;

    const colors = [color1, color2, color3, color1];

    const stopOffsets1 = [0, beamLength * skew, beamLength, beamLength].map(
        (offset) => `${offset}%`,
    );
    const stopOffsets2 = [
        100 - beamLength,
        100 - beamLength * (1 - skew),
        100,
        100,
    ].map((offset) => `${offset}%`);

    return (
        <svg
            width='1921'
            height='1024'
            viewBox='0 0 1921 1024'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            style={{ pointerEvents: 'none' }}
        >
            <defs>
                <linearGradient
                    id={gradientId1}
                    x1='0%'
                    y1='0%'
                    x2='0%'
                    y2='0%'
                >
                    {colors.map((color, index) => (
                        <stop
                            key={`1-${index}`}
                            offset={stopOffsets1[index]}
                            stopColor={color}
                        />
                    ))}
                    <animate
                        attributeName='x1'
                        from='-100%'
                        to='100%'
                        dur={duration}
                        begin='0s'
                        fill='freeze'
                        repeatCount='indefinite'
                    />
                    <animate
                        attributeName='x2'
                        from='0%'
                        to='200%'
                        dur={duration}
                        begin='0s'
                        fill='freeze'
                        repeatCount='indefinite'
                    />
                </linearGradient>
                <linearGradient
                    id={gradientId2}
                    x1='0%'
                    y1='0%'
                    x2='0%'
                    y2='0%'
                >
                    {colors.map((color, index) => (
                        <stop
                            key={`2-${index}`}
                            offset={stopOffsets2[index]}
                            stopColor={color}
                        />
                    ))}
                    <animate
                        attributeName='x1'
                        from='-100%'
                        to='100%'
                        dur={duration}
                        begin='0s'
                        fill='freeze'
                        repeatCount='indefinite'
                    />
                    <animate
                        attributeName='x2'
                        from='0%'
                        to='200%'
                        dur={duration}
                        begin='0s'
                        fill='freeze'
                        repeatCount='indefinite'
                    />
                </linearGradient>
            </defs>
            <path
                d='M1 861.974C20.2138 857.484 39.0498 852.821 57.525 847.996C337.25 774.937 534.242 664.553 707.577 549.859C756.156 517.715 802.871 485.237 849.024 453.149C967.567 370.733 1082.41 290.892 1215.63 225.89C1397.68 137.056 1614.06 75.9527 1921 74'
                stroke={`url(#${gradientId1})`}
                strokeWidth={strokeWidth}
                fill='none'
            />
            <path
                d='M1 949.832C204.025 917.266 397.943 867.942 584.27 813.465C700.861 779.377 814.477 743.273 925.495 707.993C932.237 705.851 938.97 703.711 945.693 701.575C1063.12 664.272 1177.65 628.091 1289.72 596.43C1508.39 534.652 1717.72 490.073 1921 487.939'
                stroke={`url(#${gradientId2})`}
                strokeWidth={strokeWidth}
                fill='none'
            />
        </svg>
    );
};

export default AnimatedGradientPaths;
