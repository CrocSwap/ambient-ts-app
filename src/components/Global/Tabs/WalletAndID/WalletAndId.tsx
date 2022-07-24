import styles from './WalletAndId.module.css';
// import trimString from '../../../../utils/functions/trimString';
import { Tooltip } from '@mui/material';
import { useStyles } from '../../../../utils/functions/styles';

export default function WalletAndId() {
    const classes = useStyles();

    // const ownerIdTruncated = ownerId ? trimString(ownerId, 7, 0, '…') : null;
    // const mobileOwnerId = ownerId ? trimString(ownerId, 4, 0, '…') : null;

    // const ensName = 'benw....eth';
    // const ensNameTruncated = ensName ? trimString(ensName, 4, 3, '…') : null;

    const ownerId = '0xcD...1234';
    const posHash = '0xCd...9876';

    // const truncatedPosHash = trimString(posHash as string, 6, 0, '…');

    // const mobilePosHash = trimString(posHash as string, 4, 0, '…');

    const walletWithTooltip = (
        <Tooltip
            title={'this is full posHash'}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
            classes={{
                tooltip: classes.customTooltip,
            }}
        >
            <p>{posHash}</p>
        </Tooltip>
    );
    const IDWithTooltip = (
        <Tooltip
            title={'this is full ID'}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
            classes={{
                tooltip: classes.customTooltip,
            }}
        >
            <p>{ownerId}</p>
        </Tooltip>
    );
    // const ENSWithTooltip = (
    //     <Tooltip
    //         title={'this is full ENS'}
    //         placement={'right'}
    //         arrow
    //         enterDelay={400}
    //         leaveDelay={200}
    //         classes={{
    //             tooltip: classes.customTooltip,
    //         }}
    //     >
    //         <p>{ensName}</p>
    //     </Tooltip>
    // );

    // todo
    // Create variable with ens name with its own styling
    // Create a variable that displays ens name if we have it else display wallet
    // return this variable in the wallet place

    return (
        <>
            <section className={styles.column_account}>
                {IDWithTooltip}
                {walletWithTooltip}
            </section>
            <section className={styles.account_sing}>{IDWithTooltip}</section>
            <section className={styles.account_sing}>{walletWithTooltip}</section>
        </>
    );
}
