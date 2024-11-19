import { Body, Controller, Delete, Get, Post, Put, Query, Session, UseGuards } from '@nestjs/common';
import { AuthGuard, NoAuthGuard } from '@root/core/auth/auth.guard';
import { BOARD_CONFIG } from '@root/core/define/define';
import ServerError from '@root/core/error/server.error';
import { SessionData } from 'express-session';
import { ReqCreateComment, ReqCreatePost, ReqUpdateComment, ReqUpdatePost } from '../common/request.dto';
import { PostComment, ResComments, ResDeletePost, ResPostDetail, ResPosts } from '../common/response.dto';
import { DBComment } from '../service/board/board.comment.schema';
import { CommentService } from '../service/board/board.comment.service';
import { PostService } from '../service/board/board.post.service';

/**
 * 게임 계정 및 인증 처리
 */
@Controller('board')
export class BoardController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  /**
   * 게시글 목록 조회
   * page: 페이지
   */
  @Get('posts')
  @UseGuards(NoAuthGuard)
  async getPosts(@Session() session: SessionData, @Query('page') page: number): Promise<ResPosts> {
    const posts = await this.postService.getPosts(page);
    const postRes = await Promise.all(
      posts.map(async (post) => {
        return {
          postidx: post.postidx,
          updated_at: post.updated_at,
          title: post.title,
          author: post.author,
          views: post.views,
          comment_count: await this.commentService.getCount(post.postidx),
          is_owner: post.useridx == session.user?.useridx,
        };
      }),
    );

    const res: ResPosts = {
      posts: postRes,
      max_page: await this.postService.getTotalPage(),
    };

    return res;
  }

  /**
   * 게시글 조회
   * postidx: 게시글 번호
   */
  @Get('post')
  @UseGuards(NoAuthGuard)
  async getPost(@Session() session: SessionData, @Query('postidx') postidx: number): Promise<ResPostDetail> {
    const post = await this.postService.getPost(postidx, true);
    if (!post) {
      throw ServerError.NOT_FOUND;
    }
    const comments = (await this.commentService.getComments(postidx, 1)).map((comment) => this.formatComment(session, comment));
    const res: ResPostDetail = {
      postidx: post.postidx,
      updated_at: post.updated_at,
      title: post.title,
      author: post.author,
      views: post.views,
      content: post.content,
      comments,
      is_owner: post.useridx == session.user?.useridx,
    };

    return res;
  }

  /**
   * 게시글의 댓글을 페이지별로 조회
   */
  @Get('comment')
  @UseGuards(NoAuthGuard)
  async getComments(@Session() session: SessionData, @Query('postidx') postidx: number, @Query('page') page: number): Promise<ResComments> {
    if (!Number.isInteger(page) || page < 1) {
      throw ServerError.BAD_REQUEST;
    }
    const comments = await this.commentService.getComments(postidx, page);
    const res: ResComments = {
      comments: comments.map((comment) => this.formatComment(session, comment)),
      max_page: await this.commentService.getTotalPage(postidx),
    };

    return res;
  }

  private formatComment(session: SessionData, comment: DBComment): PostComment {
    return {
      commentidx: comment.commentidx,
      depth: comment.path.split('.').length - 1,
      author: comment.is_deleted ? undefined : comment.author,
      content: comment.is_deleted ? undefined : comment.content,
      updated_at: comment.updated_at,
      is_deleted: comment.is_deleted,
      is_owner: comment.useridx == session.user?.useridx,
    };
  }

  /**
   * 댓글 작성
   */
  @Post('comment/create')
  @UseGuards(AuthGuard)
  async createComment(@Session() session: SessionData, @Body() req: ReqCreateComment): Promise<ResComments> {
    let parent: DBComment;
    const post = await this.postService.getPost(req.postidx);
    if (!post) {
      throw ServerError.NOT_FOUND;
    }
    if (req.parent_commentidx) {
      parent = await this.commentService.getComment(req.parent_commentidx);
      if (!parent || parent.path.split('.').length - 1 == BOARD_CONFIG.COMMENT_MAX_DEPTH) {
        throw ServerError.BAD_REQUEST;
      }
    }
    let comment = await this.commentService.createComment(session, req, parent);
    comment = await this.commentService.upsertComment(comment);
    const comments = await this.commentService.getComments(req.postidx, 1);
    const res: ResComments = {
      comments: comments.map((comment) => this.formatComment(session, comment)),
      max_page: await this.commentService.getTotalPage(req.postidx),
    };

    return res;
  }

  /**
   * 게시글 작성
   */
  @Post('post/create')
  @UseGuards(AuthGuard)
  async createPost(@Session() session: SessionData, @Body() req: ReqCreatePost): Promise<ResPostDetail> {
    let post = await this.postService.createPost(session, req);
    post = await this.postService.upsertPost(post);
    const result: ResPostDetail = {
      postidx: post.postidx,
      updated_at: post.updated_at,
      title: post.title,
      author: post.author,
      views: 0,
      content: post.content,
      comments: [],
      is_owner: post.useridx == session.user?.useridx,
    };

    return result;
  }

  /**
   * 게시글 수정
   */
  @Put('post/update')
  @UseGuards(AuthGuard)
  async updatePost(@Session() session: SessionData, @Body() req: ReqUpdatePost): Promise<ResPostDetail> {
    let post = await this.postService.getPost(req.postidx);
    if (!post || session.user.useridx != post.useridx) {
      throw ServerError.BAD_REQUEST;
    }
    post.title = req.title;
    post.content = req.content;
    post = await this.postService.upsertPost(post);
    const comments = (await this.commentService.getComments(req.postidx, 1)).map((comment) => this.formatComment(session, comment));
    const res: ResPostDetail = {
      postidx: post.postidx,
      updated_at: post.updated_at,
      title: post.title,
      author: post.author,
      views: post.views,
      content: post.content,
      comments,
      is_owner: post.useridx == session.user?.useridx,
    };

    return res;
  }

  /**
   * 댓글 수정
   */
  @Put('comment/update')
  @UseGuards(AuthGuard)
  async updateComment(@Session() session: SessionData, @Body() req: ReqUpdateComment): Promise<ResComments> {
    const comment = await this.commentService.getComment(req.commentidx);
    if (!comment || session.user.useridx != comment.useridx) {
      throw ServerError.BAD_REQUEST;
    }
    comment.content = req.content;
    const comments = await this.commentService.getComments(req.postidx, 1);
    const res: ResComments = {
      comments: comments.map((comment) => this.formatComment(session, comment)),
      max_page: await this.commentService.getTotalPage(req.postidx),
    };

    return res;
  }

  /**
   * 글 삭제
   * DB 삭제
   */
  @Delete('post/delete')
  @UseGuards(AuthGuard)
  async deletePost(@Session() session: SessionData, @Query('postidx') postidx: number): Promise<ResDeletePost> {
    const post = await this.postService.getPost(postidx);
    if (!post || session.user.useridx != post.useridx) {
      throw ServerError.BAD_REQUEST;
    }
    const post_deleted = await this.postService.deletePost(postidx);
    const comment_deleted = await this.commentService.deleteComments(postidx);
    const res: ResDeletePost = {
      success: post_deleted && comment_deleted,
    };

    return res;
  }

  /**
   * 댓글 삭제
   * DB 삭제되지 않음
   */
  @Put('comment/delete')
  @UseGuards(AuthGuard)
  async deleteComment(@Session() session: SessionData, @Query('commentidx') commentidx: number): Promise<ResComments> {
    let comment = await this.commentService.getComment(commentidx);
    if (!comment || session.user.useridx != comment.useridx) {
      throw ServerError.BAD_REQUEST;
    }
    comment.is_deleted = true;
    comment = await this.commentService.upsertComment(comment);
    const comments = await this.commentService.getComments(comment.postidx, 1);
    const res: ResComments = {
      comments: comments.map((comment) => this.formatComment(session, comment)),
      max_page: await this.commentService.getTotalPage(comment.postidx),
    };

    return res;
  }
}
