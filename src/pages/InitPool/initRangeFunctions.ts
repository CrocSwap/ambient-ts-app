import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import truncateDecimals from '../../utils/data/truncateDecimals';

export function updateRangeWithButton(
    value: number,
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>,
) {
    const inputSlider = document.getElementById('init-slider-range');
    const valueString = value.toString();
    if (inputSlider && valueString) {
        (inputSlider as HTMLInputElement).value = valueString;
    }
    const truncatedValue = truncateDecimals(value, 2);
    setRangeWidthPercentage(parseFloat(truncatedValue));
}

export function handleRangeSlider(
    event: ChangeEvent<HTMLInputElement>,
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>,
) {
    const { value } = event.target as HTMLInputElement;
    const truncatedValue = truncateDecimals(parseFloat(value), 2);
    setRangeWidthPercentage(parseFloat(truncatedValue));
}
