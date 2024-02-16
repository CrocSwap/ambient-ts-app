import { TransactionIF } from '../../../../ambient-utils/types';
import { RiExternalLinkLine } from 'react-icons/ri';

import styles from './TransactionDetailsSimplify.module.css';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { ZERO_ADDRESS } from '../../../../ambient-utils/constants';
import moment from 'moment';
import { memo, useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { useMediaQuery } from '@material-ui/core';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import InfoRow from '../../InfoRow';

interface TransactionDetailsSimplifyPropsIF {
    tx: TransactionIF;
    isAccountView: boolean;
    changeTypeDisplay:
        | 'Range Harvest'
        | 'Limit'
        | 'Range'
        | 'Ambient'
        | 'Limit Removal'
        | 'Range Removal'
        | 'Ambient Removal'
        | 'Market'
        | 'Limit Claim';
}

// TODO: refactor to using styled-components
function TransactionDetailsSimplify(props: TransactionDetailsSimplifyPropsIF) {
    const { tx, isAccountView, changeTypeDisplay } = props;

    const { userAddress } = useContext(UserDataContext);

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
    } = useProcessTransaction(tx, userAddress);

    const { chainData } = useContext(CrocEnvContext);

    const showFullAddresses = useMediaQuery('(min-width: 768px)');

    const isAmbient = tx.positionType === 'ambient';

    const isBuy = tx.isBid || tx.isBuy;

    const isSwap = tx.entityType === 'swap' || tx.entityType === 'limitOrder';
    const isLimitRemoval =
        tx.entityType === 'limitOrder' && tx.changeType === 'burn';

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount
            ? '/account'
            : `/account/${ownerId}`;
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
                    ? `${blockExplorer}address/${chainData.addrs.dex}`
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

    console.log({ changeTypeDisplay, changeType, entityType, positionType });
    // Create a data array for the info and map through it here
    const infoContent = [
        {
            title: 'Transaction Type ',
            content: (
                <div style={{ cursor: 'default' }}>{changeTypeDisplay}</div>
            ),
            explanation: 'Transaction type explanation',
        },

        {
            title: 'Time ',
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
            title: isSwap ? 'Price ' : 'Low Price Boundary',
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
                        : isAccountView
                        ? isBaseTokenMoneynessGreaterOrEqual
                            ? `1 ${quoteTokenSymbol} = ${truncatedLowDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                            : `1 ${baseTokenSymbol} = ${truncatedLowDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                        : isAmbient
                        ? '0.00'
                        : isDenomBase
                        ? `1 ${baseTokenSymbol} = ${truncatedLowDisplayPrice} ${quoteTokenSymbol}`
                        : `1 ${quoteTokenSymbol} = ${truncatedLowDisplayPrice} ${baseTokenSymbol}`}
                </div>
            ),
            explanation: isSwap
                ? 'The transaction price'
                : 'The low price boundary',
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
                      content: isAccountView
                          ? isBaseTokenMoneynessGreaterOrEqual
                              ? `1 ${quoteTokenSymbol} = ${truncatedHighDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                              : `1 ${baseTokenSymbol} = ${truncatedHighDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                          : isAmbient
                          ? '∞'
                          : isDenomBase
                          ? `1 ${baseTokenSymbol} = ${truncatedHighDisplayPrice} ${quoteTokenSymbol}`
                          : `1 ${quoteTokenSymbol} = ${truncatedHighDisplayPrice} ${baseTokenSymbol}`,
                      explanation: 'The high price boundary',
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

    return (
        <div className={styles.tx_details_container}>
            <div className={styles.info_content}>
                {infoContent.map((info, idx) => (
                    <InfoRow
                        key={info.title + idx}
                        title={info.title}
                        content={info.content}
                        explanation={info.explanation}
                    />
                ))}
            </div>
        </div>
    );
}

export default memo(TransactionDetailsSimplify);
