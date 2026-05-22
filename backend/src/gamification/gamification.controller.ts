import { Controller, Get, Post, Req } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('status')
  @ResponseMessage('Lấy trạng thái vòng quay thành công')
  async getStatus(@Req() req: any) {
    const canSpin = await this.gamificationService.checkCanSpin(req.user._id);
    return { canSpin };
  }

  @Post('spin')
  @ResponseMessage('Thực hiện vòng quay thành công')
  async spin(@Req() req: any) {
    return this.gamificationService.performSpin(req.user._id);
  }

  @Get('history')
  @ResponseMessage('Lấy lịch sử quay thành công')
  async getHistory(@Req() req: any) {
    return this.gamificationService.getHistory(req.user._id);
  }
}
