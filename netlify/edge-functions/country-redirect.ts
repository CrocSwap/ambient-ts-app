import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    const GEOFENCED = ['NL']; // Test, don't actually block Holland

    const geofenceArg = process.env.REACT_APP_GEOFENCED_COUNTRY_CODES;
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

    const url = new URL(
        'https://ambient-proven.netlify.app' + path,
        request.url,
    );

    return Response.redirect(url);
};
