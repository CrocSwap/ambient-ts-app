import { useEffect, useState } from 'react';

export const useSlippage = () => {
    const userData = JSON.parse(localStorage.getItem('user') as string);

    const [slipSwapStable, setSlipSwapStable] = useState('');
    const [slipSwapVolatile, setSlipSwapVolatile] = useState('');
    const [slipMintStable, setSlipMintStable] = useState('');
    const [slipMintVolatile, setSlipMintVolatile] = useState('');
    const [slipRepoStable, setSlipRepoStable] = useState('');
    const [slipRepoVolatile, setSlipRepoVolatile] = useState('');

    const [needInitialization, setNeedInitialization] = useState(true);

    if (needInitialization && userData?.slippage) {
        setSlipSwapStable(userData.slippage.swap.stable);
        setSlipSwapVolatile(userData.slippage.swap.volatile);
        setSlipMintStable(userData.slippage.mint.stable);
        setSlipMintVolatile(userData.slippage.mint.volatile);
        setNeedInitialization(false);
    }

    useEffect(() => {
        if (userData?.slippage) {
            if (slipSwapStable === '') {
                setSlipSwapStable(userData.slippage.swap.stable);
            } else {
                userData.slippage.swap.stable = slipSwapStable;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
    }, [slipSwapStable]);

    useEffect(() => {
        if (userData?.slippage) {
            if (slipSwapVolatile === '') {
                setSlipSwapVolatile(userData.slippage.swap.volatile);
            } else {
                userData.slippage.swap.volatile = slipSwapVolatile;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
    }, [slipSwapVolatile]);

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


    useEffect(() => {
        if (userData?.slippage) {
            if (slipRepoStable === '') {
                setSlipRepoStable(userData.slippage.repo.stable);
            } else {
                userData.slippage.repo.stable = slipRepoStable;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
    }, [slipRepoStable]);

    useEffect(() => {
        if (userData?.slippage) {
            if (slipRepoVolatile === '') {
                setSlipRepoVolatile(userData.slippage.repo.volatile);
            } else {
                userData.slippage.repo.volatile = slipRepoVolatile;
                localStorage.setItem('user', JSON.stringify(userData));
            }
        }
    }, [slipRepoVolatile]);



    return [
        // swap values and setter functions
        {
            stable: { value: slipSwapStable, setValue: setSlipSwapStable },
            volatile: { value: slipSwapVolatile, setValue: setSlipSwapVolatile },
        },
        // mint values and setter functions
        {
            stable: { value: slipMintStable, setValue: setSlipMintStable },
            volatile: { value: slipMintVolatile, setValue: setSlipMintVolatile },
        },
        // reposition values and setter functions
        {
            stable: { value: slipRepoStable, setValue: setSlipRepoStable },
            volatile: { value: slipRepoVolatile, setValue: setSlipRepoVolatile },
        },
    ];
};
