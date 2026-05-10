export const fetchSpinStatus = async (accessToken: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/gamification/status`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return await res.json();
    } catch (error) {
        console.error('Error fetching spin status:', error);
        return null;
    }
};

export const performSpinApi = async (accessToken: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/gamification/spin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return await res.json();
    } catch (error) {
        console.error('Error performing spin:', error);
        return null;
    }
};

export const fetchSpinHistory = async (accessToken: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/gamification/history`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return await res.json();
    } catch (error) {
        console.error('Error fetching spin history:', error);
        return null;
    }
};
