import { useEffect, useState, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

interface INoisyLinesProps {
    numLines: 10;
    width: number;
    height: number;
    opacityStart: 0.01;
    opacityMid: 1;
    opacityEnd: 0.0;
    opacityMidPosition: 0.8;
    amplitudeStart: 160;
    amplitudeMid: 150;
    amplitudeEnd: 0.01;
    amplitudeMidPosition: 0.95;
    noiseScale: 0.008;
    noiseStart: 0.01;
    noiseMid: 0.9;
    noiseEnd: 1;
    noiseMidPosition: 0.8;
    seed: string;
    animationDuration: 3000; // Duration of the animation in milliseconds
}

const NoisyLinesAnimatedGradient = (props: INoisyLinesProps) => {
    const {
        numLines,
        width,
        height,
        opacityStart,
        opacityMid,
        opacityEnd,
        opacityMidPosition,
        amplitudeStart,
        amplitudeMid,
        amplitudeEnd,
        amplitudeMidPosition,
        noiseScale,
        noiseStart,
        noiseMid,
        noiseEnd,
        noiseMidPosition,
        seed,
        animationDuration,
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lines, setLines] = useState<any[]>([]);
    const animationFrameId = useRef<number>();
    const prng = alea(seed);
    const noise2D = createNoise2D(prng);

    const interpolateValue = (
        start: number,
        mid: number,
        end: number,
        midPosition: number,
        position: number,
    ) => {
        if (position < midPosition) {
            return start + (mid - start) * (position / midPosition);
        } else {
            const safeDenominator = 1 - midPosition === 0 ? 1 : 1 - midPosition;
            return (
                mid + (end - mid) * ((position - midPosition) / safeDenominator)
            );
        }
    };
    const animateGradient = (
        startTime: number,
        id: string,
        duration: number,
    ) => {
        const animate = (time: number) => {
            const elapsedTime = time - startTime;
            const progress = Math.min(elapsedTime / duration, 1); // Ensure progress does not exceed 1
            // Calculate the offsets to start from the middle and extend to the sides
            const middleOffset = 50; // Middle of the gradient
            const spread = 50 * progress; // How much the gradient spreads from the middle
            // These offsets determine where the gradient starts and ends
            const startOffset = middleOffset - spread;
            const endOffset = middleOffset + spread;
            const gradientElement = document.getElementById(id);
            if (gradientElement) {
                gradientElement.setAttribute('x1', `${startOffset}%`);
                gradientElement.setAttribute('x2', `${endOffset}%`);
            }
            if (progress < 1) {
                animationFrameId.current = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(animationFrameId.current as number);
            }
        };
        animationFrameId.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const startTime = performance.now();
        lines.forEach((line, index) => {
            animateGradient(
                startTime,
                `line-gradient-${index}`,
                animationDuration,
            );
        });
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [lines, animationDuration]);

    useEffect(() => {
        const newLines = Array.from({ length: numLines }, (_, lineIndex) => {
            let path = '';
            const position = lineIndex / (numLines - 1);
            const opacity = interpolateValue(
                opacityStart,
                opacityMid,
                opacityEnd,
                opacityMidPosition,
                position,
            );
            const amplitude = interpolateValue(
                amplitudeStart,
                amplitudeMid,
                amplitudeEnd,
                amplitudeMidPosition,
                position,
            );
            const noiseFactor = interpolateValue(
                noiseStart,
                noiseMid,
                noiseEnd,
                noiseMidPosition,
                position,
            );
            for (let x = 0; x < width; x++) {
                const distanceToMid = Math.abs(x - width / 2);
                const midNoiseFactor =
                    (1 - distanceToMid / (width / 2)) * 0.5 * noiseFactor;
                const midY = height / 2;
                const y =
                    midY +
                    noise2D(x * noiseScale, 0) * amplitude * midNoiseFactor;
                path += `${x},${y} `;
            }
            return {
                id: `line-gradient-${lineIndex}`,
                path: path.trim(),
                opacity: opacity,
            };
        });
        setLines(newLines);
    }, [
        seed,
        numLines,
        width,
        height,
        noiseScale,
        opacityStart,
        opacityMid,
        opacityEnd,
        opacityMidPosition,
        noiseStart,
        noiseMid,
        noiseEnd,
        noiseMidPosition,
        amplitudeStart,
        amplitudeMid,
        amplitudeEnd,
        amplitudeMidPosition,
    ]);
    return (
        <svg
            width={width}
            height={height}
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                zIndex: 0,
                cursor: 'default',
            }} // Positioned behind other content
        >
            <defs>
                {lines.map(({ id }) => (
                    <linearGradient
                        key={id}
                        id={id}
                        x1='0%'
                        y1='0%'
                        x2='-100%'
                        y2='0%'
                    >
                        <stop offset='0%' stopColor='#7371FC' stopOpacity='0' />
                        <stop
                            offset='50%'
                            stopColor='#7371FC'
                            stopOpacity='1'
                        />
                        <stop
                            offset='100%'
                            stopColor='#7371FC'
                            stopOpacity='0'
                        />
                    </linearGradient>
                ))}
            </defs>
            {lines.map(({ path, opacity, id }, index) => (
                <polyline
                    key={index}
                    fill='none'
                    stroke={`url(#${id})`}
                    strokeWidth='1'
                    points={path}
                    style={{ opacity: opacity }}
                />
            ))}
        </svg>
    );
};
export default NoisyLinesAnimatedGradient;
