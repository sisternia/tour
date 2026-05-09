const BookingInfo = require("../models/booking_infos.model");
const Tour = require("../models/tours.model");
const TourTime = require("../models/tour_times.model");
const UserInfo = require("../models/user_infors.model");
const TourGuide = require("../models/tour_guides.model");

exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        
        // 1. Total Revenue (from paid/confirmed bookings)
        const revenueResult = await BookingInfo.aggregate([
            { $match: { status: { $in: ['paid', 'confirmed'] } } },
            { $group: { _id: null, total: { $sum: "$total_price" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // 2. Total Customers (unique contact emails)
        const totalCustomers = await BookingInfo.distinct("contact_info.email");

        // 3. Total Tours
        const totalTours = await Tour.countDocuments();

        // 4. Ongoing Tours
        const ongoingToursCount = await TourTime.countDocuments({
            date_start: { $lte: now },
            date_end: { $gte: now }
        });

        // 5. Revenue Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const revenueTrend = await BookingInfo.aggregate([
            { 
                $match: { 
                    status: { $in: ['paid', 'confirmed'] },
                    createdAt: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    revenue: { $sum: "$total_price" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 6. Recent Bookings (Top 5)
        const recentBookings = await BookingInfo.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'tours',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'tour_info'
                }
            },
            { $unwind: { path: '$tour_info', preserveNullAndEmptyArrays: true } }
        ]);

        // 7. Booking Category Distribution (Adult vs Child vs Total)
        const categoryStats = await BookingInfo.aggregate([
            {
                $group: {
                    _id: null,
                    totalAdults: { $sum: "$adult_count" },
                    totalChildren: { $sum: "$child_count" }
                }
            }
        ]);

        // 8. Top Tour (Most bookings)
        const topTourResult = await BookingInfo.aggregate([
            { $group: { _id: "$tour_id", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'tours',
                    localField: '_id',
                    foreignField: 'tour_id',
                    as: 'tour_info'
                }
            },
            { $unwind: '$tour_info' }
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalRevenue,
                    totalCustomers: totalCustomers.length,
                    totalTours,
                    ongoingTours: ongoingToursCount
                },
                revenueTrend,
                recentBookings,
                categoryStats: categoryStats[0] || { totalAdults: 0, totalChildren: 0 },
                topTour: topTourResult[0] || null
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy số liệu thống kê" });
    }
};
