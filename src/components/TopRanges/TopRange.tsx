import { isAddress } from '../../utils';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import PoolDisplay from '../Global/Analytics/PoolDisplay';
import TokenDisplay from '../Global/Analytics/TokenDisplay';
import RangeStatus from '../Global/RangeStatus/RangeStatus';

import Apy from '../Global/Tabs/Apy/Apy';
import RangeMinMax from '../Global/Tabs/RangeMinMax/RangeMinMax';
import RangesMenu from '../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import TokenQty from '../Global/Tabs/TokenQty/TokenQty';
// import WalletAndId from '../Global/Tabs/WalletAndID/WalletAndId';
import styles from './TopRange.module.css';

export default function TopRange() {
    const tempOwnerId = '0xa2b398145b7fc8fd9a01142698f15d329ebb5ff5090cfcc8caae440867ab9919';
    const tempPosHash = '0x01e650abfc761c6a0fc60f62a4e4b3832bb1178b';
    const quoteToken: TokenIF = {
        address: tempPosHash,
        name: 'ETherium',
        symbol: 'ETH',
        chainId: 4,
        decimals: 44,
        logoURI: '',
    };
    const baseToken: TokenIF = {
        address: tempOwnerId,
        name: 'ETherium',
        symbol: 'ETH',
        chainId: 4,
        decimals: 44,
        logoURI: '',
    };

    return (
        <div className={styles.main_container}>
            <div className={styles.tokens_container}>
                <TokenDisplay token0={isAddress(tempOwnerId)} token1={isAddress(tempPosHash)} />
            </div>

            <div className={styles.row_container}>
                <PoolDisplay token0={'USDC'} token1={'ETH'} />
                {/* <WalletAndId ownerId={tempOwnerId} posHash={tempPosHash} /> */}
                <RangeMinMax min={100} max={1000} />

                <TokenQty
                    baseTokenSymbol={baseToken.symbol}
                    quoteTokenSymbol={quoteToken.symbol}
                    baseQty={undefined}
                    quoteQty={undefined}
                />
                <Apy amount={10} />

                <RangeStatus isInRange={true} isAmbient={true} />
            </div>

            <div className={styles.menu_container}>
                <RangesMenu
                    userMatchesConnectedAccount={true}
                    rangeDetailsProps={true}
                    posHash={tempPosHash as string}
                    positionData={undefined}
                />
            </div>
        </div>
    );
}
