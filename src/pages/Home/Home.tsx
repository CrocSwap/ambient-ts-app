import { useParams } from 'react-router-dom';
export default function Home() {
    const { id } = useParams();
    console.log(id);

    return (
        <main data-testid={'home'}>
            <h1>This is Home.tsx</h1>
        </main>
    );
}
