import styles from './WalletAndId.module.css';
import trimString from '../../../../utils/functions/trimString';
import { Tooltip } from '@mui/material';
import { useStyles } from '../../../../utils/functions/styles';
import { NavLink } from 'react-router-dom';

interface WalletAndIDProps {
    posHash: string;
    ownerId: string;
    ensName?: string | null;
}
export default function WalletAndId(props: WalletAndIDProps) {
    const { ownerId, posHash, ensName } = props;
    const classes = useStyles();

    const ensNameTruncated = ensName ? trimString(ensName, 4, 3, '…') : null;
    const ownerIdTruncated = trimString(ownerId, 6, 0, '…');
    const posHashTruncated = trimString(posHash, 6, 0, '…');

    const walletWithTooltip = (
        <Tooltip
            classes={{
                tooltip: classes.customTooltip,
            }}
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
        </Tooltip>
    );
    const IDWithTooltip = (
        <Tooltip
            title={posHash}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
            classes={{
                tooltip: classes.customTooltip,
            }}
        >
            <p>{posHashTruncated}</p>
        </Tooltip>
    );
    const ENSWithTooltip = (
        <Tooltip
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
            classes={{
                tooltip: classes.customTooltip,
            }}
        >
            <p className={styles.ens}>{ensNameTruncated}</p>
        </Tooltip>
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
