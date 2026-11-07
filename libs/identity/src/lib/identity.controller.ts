import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class IdentityController {
    constructor(private readonly identityService: IdentityService) { }

    @Post('register')
    async register(@Body() body: any) {
        if (!body.companyName || !body.email || !body.password) {
            throw new UnauthorizedException('Missing required fields');
        }
        return this.identityService.registerCompany(body.companyName, body.email, body.password);
    }

    @Post('login')
    async login(@Body() body: any) {
        if (!body.tenantId) throw new UnauthorizedException('Tenant ID required for login');
        return this.identityService.login(body.email, body.password, body.tenantId);
    }

    @Post('users')
    @UseGuards(JwtAuthGuard) // Only logged-in admins can create users
    async createUser(@Body() body: any) {
        if (!body.email || !body.password || !body.role) {
            throw new UnauthorizedException('Missing required fields');
        }
        return this.identityService.createUser(body.email, body.password, body.role);
    }
}