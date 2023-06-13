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
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface OrderDetailsSimplifyPropsIF {
    limitOrder: LimitOrderIF;

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
    baseTokenName: string;
    quoteTokenName: string;
    isFillStarted: boolean;
    truncatedDisplayPrice: string | undefined;
    isAccountView: boolean;
}
export default function OrderDetailsSimplify(
    props: OrderDetailsSimplifyPropsIF,
) {
    const {
        isBid,
        approximateSellQtyTruncated,
        approximateBuyQtyTruncated,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isOrderFilled,
        // quoteTokenLogo,
        // baseTokenLogo,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenName,
        quoteTokenName,
        isFillStarted,
        // truncatedDisplayPrice,
        // isDenomBase,
        usdValue,
        limitOrder,
        isAccountView,
    } = props;

    const { chainData } = useContext(CrocEnvContext);

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const {
        userNameToDisplay,
        posHashTruncated,
        posHash,
        isOwnerActiveAccount,
        ownerId,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        blockExplorer,
        baseTokenAddressLowerCase,
        quoteTokenAddressLowerCase,
        startPriceDisplay,
        middlePriceDisplay,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
        startPriceDisplayDenomByMoneyness,
        middlePriceDisplayDenomByMoneyness,
    } = useProcessOrder(limitOrder, userAddress, isAccountView);

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

    function handleOpenBaseAddress() {
        if (posHash && blockExplorer) {
            const adressUrl =
                baseTokenAddressLowerCase === ZERO_ADDRESS
                    ? `${blockExplorer}address/${chainData.addrs.dex}`
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

    const walletContent = (
        <div
            className={styles.link_row}
            onClick={handleOpenWallet}
            style={{ cursor: 'pointer' }}
        >
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
        <div
            onClick={handleOpenBaseAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{baseTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );
    const quoteAddressContent = (
        <div
            onClick={handleOpenQuoteAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{quoteTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    const submissionTime = moment(limitOrder.timeFirstMint * 1000).format(
        'MM/DD/YYYY HH:mm',
    );

    const status = isOrderFilled ? 'Filled' : 'Not Filled';

    const infoContent = [
        {
            title: 'Position Type ',
            content: 'Limit',
            explanation: 'A limit order is a type of range position ',
        },
        {
            title: 'Wallet ',
            content: walletContent,
            explanation: 'The account of the limit owner',
        },
        {
            title: 'Position Slot ID ',
            content: posHashContent,
            // eslint-disable-next-line quotes
            explanation: "A unique identifier for this user's position",
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
            content: isBid
                ? baseTokenSymbol + ' - ' + baseTokenName
                : quoteTokenSymbol + ' - ' + quoteTokenName,
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
            content: isBid
                ? quoteTokenSymbol + ' - ' + quoteTokenName
                : baseTokenSymbol + ' - ' + baseTokenName,
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
            content: isAccountView
                ? startPriceDisplayDenomByMoneyness
                : startPriceDisplay,
            explanation: 'Price at which the limit order fill starts',
        },
        {
            title: 'Fill Middle ',
            content: isAccountView
                ? middlePriceDisplayDenomByMoneyness
                : middlePriceDisplay,
            explanation:
                'The effective price - halfway between start and finish',
        },
        {
            title: 'Fill End ',
            content: isAccountView
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
