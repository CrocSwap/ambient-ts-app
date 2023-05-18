import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import styles from './RemoveRangeTokenHeader.module.css';
import { RiListSettingsLine } from 'react-icons/ri';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
interface propsIF {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;

    setShowSettings: (value: React.SetStateAction<boolean>) => void;
    showSettings: boolean;
}

export default function RemoveRangeTokenHeader(props: propsIF) {
    // const dispatch = useAppDispatch();
    const { showSettings, setShowSettings } = props;

    return (
        <div className={styles.container}>
            <div className={styles.token_info}>
                {props.baseTokenLogoURI ? (
                    <img
                        src={props.baseTokenLogoURI}
                        alt={props.baseTokenSymbol}
                    />
                ) : (
                    <NoTokenIcon
                        tokenInitial={props.baseTokenSymbol?.charAt(0)}
                        width='30px'
                    />
                )}
                {props.quoteTokenLogoURI ? (
                    <img
                        src={props.quoteTokenLogoURI}
                        alt={props.quoteTokenSymbol}
                    />
                ) : (
                    <NoTokenIcon
                        tokenInitial={props.quoteTokenSymbol?.charAt(0)}
                        width='30px'
                    />
                )}

                <span>
                    {props.baseTokenSymbol} /{props.quoteTokenSymbol}
                </span>
            </div>

            <section
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '4px',
                }}
            >
                <RangeStatus
                    isInRange={props.isPositionInRange}
                    isEmpty={false}
                    isAmbient={props.isAmbient}
                />
                <div
                    onClick={() => setShowSettings(!showSettings)}
                    className={styles.settings_icon}
                >
                    {showSettings ? null : <RiListSettingsLine size={20} />}
                </div>
            </section>
        </div>
    );
}
