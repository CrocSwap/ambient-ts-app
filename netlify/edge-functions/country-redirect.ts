import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    // if user not in blocked country, show website
    if (!['NL'].includes(context.geo.country.code)) {
        return;
    }

    const html = await fetch('https://ambient-proven.netlify.app/', {
        headers: {
            Accept: 'application/json',
        },
    });

    // const jsonData = await joke.json();
    return Response.html(html);
};
