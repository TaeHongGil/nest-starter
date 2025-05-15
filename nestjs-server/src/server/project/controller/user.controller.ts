import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@root/core/guard/auth.guard';
import { UserService } from '../service/user/user.service';

/**
 * 유저 컨트롤러
 */
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
}
