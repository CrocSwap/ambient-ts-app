import { useContext, useState } from 'react';
import styles from './Ticker.module.css';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import {
    DEFAULT_MAINNET_GAS_PRICE_IN_GWEI,
    DEFAULT_SCROLL_GAS_PRICE_IN_GWEI,
    DEPOSIT_BUFFER_MULTIPLIER_MAINNET,
    DEPOSIT_BUFFER_MULTIPLIER_SCROLL,
    GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE,
    NUM_GWEI_IN_ETH,
    NUM_WEI_IN_GWEI,
    ZERO_ADDRESS,
} from '../../../ambient-utils/constants';
import { BigNumber } from 'ethers';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import useDebounce from '../../../App/hooks/useDebounce';
import { CurrencySelector } from '../../../components/Form/CurrencySelector';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';

export default function Ticker() {
    const [isMaxDropdownOpen, setIsMaxDropdownOpen] = useState(false);
    const [bidQtyNonDisplay, setBidQtyNonDisplay] = useState<
        string | undefined
    >();
    console.log(bidQtyNonDisplay);
    const [inputValue, setInputValue] = useState('');

    const [tokenWalletBalance] = useState<string>('');
    const { soloToken: selectedToken } = useContext(TradeDataContext);
    const { gasPriceInGwei, isActiveNetworkL2 } = useContext(ChainDataContext);

    const selectedTokenDecimals = selectedToken.decimals;

    const tokenWalletBalanceDisplay = tokenWalletBalance
        ? toDisplayQty(tokenWalletBalance, selectedTokenDecimals)
        : undefined;

    const tokenWalletBalanceDisplayNum = tokenWalletBalanceDisplay
        ? parseFloat(tokenWalletBalanceDisplay)
        : undefined;

    const tokenWalletBalanceTruncated = getFormattedNumber({
        value: tokenWalletBalanceDisplayNum,
    });

    const [l1GasFeeLimitInGwei] = useState<number>(
        isActiveNetworkL2 ? 0.0002 * 1e9 : 0,
    );
    const isTokenEth = selectedToken.address === ZERO_ADDRESS;
    const amountToReduceNativeTokenQtyMainnet = BigNumber.from(
        Math.ceil(gasPriceInGwei || DEFAULT_MAINNET_GAS_PRICE_IN_GWEI),
    )
        .mul(BigNumber.from(NUM_WEI_IN_GWEI))
        .mul(BigNumber.from(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE))
        .mul(BigNumber.from(DEPOSIT_BUFFER_MULTIPLIER_MAINNET));

    const amountToReduceNativeTokenQtyL2 = BigNumber.from(
        Math.ceil(gasPriceInGwei || DEFAULT_SCROLL_GAS_PRICE_IN_GWEI),
    )
        .mul(BigNumber.from(NUM_WEI_IN_GWEI))
        .mul(BigNumber.from(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE))
        .mul(BigNumber.from(DEPOSIT_BUFFER_MULTIPLIER_SCROLL));

    const amountToReduceNativeTokenQty = isActiveNetworkL2
        ? amountToReduceNativeTokenQtyL2
        : amountToReduceNativeTokenQtyMainnet;
    const isTokenWalletBalanceGreaterThanZero =
        parseFloat(tokenWalletBalance) > 0;
    const tokenWalletBalanceAdjustedNonDisplayString =
        isTokenEth && !!tokenWalletBalance
            ? BigNumber.from(tokenWalletBalance)

                  .sub(amountToReduceNativeTokenQty)
                  .sub(BigNumber.from(l1GasFeeLimitInGwei * NUM_GWEI_IN_ETH))
                  .toString()
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

    const statusData = [
        { label: 'status', value: 'OPEN', color: 'var(--accent1)' },
        {
            label: 'time remaining',
            value: 'XXh:XXm:XXs',
            color: 'var(--positive)',
        },
        { label: 'market cap (ETH)', value: 'XXX.XXX', color: 'var(--text1)' },
        {
            label: 'market cap ($)',
            value: '($XXX,XXX,XXX)',
            color: 'var(--text1)',
        },
    ];
    const openedBidData = [
        { label: 'market cap (ETH)', value: 'XXX.XXX', color: 'var(--text1)' },
        {
            label: 'market cap ($)',
            value: '($XXX,XXX,XXX)',
            color: 'var(--text1)',
        },
        {
            label: 'bid size',
            value: 'XXX.XXX / XXX.XXX',
            color: 'var(--accent1)',
        },
    ];
    const maxFdvData = [
        { value: 0.216, text: '$867' },
        { value: 0.271, text: '$1,084' },
        { value: 0.338, text: '$1,355' },
        { value: 0.423, text: '$1,694' },
        { value: 0.529, text: '$2,118' },
    ];
    const progressValue = 'XX.X';

    const [selectedMaxValue, setSelectedMaxValue] = useState(maxFdvData[0]);
    const handleSelectItem = (item: { value: number; text: string }) => {
        setSelectedMaxValue(item);
        setIsMaxDropdownOpen(false);
    };

    const tickerDisplay = (
        <div className={styles.tickerContainer}>
            <h2>TICKER</h2>
            {statusData.map((item, idx) => (
                <div className={styles.tickerRow} key={idx}>
                    <p className={styles.tickerLabel}>{item.label}:</p>
                    <p style={{ color: item.color }}>{item.value}</p>
                </div>
            ))}
        </div>
    );

    const openedBidDisplay = (
        <div className={styles.tickerContainer}>
            <h3>OPEN BID</h3>
            {openedBidData.map((item, idx) => (
                <div className={styles.tickerRow} key={idx}>
                    <p className={styles.tickerLabel}>{item.label}:</p>
                    <p style={{ color: item.color }}>{item.value}</p>
                </div>
            ))}
            <div className={styles.progressContainer}>
                <div className={styles.progressContent}>
                    {Array.from({ length: 10 }, (_, idx) => (
                        <span className={styles.progressBar} key={idx} />
                    ))}
                </div>
                <p className={styles.progressValue}>{progressValue}</p>
            </div>
        </div>
    );

    const maxFdvDisplay = (
        <div className={styles.tickerContainer}>
            <h3>MAX FDV</h3>
            <div className={styles.maxDropdownContainer}>
                <button
                    onClick={() => setIsMaxDropdownOpen(!isMaxDropdownOpen)}
                    className={styles.maxDropdownButton}
                >
                    {selectedMaxValue.text}
                    <p>({selectedMaxValue.value})</p>
                </button>
                {isMaxDropdownOpen && (
                    <div className={styles.maxDropdownContent}>
                        {maxFdvData.map((item, idx) => (
                            <div
                                className={styles.maxRow}
                                key={idx}
                                onClick={() => handleSelectItem(item)}
                            >
                                {item.text}
                                <p>({item.value})</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const userQtyDisplay = (
        <div className={styles.userQtyDisplay}>
            <p style={{ color: 'var(--text2)' }}> {'...'}</p>
            {tokenWalletBalance !== '0' && (
                <div
                    className={styles.maxButtonContainer}
                    onClick={handleBalanceClick}
                >
                    <p>{tokenWalletBalanceTruncated}</p>
                </div>
            )}
        </div>
    );
    const bidSizeDisplay = (
        <div className={styles.tickerContainer}>
            <h3>BID SIZE</h3>
            <CurrencySelector
                selectedToken={selectedToken}
                setQty={setBidQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                customBottomContent={userQtyDisplay}
                customBorderRadius='0px'
                noModals
            />
        </div>
    );

    return (
        <div className={styles.container}>
            <BreadCrumb />
            {tickerDisplay}
            {openedBidDisplay}
            {maxFdvDisplay}
            {bidSizeDisplay}
        </div>
    );
}
