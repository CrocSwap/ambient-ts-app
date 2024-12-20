import React, { useEffect } from 'react';
import FadingText from './FadingText';
import fadingTextData from './fadingTextData.json';

interface FadingTextItem {
    text: string;
    fadeInDelay: number;
    fadeInTime: number;
    fadeOutDelay: number;
    fadeOutTime: number;
    color: string;
}

const FadingTextGrid: React.FC<{ onAnimationComplete?: () => void }> = ({
    onAnimationComplete,
}) => {
    useEffect(() => {
        // Calculate the longest duration based on fadeIn and fadeOut delays and times
        const longestDuration = Math.max(
            ...(fadingTextData as FadingTextItem[]).map(
                (item) =>
                    item.fadeInDelay +
                    item.fadeInTime +
                    item.fadeOutDelay +
                    item.fadeOutTime,
            ),
        );

        // Set a timeout to call onAnimationComplete after the longest animation finishes
        const timer = setTimeout(() => {
            if (onAnimationComplete) onAnimationComplete();
        }, longestDuration);

        return () => clearTimeout(timer); // Cleanup on component unmount
    }, [onAnimationComplete]);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(11, 1fr)',
                gridTemplateRows: 'repeat(11, 1fr)',
                gap: '10px',
                position: 'relative',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
            }}
        >
            {(fadingTextData as FadingTextItem[]).map((item, index) => (
                <FadingText
                    key={index}
                    text={item.text}
                    fadeInDelay={item.fadeInDelay}
                    fadeInTime={item.fadeInTime}
                    fadeOutDelay={item.fadeOutDelay}
                    fadeOutTime={item.fadeOutTime}
                    color={item.color}
                    fontSize='24px'
                />
            ))}

            <div
                style={{
                    gridColumn: '5 / span 1',
                    gridRow: '6 / span 1',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <FadingText
                    text={'FU'}
                    fadeInDelay={2000}
                    fadeInTime={0}
                    fadeOutDelay={8000}
                    fadeOutTime={0}
                    color='#AACFD1'
                    fontSize='24px'
                />
            </div>

            <div
                style={{
                    gridColumn: '6 / span 1',
                    gridRow: '6 / span 1',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <FadingText
                    text={'/'}
                    fadeInDelay={3500}
                    fadeInTime={0}
                    fadeOutDelay={6500}
                    fadeOutTime={0}
                    color='#AACFD1'
                    fontSize='24px'
                />
            </div>

            <div
                style={{
                    gridColumn: '7 / span 1',
                    gridRow: '6 / span 1',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <FadingText
                    text={'TA'}
                    fadeInDelay={5000}
                    fadeInTime={0}
                    fadeOutDelay={5000}
                    fadeOutTime={0}
                    color='#AACFD1'
                    fontSize='24px'
                />
            </div>
        </div>
    );
};

export default FadingTextGrid;
