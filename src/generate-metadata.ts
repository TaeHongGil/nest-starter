import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      dtoFileNameSuffix: ['game.req.bean.ts', 'game.req.cheat.bean'],
      classValidatorShim: true,
      pathToSource: __dirname,
    }),
  ],
  outputDir: __dirname,
  tsconfigPath: './tsconfig.json',
});
