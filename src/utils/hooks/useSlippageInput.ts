import { Dispatch, SetStateAction, useState } from 'react';

export const useSlippageInput = (
    persistedSlippage: number,
    setCurrentSlippage: Dispatch<SetStateAction<number>>,
): [slip: string, takeNewSlippage: (val: string | number) => void] => {
    // this layer is necessary to make the `<input />` responsive to change
    // future Emily this is past Emily yes you're going to hate this
    // ... implementation but please trust me it really is necessary
    const [slip, setSlip] = useState<string>(persistedSlippage.toString());
    function takeNewSlippage(val: string | number): void {
        // setSlip() needs a string
        // setCurrentSlippage needs a number (float)
        if (typeof val === 'string') {
            setSlip(val);
            setCurrentSlippage(parseFloat(val));
        } else if (typeof val === 'number') {
            setSlip(val.toString());
            setCurrentSlippage(val);
        }
    }

    return [slip, takeNewSlippage];
};
