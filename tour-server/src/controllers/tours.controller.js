const Tour = require('../models/tours.model');
const TourImg = require('../models/tour_imgs.model');
const TourTime = require('../models/tour_times.model');
const TourSche = require('../models/tour_sches.model');
const TourScheImg = require('../models/tour_sche_imgs.model');
const TourPrice = require('../models/tour_prices.model');
const TourGuide = require('../models/tour_guides.model');
const UserInfo = require('../models/user_infors.model');
const GuideLanguage = require('../models/guide_language.model');
const GuideField = require('../models/guide_fields.model');
const GuideUserLanguage = require('../models/guide_user_languages.model');
const GuideUserField = require('../models/guide_user_fields.model');
const BookingInfo = require('../models/booking_infos.model');
const Review = require('../models/reviews.model');
const mongoose = require('mongoose');
const { uploadImage, deleteFolder, deleteImage } = require('../services/cloudinary.service');

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Kiểm tra tour tồn tại
    const tour = await Tour.findOne({ tour_id: id });
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });
    }

    // 2. Xóa folder hình ảnh trên Cloudinary (tour/tour_id/...)
    const folderPath = `tour/${id}`;
    try {
      await deleteFolder(folderPath);
    } catch (err) {
      console.error('Lỗi khi xóa folder trên Cloudinary:', err);
    }

    // 3. Xóa tất cả dữ liệu liên quan trong Database
    await Promise.all([
      Tour.deleteOne({ tour_id: id }),
      TourPrice.deleteOne({ tour_id: id }),
      TourTime.deleteOne({ tour_id: id }),
      TourImg.deleteMany({ tour_id: id }),
      TourSche.deleteMany({ tour_id: id }),
      TourScheImg.deleteMany({ tour_id: id }),
      TourGuide.deleteMany({ tour_id: id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Xóa tour thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa tour'
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tour_name, tour_desc, tour_type, tour_add,
      tour_longit, tour_latit, tour_status,
      tour_duration, date_start, date_end,
      tour_capacity, price_child, price_adult,
      schedules,
      guides
    } = req.body;

    const existingTour = await Tour.findOne({ tour_id: id });
    if (!existingTour) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });
    }

    // Check if dates have changed
    const existingTime = await TourTime.findOne({ tour_id: id });
    const isDateChanged = existingTime && (
      new Date(existingTime.date_start).getTime() !== new Date(date_start).getTime() ||
      new Date(existingTime.date_end).getTime() !== new Date(date_end).getTime()
    );

    let targetId = id;
    let tour;

    if (isDateChanged) {
      // Create a brand new tour ID if dates changed
      targetId = new mongoose.Types.ObjectId().toString();
      tour = new Tour({
        tour_id: targetId,
        tour_name: tour_name || existingTour.tour_name,
        tour_desc: tour_desc || existingTour.tour_desc,
        tour_type: tour_type || existingTour.tour_type,
        tour_add: tour_add || existingTour.tour_add,
        tour_longit: tour_longit || existingTour.tour_longit,
        tour_latit: tour_latit || existingTour.tour_latit,
        tour_status: tour_status || existingTour.tour_status
      });
      await tour.save();

      // Create new Time and Price records
      await new TourTime({
        tour_times_id: new mongoose.Types.ObjectId().toString(),
        tour_duration: parseInt(tour_duration),
        date_start: new Date(date_start),
        date_end: new Date(date_end),
        tour_id: targetId
      }).save();

      await new TourPrice({
        tour_price_id: new mongoose.Types.ObjectId().toString(),
        tour_capacity: parseInt(tour_capacity),
        price_child: parseFloat(price_child),
        price_adult: parseFloat(price_adult),
        tour_id: targetId
      }).save();

    } else {
      // Normal update for existing tour
      tour = existingTour;
      tour.tour_name = tour_name || tour.tour_name;
      tour.tour_desc = tour_desc || tour.tour_desc;
      tour.tour_type = tour_type || tour.tour_type;
      tour.tour_add = tour_add || tour.tour_add;
      tour.tour_longit = tour_longit || tour.tour_longit;
      tour.tour_latit = tour_latit || tour.tour_latit;
      tour.tour_status = tour_status || tour.tour_status;
      await tour.save();

      await TourTime.findOneAndUpdate({ tour_id: targetId }, {
        tour_duration: parseInt(tour_duration),
        date_start: new Date(date_start),
        date_end: new Date(date_end)
      });

      await TourPrice.findOneAndUpdate({ tour_id: targetId }, {
        tour_capacity: parseInt(tour_capacity),
        price_child: parseFloat(price_child),
        price_adult: parseFloat(price_adult)
      });

      // Delete old guides ONLY if we are updating the same tour
      await TourGuide.deleteMany({ tour_id: targetId });
    }

    // Common Logic for Guides (New or Updated)
    const parsedGuides = typeof guides === 'string' ? JSON.parse(guides) : guides;
    if (parsedGuides && Array.isArray(parsedGuides)) {
      for (const userId of parsedGuides) {
        await new TourGuide({
          tour_guide_id: new mongoose.Types.ObjectId().toString(),
          tour_id: targetId,
          user_id: userId
        }).save();
      }
    }

    const tourImgsFiles = req.files ? req.files.filter(f => f.fieldname === 'tour_imgs') : [];
    const existingTourImages = typeof req.body.existing_tour_images === 'string' ? JSON.parse(req.body.existing_tour_images) : (req.body.existing_tour_images || []);
    
    if (tourImgsFiles.length > 0 || existingTourImages.length > 0) {
      if (!isDateChanged) {
        const oldTourImgs = await TourImg.find({ tour_id: targetId });
        const imgsToDelete = oldTourImgs.filter(old => !existingTourImages.includes(old.tour_img_url));
        
        for (const img of imgsToDelete) {
          try {
            const urlObj = new URL(img.tour_img_url);
            const publicIdMatch = urlObj.pathname.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
            if (publicIdMatch) {
              await deleteImage(decodeURIComponent(publicIdMatch[1]));
            }
          } catch (err) {
            console.error('Lỗi khi xóa ảnh Cloudinary:', err);
          }
        }
        await TourImg.deleteMany({ tour_id: targetId });
      }

      const coverIdx = parseInt(req.body.cover_index) || 0;
      let currentIdx = 0;

      for (const imgUrl of existingTourImages) {
        await new TourImg({
          tour_img_id: new mongoose.Types.ObjectId().toString(),
          tour_img_url: imgUrl,
          img_is_cover: currentIdx === coverIdx,
          tour_id: targetId
        }).save();
        currentIdx++;
      }

      for (const file of tourImgsFiles) {
        const uploadResult = await uploadImage(file.buffer, `tour/${targetId}/tour_imgs`);
        await new TourImg({
          tour_img_id: new mongoose.Types.ObjectId().toString(),
          tour_img_url: uploadResult.secure_url,
          img_is_cover: currentIdx === coverIdx,
          tour_id: targetId
        }).save();
        currentIdx++;
      }
    }

    const parsedSchedules = typeof schedules === 'string' ? JSON.parse(schedules) : schedules;
    if (parsedSchedules && Array.isArray(parsedSchedules)) {
      if (!isDateChanged) {
        const oldSches = await TourSche.find({ tour_id: targetId });
        const oldScheIds = oldSches.map(s => s.tour_sche_id);
        await TourSche.deleteMany({ tour_id: targetId });
        await TourScheImg.deleteMany({ tour_sche_id: { $in: oldScheIds } });
      }

      const tourTime = await TourTime.findOne({ tour_id: targetId });

      for (let i = 0; i < parsedSchedules.length; i++) {
        const sche = parsedSchedules[i];
        const tour_sche_id = new mongoose.Types.ObjectId().toString();
        const dayNum = parseInt(sche.day_number) || (i + 1);

        await new TourSche({
          tour_sche_id,
          tour_sche_name: sche.tour_sche_name,
          tour_sche_desc: sche.tour_sche_desc || '',
          time_sche_start: sche.time_sche_start,
          time_sche_end: sche.time_sche_end || '',
          tour_sche_add: sche.tour_sche_add || '',
          tour_sche_longit: sche.tour_sche_longit || null,
          tour_sche_latit: sche.tour_sche_latit || null,
          day_number: dayNum,
          tour_times_id: tourTime.tour_times_id,
          tour_id: targetId
        }).save();

        const fieldName = `sche_imgs_${i}`;
        const scheImgFiles = req.files ? req.files.filter(f => f.fieldname === fieldName) : [];
        
        if (scheImgFiles.length > 0 || (sche.existing_images && sche.existing_images.length > 0)) {
          const scheCoverIdx = parseInt(sche.cover_index) || 0;
          let currentScheIdx = 0;

          if (sche.existing_images && Array.isArray(sche.existing_images)) {
            for (const oldImgUrl of sche.existing_images) {
              await new TourScheImg({
                tour_sche_imgs_id: new mongoose.Types.ObjectId().toString(),
                tour_sche_img_url: oldImgUrl,
                img_is_cover: currentScheIdx === scheCoverIdx,
                tour_sche_id,
                tour_id: targetId
              }).save();
              currentScheIdx++;
            }
          }

          for (let j = 0; j < scheImgFiles.length; j++) {
            const file = scheImgFiles[j];
            const uploadResult = await uploadImage(file.buffer, `tour/${targetId}/tour_sche_imgs/Ngay ${dayNum}`);
            await new TourScheImg({
              tour_sche_imgs_id: new mongoose.Types.ObjectId().toString(),
              tour_sche_img_url: uploadResult.secure_url,
              img_is_cover: currentScheIdx === scheCoverIdx,
              tour_sche_id,
              tour_id: targetId
            }).save();
            currentScheIdx++;
          }
        }
      }
    }

    res.status(200).json({ success: true, message: isDateChanged ? 'Đã tạo tour mới với ngày khởi hành mới' : 'Cập nhật tour thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi cập nhật tour' });
  }
};

