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

    const copyTransactionDetailsToClipboard = async () => {
        if (detailsRef.current) {
            const blob = await printDomToImage(detailsRef.current, '#0d1117', {
                background: `url(${modalBackground}) no-repeat`,
                backgroundSize: 'cover',
            });
            if (blob) {
                copy(blob);
                openSnackbar('Transaction Details copied to clipboard', 'info');
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

    const shareComponent = (
        <div ref={detailsRef} className={styles.main_outer_container}>
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

    const transactionDetailsHeaderProps = {
        showSettings,
        setShowSettings,
        copyTransactionDetailsToClipboard,
        setShowShareComponent,
        showShareComponent,
        handleCopyAddress,
    };

    return (
        <div className={styles.outer_container}>
            <TransactionDetailsHeader {...transactionDetailsHeaderProps} />

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
