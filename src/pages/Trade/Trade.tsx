import { Outlet } from 'react-router-dom';

export default function Trade() {
    return (
        <main data-testid={'trade'}>
            <h1>This is Trade.tsx</h1>
            <Outlet />
        </main>
    );
}