exports.get_tour_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findOne({ tour_id: id });
    if (!tour) return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });

    const [price, time, images, tourGuides, schedules, reviews] = await Promise.all([
      TourPrice.findOne({ tour_id: id }),
      TourTime.findOne({ tour_id: id }),
      TourImg.find({ tour_id: id }),
      TourGuide.find({ tour_id: id }),
      TourSche.find({ tour_id: id }).sort({ day_number: 1, time_sche_start: 1 }),
      Review.find({ tour_id: id })
    ]);

    const guideIds = tourGuides.map(tg => tg.user_id);
    const baseGuides = await UserInfo.find({ user_id: { $in: guideIds } });

    const guides = await Promise.all(baseGuides.map(async (guide) => {
      const userLangs = await GuideUserLanguage.find({ user_id: guide.user_id.toString() });
      const languages = await GuideLanguage.find({ guide_lan_id: { $in: userLangs.map(ul => ul.guide_lan_id) } });
      const userFields = await GuideUserField.find({ user_id: guide.user_id.toString() });
      const fields = await GuideField.find({ guide_fie_id: { $in: userFields.map(uf => uf.guide_fie_id) } });

      return {
        ...guide._doc,
        languages: languages.map(l => l.guide_lan_name),
        fields: fields.map(f => f.guide_fie_name)
      };
    }));

    const detailedSchedules = await Promise.all(schedules.map(async (sche) => {
      const scheImgs = await TourScheImg.find({ tour_sche_id: sche.tour_sche_id });
      return { ...sche._doc, images: scheImgs };
    }));

    const bookings = await BookingInfo.find({ tour_id: id, status: { $ne: 'cancelled' } });
    const current_passengers = bookings.reduce((sum, b) => sum + (b.adult_count || 0) + (b.child_count || 0), 0);
    const tour_capacity = price ? price.tour_capacity : 0;
    const available_slots = Math.max(0, tour_capacity - current_passengers);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...tour._doc,
        price: price || {},
        time: time || {},
        images: images || [],
        guides: guides || [],
        schedules: detailedSchedules || [],
        current_passengers,
        available_slots,
        averageRating,
        totalReviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy thông tin chi tiết tour' });
  }
};

