import styles from './TransactionRow2.module.css';
import { columnMetaWithIdIF, columnSlugsType } from './Transactions2';
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
import TxToken from './TxToken';
import TxTokens from './TxTokens';
import { RowItem } from '../../../../styled/Components/TransactionTable';

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
    head?: {
        updateSort: (slug: string | number) => void;
        overrides: {
            txBase: string;
            txQuote: string;
        };
    };
    columnsToShow: columnMetaWithIdIF[];
    isAccountPage: boolean;
    isMenuOpen: boolean;
    onMenuToggle: () => void;
    hideMenu: () => void;
}

export default function TransactionRow2(props: propsIF) {
    const {
        tx,
        head,
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

    // logic to take a column slug and return the corresponding DOM element
    const renderElem = (el: columnSlugsType): JSX.Element | null => {
        const elemMeta: columnMetaWithIdIF|undefined = columnsToShow.find(
            (col: columnMetaWithIdIF) => col.id === el,
        );
        if (!elemMeta) return null;
        const colWidth: number = elemMeta.width;
        let elemForDOM: JSX.Element | null = null;
        switch (elemMeta.id) {
            case 'timeStamp':
                elemForDOM = <TimeStamp tx={tx} width={colWidth} />;
                break;
            case 'txId':
                elemForDOM = <TxId tx={tx} width={colWidth} />;
                break;
            case 'txWallet':
                elemForDOM = (
                    <TxWallet
                        isOwnerActiveAccount={isOwnerActiveAccount}
                        ownerId={ownerId}
                        isAccountPage={isAccountPage}
                        width={colWidth}
                    />
                );
                break;
            case 'txPrice':
                elemForDOM = <TxPrice tx={tx} isAccountPage={isAccountPage} />;
                break;
            case 'txSide':
                elemForDOM = <TxSide tx={tx} isAccountPage={isAccountPage} width={colWidth} />;
                break;
            case 'txValue':
                elemForDOM = <TxValue width={colWidth} tx={tx} />;
                break;
            case 'txType':
                elemForDOM = <TxType tx={tx} isAccountPage={isAccountPage} width={colWidth} />;
                break;
            case 'txBase':
                elemForDOM = <TxToken tx={tx} width={colWidth} isAccountPage={isAccountPage} isBase={true} />;
                break;
            case 'txQuote':
                elemForDOM = <TxToken tx={tx} width={colWidth} isAccountPage={isAccountPage} isBase={false} />;
                break;
            case 'txTokens':
                elemForDOM = <TxTokens tx={tx} width={colWidth} isAccountPage={isAccountPage} isBase={false} />;
                break;
            case 'overflowBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='overflowBtn'
                        hide={false}
                        onMenuToggle={onMenuToggle}
                    />
                );
                break;
            case 'editBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='editBtn'
                        hide={false}
                    />
                );
                break;
            case 'harvestBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='harvestBtn'
                        hide={false}
                    />
                );
                break;
            case 'addBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='addBtn'
                        hide={false}
                    />
                );
                break;
            case 'leafBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='leafBtn'
                        hide={false}
                    />
                );
                break;
            case 'removeBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='removeBtn'
                        hide={false}
                    />
                );
                break;
            case 'shareBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='shareBtn'
                        hide={false}
                    />
                );
                break;
            case 'exportBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='exportBtn'
                        hide={false}
                    />
                );
                break;
            case 'walletBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='walletBtn'
                        hide={false}
                    />
                );
                break;
            case 'copyBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='copyBtn'
                        hide={false}
                    />
                );
                break;
            case 'downloadBtn':
                elemForDOM = (
                    <TxButton
                        tx={tx}
                        width={colWidth}
                        iconName='downloadBtn'
                        hide={false}
                    />
                );
                break;
            default:
                elemForDOM = null;
                break;
        };

        return elemForDOM;
    };

    const getHeaderContent = (col: columnSlugsType): JSX.Element|null => {
        const elemMeta: columnMetaWithIdIF|undefined = columnsToShow.find(
            (c: columnMetaWithIdIF) => c.id === col
        );
        const text: string = elemMeta?.readable ?? '';
        const width: number = elemMeta?.width ?? 0;
        return (
            <RowItem
                justifyContent='center'
                data-label='side'
                tabIndex={0}
                width={width}
            >
                {text}
            </RowItem>
        );
    };

    const menuItemRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(menuItemRef, hideMenu);

    return (
        head ? (<li className={styles.tx_li}>
            {infoCells.map((elem: columnSlugsType) => getHeaderContent(elem))}
            <div className={styles.action_buttons} ref={menuItemRef}>
                {actionButtons.map((elem: columnSlugsType) => getHeaderContent(elem))}
                {isMenuOpen && (
                    <div className={styles.overflow_menu_container}>
                        {actionButtonsMenu.map((elem: columnSlugsType) =>
                            getHeaderContent(elem),
                        )}
                    </div>
                )}
            </div>
        </li>) : (<li className={styles.tx_li}>
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
    </li>)
    );

}
