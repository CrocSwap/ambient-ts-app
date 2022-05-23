import truncateDecimals from '../../../../utils/data/truncateDecimals';

export function updateRangeWithButton(
    value: number,
    setRangeWidthPercentage: React.Dispatch<React.SetStateAction<number>>,
) {
    const inputSlider = document.getElementById('input-slider-range');
    const valueString = value.toString();
    if (inputSlider && valueString) {
        (inputSlider as HTMLInputElement).value = valueString;
    }
    const truncatedValue = truncateDecimals(value, 2);
    // const humanReadableValue = transformValue(value);

    setRangeWidthPercentage(truncatedValue);
}

export function handleRangeSlider(
    event: React.ChangeEvent<HTMLInputElement>,
    setRangeWidthPercentage: React.Dispatch<React.SetStateAction<number>>,
) {
    const { value } = event.target as HTMLInputElement;
    const truncatedValue = truncateDecimals(parseFloat(value), 2);

    setRangeWidthPercentage(truncatedValue);
}
