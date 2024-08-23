/* eslint-disable */
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';
import { PluginOptions } from '@nestjs/swagger/dist/plugin/merge-options';
import ts, { ArrowFunction, PropertyAssignment } from 'typescript';

const plugin_utils = require('@nestjs/swagger/dist/plugin/utils/plugin-utils');
const ast_utils = require('@nestjs/swagger/dist/plugin/utils/ast-utils');
const lodash = require('lodash');
const model_class = require('@nestjs/swagger/dist/plugin/visitors/model-class.visitor');
model_class.ModelClassVisitor.prototype.createInitializerForTypeLiteralNode = function (
  node: ts.TypeLiteralNode,
  factory: ts.NodeFactory,
  typeChecker: ts.TypeChecker,
  existingProperties: ts.NodeArray<ts.PropertyAssignment>,
  hostFilename: string,
  options: PluginOptions,
): ts.ArrowFunction {
  const propertyAssignments: PropertyAssignment[] = Array.from(node.members || []).map((member: any) => {
    const literalExpr = this.createDecoratorObjectLiteralExpr(factory, member, typeChecker, existingProperties, options, hostFilename, node.getSourceFile());
    return factory.createPropertyAssignment(factory.createIdentifier(member.name?.getText() || 'key'), literalExpr);
  });
  const initializer: ArrowFunction = factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    undefined,
    factory.createParenthesizedExpression(factory.createObjectLiteralExpression(propertyAssignments)),
  );
  return initializer;
};

// IsOptional체크
model_class.ModelClassVisitor.prototype.createDecoratorObjectLiteralExpr = function (
  factory: ts.NodeFactory,
  node: ts.PropertyDeclaration | ts.PropertySignature,
  typeChecker: ts.TypeChecker,
  existingProperties: ts.NodeArray<ts.PropertyAssignment> = factory.createNodeArray(),
  options: PluginOptions = {},
  hostFilename: string = '',
  sourceFile?: ts.SourceFile,
): ts.ObjectLiteralExpression {
  const decorators = ts.canHaveDecorators(node) && ts.getDecorators(node);
  const isRequired = plugin_utils.getDecoratorOrUndefinedByNames(['IsOptional'], decorators, factory) ? false : !node.questionToken;
  const properties = [
    ...existingProperties,
    !plugin_utils.hasPropertyKey('required', existingProperties) &&
        factory.createPropertyAssignment('required', ast_utils.createBooleanLiteral(factory, isRequired)),
    ...this.createTypePropertyAssignments(factory, node.type, typeChecker, existingProperties, hostFilename, options),
    ...this.createDescriptionAndTsDocTagPropertyAssignments(factory, node, typeChecker, existingProperties, options, sourceFile),
    this.createDefaultPropertyAssignment(factory, node, existingProperties, options),
    this.createEnumPropertyAssignment(factory, node, typeChecker, existingProperties, hostFilename, options)
];
if ((ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) &&
    options.classValidatorShim) {
    properties.push(this.createValidationPropertyAssignments(factory, node, options));
}
return factory.createObjectLiteralExpression(lodash.compact(lodash.flatten(properties)));
};

/**
 * [] -> Object Array
 * Generic -> Object
 * Map -> Object
 * Set -> Array
 */
const originalGetTypeReferenceAsString = plugin_utils.getTypeReferenceAsString;
plugin_utils.getTypeReferenceAsString = (type: ts.Type, typeChecker: ts.TypeChecker, arrayDepth = 0) => {
  let result = originalGetTypeReferenceAsString(type, typeChecker, arrayDepth);
  if (type.isTypeParameter()) {
    result = {
      typeName: `Object`,
    };
  }
  if (type.symbol && type.symbol.escapedName == 'Map') {
    result = {
      typeName: `Object`,
    };
  }
  if (type.symbol && type.symbol.escapedName == 'Set') {
    const arrayType = ast_utils.getTypeArguments(type)[0];
    const { typeName, arrayDepth: depth } = plugin_utils.getTypeReferenceAsString(arrayType, typeChecker, arrayDepth + 1);
    if (!typeName) {
      result = { typeName: undefined };
    }
    result = {
      typeName: `${typeName}`,
      isArray: true,
      arrayDepth: depth,
    };
  }
  return result;
};

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      dtoFileNameSuffix: ['.dto.ts', '.schema.ts'],
      controllerFileNameSuffix: ['.controller.ts'],
      classValidatorShim: true,
      pathToSource: __dirname,
      introspectComments: true,
    }),
  ],
  outputDir: __dirname,
  tsconfigPath: './tsconfig.json',
  watch: process.env.WATCH ? true : false,
});