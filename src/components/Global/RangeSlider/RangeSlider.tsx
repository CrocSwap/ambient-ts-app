import React, { ChangeEvent, MouseEventHandler, useState } from 'react';
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
    className = '',
}) => {
    const [isGrabbing, setIsGrabbing] = useState(false);

    const handleClick: MouseEventHandler<HTMLInputElement> = () => {
        setIsGrabbing(true);
    };

    const handleMouseUp: MouseEventHandler<HTMLInputElement> = () => {
        setIsGrabbing(false);
    };

    return (
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
            className={`${styles.range_slider} ${className} ${
                isGrabbing
                    ? styles.range_slider_grabbing
                    : styles.range_slider_grab
            }`}
            onChange={onChange}
            onMouseDown={handleClick}
            onMouseUp={handleMouseUp}
        />
    );
};

export default RangeSlider;
