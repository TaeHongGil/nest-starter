import { Injectable } from '@nestjs/common';
import { SessionData } from '@root/core/auth/auth.schema';
import { BOARD_CONFIG } from '@root/core/define/define';
import { ReqCreatePost } from '@root/server/common/request.dto';
import { PostRepository } from './board.post.repository';
import { DBPost } from './board.post.schema';

@Injectable()
export class PostService {
  constructor(private readonly repository: PostRepository) {}
  async getPost(postidx: number, increaseViews = false): Promise<DBPost> {
    return await this.repository.findOne({ postidx }, increaseViews);
  }

  async getPosts(page: number): Promise<DBPost[]> {
    return await this.repository.find({}, page, BOARD_CONFIG.POST_MAX_PER_PAGE);
  }

  async getTotalPage(): Promise<number> {
    const count = await this.repository.count({});

    return Math.ceil(count / BOARD_CONFIG.POST_MAX_PER_PAGE);
  }

  async upsertPost(post: DBPost): Promise<DBPost> {
    return await this.repository.upsert(post);
  }

  async deletePost(postidx: number): Promise<boolean> {
    return await this.repository.delete(postidx);
  }

  async increasePostidx(): Promise<number> {
    return await this.repository.increaseidx();
  }

  async createPost(session: SessionData, req: ReqCreatePost): Promise<DBPost> {
    const result: DBPost = {
      postidx: await this.increasePostidx(),
      title: req.title,
      content: req.content,
      author: session.user.nickname,
      useridx: session.user.useridx,
      views: 0,
    };

    return result;
  }
}
