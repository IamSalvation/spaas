import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class IdentityController {
    constructor(private readonly identityService: IdentityService) { }

    @Post('register')
    @Throttle({ default: { limit: 3, ttl: 60000 } })  // 3 signups per minute per IP
    async register(@Body() body: any) {
        if (!body.companyName || !body.email || !body.password) {
            throw new UnauthorizedException('Missing required fields');
        }
        return this.identityService.registerCompany(body.companyName, body.email, body.password);
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } })  // 5 login attempts per minute per IP
    async login(@Body() body: any) {
        if (!body.email || !body.password || !body.identifier) {
            throw new UnauthorizedException('Missing email, password, or company workspace');
        }
        return this.identityService.login(body.email, body.password, body.identifier);
    }

    @Post('users')
    @UseGuards(JwtAuthGuard)
    async createUser(@Body() body: any) {
        if (!body.email || !body.password || !body.role) {
            throw new UnauthorizedException('Missing required fields');
        }
        return this.identityService.createUser(body.email, body.password, body.role);
    }
}