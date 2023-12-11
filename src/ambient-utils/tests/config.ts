export function isNetworkAccessDisabled() {
    return (
        !process.env.NETWORK_ACCESS || process.env.NETWORK_ACCESS === 'false'
    );
}
