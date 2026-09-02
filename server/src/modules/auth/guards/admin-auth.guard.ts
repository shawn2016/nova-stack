import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** B 端路由：拒绝 type=member 的 JWT */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      path?: string;
      url?: string;
    }>();
    const path = request.path ?? request.url ?? '';

    const isAdminRoute =
      path.startsWith('/auth') ||
      path.startsWith('/users') ||
      path.startsWith('/roles') ||
      path.startsWith('/menus') ||
      path.startsWith('/articles') ||
      path.startsWith('/files') ||
      path.startsWith('/dict');

    if (!isAdminRoute) {
      return true;
    }

    const user = request.user;

    if (!user) {
      return true;
    }

    if (user.type !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
