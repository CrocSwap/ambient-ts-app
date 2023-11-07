import uriToHttp from '../../utils/functions/uriToHttp';

export default async function fetchWithFallbacks<T>(
    uri: string,
): Promise<T | undefined> {
    let output: T | undefined;

    const endpoints: string[] = uriToHttp(uri, 'retry');

    for (const endpoint of endpoints) {
        const response = await fetch(endpoint);
        if (response.ok) {
            output = await response.json();
            break;
        }
    }

    return output;
}
