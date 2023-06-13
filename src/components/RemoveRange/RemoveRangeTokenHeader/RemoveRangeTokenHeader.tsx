import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './RemoveRangeTokenHeader.module.css';
import { RiListSettingsLine } from 'react-icons/ri';

interface propsIF {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    setShowSettings: (value: React.SetStateAction<boolean>) => void;
    showSettings: boolean;
}

export default function RemoveRangeTokenHeader(props: propsIF) {
    const { showSettings, setShowSettings } = props;

    return (
        <div className={styles.container}>
            <div className={styles.token_info}>
                <TokenIcon
                    src={props.baseTokenLogoURI}
                    alt={props.baseTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    src={props.quoteTokenLogoURI}
                    alt={props.quoteTokenSymbol}
                    size='2xl'
                />
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
