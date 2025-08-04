import { Body, Controller, Get, Put, Query, Session } from '@nestjs/common';
import { SessionData } from '@root/core/auth/auth.schema';
import { RoleGuard } from '@root/core/decorator/core.decorator';
import { ROLE } from '@root/core/define/core.define';
import CoreError from '@root/core/error/core.error';
import { AccountService } from '@root/server/api/service/account/account.service';
import { ReqAdminUpdateRole, ReqGetUsers } from '../dto/api.request.dto';
import { ResGetUsers, ResUser } from '../dto/api.response.dto';

/**
 * 계정 컨트롤러
 */
@Controller('admin')
@RoleGuard(ROLE.ADMIN)
export class AdminController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * 유저 목록 조회
   */
  @Get('/users')
  async getUsers(@Session() session: SessionData, @Query() req: ReqGetUsers): Promise<ResGetUsers> {
    let parsedFilter: Record<string, any> = {};
    if (req.filter) {
      try {
        parsedFilter = JSON.parse(req.filter);
      } catch (error) {
        throw CoreError.BAD_REQUEST;
      }
    }

    const dbUsers = await this.accountService.getAllUsersAsync(req.limit, req.page, parsedFilter);

    const users: ResUser[] = dbUsers.map((user) => ({
      useridx: user.useridx,
      nickname: user.nickname,
      role: user.role,
      created_at: user.created_at.toISOString(),
    }));

    return { users };
  }

  /**
   * 유저 역할 업데이트
   */
  @Put('/update/role')
  async updateUserRole(@Session() session: SessionData, @Body() req: ReqAdminUpdateRole): Promise<ResUser> {
    if (req.role == ROLE.ADMIN) {
      throw CoreError.BAD_REQUEST;
    }

    const dbUsers = await this.accountService.getAccountNyUseridxAsync(req.useridx);
    dbUsers.role = req.role;
    await this.accountService.upsertAccountAsync(dbUsers);

    return {
      useridx: dbUsers.useridx,
      nickname: dbUsers.nickname,
      role: dbUsers.role,
      created_at: dbUsers.created_at.toISOString(),
    };
  }
}
