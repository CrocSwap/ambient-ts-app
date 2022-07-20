import { useEffect, useState } from 'react';

export const useSlippage = () => {
    // console.log('ran useSlippage() hook');

    const [slipSwapStable, setSlipSwapStable] = useState('2');
    useEffect(() => {console.log({slipSwapStable})}, [slipSwapStable]);

    const [slipSwapVolatile, setSlipSwapVolatile] = useState('4');
    useEffect(() => {console.log({slipSwapVolatile})}, [slipSwapVolatile]);

    const [slipMintStable, setSlipMintStable] = useState('3');
    useEffect(() => {console.log({slipMintStable})}, [slipMintStable]);

    const [slipMintVolatile, setSlipMintVolatile] = useState('7');
    useEffect(() => {console.log({slipMintVolatile})}, [slipMintVolatile]);

    return [
        // swap values and setter functions
        {
            stable: { value: slipSwapStable, setValue: setSlipSwapStable },
            volatile: { value: slipSwapVolatile, setValue: setSlipSwapVolatile }
        },
        // mint values and setter functions
        {
            stable: { value: slipMintStable, setValue: setSlipMintStable },
            volatile: { value: slipMintVolatile, setValue: setSlipMintVolatile }
        }
    ];
}
