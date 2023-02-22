import { useAppSelector } from './reduxToolkit';

export const useParamsBuilder = (chainId: string): (
    (destination: string) => string
) => {
    console.log('ran custom hook useParamsBuilder()');
    const { tradeData } = useAppSelector(state => state);
    false && tradeData;

    const makeParam = (paramKey: string): string => {
        let value: string;
        switch (paramKey) {
            case 'chain':
                value = chainId;
                break;
            case 'tokenA':
                value = tradeData.tokenA.address;
                break;
            case 'tokenB':
                value = tradeData.tokenB.address;
                break;
            case 'lowTick':
                value = tradeData.advancedLowTick.toString();
                break;
            case 'highTick':
                value = tradeData.advancedHighTick.toString();
                break;
            case 'limitTick':
                value = tradeData.limitTick?.toString() ?? '';
                break;
            default:
                value = '';
        }
        const output = paramKey + '=' + value;
        return output;
    }

    const getNavPath = (destination: string) => {
        return destination;
    }

    return getNavPath;
}