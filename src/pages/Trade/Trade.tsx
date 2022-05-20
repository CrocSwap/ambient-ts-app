import { Outlet, NavLink } from 'react-router-dom';
import styles from './Trade.module.css';
import chart from '../../assets/images/Temporary/chart.svg';

export default function Trade() {
    const routes = [
        {
            path: '/market',
            name: 'Market',
        },
        {
            path: '/range',
            name: 'Range',
        },
        {
            path: '/limit',
            name: 'Limit',
        },
    ];

    // These would be move to their own components, presumably the graph component
    const tokenInfo = (
        <div className={styles.token_info_container}>
            <div className={styles.tokens_info}>
                <div className={styles.tokens_images}>
                    <img
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='token'
                        width='30px'
                    />
                    <img
                        src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                        alt='token'
                        width='30px'
                    />
                </div>
                <span className={styles.tokens_name}>ETH / USDC</span>
            </div>

            <div className={styles.settings_container}>
                <span>Liquidity Profile</span>
                <button>Total</button>
                <button>Cumulative</button>
            </div>
        </div>
    );

    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div className={styles.left_side}>
                <span className={styles.amount}>$2,658.00</span>
                <span className={styles.change}>+8.57% | 24h</span>
            </div>
            <div className={styles.right_side}>
                <span>Timeframe</span>
                <button>1m</button>
                <button>5m</button>
                <button>15m</button>
                <button>1h</button>
                <button>4h</button>
                <button>1d</button>
            </div>
        </div>
    );

    const chartImage = (
        <div className={styles.chart_image}>
            <img src={chart} alt='chart' />
        </div>
    );

    //

    return (
        <main data-testid={'trade'}>
            {/* <h1>This is Trade.tsx</h1> */}
            <main className={styles.main_layout}>
                <div className={`${styles.middle_col} ${styles.graph_container}`}>
                    {tokenInfo}
                    {timeFrameContent}
                    {chartImage}
                </div>
                <div className={styles.right_col}>
                    <div className={styles.navigation_menu}>
                        {routes.map((route, idx) => (
                            <div className={`${styles.nav_container} trade_route`} key={idx}>
                                <NavLink to={`/trade${route.path}`}>{route.name}</NavLink>
                            </div>
                        ))}
                    </div>
                    <Outlet />
                </div>
            </main>
        </main>
    );
}
