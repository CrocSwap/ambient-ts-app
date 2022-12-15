import styles from './ChartSettings.module.css';
import { Dispatch, SetStateAction } from 'react';
import TradeSettingsColor from '../TradeSettings/TradeSettingsColor/TradeSettingsColor';

interface ChartSettingsPropsIF {
    showChartSettings: boolean;

    // TRADE SETTINGS COLOR PROPS
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

export default function ChartSettings(props: ChartSettingsPropsIF) {
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
        setChartBg,

        handleChartBgColorPickerChange,
        showChartSettings,
    } = props;

    const tradeSettingsColorProps = {
        setUpBodyColorPicker: setUpBodyColorPicker,
        upBodyColor: upBodyColor,
        handleBodyColorPickerChange: handleBodyColorPickerChange,
        handleBorderColorPickerChange: handleBorderColorPickerChange,
        handleDownBodyColorPickerChange: handleDownBodyColorPickerChange,
        handleDownBorderColorPickerChange: handleDownBorderColorPickerChange,
        setUpBorderColorPicker: setUpBorderColorPicker,
        setDownBodyColorPicker: setDownBodyColorPicker,
        setDownBorderColorPicker: setDownBorderColorPicker,
        upBorderColor: upBorderColor,
        downBodyColor: downBodyColor,
        downBorderColor: downBorderColor,
        chartBg: chartBg,
        setChartBg: setChartBg,
        handleChartBgColorPickerChange: handleChartBgColorPickerChange,
    };

    if (!showChartSettings) return null;
    return (
        <div className={styles.container}>
            <TradeSettingsColor {...tradeSettingsColorProps} />
        </div>
    );
}
