import styles from './Carousel.module.css';
import React, { cloneElement, useState, useEffect } from 'react';
// import { HiArrowNarrowLeft, HiArrowNarrowRight} from 'react-icons/hi'

interface CarouselProps {
    children?: React.ReactNode;
}

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
            {/* <span
                onClick={() => {
                    updateIndex(activeIndex - 1);
                }}
            >
                <HiArrowNarrowLeft size={20}  color='#bdbdbd'/>
            </span> */}
            {React.Children.map(children, (child, index) => {
                return (
                    <div
                        className={`${index === activeIndex ? styles.active : ''}`}
                        onClick={() => {
                            updateIndex(index);
                        }}
                    >
                        <div className={styles.inner_circle}></div>
                    </div>
                );
            })}
            {/* <span
                onClick={() => {
                    updateIndex(activeIndex + 1);
                }}
            >
               <HiArrowNarrowRight size={20}  color='#bdbdbd'  />
            </span> */}
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
