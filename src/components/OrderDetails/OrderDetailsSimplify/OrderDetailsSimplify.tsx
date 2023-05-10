import styles from './OrderDetailsSimplify.module.css';
import { LimitOrderIF } from '../../../utils/interfaces/exports';
import { ZERO_ADDRESS } from '../../../constants';
import { RiExternalLinkLine } from 'react-icons/ri';
import { useProcessOrder } from '../../../utils/hooks/useProcessOrder';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import moment from 'moment';
import { FiCopy } from 'react-icons/fi';
import { useContext } from 'react';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface OrderDetailsSimplifyPropsIF {
    limitOrder: LimitOrderIF;
    account: string;

    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;

    usdValue: string | undefined;
    isDenomBase: boolean;
    isOrderFilled: boolean;
    isBid: boolean;
    approximateSellQtyTruncated: string;
    approximateBuyQtyTruncated: string;
    baseDisplayFrontend: string;
    quoteDisplayFrontend: string;
    quoteTokenLogo: string;
    baseTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    isFillStarted: boolean;
    truncatedDisplayPrice: string | undefined;
    isOnPortfolioPage: boolean;
}
export default function OrderDetailsSimplify(
    props: OrderDetailsSimplifyPropsIF,
) {
    const {
        isBid,
        account,
        approximateSellQtyTruncated,
        approximateBuyQtyTruncated,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isOrderFilled,
        // quoteTokenLogo,
        // baseTokenLogo,
        baseTokenSymbol,
        quoteTokenSymbol,
        isFillStarted,
        // truncatedDisplayPrice,
        // isDenomBase,
        usdValue,
        limitOrder,
        isOnPortfolioPage,
    } = props;

    const {
        userNameToDisplay,
        posHashTruncated,
        posHash,
        // blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        // usdValue,
        // baseTokenSymbol,
        // quoteTokenSymbol,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        // isOrderFilled,

        // isDenomBase,
        // baseTokenLogo,
        // quoteTokenLogo,
        // lowPriceDisplay,
        // highPriceDisplay,
        // bidTick,
        // askTick,
        // positionLiqTotalUSD,

        // baseDisplay,
        // quoteDisplay,
        blockExplorer,
        baseTokenAddressLowerCase,
        quoteTokenAddressLowerCase,

        // truncatedLowDisplayPrice,
        // truncatedHighDisplayPrice,
        startPriceDisplay,
        middlePriceDisplay,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
        startPriceDisplayDenomByMoneyness,
        middlePriceDisplayDenomByMoneyness,
        // truncatedLowDisplayPriceDenomByMoneyness,
        // truncatedHighDisplayPriceDenomByMoneyness,
        // truncatedDisplayPriceDenomByMoneyness,
        // isBaseTokenMoneynessGreaterOrEqual,
        // positionLiquidity,
    } = useProcessOrder(limitOrder, account, isOnPortfolioPage);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const [_, copy] = useCopyToClipboard();

    function handleCopyPositionHash() {
        copy(posHash.toString());
        // setCopiedData(posHash.toString());

        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount ? '/account' : `/${ownerId}`;
        window.open(walletUrl);
    }
    // function handleOpenExplorer() {
    //     if (posHash && blockExplorer) {
    //         const explorerUrl = `${blockExplorer}tx/${posHash}`;
    //         window.open(explorerUrl);
    //     }
    // }
    function handleOpenBaseAddress() {
        if (posHash && blockExplorer) {
            const adressUrl =
                baseTokenAddressLowerCase === ZERO_ADDRESS
                    ? `${blockExplorer}address/0xfafcd1f5530827e7398b6d3c509f450b1b24a209`
                    : `${blockExplorer}token/${baseTokenAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (posHash && blockExplorer) {
            const adressUrl = `${blockExplorer}token/${quoteTokenAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    // const txContent = (
    //     <div className={styles.link_row} onClick={handleOpenExplorer}>
    //         <p>{posHashTruncated}</p>
    //         <RiExternalLinkLine />
    //     </div>
    // );

    const walletContent = (
        <div className={styles.link_row} onClick={handleOpenWallet}>
            <p>{userNameToDisplay}</p>
            <RiExternalLinkLine />
        </div>
    );

    const posHashContent = (
        <div className={styles.link_row} onClick={handleCopyPositionHash}>
            <p>{posHashTruncated}</p>
            <FiCopy />
        </div>
    );

    const baseAddressContent = (
        <div onClick={handleOpenBaseAddress} className={styles.link_row}>
            <p>{baseTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );
    const quoteAddressContent = (
        <div onClick={handleOpenQuoteAddress} className={styles.link_row}>
            <p>{quoteTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    const submissionTime = moment(limitOrder.timeFirstMint * 1000).format(
        'MM/DD/YYYY HH:mm',
    );
    // const fillTime = moment(limitOrder.latestCrossPivotTime * 1000).format('MM/DD/YYYY HH:mm');

    const status = isOrderFilled ? 'Filled' : 'Not Filled';

    const infoContent = [
        {
            title: 'Position Type ',
            content: 'Limit',
            explanation: 'A limit order is a type of range position ',
        },
        {
            title: 'Position Slot ID ',
            content: posHashContent,
            // eslint-disable-next-line quotes
            explanation: "A unique identifier for this user's position",
        },
        {
            title: 'Wallet ',
            content: walletContent,
            explanation: 'The account of the limit owner',
        },

        // { title: 'Submit Transaction ', content: txContent, explanation: 'this is explanation' },
        // { title: 'Claim Transaction ', content: txContent, explanation: 'this is explanation' },

        {
            title: 'Submit Time ',
            content: submissionTime,
            explanation: 'The time the owner first added a limit at this price',
        },
        // { title: 'Fill Time ', content: fillTime, explanation: 'this is explanation' },
        {
            title: 'Status ',
            content: status,
            explanation: 'The current fill status of the order.',
        },

        {
            title: 'From Token ',
            content: isBid ? baseTokenSymbol : quoteTokenSymbol,
            explanation: 'The symbol (short name) of the sell token',
        },

        {
            title: 'From Address ',
            content: isBid ? baseAddressContent : quoteAddressContent,
            explanation: 'Address of the From/Sell Token',
        },

        {
            title: 'From Qty ',
            content: isBid
                ? isFillStarted
                    ? approximateSellQtyTruncated
                    : baseDisplayFrontend
                : // : baseDisplayFrontend + ' ' + baseTokenSymbol
                isFillStarted
                ? approximateSellQtyTruncated
                : quoteDisplayFrontend,
            explanation:
                'The quantity of the sell token (scaled by its decimals value)',
        },

        {
            title: 'To Token ',
            content: isBid ? quoteTokenSymbol : baseTokenSymbol,
            explanation: 'The symbol (short name) of the buy token',
        },

        {
            title: 'To Address ',
            content: isBid ? quoteAddressContent : baseAddressContent,
            explanation: 'Address of the From/Sell Token',
        },

        {
            title: 'To Qty ',
            content: isBid
                ? isOrderFilled
                    ? quoteDisplayFrontend
                    : approximateBuyQtyTruncated
                : // : approximateBuyQtyTruncated + ' ' + quoteTokenSymbol
                isOrderFilled
                ? baseDisplayFrontend
                : approximateBuyQtyTruncated,
            explanation:
                'The quantity of the to/buy token (scaled by its decimals value)',
        },

        {
            title: 'Fill Start ',
            content: isOnPortfolioPage
                ? startPriceDisplayDenomByMoneyness
                : startPriceDisplay,
            explanation: 'Price at which the limit order fill starts',
        },
        {
            title: 'Fill Middle ',
            content: isOnPortfolioPage
                ? middlePriceDisplayDenomByMoneyness
                : middlePriceDisplay,
            explanation:
                'The effective price - halfway between start and finish',
        },
        {
            title: 'Fill End ',
            content: isOnPortfolioPage
                ? truncatedDisplayPriceDenomByMoneyness
                : truncatedDisplayPrice,
            explanation: 'Price at which limit order fill ends',
        },
        {
            title: 'Value ',
            content: '$' + usdValue,
            explanation: 'The appoximate US dollar value of the limit order',
        },

        // {
        //     title: 'Rebate Rate ',
        //     content: 'rebate rate',
        //     explanation: 'this is explanation',
        // },

        // { title: 'Network Fee ', content: 'network fee', explanation: 'this is explanation' },
    ];

    function InfoRow(props: ItemRowPropsIF) {
        const { title, content, explanation } = props;

        return (
            <div className={styles.info_row_container}>
                <div className={styles.title_container}>
                    <p>{title}</p>
                    <TooltipComponent title={explanation} placement={'right'} />
                </div>

                <div>{content}</div>
            </div>
        );
    }

    return (
        <div className={styles.tx_details_container}>
            <div className={styles.main_container}>
                <section>
                    {infoContent.slice(0, 10).map((info, idx) => (
                        <InfoRow
                            key={info.title + idx}
                            title={info.title}
                            content={info.content}
                            explanation={info.explanation}
                        />
                    ))}
                </section>

                <section>
                    {infoContent
                        .slice(10, infoContent.length)
                        .map((info, idx) => (
                            <InfoRow
                                key={info.title + idx}
                                title={info.title}
                                content={info.content}
                                explanation={info.explanation}
                            />
                        ))}
                </section>
            </div>
        </div>
    );
}
