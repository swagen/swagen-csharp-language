import { DataType, Definition, OperationDefinition, Profile } from 'swagen';
export declare class CSharpLanguage {
    private readonly profile;
    private readonly definition;
    private readonly options;
    constructor(profile: Profile, definition: Definition, options: CSharpLanguageOptions);
    /**
     * Generates a file header based on the Swagen profile and definition details.
     * @returns {string[]} A string array of the lines in the generated header
     */
    buildHeader(): string[];
    buildOperationDocComments(operation: OperationDefinition): string[];
    getDataType(property: DataType): string;
    private getPrimitiveTypeName;
    private prefixNamespace;
    getMethodSignature(operationName: string, operation: OperationDefinition, options: {
        returnTypeFormatter?: (returnType: string) => string;
        visibility?: 'public' | 'private' | 'internal' | 'protected' | undefined;
    }): string;
    getReturnType(operation: OperationDefinition): string;
}
export interface CSharpLanguageOptions {
    modelNamespace?: string;
    collectionType?: 'IReadOnlyList' | 'Array' | 'IList';
}
