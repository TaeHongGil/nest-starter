import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      dtoFileNameSuffix: ['.schema.ts', '.dto.ts'],
      controllerFileNameSuffix: ['.controller.ts', '.gateway.ts'],
      classValidatorShim: true,
      pathToSource: __dirname,
      controllerKeyOfComment: 'description',
      introspectComments: true,
    }),
  ],
  outputDir: __dirname,
  tsconfigPath: './tsconfig.json',
  watch: process.env.WATCH ? true : false,
});
