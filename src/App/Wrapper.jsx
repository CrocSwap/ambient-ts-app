import { Outlet } from 'react-router-dom';
import PageHeader from './components/PageHeader/PageHeader';

export default function Wrapper() {
    return (
        <>
            <PageHeader />
            <Outlet />
        </>
    );
}
