import styles from './ChartSettings.module.css';
import { Dispatch, SetStateAction, useState } from 'react';
import TradeSettingsColor from '../TradeSettings/TradeSettingsColor/TradeSettingsColor';
import { VscClose } from 'react-icons/vsc';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';
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

    const exDataContent = (
        <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, doloremque.</div>
    );
    const chartSettingsData = [
        { icon: '🍅', label: 'Tomato', content: exDataContent },
        { icon: '🥬', label: 'Lettuce', content: exDataContent },
        { icon: '🥕', label: 'Carrot', content: exDataContent },
        { icon: '🫐', label: 'Blueberries', content: exDataContent },
        { icon: '🥂 ', label: 'Colors', content: ' TradeSettingsColor' },
    ];

    const [selectedChartSetting, setSelectedChartSetting] = useState(chartSettingsData[0]);
    const chartSettingNavs = (
        <ul className={styles.chart_settings_nav}>
            {chartSettingsData.map((item, idx) => (
                <li
                    key={idx}
                    className={
                        item.label === selectedChartSetting.label
                            ? styles.setting_active
                            : styles.setting
                    }
                    onClick={() => setSelectedChartSetting(item)}
                >
                    <IconWithTooltip title={item.label} placement='left'>
                        {item.icon}
                    </IconWithTooltip>
                </li>
            ))}
        </ul>
    );

    if (!showChartSettings) return null;
    return (
        <div className={styles.container}>
            <div
                // ref={chartSettingsRef}
                className={`${styles.main_settings_container} ${
                    showChartSettings && styles.main_settings_container_active
                }`}
            >
                <header>
                    <p />
                    <h2>Chart Settings</h2>
                    <div>
                        <VscClose size={24} />
                    </div>
                </header>
                <div className={styles.chart_settings_inner}>
                    {chartSettingNavs}
                    <section className={styles.main_chart_settings_content}>
                        <h1>{selectedChartSetting.label}</h1>
                        {selectedChartSetting.content}
                    </section>
                </div>
            </div>{' '}
        </div>
    );
}
