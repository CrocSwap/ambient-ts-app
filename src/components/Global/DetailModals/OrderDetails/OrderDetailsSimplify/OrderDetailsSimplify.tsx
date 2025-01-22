import moment from 'moment';
import { memo, useContext } from 'react';
import { FiCopy } from 'react-icons/fi';
import { RiExternalLinkLine } from 'react-icons/ri';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import { getFormattedNumber } from '../../../../../ambient-utils/dataLayer';
import { LimitOrderIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import InfoRow from '../../../InfoRow';
import styles from './OrderDetailsSimplify.module.css';

interface propsIF {
    limitOrder: LimitOrderIF;
    timeFirstMintMemo: number;
    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;

    usdValue: string | undefined;
    isDenomBase: boolean;
    isOrderFilled: boolean;
    isBid: boolean;
    quoteTokenLogo: string;
    baseTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenName: string;
    quoteTokenName: string;
    isFillStarted: boolean;
    truncatedDisplayPrice: string | undefined;
    isAccountView: boolean;
    originalPositionLiqBase: string;
    originalPositionLiqQuote: string;
    expectedPositionLiqBase: string;
    expectedPositionLiqQuote: string;
}

// TODO: refactor to using styled-components
function OrderDetailsSimplify(props: propsIF) {
    const {
        isBid,
        isOrderFilled,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenName,
        quoteTokenName,
        isDenomBase,
        usdValue,
        limitOrder,
        isAccountView,
        timeFirstMintMemo,
        originalPositionLiqBase,
        originalPositionLiqQuote,
        expectedPositionLiqBase,
        expectedPositionLiqQuote,
    } = props;

    const {
        activeNetwork: {
            chainSpec: { addrs },
        },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);

    const {
        ensName,
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
        finishPriceDisplay,
        startPriceDisplayDenomByMoneyness,
        middlePriceDisplayDenomByMoneyness,
        finishPriceDisplayDenomByMoneyness,
        isLimitOrderPartiallyFilled,
        fillPercentage,
        isBaseTokenMoneynessGreaterOrEqual,
        elapsedTimeString,
        elapsedTimeSinceFirstMintString,
        elapsedTimeSinceCrossString,
    } = useProcessOrder(limitOrder, crocEnv, userAddress, isAccountView);

    const showMobileVersion = useMediaQuery('(max-width: 768px)');
    const showFullAddresses = useMediaQuery('(min-width: 768px)');

    const [_, copy] = useCopyToClipboard();

    function handleCopyPositionHash() {
        copy(posHash.toString());
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
                    ? `${blockExplorer}address/${addrs.dex}`
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
            <p style={!ensName ? { fontFamily: 'monospace' } : undefined}>
                {showFullAddresses
                    ? ensName
                        ? ensName
                        : ownerId
                    : userNameToDisplay}
            </p>
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

    const submissionTime =
        moment(timeFirstMintMemo * 1000).format('MM/DD/YYYY HH:mm') +
        ' ' +
        '(' +
        elapsedTimeSinceFirstMintString +
        ' ago)';

    const updateTime =
        moment(limitOrder.latestUpdateTime * 1000).format('MM/DD/YYYY HH:mm') +
        ' ' +
        '(' +
        elapsedTimeString +
        ' ago)';
    const crossTime =
        moment(limitOrder.crossTime * 1000).format('MM/DD/YYYY HH:mm') +
        ' ' +
        '(' +
        elapsedTimeSinceCrossString +
        ' ago)';

    const status = isOrderFilled
        ? 'Fill Complete'
        : isLimitOrderPartiallyFilled
          ? 'Fill Partially Complete'
          : 'Fill Not Yet Started';

    const infoContent = [
        {
            title: 'Position Type ',
            content: 'Limit',
            explanation: 'A limit order is a type of range position ',
        },
        {
            title: 'Submit Time ',
            content: submissionTime,
            explanation: 'Time the owner first added a limit at this price',
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

        // { title: 'Fill Time ', content: fillTime, explanation: 'this is explanation' },
        {
            title: 'Status ',
            content: status,
            explanation: 'The current fill status of the order',
        },
        {
            title: 'Fill Completion ',
            content:
                getFormattedNumber({
                    value: fillPercentage,
                    minFracDigits: 0,
                    maxFracDigits: 0,
                }) + '%',

            explanation: 'The current fill percentage of the order',
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
                ? originalPositionLiqBase + ' ' + baseTokenSymbol
                : originalPositionLiqQuote + ' ' + quoteTokenSymbol,
            explanation: `The approximate input quantity of ${
                isBid ? baseTokenSymbol : quoteTokenSymbol
            }`,
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
                ? expectedPositionLiqQuote + ' ' + quoteTokenSymbol
                : expectedPositionLiqBase + ' ' + baseTokenSymbol,
            explanation: `The approximate output quantity of ${
                isBid ? quoteTokenSymbol : baseTokenSymbol
            } `,
        },

        {
            title: 'Fill Start ',
            content: isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1  ${quoteTokenSymbol} = ${startPriceDisplayDenomByMoneyness}  ${baseTokenSymbol}`
                    : `1  ${baseTokenSymbol} = ${startPriceDisplayDenomByMoneyness}  ${quoteTokenSymbol}`
                : isDenomBase
                  ? `1  ${baseTokenSymbol} = ${startPriceDisplay}  ${quoteTokenSymbol}`
                  : `1  ${quoteTokenSymbol} = ${startPriceDisplay}  ${baseTokenSymbol}`,
            explanation: 'Price at which token conversion starts',
        },
        {
            title: 'Fill Middle ',
            content: isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1  ${quoteTokenSymbol} = ${middlePriceDisplayDenomByMoneyness}  ${baseTokenSymbol}`
                    : `1  ${baseTokenSymbol} = ${middlePriceDisplayDenomByMoneyness}  ${quoteTokenSymbol}`
                : isDenomBase
                  ? `1  ${baseTokenSymbol} = ${middlePriceDisplay}  ${quoteTokenSymbol}`
                  : `1  ${quoteTokenSymbol} = ${middlePriceDisplay}  ${baseTokenSymbol}`,

            explanation:
                'The effective conversion price halfway between start and end',
        },
        {
            title: 'Fill End ',
            content: isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1  ${quoteTokenSymbol} = ${finishPriceDisplayDenomByMoneyness}  ${baseTokenSymbol}`
                    : `1  ${baseTokenSymbol} = ${finishPriceDisplayDenomByMoneyness}  ${quoteTokenSymbol}`
                : isDenomBase
                  ? `1  ${baseTokenSymbol} = ${finishPriceDisplay}  ${quoteTokenSymbol}`
                  : `1  ${quoteTokenSymbol} = ${finishPriceDisplay}  ${baseTokenSymbol}`,

            explanation:
                'Price at which conversion ends and limit order can be claimed',
        },
        {
            title: 'Value ',
            content: usdValue || '',
            explanation: 'The approximate US dollar value of the limit order',
        },
    ];

    if (isOrderFilled) {
        infoContent.splice(6, 0, {
            title: 'Fill Time ',
            content: crossTime,
            explanation:
                'Time the pool price crossed the limit (Fill End) price',
        });
    }
    if (submissionTime !== updateTime) {
        infoContent.splice(2, 0, {
            title: 'Update Time ',
            content: updateTime,
            explanation: 'Time the owner last updated the limit at this price',
        });
    }

    if (showMobileVersion)
        return (
            <div className={styles.tx_details_container}>
                <div className={styles.main_container}>
                    <section>
                        {infoContent.map((info, idx) => (
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

export default memo(OrderDetailsSimplify);
