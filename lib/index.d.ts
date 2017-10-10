import { DataType, Definition, OperationDefinition, Profile } from 'swagen';
export declare class CSharpLanguage {
    private readonly profile;
    private readonly definition;
    private readonly options;
    constructor(profile: Profile, definition: Definition, options: CSharpLanguageOptions);
    buildHeader(): string[];
    buildOperationDocComments(operation: OperationDefinition): string[];
    getDataType(property: DataType): string;
    private getPrimitiveTypeName(property);
    private prefixNamespace(name);
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
