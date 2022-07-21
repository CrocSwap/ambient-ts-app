import { useEffect, useState } from 'react';

export const useSlippage = () => {
    const userData = JSON.parse(localStorage.getItem('user') as string);

    const [slipSwapStable, setSlipSwapStable] = useState('2');
    useEffect(() => {
        console.log(slipSwapStable);
        console.log(userData);
        userData.slippage.swap.stable = slipSwapStable;
        localStorage.setItem('user', JSON.stringify(userData));
    }, [slipSwapStable]);

    const [slipSwapVolatile, setSlipSwapVolatile] = useState('4');
    useEffect(() => {
        console.log({slipSwapVolatile});
        userData.slippage.swap.volatile = slipSwapVolatile;
        localStorage.setItem('user', JSON.stringify(userData));
    }, [slipSwapVolatile]);

    const [slipMintStable, setSlipMintStable] = useState('3');
    useEffect(() => {
        console.log({slipMintStable});
        userData.slippage.mint.stable = slipMintStable;
        localStorage.setItem('user', JSON.stringify(userData));
    }, [slipMintStable]);

    const [slipMintVolatile, setSlipMintVolatile] = useState('7');
    useEffect(() => {
        console.log({slipMintVolatile});
        userData.slippage.mint.volatile = slipMintVolatile;
        localStorage.setItem('user', JSON.stringify(userData));
    }, [slipMintVolatile]);

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
