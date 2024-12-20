import p5 from 'p5';
import { useEffect, useRef } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
interface PropsIF {
    hasVideoPlayedOnce: boolean;
    isCreatePage?: boolean;
}
export default function SynthwaveGrid(props: PropsIF) {
    const { hasVideoPlayedOnce, isCreatePage } = props;
    const sketchRef = useRef<HTMLDivElement | null>(null);

    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const width = '100vw';
    const height = showMobileVersion ? 'calc(100svh)' : '100vh';
    const initialFrameSkip = hasVideoPlayedOnce ? 700 : 0; // Assume 60 FPS, so 5 seconds * 60 = 300 frames

    useEffect(() => {
        const sketch = (p: p5) => {
            // Size properties
            const width = window.innerWidth;
            const height = window.innerHeight - 5;

            // Camera properties
            const cameraX = 0;
            const cameraY = 220;
            const cameraZ = 300;
            const cameraRotate = 2.0;
            const moveSpeed = isCreatePage ? 1 : 3; // Speed at which the grid moves towards the camera

            // Grid properties
            const scl = 40; // Scale of each grid cell
            const cols = 50; // Number of columns in the grid
            const rows = 18; // Number of rows in the grid
            const w = cols * scl; // Width of the grid based on number of columns
            const h = rows * scl; // Height of the grid based on number of rows

            // Noise properties
            const noiseScale = 1; // Scale of the noise field increment
            const noiseFieldScale = 0.5; // Scale for the noise field itself
            const maxNoiseIntensity = 100; // Maximum noise intensity
            const noiseIncrement = 5; // Noise increment value

            // Delay properties
            const noiseDelayFrames = 200; // Number of frames to delay before starting noise increase
            const opacityDelayFrames = 200; // Number of frames to delay before starting opacity increase
            const dotOpacityDelayFrames = 0; // Number of frames to delay dots after max opacity is reached
            const dotFadeInDelayFrames = 120; // Number of frames to delay before starting dot fade in

            // Opacity properties
            const opacityIncrement = 2; // Increment value for opacity
            const dotOpacityIncrement = 2; // Increment value for dots' opacity increase
            const fadeStart = (rows - 15) * scl; // Z distance to start fading based on number of rows
            const fadeEnd = (rows - 2) * scl; // Z distance where the fade ends based on number of rows

            // Dot properties
            const maxDotOpacity = 200; // Maximum opacity for dots
            const dotStrokeWeight = 2; // Stroke weight for the dots

            // Plane properties
            const planeStrokeWeight = 1; // Stroke weight for the planes

            // Color properties
            const gridColorHex = '#62EBF1'; // Grid color in hex
            const planeColorHex = '#102123'; // Plane color in hex
            const dotColorHex = '#62EBF1'; // Dot color in hex

            // Convert hex color to RGB
            const hexToRgb = (hex: string) => {
                const bigint = parseInt(hex.slice(1), 16);
                return {
                    r: (bigint >> 16) & 255,
                    g: (bigint >> 8) & 255,
                    b: bigint & 255,
                };
            };

            const gridColor = hexToRgb(gridColorHex);
            const planeColor = hexToRgb(planeColorHex);
            const dotColor = hexToRgb(dotColorHex);

            // Noise intensity points
            const noisePointsX = [
                { x: 0, intensity: 0 },
                { x: 0.1, intensity: 400 },
                { x: 0.4, intensity: 100 },
                { x: 0.45, intensity: 0 },
                { x: 0.55, intensity: 0 },
                { x: 0.6, intensity: 100 },
                { x: 0.9, intensity: 400 },
                { x: 1, intensity: 0 },
            ]; // Noise intensity points for X direction

            const noisePointsY = [
                { y: 0, intensity: 0 },
                { y: 1, intensity: 1 },
            ]; // Noise intensity points for Y direction

            // Initial states
            const grid: number[][] = [];
            const skipAnimation = true; // Set this flag to control skipping
            // Set initial values based on the skipAnimation flag
            let zOffset: number,
                yOffset: number,
                currentNoiseIntensityX: number,
                currentNoiseIntensityY: number,
                maxOpacity: number,
                frameCounter: number,
                dotOpacityCounter: number,
                currentDotOpacity: number;

            if (skipAnimation) {
                zOffset = 0;
                yOffset = 1;
                currentNoiseIntensityX = 0;
                currentNoiseIntensityY = 0;
                maxOpacity =
                    initialFrameSkip > opacityDelayFrames
                        ? (initialFrameSkip - opacityDelayFrames) *
                          opacityIncrement
                        : 0;
                frameCounter = initialFrameSkip;
                dotOpacityCounter = 0;
                currentDotOpacity = 0;
            } else {
                zOffset = 0;
                yOffset = 1;
                currentNoiseIntensityX = 0;
                currentNoiseIntensityY = 0;
                maxOpacity = 0;
                frameCounter = 0;
                dotOpacityCounter = 0;
                currentDotOpacity = 0;
            }

            const interpolateNoiseIntensityX = (x: number) => {
                let lowerPoint, upperPoint;
                for (let i = 0; i < noisePointsX.length - 1; i++) {
                    if (x >= noisePointsX[i].x && x <= noisePointsX[i + 1].x) {
                        lowerPoint = noisePointsX[i];
                        upperPoint = noisePointsX[i + 1];
                        break;
                    }
                }
                if (lowerPoint && upperPoint) {
                    const t =
                        (x - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
                    return p.lerp(
                        lowerPoint.intensity,
                        upperPoint.intensity,
                        t,
                    );
                }
                return 0; // Default intensity if no points found
            };

            p.setup = () => {
                p.createCanvas(width, height, p.WEBGL);
                p.clear(); // Clear the canvas instead of setting a background color
                p.windowResized = () => {
                    p.resizeCanvas(window.innerWidth, window.innerHeight - 5);
                };

                for (let y = 0; y < rows; y++) {
                    const row: number[] = [];
                    for (let x = 0; x < cols; x++) {
                        row.push(0); // Initialize grid with no noise
                    }
                    grid.push(row);
                }
            };

            const addNewRow = () => {
                grid.shift(); // Remove the oldest row
                const newRow: number[] = [];
                yOffset += noiseScale; // Increment the offset for noise to maintain continuity
                for (let x = 0; x < cols; x++) {
                    const xRatio = x / cols; // Normalized x position (0 to 1)
                    const baseNoiseIntensityX =
                        interpolateNoiseIntensityX(xRatio);
                    const noiseIntensityX =
                        (baseNoiseIntensityX * currentNoiseIntensityX) / 100; // Scale noise intensity for X
                    const noiseValue =
                        p.noise(
                            x * noiseFieldScale,
                            (rows + yOffset) * noiseFieldScale,
                        ) * noiseIntensityX; // Generate new noise values from the initial noise field

                    newRow.push(noiseValue); // Add the noise value to the new row
                }
                grid.push(newRow); // Add the new row at the back

                // Update noise intensity for Y direction
                for (let y = 0; y < rows; y++) {
                    for (const point of noisePointsY) {
                        if (y === point.y) {
                            grid[y] = grid[y].map(
                                (value) => value * point.intensity,
                            );
                        }
                    }
                }

                // Increment noise intensity only after noise delay
                if (frameCounter > noiseDelayFrames) {
                    if (currentNoiseIntensityX < maxNoiseIntensity) {
                        currentNoiseIntensityX += noiseIncrement; // Increase noise intensity for X
                        if (currentNoiseIntensityX > maxNoiseIntensity) {
                            currentNoiseIntensityX = maxNoiseIntensity; // Cap noise intensity at max value
                        }
                    }
                    if (currentNoiseIntensityY < maxNoiseIntensity) {
                        currentNoiseIntensityY += noiseIncrement; // Increase noise intensity for Y
                        if (currentNoiseIntensityY > maxNoiseIntensity) {
                            currentNoiseIntensityY = maxNoiseIntensity; // Cap noise intensity at max value
                        }
                    }
                }

                // Increment opacity only after opacity delay
                if (frameCounter > opacityDelayFrames) {
                    if (maxOpacity < 255) {
                        maxOpacity += opacityIncrement; // Increase opacity
                        if (maxOpacity > 255) {
                            maxOpacity = 255; // Cap opacity at max value
                        }
                    }
                }

                if (maxOpacity === 255) {
                    dotOpacityCounter++;
                }

                // console.log("New row z position:", -zOffset); // Log the z-axis position of the new row
            };

            p.draw = () => {
                // p.frameRate(8)
                p.clear(); // Clear the canvas instead of setting a background color

                p.push();
                p.translate(cameraX, cameraY, cameraZ); // Raise the grid a little so it's centered better
                p.rotateX(p.PI / cameraRotate); // Rotate to get a better 3D perspective

                p.rotateZ(p.PI);
                p.translate(-w / 2, -h / 2 + zOffset); // Translate to center the grid

                // Increment dot opacity
                if (
                    frameCounter > dotFadeInDelayFrames &&
                    currentDotOpacity < maxDotOpacity
                ) {
                    currentDotOpacity += dotOpacityIncrement;
                    if (currentDotOpacity > maxDotOpacity) {
                        currentDotOpacity = maxDotOpacity; // Cap dot opacity at max value
                    }
                }

                for (let y = 0; y < rows - 1; y++) {
                    for (let x = 0; x < cols; x++) {
                        const zPos = y * scl + zOffset;

                        // Calculate alpha based on zPos for dots
                        let alpha = currentDotOpacity;
                        if (zPos > fadeStart && zPos < fadeEnd) {
                            alpha = p.map(
                                zPos,
                                fadeStart,
                                fadeEnd,
                                currentDotOpacity,
                                0,
                            );
                        } else if (zPos <= fadeStart) {
                            alpha = currentDotOpacity;
                        } else {
                            alpha = 0;
                        }

                        if (
                            maxOpacity < 100 ||
                            dotOpacityCounter < dotOpacityDelayFrames
                        ) {
                            // Display points when opacity is below 100 or within the dot opacity delay
                            const pointAlpha = p.map(
                                maxOpacity,
                                0,
                                100,
                                alpha,
                                0,
                            );
                            p.stroke(
                                dotColor.r,
                                dotColor.g,
                                dotColor.b,
                                pointAlpha,
                            );
                            p.strokeWeight(dotStrokeWeight);
                            p.point(x * scl, y * scl, grid[y][x]);
                        }
                    }
                }

                for (let y = 0; y < rows - 1; y++) {
                    p.beginShape(p.TRIANGLE_STRIP);
                    for (let x = 0; x < cols; x++) {
                        const zPos = y * scl + zOffset;

                        // Calculate alpha based on zPos for planes
                        let alpha = maxOpacity;
                        if (zPos > fadeStart && zPos < fadeEnd) {
                            alpha = p.map(
                                zPos,
                                fadeStart,
                                fadeEnd,
                                maxOpacity,
                                0,
                            );
                        } else if (zPos <= fadeStart) {
                            alpha = maxOpacity;
                        } else {
                            alpha = 0;
                        }

                        if (maxOpacity > 0) {
                            // Display full grid with opacity adjustments when opacity is above 0
                            p.stroke(
                                gridColor.r,
                                gridColor.g,
                                gridColor.b,
                                alpha,
                            ); // Set stroke color with alpha
                            p.strokeWeight(planeStrokeWeight); // Set stroke weight for planes
                            p.fill(
                                planeColor.r,
                                planeColor.g,
                                planeColor.b,
                                alpha,
                            ); // Set fill color with alpha
                            p.vertex(x * scl, y * scl, grid[y][x]);
                            p.vertex(x * scl, (y + 1) * scl, grid[y + 1][x]);
                        }
                    }
                    p.endShape();
                }

                p.pop();

                // Move the grid
                zOffset -= moveSpeed;
                if (zOffset <= -scl) {
                    zOffset = 0;
                    addNewRow();
                }

                frameCounter++; // Increment frame counter
            };
        };

        const myP5 = new p5(sketch, sketchRef.current as HTMLElement);
        return () => {
            myP5.remove();
        };
    }, []);

    return (
        <div
            ref={sketchRef}
            style={{
                position: 'absolute',
                top: isCreatePage
                    ? '70px'
                    : showMobileVersion
                      ? '-100px'
                      : hasVideoPlayedOnce
                        ? '100px'
                        : '0',
                left: '0',
                width: width,
                height: height,
                opacity: hasVideoPlayedOnce ? '0.5' : '1',
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        ></div>
    );
}
