import { memo, useContext, useEffect, useRef, useState } from 'react';
import {
    PositionServerIF,
    TransactionIF,
} from '../../../../ambient-utils/types';
import modalBackground from '../../../../assets/images/backgrounds/background.png';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import styles from '../TransactionDetailsModal.module.css';
import TransactionDetailsPriceInfo from './TransactionDetailsPriceInfo/TransactionDetailsPriceInfo';
import TransactionDetailsSimplify from './TransactionDetailsSimplify/TransactionDetailsSimplify';

import { CACHE_UPDATE_FREQ_IN_MS } from '../../../../ambient-utils/constants';
import {
    getPositionData,
    printDomToImage,
} from '../../../../ambient-utils/dataLayer';
import { ChainDataContext } from '../../../../contexts';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import Modal from '../../Modal/Modal';
import ModalHeader from '../../ModalHeader/ModalHeader';
import DetailsHeader from '../DetailsHeader/DetailsHeader';
import MobileDetailTabs from '../MobileDetailTabs/MobileDetailTabs';
import TransactionDetailsGraph from '../TransactionDetailsGraph/TransactionDetailsGraph';

interface propsIF {
    tx: TransactionIF;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
    onClose: () => void;
}

function TransactionDetailsModal(props: propsIF) {
    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const { tx, isBaseTokenMoneynessGreaterOrEqual, isAccountView, onClose } =
        props;
    const {
        activeNetwork: { chainId, gcgo },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const { analyticsPoolList } = useContext(ChainDataContext);

    const { cachedQuerySpotPrice, cachedFetchTokenPrice, cachedTokenDetails } =
        useContext(CachedDataContext);

    const { crocEnv, provider } = useContext(CrocEnvContext);

    const { tokens } = useContext(TokenContext);

    const [updatedPositionApy, setUpdatedPositionApy] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (tx.entityType !== 'liqchange') return;

        gcgo.positionStats({
            user: tx.user,
            bidTick: tx.bidTick,
            askTick: tx.askTick,
            base: tx.base,
            quote: tx.quote,
            poolIdx: tx.poolIdx,
            chainId: chainId,
        })
            .then(async (positionPayload: PositionServerIF) => {
                if (!crocEnv || !provider || !positionPayload) {
                    return;
                }
                // temporarily skip ENS fetch
                const forceOnchainLiqUpdate = false;

                const positionStats = await getPositionData(
                    positionPayload,
                    tokens.tokenUniv,
                    crocEnv,
                    provider,
                    chainId,
                    analyticsPoolList,
                    cachedFetchTokenPrice,
                    cachedQuerySpotPrice,
                    cachedTokenDetails,
                    forceOnchainLiqUpdate,
                );

                if (positionStats.timeFirstMint) {
                    tx.timeFirstMint = positionStats.timeFirstMint;
                }

                setUpdatedPositionApy(positionStats.aprEst * 100);
            })
            .catch(console.error);
    }, [
        Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
        !!crocEnv,
        !!provider,
        chainId,
    ]);

    const [showShareComponent, setShowShareComponent] = useState<boolean>(true);

    const detailsRef = useRef(null);

    const copyTransactionDetailsToClipboard = async () => {
        if (detailsRef.current) {
            const blob = await printDomToImage(detailsRef.current, '#0d1117', {
                background: `url(${modalBackground}) no-repeat`,
                backgroundSize: 'cover',
            });
            if (blob) {
                copy(blob);
                openSnackbar('Shareable image copied to clipboard', 'info');
            }
        }
    };

    const [controlItems] = useState([
        { slug: 'ticks', name: 'Show ticks', checked: true },
        { slug: 'liquidity', name: 'Show Liquidity', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        const txHash = tx.txHash;
        copy(txHash);
        openSnackbar(`${txHash} copied`, 'info');
    }

    const [timeFirstMintMemo, setTimeFirstMintMemo] = useState<
        number | undefined
    >(tx.timeFirstMint);

    useEffect(() => {
        if (tx.timeFirstMint) {
            setTimeFirstMintMemo(tx.timeFirstMint);
        }
    }, [tx.timeFirstMint]);

    const shareComponent = (
        <div ref={detailsRef} className={styles.main_outer_container}>
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <TransactionDetailsPriceInfo
                        tx={tx}
                        controlItems={controlItems}
                        positionApy={updatedPositionApy}
                        isAccountView={isAccountView}
                    />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph
                        tx={tx}
                        // timeFirstMint={timeFirstMint}
                        transactionType={tx.entityType}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isAccountView={isAccountView}
                        timeFirstMintMemo={timeFirstMintMemo}
                    />
                </div>
            </div>
        </div>
    );

    const shareComponentMobile = (
        <Modal usingCustomHeader onClose={onClose}>
            <div className={styles.transaction_details_mobile}>
                <ModalHeader title={'Transaction Details'} onClose={onClose} />
                <MobileDetailTabs
                    showShareComponent={showShareComponent}
                    setShowShareComponent={setShowShareComponent}
                />
                {!showShareComponent ? (
                    <TransactionDetailsSimplify
                        tx={tx}
                        isAccountView={isAccountView}
                        timeFirstMintMemo={timeFirstMintMemo}
                    />
                ) : (
                    <div className={styles.mobile_price_graph_container}>
                        <TransactionDetailsPriceInfo
                            tx={tx}
                            controlItems={controlItems}
                            positionApy={updatedPositionApy}
                            isAccountView={isAccountView}
                        />
                        <div className={styles.graph_section_mobile}>
                            <TransactionDetailsGraph
                                tx={tx}
                                transactionType={tx.entityType}
                                isBaseTokenMoneynessGreaterOrEqual={
                                    isBaseTokenMoneynessGreaterOrEqual
                                }
                                isAccountView={isAccountView}
                                timeFirstMintMemo={timeFirstMintMemo}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );

    if (showMobileVersion) return shareComponentMobile;

    return (
        <Modal usingCustomHeader onClose={onClose}>
            <div className={styles.outer_container}>
                <DetailsHeader
                    onClose={onClose}
                    handleCopyAction={handleCopyAddress}
                    copyToClipboard={copyTransactionDetailsToClipboard}
                    showShareComponent={showShareComponent}
                    setShowShareComponent={setShowShareComponent}
                    tooltipCopyAction='Copy transaction hash to clipboard'
                    tooltipCopyImage='Copy shareable image'
                />
                {showShareComponent ? (
                    shareComponent
                ) : (
                    <TransactionDetailsSimplify
                        tx={tx}
                        isAccountView={isAccountView}
                        timeFirstMintMemo={timeFirstMintMemo}
                    />
                )}
            </div>
        </Modal>
    );
}

export default memo(TransactionDetailsModal);
