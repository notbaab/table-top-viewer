module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        // "plugin:vue/recommended"
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "no-console":0,
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            "error",
            { "argsIgnorePattern": "^_" }
        ],
        "padding-line-between-statements": [
            "error",
            { "blankLine": "always", "prev": "*", "next": "function" },
        ],
        "lines-between-class-members": [
            "error", "always"
        ],
        "vue/max-attributes-per-line": "off"
    }
};
