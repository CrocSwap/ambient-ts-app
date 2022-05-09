import { Link } from 'react-router-dom';

export default function PageHeader() {
    return (
        <header data-testid={'page-header'}>
            <h1>This is the Page Header!</h1>
            <h3>PageHeader.tsx</h3>
            <nav>
                <Link to='/'>Home</Link>
                <Link to='/trade'>Trade</Link>
                <Link to='/analytics'>Analytics</Link>
                <Link to='/portfolio'>Portfolio</Link>
            </nav>
        </header>
    );
}