import styles from './TradeSettingsColor.module.css';
import { Dispatch, SetStateAction, MouseEventHandler, memo } from 'react';

import { SketchPicker } from 'react-color';
import { DefaultTooltip } from '../../../../../components/Global/StyledTooltip/StyledTooltip';

interface TradeSettingsColorPropsIF {
    upBodyColorPicker: boolean;
    setUpBodyColorPicker: Dispatch<SetStateAction<boolean>>;
    upBodyColor: string;
    // eslint-disable-next-line
    handleBodyColorPickerChange: (color: any) => void;
    // eslint-disable-next-line
    handleBorderColorPickerChange: (color: any) => void;
    // eslint-disable-next-line
    handleDownBodyColorPickerChange: (color: any) => void;
    // eslint-disable-next-line
    handleDownBorderColorPickerChange: (color: any) => void;
    // eslint-disable-next-line
    handleChartBgColorPickerChange: (color: any) => void;
    setUpBorderColorPicker: Dispatch<SetStateAction<boolean>>;
    setDownBodyColorPicker: Dispatch<SetStateAction<boolean>>;
    setDownBorderColorPicker: Dispatch<SetStateAction<boolean>>;
    upBorderColor: string;
    upBorderColorPicker: boolean;
    downBodyColor: string;
    downBodyColorPicker: boolean;
    downBorderColor: string;
    downBorderColorPicker: boolean;

    chartBg: string;
    setChartBg: Dispatch<SetStateAction<string>>;
}
interface ColorPickerDisplayTooltipPropsIF {
    onClick: MouseEventHandler<HTMLDivElement>;
    // eslint-disable-next-line
    onChangeComplete: (color: any) => void;
    color: string;
    label: string;
}
function TradeSettingsColor(props: TradeSettingsColorPropsIF) {
    const {
        setUpBodyColorPicker,
        upBodyColor,
        // upBodyColorPicker,
        handleBodyColorPickerChange,
        setUpBorderColorPicker,
        upBorderColor,
        // upBorderColorPicker,
        handleBorderColorPickerChange,
        setDownBodyColorPicker,
        downBodyColor,
        // downBodyColorPicker,
        handleDownBodyColorPickerChange,
        setDownBorderColorPicker,
        downBorderColor,
        // downBorderColorPicker,
        handleDownBorderColorPickerChange,

        chartBg,

        handleChartBgColorPickerChange,
    } = props;

    function ColorPickerDisplay(props: ColorPickerDisplayTooltipPropsIF) {
        const { onClick, onChangeComplete, color, label } = props;

        return (
            <DefaultTooltip
                interactive
                title={
                    <SketchPicker
                        color={color}
                        onChangeComplete={onChangeComplete}
                    />
                }
                placement={'bottom'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
                <div
                    className={styles.square_picker_container}
                    onClick={onClick}
                >
                    <div
                        className={styles.square_picker}
                        style={{ background: color }}
                    />
                    <label>{label}</label>
                </div>
            </DefaultTooltip>
        );
    }

    const backgroundPickerContent = (
        <div className={styles.bg_picker_container}>
            <ColorPickerDisplay
                color={chartBg}
                onChangeComplete={handleChartBgColorPickerChange}
                onClick={() => setDownBorderColorPicker(true)}
                label={'Background'}
            />
        </div>
    );
    const colorsPickerContent = (
        <div className={styles.colors_container}>
            <section>
                <label>Up</label>
                <div>
                    <ColorPickerDisplay
                        color={upBodyColor}
                        onChangeComplete={handleBodyColorPickerChange}
                        onClick={() => setUpBodyColorPicker(true)}
                        label={'Body'}
                    />
                    <ColorPickerDisplay
                        color={upBorderColor}
                        onChangeComplete={handleBorderColorPickerChange}
                        onClick={() => setUpBorderColorPicker(true)}
                        label={'Border'}
                    />
                </div>
            </section>

            <section>
                <label>Down</label>
                <div>
                    <ColorPickerDisplay
                        color={downBodyColor}
                        onChangeComplete={handleDownBodyColorPickerChange}
                        onClick={() => setDownBodyColorPicker(true)}
                        label={'Body'}
                    />
                    <ColorPickerDisplay
                        color={downBorderColor}
                        onChangeComplete={handleDownBorderColorPickerChange}
                        onClick={() => setDownBorderColorPicker(true)}
                        label={'Border'}
                    />
                </div>
            </section>
        </div>
    );

    return (
        <div className={styles.main_container}>
            {backgroundPickerContent}
            {colorsPickerContent}
        </div>
    );
}

export default memo(TradeSettingsColor);
