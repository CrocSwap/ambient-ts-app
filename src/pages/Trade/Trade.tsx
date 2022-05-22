import { Outlet, NavLink } from 'react-router-dom';
import styles from './Trade.module.css';

export default function Trade() {
    const routes = [
        {
            path: '/market',
            name: 'Market',
        },
        {
            path: '/limit',
            name: 'Limit',
        },
        {
            path: '/range',
            name: 'Range',
        },
    ];
    return (
        <main data-testid={'trade'}>
            {/* <h1>This is Trade.tsx</h1> */}
            <main className={styles.main_layout}>
                <div className={styles.middle_col}>
                    <h1>THIS IS GRAPH COMPONENT</h1>
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
