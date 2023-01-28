import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    limitOrder: LimitOrderIF;
}

export default function OrderSearchResult(props: propsIF) {
    const { limitOrder } = props;
    console.log(limitOrder);

    return (
        <div className={styles.card_container}>
            <div>Pool</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );
}