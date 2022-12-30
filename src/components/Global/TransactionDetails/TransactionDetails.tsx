import styles from './TransactionDetails.module.css';
import { useState, useRef } from 'react';
import { ITransaction } from '../../../utils/state/graphDataSlice';
import printDomToImage from '../../../utils/functions/printDomToImage';
import RangeDetailsControl from '../../RangeDetails/RangeDetailsControl/RangeDetailsControl';
import TransactionDetailsHeader from './TransactionDetailsHeader/TransactionDetailsHeader';
import TransactionDetailsPriceInfo from './TransactionDetailsPriceInfo/TransactionDetailsPriceInfo';
interface TransactionDetailsPropsIF {
    account: string;
    tx: ITransaction;
    closeGlobalModal: () => void;
}

export default function TransactionDetails(props: TransactionDetailsPropsIF) {
    const { account, tx } = props;

    console.log({ tx });

    const [showSettings, setShowSettings] = useState(false);

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };

    const [controlItems, setControlItems] = useState([
        { slug: 'ticks', name: 'Show ticks', checked: true },
        { slug: 'liquidity', name: 'Show Liquidity', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    const handleChange = (slug: string) => {
        const copyControlItems = [...controlItems];
        const modifiedControlItems = copyControlItems.map((item) => {
            if (slug === item.slug) {
                item.checked = !item.checked;
            }

            return item;
        });

        setControlItems(modifiedControlItems);
    };

    const controlDisplay = showSettings ? (
        <div className={styles.control_display_container}>
            {controlItems.map((item, idx) => (
                <RangeDetailsControl key={idx} item={item} handleChange={handleChange} />
            ))}
        </div>
    ) : null;

    return (
        <div className={styles.tx_details_container}>
            <TransactionDetailsHeader
                onClose={props.closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
            />
            {controlDisplay}
            <div ref={detailsRef}>
                <div className={styles.main_content}>
                    <div className={styles.left_container}>
                        <TransactionDetailsPriceInfo
                            account={account}
                            tx={tx}
                            controlItems={controlItems}
                        />
                    </div>
                    <div className={styles.right_container}>
                        {/* <OrderGraphDisplay isOrderFilled={isOrderFilled} user={userNameToDisplay} /> */}
                    </div>
                    {/* <OrderDetailsActions /> */}
                </div>
            </div>
        </div>
    );
}
