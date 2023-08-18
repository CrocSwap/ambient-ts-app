import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './LimitActionTokenHeader.module.css';

interface ILimitActionTokenHeaderProps {
    isOrderFilled: boolean;
    isLimitOrderPartiallyFilled: boolean;
    fillPercentage: number;
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
                <TokenIcon
                    src={
                        props.isDenomBase
                            ? props.baseTokenLogoURI
                            : props.quoteTokenLogoURI
                    }
                    alt={props.quoteTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    src={
                        props.isDenomBase
                            ? props.quoteTokenLogoURI
                            : props.baseTokenLogoURI
                    }
                    alt={props.baseTokenSymbol}
                    size='2xl'
                />
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
            <OpenOrderStatus
                isFilled={props.isOrderFilled}
                isLimitOrderPartiallyFilled={props.isLimitOrderPartiallyFilled}
                fillPercentage={props.fillPercentage}
            />
        </div>
    );
}
