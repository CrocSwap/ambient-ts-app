import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Toolbar.module.css';
import drawLine from '../../../../assets/images/icons/draw/draw_line.svg';
import drawCross from '../../../../assets/images/icons/draw/draw_cross.svg';
import drawRect from '../../../../assets/images/icons/draw/rect.svg';
import dprange from '../../../../assets/images/icons/draw/dprange.svg';
// import drawAngle from '../../../../assets/images/icons/draw/angle_line.svg';
import horizontalRay from '../../../../assets/images/icons/draw/horizontal_ray.svg';
import fibRetracement from '../../../../assets/images/icons/draw/fibonacci_retracement.svg';
import magnet from '../../../../assets/images/icons/draw/snap.svg';
import { ChartContext } from '../../../../contexts/ChartContext';
import trashIcon from '../../../../assets/images/icons/draw/delete.svg';
import { drawDataHistory } from '../../ChartUtils/chartUtils';
import { ArrowContainer } from '../../../../styled/Components/Chart';

interface ToolbarProps {
    activeDrawingType: string;
    setActiveDrawingType: React.Dispatch<React.SetStateAction<string>>;
    isToolbarOpen: boolean;
    setIsToolbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >;
    setIsMagnetActiveLocal: React.Dispatch<boolean>;
    deleteAllShapes: () => void;
    chartHeights: number;
    d3ContainerHeight: number;
}

interface IconList {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
}

