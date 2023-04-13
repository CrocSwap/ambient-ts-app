import { Context } from 'https://edge.netlify.com';

export default async (request: Request, context: Context) => {
    const OFAC_SANCTIONED = [
        'AF', // Afghanistan
        'RS', // Serbia (Balkans)
        'MK', // North Macedonia (Balkans)
        'BY', // Belarus
        'MM', // Burma
        'CF', // Central Africa Republic
        'CU', // Cuba
        'CD', // Democratic Republic of Congo
        'ET', // Ethiopia
        'IR', // Iran
        'IQ', // Iraq
        'LB', // Lebanon
        'LY', // Libya
        'ML', // Mali
        'NI', // Nicaragua
        'KP', // North Korea
        'RU', // Russia
        'SO', // Somalia
        'SS', // South Sudan
        'SD', // Sudan
        'SY', // Syria
        'VE', // Venezuela
        'YE', // Yemen
        'ZW', // Zimbabwe
    ];

    const blacklistArg = Deno.env.REACT_APP_BLACKLIST_COUNTRY_CODES;
    const blacklist = OFAC_SANCTIONED.concat(
        blacklistArg ? JSON.parse(blacklistArg) : [],
    );

    // if user not in blocked country, show website
    if (!blacklist.includes(context.geo.country.code)) {
        return;
    }

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
};
