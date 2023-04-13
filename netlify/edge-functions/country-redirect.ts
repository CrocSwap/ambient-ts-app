import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    // if user not in blocked country, show website
    if (!['NL'].includes(context.geo.country.code)) {
        return;
    }

    const headers = request?.headers;
    const host = headers.get('host');

    const splitArray = request.url.split(host);

    const path = splitArray[1];

    console.log({ path });

    const url = new URL(
        'https://ambient-proven.netlify.app' + path,
        request.url,
    );

    return Response.redirect(url);

    // const html = await fetch('https://ambient-proven.netlify.app/', {
    //     headers: {
    //         Accept: 'application/json',
    //     },
    // });

    // // const jsonData = await joke.json();
    // return Response.html(html);
};
