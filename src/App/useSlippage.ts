import { useState } from 'react';

export const useSlippage = () => {
    console.log('ran useSlippage() hook');

    const [slipSwapStable, setSlipSwapStable] = useState<number>();
    const [slipSwapVolatile, setSlipSwapVolatile] = useState<number>();

    const [slipMintStable, setSlipMintStable] = useState<number>();
    const [slipMintVolatile, setSlipMintVolatile] = useState<number>();

    return [
        // swap values and setter functions
        {
            stable: { value: slipSwapStable, setValue: setSlipSwapStable },
            volatile: { value: slipSwapVolatile, setValue: setSlipSwapVolatile}
        },
        // mint values and setter functions
        {
            stable: { value: slipMintStable, setValue: setSlipMintStable },
            volatile: { value: slipMintVolatile, setValue: setSlipMintVolatile}
        }
    ];
}
