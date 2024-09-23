import React, { useContext, useRef, useState } from 'react';
import { ChartContext } from '../../../../../contexts/ChartContext';
import undoIcon from '../../../../../assets/images/icons/draw/undo.svg';
import redoIcon from '../../../../../assets/images/icons/draw/redo.svg';
import { ArrowContainer } from '../../../../../styled/Components/Chart';
import { useMediaQuery } from '@material-ui/core';
import { actionKeyIF, actionStackIF } from '../../ChartUtils/useUndoRedo';
import { xAxisHeightPixel } from '../../ChartUtils/chartConstants';
import HoveredTooltip from './HoveredTooltip';
import DrawCross from '../../../../../assets/images/icons/draw/DrawCrossSvg';
import {
    ArrowContainerContainer,
    ArrowRight,
    Divider,
    DividerButton,
    DividerContainer,
    DrawlistContainer,
    IconActiveContainer,
    IconCard,
    IconFillContainer,
    ScrollableDiv,
    ToolbarContainer,
    UndoButtonSvg,
    UndoRedoButtonActive,
} from './ToolbarCss';
import SnapSvg from '../../../../../assets/images/icons/draw/SnapSvg';
import DrawLineSvg from '../../../../../assets/images/icons/draw/DrawLineSvg';
import HorizontalRaySvg from '../../../../../assets/images/icons/draw/HorizontalRaySvg';
import RectSvg from '../../../../../assets/images/icons/draw/RectSvg';
import FibRetracementSvg from '../../../../../assets/images/icons/draw/FibRetracementSvg';
import DpRangeSvg from '../../../../../assets/images/icons/draw/DpRangeSvg';
import DeleteSvg from '../../../../../assets/images/icons/draw/DeleteSvg';
import { BrandContext } from '../../../../../contexts/BrandContext';
import { AppStateContext } from '../../../../../contexts/AppStateContext';

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
    const mobileView = useMediaQuery('(max-width: 780px)');
    const smallScreen = useMediaQuery('(max-width: 500px)');

    const { platformName } = useContext(BrandContext);
    const isFuta = ['futa'].includes(platformName);

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
        isFullScreen,
    } = useContext(ChartContext);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { chartThemeColors } = useContext(ChartContext);

    const [isHoveredUp, setIsHoveredUp] = useState(false);
    const [isHoveredDown, setIsHoveredDown] = useState(false);
    const { isUserIdle10min } = useContext(AppStateContext);

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
            icon: (
                <DrawCross
                    stroke={
                        activeDrawingType === 'Cross'
                            ? 'var(--accent1)'
                            : '#f0f0f8'
                    }
                />
            ),
            label: 'Cross',
            description: 'Crosshair',
        },
        {
            icon: (
                <DrawLineSvg
                    stroke={
                        activeDrawingType === 'Brush'
                            ? 'var(--accent1)'
                            : '#f0f0f8'
                    }
                />
            ),
            label: 'Brush',
            description: 'Trend Line',
        },
        // {
        //     icon: drawAngle,
        //     label: 'Angle',
        // },
        {
            icon: (
                <HorizontalRaySvg
                    stroke={
                        activeDrawingType === 'Ray'
                            ? 'var(--accent1)'
                            : '#f0f0f8'
                    }
                />
            ),
            label: 'Ray',
            description: 'Horizontal Ray',
        },
        {
            icon: (
                <RectSvg
                    stroke={
                        activeDrawingType === 'Rect'
                            ? 'var(--accent1)'
                            : '#f0f0f8'
                    }
                />
            ),
            label: 'Rect',
            description: 'Rectangle',
        },
        {
            icon: (
                <FibRetracementSvg
                    stroke={
                        activeDrawingType === 'FibRetracement'
                            ? 'var(--accent1)'
                            : '#f0f0f8'
                    }
                />
            ),
            label: 'FibRetracement',
            description: 'Fib Retracement',
        },
        {
            icon: (
                <DpRangeSvg
                    stroke={
                        activeDrawingType === 'DPRange'
                            ? 'var(--accent1)'
                            : '#f0f0f8'
                    }
                />
            ),
            label: 'DPRange',
            description: 'Date & Price Range',
        },
        // Add more icons here
    ];

    const indicatorIconList: IconList[] = [
        {
            icon: <SnapSvg stroke={'#f0f0f8'} />,
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
                top:
                    chartContainerOptions.height -
                    (mobileView ? 20 : 0) -
                    xAxisHeightPixel +
                    'px',
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
        if (!mobileView) {
            setHoveredTool(() => description);
        }
    };

    return chartContainerOptions &&
        chartContainerOptions.top !== 0 &&
        !isUserIdle10min ? (
        <ToolbarContainer
            isActive={isToolbarOpen}
            isMobile={mobileView}
            isSmallScreen={smallScreen}
            marginTopValue={chartContainerOptions.top - 57}
            height={chartContainerOptions.height - xAxisHeightPixel}
            id='toolbar_container'
            ref={toolbarRef}
            backgroundColor={
                isFuta
                    ? mobileView || smallScreen
                        ? 'transparent'
                        : isFullScreen
                          ? 'var(--dark2)'
                          : 'var(--dark1)'
                    : mobileView
                      ? 'var(--dark1)'
                      : 'var(--dark2)'
            }
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <DrawlistContainer isActive={isToolbarOpen}>
                <ScrollableDiv
                    ref={scrollContainerRef}
                    height={
                        chartContainerOptions.height -
                        (mobileView && smallScreen ? 20 : 0) -
                        xAxisHeightPixel +
                        'px'
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
                                        {item.icon}
                                        {/* activeDrawingType === item.label */}
                                    </IconActiveContainer>

                                    {hoveredTool &&
                                        hoveredTool === item.description && (
                                            <HoveredTooltip
                                                hoveredTool={hoveredTool}
                                                height={22}
                                                width={135}
                                                arrow={true}
                                            ></HoveredTooltip>
                                        )}
                                </IconCard>
                            ))}

                            {indicatorIconList.map((item, index) => (
                                <IconCard key={index}>
                                    <IconFillContainer
                                        isActive={isMagnetActive.value}
                                        fill={
                                            chartThemeColors &&
                                            chartThemeColors.downCandleBorderColor
                                                ? chartThemeColors.downCandleBorderColor
                                                      .copy()
                                                      .darker(0.7)
                                                      .toString()
                                                : 'var(--accent1)'
                                        }
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
                                        {item.icon}
                                    </IconFillContainer>

                                    {hoveredTool &&
                                        hoveredTool === item.description && (
                                            <HoveredTooltip
                                                hoveredTool={hoveredTool}
                                                height={22}
                                                width={135}
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
                                                width={135}
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
                                    <DeleteSvg
                                        stroke={
                                            drawnShapeHistory.length > 0
                                                ? '#f0f0f8'
                                                : '#61646f'
                                        }
                                    />
                                </IconActiveContainer>

                                {hoveredTool &&
                                    hoveredTool === 'Delete All' && (
                                        <HoveredTooltip
                                            hoveredTool={hoveredTool}
                                            height={22}
                                            width={135}
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
                    <ArrowRight
                        isActive={isToolbarOpen}
                        isFuta={isFuta}
                    ></ArrowRight>
                </DividerButton>
            </DividerContainer>
        </ToolbarContainer>
    ) : (
        <></>
    );
}

export default ChartToolbar;
