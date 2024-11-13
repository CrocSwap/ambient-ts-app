import { TokenIF } from '../../../../../ambient-utils/types';
import { PropsIF } from '../../../../../components/Futa/TickerComponent/tickerDisplayElements';
import styles from './VaultDeposit.module.css';


interface Props {

    firstToken: TokenIF;
    secondToken: TokenIF;
}
export default function VaultDeposit(props: Props) {
    return <div className={styles.container}>

        VAULT DEPOSIT
    </div>;
}