exports.view_tour = async (req, res) => {
  try {
    const { guide_id } = req.query;
    let query = { is_custom: { $ne: true } };

    if (guide_id) {
      const tourGuides = await TourGuide.find({ user_id: guide_id });
      const tourIds = tourGuides.map(tg => tg.tour_id);
      query.tour_id = { $in: tourIds };
    }

    const tours = await Tour.find(query).sort({ createdAt: -1 });
    const detailedTours = [];

    for (const tour of tours) {
      const [price, currentTime, coverImg, tourGuides, reviews] = await Promise.all([
        TourPrice.findOne({ tour_id: tour.tour_id }),
        TourTime.findOne({ tour_id: tour.tour_id }),
        TourImg.findOne({ tour_id: tour.tour_id, img_is_cover: true }),
        TourGuide.find({ tour_id: tour.tour_id }),
        Review.find({ tour_id: tour.tour_id })
      ]);

      const guideIds = tourGuides.map(tg => tg.user_id);
      const guides = await UserInfo.find({ user_id: { $in: guideIds } });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

      const bookingsWithDates = await BookingInfo.aggregate([
        { $match: { tour_id: tour.tour_id, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { 
              date_start: "$date_start", 
              date_end: "$date_end" 
            },
            passengers: { $sum: { $add: ["$adult_count", "$child_count"] } }
          }
        }
      ]);

      const instances = [];

      for (const instance of bookingsWithDates) {
        const ds = instance._id.date_start || (currentTime ? currentTime.date_start : null);
        const de = instance._id.date_end || (currentTime ? currentTime.date_end : null);

        instances.push({
          ...tour._doc,
          instance_id: `${tour.tour_id}_${ds ? new Date(ds).getTime() : 'legacy'}`,
          price: price || {},
          time: {
            ...currentTime ? currentTime._doc : {},
            date_start: ds,
            date_end: de
          },
          guides: guides || [],
          cover_img: coverImg ? coverImg.tour_img_url : null,
          current_passengers: instance.passengers,
          available_slots: price ? Math.max(0, price.tour_capacity - instance.passengers) : 0,
          averageRating,
          totalReviews
        });
      }

      if (currentTime) {
        const currentExists = instances.some(inst => 
          new Date(inst.time.date_start).getTime() === currentTime.date_start.getTime() &&
          new Date(inst.time.date_end).getTime() === currentTime.date_end.getTime()
        );

        if (!currentExists) {
          instances.push({
            ...tour._doc,
            instance_id: `${tour.tour_id}_current`,
            price: price || {},
            time: currentTime || {},
            guides: guides || [],
            cover_img: coverImg ? coverImg.tour_img_url : null,
            current_passengers: 0,
            available_slots: price ? price.tour_capacity : 0,
            averageRating,
            totalReviews
          });
        }
      }
      detailedTours.push(...instances);
    }

    res.status(200).json({ success: true, data: detailedTours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi lấy danh sách tour' });
  }
};

exports.create_tour = async (req, res) => {
  try {
    const {
      tour_name, tour_desc, tour_type, tour_add,
      tour_longit, tour_latit, tour_status,
      tour_duration, date_start, date_end,
      tour_capacity, price_child, price_adult,
      schedules, guides
    } = req.body;

    const tour_id = new mongoose.Types.ObjectId().toString();

    const newTour = new Tour({
      tour_id, tour_name, tour_desc: tour_desc || '', tour_type,
      tour_add: tour_add || '', tour_longit: tour_longit || null,
      tour_latit: tour_latit || null, tour_status: tour_status || 'Bản nháp'
    });
    await newTour.save();

    const savedTourImgs = [];
    const coverIdx = parseInt(req.body.cover_index) || 0;
    if (req.files) {
      const tourImgsFiles = req.files.filter(f => f.fieldname === 'tour_imgs');
      for (let i = 0; i < tourImgsFiles.length; i++) {
        const uploadResult = await uploadImage(tourImgsFiles[i].buffer, `tour/${tour_id}/tour_imgs`);
        const tourImg = new TourImg({
          tour_img_id: new mongoose.Types.ObjectId().toString(),
          tour_img_url: uploadResult.secure_url,
          img_is_cover: i === coverIdx, tour_id
        });
        await tourImg.save();
        savedTourImgs.push(tourImg);
      }
    }

    const tour_times_id = new mongoose.Types.ObjectId().toString();
    const newTourTime = new TourTime({
      tour_times_id, tour_duration: parseInt(tour_duration),
      date_start: new Date(date_start), date_end: new Date(date_end), tour_id
    });
    await newTourTime.save();

    const newTourPrice = new TourPrice({
      tour_price_id: new mongoose.Types.ObjectId().toString(),
      tour_capacity: parseInt(tour_capacity),
      price_child: parseFloat(price_child),
      price_adult: parseFloat(price_adult), tour_id
    });
    await newTourPrice.save();

    const parsedSchedules = typeof schedules === 'string' ? JSON.parse(schedules) : schedules;
    if (parsedSchedules && Array.isArray(parsedSchedules)) {
      for (let i = 0; i < parsedSchedules.length; i++) {
        const sche = parsedSchedules[i];
        const tour_sche_id = new mongoose.Types.ObjectId().toString();
        const newSche = new TourSche({
          tour_sche_id, tour_sche_name: sche.tour_sche_name, tour_sche_desc: sche.tour_sche_desc || '',
          time_sche_start: sche.time_sche_start, time_sche_end: sche.time_sche_end || '',
          tour_sche_add: sche.tour_sche_add || '', tour_sche_longit: sche.tour_sche_longit || null,
          tour_sche_latit: sche.tour_sche_latit || null, day_number: sche.day_number || (i + 1),
          tour_times_id, tour_id
        });
        await newSche.save();
        
        const scheImgFiles = req.files ? req.files.filter(f => f.fieldname === `sche_imgs_${i}`) : [];
        for (let j = 0; j < scheImgFiles.length; j++) {
          const uploadResult = await uploadImage(scheImgFiles[j].buffer, `tour/${tour_id}/tour_sche_imgs/Ngay ${sche.day_number || (i + 1)}`);
          await new TourScheImg({
            tour_sche_imgs_id: new mongoose.Types.ObjectId().toString(),
            tour_sche_img_url: uploadResult.secure_url,
            img_is_cover: j === (parseInt(sche.cover_index) || 0),
            tour_sche_id, tour_id
          }).save();
        }
      }
    }

    const parsedGuides = typeof guides === 'string' ? JSON.parse(guides) : guides;
    if (parsedGuides && Array.isArray(parsedGuides)) {
      for (const userId of parsedGuides) {
        await new TourGuide({
          tour_guide_id: new mongoose.Types.ObjectId().toString(),
          tour_id, user_id: userId
        }).save();
      }
    }

    res.status(201).json({ success: true, message: 'Tạo tour thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi tạo tour' });
  }
};
