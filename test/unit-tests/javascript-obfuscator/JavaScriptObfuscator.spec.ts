import { ServiceIdentifiers } from '../../../src/container/ServiceIdentifiers';

import { assert } from 'chai';

import { IInversifyContainerFacade } from '../../../src/interfaces/container/IInversifyContainerFacade';
import { IJavaScriptObfuscator } from '../../../src/interfaces/IJavaScriptObfsucator';
import { IObfuscationResult } from '../../../src/interfaces/IObfuscationResult';

import { NO_CUSTOM_NODES_PRESET } from '../../../src/options/presets/NoCustomNodes';

import { InversifyContainerFacade } from '../../../src/container/InversifyContainerFacade';

describe('JavaScriptObfuscator', () => {
    describe(`obfuscate (sourceCode: string): IObfuscationResult`, () => {
        describe(`source map`, () => {
            const code: string = 'var test = 1;';
            const sourceMapUrl: string = 'test.js.map';

            let javaScriptObfuscator: IJavaScriptObfuscator;

            describe('variant #1: default behaviour', () => {
                const regExp: RegExp = new RegExp(`sourceMappingURL=${sourceMapUrl}`);

                let obfuscatedCode: string,
                    sourceMapObject: any;

                before(() => {
                    const inversifyContainerFacade: IInversifyContainerFacade = new InversifyContainerFacade();

                    inversifyContainerFacade.load(
                        '',
                        {
                            ...NO_CUSTOM_NODES_PRESET,
                            sourceMap: true,
                            sourceMapFileName: sourceMapUrl
                        }
                    );
                    javaScriptObfuscator = inversifyContainerFacade
                        .get<IJavaScriptObfuscator>(ServiceIdentifiers.IJavaScriptObfuscator);

                    const obfuscationResult: IObfuscationResult = javaScriptObfuscator.obfuscate(code);

                    obfuscatedCode = obfuscationResult.getObfuscatedCode();
                    sourceMapObject = JSON.parse(obfuscationResult.getSourceMap());
                });

                it('should link obfuscated code with source map', () => {
                    assert.match(obfuscatedCode, regExp);
                });

                it('should return valid source map with `mappings` property', () => {
                    assert.isOk(sourceMapObject.mappings);
                });
            });

            describe('variant #2: `sourceMapBaseUrl` is set', () => {
                const sourceMapBaseUrl: string = 'http://localhost:9000';
                const regExp: RegExp = new RegExp(`sourceMappingURL=${sourceMapBaseUrl}/${sourceMapUrl}$`);

                let obfuscatedCode: string,
                    sourceMapObject: any;

                before(() => {
                    const inversifyContainerFacade: IInversifyContainerFacade = new InversifyContainerFacade();

                    inversifyContainerFacade.load(
                        '',
                        {
                            ...NO_CUSTOM_NODES_PRESET,
                            sourceMap: true,
                            sourceMapBaseUrl: sourceMapBaseUrl,
                            sourceMapFileName: sourceMapUrl
                        }
                    );
                    javaScriptObfuscator = inversifyContainerFacade
                        .get<IJavaScriptObfuscator>(ServiceIdentifiers.IJavaScriptObfuscator);

                    const obfuscationResult: IObfuscationResult = javaScriptObfuscator.obfuscate(code);

                    obfuscatedCode = obfuscationResult.getObfuscatedCode();
                    sourceMapObject = JSON.parse(obfuscationResult.getSourceMap());
                });

                it('should properly add base url to source map import inside obfuscated code', () => {
                    assert.match(obfuscatedCode, regExp);
                });

                it('should return valid source map with `mappings` property', () => {
                    assert.isOk(sourceMapObject.mappings);
                });
            });
        });
    });
});
