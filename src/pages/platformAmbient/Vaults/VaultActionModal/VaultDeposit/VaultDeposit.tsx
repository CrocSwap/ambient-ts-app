import { TokenIF } from '../../../../../ambient-utils/types';
import styles from './VaultDeposit.module.css';


interface Props {

    token0: TokenIF;
    token1: TokenIF;
}
export default function VaultDeposit(props: Props) {
    console.log(props)
    return <div className={styles.container}>

        VAULT DEPOSIT
    </div>;
}
