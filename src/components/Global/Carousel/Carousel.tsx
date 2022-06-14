import styles from './Carousel.module.css';
import React, { cloneElement, useState, useEffect } from 'react';

interface CarouselProps {
    children?: React.ReactNode;
}

// interface CarouselItemProps {
//     children: React.ReactNode;
//     width?: number | string;
// }

// export const CarouselItem = (props: CarouselItemProps) => {
//     const { children, width } = props;
//     return (
//         <div className={styles.carousel_item} style={{ width: width }}>
//             {children}
//         </div>
//     );
// };

export default function Carousel(props: CarouselProps) {
    const { children } = props;
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const updateIndex = (newIndex: number) => {
        if (newIndex < 0) {
            newIndex = React.Children.count(children) - 1;
        } else if (newIndex >= React.Children.count(children)) {
            newIndex = 0;
        }

        setActiveIndex(newIndex);
    };

    // auto carousel
    useEffect(() => {
        const interval = setInterval(() => {
            if (!paused) {
                updateIndex(activeIndex + 1);
            }
        }, 4000);

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    });

    const triggerButtons = (
        <div className={styles.indicators}>
            <button
                onClick={() => {
                    updateIndex(activeIndex - 1);
                }}
            >
                Prev
            </button>
            {React.Children.map(children, (child, index) => {
                return (
                    <button
                        className={`${index === activeIndex ? styles.active : ''}`}
                        onClick={() => {
                            updateIndex(index);
                        }}
                    >
                        {index + 1}
                    </button>
                );
            })}
            <button
                onClick={() => {
                    updateIndex(activeIndex + 1);
                }}
            >
                Next
            </button>
        </div>
    );

    return (
        <div
            className={styles.carousel}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                className={styles.inner}
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {React.Children.map(children, (child) =>
                    // eslint-disable-next-line
                    cloneElement(child as React.ReactElement<any>, { width: '100%' }),
                )}
            </div>
            {triggerButtons}
        </div>
    );
}
