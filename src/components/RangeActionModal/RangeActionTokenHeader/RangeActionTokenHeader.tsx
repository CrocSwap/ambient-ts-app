import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './RangeActionTokenHeader.module.css';
import { RiListSettingsLine } from 'react-icons/ri';

interface RangeActionTokenHeaderIF {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    setShowSettings: (value: React.SetStateAction<boolean>) => void;
    showSettings: boolean;
}

export default function RangeActionTokenHeader(
    props: RangeActionTokenHeaderIF,
) {
    const { showSettings, setShowSettings } = props;
    const settingsSvg = (
        <svg
            width='16'
            height='16'
            viewBox='0 0 14 14'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={styles.hoverable_icon}
        >
            <rect
                y='9.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <rect
                x='5.25'
                y='2.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <circle cx='12.25' cy='10.5' r='1.75' fill=''></circle>
            <circle cx='1.75' cy='3.5' r='1.75' fill=''></circle>
        </svg>
    );

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
                    size='s'
                />
                <div
                    onClick={() => setShowSettings(!showSettings)}
                    className={styles.settings_icon}
                >
                    {showSettings ? null : settingsSvg}
                </div>
            </section>
        </div>
    );
}
