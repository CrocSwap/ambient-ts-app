import { Outlet, useLocation } from 'react-router-dom';
import styles from './Auctions.module.css';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
export default function Auctions() {
    return (
        <div className={styles.container}>
            <BreadCrumb />
            <Outlet />
        </div>
    );
}
