import { Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import { CommentRepository } from './board.comment.repository';
import { CommentService } from './board.comment.service';
import { PostRepository } from './board.post.repository';
import { PostService } from './board.post.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PostRepository, PostService, CommentRepository, CommentService],
  exports: [PostService, CommentService],
})
export class BoardModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BoardModule.OnModuleInit`);
  }
}
