export function isNetworkAccessDisabled() {
    console.log(import.meta.env.NETWORK_ACCESS);
    return (
        !import.meta.env.NETWORK_ACCESS ||
        import.meta.env.NETWORK_ACCESS === 'disabled'
    );
}
