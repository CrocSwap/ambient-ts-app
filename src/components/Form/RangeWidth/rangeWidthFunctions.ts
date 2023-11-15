import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { truncateDecimals } from '../../../ambient-utils/dataLayer';

export function handleRangeSlider(
    event: ChangeEvent<HTMLInputElement>,
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>,
) {
    const { value } = event.target as HTMLInputElement;
    const truncatedValue = truncateDecimals(parseFloat(value), 2);
    setRangeWidthPercentage(parseFloat(truncatedValue));
}
