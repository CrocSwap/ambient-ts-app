import React, { useState, useRef } from 'react';

const ScrollComponent = () => {
    const [enableInfScroll, setEnableInfScroll] = useState(false);
    const [items, setItems] = useState<string[]>(generateDummyData(20)); // dummy data
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const scrollDivRef = useRef<HTMLDivElement>(null);

    function generateDummyData(count: number): string[] {
        return Array.from({ length: count }, (_, i) => `Item ${i + 1}`);
    }

    const loadMoreData = () => {
        setIsFetching(true);

        setTimeout(() => {
            const newItems = generateDummyData(10);
            setItems((prevItems) => [...prevItems, ...newItems]);
            setIsFetching(false);
        }, 1500);
    };

    const handleScroll = () => {
        if (scrollDivRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                scrollDivRef.current;
            console.log('Scroll Position:', scrollTop);

            // Check if I scrolled to the bottom
            if (scrollTop + clientHeight >= scrollHeight && !isFetching) {
                console.log('User reached the bottom');
                loadMoreData();
            }
        }
    };

    const containerStyle = {
        overflowY: 'scroll' as const,
        height: '400px',
        border: '1px solid black',
        padding: '10px',
        background: 'var(--dark2)',
        margin: '1rem 0',
    };

    const itemStyle = {
        padding: '10px',
        borderBottom: '1px solid gray',
        background: 'var(--dark3)',
        margin: '8px 0',
    };

    const statusStyle = {
        padding: '10px',
        textAlign: 'center' as const,
    };

    return (
        <section>
            <button onClick={() => setEnableInfScroll(!enableInfScroll)}>
                {enableInfScroll
                    ? 'Disable Infinite Scroll'
                    : 'Enable Infinite Scroll'}
            </button>
            <div
                ref={scrollDivRef}
                onScroll={enableInfScroll ? handleScroll : undefined}
                style={containerStyle}
                className='custom_scroll_ambient'
            >
                <div>
                    {items.map((item, index) => (
                        <div key={index} style={itemStyle}>
                            {item}
                        </div>
                    ))}
                    <div style={statusStyle}>
                        {isFetching ? 'Fetching more...' : 'Updated'}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScrollComponent;
