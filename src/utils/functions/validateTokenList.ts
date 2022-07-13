import Ajv from 'ajv';
import { TokenListIF } from '../interfaces/TokenListIF';
import tokenListSchema from '../data/tokenListSchema.json';
import addFormats from 'ajv-formats';

export default function validateTokenList(tokenList: TokenListIF) {
    console.log({ tokenList });
    console.log({ tokenListSchema });
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const tokenListValidator = ajv.compile(tokenListSchema);
    const listPassesValidation = tokenListValidator(tokenList);
    console.log({ listPassesValidation });
    return listPassesValidation;
}
