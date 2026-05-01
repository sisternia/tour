const crypto = require("crypto");
const moment = require("moment");
const BookingInfo = require("../models/booking_infos.model");

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
        const { amount, bankCode, orderDescription, orderType, language, bookingData, userId } = req.body;

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let txnRef = moment(date).format('YYYYMMDDHHmmss');
        
        let tmnCode = process.env.VNP_TMNCODE;
        let secretKey = process.env.VNP_HASHSECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

        console.log("CreatePayment - bookingData:", bookingData ? "Present" : "Missing");
        console.log("CreatePayment - userId:", userId);

        // Save pending booking
        if (bookingData) {
            try {
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
                
                const newBooking = new BookingInfo({
                    booking_info_id: txnRef,
                    user_id: userId || null,
                    tour_id: bookingData.tourId || "unknown",
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
            } catch (saveError) {
                console.error("=== ERROR: Saving pending booking failed ===");
                console.error(saveError);
                // Throw error to stop flow if DB save fails
                return res.status(500).json({ success: false, message: "Lỗi lưu thông tin đặt tour: " + saveError.message });
            }
        } else {
            console.log("No bookingData provided, skipping DB save.");
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
        const booking = await BookingInfo.findOne({ booking_info_id: bookingId });
        const vnpay = await VnPay.findOne({ vnp_TxnRef: bookingId });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
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

        const newBooking = new BookingInfo({
            booking_info_id: txnRef,
            user_id: userId || null,
            tour_id: bookingData.tourId || "unknown",
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
