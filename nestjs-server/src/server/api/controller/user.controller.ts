import { Controller } from '@nestjs/common';
import { UserService } from '../service/user/user.service';

/**
 * 유저 컨트롤러
 */
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
