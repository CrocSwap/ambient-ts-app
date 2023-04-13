import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    const GEOFENCED = [];

    const geofenceArg = Deno.env.REACT_APP_GEOFENCED_COUNTRY_CODES;
    const geofenced = GEOFENCED.concat(
        geofenceArg ? JSON.parse(geofenceArg) : [],
    );

    // if user not in geofenced country, show website
    if (!geofenced.includes(context.geo.country.code)) {
        return;
    }

    const headers = request?.headers;
    const host = headers.get('host');

    const splitArray = host ? request.url.split(host) : [];

    const path = splitArray[1] || '';

    const geofencedUrl = Deno.env.REACT_APP_GEOFENCED_REDIRECT;

    if (geofencedUrl) {
        const url = new URL(geofencedUrl + path, request.url);

        return Response.redirect(url);
    } else {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
          <body>
            Sorry, Ambient is not currently available in ${context.geo.country.name}
          </body>
        </html>
      `;

        return new Response(html, {
            headers: { 'content-type': 'text/html' },
        });
    }
};
