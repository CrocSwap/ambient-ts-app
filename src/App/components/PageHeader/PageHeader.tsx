export default function PageHeader() {
    console.log('rendered PageHeader.tsx');
    return (
        <header data-testid={'page-header'}>
            <h1>This is the Page Header!</h1>
            <h3>PageHeader.tsx</h3>
        </header>
    );
}