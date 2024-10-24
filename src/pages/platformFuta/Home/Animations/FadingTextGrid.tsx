import React from 'react';
import fadingTextData from './fadingTextData.json';
import FadingText from './FadingText';

interface FadingTextItem {
    text: string;
    fadeInDelay: number;
    fadeInTime: number;
    fadeOutDelay: number;
    fadeOutTime: number;
    color: string;
}

const FadingTextGrid: React.FC = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)',
            gridTemplateRows: 'repeat(11, 1fr)',
            gap: '10px', // Adjust gap if needed
            position: 'relative', // Required for absolute positioning of centered elements
            height: '500px', // Adjust height as needed
            width: '1200px', // Adjust width as needed
        }}>
            {(fadingTextData as FadingTextItem[]).map((item, index) => (
                <FadingText
                    key={index}
                    text={item.text}
                    fadeInDelay={item.fadeInDelay}
                    fadeInTime={item.fadeInTime}
                    fadeOutDelay={item.fadeOutDelay}
                    fadeOutTime={item.fadeOutTime}
                    color={item.color}
                    fontSize="24px" // Keep main font size at 24px
                />
            ))}

            <div style={{
                gridColumn: '5 / span 1', // Centering the group (adjust as needed)
                gridRow: '6 / span 1',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute', // Absolute positioning to center within the grid
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // Center the div
            }}>
                <FadingText
                    text={'FU'}
                    fadeInDelay={2000}
                    fadeInTime={0}
                    fadeOutDelay={8000}
                    fadeOutTime={0}
                    color="#AACFD1"
                    fontSize="24px" // Keep main font size at 24px
                />
            </div>

            <div style={{
                gridColumn: '6 / span 1', // Centering the group (adjust as needed)
                gridRow: '6 / span 1',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute', // Absolute positioning to center within the grid
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // Center the div
            }}>
                <FadingText
                    text={'/'}
                    fadeInDelay={3500}
                    fadeInTime={0}
                    fadeOutDelay={6500}
                    fadeOutTime={0}
                    color="#AACFD1"
                    fontSize="24px" // Keep main font size at 24px
                />
            </div>

            <div style={{
                gridColumn: '7 / span 1', // Centering the group (adjust as needed)
                gridRow: '6 / span 1',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute', // Absolute positioning to center within the grid
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // Center the div
            }}>
                <FadingText
                    text={'TA'}
                    fadeInDelay={5000}
                    fadeInTime={0}
                    fadeOutDelay={5000}
                    fadeOutTime={0}
                    color="#AACFD1"
                    fontSize="24px" // Keep main font size at 24px
                />
            </div>
        </div>
    );
};

export default FadingTextGrid;
