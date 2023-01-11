export const recursiveMax = (
    level: string,
    fileName: string,
    functionName: string
): void => {
    const message = `Max recursion depth reached in function <<${functionName}>>. Refer to file <<${fileName}>> to troubleshoot.`;
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