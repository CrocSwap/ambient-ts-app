import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    // if user not in blocked country, show website
    if (!['KP', 'IR', 'CU'].includes(context.geo.country.code)) {
        if (['NL'].includes(context.geo.country.code)) {
            Response.redirect('https://icanhazdadjoke.com/', 302);
            // Response.redirect('https://ambient-proven.netlify.app/', 302);
            // return new URL('https://ambient-proven.netlify.app/', request.url);
        }
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
