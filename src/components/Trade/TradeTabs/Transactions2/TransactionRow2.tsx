import { TransactionServerIF } from '../../../../utils/interfaces/TransactionIF';
import styles from './TransactionRow2.module.css';
import { columnSlugsType } from './Transactions2';
import { getAddress } from 'ethers/lib/utils.js';
import TimeStamp from './TimeStamp';
import TxId from './TxId';
import TxWallet from './TxWallet';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    tx: TransactionServerIF;
    columnsToShow: [columnSlugsType, number][];
    isAccountPage: boolean;
}

export default function TransactionRow2(props: propsIF) {
    const { tx, columnsToShow, isAccountPage } = props;

    const { addressCurrent: userAddress } = useAppSelector((state) => state.userData);
    const ownerId: string = getAddress(tx.user);

    const isOwnerActiveAccount: boolean = userAddress
        ? getAddress(tx.user).toLowerCase() !== userAddress.toLowerCase()
        : false;

    const renderElem = (el: columnSlugsType): JSX.Element|null => {
        const elemMeta = columnsToShow.find((col: [columnSlugsType, number]) => col[0] === el);
        let elemForDOM: JSX.Element|null = null;
        if (elemMeta) {
            if (elemMeta[0] === 'timeStamp') {
                elemForDOM = <TimeStamp tx={tx} width={elemMeta[1]} />;
            } else if (elemMeta[0] === 'txId') {
                elemForDOM = <TxId tx={tx} width={elemMeta[1]} />;
            } else if (elemMeta[0] === 'txWallet') {
                elemForDOM = (
                    <TxWallet
                        tx={tx}
                        isOwnerActiveAccount={isOwnerActiveAccount}
                        ownerId={ownerId}
                        isAccountPage={isAccountPage}
                        width={elemMeta[1]}
                    />
                );
            }
        }
        return elemForDOM;
    }

    const rowOrder: columnSlugsType[] = [
        'timeStamp',
        'txId',
        'txWallet'
    ];

    return (
        <li className={styles.tx_li}>
            {rowOrder.map((elem: columnSlugsType) => renderElem(elem))}
        </li>
    );
}