function Toolbar(props: ToolbarProps) {
    const {
        activeDrawingType,
        setActiveDrawingType,
        isToolbarOpen,
        setIsToolbarOpen,
        setIsMagnetActiveLocal,
        deleteAllShapes,
        chartHeights,
        d3ContainerHeight,
    } = props;

    const { setIsMagnetActive, isMagnetActive, isFullScreen } =
        useContext(ChartContext);
    const feeRate = document.getElementById('fee_rate_chart');
    const tvl = document.getElementById('tvl_chart');

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const column = isToolbarOpen ? 38 : 9;

        if (feeRate) {
            feeRate.style.gridTemplateColumns =
                column + 'px auto 1fr auto minmax(1em, max-content)';
        }
        if (tvl) {
            tvl.style.gridTemplateColumns =
                column + 'px auto 1fr auto minmax(1em, max-content)';
        }
    }, [isToolbarOpen, feeRate, tvl]);

    const [isHoveredUp, setIsHoveredUp] = useState(false);
    const [isHoveredDown, setIsHoveredDown] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = () => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer && scrollContainer.scrollTop <= 5) {
            setIsHoveredUp(false);
        } else {
            setIsHoveredUp(true);
        }

        if (isAtBottom()) {
            setIsHoveredDown(false);
        } else {
            setIsHoveredDown(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHoveredUp(false);
        setIsHoveredDown(false);
    };

    function handleDrawModeChange(item: IconList) {
        if (item.label !== 'magnet') {
            setActiveDrawingType(item.label);
        }
    }

    const drawIconList: IconList[] = [
        {
            icon: drawCross,
            label: 'Cross',
        },
        {
            icon: drawLine,
            label: 'Brush',
        },
        // {
        //     icon: drawAngle,
        //     label: 'Angle',
        // },
        {
            icon: horizontalRay,
            label: 'Ray',
        },
        {
            icon: drawRect,
            label: 'Rect',
        },
        {
            icon: fibRetracement,
            label: 'FibRetracement',
        },
        {
            icon: dprange,
            label: 'DPRange',
        },
        // Add more icons here
    ];

    const indicatorIconList: IconList[] = [
        {
            icon: magnet,
            label: 'magnet',
        },
    ];

    function handleActivateIndicator(item: IconList) {
        if (item.label === 'magnet') {
            setIsMagnetActive({ value: !isMagnetActive.value });
            setIsMagnetActiveLocal(!isMagnetActive.value);
        }
    }

    const isAtBottom = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                scrollContainerRef.current;
            return scrollTop >= scrollHeight - clientHeight;
        }
        return false;
    };

    const handleScroll = (direction: string) => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer) {
            const scrollAmount = 100;

            if (direction === 'up') {
                scrollContainer.scrollTop -= scrollAmount;
            } else if (direction === 'down') {
                scrollContainer.scrollTop += scrollAmount;
            }

            if (scrollContainer.scrollTop <= 5) {
                setIsHoveredUp(false);
            } else {
                setIsHoveredUp(true);
            }

            if (isAtBottom()) {
                setIsHoveredDown(false);
            } else {
                setIsHoveredDown(true);
            }
        }
    };

    const upScroll = (
        <div
            className={styles.arrowContainer_container}
            style={{
                width: toolbarRef.current
                    ? `${toolbarRef.current.clientWidth + 7}px`
                    : 'auto',

                left: isFullScreen ? 8 : -8,
            }}
            onClick={() => handleScroll('up')}
        >
            <ArrowContainer degree={315} style={{ marginBottom: '1px' }} />
        </div>
    );

    const downScroll = (
        <div
            className={styles.arrowContainer_container}
            style={{
                bottom:
                    d3ContainerHeight -
                    chartHeights -
                    1 +
                    (isFullScreen ? 16 : 0) +
                    'px',
                position: 'absolute',
                width: toolbarRef.current
                    ? `${toolbarRef.current.clientWidth + 7}px`
                    : 'auto',
                left: isFullScreen ? 8 : -8,
            }}
            onClick={() => handleScroll('down')}
        >
            <ArrowContainer degree={135} style={{ marginTop: '3px' }} />
        </div>
    );

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const delta = e.deltaY;
        if (delta < 0) {
            handleScroll('up');
        } else {
            handleScroll('down');
        }
    };
    return (
        <div
            className={` ${
                isToolbarOpen ? styles.toolbar_container_active : ''
            } ${styles.toolbar_container} `}
            id='toolbar_container'
            ref={toolbarRef}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={` ${
                    isToolbarOpen ? styles.drawlist_container_active : ''
                } ${styles.drawlist_container} `}
            >
                <div
                    className={styles.scrollableDiv}
                    ref={scrollContainerRef}
                    onWheel={handleWheel}
                    onMouseMove={handleMouseMove}
                    style={{ height: chartHeights - 10 + 'px' }}
                >
                    {isHoveredUp && upScroll}
                    {isToolbarOpen && (
                        <>
                            {drawIconList.map((item, index) => (
                                <div key={index} className={styles.icon_card}>
                                    <div
                                        className={
                                            activeDrawingType === 'Cross'
                                                ? styles.icon_active_container
                                                : styles.icon_inactive_container
                                        }
                                        onClick={() =>
                                            handleDrawModeChange(item)
                                        }
                                    >
                                        <img
                                            className={
                                                activeDrawingType === item.label
                                                    ? styles.icon_active
                                                    : styles.icon_inactive
                                            }
                                            src={item.icon}
                                            alt=''
                                        />
                                    </div>
                                </div>
                            ))}

                            {indicatorIconList.map((item, index) => (
                                <div key={index} className={styles.icon_card}>
                                    <div
                                        className={
                                            isMagnetActive.value
                                                ? styles.icon_fill_container
                                                : styles.icon_inactive_container
                                        }
                                        onClick={() =>
                                            handleActivateIndicator(item)
                                        }
                                    >
                                        <img src={item.icon} alt='' />
                                    </div>
                                </div>
                            ))}

                            <div className={styles.icon_card}>
                                <div
                                    className={
                                        activeDrawingType === 'Cross'
                                            ? styles.icon_active_container
                                            : styles.icon_inactive_container
                                    }
                                    onClick={() => deleteAllShapes()}
                                >
                                    <img src={trashIcon} alt='' />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {isHoveredDown && downScroll}

            <div className={styles.divider_container}>
                <div className={styles.divider}></div>
                <div
                    className={` ${
                        isToolbarOpen ? styles.divider_button : ''
                    } ${styles.close_divider_button} `}
                    onClick={() => setIsToolbarOpen((prev: boolean) => !prev)}
                >
                    <span
                        className={` ${
                            isToolbarOpen ? styles.arrow_left : ''
                        } ${styles.arrow_right} `}
                    ></span>
                </div>
            </div>
        </div>
    );
}

export default Toolbar;
