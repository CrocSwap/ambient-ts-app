export interface SlippageNewIF {
    stable: number,
    volatile: number
}

export const useSlippageNew = (
    slippageType: string,
    defaults: SlippageNewIF
): void => {
    console.log(slippageType, defaults);
}