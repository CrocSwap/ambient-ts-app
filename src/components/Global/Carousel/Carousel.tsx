// START: Import React and Dongles
import { cloneElement, Children, ReactElement, ReactNode, useState, useEffect } from 'react';

// START: Import Local Files
import styles from './Carousel.module.css';

// interface for React functional component props
interface CarouselPropsIF {
    children?: ReactNode;
}

// react functional component
export default function Carousel(props: CarouselPropsIF) {
    const { children } = props;
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const updateIndex = (newIndex: number) => {
        if (newIndex < 0) {
            newIndex = Children.count(children) - 1;
        } else if (newIndex >= Children.count(children)) {
            newIndex = 0;
        }
        setActiveIndex(newIndex);
    };

    // auto carousel
    useEffect(() => {
        const interval = setInterval(() => {
            !paused && updateIndex(activeIndex + 1);
        }, 30000);
        return () => interval && clearInterval(interval);
    });

    const triggerButtons = (
        <div className={styles.indicators}>
            {Children.map(children, (child, index) => {
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
                {Children.map(children, (child) =>
                    // eslint-disable-next-line
                    cloneElement(child as ReactElement<any>, { width: '100%' }),
                )}
            </div>
            {triggerButtons}
        </div>
    );
}
