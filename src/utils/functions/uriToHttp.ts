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