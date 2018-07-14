import glob from 'glob';
import stripJsonComments from 'strip-json-comments';
import fs from 'mz/fs';
import RJSON from 'relaxed-json';
import ejs from 'ejs';
import path from 'path';

const globAsync = (pattern: string) => new Promise<string[]>((resolve, reject) => {
    glob(pattern, (err: Error | null, matches: string[]) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(matches);
    })
})

const optionNames: string[] = [
    /* Basic Options */
    "target",
    "module",
    "lib",
    "allowJs",
    "checkJs",
    "jsx",
    "declaration",
    "declarationMap",
    "sourceMap",
    "outFile",
    "outDir",
    "rootDir",
    "composite",
    "removeComments",
    "noEmit",
    "importHelpers",
    "downlevelIteration",
    "isolatedModules",
    "preserveConstEnums",

    /* Strict Type-Checking Options */
    "strict",
    "noImplicitAny",
    "strictNullChecks",
    "strictFunctionTypes",
    "strictPropertyInitialization",
    "noImplicitThis",
    "alwaysStrict",

    /* Additional Checks */
    "noUnusedLocals",
    "noUnusedParameters",
    "noImplicitReturns",
    "noFallthroughCasesInSwitch",

    /* Module Resolution Options */
    "moduleResolution",
    "baseUrl",
    "paths",
    "rootDirs",
    "typeRoots",
    "types",
    "allowSyntheticDefaultImports",
    "esModuleInterop",
    "preserveSymlinks",

    /* Source Map Options */
    "sourceRoot",
    "mapRoot",
    "inlineSourceMap",
    "inlineSources",

    /* Experimental Options */
    "experimentalDecorators",
    "emitDecoratorMetadata",
];

const stripFilename = (fileName) => {
    let dirname = path.dirname(fileName);
    if (dirname.startsWith('config-files/github/')) {
        return dirname.substring('config-files/github/'.length);
    } else if (dirname.startsWith('config-files/')) {
        return dirname.substring('config-files/'.length);
    } else {
        return dirname;
    }
}

const main = async () => {
    const matches = await globAsync('config-files/**/tsconfig.json');
    const fileNames = matches.map(match => stripFilename(match));
    const options = {};
    for (const fileName of matches) {
        const data = await fs.readFile(fileName, { encoding: 'ascii' });
        options[stripFilename(fileName)] = RJSON.parse(stripJsonComments(data))['compilerOptions'];
    }
    const template = await fs.readFile(path.resolve(__dirname, 'index.ejs'), 'ascii');
    const html = ejs.render(template, {fileNames: fileNames, optionNames: optionNames, options: options});
    await fs.writeFile('index.html', html, 'ascii');
}

main();
