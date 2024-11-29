import { Link, useLocation } from 'react-router-dom';
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
                    const decodedString = decodeURIComponent(value);
                    return (
                        <li key={to}>
                            <Link to={to}>{decodedString}</Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
