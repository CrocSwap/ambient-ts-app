import React, { ChangeEvent, MouseEventHandler, useState } from 'react';
import { RangeSliderWrapper } from './Form.styles';

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
    percentageInput?: boolean;
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
    percentageInput = false,
}) => {
    const [isGrabbing, setIsGrabbing] = useState(false);

    const handleClick: MouseEventHandler<HTMLInputElement> = () => {
        setIsGrabbing(true);
    };

    const handleMouseUp: MouseEventHandler<HTMLInputElement> = () => {
        setIsGrabbing(false);
    };

    return (
        <RangeSliderWrapper
            size={size}
            aria-labelledby={ariaLabelledBy}
            aria-label={ariaLabel}
            id={id}
            min={min}
            max={max}
            step={step}
            defaultValue={defaultValue}
            type='range'
            grabbing={isGrabbing}
            onChange={onChange}
            onMouseDown={handleClick}
            onMouseUp={handleMouseUp}
            percentageInput={percentageInput}
        />
    );
};

export default RangeSlider;
