import { useEffect, useRef, useState } from 'react';
import Divider from '../Divider/FutaDivider';
import styles from './ConsoleComponent.module.css';

export default function ConsoleComponent() {
    const [isVisible, setIsVisible] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Trigger the animation after component mounts
        setIsVisible(true);

        // Set up intersection observer for scroll animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.visible);
                    }
                });
            },
            { threshold: 0.1 },
        );

        // Observe all action items
        const actionItems = contentRef.current?.querySelectorAll(
            `.${styles.actionItem}`,
        );
        actionItems?.forEach((item) => observer.observe(item));

        return () => {
            actionItems?.forEach((item) => observer.unobserve(item));
            observer.disconnect();
        };
    }, []);

    const auctionData = [
        { time: '01:51', action: 'AUCTION CREATED', ticker: 'DOGE' },
        { time: '01:51', action: 'AUCTION CREATED', ticker: 'PEPE' },
        { time: '01:51', action: 'NEW OPEN BID', ticker: 'USA' },
        { time: '01:51', action: 'AUCTION COMPLETE', ticker: 'NOT' },
        { time: '01:51', action: 'BID TRANSACTION CONFIRMED', ticker: 'BODEN' },
        { time: '01:51', action: 'CLAIM TRANSACTION CONFIRMED', ticker: '-' },
        { time: '01:51', action: 'AUCTION CREATED', ticker: 'TRUMP' },
        { time: '01:51', action: 'NEW OPEN BID', ticker: 'USA' },
        { time: '01:51', action: 'BID TRANSACTION CONFIRMED', ticker: 'USA' },
    ];
    return (
        <div className={styles.container}>
            <Divider count={2} />
            <h3>console</h3>
            <div
                ref={contentRef}
                className={`${styles.content} ${isVisible ? styles.visible : ''}`}
            >
                {[...auctionData, ...auctionData].map((item, index) => (
                    <div
                        className={styles.actionItem}
                        key={`${item.ticker}-${index}`}
                        style={
                            {
                                '--delay': `${index * 0.1}s`,
                            } as React.CSSProperties
                        }
                    >
                        <p>{item.time}</p>
                        <p
                            style={{
                                color: item.action
                                    .toLowerCase()
                                    .includes('confirmed')
                                    ? 'var(--accent1)'
                                    : 'var(--text1)',
                            }}
                        >
                            {item.action}
                        </p>
                        <p>{item.ticker}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
