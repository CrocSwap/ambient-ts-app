import { ChangeEvent, SetStateAction } from 'react';
import styles from './RangeCurrencyConverter.module.css';
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';
// import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

interface RangeCurrencyConverterProps {
    tokensBank: Array<TokenIF>;
    chainId: string;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isLiq?: boolean;
    poolPriceNonDisplay: number;
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    isTokenABase: boolean;
    depositSkew: number;
    setIsReversalInProgress: React.Dispatch<SetStateAction<boolean>>;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
}

export default function RangeCurrencyConverter(props: RangeCurrencyConverterProps) {
    // PLEASE PRESERVE COMMENTED-OUT CODE!!! -Emily
    const {
        chainId,
        isLiq,
        tokensBank,
        // poolPriceNonDisplay,
        tokenPair,
        // isTokenABase,
        // depositSkew,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        setIsReversalInProgress,
    } = props;

    // const dispatch = useAppDispatch();

    const handleChangeQtyTokenA = (evt: ChangeEvent<HTMLInputElement>) => {
        // const qtyTokenB = calculateSecondaryDepositQty(
        //     poolPriceNonDisplay,
        //     tokenPair.dataTokenA.decimals,
        //     tokenPair.dataTokenB.decimals,
        //     evt.target.value,
        //     true,
        //     isTokenABase,
        //     false,
        //     depositSkew,
        // )?.toString();
        // const fieldToUpdate = document.getElementById('buy-range-quantity') as HTMLInputElement;
        // fieldToUpdate.value = typeof qtyTokenB === 'string' ? qtyTokenB : '';
        // dispatch(setPrimQty(evt.target.value));
        // dispatch(setIsTokenAPrimary(true));
        console.log(evt);
    };

    const handleChangeQtyTokenB = (evt: ChangeEvent<HTMLInputElement>) => {
        // const qtyTokenA = calculateSecondaryDepositQty(
        //     poolPriceNonDisplay,
        //     tokenPair.dataTokenA.decimals,
        //     tokenPair.dataTokenB.decimals,
        //     evt.target.value,
        //     false,
        //     isTokenABase,
        //     false,
        //     depositSkew,
        // )?.toString();
        // const fieldToUpdate = document.getElementById('sell-range-quantity') as HTMLInputElement;
        // fieldToUpdate.value = typeof qtyTokenA === 'string' ? qtyTokenA : '';
        // dispatch(setPrimQty(evt.target.value));
        // dispatch(setIsTokenAPrimary(false));
        console.log(evt);
    };
    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorProps = {
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        setIsReversalInProgress: setIsReversalInProgress,
    };

    return (
        <section className={styles.currency_converter}>
            <RangeCurrencySelector
                fieldId='A'
                chainId={chainId}
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                updateOtherQuantity={handleChangeQtyTokenA}
                {...rangeCurrencySelectorProps}
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector
                fieldId='B'
                chainId={chainId}
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                updateOtherQuantity={handleChangeQtyTokenB}
                {...rangeCurrencySelectorProps}
            />
        </section>
    );
}
