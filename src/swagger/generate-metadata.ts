import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      dtoFileNameSuffix: ['.dto.ts', 'define.ts'], //schema 추출할 파일
      classValidatorShim: true,
      controllerKeyOfComment: 'summary',
      pathToSource: __dirname,
      introspectComments: true,
    }),
  ],
  outputDir: __dirname,
  tsconfigPath: './tsconfig.json',
});
