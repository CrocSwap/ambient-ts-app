import { MdClose } from 'react-icons/md';
import styles from './CustomBid.module.css';
import { CurrencySelector } from '../../../../components/Form/CurrencySelector';

import { useContext, useState } from 'react';
import {
    DEFAULT_MAINNET_GAS_PRICE_IN_GWEI,
    DEFAULT_SCROLL_GAS_PRICE_IN_GWEI,
    DEPOSIT_BUFFER_MULTIPLIER_MAINNET,
    DEPOSIT_BUFFER_MULTIPLIER_L2,
    GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE,
    NUM_GWEI_IN_ETH,
    NUM_WEI_IN_GWEI,
    ZERO_ADDRESS,
} from '../../../../ambient-utils/constants';
import useDebounce from '../../../hooks/useDebounce';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import TooltipComponent from '../../../../components/Global/TooltipComponent/TooltipComponent';
interface Props {
    handleClose: () => void;
    setQty: React.Dispatch<React.SetStateAction<string | undefined>>;
    setTokenModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

    tokenWalletBalance: string;
    tokenWalletBalanceTruncated: string;
    bidQtyNonDisplay: string | undefined;
    setBidQtyNonDisplay: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
}
export default function CustomBid(props: Props) {
    const [inputValue, setInputValue] = useState('');
    const { soloToken: selectedToken } = useContext(TradeDataContext);

    const { gasPriceInGwei, isActiveNetworkL2 } = useContext(ChainDataContext);
    const {
        handleClose,
        setQty,
        setTokenModalOpen,

        tokenWalletBalance,
        tokenWalletBalanceTruncated,
        setBidQtyNonDisplay,
    } = props;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;
    const [l1GasFeeLimitInGwei] = useState<number>(
        isActiveNetworkL2 ? 0.0002 * 1e9 : 0,
    );
    const isTokenEth = selectedToken.address === ZERO_ADDRESS;
    const amountToReduceNativeTokenQtyMainnet =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_MAINNET_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_MAINNET);

    const amountToReduceNativeTokenQtyL2 =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_SCROLL_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_L2);

    const amountToReduceNativeTokenQty = isActiveNetworkL2
        ? amountToReduceNativeTokenQtyL2
        : amountToReduceNativeTokenQtyMainnet;
    const isTokenWalletBalanceGreaterThanZero =
        parseFloat(tokenWalletBalance) > 0;
    const tokenWalletBalanceAdjustedNonDisplayString =
        isTokenEth && !!tokenWalletBalance
            ? (
                  BigInt(tokenWalletBalance) -
                  amountToReduceNativeTokenQty -
                  BigInt(l1GasFeeLimitInGwei * NUM_GWEI_IN_ETH)
              ).toString()
            : tokenWalletBalance;

    const adjustedTokenWalletBalanceDisplay = useDebounce(
        tokenWalletBalanceAdjustedNonDisplayString
            ? toDisplayQty(
                  tokenWalletBalanceAdjustedNonDisplayString,
                  selectedTokenDecimals,
              )
            : undefined,
        500,
    );
    const handleBalanceClick = () => {
        if (isTokenWalletBalanceGreaterThanZero) {
            setBidQtyNonDisplay(tokenWalletBalanceAdjustedNonDisplayString);

            if (adjustedTokenWalletBalanceDisplay)
                setInputValue(adjustedTokenWalletBalanceDisplay);
        }
    };

    const userQtyDisplay = (
        <div className={styles.userQtyDisplay}>
            <p style={{ color: 'var(--text2)' }}> {'...'}</p>
            {tokenWalletBalance !== '0' && (
                <div className={styles.maxButtonContainer}>
                    <p>{tokenWalletBalanceTruncated}</p>
                    <button onClick={handleBalanceClick}>Max</button>
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.container}>
            <header>
                <span />
                Custom Bid
                <MdClose color='#8b98a5' onClick={handleClose} />
            </header>
            {userQtyDisplay}

            <div className={styles.customBidContainer}>
                <div className={styles.fdvContainer}>
                    <p className={styles.label}>FDV Limit</p>
                    <input type='text' placeholder='$100,000' />
                </div>
                <div className={styles.bidSizeContainer}>
                    <p className={styles.label}>Max Bid size</p>
                    <div className={styles.currencySelectorContainer}>
                        <CurrencySelector
                            selectedToken={selectedToken}
                            setQty={setQty}
                            setTokenModalOpen={setTokenModalOpen}
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            customBorderRadius='0px'
                        />
                    </div>

                    <div className={styles.networkFeeContainer}>
                        <div className={styles.networkFeeRow}>
                            <div className={styles.alignCenter}>
                                <p>Network Fee</p>
                                <TooltipComponent
                                    title={
                                        'Estimated network fee (i.e. gas cost) to join bid'
                                    }
                                />
                            </div>

                            <p>value</p>
                        </div>
                    </div>
                    <button
                        className={styles.actionButton}
                        onClick={handleClose}
                    >
                        Bid
                    </button>
                </div>
            </div>
        </div>
    );
}
