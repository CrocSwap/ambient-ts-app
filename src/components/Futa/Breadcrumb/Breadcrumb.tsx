import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

export default function BreadCrumb() {
    const location = useLocation();
    const pathname = location.pathname + location.search;
    const pathnames = pathname
        .split('/')
        .filter((x) => x && !/^v\d+$/.test(x))
        .filter(
            (segment) =>
                !segment.toLowerCase().includes('chain=') &&
                !segment.toLowerCase().includes('token') &&
                !segment.toLowerCase().includes('tokena=') &&
                !segment.toLowerCase().includes('tokenb='),
        );

    return (
        <nav aria-label='breadcrumb' className={styles.breadcrumbContainer}>
            <ol>
                <li>
                    <Link to='/'>Home</Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/v1/')}`;
                    const decodedString = decodeURIComponent(value);
                    const isLastSegment = index === pathnames.length - 1;

                    // If it's the last segment and contains query parameters, only show the base path
                    const displayString = isLastSegment
                        ? decodedString.split('?')[0]
                        : decodedString;

                    return (
                        <li key={to}>
                            <Link to={to}>{displayString}</Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
