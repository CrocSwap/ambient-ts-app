import styles from './RangeDetailsSimplify.module.css';
import { BlastRewardsDataIF, PositionIF } from '../../../ambient-utils/types';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import { ZERO_ADDRESS } from '../../../ambient-utils/constants';
import { RiExternalLinkLine } from 'react-icons/ri';
import moment from 'moment';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { memo, useContext } from 'react';
import { FiCopy } from 'react-icons/fi';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useMediaQuery } from '@material-ui/core';
import { UserDataContext } from '../../../contexts/UserDataContext';
import InfoRow from '../../Global/InfoRow';
import { ChainDataContext } from '../../../contexts/ChainDataContext';

interface RangeDetailsSimplifyPropsIF {
    position: PositionIF;
    timeFirstMintMemo: number;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    isAccountView: boolean;
    updatedPositionApy: number | undefined;
    blastRewardsData: BlastRewardsDataIF;
}

// TODO: refactor to using styled-components
function RangeDetailsSimplify(props: RangeDetailsSimplifyPropsIF) {
    const {
        position,
        baseFeesDisplay,
        quoteFeesDisplay,
        isAccountView,
        updatedPositionApy,
        blastRewardsData,
        timeFirstMintMemo,
    } = props;
    const { userAddress } = useContext(UserDataContext);
    const { chainData, crocEnv } = useContext(CrocEnvContext);

    const {
        ensName,
        isDenomBase,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        userNameToDisplay,
        posHashTruncated,
        posHash,
        // blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenName,
        quoteTokenName,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        isPositionInRange,
        isAmbient,
        ambientOrMax,
        ambientOrMin,
        width,
        blockExplorer,
        tokenAAddressLowerCase,
        tokenBAddressLowerCase,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        elapsedTimeString,
        elapsedTimeSinceFirstMintString,
    } = useProcessRange(position, crocEnv, userAddress, isAccountView);

    const showFullAddresses = useMediaQuery('(min-width: 768px)');

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const { isActiveNetworkBlast } = useContext(ChainDataContext);

    const [_, copy] = useCopyToClipboard();

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount ? '/account' : `/${ownerId}`;
        window.open(walletUrl);
    }

    const aprAmountString = updatedPositionApy
        ? updatedPositionApy >= 1000
            ? updatedPositionApy.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              }) + '%+'
            : updatedPositionApy.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) + '%'
        : undefined;

    function handleCopyPositionHash() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    function handleOpenBaseAddress() {
        if (tokenAAddressLowerCase && blockExplorer) {
            const adressUrl =
                tokenAAddressLowerCase === ZERO_ADDRESS
                    ? `${blockExplorer}address/${chainData.addrs.dex}`
                    : `${blockExplorer}token/${tokenAAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (tokenBAddressLowerCase && blockExplorer) {
            const adressUrl = `${blockExplorer}token/${tokenBAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    // const txContent = (
    //     <div className={styles.link_row} onClick={handleOpenExplorer}>
    //         <p>{posHashTruncated}</p>
    //         <RiExternalLinkLine />
    //     </div>
    // );

    const posHashContent = (
        <div className={styles.link_row} onClick={handleCopyPositionHash}>
            <p>{posHashTruncated}</p>
            <FiCopy style={{ cursor: 'pointer' }} />
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
                        : userNameToDisplay
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

    const status = isAmbient
        ? 'Ambient'
        : isPositionInRange
        ? 'In Range'
        : 'Out of Range';

    const firstMintTime =
        moment(timeFirstMintMemo * 1000).format('MM/DD/YYYY HH:mm') +
        ' ' +
        '(' +
        elapsedTimeSinceFirstMintString +
        ' ago)';

    const updateTime =
        moment(position.latestUpdateTime * 1000).format('MM/DD/YYYY HH:mm') +
        ' ' +
        '(' +
        elapsedTimeString +
        ' ago)';

    const infoContent = [
        {
            title: 'Position Type ',
            content: isAmbient ? 'Ambient' : 'Range',
            explanation: 'e.g. Range, Ambient ',
        },

        {
            title: 'Wallet ',
            content: walletContent,
            explanation: 'The account of the position owner',
        },
        {
            title: 'Status ',
            content: status,
            explanation: 'e.g. Ambient / In Range / Out of Range',
        },
        {
            title: 'Value ',
            content: usdValue,
            explanation: 'The approximate US dollar value of the limit order',
        },
        {
            title: 'Token 1 ',
            content: baseTokenSymbol + ' - ' + baseTokenName,
            explanation: 'Token #1 in the token pair',
        },

        {
            title: 'Token 1 Address ',
            content: baseAddressContent,
            explanation: 'Address of token #1 in the token pair',
        },

        {
            title: 'Token 1 Qty ',
            content: baseDisplayFrontend + ' ' + baseTokenSymbol,
            explanation: 'The quantity of token #1 in the token pair',
        },

        {
            title: 'Token 2 ',
            content: quoteTokenSymbol + ' - ' + quoteTokenName,
            explanation: 'Token #2 in the token pair',
        },

        {
            title: 'Token 2 Address ',
            content: quoteAddressContent,
            explanation: 'Address of token #2 in the token pair',
        },

        {
            title: 'Token 2 Qty ',
            content: quoteDisplayFrontend + ' ' + quoteTokenSymbol,
            explanation: 'The quantity of token #2 in the token pair',
        },
        {
            title: 'Time First Minted ',
            content: firstMintTime,
            explanation:
                'The time the owner first added liquidity at these prices',
        },
        {
            title: 'Range Min ',
            content: isAmbient
                ? ambientOrMin
                : isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1 ${quoteTokenSymbol} = ${minRangeDenomByMoneyness} ${baseTokenSymbol}`
                    : `1 ${baseTokenSymbol} = ${minRangeDenomByMoneyness} ${quoteTokenSymbol}`
                : isDenomBase
                ? `1 ${baseTokenSymbol} = ${ambientOrMin} ${quoteTokenSymbol}`
                : `1 ${quoteTokenSymbol} = ${ambientOrMin} ${baseTokenSymbol}`,
            explanation: 'The low price boundary of the range',
        },
        {
            title: 'Range Max ',
            content: isAmbient
                ? ambientOrMax
                : isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1 ${quoteTokenSymbol} = ${maxRangeDenomByMoneyness} ${baseTokenSymbol}`
                    : `1 ${baseTokenSymbol} = ${maxRangeDenomByMoneyness} ${quoteTokenSymbol}`
                : isDenomBase
                ? `1 ${baseTokenSymbol} = ${ambientOrMax} ${quoteTokenSymbol}`
                : `1 ${quoteTokenSymbol} = ${ambientOrMax} ${baseTokenSymbol}`,
            explanation: 'The upper price boundary of the range',
        },

        {
            title: 'Width ',
            content: isAmbient ? 'Infinite' : width + '%',
            explanation: 'The geometric range width',
        },
        {
            title: 'APR',
            content: aprAmountString || '',
            explanation:
                'The estimated APR of the position based on rewards earned',
        },
        {
            title: 'Position Slot ID ',
            content: posHashContent,
            // eslint-disable-next-line quotes
            explanation: "A unique identifier for this user's position",
        },

        ...(!isAmbient
            ? [
                  {
                      title: 'Low Tick ',
                      content: position.bidTick.toString(),
                      explanation:
                          'The low price boundary represented in a geometric scale',
                  },
                  {
                      title: 'High Tick ',
                      content: position.askTick.toString(),
                      explanation:
                          'The upper price boundary represented in a geometric scale',
                  },
              ]
            : []),
    ];

    if (!isAmbient) {
        infoContent.splice(
            10,
            0,
            {
                title: 'Token 1 Unclaimed Rewards ',
                content: baseFeesDisplay + ' ' + baseTokenSymbol,
                explanation: 'Token #1 unclaimed rewards',
            },
            {
                title: 'Token 2 Unclaimed Rewards ',
                content: quoteFeesDisplay + ' ' + quoteTokenSymbol,
                explanation: 'Token #2 unclaimed rewards',
            },
        );
    }

    if (isActiveNetworkBlast) {
        infoContent.splice(
            isAmbient ? 10 : 12,
            0,
            {
                title: 'BLAST points ',
                content: blastRewardsData.points,
                explanation: 'BLAST points earned by the position',
            },
            {
                title: 'BLAST gold ',
                content: blastRewardsData.gold,
                explanation: 'BLAST gold earned by the position',
            },
        );
    }

    if (firstMintTime !== updateTime) {
        infoContent.splice(
            isAmbient
                ? isActiveNetworkBlast
                    ? 13
                    : 11
                : isActiveNetworkBlast
                ? 15
                : 13,
            0,
            {
                title: 'Time Last Updated ',
                content: updateTime,
                explanation:
                    'Time the owner last updated the position at these prices',
            },
        );
    }

    return (
        <div className={styles.tx_details_container}>
            <div className={styles.main_container}>
                <section>
                    {infoContent
                        .slice(
                            0,
                            isAmbient
                                ? isActiveNetworkBlast
                                    ? 12
                                    : 10
                                : isActiveNetworkBlast
                                ? 14
                                : 12,
                        )
                        .map((info, idx) => (
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
                        .slice(
                            isAmbient
                                ? isActiveNetworkBlast
                                    ? 12
                                    : 10
                                : isActiveNetworkBlast
                                ? 14
                                : 12,
                            infoContent.length,
                        )
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

export default memo(RangeDetailsSimplify);
