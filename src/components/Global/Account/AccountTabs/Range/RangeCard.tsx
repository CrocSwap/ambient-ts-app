// import RangeStatus from '../../RangeStatus/RangeStatus';
import styles from './RangeCard.module.css';

import { FiMoreHorizontal } from 'react-icons/fi';
import RangeStatus from '../../../RangeStatus/RangeStatus';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';

interface RangeCardPropsIF {
    position: PositionIF;
}

export default function RangeCard(props: RangeCardPropsIF) {
    const { position } = props;

    const tokenLogos = (
        <div className={styles.token_logos}>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </div>
    );

    const minMax = (
        <div className={styles.min_max}>
            <p>Min</p>
            <p>Max</p>
        </div>
    );

    const lardeDesktopMinMaxDisplay = (
        <div className={styles.min_max_range}>
            <p>Min: 1234.22</p>
            <p>Max: 232.212</p>
        </div>
    );

    const tokenQty = (
        <div className={styles.token_qty}>
            <p> T1 Qty</p>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
        </div>
    );

    const tokenQtyColumn = (
        <div className={styles.token_qty_column}>
            <p>T1 Qty</p>
            <p>T2 Qty</p>
        </div>
    );
    const accountColumn = (
        <div className={styles.account_column}>
            <p>0xcD...134</p>
            <p>0xcD...134</p>
        </div>
    );

    const menuButtons = (
        <div className={styles.menu_buttons}>
            <button className={styles.reposition_button}>Reposition</button>
            <button className={styles.option_button}>Edit</button>
            <button className={styles.option_button}>Remove</button>
            <button className={styles.option_button}>Details</button>
            <button className={styles.option_button}>Harvest</button>
        </div>
    );

    const menuIcon = (
        <>
            <div className={styles.min_buttons}>
                {position.ambient && (
                    <button className={styles.reposition_button}>Reposition</button>
                )}
                <FiMoreHorizontal size={30} />
            </div>
        </>
    );

    // const menuIcon = (
    //     <div className={styles.min_buttons}>
    //         <button>Reposition</button>
    //         <div className={styles.menu_icon}>...</div>
    //     </div>
    // );

    const inRangeStatus = (
        <div className={styles.range_status}>
            <RangeStatus isInRange isAmbient={false} />
        </div>
    );

    const rangeIcon2 = (
        <div className={styles.range_icon_2}>
            {' '}
            <RangeStatus isInRange justSymbol isAmbient={false} />
        </div>
    );

    const rowData = (
        <div className={styles.row}>
            <div className={styles.pool_name}>ABC/XYZ</div>
            <div className={styles.account}>0xcD...134</div>
            <div className={styles.account}>{position.user}</div>

            {accountColumn}
            {minMax}
            {lardeDesktopMinMaxDisplay}
            {tokenQty}
            {tokenQty}
            {tokenQtyColumn}
            <div className={styles.apy}>APY</div>
            {inRangeStatus}
            {rangeIcon2}
        </div>
    );

    return (
        <div className={styles.main_container}>
            {tokenLogos}
            {rowData}
            {menuButtons}
            {menuIcon}
        </div>
    );
}
