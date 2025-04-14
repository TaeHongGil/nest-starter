import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

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
