import styles from './TransactionRow2.module.css';
import { columnSlugsType } from './Transactions2';
import { getAddress } from 'ethers/lib/utils.js';
import TimeStamp from './TimeStamp';
import TxId from './TxId';
import TxWallet from './TxWallet';
import { useContext } from 'react';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import TxButton from './TxButton';
import { TransactionServerIF } from '../../../../ambient-utils/types/transaction/TransactionServerIF';

export type btnIconNameType = 'overflowBtn'|'editBtn'|'harvestBtn'|'addBtn'|'multiplyBtn'|'leafBtn'|'shareBtn'|'exportBtn'|'walletBtn'|'copyBtn'|'downloadBtn';

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
                        isOwnerActiveAccount={isOwnerActiveAccount}
                        ownerId={ownerId}
                        isAccountPage={isAccountPage}
                        width={elemMeta[1]}
                    />
                );
            } else if (elemMeta[0] === 'overflowBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='overflowBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'editBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='editBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'harvestBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='harvestBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'addBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='addBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'leafBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='leafBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'multiplyBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='multiplyBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'shareBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='shareBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'exportBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='exportBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'walletBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='walletBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'copyBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='copyBtn' hide={false} />
                );
            } else if (elemMeta[0] === 'downloadBtn') {
                elemForDOM = (
                    <TxButton width={elemMeta[1]} iconName='downloadBtn' hide={false} />
                );
            }
        }
        return elemForDOM;
    }

    const rowOrder: columnSlugsType[] = [
        'timeStamp',
        'txId',
        'txWallet',
        'overflowBtn',
        'harvestBtn',
        'addBtn',
        'leafBtn',
        'multiplyBtn',
        'shareBtn',
        'exportBtn',
        'walletBtn',
        'copyBtn',
        'downloadBtn',
    ];

    return (
        <li className={styles.tx_li}>
            {rowOrder.map((elem: columnSlugsType) => renderElem(elem))}
        </li>
    );
}