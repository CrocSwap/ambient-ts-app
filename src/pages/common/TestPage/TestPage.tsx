import { useMediaQuery } from '@material-ui/core';

export default function TestPage() {
    const MEDIA_QUERY = '(min-width: 768px)';
    const output: boolean = useMediaQuery(MEDIA_QUERY);
    console.log(output);

    return (
        <main>
            <h1>Media Query</h1>
            <p>{MEDIA_QUERY}</p>
        </main>
    );
}
