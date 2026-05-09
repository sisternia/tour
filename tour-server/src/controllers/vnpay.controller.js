const crypto = require("crypto");
const moment = require("moment");
const BookingInfo = require("../models/booking_infos.model");
const Tour = require("../models/tours.model");
const TourImg = require("../models/tour_imgs.model");
const TourTime = require("../models/tour_times.model");
const TourPrice = require("../models/tour_prices.model");
const TourGuide = require("../models/tour_guides.model");
const UserInfor = require("../models/user_infors.model");
const { notifyBookingStatusChange } = require("./bookings.controller");

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

exports.createPaymentUrl = async (req, res) => {
    try {
        const { amount, bankCode, orderDescription, orderType, language, bookingData, userId, bookingId } = req.body;

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let txnRef = bookingId || moment(date).format('YYYYMMDDHHmmss');
        
        let tmnCode = process.env.VNP_TMNCODE;
        let secretKey = process.env.VNP_HASHSECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

        console.log("CreatePayment - bookingData:", bookingData ? "Present" : "Missing");
        console.log("CreatePayment - userId:", userId);
        console.log("CreatePayment - txnRef:", txnRef);

        // Save pending booking ONLY IF it's a new booking (bookingId not provided)
        if (bookingData && !bookingId) {
            try {
                const tourId = bookingData.tourId || "unknown";
                const requestedSeats = (parseInt(bookingData.adultCount) || 0) + (parseInt(bookingData.childCount) || 0);

                // Check capacity
                const [tourPrice, existingBookings] = await Promise.all([
                    TourPrice.findOne({ tour_id: tourId }),
                    BookingInfo.find({ tour_id: tourId, status: { $ne: 'cancelled' } })
                ]);

                const currentBooked = existingBookings.reduce((sum, b) => sum + (b.adult_count || 0) + (b.child_count || 0), 0);
                const capacity = tourPrice ? tourPrice.tour_capacity : 0;

                if (currentBooked + requestedSeats > capacity) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Tour đã đạt giới hạn số lượng người tham gia. Hiện còn ${Math.max(0, capacity - currentBooked)} chỗ trống.` 
                    });
                }

                let passengers = [];
                if (bookingData.parsedAdults && Array.isArray(bookingData.parsedAdults)) {
                    bookingData.parsedAdults.forEach(p => {
                        passengers.push({ 
                            type: 'adult', 
                            name: p.name || "Khách người lớn", 
                            gender: p.gender || "Nam", 
                            dob: p.dob || "" 
                        });
                    });
                }
                if (bookingData.parsedChildren && Array.isArray(bookingData.parsedChildren)) {
                    bookingData.parsedChildren.forEach(p => {
                        passengers.push({ 
                            type: 'child', 
                            name: p.name || "Khách trẻ em", 
                            gender: p.gender || "Nam", 
                            dob: p.dob || "" 
                        });
                    });
                }

                const mongoose = require('mongoose');
                const tourTime = await TourTime.findOne({ tour_id: tourId });
                
                const newBooking = new BookingInfo({
                    booking_info_id: txnRef,
                    user_id: userId || null,
                    tour_id: bookingData.tourId || "unknown",
                    date_start: tourTime ? tourTime.date_start : null,
                    date_end: tourTime ? tourTime.date_end : null,
                    contact_info: {
                        full_name: bookingData.name || "Người đặt",
                        email: bookingData.email || "N/A",
                        phone: bookingData.phone || "N/A",
                        note: bookingData.note || ""
                    },
                    passengers: passengers,
                    adult_count: parseInt(bookingData.adultCount) || 1,
                    child_count: parseInt(bookingData.childCount) || 0,
                    total_price: parseInt(bookingData.totalPrice) || 0,
                    status: 'pending'
                });
                
                await newBooking.save();
                console.log("=== SUCCESS: Saved new pending booking ===");
                console.log("Booking ID:", txnRef);
                
                // Trigger email notification for new pending booking
                notifyBookingStatusChange(txnRef);
            } catch (saveError) {
                console.error("=== ERROR: Saving pending booking failed ===");
                console.error(saveError);
                return res.status(500).json({ success: false, message: "Lỗi lưu thông tin đặt tour: " + saveError.message });
            }
        } else if (bookingId) {
            console.log("Using existing bookingId:", bookingId);
            // Optionally update existing booking status to pending if it was cancelled
            await BookingInfo.findOneAndUpdate({ booking_info_id: bookingId }, { status: 'pending' });
        } else {
            console.log("No bookingData or bookingId provided.");
        }

        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress ||
            '127.0.0.1';

        if (ipAddr === '::1') {
            ipAddr = '127.0.0.1';
        }

        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = language || 'vn';
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = txnRef; 
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang'; // Simplify order info to avoid encoding issues
        vnp_Params['vnp_OrderType'] = '250000'; // Standard VNPAY code for Travel/Tourism
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        console.log("Raw Params:", vnp_Params);
        vnp_Params = sortObject(vnp_Params);

        let signData = "";
        const keys = Object.keys(vnp_Params);
        for(let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const val = vnp_Params[key];
            signData += key + "=" + val;
            if (i < keys.length - 1) {
                signData += "&";
            }
        }

        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        
        let finalUrl = vnpUrl + "?" + signData + "&vnp_SecureHash=" + signed;

        console.log("=== VNPAY DEBUG ===");
        console.log("TMNCODE:", tmnCode);
        console.log("SignData:", signData);
        console.log("FinalURL:", finalUrl);
        console.log("====================");

        res.status(200).json({ success: true, paymentUrl: finalUrl });
    } catch (error) {
        console.error("VNPAY Error:", error);
        res.status(500).json({ success: false, message: "Lỗi tạo URL thanh toán" });
    }
};

const VnPay = require("../models/vnpays.model");

exports.vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.VNP_HASHSECRET;
    let signData = "";
    const keys = Object.keys(vnp_Params);
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = vnp_Params[key];
        signData += key + "=" + val;
        if (i < keys.length - 1) {
            signData += "&";
        }
    }

    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];

        // Save VNPAY transaction log
        try {
            await VnPay.findOneAndUpdate(
                { vnp_TxnRef: orderId },
                {
                    vnp_Amount: vnp_Params['vnp_Amount'] / 100,
                    vnp_BankCode: vnp_Params['vnp_BankCode'],
                    vnp_BankTranNo: vnp_Params['vnp_BankTranNo'],
                    vnp_CardType: vnp_Params['vnp_CardType'],
                    vnp_OrderInfo: vnp_Params['vnp_OrderInfo'],
                    vnp_PayDate: vnp_Params['vnp_PayDate'],
                    vnp_ResponseCode: rspCode,
                    vnp_TmnCode: vnp_Params['vnp_TmnCode'],
                    vnp_TransactionNo: vnp_Params['vnp_TransactionNo'],
                    vnp_TransactionStatus: vnp_Params['vnp_TransactionStatus']
                },
                { upsert: true }
            );

            // Update Booking Status
            if (rspCode === '00') {
                await BookingInfo.findOneAndUpdate(
                    { booking_info_id: orderId },
                    { status: 'paid' }
                );
                // Trigger email notification for successful payment
                notifyBookingStatusChange(orderId);
            }
        } catch (err) {
            console.error("DB Update Error in VNPAY Return:", err);
        }

        // Redirect to frontend StatusScreen instead of JSON
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        res.redirect(`${frontendUrl}/tour/StatusScreen?bookingId=${orderId}`);
    } else {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        res.redirect(`${frontendUrl}/tour/StatusScreen?bookingId=fail`);
    }
};

exports.vnpayIpn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNP_HASHSECRET;
    let signData = "";
    const keys = Object.keys(vnp_Params);
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = vnp_Params[key];
        signData += key + "=" + val;
        if (i < keys.length - 1) {
            signData += "&";
        }
    }

    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
        
        try {
            await VnPay.findOneAndUpdate(
                { vnp_TxnRef: orderId },
                {
                    vnp_Amount: vnp_Params['vnp_Amount'] / 100,
                    vnp_BankCode: vnp_Params['vnp_BankCode'],
                    vnp_BankTranNo: vnp_Params['vnp_BankTranNo'],
                    vnp_CardType: vnp_Params['vnp_CardType'],
                    vnp_OrderInfo: vnp_Params['vnp_OrderInfo'],
                    vnp_PayDate: vnp_Params['vnp_PayDate'],
                    vnp_ResponseCode: rspCode,
                    vnp_TmnCode: vnp_Params['vnp_TmnCode'],
                    vnp_TransactionNo: vnp_Params['vnp_TransactionNo'],
                    vnp_TransactionStatus: vnp_Params['vnp_TransactionStatus']
                },
                { upsert: true }
            );

            if (rspCode === '00') {
                await BookingInfo.findOneAndUpdate(
                    { booking_info_id: orderId },
                    { status: 'paid' }
                );
                // Trigger email notification for successful payment
                notifyBookingStatusChange(orderId);
            }
        } catch (err) {
            console.error("DB Update Error in VNPAY IPN:", err);
        }

        res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await BookingInfo.findOne({ booking_info_id: bookingId }).lean();
        const vnpay = await VnPay.findOne({ vnp_TxnRef: bookingId });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        // Fetch Tour Details
        if (booking.tour_id) {
            const tour = await Tour.findOne({ tour_id: booking.tour_id }).lean();
            if (tour) {
                const tourImg = await TourImg.findOne({ tour_id: booking.tour_id, img_is_cover: true }).lean();
                const tourTime = await TourTime.findOne({ tour_id: booking.tour_id }).lean();
                const tourPrice = await TourPrice.findOne({ tour_id: booking.tour_id }).lean();
                
                // Fetch Guides
                const tourGuides = await TourGuide.find({ tour_id: booking.tour_id }).lean();
                const guides = await Promise.all(tourGuides.map(async (tg) => {
                    const info = await UserInfor.findOne({ user_id: tg.user_id }).lean();
                    return info ? {
                        user_id: tg.user_id,
                        full_name: info.full_name,
                        avatar: info.avatar,
                        email: info.email,
                        phone: info.phone
                    } : null;
                }));

                booking.tour_id = {
                    ...tour,
                    tour_image: tourImg ? tourImg.tour_img_url : null,
                    time: tourTime || null,
                    price: tourPrice || null,
                    guides: guides.filter(g => g !== null)
                };
            }
        }

        res.status(200).json({
            success: true,
            data: {
                booking,
                vnpay: vnpay || null
            }
        });
    } catch (error) {
        console.error("Get Payment Status Error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy thông tin thanh toán" });
    }
};

exports.createOfflineBooking = async (req, res) => {
    try {
        const { bookingData, userId } = req.body;
        if (!bookingData) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin đặt tour" });
        }

        let date = new Date();
        let txnRef = moment(date).format('YYYYMMDDHHmmss');

        let passengers = [];
        if (bookingData.parsedAdults && Array.isArray(bookingData.parsedAdults)) {
            bookingData.parsedAdults.forEach(p => {
                passengers.push({ 
                    type: 'adult', 
                    name: p.name || "Khách người lớn", 
                    gender: p.gender || "Nam", 
                    dob: p.dob || "" 
                });
            });
        }
        if (bookingData.parsedChildren && Array.isArray(bookingData.parsedChildren)) {
            bookingData.parsedChildren.forEach(p => {
                passengers.push({ 
                    type: 'child', 
                    name: p.name || "Khách trẻ em", 
                    gender: p.gender || "Nam", 
                    dob: p.dob || "" 
                });
            });
        }

        const tourTime = await TourTime.findOne({ tour_id: bookingData.tourId });

        const newBooking = new BookingInfo({
            booking_info_id: txnRef,
            user_id: userId || null,
            tour_id: bookingData.tourId || "unknown",
            date_start: tourTime ? tourTime.date_start : null,
            date_end: tourTime ? tourTime.date_end : null,
            contact_info: {
                full_name: bookingData.name || "Người đặt",
                email: bookingData.email || "N/A",
                phone: bookingData.phone || "N/A",
                note: bookingData.note || ""
            },
            passengers: passengers,
            adult_count: parseInt(bookingData.adultCount) || 1,
            child_count: parseInt(bookingData.childCount) || 0,
            total_price: parseInt(bookingData.totalPrice) || 0,
            status: 'pending'
        });
        
        await newBooking.save();
        
        res.status(200).json({ 
            success: true, 
            message: "Đặt tour thành công (Thanh toán sau)",
            bookingId: txnRef 
        });
    } catch (error) {
        console.error("Offline Booking Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
