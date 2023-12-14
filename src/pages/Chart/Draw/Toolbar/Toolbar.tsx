import React, { MutableRefObject, useContext, useRef, useState } from 'react';
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
import undoIcon from '../../../../assets/images/icons/draw/undo.svg';
import redoIcon from '../../../../assets/images/icons/draw/redo.svg';
import {
    drawDataHistory,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';
import { ArrowContainer } from '../../../../styled/Components/Chart';
import { useMediaQuery } from '@material-ui/core';
import { actionKeyIF, actionStackIF } from '../../ChartUtils/useUndoRedo';
import { xAxisHeightPixel } from '../../ChartUtils/chartConstants';

interface ToolbarProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolbarRef: MutableRefObject<any>;
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
    undo: () => void;
    redo: () => void;
    undoStack: Map<actionKeyIF, Array<actionStackIF>>;
    drawActionStack: Map<actionKeyIF, Array<actionStackIF>>;
    actionKey: actionKeyIF;
    setSelectedDrawnShape: React.Dispatch<
        React.SetStateAction<selectedDrawnData | undefined>
    >;
}

interface IconList {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
}

interface undoRedoButtonList {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    operation: () => void;
    stack: Map<actionKeyIF, Array<actionStackIF>>;
}

function Toolbar(props: ToolbarProps) {
    const {
        activeDrawingType,
        setActiveDrawingType,
        isToolbarOpen,
        setIsToolbarOpen,
        setIsMagnetActiveLocal,
        deleteAllShapes,
        undo,
        redo,
        undoStack,
        drawActionStack,
        actionKey,
        setSelectedDrawnShape,
        toolbarRef,
        d3ContainerHeight,
    } = props;

    const mobileView = useMediaQuery('(max-width: 600px)');

    const { setIsMagnetActive, isMagnetActive } = useContext(ChartContext);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [isHoveredUp, setIsHoveredUp] = useState(false);
    const [isHoveredDown, setIsHoveredDown] = useState(false);
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

    const undoRedoButtons: undoRedoButtonList[] = [
        {
            icon: undoIcon,
            label: 'undo',
            operation: undo,
            stack: drawActionStack,
        },
        {
            icon: redoIcon,
            label: 'redo',
            operation: redo,
            stack: undoStack,
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

                left: -8,
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
                top: d3ContainerHeight - xAxisHeightPixel + 'px',
                position: 'absolute',
                width: toolbarRef.current
                    ? `${toolbarRef.current.clientWidth + 7}px`
                    : 'auto',
                left: -8,
            }}
            onClick={() => handleScroll('down')}
        >
            <ArrowContainer degree={135} style={{ marginTop: '3px' }} />
        </div>
    );

    const handleDeleteAll = () => {
        setSelectedDrawnShape(undefined);
        setActiveDrawingType('Cross');
        deleteAllShapes();
    };

    return (
        <div
            className={` ${
                isToolbarOpen ? styles.toolbar_container_active : ''
            } ${styles.toolbar_container} `}
            id='toolbar_container'
            ref={toolbarRef}
            style={{
                backgroundColor: mobileView ? 'var(--dark1)' : 'var(--dark2)',
            }}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <div
                className={` ${
                    isToolbarOpen ? styles.drawlist_container_active : ''
                } ${styles.drawlist_container} `}
            >
                <div
                    className={styles.scrollableDiv}
                    ref={scrollContainerRef}
                    style={{
                        height:
                            d3ContainerHeight - (xAxisHeightPixel - 2) + 'px',
                    }}
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

                            {undoRedoButtons.map((item, index) => (
                                <div key={index} className={styles.icon_card}>
                                    <div
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        className={
                                            item.stack.has(actionKey) &&
                                            Number(
                                                item.stack.get(actionKey)
                                                    ?.length,
                                            ) > 0
                                                ? styles.undo_redo_button_active
                                                : styles.undo_redo_button_passive
                                        }
                                        onClick={() => {
                                            if (
                                                item.stack.has(actionKey) &&
                                                Number(
                                                    item.stack.get(actionKey)
                                                        ?.length,
                                                ) > 0
                                            ) {
                                                setSelectedDrawnShape(
                                                    undefined,
                                                );
                                                item.operation();
                                            }
                                        }}
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
                                    onClick={() => handleDeleteAll()}
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
