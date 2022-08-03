import { TokenIF } from '../../../utils/interfaces/exports';

export default function clickStar(token: TokenIF) {
    console.log('user clicked the star: ', token);
    const user = JSON.parse(localStorage.getItem('user') as string);
    user.favePools.push(token.address);
    localStorage.setItem('user', JSON.stringify(user));
}