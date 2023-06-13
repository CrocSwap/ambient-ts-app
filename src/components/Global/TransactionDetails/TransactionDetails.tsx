import styles from './TransactionDetails.module.css';
import { useState, useRef, useContext } from 'react';
import printDomToImage from '../../../utils/functions/printDomToImage';
import TransactionDetailsHeader from './TransactionDetailsHeader/TransactionDetailsHeader';
import TransactionDetailsPriceInfo from './TransactionDetailsPriceInfo/TransactionDetailsPriceInfo';
import TransactionDetailsGraph from './TransactionDetailsGraph/TransactionDetailsGraph';
import { TransactionIF } from '../../../utils/interfaces/exports';
import TransactionDetailsSimplify from './TransactionDetailsSimplify/TransactionDetailsSimplify';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';
import modalBackground from '../../../assets/images/backgrounds/background.png';

interface propsIF {
    tx: TransactionIF;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
}

export default function TransactionDetails(props: propsIF) {
    const { tx, isBaseTokenMoneynessGreaterOrEqual, isAccountView } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const [showSettings, setShowSettings] = useState(false);
    const [showShareComponent, setShowShareComponent] = useState(true);

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current, '#0d1117', {
                background: `url(${modalBackground}) no-repeat`,
                backgroundSize: 'cover',
            });
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

    const shareComponent = (
        <div ref={detailsRef}>
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <TransactionDetailsPriceInfo
                        tx={tx}
                        controlItems={controlItems}
                    />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph
                        tx={tx}
                        transactionType={tx.entityType}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isAccountView={isAccountView}
                    />
                </div>
            </div>
            <p className={styles.ambi_copyright}>ambient.finance</p>
        </div>
    );

    return (
        <div className={styles.tx_details_container}>
            <TransactionDetailsHeader
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
                setShowShareComponent={setShowShareComponent}
                showShareComponent={showShareComponent}
                handleCopyAddress={handleCopyAddress}
            />

            {showShareComponent ? (
                shareComponent
            ) : (
                <TransactionDetailsSimplify
                    tx={tx}
                    isAccountView={isAccountView}
                />
            )}
        </div>
    );
}
