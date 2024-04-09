import React, { useContext, useRef, useState } from 'react';
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
import { ArrowContainer } from '../../../../styled/Components/Chart';
import { useMediaQuery } from '@material-ui/core';
import { actionKeyIF, actionStackIF } from '../../ChartUtils/useUndoRedo';
import { xAxisHeightPixel } from '../../ChartUtils/chartConstants';
import HoveredTooltip from './HoveredTooltip';
import {
    ArrowContainerContainer,
    ArrowRight,
    Divider,
    DividerButton,
    DividerContainer,
    DrawlistContainer,
    IconActive,
    IconActiveContainer,
    IconCard,
    IconFillContainer,
    ScrollableDiv,
    ToolbarContainer,
    UndoButtonSvg,
    UndoRedoButtonActive,
} from './ToolbarCss';

/* interface ToolbarProps {
  
} */

interface IconList {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    description: string;
}

interface undoRedoButtonList {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    operation: () => void;
    stack: Map<actionKeyIF, Array<actionStackIF>>;
    description: string;
}

function ChartToolbar() {
    const mobileView = useMediaQuery('(max-width: 1200px)');
    const smallScreen = useMediaQuery('(max-width: 500px)');

    const {
        toolbarRef,
        setIsMagnetActive,
        isMagnetActive,
        isToolbarOpen,
        setIsToolbarOpen,
        undoRedoOptions: {
            undo,
            redo,
            deleteAllShapes,
            undoStack,
            drawActionStack,
            actionKey,
            drawnShapeHistory,
        },
        activeDrawingType,
        setActiveDrawingType,
        setSelectedDrawnShape,
        chartContainerOptions,
        setIsMagnetActiveLocal,
    } = useContext(ChartContext);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [isHoveredUp, setIsHoveredUp] = useState(false);
    const [isHoveredDown, setIsHoveredDown] = useState(false); /*  */

    const [hoveredTool, setHoveredTool] = useState<string | undefined>(
        undefined,
    );

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
            description: 'Crosshair',
        },
        {
            icon: drawLine,
            label: 'Brush',
            description: 'Trend Line',
        },
        // {
        //     icon: drawAngle,
        //     label: 'Angle',
        // },
        {
            icon: horizontalRay,
            label: 'Ray',
            description: 'Horizontal Ray',
        },
        {
            icon: drawRect,
            label: 'Rect',
            description: 'Rectangle',
        },
        {
            icon: fibRetracement,
            label: 'FibRetracement',
            description: 'Fib Retracement',
        },
        {
            icon: dprange,
            label: 'DPRange',
            description: 'Date & Price Range',
        },
        // Add more icons here
    ];

    const indicatorIconList: IconList[] = [
        {
            icon: magnet,
            label: 'magnet',
            description: 'Magnet Mode',
        },
    ];

    const undoRedoButtons: undoRedoButtonList[] = [
        {
            icon: undoIcon,
            label: 'undo',
            description: 'Undo Last Change',
            operation: undo,
            stack: drawActionStack,
        },
        {
            icon: redoIcon,
            label: 'redo',
            description: 'Redo Last Change',
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
        <ArrowContainerContainer
            onClick={() => handleScroll('up')}
            width={
                toolbarRef.current
                    ? `${toolbarRef.current.clientWidth + 7}px`
                    : 'auto'
            }
        >
            <ArrowContainer degree={315} style={{ marginBottom: '1px' }} />
        </ArrowContainerContainer>
    );

    const downScroll = chartContainerOptions && (
        <ArrowContainerContainer
            onClick={() => handleScroll('down')}
            width={
                toolbarRef.current
                    ? `${toolbarRef.current.clientWidth + 7}px`
                    : 'auto'
            }
            style={{
                top: chartContainerOptions.height - xAxisHeightPixel + 'px',
            }}
        >
            <ArrowContainer degree={135} style={{ marginTop: '3px' }} />
        </ArrowContainerContainer>
    );

    const handleDeleteAll = () => {
        setSelectedDrawnShape(undefined);
        setActiveDrawingType('Cross');
        deleteAllShapes();
    };

    const handleOnMouseEnter = (description: string) => {
        setHoveredTool(() => description);

        if (mobileView) {
            setTimeout(() => {
                setHoveredTool(undefined);
            }, 200);
        }
    };

    return chartContainerOptions && chartContainerOptions.top !== 0 ? (
        <ToolbarContainer
            isActive={isToolbarOpen}
            isMobile={mobileView}
            marginTopValue={
                chartContainerOptions.top -
                57 -
                (mobileView && !smallScreen ? 20 : 0)
            }
            id='toolbar_container'
            ref={toolbarRef}
            backgroundColor={mobileView ? 'var(--dark1)' : 'var(--dark2)'}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <DrawlistContainer isActive={isToolbarOpen}>
                <ScrollableDiv
                    ref={scrollContainerRef}
                    height={
                        chartContainerOptions.height - xAxisHeightPixel + 'px'
                    }
                    isHover={hoveredTool !== undefined}
                >
                    {isHoveredUp && upScroll}
                    {isToolbarOpen && (
                        <>
                            {drawIconList.map((item, index) => (
                                <IconCard key={index}>
                                    <IconActiveContainer
                                        onClick={() =>
                                            !mobileView &&
                                            handleDrawModeChange(item)
                                        }
                                        onMouseEnter={() => {
                                            handleOnMouseEnter(
                                                item.description,
                                            );
                                        }}
                                        onMouseLeave={() =>
                                            setHoveredTool(() => undefined)
                                        }
                                        onTouchStart={() =>
                                            handleDrawModeChange(item)
                                        }
                                    >
                                        <IconActive
                                            isActive={
                                                activeDrawingType === item.label
                                            }
                                            src={item.icon}
                                            alt=''
                                        />
                                    </IconActiveContainer>

                                    {hoveredTool &&
                                        hoveredTool === item.description && (
                                            <HoveredTooltip
                                                hoveredTool={hoveredTool}
                                                height={22}
                                                width={125}
                                                arrow={true}
                                            ></HoveredTooltip>
                                        )}
                                </IconCard>
                            ))}

                            {indicatorIconList.map((item, index) => (
                                <IconCard key={index}>
                                    <IconFillContainer
                                        isActive={isMagnetActive.value}
                                        onClick={() =>
                                            !mobileView &&
                                            handleActivateIndicator(item)
                                        }
                                        onMouseEnter={() => {
                                            handleOnMouseEnter(
                                                item.description,
                                            );
                                        }}
                                        onMouseLeave={() =>
                                            setHoveredTool(() => undefined)
                                        }
                                        onTouchStart={() =>
                                            handleActivateIndicator(item)
                                        }
                                    >
                                        <IconActive
                                            isActive={false}
                                            src={item.icon}
                                            alt=''
                                        />
                                    </IconFillContainer>

                                    {hoveredTool &&
                                        hoveredTool === item.description && (
                                            <HoveredTooltip
                                                hoveredTool={hoveredTool}
                                                height={22}
                                                width={125}
                                                arrow={true}
                                            ></HoveredTooltip>
                                        )}
                                </IconCard>
                            ))}

                            {undoRedoButtons.map((item, index) => (
                                <IconCard key={index}>
                                    <UndoRedoButtonActive
                                        isActive={
                                            item.stack.has(actionKey) &&
                                            Number(
                                                item.stack.get(actionKey)
                                                    ?.length,
                                            ) > 0
                                        }
                                        onClick={() => {
                                            if (!mobileView) {
                                                if (
                                                    item.stack.has(actionKey) &&
                                                    Number(
                                                        item.stack.get(
                                                            actionKey,
                                                        )?.length,
                                                    ) > 0
                                                ) {
                                                    setSelectedDrawnShape(
                                                        undefined,
                                                    );
                                                    item.operation();
                                                }
                                            }
                                        }}
                                        onTouchStart={() => {
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
                                        onMouseEnter={() =>
                                            handleOnMouseEnter(item.description)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredTool(() => undefined)
                                        }
                                    >
                                        <UndoButtonSvg
                                            isActive={
                                                item.stack.has(actionKey) &&
                                                Number(
                                                    item.stack.get(actionKey)
                                                        ?.length,
                                                ) > 0
                                            }
                                            src={item.icon}
                                            alt=''
                                        />
                                    </UndoRedoButtonActive>

                                    {hoveredTool &&
                                        hoveredTool === item.description && (
                                            <HoveredTooltip
                                                hoveredTool={hoveredTool}
                                                height={22}
                                                width={125}
                                                arrow={true}
                                            ></HoveredTooltip>
                                        )}
                                </IconCard>
                            ))}

                            <IconCard>
                                <IconActiveContainer
                                    onClick={() =>
                                        !mobileView && handleDeleteAll()
                                    }
                                    onMouseEnter={() => {
                                        handleOnMouseEnter('Delete All');
                                    }}
                                    onMouseLeave={() =>
                                        setHoveredTool(() => undefined)
                                    }
                                    onTouchStart={() => handleDeleteAll()}
                                >
                                    <UndoButtonSvg
                                        isActive={drawnShapeHistory.length > 0}
                                        src={trashIcon}
                                        alt=''
                                    />
                                </IconActiveContainer>

                                {hoveredTool &&
                                    hoveredTool === 'Delete All' && (
                                        <HoveredTooltip
                                            hoveredTool={hoveredTool}
                                            height={22}
                                            width={125}
                                            arrow={true}
                                        ></HoveredTooltip>
                                    )}
                            </IconCard>
                        </>
                    )}
                </ScrollableDiv>
            </DrawlistContainer>
            {isHoveredDown && downScroll}

            <DividerContainer>
                <Divider />
                <DividerButton
                    isActive={isToolbarOpen}
                    onClick={() =>
                        !mobileView &&
                        setIsToolbarOpen((prev: boolean) => !prev)
                    }
                    onTouchStart={() =>
                        setIsToolbarOpen((prev: boolean) => !prev)
                    }
                >
                    <ArrowRight isActive={isToolbarOpen}></ArrowRight>
                </DividerButton>
            </DividerContainer>
        </ToolbarContainer>
    ) : (
        <></>
    );
}

export default ChartToolbar;
