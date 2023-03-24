import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    // if user not in blocked country, show website
    if (!['NL'].includes(context.geo.country.code)) {
        return;
    }

    console.log({ context });
    console.log({ request });

    const url = new URL(
        'https://ambient-proven.netlify.app' + request.url,
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
