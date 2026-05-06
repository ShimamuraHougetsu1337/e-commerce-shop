import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService
    ) { }

    async sendOrderConfirmation(order: any, user: any) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: `Xác nhận đơn hàng #${order._id} - E-Commerce`,
                template: 'order-confirmation', // Path to the template
                context: {
                    userName: user.name || 'Quý khách',
                    orderId: order._id.toString(),
                    items: order.items,
                    totalAmount: order.totalAmount,
                    shippingAddress: order.shippingAddress,
                    paymentMethod: order.paymentMethod,
                    websiteUrl: this.configService.get<string>('WEBSITE_URL') || 'http://localhost:3000',
                },
            });
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
        }
    }
}
