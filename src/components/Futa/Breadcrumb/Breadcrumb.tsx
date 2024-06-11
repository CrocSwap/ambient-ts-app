import { useLocation, Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';
export default function BreadCrumb() {
    const location = useLocation();
    const pathname = location.pathname;
    const pathnames = pathname.split('/').filter((x) => x && !/^v\d+$/.test(x));
    return (
        <nav aria-label='breadcrumb' className={styles.breadcrumbContainer}>
            <ol>
                <li>
                    <Link to='/'>Home</Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/v1/')}`;
                    return (
                        <li key={to}>
                            <Link to={to}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
