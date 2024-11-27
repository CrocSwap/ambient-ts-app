import * as d3 from 'd3';
import { useContext, useEffect, useRef, useState } from 'react';
import { VscClose } from 'react-icons/vsc';
import { ChartThemeIF } from '../../../contexts/ChartContext';
import {
    ChartSettingsContainer,
    CloseButton,
    ContextMenu,
    ContextMenuHeader,
    ContextMenuHeaderText,
} from './ChartSettingsCss';

import { BrandContext } from '../../../contexts/BrandContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { chartItemStates } from '../../platformAmbient/Chart/ChartUtils/chartUtils';
import ChartSettingsContent from './ChartSettingsContent';

interface ContextMenuIF {
    contextMenuPlacement?: { top: number; left: number; isReversed: boolean };
    setContextmenu: React.Dispatch<React.SetStateAction<boolean>>;
    chartItemStates: chartItemStates;
    chartThemeColors: ChartThemeIF;
    setChartThemeColors: React.Dispatch<
        React.SetStateAction<ChartThemeIF | undefined>
    >;
    isCondensedModeEnabled: boolean;
    closeOutherChartSetting: boolean;
    setIsCondensedModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    setCloseOutherChartSetting: React.Dispatch<React.SetStateAction<boolean>>;
    setShouldDisableChartSettings: React.Dispatch<
        React.SetStateAction<boolean>
    >;
    render: () => void;
}

export interface ColorObjIF {
    selectedColor: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    replaceSelector: string;
    index: number | undefined;
    placement: string;
}

export default function ChartSettings(props: ContextMenuIF) {
    const {
        contextMenuPlacement,
        setContextmenu,
        chartThemeColors,
        // setChartThemeColors,
        // render,
        isCondensedModeEnabled,
        setIsCondensedModeEnabled,
        setShouldDisableChartSettings,
        closeOutherChartSetting,
        setCloseOutherChartSetting,
    } = props;

    const contextMenuRef = useRef<HTMLInputElement | null>(null);

    const { platformName } = useContext(BrandContext);

    const [isSaving, setIsSaving] = useState(false);
    const [applyDefault, setApplyDefault] = useState(false);
    const [reverseColorObj, setReverseColorObj] = useState(false);

    const tabletView = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );

    useEffect(() => {
        d3.select(contextMenuRef.current).on(
            'contextmenu',
            (event: PointerEvent) => {
                event.preventDefault();
            },
        );
    }, []);

    useEffect(() => {
        const screenHeight = window.innerHeight;

        if (contextMenuPlacement) {
            const diff = screenHeight - contextMenuPlacement.top;

            setReverseColorObj(
                (contextMenuPlacement.isReversed && diff < 260) ||
                    (!contextMenuPlacement.isReversed && diff < 700),
            );
        }
    }, [contextMenuPlacement]);

    useEffect(() => {
        if (closeOutherChartSetting) {
            setSelectedColorObj(undefined);
            setShouldDisableChartSettings(true);
            setCloseOutherChartSetting(false);
        }
    }, [closeOutherChartSetting]);

    const [selectedColorObj, setSelectedColorObj] = useState<
        ColorObjIF | undefined
    >(undefined);

    const [isSelecboxActive, setIsSelecboxActive] = useState(false);

    return (
        <ChartSettingsContainer
            ref={contextMenuRef}
            top={contextMenuPlacement ? contextMenuPlacement.top : 0}
            left={contextMenuPlacement ? contextMenuPlacement.left : 0}
            isReversed={
                contextMenuPlacement ? contextMenuPlacement.isReversed : false
            }
            onClick={() => {
                setShouldDisableChartSettings(true);
                setSelectedColorObj(undefined);
                setIsSelecboxActive(false);
            }}
        >
            <ContextMenu>
                <ContextMenuHeader>
                    <ContextMenuHeaderText>
                        {['futa'].includes(platformName)
                            ? 'CHART SETTINGS'
                            : 'Chart Settings'}
                    </ContextMenuHeaderText>
                    <CloseButton onClick={() => setContextmenu(false)}>
                        <VscClose size={24} />
                    </CloseButton>
                </ContextMenuHeader>

                <ChartSettingsContent
                    chartThemeColors={chartThemeColors}
                    isCondensedModeEnabled={isCondensedModeEnabled}
                    setIsCondensedModeEnabled={setIsCondensedModeEnabled}
                    setShouldDisableChartSettings={
                        setShouldDisableChartSettings
                    }
                    chartItemStates={props.chartItemStates}
                    isSelecboxActive={isSelecboxActive}
                    setIsSelecboxActive={setIsSelecboxActive}
                    selectedColorObj={selectedColorObj}
                    setSelectedColorObj={setSelectedColorObj}
                    reverseColorObj={reverseColorObj}
                    setApplyDefault={setApplyDefault}
                    applyDefault={applyDefault}
                    isSaving={isSaving}
                    setIsSaving={setIsSaving}
                    isMobile={tabletView}
                    // render={render}
                />
            </ContextMenu>
        </ChartSettingsContainer>
    );
}
