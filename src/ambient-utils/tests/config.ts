export function isNetworkAccessDisabled() {
    console.log(process.env.NETWORK_ACCESS);
    return (
        !process.env.NETWORK_ACCESS || process.env.NETWORK_ACCESS === 'disabled'
    );
}
