import styles from './WalletAndId.module.css';
import trimString from '../../../../utils/functions/trimString';

import { NavLink } from 'react-router-dom';
import { DefaultTooltip } from '../../StyledTooltip/StyledTooltip';
interface WalletAndIDProps {
    posHash: string;
    ownerId: string;
    ensName?: string | null;
}
export default function WalletAndId(props: WalletAndIDProps) {
    const { ownerId, posHash, ensName } = props;

    const ensNameTruncated = ensName ? trimString(ensName, 4, 3, '…') : null;
    const ownerIdTruncated = trimString(ownerId, 6, 0, '…');
    const posHashTruncated = trimString(posHash, 6, 0, '…');

    const walletWithTooltip = (
        <DefaultTooltip
            title={
                <div>
                    <p>{ownerId}</p>
                    <NavLink to={`/account/${ownerId}`}>View Account</NavLink>
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
        <DefaultTooltip title={posHash} placement={'right'} arrow enterDelay={400} leaveDelay={200}>
            <p>{posHashTruncated}</p>
        </DefaultTooltip>
    );
    const ENSWithTooltip = (
        <DefaultTooltip
            title={
                <div>
                    <p>{ensName}</p>
                    <NavLink to={`/account/${ensName}`}>View Account</NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p className={styles.ens}>{ensNameTruncated}</p>
        </DefaultTooltip>
    );

    const displayENSorWallet = ensName ? ENSWithTooltip : walletWithTooltip;

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
