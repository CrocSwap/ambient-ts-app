import styles from './WalletAndId.module.css';
import trimString from '../../../../utils/functions/trimString';

import { NavLink } from 'react-router-dom';
import { DefaultTooltip } from '../../StyledTooltip/StyledTooltip';
interface WalletAndIDProps {
    posHash: string;
    ownerId: string;
    ensName?: string | null;
    isOwnerActiveAccount: boolean;
}
export default function WalletAndId(props: WalletAndIDProps) {
    const { ownerId, posHash, ensName, isOwnerActiveAccount } = props;

    const ensNameTruncated = ensName ? trimString(ensName, 5, 3, '…') : null;
    const ownerIdTruncated = trimString(ownerId, 6, 0, '…');
    const posHashTruncated = trimString(posHash, 6, 0, '…');

    const walletWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{ownerId}</p>
                    <NavLink to={`/${ownerId}`}>View Account</NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p>{ownerIdTruncated}</p>
        </DefaultTooltip>
    );
    const IDWithTooltip = (
        <DefaultTooltip
            interactive
            title={posHash}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p>{posHashTruncated}</p>
        </DefaultTooltip>
    );

    const ownedTransactionWithENS = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{ensName}</p>
                    <NavLink to={`/${ensName}`}>View Account</NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p className={styles.ens}>You</p>
        </DefaultTooltip>
    );

    const ownedTransactionNoENS = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{ownerId}</p>
                    <NavLink to={`/${ownerId}`}>View Account</NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p className={styles.ens}>You</p>
        </DefaultTooltip>
    );

    const ENSWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{ensName}</p>
                    <NavLink to={`/${ensName}`}>View Account</NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p className={styles.ens}>
                {ensName && ensName.length > 10 ? ensNameTruncated : ensName}
            </p>
        </DefaultTooltip>
    );

    // const displayENSorWallet = ensName ? ENSWithTooltip : walletWithTooltip;
    const displayENSorWallet = isOwnerActiveAccount
        ? ensName
            ? ownedTransactionWithENS
            : ownedTransactionNoENS
        : ensName
        ? ENSWithTooltip
        : walletWithTooltip;
    return (
        <>
            <section className={styles.column_account}>
                {IDWithTooltip}
                {displayENSorWallet}
            </section>
            <section className={styles.account_sing}>{IDWithTooltip}</section>
            <section className={styles.account_sing}>{displayENSorWallet}</section>
        </>
    );
}
