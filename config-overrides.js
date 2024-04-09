// eslint-disable-next-line no-undef
module.exports = function override(config, env) {
    // Allow importing of .mjs files
    config.module.rules = config.module.rules.map((rule) => {
        if (rule.oneOf) {
            return {
                ...rule,
                oneOf: rule.oneOf.map((oneOfRule) => {
                    if (oneOfRule.type === 'javascript/auto') {
                        return {
                            ...oneOfRule,
                            test: /\.(js|mjs|jsx|ts|tsx|json)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                        };
                    }
                    return oneOfRule;
                }),
            };
        }
        return rule;
    });

    // Resolve the "Can't import the named export 'EventEmitter' from non EcmaScript module" error
    config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
    });

    // Ensure Webpack knows how to resolve .mjs files
    config.resolve.extensions.push('.mjs');

    return config;
};
