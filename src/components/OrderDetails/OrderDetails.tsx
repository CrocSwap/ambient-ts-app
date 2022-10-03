import { useState, useRef } from 'react';

import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import styles from './OrderDetails.module.css';
import OrderDetailsHeader from './OrderDetailsHeader/OrderDetailsHeader';
import printDomToImage from '../../utils/functions/printDomToImage';
import PriceInfo from '../OrderDetails/PriceInfo/PriceInfo';
import OrderGraphDisplay from './OrderGraphDisplay/OrderGraphDisplay';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import OrderDetailsControl from './OderDetailsControl/OrderDetailsControl';

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
                <OrderDetailsControl key={idx} item={item} handleChange={handleChange} />
            ))}
        </div>
    ) : null;

    return (
        <div className={styles.range_details_container}>
            <OrderDetailsHeader
                onClose={props.closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
            />
            {controlDisplay}
            <div ref={detailsRef}>
                <div className={styles.main_content}>
                    <div className={styles.left_container}>
                        <PriceInfo limitOrder={limitOrder} controlItems={controlItems} />
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
