import { DataType, Definition, OperationDefinition, Profile } from 'swagen';

export class CSharpLanguage {
    constructor(
        private readonly profile: Profile,
        private readonly definition: Definition,
        private readonly options: CSharpLanguageOptions,
    ) {
    }

    /**
     * Generates a file header based on the Swagen profile and definition details.
     * @returns {string[]} A string array of the lines in the generated header
     */
    public buildHeader(): string[] {
        const header = [
            `// ------------------------------`,
            `// <auto-generated>`,
            `//     Generated using the Swagen tool`,
            `//     Generator: ${this.profile.generator}`,
        ];
        if (this.profile.mode) {
            header.push(`//     Mode: ${this.profile.mode}`);
        }
        header.push(
            `// </auto-generated>`,
            `// ------------------------------`,
        );
        if (this.definition && this.definition.metadata) {
            if (this.definition.metadata.title) {
                header.push(`// ${this.definition.metadata.title}`);
            }
            if (this.definition.metadata.description) {
                header.push(`// ${this.definition.metadata.description}`);
            }
            if (this.definition.metadata.baseUrl) {
                header.push(`// Base URL: ${this.definition.metadata.baseUrl}`);
            }
        }
        return header;
    }

    public buildOperationDocComments(operation: OperationDefinition): string[] {
        const comments: string[] = [];

        if (operation.description) {
            comments.push(`/// ${operation.description}`);
        }
        if (operation.description2) {
            comments.push(`/// ${operation.description2}`);
        }
        if (comments.length > 0) {
            comments.unshift(`/// <summary>`);
            comments.push(`/// </summary>`);
        }

        const describedParams = (operation.parameters || [])
            .filter(p => !!p.description)
            .map(p => `/// <param name="${p.name}">${p.description}</param>`);
        comments.push(...describedParams);

        return comments;
    }

    public getDataType(property: DataType): string {
        let typeName: string;
        if (property.primitive) {
            typeName = this.getPrimitiveTypeName(property);
        } else if (property.complex) {
            typeName = this.prefixNamespace(property.complex);
        } else if (property.enum) {
            typeName = this.prefixNamespace(property.enum);
        } else {
            throw new Error(`Cannot understand type of property in definition: ${JSON.stringify(property, null, 4)}`);
        }
        if (!property.isArray) {
            return typeName;
        }
        switch (this.options.collectionType || 'IReadOnlyList') {
            case 'IReadOnlyList': return `IReadOnlyList<${typeName}>`;
            case 'Array': return `${typeName}[]`;
            case 'IList': return `IList<${typeName}>`;
            default: throw new Error(`Unrecognized collection type - ${this.options.collectionType}.`);
        }
    }

    private getPrimitiveTypeName(property: DataType): string {
        switch (property.primitive) {
            case 'integer':
                switch (property.subType) {
                    case 'int32':
                        return 'int';
                    case 'int64':
                        return 'long';
                    default:
                        return 'int';
                }
            case 'number':
                return property.subType || 'double';
            case 'string': {
                switch (property.subType) {
                    case 'date-time':
                    case 'date':
                        return 'DateTime';
                    case 'uuid':
                        return 'Guid';
                    case 'byte':
                    case 'password':
                        return 'string';
                    default:
                        return 'string';
                }
            }
            case 'boolean':
                return 'bool';
            case 'file':
            case 'object':
                return 'object';
            case 'array':
                return 'object[]';
            default:
                throw new Error(`Cannot translate primitive type ${JSON.stringify(property, null, 4)}`);
            }
    }

    private prefixNamespace(name: string): string {
        return this.options.skipModelPrefix ? name : `__models.${name}`;
    }

    public getMethodSignature(operationName: string, operation: OperationDefinition, options: {
        returnTypeFormatter?: (returnType: string) => string,
        visibility?: 'public' | 'private' | 'internal' | 'protected' | undefined,
    }): string {
        const accessor = options.visibility ? options.visibility + ' ' : '';

        const parameters = (operation.parameters || []).reduce((accumulate, parameter) => {
            if (accumulate) {
                accumulate += ', ';
            }
            accumulate += `${this.getDataType(parameter.dataType)} ${parameter.name}`;
            return accumulate;
        }, '');

        let returnType = this.getReturnType(operation);
        if (typeof options.returnTypeFormatter === 'function') {
            returnType = options.returnTypeFormatter(returnType);
        }

        const methodSig = `${accessor ? accessor + ' ' : ''}${returnType} ${operationName}(${parameters})`;
        return methodSig;
    }

    public getReturnType(operation: OperationDefinition): string {
        if (!operation.responses) {
            return 'void';
        }

        for (const statusKey in operation.responses) {
            if (operation.responses.hasOwnProperty(statusKey)) {
                const statusCode = +statusKey;
                if (statusCode >= 200 && statusCode < 300 && operation.responses[statusKey].dataType) {
                    return this.getDataType(operation.responses[statusKey].dataType);
                }
            }
        }

        return 'void';
    }
}

export interface CSharpLanguageOptions {
    modelNamespace?: string;
    skipModelPrefix?: boolean;
    collectionType?: 'IReadOnlyList' | 'Array' | 'IList';
}
