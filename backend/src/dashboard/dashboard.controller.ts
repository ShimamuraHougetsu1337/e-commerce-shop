import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResponseMessage } from '@/decorator/customize';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ResponseMessage('Lấy thống kê dashboard thành công')
    async getStats() {
        return await this.dashboardService.getStats();
    }
}
