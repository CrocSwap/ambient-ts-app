export const handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            country: event.headers['x-country'] || 'Not detected',
            allHeaders: event.headers,
        }),
        headers: { 'Content-Type': 'application/json' },
    };
};
