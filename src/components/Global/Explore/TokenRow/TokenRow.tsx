// import styles from './TokenRow.module.css';
import TokenIcon from '../../TokenIcon/TokenIcon';
import { uriToHttp } from '../../../../ambient-utils/dataLayer';

import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import {
    GCServerPoolIF,
    PoolIF,
    TokenIF,
} from '../../../../ambient-utils/types';
import { GrLineChart } from 'react-icons/gr';
import styles from './TokenRow.module.css';
import { dexTokenData } from '../../../../pages/platformAmbient/Explore/useTokenStats';
interface propsIF {
    token: dexTokenData;
    tokenMeta: TokenIF;
    samplePool: PoolIF | undefined;
    backupPool: GCServerPoolIF | undefined;
    goToMarket: (tknA: string, tknB: string) => void;
}

export default function TokenRow(props: propsIF) {
    const { token, tokenMeta, samplePool, goToMarket, backupPool } = props;

    const desktopView = useMediaQuery('(min-width: 768px)');

    const handleClick = (
        event:
            | React.MouseEvent<HTMLDivElement>
            | React.MouseEvent<HTMLButtonElement>,
    ) => {
        // due to gatekeeping in parent, at least one of these pools
        // ... will be a defined value passed through props
        if (samplePool) {
            goToMarket(samplePool.base.address, samplePool.quote.address);
        } else if (backupPool) {
            goToMarket(backupPool.base, backupPool.quote);
        }
        event.stopPropagation();
    };

    const tokenDisplay = (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px',
                textTransform: 'none',
            }}
        >
            <TokenIcon
                token={tokenMeta}
                src={uriToHttp(tokenMeta.logoURI ?? '')}
                alt={tokenMeta.symbol ?? ''}
                size={!desktopView ? 's' : '2xl'}
            />
            <p>{tokenMeta.symbol}</p>
        </div>
    );

    const poolNameDisplay = <p>{tokenMeta.name}</p>;

    const volumeDisplay = <p>{token.normalized?.dexVolNorm.display}</p>;

    const tvlDisplay = (
        <p style={{ textTransform: 'none' }}>
            {token.normalized?.dexTvlNorm.display}
        </p>
    );

    const feesDisplay = <p>{token.normalized?.dexFeesNorm.display}</p>;

    const buttonDisplay = (
        <button className={styles.tradeIcon} onClick={handleClick}>
            <GrLineChart size={18} />
        </button>
    );

    const displayItems = [
        // mobileScrenView ? null :
        {
            element: <div className={styles.tokenIcon}>{tokenDisplay}</div>,
        },
        desktopView
            ? {
                  element: <div>{poolNameDisplay}</div>,
                  classname: styles.poolName,
              }
            : null,
        {
            element: <div>{volumeDisplay}</div>,
        },
        {
            element: <div>{tvlDisplay}</div>,
        },
        {
            element: <div>{feesDisplay}</div>,
        },

        {
            element: <div> {buttonDisplay}</div>,

            classname: styles.tradeButton,
        },
    ];

    return (
        <div className={styles.gridContainer} onClick={handleClick}>
            {displayItems
                .filter((item) => item !== null) // Filter out null values
                .map((item, idx) => (
                    <div
                        key={idx}
                        className={`${styles.gridItem} ${item?.classname}`}
                    >
                        {item?.element}
                    </div>
                ))}
        </div>
    );
}
