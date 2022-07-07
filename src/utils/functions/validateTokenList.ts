import Ajv from 'ajv';
import { TokenListIF } from '../interfaces/TokenListIF';
import * as tokenListSchema from '../data/tokenListSchema.json';

export default function validateTokenList(tokenList: TokenListIF) {
    console.log(tokenList);
    console.log(tokenListSchema);
    const tokenListValidator = new Ajv({ allErrors: true }).compile(tokenListSchema);
    console.log(tokenListValidator(tokenList));
}
