import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import styles from './HarvestPositionHeader.module.css';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
interface IHarvestPositionHeaderProps {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
}

export default function HarvestPositionHeader(props: IHarvestPositionHeaderProps) {
    const dispatch = useAppDispatch();

    return (
        <div className={styles.container}>
            <div
                className={styles.token_info}
                onClick={() => {
                    dispatch(toggleDidUserFlipDenom());
                }}
            >
                <img
                    src={props.isDenomBase ? props.baseTokenLogoURI : props.quoteTokenLogoURI}
                    // src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                    alt=''
                />
                <img
                    src={props.isDenomBase ? props.quoteTokenLogoURI : props.baseTokenLogoURI}
                    alt=''
                />
                {/* <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='' /> */}
                <span>
                    {props.isDenomBase ? props.baseTokenSymbol : props.quoteTokenSymbol} /
                    {props.isDenomBase ? props.quoteTokenSymbol : props.baseTokenSymbol}
                </span>
            </div>
            <RangeStatus isInRange={props.isPositionInRange} isAmbient={props.isAmbient} />
        </div>
    );
}
