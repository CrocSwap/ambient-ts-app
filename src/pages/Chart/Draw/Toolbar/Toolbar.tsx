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
    } = props;

    const { setIsMagnetActive, isMagnetActive } = useContext(ChartContext);
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
    const toolbarRef = useRef(null);

    const handleMouseMove = () => {
        const scrollPosition = window.scrollY;
        // if (scrollPosition ===0) {
        setIsHoveredUp(true);
        setIsHoveredDown(true);

        // }
        // else {
        //     setIsHoveredDown(true);
        //     setIsHoveredUp(false);
        // }
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

    const handleScroll = (direction: string) => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer) {
            const scrollAmount = 100; // İstediğiniz scroll miktarını belirleyin

            if (direction === 'up') {
                scrollContainer.scrollTop -= scrollAmount;
            } else if (direction === 'down') {
                scrollContainer.scrollTop += scrollAmount;
            }
        }
    };

    const upScroll = (
        <div
            className={styles.arrowContainer_container}
            onClick={() => handleScroll('up')}
        >
            <ArrowContainer degree={315} style={{ marginBottom: '1px' }} />
        </div>
    );

    const downScroll = (
        <div
            className={styles.arrowContainer_container}
            style={{ bottom: '20px' }}
            onClick={() => handleScroll('down')}
        >
            <ArrowContainer degree={135} style={{ marginTop: '3px' }} />
        </div>
    );
    const [toolbarHeight, setToolbarHeight] = useState(0);

    // useEffect(() => {
    //     const toolbarElement = toolbarRef.current;

    //     if (toolbarElement) {
    //       const height = toolbarElement.getBoundingClientRect().height;
    //       setToolbarHeight(height);
    //     }
    //   }, [isToolbarOpen]);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const delta = e.deltaY;

        if (scrollContainerRef.current) {
            const currentScrollPosition = scrollContainerRef.current.scrollTop;

            scrollContainerRef.current.scrollTop =
                currentScrollPosition + delta;
        }
    };
    return (
        <div
            className={` ${
                isToolbarOpen ? styles.toolbar_container_active : ''
            } ${styles.toolbar_container} `}
            id='toolbar_container'
            ref={toolbarRef}
        >
            <div
                className={` ${
                    isToolbarOpen ? styles.drawlist_container_active : ''
                } ${styles.drawlist_container} `}
            >
                <div
                    ref={scrollContainerRef}
                    onWheel={handleWheel}
                    style={{
                        height: '250px',
                        overflowX: 'hidden',
                        overflowY: 'clip',
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
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

                    {isHoveredDown && downScroll}
                </div>
            </div>

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
