import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    const invertGeofenceArg = Netlify.env.get(
        'NETLIFY_EDGE_IS_GEOFENCE_WHITELIST',
    );
    const invertGeofence = !!invertGeofenceArg;

    if (!invertGeofence) {
        return;
    }

    const headers = request?.headers;
    const host = headers.get('host');

    const splitArray = host ? request.url.split(host) : [];

    const path = splitArray[1] || '';

    const geofencedUrl = Netlify.env.get('NETLIFY_EDGE_GEOFENCED_REDIRECT');

    if (geofencedUrl) {
        const url = new URL(geofencedUrl + path, request.url);

        return Response.redirect(url);
    } else {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
          <body>
            Sorry. Ambient is not currently available in ${context.geo.country.name}
          </body>
        </html>
      `;

        return new Response(html, {
            headers: { 'content-type': 'text/html' },
        });
    }
};
