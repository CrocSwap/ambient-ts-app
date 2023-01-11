export const recursiveMax = (level: string): void => {
    const message = 'Max recursion depth reached!';
    switch (level) {
        case 'error':
            console.error(message);
            break;
        case 'warn':
            console.warn(message);
            break;
        case 'log':
        default:
            console.log(message);
    }
}