import styles from './TradeSettingsColor.module.css';
import { Dispatch, SetStateAction } from 'react';

import { SketchPicker, SketchPickerProps } from 'react-color';

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

    const upBodyColorPickerContent = (
        <>
            {upBodyColorPicker ? (
                <div className={styles.color_picker_container}>
                    <div onClick={() => setUpBodyColorPicker(false)} />
                    <SketchPicker
                        color={upBodyColor}
                        onChangeComplete={handleBodyColorPickerChange}
                    />
                </div>
            ) : null}
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
        </>
    );

    const upBorderColorContent = (
        <>
            {upBorderColorPicker ? (
                <div className={styles.color_picker_container}>
                    <div onClick={() => setUpBorderColorPicker(false)} />
                    <SketchPicker
                        color={upBorderColor}
                        onChangeComplete={handleBorderColorPickerChange}
                    />
                </div>
            ) : null}
        </>
    );

    const downBodyColorPickerContent = (
        <>
            {downBodyColorPicker ? (
                <div style={{ position: 'absolute', zIndex: '2' }}>
                    <div
                        style={{
                            position: 'fixed',
                            top: '0px',
                            right: '0px',
                            bottom: '0px',
                            left: '0px',
                        }}
                        onClick={() => setDownBodyColorPicker(false)}
                    />
                    <SketchPicker
                        color={downBodyColor}
                        onChangeComplete={handleDownBodyColorPickerChange}
                    />
                </div>
            ) : null}
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
        </>
    );

    const downBorderColorPickerContent = (
        <>
            {downBorderColorPicker ? (
                <div style={{ position: 'absolute', zIndex: '2' }}>
                    <div
                        style={{
                            position: 'fixed',
                            top: '0px',
                            right: '0px',
                            bottom: '0px',
                            left: '0px',
                        }}
                        onClick={() => setDownBorderColorPicker(false)}
                    />
                    <SketchPicker
                        color={downBorderColor}
                        onChangeComplete={handleDownBorderColorPickerChange}
                    />
                </div>
            ) : null}
        </>
    );

    const upBodyColorPickerSquare = (
        <div className={styles.square_picker_container} onClick={() => setUpBodyColorPicker(true)}>
            <div
                className={styles.square_picker}
                style={{
                    background: upBodyColor,
                }}
            />
            <label style={{ padding: '0px' }}>Body</label>
        </div>
    );

    const downBodyColorPickerSquare = (
        <div
            className={styles.square_picker_container}
            onClick={() => setDownBodyColorPicker(true)}
        >
            <div className={styles.square_picker} style={{ background: downBodyColor }} />
            <label>Body</label>
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.colors_container}>
                <section>
                    <label>Up</label>
                    <div>
                        {upBodyColorPickerSquare}
                        {upBodyColorPickerContent}
                        {upBorderColorContent}
                    </div>
                </section>

                <section>
                    <label>Down</label>
                    <div>
                        {downBodyColorPickerSquare}
                        {downBodyColorPickerContent}
                        {downBorderColorPickerContent}
                    </div>
                </section>
            </div>
        </div>
    );
}
