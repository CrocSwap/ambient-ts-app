import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    // if user not in blocked country, show website
    if (!['KP', 'IR', 'CU'].includes(context.geo.country.code)) {
        return;
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <body>
        Sorry, we are unavailable in ${context.geo.country.name}
      </body>
    </html>
  `;

    return new Response(html, {
        headers: { 'content-type': 'text/html' },
    });
};
