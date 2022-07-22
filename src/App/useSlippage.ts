import { useEffect, useState } from 'react';

export const useSlippage = () => {
    const userData = JSON.parse(localStorage.getItem('user') as string);
    console.log(userData);

    const [slipSwapStable, setSlipSwapStable] = useState('');
    useEffect(() => {
        console.log({slipSwapStable});
        if (userData?.slippage) {
            if (slipSwapStable === '') {
                setSlipSwapStable(userData.slippage.swap.stable);
            } else {
                userData.slippage.swap.stable = slipSwapStable;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
    }, [slipSwapStable]);

    const [slipSwapVolatile, setSlipSwapVolatile] = useState('');
    useEffect(() => {
        if (userData?.slippage) {
            if (slipSwapVolatile === '') {
                setSlipSwapVolatile(userData.slippage.swap.volatile)
            } else {
                userData.slippage.swap.volatile = slipSwapVolatile;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
    }, [slipSwapVolatile]);

    const [slipMintStable, setSlipMintStable] = useState('');
    useEffect(() => {
        if (userData?.slippage) {
            if (slipMintStable === '') {
                setSlipMintStable(userData.slippage.mint.stable);
            } else {
                userData.slippage.mint.stable = slipMintStable;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
    }, [slipMintStable]);

    const [slipMintVolatile, setSlipMintVolatile] = useState('');
    useEffect(() => {
        if (userData?.slippage) {
            if (slipMintVolatile === '') {
                setSlipMintVolatile(userData.slippage.mint.volatile);
            } else {
                userData.slippage.mint.volatile = slipMintVolatile;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
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
