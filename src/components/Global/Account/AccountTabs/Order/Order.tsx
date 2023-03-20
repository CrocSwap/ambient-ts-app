import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import styles from './Order.module.css';
import OrderCard from './OrderCard';
import OrderCardHeader from './OrderCardHeader';

interface propsIF {
    orders: LimitOrderIF[];
}

export default function Order(props: propsIF) {
    const { orders } = props;

    // TODO:   @Junior  I don't think there's any reason for the header element in
    // TODO:   ... the return statement to be abstracted into its own file as it
    // TODO:   ... appears to be fully static, please code it locally in this file
    // TODO:   ... and make sure that it is a <header> semantic element  --Emily

    return (
        <div className={styles.container}>
            <OrderCardHeader />
            <div className={styles.item_container}>
                {orders.map((order, idx) => (
                    <OrderCard limitOrder={order} key={idx} isDenomBase={true} />
                ))}
            </div>
        </div>
    );
}
