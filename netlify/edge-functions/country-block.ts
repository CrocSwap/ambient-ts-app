import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    if (context.geo.country.code !== 'NL') {
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
