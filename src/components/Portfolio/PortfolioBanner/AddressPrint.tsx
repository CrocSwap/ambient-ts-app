import { useEffect, useRef, useState } from 'react';

interface propsIF {
    address?: string;
}

export default function AddressPrint(props: propsIF) {
    const address =
        props.address ?? '0x0000000000000000000000000000000000000000';

    const [paths, setPaths] = useState<
        { path: string | undefined; opacity: number; id: string }[]
    >([]);
    const containerRef = useRef<SVGSVGElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(1825); // Default width

    const hexValues = address
        .slice(2)
        .match(/.{1,2}/g)
        ?.map((pair) => parseInt(pair, 16));

    const numLines = 10;
    const opacityMax = 0.8;
    const opacityMin = 0;

    const yMin = 0;
    const yMax = 255;
    const height = 136;
    const yRange = yMax - yMin; // Range of y values
    const yScale = (height - 20) / yRange; // Padding for edges
    const middleY = height / 2;

    const color = '#7371FC';

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                const newWidth = entries[0].contentRect.width;
                setContainerWidth(newWidth);
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const generatePaths = () => {
            const xSpacing = containerWidth / (hexValues?.length || 1);

            return Array.from({ length: numLines }, (_, lineIndex) => {
                const points = hexValues?.map((value, index) => {
                    const x = index * xSpacing;

                    // Calculate y relative to fixed min and max values
                    const y = (value - yMin) * yScale; // Scale based on the fixed yMin and yMax

                    // Adjust y to fit within SVG height and translate to center
                    const adjustedY = height - y - 10; // -10 for padding at the bottom

                    // Convert to a y value where the middle is 0
                    const yWithMiddleAsZero = adjustedY - middleY;

                    // Calculate the factor based on the index and line index
                    const totalPoints = hexValues.length;
                    const middleIndex = Math.floor(totalPoints / 2);
                    const distanceFromMiddle = Math.abs(middleIndex - index);
                    const factor = 1 - distanceFromMiddle / middleIndex; // Scale between 0 and 1

                    // Scale the factor based on the line index
                    const amplitudeFactor = 1 - lineIndex / (numLines - 1); // Decrease from 1 to 0

                    // Apply the factor to the y value and adjust back to middle
                    const scaledY =
                        yWithMiddleAsZero * factor * amplitudeFactor + middleY;

                    return [x, scaledY];
                });

                // Generate Catmull-Rom spline path data
                const pathData =
                    points &&
                    points
                        .map(([x, y], index, arr) => {
                            if (index === 0) return `M ${x},${y}`;
                            const [p0x, p0y] = arr[index - 1] || arr[0];
                            const [p1x, p1y] = arr[index];
                            const [p2x, p2y] = arr[index + 1] || arr[index];
                            const [p3x, p3y] =
                                arr[index + 2] || arr[index + 1] || arr[index];

                            // Calculate Catmull-Rom control points
                            const cp1x = p1x + (p2x - p0x) / 6;
                            const cp1y = p1y + (p2y - p0y) / 6;
                            const cp2x = p2x - (p3x - p1x) / 6;
                            const cp2y = p2y - (p3y - p1y) / 6;

                            return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2x},${p2y}`;
                        })
                        .join(' ');

                // Set opacity based on line index, using the defined constants
                const opacity =
                    opacityMax -
                    (lineIndex / (numLines - 1)) * (opacityMax - opacityMin); // Decrease opacity from max to min

                return {
                    path: pathData,
                    opacity: opacity,
                    id: `gradient-${lineIndex}`,
                };
            });
        };

        const generatedPaths = generatePaths();
        setPaths(generatedPaths);
    }, [address, containerWidth]); // Depend on address and container width

    return (
        <svg
            ref={containerRef}
            width={'100%'}
            height={'100%'}
            style={{
                position: 'absolute',
                cursor: 'default',
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
        >
            <defs>
                {Array.from({ length: numLines }, (_, index) => (
                    <linearGradient
                        key={`gradient-${index}`}
                        id={`gradient-${index}`}
                        x1='50%'
                        y1='0%'
                        x2='50%'
                        y2='0%'
                    >
                        <stop offset='0%' stopColor={color} stopOpacity='0' />
                        <stop offset='50%' stopColor={color} stopOpacity='1' />
                        <stop offset='100%' stopColor={color} stopOpacity='0' />
                        <animate
                            attributeName='x1'
                            from='50%'
                            to='0%'
                            dur='3s'
                            repeatCount='1'
                            fill='freeze'
                        />
                        <animate
                            attributeName='x2'
                            from='50%'
                            to='100%'
                            dur='3s'
                            repeatCount='1'
                            fill='freeze'
                        />
                    </linearGradient>
                ))}
            </defs>
            {paths.map(({ path, opacity, id }, index) => (
                <path
                    key={index}
                    d={path}
                    fill='none'
                    stroke={`url(#${id})`} // Reference the gradient for each line
                    strokeWidth='1.5'
                    style={{ opacity: opacity }} // Apply opacity to each path
                />
            ))}
        </svg>
    );
}
