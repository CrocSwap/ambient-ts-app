import moment from 'moment';
import { memo, useContext } from 'react';
import { RiExternalLinkLine } from 'react-icons/ri';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import { getElapsedTime } from '../../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import InfoRow from '../../../InfoRow';
import styles from './TransactionDetailsSimplify.module.css';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';

interface TransactionDetailsSimplifyPropsIF {
    tx: TransactionIF;
    isAccountView: boolean;
    timeFirstMintMemo: number | undefined;
}

// TODO: refactor to using styled-components
function TransactionDetailsSimplify(props: TransactionDetailsSimplifyPropsIF) {
    const { tx, isAccountView, timeFirstMintMemo } = props;
    const { activeNetwork } = useContext(AppStateContext);
    const { userAddress } = useContext(UserDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const {
        ensName,
        userNameToDisplay,
        txHashTruncated,
        txHash,
        blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        isDenomBase,
        baseQuantityDisplay,
        quoteQuantityDisplay,
        estimatedBaseFlowDisplay,
        estimatedQuoteFlowDisplay,
        baseTokenAddress,
        quoteTokenAddress,
        usdValue,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        truncatedDisplayPrice,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        elapsedTimeString,
    } = useProcessTransaction(tx, userAddress, crocEnv);

    const showFullAddresses = useMediaQuery('(min-width: 768px)');

    const isAmbient = tx.positionType === 'ambient';

    const isBuy = tx.isBid || tx.isBuy;

    const isSwap = tx.entityType === 'swap' || tx.entityType === 'limitOrder';
    const isLimitRemoval =
        tx.entityType === 'limitOrder' && tx.changeType === 'burn';

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount ? '/account' : `/${ownerId}`;
        window.open(walletUrl);
    }
    function handleOpenExplorer() {
        if (txHash && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${txHash}`;
            window.open(explorerUrl);
        }
    }
    function handleOpenBaseAddress() {
        if (txHash && blockExplorer) {
            const adressUrl =
                baseTokenAddress === ZERO_ADDRESS
                    ? `${blockExplorer}address/${activeNetwork.chainSpec.addrs.dex}`
                    : `${blockExplorer}token/${baseTokenAddress}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (txHash && blockExplorer) {
            const adressUrl = `${blockExplorer}token/${quoteTokenAddress}`;
            window.open(adressUrl);
        }
    }
    const txContent = (
        <div
            className={styles.link_row}
            onClick={handleOpenExplorer}
            style={{ cursor: 'pointer' }}
        >
            <p style={{ fontFamily: 'monospace' }}>
                {showFullAddresses ? txHash : txHashTruncated}
            </p>
            <RiExternalLinkLine />
        </div>
    );

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

    const baseAddressContent = (
        <div
            onClick={handleOpenBaseAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p style={{ fontFamily: 'monospace' }}>
                {showFullAddresses ? tx.base : baseTokenAddressTruncated}
            </p>
            <RiExternalLinkLine />
        </div>
    );
    const quoteAddressContent = (
        <div
            onClick={handleOpenQuoteAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p style={{ fontFamily: 'monospace' }}>
                {showFullAddresses ? tx.quote : quoteTokenAddressTruncated}
            </p>
            <RiExternalLinkLine />
        </div>
    );

    const changeType = tx.changeType;
    const positionType = tx.positionType;
    const entityType = tx.entityType;

    const changeTypeDisplay =
        changeType === 'harvest'
            ? 'Range Harvest'
            : changeType === 'mint'
              ? entityType === 'limitOrder'
                  ? 'Limit Add'
                  : positionType === 'concentrated'
                    ? 'Concentrated Range Add'
                    : 'Ambient Range Add'
              : changeType === 'burn'
                ? entityType === 'limitOrder'
                    ? 'Limit Removal'
                    : positionType === 'concentrated'
                      ? 'Concentrated Range Removal'
                      : 'Ambient Range Removal'
                : changeType === 'recover'
                  ? 'Limit Claim'
                  : 'Market Order';

    // Create a data array for the info and map through it here
    const infoContent = [
        {
            title: 'Transaction Type ',
            content: (
                <div style={{ cursor: 'default' }}>{changeTypeDisplay}</div>
            ),
            explanation: 'e.g. Market, Limit, Range',
        },

        {
            title: 'Transaction Time ',
            content: (
                <div style={{ cursor: 'default' }}>
                    {moment(tx.txTime * 1000).format('MM/DD/YYYY HH:mm')}
                    {' '}
                    {'(' + elapsedTimeString + ' ago)'}
                </div>
            ),
            explanation: 'The transaction confirmation time',
        },
        {
            title: 'Wallet ',
            content: walletContent,
            explanation: 'The account of the transaction owner',
        },

        {
            title: 'Transaction ',
            content: txContent,
            explanation: 'The transaction hash',
        },

        {
            title: isSwap ? 'From Token ' : 'Token 1 ',
            content: (
                <div style={{ cursor: 'default' }}>
                    {isBuy
                        ? baseTokenSymbol + ' - ' + tx.baseName
                        : quoteTokenSymbol + ' - ' + tx.quoteName}
                </div>
            ),
            explanation: 'The symbol (short name) of the sell token',
        },

        {
            title: isSwap ? 'From Address ' : 'Token 1 Address',
            content: isBuy ? baseAddressContent : quoteAddressContent,
            explanation: 'Address of the From/Sell Token',
        },

        {
            title: isLimitRemoval
                ? 'From Qty Removed '
                : isSwap
                  ? 'From Qty '
                  : 'Token 1 Qty',
            content: (
                <div style={{ cursor: 'default' }}>
                    {isBuy
                        ? `${
                              tx.entityType !== 'limitOrder' ||
                              tx.changeType === 'burn' ||
                              tx.changeType === 'mint' ||
                              isLimitRemoval
                                  ? baseQuantityDisplay
                                  : estimatedBaseFlowDisplay || '0.00'
                          } ${baseTokenSymbol}`
                        : `${
                              tx.entityType !== 'limitOrder' ||
                              tx.changeType === 'burn' ||
                              tx.changeType === 'mint' ||
                              isLimitRemoval
                                  ? quoteQuantityDisplay
                                  : estimatedQuoteFlowDisplay || '0.00'
                          } ${quoteTokenSymbol}`}
                </div>
            ),
            explanation: `The quantity of the sell token ${
                isLimitRemoval ? 'removed ' : ''
            }`,
        },

        {
            title: isSwap ? 'To Token ' : 'Token 2 ',
            content: !isBuy
                ? baseTokenSymbol + ' - ' + tx.baseName
                : quoteTokenSymbol + ' - ' + tx.quoteName,
            explanation: 'The symbol (short name) of the buy token',
        },

        {
            title: isSwap ? 'To Address ' : 'Token 2 Address',
            content: !isBuy ? baseAddressContent : quoteAddressContent,
            explanation: 'Address of the To/Buy Token',
        },

        {
            title: isLimitRemoval
                ? 'To Token Claimed '
                : isSwap
                  ? 'To Qty '
                  : 'Token 2 Qty ',
            content: (
                <div style={{ cursor: 'default' }}>
                    {!isBuy
                        ? `${
                              tx.entityType !== 'limitOrder' ||
                              tx.changeType === 'recover' ||
                              isLimitRemoval
                                  ? baseQuantityDisplay
                                  : estimatedBaseFlowDisplay || '0.00'
                          } ${baseTokenSymbol}`
                        : `${
                              tx.entityType !== 'limitOrder' ||
                              tx.changeType === 'recover' ||
                              isLimitRemoval
                                  ? quoteQuantityDisplay
                                  : estimatedQuoteFlowDisplay || '0.00'
                          } ${quoteTokenSymbol}`}
                </div>
            ),
            explanation: `The quantity of the to/buy token ${
                isLimitRemoval ? 'claimed ' : ''
            }`,
        },
        {
            title:
                tx.entityType === 'swap'
                    ? 'Price '
                    : tx.entityType === 'limitOrder'
                      ? 'Limit Price '
                      : 'Low Price Boundary',
            content: (
                <div style={{ cursor: 'default' }}>
                    {isSwap
                        ? isAccountView
                            ? isBaseTokenMoneynessGreaterOrEqual
                                ? `1 ${quoteTokenSymbol} = ${truncatedDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                                : `1 ${baseTokenSymbol} = ${truncatedDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                            : isDenomBase
                              ? `1 ${baseTokenSymbol} = ${truncatedDisplayPrice} ${quoteTokenSymbol}`
                              : `1 ${quoteTokenSymbol} = ${truncatedDisplayPrice} ${baseTokenSymbol}`
                        : isAmbient
                          ? '0.00'
                          : isAccountView
                            ? isBaseTokenMoneynessGreaterOrEqual
                                ? `1 ${quoteTokenSymbol} = ${truncatedLowDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                                : `1 ${baseTokenSymbol} = ${truncatedLowDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                            : isDenomBase
                              ? `1 ${baseTokenSymbol} = ${truncatedLowDisplayPrice} ${quoteTokenSymbol}`
                              : `1 ${quoteTokenSymbol} = ${truncatedLowDisplayPrice} ${baseTokenSymbol}`}
                </div>
            ),
            explanation:
                tx.entityType === 'swap'
                    ? 'The effective conversion rate for the swap'
                    : tx.entityType === 'limitOrder'
                      ? 'The pool price at which the limit order will be 100% filled and claimable'
                      : 'The low price boundary of the range',
        },
        ...(isSwap
            ? [
                  {
                      title: 'Value ',
                      content: (
                          <div style={{ cursor: 'default' }}>{usdValue}</div>
                      ),
                      explanation:
                          'The approximate US dollar value of the transaction',
                  },
              ]
            : [
                  {
                      title: 'High Price Boundary',
                      content: isAmbient
                          ? '∞'
                          : isAccountView
                            ? isBaseTokenMoneynessGreaterOrEqual
                                ? `1 ${quoteTokenSymbol} = ${truncatedHighDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                                : `1 ${baseTokenSymbol} = ${truncatedHighDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                            : isDenomBase
                              ? `1 ${baseTokenSymbol} = ${truncatedHighDisplayPrice} ${quoteTokenSymbol}`
                              : `1 ${quoteTokenSymbol} = ${truncatedHighDisplayPrice} ${baseTokenSymbol}`,
                      explanation: 'The upper price boundary of the range',
                  },
                  {
                      title: 'Value ',
                      content: (
                          <div style={{ cursor: 'default' }}>{usdValue}</div>
                      ),
                      explanation:
                          'The approximate US dollar value of the transaction',
                  },
              ]),
    ];

    if (timeFirstMintMemo && timeFirstMintMemo !== tx.txTime) {
        infoContent.splice(2, 0, {
            title: 'Time First Minted ',
            content:
                moment(timeFirstMintMemo * 1000).format('MM/DD/YYYY HH:mm') +
                ' ' +
                '(' +
                getElapsedTime(
                    moment(Date.now()).diff(
                        timeFirstMintMemo * 1000,
                        'seconds',
                    ),
                ) +
                ' ago)',
            explanation:
                'The time the owner first added liquidity at these prices',
        });
    }

    return (
        <div className={styles.tx_details_container}>
            <div className={styles.info_content}>
                {infoContent.map((info, idx) => (
                    <div key={info.title + idx}>
                        <InfoRow
                            title={info.title}
                            content={info.content}
                            explanation={info.explanation}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(TransactionDetailsSimplify);
