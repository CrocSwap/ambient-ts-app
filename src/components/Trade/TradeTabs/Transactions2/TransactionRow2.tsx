import { TransactionServerIF } from '../../../../utils/interfaces/TransactionIF';
import styles from './TransactionRow2.module.css';
import { columnSlugsType } from './Transactions2';
import { getAddress } from 'ethers/lib/utils.js';
import TimeStamp from './TimeStamp';
import TxId from './TxId';
import TxWallet from './TxWallet';
import { useContext } from 'react';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import TxButton from './TxButton';

export type btnIconNameType = 'dots'|'pencil'|'wheat'|'plus'|'multiply'|'leaf'|'share'|'export'|'wallet'|'copy'|'download';

interface propsIF {
    tx: TransactionServerIF;
    columnsToShow: [columnSlugsType, number][];
    isAccountPage: boolean;
}

export default function TransactionRow2(props: propsIF) {
    const { tx, columnsToShow, isAccountPage } = props;

    const { userAddress } = useContext(UserDataContext);
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
            } else if (elemMeta[0] === 'btn1') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='dots' hide={false} />
                );
            } else if (elemMeta[0] === 'btn2') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='pencil' hide={false} />
                );
            } else if (elemMeta[0] === 'btn3') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='wheat' hide={false} />
                );
            } else if (elemMeta[0] === 'btn4') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='plus' hide={false} />
                );
            } else if (elemMeta[0] === 'btn5') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='leaf' hide={false} />
                );
            } else if (elemMeta[0] === 'btn6') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='multiply' hide={false} />
                );
            } else if (elemMeta[0] === 'btn7') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='share' hide={false} />
                );
            } else if (elemMeta[0] === 'btn8') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='export' hide={false} />
                );
            } else if (elemMeta[0] === 'btn9') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='wallet' hide={false} />
                );
            } else if (elemMeta[0] === 'btn10') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='copy' hide={false} />
                );
            }
        }
        return elemForDOM;
    }

    const rowOrder: columnSlugsType[] = [
        'timeStamp',
        'txId',
        'txWallet',
        'btn1',
        'btn2',
        'btn3',
        'btn4',
        'btn5',
        'btn6',
        'btn7',
        'btn8',
        'btn9',
        'btn10',
    ];

    return (
        <li className={styles.tx_li}>
            {rowOrder.map((elem: columnSlugsType) => renderElem(elem))}
        </li>
    );
}