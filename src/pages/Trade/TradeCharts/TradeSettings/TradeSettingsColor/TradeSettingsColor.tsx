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
    return (
        <div>
            <div style={{ textAlign: 'center', display: 'flex' }}>
                <label style={{ padding: '0px' }}>Up</label>
                <div style={{ marginLeft: '4px' }}>
                    <div
                        style={{
                            padding: '2px',
                            borderRadius: '1px',
                            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                            display: 'inline-block',
                            cursor: 'pointer',
                        }}
                        onClick={() => setUpBodyColorPicker(true)}
                    >
                        <div
                            style={{
                                width: '36px',
                                height: '14px',
                                borderRadius: '2px',
                                background: upBodyColor,
                            }}
                        />
                        <label style={{ padding: '0px' }}>Body</label>
                    </div>
                    {upBodyColorPicker ? (
                        <div style={{ position: 'absolute', zIndex: '2' }}>
                            <div
                                style={{
                                    position: 'fixed',
                                    top: '0px',
                                    right: '0px',
                                    bottom: '0px',
                                    left: '0px',
                                }}
                                onClick={() => setUpBodyColorPicker(false)}
                            />
                            <SketchPicker
                                color={upBodyColor}
                                onChangeComplete={handleBodyColorPickerChange}
                            />
                        </div>
                    ) : null}
                    <div
                        style={{
                            padding: '2px',
                            borderRadius: '1px',
                            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                            display: 'inline-block',
                            cursor: 'pointer',
                        }}
                        onClick={() => setUpBorderColorPicker(true)}
                    >
                        <div
                            style={{
                                width: '36px',
                                height: '14px',
                                borderRadius: '2px',
                                background: upBorderColor,
                            }}
                        />
                        <label style={{ padding: '0px' }}>Border</label>
                    </div>
                    {upBorderColorPicker ? (
                        <div style={{ position: 'absolute', zIndex: '2' }}>
                            <div
                                style={{
                                    position: 'fixed',
                                    top: '0px',
                                    right: '0px',
                                    bottom: '0px',
                                    left: '0px',
                                }}
                                onClick={() => setUpBorderColorPicker(false)}
                            />
                            <SketchPicker
                                color={upBorderColor}
                                onChangeComplete={handleBorderColorPickerChange}
                            />
                        </div>
                    ) : null}
                </div>
                <label style={{ padding: '0px' }}>Down</label>
                <div style={{ marginLeft: '4px' }}>
                    <div
                        style={{
                            padding: '2px',
                            borderRadius: '1px',
                            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                            display: 'inline-block',
                            cursor: 'pointer',
                        }}
                        onClick={() => setDownBodyColorPicker(true)}
                    >
                        <div
                            style={{
                                width: '36px',
                                height: '14px',
                                borderRadius: '2px',
                                background: downBodyColor,
                            }}
                        />
                        <label style={{ padding: '0px' }}>Body</label>
                    </div>
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
                        style={{
                            padding: '2px',
                            borderRadius: '1px',
                            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                            display: 'inline-block',
                            cursor: 'pointer',
                        }}
                        onClick={() => setDownBorderColorPicker(true)}
                    >
                        <div
                            style={{
                                width: '36px',
                                height: '14px',
                                borderRadius: '2px',
                                background: downBorderColor,
                            }}
                        />
                        <label style={{ padding: '0px' }}>Border</label>
                    </div>
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
                </div>
            </div>
        </div>
    );
}
