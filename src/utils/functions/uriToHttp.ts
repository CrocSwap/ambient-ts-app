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
    // get the prefix of the URI
    const protocol = uri.trim().split(':')[0].toLowerCase();

    // create hashes both for ipfs and ipns URIs
    const ipfsHash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
    const ipnsHash = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];

    // declare a variable to hold the value to return
    // will be an array with one or two strings
    const outputURLs = [];

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
            outputURLs.push(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}/`);
            // create an ipfs.io URL for the ipfs hash
            outputURLs.push(`https://ipfs.io/ipfs/${ipfsHash}/`);
            break;
        // handle ipns URIs
        case 'ipns':
            // create a cloudflare URL for the ipns hash
            outputURLs.push(`https://cloudflare-ipfs.com/ipns/${ipnsHash}/`);
            // create an ipfs.io URL for the ipfs hash
            outputURLs.push(`https://ipfs.io/ipns/${ipnsHash}/`);
            break;
        default:
            break;
    }

    return outputURLs[0];
}