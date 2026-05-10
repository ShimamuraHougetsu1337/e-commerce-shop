import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { getActiveCouponsApi } from "@/utils/cart.api";
import CartClient from "./cart-client";

export async function generateMetadata() {
    const t = await getTranslations('CartPage');
    return {
        title: `${t('title')} | E-commerce`,
        description: t('yourCart')
    };
}

export default async function CartPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || (session?.user as any)?._id;
    
    let initialCoupons: any[] = [];
    if (userId) {
        try {
            const res = await getActiveCouponsApi(userId);
            if (res.data) initialCoupons = res.data;
        } catch (error) {
            console.error('Failed to fetch coupons server-side:', error);
        }
    } else {
        // Fetch public coupons
        try {
            const res = await getActiveCouponsApi();
            if (res.data) initialCoupons = res.data;
        } catch (error) {
            console.error('Failed to fetch public coupons server-side:', error);
        }
    }

    return (
        <CartClient 
            session={session} 
            initialCoupons={initialCoupons} 
        />
    );
}
