import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import styles from './HarvestPositionHeader.module.css';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
// interface IHarvestPositionHeaderProps {
//     isPositionInRange: boolean;
//     isAmbient: boolean;
//     baseTokenSymbol: string;
//     quoteTokenSymbol: string;
//     baseTokenLogoURI: string;
//     quoteTokenLogoURI: string;
//     isDenomBase: boolean;
// }

export default function HarvestPositionHeader() {
    // const dispatch = useAppDispatch();

    // temp values
    const baseTokenSymbol = 'ETH';
    const quoteTokenSymbol = 'USDC';

    const baseTokenLogoURI =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png';

    const quoteTokenLogoURI = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';

    const isDenomBase = false;

    const isAmbient = false;

    const isPositionInRange = true;

    return (
        <div className={styles.container}>
            <div
                className={styles.token_info}
                // onClick={() => {
                //     dispatch(toggleDidUserFlipDenom());
                // }}
            >
                <img src={isDenomBase ? baseTokenLogoURI : quoteTokenLogoURI} alt='' />
                <img src={isDenomBase ? quoteTokenLogoURI : baseTokenLogoURI} alt='' />
                <span>
                    {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /
                    {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
                </span>
            </div>
            <RangeStatus isInRange={isPositionInRange} isAmbient={isAmbient} />
        </div>
    );
}
