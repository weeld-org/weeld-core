import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../db/database.module';
import { tenants, userTenants, users } from '../db/schema';
import type { LoginDto } from './dto/login.dto';
import { scryptSync } from 'node:crypto';

function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hex] = stored.split(':');
  if (!salt || !hex) return false;
  const derived = scryptSync(plain, salt, 64);
  return derived.toString('hex') === hex;
}

export type AuthPayload = {
  sub: string;
  email: string;
  saasAdmin: boolean;
  tenantId?: string;
  companyNumber?: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginDto): Promise<{ access_token: string }> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.companyNumber, input.companyNumber));

    if (!tenant) throw new UnauthorizedException('Invalid company number');

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, input.username));

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!verifyPassword(input.password, user.passwordHash))
      throw new UnauthorizedException('Invalid credentials');

    if (!user.saasAdmin) {
      const [membership] = await this.db
        .select({ uid: userTenants.userId })
        .from(userTenants)
        .where(eq(userTenants.userId, user.id));
      if (!membership) throw new UnauthorizedException('User not in tenant');
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      saasAdmin: user.saasAdmin,
      tenantId: tenant.id,
      companyNumber: tenant.companyNumber,
    };

    const token: string = await this.jwt.signAsync(payload);
    return { access_token: token };
  }
}
