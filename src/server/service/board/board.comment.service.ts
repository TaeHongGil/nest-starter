import { Injectable } from '@nestjs/common';
import { BOARD_CONFIG } from '@root/core/define/define';
import { ReqCreateComment } from '@root/server/common/request.dto';
import { SessionData } from 'express-session';
import { CommentRepository } from './board.comment.repository';
import { DBComment } from './board.comment.schema';

@Injectable()
export class CommentService {
  constructor(private readonly repository: CommentRepository) {}
  async getComment(commentidx: number): Promise<DBComment> {
    return await this.repository.findOne({ commentidx });
  }

  async getComments(postidx: number, page: number): Promise<DBComment[]> {
    return await this.repository.find({ postidx }, page, BOARD_CONFIG.COMMENT_MAX_PER_PAGE);
  }

  async getCount(postidx: number): Promise<number> {
    return await this.repository.count({ postidx });
  }

  async getTotalPage(postidx: number): Promise<number> {
    const count = await this.repository.count({ postidx });

    return Math.ceil(count / BOARD_CONFIG.COMMENT_MAX_PER_PAGE);
  }

  async upsertComment(post: DBComment): Promise<DBComment> {
    return await this.repository.upsert(post);
  }

  async deleteComment(commentidx: number): Promise<boolean> {
    return await this.repository.deleteOne(commentidx);
  }

  async deleteComments(postidx: number): Promise<boolean> {
    return await this.repository.deleteMany(postidx);
  }

  async increaseCommentidx(): Promise<number> {
    return await this.repository.increaseidx();
  }

  async createComment(session: SessionData, req: ReqCreateComment, parent: DBComment = undefined): Promise<DBComment> {
    const commentidx = await this.increaseCommentidx();
    const result: DBComment = {
      postidx: req.postidx,
      commentidx: commentidx,
      useridx: session.user.useridx,
      author: session.user.nickname,
      content: req.content,
      path: parent ? `${parent.path}.${commentidx}` : `${commentidx}`,
      is_deleted: false,
    };

    return result;
  }
}
