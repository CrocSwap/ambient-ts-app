import styles from './AnalyticsHeader.module.css';
import { NavLink } from 'react-router-dom';

export default function AnalyticsHeader() {
    const gradientBackground = 'linear-gradient(90deg, #7371fc 0%, #cdc1ff 49.48%, #7371fc 100%)';

    return (
        <div className={styles.container}>
            <NavLink
                to='/analytics/overview'
                style={({ isActive }) => ({
                    color: isActive ? 'black' : '#545e6f',
                    background: isActive ? gradientBackground : '',
                })}
            >
                Overview
            </NavLink>
            <NavLink
                to='/analytics/pools'
                style={({ isActive }) => ({
                    color: isActive ? 'black' : '#545e6f',
                    background: isActive ? gradientBackground : '',
                })}
            >
                All Pools
            </NavLink>
            {/* <NavLink to='/analytics/trendingpools'style={({ isActive }) => ({
            color: isActive ? 'black' : '#545e6f',
            background: isActive ? gradientBackground : ''
        })}>Trending Pools</NavLink> */}
            <NavLink
                to='/analytics/tokens'
                style={({ isActive }) => ({
                    color: isActive ? 'black' : '#545e6f',
                    background: isActive ? gradientBackground : '',
                })}
            >
                All Tokens
            </NavLink>
            <NavLink
                to='/analytics/ranges/top'
                style={({ isActive }) => ({
                    color: isActive ? 'black' : '#545e6f',
                    background: isActive ? gradientBackground : '',
                })}
            >
                Top Ranges
            </NavLink>
            <NavLink
                to='/analytics/transactions'
                style={({ isActive }) => ({
                    color: isActive ? 'black' : '#545e6f',
                    background: isActive ? gradientBackground : '',
                })}
            >
                Transactions
            </NavLink>
        </div>
    );
}
