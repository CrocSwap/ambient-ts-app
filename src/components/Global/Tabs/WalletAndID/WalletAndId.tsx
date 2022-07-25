import styles from './WalletAndId.module.css';
import trimString from '../../../../utils/functions/trimString';
import { Tooltip } from '@mui/material';
import { useStyles } from '../../../../utils/functions/styles';

interface WalletAndIDProps {
    posHash: string;
    ownerId: string;
    ensName?: string;
}
export default function WalletAndId(props: WalletAndIDProps) {
    const { ownerId, posHash, ensName } = props;
    const classes = useStyles();

    const ensNameTruncated = ensName ? trimString(ensName, 4, 4, '…') : null;
    const ownerIdTruncated = trimString(ownerId, 4, 4, '…');
    const posHashTruncated = trimString(posHash, 4, 4, '…');

    // const truncatedPosHash = trimString(posHash as string, 6, 0, '…');

    // const mobilePosHash = trimString(posHash as string, 4, 0, '…');

    const walletWithTooltip = (
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
    const IDWithTooltip = (
        <Tooltip
            title={ownerId}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
            classes={{
                tooltip: classes.customTooltip,
            }}
        >
            <p>{ownerIdTruncated}</p>
        </Tooltip>
    );
    const ENSWithTooltip = (
        <Tooltip
            title={ensName ? ensName : 'ensName'}
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
            <section className={styles.account_sing}>{walletWithTooltip}</section>
        </>
    );
}
