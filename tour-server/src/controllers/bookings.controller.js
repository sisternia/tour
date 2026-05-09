const BookingInfo = require("../models/booking_infos.model");
const Tour = require("../models/tours.model");
const TourTime = require("../models/tour_times.model");
const UserInfo = require("../models/user_infors.model");
const TourGuide = require("../models/tour_guides.model");
const { sendBookingEmail } = require("../services/email");

const notifyBookingStatusChange = async (bookingId) => {
    try {
        const booking = await BookingInfo.findOne({ booking_info_id: bookingId });
        if (!booking) return;

        const [tour, tourTime, tourGuides] = await Promise.all([
            Tour.findOne({ tour_id: booking.tour_id }),
            TourTime.findOne({ tour_id: booking.tour_id }),
            TourGuide.find({ tour_id: booking.tour_id })
        ]);

        const guideIds = tourGuides.map(tg => tg.user_id);
        const guides = await UserInfo.find({ user_id: { $in: guideIds } });

        const emailData = {
            customerName: booking.contact_info.full_name,
            bookingId: booking.booking_info_id,
            bookingTime: new Date(booking.createdAt).toLocaleString('vi-VN'),
            tourName: tour ? tour.tour_name : 'N/A',
            dateStart: booking.date_start ? new Date(booking.date_start).toLocaleDateString('vi-VN') : 'N/A',
            dateEnd: booking.date_end ? new Date(booking.date_end).toLocaleDateString('vi-VN') : 'N/A',
            adultCount: booking.adult_count,
            childCount: booking.child_count,
            passengers: booking.passengers,
            guides: guides.map(g => ({
                full_name: g.full_name,
                phone: g.phone || 'N/A',
                email: g.email || 'N/A'
            })),
            totalPrice: booking.total_price,
            status: booking.status
        };

        await sendBookingEmail(booking.contact_info.email, emailData);
        console.log(`Email notification sent for booking ${bookingId}`);
    } catch (error) {
        console.error(`Error sending booking notification for ${bookingId}:`, error);
    }
};

exports.notifyBookingStatusChange = notifyBookingStatusChange;

exports.getBookingsByTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { date_start, date_end } = req.query;
        
        let query = { 
            tour_id: tourId,
            status: { $in: ['paid', 'pending', 'confirmed'] } 
        };

        if (date_start && date_end && date_start !== 'undefined' && date_end !== 'undefined' && date_start !== 'null' && date_end !== 'null') {
            const reqStart = new Date(date_start);
            const reqEnd = new Date(date_end);
            
            const tourTime = await TourTime.findOne({ tour_id: tourId });
            const isCurrent = tourTime && 
                             reqStart.getTime() === new Date(tourTime.date_start).getTime() && 
                             reqEnd.getTime() === new Date(tourTime.date_end).getTime();

            if (isCurrent) {
                query.$or = [
                    { date_start: reqStart, date_end: reqEnd },
                    { date_start: null, date_end: null }
                ];
            } else {
                query.date_start = reqStart;
                query.date_end = reqEnd;
            }
        } else {
            query.date_start = null;
            query.date_end = null;
        }

        const bookings = await BookingInfo.find(query).sort({ createdAt: -1 });

        // Calculate total people and group by booking
        let totalPeople = 0;
        let bookingGroups = [];
        
        bookings.forEach(booking => {
            const bookingTotal = (booking.adult_count + booking.child_count);
            totalPeople += bookingTotal;
            
            bookingGroups.push({
                id: booking.booking_info_id,
                contactName: booking.contact_info.full_name,
                contactEmail: booking.contact_info.email,
                contactPhone: booking.contact_info.phone,
                note: booking.contact_info.note,
                status: booking.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
                adultCount: booking.adult_count,
                childCount: booking.child_count,
                totalPeople: bookingTotal,
                passengers: booking.passengers.map(p => ({
                    name: p.name,
                    gender: p.gender,
                    type: p.type === 'adult' ? 'Người lớn' : 'Trẻ em',
                    dob: p.dob
                })),
                createdAt: booking.createdAt
            });
        });

        res.status(200).json({
            success: true,
            totalPeople,
            data: bookingGroups
        });
    } catch (error) {
        console.error("Get Bookings By Tour Error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách khách hàng" });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await BookingInfo.findOne({ booking_info_id: bookingId });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin đặt tour" });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: "Tour này đã được hủy trước đó" });
        }

        // Optional: Only allow cancelling pending bookings
        // if (booking.status !== 'pending') {
        //     return res.status(400).json({ success: false, message: "Chỉ có thể hủy tour đang chờ thanh toán" });
        // }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Hủy tour thành công",
            data: booking
        });
    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi hủy tour" });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingInfo.aggregate([
            {
                $lookup: {
                    from: 'tours',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'tour_details'
                }
            },
            {
                $unwind: {
                    path: '$tour_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'tour_times',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'time_details'
                }
            },
            {
                $unwind: {
                    path: '$time_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'tour_prices',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'price_details'
                }
            },
            {
                $unwind: {
                    path: '$price_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'tour_guides',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'guide_assignments'
                }
            },
            {
                $lookup: {
                    from: 'user_infos',
                    localField: 'guide_assignments.user_id',
                    foreignField: 'user_id',
                    as: 'guide_infos'
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error("Get All Bookings Error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách đơn hàng" });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const bookings = await BookingInfo.aggregate([
            {
                $match: { booking_info_id: bookingId }
            },
            {
                $lookup: {
                    from: 'tours',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'tour_details'
                }
            },
            {
                $unwind: {
                    path: '$tour_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'tour_times',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'time_details'
                }
            },
            {
                $unwind: {
                    path: '$time_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'tour_prices',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'price_details'
                }
            },
            {
                $unwind: {
                    path: '$price_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'tour_guides',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'guide_assignments'
                }
            },
            {
                $lookup: {
                    from: 'user_infos',
                    localField: 'guide_assignments.user_id',
                    foreignField: 'user_id',
                    as: 'guide_infos'
                }
            },
            {
                $lookup: {
                    from: 'tour_imgs',
                    localField: 'tour_id',
                    foreignField: 'tour_id',
                    as: 'tour_images'
                }
            }
        ]);

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        const bookingData = bookings[0];
        const tourId = bookingData.tour_id;

        // Calculate current booked seats for this tour
        const allBookings = await BookingInfo.find({ tour_id: tourId, status: { $ne: 'cancelled' } });
        const currentBooked = allBookings.reduce((sum, b) => sum + (b.adult_count || 0) + (b.child_count || 0), 0);
        const capacity = bookingData.price_details ? bookingData.price_details.tour_capacity : 0;
        
        bookingData.available_slots = Math.max(0, capacity - currentBooked);

        res.status(200).json({
            success: true,
            data: bookingData
        });
    } catch (error) {
        console.error("Get Booking By Id Error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết đơn hàng" });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        const booking = await BookingInfo.findOneAndUpdate(
            { booking_info_id: bookingId },
            { status: status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công",
            data: booking
        });

        // Trigger email notification
        notifyBookingStatusChange(bookingId);
    } catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({ success: false, message: "Lỗi cập nhật trạng thái" });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await BookingInfo.findOneAndDelete({ booking_info_id: bookingId });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        res.status(200).json({
            success: true,
            message: "Xóa đơn hàng thành công"
        });
    } catch (error) {
        console.error("Delete Booking Error:", error);
        res.status(500).json({ success: false, message: "Lỗi xóa đơn hàng" });
    }
};





