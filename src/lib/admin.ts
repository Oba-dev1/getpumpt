// This file will contain functions to fetch data for the admin portal.
// For now, it will return static data.

export async function getDashboardStats() {
    return {
        totalMembers: 123,
        monthlyRevenue: 123456,
        newMembersThisMonth: 12,
        upcomingBookingsToday: 5,
    };
}
