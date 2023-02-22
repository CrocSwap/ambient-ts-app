import { useAppSelector } from './reduxToolkit';

export const useParamsFactory = () => {
    console.log('ran custom hook useParamsBuilder()');
    const { tradeData } = useAppSelector(state => state);
    false && tradeData;
}