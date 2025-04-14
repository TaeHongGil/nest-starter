import { Module } from '@nestjs/common';
import { UITestController } from './ui.test.controller';
import { TestService as UITestService } from './ui.test.service';

@Module({
  imports: [],
  providers: [UITestService],
  exports: [UITestService],
  controllers: [UITestController],
})
export class UITestModule {}
