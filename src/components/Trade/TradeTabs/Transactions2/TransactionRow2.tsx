import styles from './TransactionRow2.module.css';
import { columnSlugsType } from './Transactions2';
import { getAddress } from 'ethers/lib/utils.js';
import TimeStamp from './TimeStamp';
import TxId from './TxId';
import TxWallet from './TxWallet';
import { useContext, useRef } from 'react';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import TxButton from './TxButton';
import TxValue from './TxValue';
import { TransactionIF } from '../../../../ambient-utils/types';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import TxSide from './TxSide';
import { actionButtons, actionButtonsMenu, infoCells } from './data';
import TxType from './TxType';
import TxPrice from './TxPrice';

export type btnIconNameType =
    | 'overflowBtn'
    | 'editBtn'
    | 'harvestBtn'
    | 'addBtn'
    | 'removeBtn'
    | 'leafBtn'
    | 'shareBtn'
    | 'exportBtn'
    | 'walletBtn'
    | 'copyBtn'
    | 'downloadBtn';

interface propsIF {
    tx: TransactionIF;
    columnsToShow: [columnSlugsType, number, string][];
    isAccountPage: boolean;
    isMenuOpen: boolean;
    onMenuToggle: () => void;
    hideMenu: () => void;
}

export default function TransactionRow2(props: propsIF) {
    const {
        tx,
        columnsToShow,
        isAccountPage,
        isMenuOpen,
        onMenuToggle,
        hideMenu,
    } = props;

    const { userAddress } = useContext(UserDataContext);
    const ownerId: string = getAddress(tx.user);

    const isOwnerActiveAccount: boolean = userAddress
        ? getAddress(tx.user).toLowerCase() !== userAddress.toLowerCase()
        : false;

    const renderElem = (el: columnSlugsType): JSX.Element | null => {
        const elemMeta = columnsToShow.find(
            (col: [columnSlugsType, number, string]) => col[0] === el,
        );
        let elemForDOM: JSX.Element | null = null;
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
            } else if (elemMeta[0] === 'txPrice') {
                elemForDOM = <TxPrice tx={tx} isAccountPage={isAccountPage} />;
            } else if (elemMeta[0] === 'txSide') {
                elemForDOM = <TxSide tx={tx} isAccountPage={isAccountPage} width={elemMeta[1]} />;
            } else if (elemMeta[0] === 'txValue') {
                elemForDOM = <TxValue width={elemMeta[1]} tx={tx} />;
            } else if (elemMeta[0] === 'txType') {
                elemForDOM = <TxType tx={tx} isAccountPage={isAccountPage} width={elemMeta[1]} />;
            } else if (elemMeta[0] === 'overflowBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='overflowBtn'
                        hide={false}
                        onMenuToggle={onMenuToggle}
                    />
                );
            } else if (elemMeta[0] === 'editBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='editBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'harvestBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='harvestBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'addBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='addBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'leafBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='leafBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'removeBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='removeBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'shareBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='shareBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'exportBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='exportBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'walletBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='walletBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'copyBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='copyBtn'
                        hide={false}
                    />
                );
            } else if (elemMeta[0] === 'downloadBtn') {
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={elemMeta[1]}
                        iconName='downloadBtn'
                        hide={false}
                    />
                );
            }
        }
        return elemForDOM;
    };

    const menuItemRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(menuItemRef, hideMenu);

    return (
        <li className={styles.tx_li}>
            {infoCells.map((elem: columnSlugsType) => renderElem(elem))}
            <div className={styles.action_buttons} ref={menuItemRef}>
                {actionButtons.map((elem: columnSlugsType) => renderElem(elem))}
                {isMenuOpen && (
                    <div className={styles.overflow_menu_container}>
                        {actionButtonsMenu.map((elem: columnSlugsType) =>
                            renderElem(elem),
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}
