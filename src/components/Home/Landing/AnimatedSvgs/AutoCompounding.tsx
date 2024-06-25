import React from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
function AutoCompounding() {
    const smallScreen = useMediaQuery('(max-width: 500px)');
    const desktopScreen = useMediaQuery('(min-width: 1080px)');

    const marginTop = desktopScreen ? '0px' : '8rem';

    const scaleSize = smallScreen ? 0.3 : 0.45;
    // Define the starting and ending positions of each dot
    const dots = [
        { startX: 295.197, startY: 119.86, endX: 303.307, endY: 439.844 },
        { startX: 328.428, startY: 126.763, endX: 392.055, endY: 695.491 },
        { startX: 305.197, startY: 143.611, endX: 661.461, endY: 544.941 },
        { startX: 350.602, startY: 153.611, endX: 286.811, endY: 564.263 },
        { startX: 328.428, startY: 167.121, endX: 382.055, endY: 539.941 },
        { startX: 461.225, startY: 223.853, endX: 484.732, endY: 493.34 },
        { startX: 392.775, startY: 156.935, endX: 479.732, endY: 653.661 },
        { startX: 380.354, startY: 179.926, endX: 575.154, endY: 597.796 },
        { startX: 358.594, startY: 196.114, endX: 392.055, endY: 462.41 },
        { startX: 423.721, startY: 169.926, endX: 355.387, endY: 636.142 },
        { startX: 409.674, startY: 186.701, endX: 436.314, endY: 597.796 },
        { startX: 389.131, startY: 213.853, endX: 549.32, endY: 564.263 },
        { startX: 375.354, startY: 235.168, endX: 360.691, endY: 498.34 },
        { startX: 401.568, startY: 254.453, endX: 570.154, endY: 526 },
        { startX: 426.768, startY: 231.5, endX: 527.264, endY: 618.823 },
        { startX: 436.768, startY: 206.114, endX: 503.74, endY: 536 },
        { startX: 463.211, startY: 196.114, endX: 377.055, endY: 597.796 },
        { startX: 498.871, startY: 220.168, endX: 414.57, endY: 646.142 },
        { startX: 470.217, startY: 245.168, endX: 419.57, endY: 516 },
        { startX: 438.396, startY: 264.453, endX: 601.273, endY: 559.263 },
        { startX: 456.225, startY: 289.423, endX: 474.732, endY: 574.263 },
        { startX: 491.684, startY: 285.769, endX: 414.57, endY: 574.263 },
        { startX: 508.871, startY: 259.453, endX: 436.314, endY: 483.34 },
        { startX: 538.645, startY: 238.822, endX: 474.732, endY: 623.823 },
        { startX: 571.869, startY: 261.635, endX: 324.248, endY: 597.796 },
        { startX: 540.131, startY: 284.423, endX: 350.691, endY: 564.263 },
        { startX: 503.871, startY: 311.926, endX: 334.248, endY: 472.41 },
        { startX: 360.602, startY: 131.763, endX: 355.387, endY: 452.41 },
    ];
    const totalAnimationDuration = 10; // Total duration for the sequence to repeat
    const dotAnimationTime = 2; // Duration of each dot's movement
    const numberOfDots = dots.length;
    const delayIncrement =
        (totalAnimationDuration - dotAnimationTime) / numberOfDots;
    // Pre-calculate percentage points for keyframe timing
    const calculatePercentage = (time: number) =>
        ((time / totalAnimationDuration) * 100).toFixed(2);
    const keyframes = dots
        .map((dot, index) => {
            const startDelay = parseFloat((index * delayIncrement).toFixed(2));
            const visibleStart = calculatePercentage(startDelay + 0.1); // slightly after delay to start fading in
            const visibleEnd = calculatePercentage(
                startDelay + dotAnimationTime - 1,
            ); // just before the animation ends to start fading out
            const fadeOut = calculatePercentage(
                startDelay + dotAnimationTime + 1,
            );
            return `
            @keyframes moveDot${index} {
                0%, ${visibleStart}%{
                    transform: translate(0px, 0px);
                    opacity: 0;
                }
                ${visibleEnd}% {
                    transform: translate(${dot.endX - dot.startX}px, ${
                dot.endY - dot.startY
            }px);
                    opacity: 1;
                }
                ${fadeOut}% {
                    opacity: 0;
                }
                100% {
                    transform: translate(${dot.endX - dot.startX}px, ${
                dot.endY - dot.startY
            }px);
                    opacity: 0;
                }
            }
        `;
        })
        .join('');
    return (
        <div
            style={{
                width: '100%',
                position: 'relative',
                transform: `scale(${scaleSize})`,
                marginTop: marginTop,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    width: '728px',
                    height: '420px',
                    animation: 'animateShape8 10s infinite ease-in-out',
                }}
            >
                <style>
                    {`@keyframes animateShape8 {
                    0%, 10%, 90%, 100% { top: 321px; left: 0px;}
                    40%, 60% { top: 321px;  left: 0px;}
                }`}
                </style>
                <svg
                    width='728'
                    height='420'
                    viewBox='0 0 728 420'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <g clipPath='url(#clip0_637_22681)'>
                        <mask id='path-1-inside-1_637_22681' fill='white'>
                            <path d='M34.641 230C15.5093 218.954 15.5093 201.046 34.641 190L329.09 20C348.221 8.9543 379.24 8.95431 398.372 20L692.82 190C711.952 201.046 711.952 218.954 692.82 230L398.372 400C379.24 411.046 348.221 411.046 329.09 400L34.641 230Z' />
                        </mask>
                        <path
                            d='M34.641 230C15.5093 218.954 15.5093 201.046 34.641 190L329.09 20C348.221 8.9543 379.24 8.95431 398.372 20L692.82 190C711.952 201.046 711.952 218.954 692.82 230L398.372 400C379.24 411.046 348.221 411.046 329.09 400L34.641 230Z'
                            fill='white'
                            fillOpacity='0.1'
                        />
                        <path
                            d='M359.791 224.043C387.088 208.283 251.052 126.59 288.927 104.724C322.826 85.1533 597.642 212.881 703.161 212.09C704.003 216.702 702.759 219.724 698.912 225.537L392.102 402.673C385.503 405.107 382.282 405.962 377.181 406.823C393.895 363.619 243.407 239.162 263.511 227.555C285.349 214.947 332.494 239.802 359.791 224.043Z'
                            fill='#7371FC'
                            fillOpacity='0.35'
                        >
                            <animate
                                attributeName='fill'
                                values='#8B98A5; #7371FC; #8B98A5'
                                keyTimes='0; 0.9; 1'
                                dur='10s'
                                repeatCount='indefinite'
                            />
                        </path>
                    </g>
                    <path
                        d='M27.7128 234C8.10282 222.678 8.10282 204.322 27.7128 193L328.224 19.5C347.834 8.17816 379.628 8.17816 399.238 19.5L397.506 20.5C378.852 9.73045 348.609 9.73045 329.956 20.5L35.507 190.5C20.2017 199.337 22.9158 215.23 41.5692 226L27.7128 234ZM699.749 193C719.359 204.322 719.359 222.678 699.749 234L405.3 404C382.342 417.255 345.119 417.255 322.161 404L336.018 396C351.323 404.837 376.138 404.837 391.443 396L685.892 226C704.546 215.23 707.26 199.337 691.954 190.5L699.749 193ZM405.3 404C382.342 417.255 345.119 417.255 322.161 404L27.7128 234C8.10282 222.678 8.10282 204.322 27.7128 193L35.507 190.5C20.2017 199.337 22.9158 215.23 41.5692 226L336.018 396C351.323 404.837 376.138 404.837 391.443 396L405.3 404ZM328.224 19.5C347.834 8.17816 379.628 8.17816 399.238 19.5L699.749 193C719.359 204.322 719.359 222.678 699.749 234L685.892 226C704.546 215.23 707.26 199.337 691.954 190.5L397.506 20.5C378.852 9.73045 348.609 9.73045 329.956 20.5L328.224 19.5Z'
                        fill='#7371FC'
                        mask='url(#path-1-inside-1_637_22681)'
                    />
                    <defs>
                        <clipPath id='clip0_637_22681'>
                            <path
                                d='M34.641 230C15.5093 218.954 15.5093 201.046 34.641 190L329.09 20C348.221 8.9543 379.24 8.95431 398.372 20L692.82 190C711.952 201.046 711.952 218.954 692.82 230L398.372 400C379.24 411.046 348.221 411.046 329.09 400L34.641 230Z'
                                fill='white'
                            />
                        </clipPath>
                    </defs>
                </svg>
            </div>
            <div
                style={{
                    position: 'absolute',
                    width: '728px',
                    height: '741px',
                    top: '0px',
                    left: '0px',
                }}
            >
                <style>
                    {`
                ${keyframes}
                .dot {
                    animation: ${totalAnimationDuration}s infinite;
                    filter: drop-shadow(0 0 8px rgba(115, 113, 252, 1));
                }
                `}
                </style>
                <svg
                    width='728'
                    height='741'
                    viewBox='0 0 728 741'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    {dots.map((dot, index) => (
                        <ellipse
                            key={index}
                            cx={dot.startX}
                            cy={dot.startY}
                            rx='5'
                            ry='5'
                            fill='#7371FC'
                            className='dot'
                            style={{
                                animationName: `moveDot${index}`,
                            }}
                        />
                    ))}
                </svg>
            </div>
            <div
                style={{
                    position: 'absolute',
                    width: '728px',
                    height: '420px',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    clipPath: 'url(#clip0_637_22680)',
                    animation: 'animateShape9 10s infinite ease-in-out',
                }}
            >
                <style>
                    {`@keyframes animateShape9 {
                    0%, 10%, 90%, 100% { top: 0px; left: 0px;}
                    40%, 60% { top: 0px;  left: 0px;}
                }`}
                </style>
                <svg
                    width='728'
                    height='420'
                    viewBox='0 0 728 420'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <g clipPath='url(#clip0_637_22680)'>
                        <mask id='path-1-inside-1_637_22680' fill='white'>
                            <path d='M34.641 230C15.5093 218.954 15.5093 201.046 34.641 190L329.09 20C348.221 8.9543 379.24 8.95431 398.372 20L692.82 190C711.952 201.046 711.952 218.954 692.82 230L398.372 400C379.24 411.046 348.221 411.046 329.09 400L34.641 230Z' />
                        </mask>
                        <path
                            d='M34.641 230C15.5093 218.954 15.5093 201.046 34.641 190L329.09 20C348.221 8.9543 379.24 8.95431 398.372 20L692.82 190C711.952 201.046 711.952 218.954 692.82 230L398.372 400C379.24 411.046 348.221 411.046 329.09 400L34.641 230Z'
                            fill='white'
                            fillOpacity='0.1'
                        />
                        <path
                            d='M368.858 124.241C483.418 159.404 678.023 238.544 727.462 210L622.43 270.641L368.858 124.241Z'
                            fill='#8B98A5'
                            fillOpacity='0.35'
                        />
                        <path
                            d='M339.082 193.082C309.706 163.18 262.365 124.522 286.792 110.42C296.81 104.636 327.657 111.594 368.856 124.24L622.428 270.639L547.921 313.656L339.082 193.082Z'
                            fill='#7371FC'
                            fillOpacity='0.35'
                        />
                        <path
                            d='M356.29 228.949C365.982 223.353 355.255 209.545 339.082 193.082L547.92 313.655L506.956 337.306L328.662 234.367C338.786 234.701 348.357 233.529 356.29 228.949Z'
                            fill='#7371FC'
                            fillOpacity='0.35'
                        />
                        <path
                            d='M339.082 193.082C309.706 163.18 262.365 124.522 286.792 110.42C296.81 104.636 327.657 111.594 368.856 124.24L622.428 270.639L547.921 313.656L339.082 193.082Z'
                            fill='#7371FC'
                            fillOpacity='0.35'
                        />
                        <path
                            d='M356.29 228.949C365.982 223.353 355.255 209.545 339.082 193.082L547.92 313.655L506.956 337.306L328.662 234.367C338.786 234.701 348.357 233.529 356.29 228.949Z'
                            fill='#7371FC'
                            fillOpacity='0.35'
                        />
                        <path
                            d='M363.728 419.999C415.934 389.858 238.616 245.326 260.453 232.718C275.945 223.774 303.949 233.554 328.662 234.368L506.956 337.306L363.728 419.999Z'
                            fill='#8B98A5'
                            fillOpacity='0.35'
                        />
                    </g>
                    <path
                        d='M27.7128 234C8.10282 222.678 8.10282 204.322 27.7128 193L328.224 19.5C347.834 8.17816 379.628 8.17816 399.238 19.5L397.506 20.5C378.852 9.73045 348.609 9.73045 329.956 20.5L35.507 190.5C20.2017 199.337 22.9158 215.23 41.5692 226L27.7128 234ZM699.749 193C719.359 204.322 719.359 222.678 699.749 234L405.3 404C382.342 417.255 345.119 417.255 322.161 404L336.018 396C351.323 404.837 376.138 404.837 391.443 396L685.892 226C704.546 215.23 707.26 199.337 691.954 190.5L699.749 193ZM405.3 404C382.342 417.255 345.119 417.255 322.161 404L27.7128 234C8.10282 222.678 8.10282 204.322 27.7128 193L35.507 190.5C20.2017 199.337 22.9158 215.23 41.5692 226L336.018 396C351.323 404.837 376.138 404.837 391.443 396L405.3 404ZM328.224 19.5C347.834 8.17816 379.628 8.17816 399.238 19.5L699.749 193C719.359 204.322 719.359 222.678 699.749 234L685.892 226C704.546 215.23 707.26 199.337 691.954 190.5L397.506 20.5C378.852 9.73045 348.609 9.73045 329.956 20.5L328.224 19.5Z'
                        fill='#7371FC'
                        mask='url(#path-1-inside-1_637_22680)'
                    />
                    <defs>
                        <clipPath id='clip0_637_22680'>
                            <path
                                d='M34.641 230C15.5093 218.954 15.5093 201.046 34.641 190L329.09 20C348.221 8.9543 379.24 8.95431 398.372 20L692.82 190C711.952 201.046 711.952 218.954 692.82 230L398.372 400C379.24 411.046 348.221 411.046 329.09 400L34.641 230Z'
                                fill='white'
                            />
                        </clipPath>
                    </defs>
                </svg>
            </div>
        </div>
    );
}
export default AutoCompounding;
