import React, { ChangeEvent, MouseEventHandler } from 'react';
import styles from './RangeSlider.module.css'; // Import base CSS

interface CustomInputProps {
    size?: number;
    ariaLabelledBy?: string;
    ariaLabel?: string;
    id?: string;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClick?: MouseEventHandler<HTMLInputElement>;
    className?: string;
}

const RangeSlider: React.FC<CustomInputProps> = ({
    size = 28,
    ariaLabelledBy = '',
    ariaLabel = '',
    id = '',
    min = 1,
    max = 100,
    step = 1,
    defaultValue = 0,
    onChange,
    onClick,
    className = '',
}) => (
    <input
        size={size}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        id={id}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        type='range'
        className={`${styles.range_slider} ${className}`}
        onChange={onChange}
        onClick={onClick}
    />
);

export default RangeSlider;
