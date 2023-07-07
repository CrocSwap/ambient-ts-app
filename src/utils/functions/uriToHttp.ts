// TODO:  Currently this function has logic to make two query URLs, a primary
// TODO:  ... and a backup. The app is not configured to make use of this
// TODO:  ... failsafe, so the code is modified to return only the primary
// TODO:  ... URL to query. Later we should refactor the app to accept two
// TODO:  ... an array of URL strings for all fetch() requests and query the
// TODO:  ... secondary if querying the primary fails.  This file will need
// TODO:  ... be modified to output the full output value instead of the first
// TODO:  ... value only, and be given a return type of string[]

// this function takes an input URI and transforms it to a queryable URL
// the URI must follow https, http, ipfs, or ipns standard
export default function uriToHttp(uri: string): string {
    // declare a variable to hold the value to return
    // will be an array with one or two strings
    const outputURLs: string[] = [];

    try {
        // make basic fixes to input for processing
        const fixedURI: string = uri.trim().toLowerCase();

        // special-case URIs which should not be processed by this function
        // any URIs in this array will be returned as-is
        const excludedURIs: string[] = [
            '/ambient-token-list.json',
            '/broken-list.json',
            '/testnet-token-list.json',
        ];

        // if URI is in the excluded array, return it and terminate the function
        if (excludedURIs.includes(fixedURI)) return fixedURI;

        // get the prefix of the URI
        const protocol: string = fixedURI.split(':')[0];

        // create hashes both for ipfs and ipns URIs
        const ipfsHash: string | undefined =
            uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
        const ipnsHash: string | undefined =
            uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];

        // execute differential actions based on the protocol URI prefix
        switch (protocol) {
            // handle https URIs
            case 'https':
                // uri is acceptable in its unaltered form
                outputURLs.push(uri);
                break;
            // handle http URIs
            case 'http':
                // create an https version of the URI
                outputURLs.push('https' + uri.slice(4));
                // create a backup URI using the unaltered http form
                outputURLs.push(uri);
                break;
            // handle ipfs URIs
            case 'ipfs':
                // create a cloudflare URL for the ipfs hash
                outputURLs.push(
                    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}/`,
                );
                // create an ipfs.io URL for the ipfs hash
                outputURLs.push(`https://ipfs.io/ipfs/${ipfsHash}/`);
                break;
            // handle ipns URIs
            case 'ipns':
                // create a cloudflare URL for the ipns hash
                outputURLs.push(
                    `https://cloudflare-ipfs.com/ipns/${ipnsHash}/`,
                );
                // create an ipfs.io URL for the ipfs hash
                outputURLs.push(`https://ipfs.io/ipns/${ipnsHash}/`);
                break;
            default:
                console.debug(
                    `Failed to transform URI ${uri} into a queryable URL. The URI likely did not include a prefix denoting a recognized protocol. URIs must conform to one of the following standards: https, http, ipfs, ipns. If the URI properly follows one of these prefixes, please refer to uriToHttp.ts for debugging. This function will return an empty string to satisfy type protections.`,
                );
                outputURLs.push('');
                break;
        }
    } catch (err) {
        console.warn(err);
        outputURLs.push('');
    }
    return outputURLs[0];
}
