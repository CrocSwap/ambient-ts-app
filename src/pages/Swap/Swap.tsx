// START: Import React and Dongles
import { useMoralis } from 'react-moralis';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
    contractAddresses,
    getSpotPrice,
    getSpotPriceDisplay,
    POOL_PRIMARY,
    sendSwap,
    parseSwapEthersReceipt,
    EthersNativeReceipt,
} from '@crocswap-libs/sdk';

// START: Import React Components
import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import DenominationSwitch from '../../components/Swap/DenominationSwitch/DenomicationSwitch';
import DividerDark from '../../components/Global/DividerDark/DividerDark';

// START: Import Local Files
import { handleParsedReceipt } from '../../utils/HandleParsedReceipt';
import truncateDecimals from '../../utils/data/truncateDecimals';
import { isTransactionReplacedError, TransactionError } from '../../utils/TransactionError';
import { getCurrentTokens } from '../../utils/functions/processTokens';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { kovanETH, kovanUSDC } from './defaultTokens';
interface ISwapProps {
    provider: JsonRpcProvider;
    isOnTradeRoute?: boolean;
    gasPriceinGwei: string;
    nativeBalance: string;
    lastBlockNumber: number;
}

export default function Swap(props: ISwapProps) {
    const { provider, isOnTradeRoute, lastBlockNumber, nativeBalance, gasPriceinGwei } = props;

    const { Moralis, chainId } = useMoralis();

    const tradeData = useAppSelector((state) => state.tradeData);

    // get current tokens for the active chain
    // if called before Moralis can initialize use kovan
    const tokensBank = getCurrentTokens(chainId ?? '0x2a');

    const findTknByAddr = (addr: string) => {
        const tk = tokensBank.find((tkn: TokenIF) => tkn.address === addr);
        return tk;
    };

    const tokenPair = {
        dataTokenA: findTknByAddr(tradeData.addressTokenA) ?? kovanETH,
        dataTokenB: findTknByAddr(tradeData.addressTokenB) ?? kovanUSDC,
    };

    const [isSellTokenPrimary, setIsSellTokenPrimary] = useState<boolean>(true);

    const daiKovanAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);

    useEffect(() => {
        (async () => {
            const spotPrice = await getSpotPrice(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                // usdcKovanAddress,
                POOL_PRIMARY,
                provider,
            );
            if (poolPriceNonDisplay !== spotPrice) {
                setPoolPriceNonDisplay(spotPrice);
            }
        })();
    }, [lastBlockNumber]);

    const [poolPriceDisplay, setPoolPriceDisplay] = useState(0);

    useEffect(() => {
        (async () => {
            const spotPriceDisplay = await getSpotPriceDisplay(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                POOL_PRIMARY,
                provider,
            );
            if (poolPriceDisplay !== spotPriceDisplay) {
                setPoolPriceDisplay(spotPriceDisplay);
            }
        })();
    }, [lastBlockNumber]);

    const signer = provider?.getSigner();

    async function initiateSwap() {
        const sellTokenAddress = contractAddresses.ZERO_ADDR;
        const buyTokenAddress = daiKovanAddress;
        const poolId = POOL_PRIMARY;
        const slippageTolerancePercentage = 5;
        const sellTokenQty = (document.getElementById('sell-quantity') as HTMLInputElement)?.value;
        const buyTokenQty = (document.getElementById('buy-quantity') as HTMLInputElement)?.value;
        const qty = isSellTokenPrimary ? sellTokenQty : buyTokenQty;

        let ethValue = '0'; // Overwritten by a non-zero value when the user is selling ETH for another token

        // if the user is selling ETH and requesting an exact output quantity
        // then pad the amount of ETH sent to the contract by 2% (the remainder will be automatically returned)
        if (sellTokenAddress === contractAddresses.ZERO_ADDR) {
            const roundedUpEthValue = truncateDecimals(
                parseFloat(sellTokenQty) * 1.02,
                18,
            ).toString();
            isSellTokenPrimary ? (ethValue = sellTokenQty) : (ethValue = roundedUpEthValue);
        }

        if (signer) {
            const tx = await sendSwap(
                sellTokenAddress,
                buyTokenAddress,
                isSellTokenPrimary,
                qty,
                ethValue,
                slippageTolerancePercentage,
                poolId,
                signer,
            );

            let newTransactionHash = tx.hash;
            let parsedReceipt;

            console.log({ newTransactionHash });

            try {
                const receipt = await tx.wait();
                console.log({ receipt });
                parsedReceipt = await parseSwapEthersReceipt(
                    provider,
                    receipt as EthersNativeReceipt,
                );
            } catch (e) {
                const error = e as TransactionError;
                if (isTransactionReplacedError(error)) {
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info

                    // dispatch(removePendingTx(tx.hash));
                    console.log('repriced');
                    newTransactionHash = error.replacement.hash;
                    console.log({ newTransactionHash });
                    // dispatch(setCurrentTxHash(replacementTxHash));
                    // dispatch(addPendingTx(replacementTxHash));

                    parsedReceipt = await parseSwapEthersReceipt(
                        provider,
                        error.receipt as EthersNativeReceipt,
                    );
                }
            }
            if (parsedReceipt)
                handleParsedReceipt(Moralis, 'swap', newTransactionHash, parsedReceipt);
        }
    }

    return (
        <motion.main
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.7 } }}
            data-testid={'swap'}
        >
            <ContentContainer isOnTradeRoute={isOnTradeRoute}>
                <SwapHeader isOnTradeRoute={isOnTradeRoute} />
                <DenominationSwitch />
                <DividerDark />
                <CurrencyConverter
                    tokenPair={tokenPair}
                    isLiq={false}
                    poolPrice={poolPriceNonDisplay}
                    setIsSellTokenPrimary={setIsSellTokenPrimary}
                    nativeBalance={truncateDecimals(parseFloat(nativeBalance), 4).toString()}
                />
                <ExtraInfo
                    poolPriceDisplay={poolPriceDisplay}
                    slippageTolerance={5}
                    liquidityProviderFee={0.3}
                    quoteTokenIsBuy={true}
                    gasPriceinGwei={gasPriceinGwei}
                />
                <SwapButton onClickFn={initiateSwap} />
            </ContentContainer>
        </motion.main>
    );
}
