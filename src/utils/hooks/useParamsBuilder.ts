import { useAppSelector } from './reduxToolkit';

export const useParamsBuilder = (chainId: string): (
    (destination: string) => string
) => {
    console.log('ran custom hook useParamsBuilder()');
    const { tradeData } = useAppSelector(state => state);

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
        const output = value ? paramKey + '=' + value : '';
        return output;
    }

    const getNavPath = (destination: string): string => {
        let baseUrl: string;
        let paramsNeeded: string[];
        switch (destination) {
            case 'index':
                baseUrl = '';
                paramsNeeded = [];
                break;
            case 'swap':
                baseUrl = '/swap';
                paramsNeeded = ['chain', 'tokenA', 'tokenB'];
                break;
            case 'trade':
            case 'market':
                baseUrl = '/trade/market';
                paramsNeeded = ['chain', 'tokenA', 'tokenB'];
                break;
            case 'limit':
                baseUrl = '/trade/limit';
                paramsNeeded = ['chain', 'tokenA', 'tokenB'];
                break;
            case 'range':
                baseUrl = '/trade/range';
                paramsNeeded = ['chain', 'tokenA', 'tokenB', 'lowTick', 'highTick'];
                break;
            case 'portfolio':
            case 'account':
                baseUrl = '/account';
                paramsNeeded = [];
                break;
            default:
                baseUrl = '';
                paramsNeeded = [];
                break;
        }

        const paramsString = paramsNeeded
            .map((param: string) => makeParam(param))
            .join('&');

        const navPath = baseUrl + '/' + paramsString;

        return navPath;
    }

    return getNavPath;
}