import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      dtoFileNameSuffix: ['.dto.ts'],
      classValidatorShim: true,
      pathToSource: __dirname,
    }),
  ],
  outputDir: __dirname,
  tsconfigPath: './tsconfig.json',
});
