import {
    MediaQueryResultsIF,
    useMediaQuery,
} from '../../../utils/hooks/useMediaQuery';

export default function TestPage() {
    const MEDIA_QUERY = '(min-width: 768px)';
    const output1: boolean = useMediaQuery(MEDIA_QUERY);
    const output2: MediaQueryResultsIF = useMediaQuery();
    console.log(output1);
    console.log(output2);

    return (
        <main>
            <h1>Media Query</h1>
            <p>{MEDIA_QUERY}</p>
        </main>
    );
}
