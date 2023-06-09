import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import styles from './LimitActionTokenHeader.module.css';

interface ILimitActionTokenHeaderProps {
    isOrderFilled: boolean;

    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
}

export default function LimitActionTokenHeader(
    props: ILimitActionTokenHeaderProps,
) {
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
                    src={
                        props.isDenomBase
                            ? props.baseTokenLogoURI
                            : props.quoteTokenLogoURI
                    }
                    // src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/580px-Ethereum-icon-purple.svg.png'
                    alt=''
                />
                <img
                    src={
                        props.isDenomBase
                            ? props.quoteTokenLogoURI
                            : props.baseTokenLogoURI
                    }
                    alt=''
                />
                {/* <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='' /> */}
                <span>
                    {props.isDenomBase
                        ? props.baseTokenSymbol
                        : props.quoteTokenSymbol}{' '}
                    /
                    {props.isDenomBase
                        ? props.quoteTokenSymbol
                        : props.baseTokenSymbol}
                </span>
            </div>
            <OpenOrderStatus isFilled={props.isOrderFilled} />
        </div>
    );
}
