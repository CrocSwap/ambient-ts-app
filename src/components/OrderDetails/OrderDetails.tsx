import { useState, useRef } from 'react';

import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import styles from './OrderDetails.module.css';
import OrderDetailsHeader from './OrderDetailsHeader/OrderDetailsHeader';
import printDomToImage from '../../utils/functions/printDomToImage';
import PriceInfo from '../OrderDetails/PriceInfo/PriceInfo';
import OrderGraphDisplay from './OrderGraphDisplay/OrderGraphDisplay';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';

interface IOrderDetailsProps {
    limitOrder: ILimitOrderState;

    closeGlobalModal: () => void;
}

export default function OrderDetails(props: IOrderDetailsProps) {
    const { limitOrder } = props;
    const { isOrderFilled, userNameToDisplay } = useProcessOrder(limitOrder);

    const [showSettings, setShowSettings] = useState(false);

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };

    return (

        <div className={styles.range_details_container}>
            <OrderDetailsHeader
                onClose={props.closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
            />
            {'controldisplay'}
            <div ref={detailsRef}>
                <div className={styles.main_content}>
                    <div className={styles.left_container}>
                        <PriceInfo limitOrder={limitOrder} />
                    </div>
                    <div className={styles.right_container}>
                        <OrderGraphDisplay isOrderFilled={isOrderFilled} user={userNameToDisplay} />
                    </div>
                    <h1>actions display</h1>
                </div>
            </div>

        </div>
    );
}
