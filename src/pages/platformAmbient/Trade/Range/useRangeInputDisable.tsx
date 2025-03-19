import { useEffect, useState } from 'react';

export function useRangeInputDisable(
    isAmbient: boolean,
    isTokenABase: boolean,
    currentPoolPriceTick: number | undefined,
    defaultLowTick: number,
    defaultHighTick: number,
    isDenomBase: boolean,
    isMintLiqEnabled = true,
) {
    const [isTokenAInputDisabled, setIsTokenAInputDisabled] = useState(false);
    const [isTokenBInputDisabled, setIsTokenBInputDisabled] = useState(false);

    // TODO: this logic can likely be simplified
    // Or at least made more readable
    useEffect(() => {
        if (
            currentPoolPriceTick === undefined ||
            currentPoolPriceTick === Infinity ||
            currentPoolPriceTick === -Infinity ||
            (defaultLowTick === 0 && defaultHighTick === 0)
        )
            return;
        if (!isMintLiqEnabled) {
            setIsTokenAInputDisabled(true);
            setIsTokenBInputDisabled(true);
        } else if (!isAmbient) {
            if (isTokenABase) {
                if (defaultHighTick <= currentPoolPriceTick) {
                    setIsTokenBInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenAInputDisabled(false);
                    } else setIsTokenAInputDisabled(true);
                } else if (defaultLowTick >= currentPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultLowTick < defaultHighTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else {
                    setIsTokenAInputDisabled(false);
                    setIsTokenBInputDisabled(false);
                }
            } else {
                if (defaultHighTick <= currentPoolPriceTick) {
                    setIsTokenAInputDisabled(true);
                    if (defaultHighTick > defaultLowTick) {
                        setIsTokenBInputDisabled(false);
                    } else setIsTokenBInputDisabled(true);
                } else if (defaultLowTick >= currentPoolPriceTick) {
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
        isMintLiqEnabled,
    ]);
    return {
        isTokenAInputDisabled,
        isTokenBInputDisabled,
    };
}
