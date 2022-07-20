import { useState } from 'react';

export const useSlippage = () => {
    console.log('ran useSlippage() hook');

    const [slipMintVolatile, setSlipMintVolatile] = useState<number>();
    const [slipMintStable, setSlipMintStable] = useState<number>();


    const [slipSwapVolatile, setSlipSwapVolatile] = useState<number>();
    const [slipSwapStable, setSlipSwapStable] = useState<number>();
    
}
