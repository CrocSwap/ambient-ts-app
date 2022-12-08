import styles from './TradeSettingsColor.module.css';
import { Dispatch, SetStateAction } from 'react';

import { SketchPicker, SketchPickerProps } from 'react-color';
import { DefaultTooltip } from '../../../../../components/Global/StyledTooltip/StyledTooltip';

interface TradeSettingsColorPropsIF {
    upBodyColorPicker: boolean;
    setUpBodyColorPicker: Dispatch<SetStateAction<boolean>>;
    upBodyColor: string;
    handleBodyColorPickerChange: (color: any) => void;
    handleBorderColorPickerChange: (color: any) => void;
    handleDownBodyColorPickerChange: (color: any) => void;
    handleDownBorderColorPickerChange: (color: any) => void;
    setUpBorderColorPicker: Dispatch<SetStateAction<boolean>>;
    setDownBodyColorPicker: Dispatch<SetStateAction<boolean>>;
    setDownBorderColorPicker: Dispatch<SetStateAction<boolean>>;
    upBorderColor: string;
    upBorderColorPicker: boolean;
    downBodyColor: string;
    downBodyColorPicker: boolean;
    downBorderColor: string;
    downBorderColorPicker: boolean;
}
export default function TradeSettingsColor(props: TradeSettingsColorPropsIF) {
    const {
        setUpBodyColorPicker,
        upBodyColor,
        upBodyColorPicker,
        handleBodyColorPickerChange,
        setUpBorderColorPicker,
        upBorderColor,
        upBorderColorPicker,
        handleBorderColorPickerChange,
        setDownBodyColorPicker,
        downBodyColor,
        downBodyColorPicker,
        handleDownBodyColorPickerChange,
        setDownBorderColorPicker,
        downBorderColor,
        downBorderColorPicker,
        handleDownBorderColorPickerChange,
    } = props;

    const upBodyWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <SketchPicker color={upBodyColor} onChangeComplete={handleBodyColorPickerChange} />
            }
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.square_picker_container}
                onClick={() => setUpBodyColorPicker(true)}
            >
                <div className={styles.square_picker} style={{ background: upBodyColor }} />
                <label>Body</label>
            </div>
        </DefaultTooltip>
    );
    const upBorderWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <SketchPicker
                    color={upBorderColor}
                    onChangeComplete={handleBorderColorPickerChange}
                />
            }
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.square_picker_container}
                onClick={() => setUpBorderColorPicker(true)}
            >
                <div
                    className={styles.square_picker}
                    style={{
                        background: upBorderColor,
                    }}
                />
                <label>Border</label>
            </div>
        </DefaultTooltip>
    );

    const downBorderWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <SketchPicker
                    color={downBorderColor}
                    onChangeComplete={handleDownBorderColorPickerChange}
                />
            }
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.square_picker_container}
                onClick={() => setDownBorderColorPicker(true)}
            >
                <div
                    className={styles.square_picker}
                    style={{
                        background: downBorderColor,
                    }}
                />
                <label>Border</label>
            </div>
        </DefaultTooltip>
    );

    const downBodyWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <SketchPicker
                    color={downBodyColor}
                    onChangeComplete={handleDownBodyColorPickerChange}
                />
            }
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div
                className={styles.square_picker_container}
                onClick={() => setDownBodyColorPicker(true)}
            >
                <div className={styles.square_picker} style={{ background: downBodyColor }} />
                <label>Body</label>
            </div>
        </DefaultTooltip>
    );
    return (
        <div className={styles.main_container}>
            <div className={styles.colors_container}>
                <section>
                    <label>Up</label>
                    <div>
                        {/* {upBodyColorPickerSquare}
                        {upBodyColorPickerContent} */}
                        {/* {upBorderColorContent} */}
                        {upBodyWithTooltip}
                        {upBorderWithTooltip}
                    </div>
                </section>

                <section>
                    <label>Down</label>
                    <div>
                        {/* {downBodyColorPickerSquare} */}
                        {/* {downBodyColorPickerContent} */}
                        {/* {downBorderColorPickerContent} */}
                        {downBodyWithTooltip}
                        {downBorderWithTooltip}
                    </div>
                </section>
            </div>
        </div>
    );
}
