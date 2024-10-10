import styles from './TransactionDetailsModal.module.css';
import { useState, useRef, useContext, useEffect, memo } from 'react';
import TransactionDetailsPriceInfo from './TransactionDetailsPriceInfo/TransactionDetailsPriceInfo';
import TransactionDetailsGraph from './TransactionDetailsGraph/TransactionDetailsGraph';
import { TransactionIF, PositionServerIF } from '../../../ambient-utils/types';
import TransactionDetailsSimplify from './TransactionDetailsSimplify/TransactionDetailsSimplify';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';
import modalBackground from '../../../assets/images/backgrounds/background.png';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

import {
    CACHE_UPDATE_FREQ_IN_MS,
    GCGO_OVERRIDE_URL,
} from '../../../ambient-utils/constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import {
    getPositionData,
    printDomToImage,
} from '../../../ambient-utils/dataLayer';
import { TokenContext } from '../../../contexts/TokenContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import Modal from '../Modal/Modal';
import DetailsHeader from '../DetailsHeader/DetailsHeader';
import ModalHeader from '../ModalHeader/ModalHeader';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

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
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    const {
        crocEnv,
        activeNetwork,
        provider,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { tokens } = useContext(TokenContext);

    const [updatedPositionApy, setUpdatedPositionApy] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (tx.entityType !== 'liqchange') return;

        const positionStatsCacheEndpoint = GCGO_OVERRIDE_URL
            ? GCGO_OVERRIDE_URL + '/position_stats?'
            : activeNetwork.graphCacheUrl + '/position_stats?';

        fetch(
            positionStatsCacheEndpoint +
                new URLSearchParams({
                    user: tx.user,
                    bidTick: tx.bidTick.toString(),
                    askTick: tx.askTick.toString(),
                    base: tx.base,
                    quote: tx.quote,
                    poolIdx: tx.poolIdx.toString(),
                    chainId: chainId,
                    positionType: tx.positionType,
                }),
        )
            .then((response) => response?.json())
            .then(async (json) => {
                if (!crocEnv || !provider || !json?.data) {
                    return;
                }
                // temporarily skip ENS fetch
                const skipENSFetch = true;
                const forceOnchainLiqUpdate = false;

                const positionPayload = json?.data as PositionServerIF;
                const positionStats = await getPositionData(
                    positionPayload,
                    tokens.tokenUniv,
                    crocEnv,
                    provider,
                    chainId,
                    cachedFetchTokenPrice,
                    cachedQuerySpotPrice,
                    cachedTokenDetails,
                    cachedEnsResolve,
                    skipENSFetch,
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

    const [showShareComponent, setShowShareComponent] = useState(true);

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
            {/* <p className={styles.ambi_copyright}>ambient.finance</p> */}
        </div>
    );

    const [direction, setDirection] = useState<number>(0);

    const variants = {
      enter: (direction: number) => {
        return {
          x: direction > 0 ? 1000 : -1000,
          opacity: 0
        };
      },
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1
      },
      exit: (direction: number) => {
        return {
          zIndex: 0,
          x: direction < 0 ? 1000 : -1000,
          opacity: 0
        };
      }
    };
  
    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
      return Math.abs(offset) * velocity;
    };
  
    const paginate = (newDirection: number) => {
      setDirection(newDirection);
      setShowShareComponent(!showShareComponent);
    };
  

    const mobileTabs = (
        <div className={styles.mobile_tabs_container}
        style={{paddingBottom: showShareComponent ? '0' : '8px' }}
        >
            <button
                className={showShareComponent ? styles.active_button : ''}
                onClick={() => paginate(1)}
                >
                Overview
            </button>
            <button
                className={!showShareComponent ? styles.active_button : ''}
                onClick={() => paginate(-1)}
                >
                Details
            </button>
        </div>
    );

    const shareComponentMobile = (
        <Modal usingCustomHeader onClose={onClose}>
                  <AnimatePresence initial={false} custom={direction}>

            <motion.div className={styles.transaction_details_mobile}
             key={showShareComponent ? 'share' : 'details'}
             custom={direction}
             variants={variants}
             initial="enter"
             animate="center"
             exit="exit"
             transition={{
               x: { type: 'spring', stiffness: 300, damping: 30 },
               opacity: { duration: 0.2 }
             }}
             drag="x"
             dragConstraints={{ left: 0, right: 0 }}
             dragElastic={1}
             onDragEnd={(e: PointerEvent, { offset, velocity }: PanInfo) => {
                const swipe = swipePower(offset.x, velocity.x);
              
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
                >
                <ModalHeader title={'Transaction Details'} onClose={onClose} />
                {mobileTabs}
                {!showShareComponent ? (
                    <TransactionDetailsSimplify
                        tx={tx}
                        isAccountView={isAccountView}
                        timeFirstMintMemo={timeFirstMintMemo}
                    />
                ) : (
                    <>
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
                    </>
                )}
                </motion.div>
                </AnimatePresence >

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
