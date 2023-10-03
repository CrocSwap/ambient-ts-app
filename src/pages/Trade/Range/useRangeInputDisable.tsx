import { useEffect, useState } from 'react';

export function useRangeInputDisable(
    isAmbient: boolean,
    isTokenABase: boolean,
    defaultHighTick: number,
    currentPoolPriceTick: number,
    defaultLowTick: number,
    isDenomBase: boolean,
) {
    const [isTokenAInputDisabled, setIsTokenAInputDisabled] = useState(false);
    const [isTokenBInputDisabled, setIsTokenBInputDisabled] = useState(false);

    // TODO: this logic can likely be simplified
    // Or at least made more readable
    useEffect(() => {
        if (!isAmbient) {
            if (isTokenABase) {
                if (defaultHighTick < currentPoolPriceTick) {
                    setIsTokenBInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenAInputDisabled(false);
                    } else setIsTokenAInputDisabled(true);
                } else if (defaultLowTick > currentPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else {
                    setIsTokenAInputDisabled(false);
                    setIsTokenBInputDisabled(false);
                }
            } else {
                if (defaultHighTick < currentPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else if (defaultLowTick > currentPoolPriceTick) {
                    setIsTokenBInputDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenAInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else {
                    setIsTokenBInputDisabled(false);
                    setIsTokenAInputDisabled(false);
                }
            }
        } else {
            setIsTokenBInputDisabled(false);
            setIsTokenAInputDisabled(false);
        }
    }, [
        isAmbient,
        isTokenABase,
        currentPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        isDenomBase,
    ]);
    return {
        isTokenAInputDisabled,
        isTokenBInputDisabled,
    };
}
