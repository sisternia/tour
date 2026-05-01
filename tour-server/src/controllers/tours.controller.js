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
const mongoose = require('mongoose');
const { uploadImage, deleteFolder, deleteImage } = require('../services/cloudinary');

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
      // Tiếp tục xóa database dù Cloudinary lỗi
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

    // 1. Kiểm tra tour tồn tại
    const tour = await Tour.findOne({ tour_id: id });
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });
    }

    // 2. Cập nhật thông tin cơ bản
    tour.tour_name = tour_name || tour.tour_name;
    tour.tour_desc = tour_desc || tour.tour_desc;
    tour.tour_type = tour_type || tour.tour_type;
    tour.tour_add = tour_add || tour.tour_add;
    tour.tour_longit = tour_longit || tour.tour_longit;
    tour.tour_latit = tour_latit || tour.tour_latit;
    tour.tour_status = tour_status || tour.tour_status;
    await tour.save();

    // 3. Cập nhật TourTime & TourPrice
    await TourTime.findOneAndUpdate({ tour_id: id }, {
      tour_duration: parseInt(tour_duration),
      date_start: new Date(date_start),
      date_end: new Date(date_end)
    });

    await TourPrice.findOneAndUpdate({ tour_id: id }, {
      tour_capacity: parseInt(tour_capacity),
      price_child: parseFloat(price_child),
      price_adult: parseFloat(price_adult)
    });

    // 4. Cập nhật TourGuide (Xóa cũ, thêm mới)
    await TourGuide.deleteMany({ tour_id: id });
    const parsedGuides = typeof guides === 'string' ? JSON.parse(guides) : guides;
    if (parsedGuides && Array.isArray(parsedGuides)) {
      for (const userId of parsedGuides) {
        await new TourGuide({
          tour_guide_id: new mongoose.Types.ObjectId().toString(),
          tour_id: id,
          user_id: userId
        }).save();
      }
    }

    // 5. Cập nhật Tour Images
    const tourImgsFiles = req.files ? req.files.filter(f => f.fieldname === 'tour_imgs') : [];
    const existingTourImages = typeof req.body.existing_tour_images === 'string' ? JSON.parse(req.body.existing_tour_images) : (req.body.existing_tour_images || []);
    
    if (tourImgsFiles.length > 0 || existingTourImages.length > 0) {
      // Lấy danh sách ảnh cũ trong DB
      const oldTourImgs = await TourImg.find({ tour_id: id });
      
      // Xác định ảnh nào bị xóa (có trong DB nhưng không có trong existingTourImages)
      const imgsToDelete = oldTourImgs.filter(old => !existingTourImages.includes(old.tour_img_url));
      
      // Xóa ảnh bị gỡ khỏi Cloudinary
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

      // Xóa hết record cũ trong DB để re-create cho đúng thứ tự và cover index
      await TourImg.deleteMany({ tour_id: id });

      const coverIdx = parseInt(req.body.cover_index) || 0;
      let currentIdx = 0;

      // Re-create existing images
      for (const imgUrl of existingTourImages) {
        await new TourImg({
          tour_img_id: new mongoose.Types.ObjectId().toString(),
          tour_img_url: imgUrl,
          img_is_cover: currentIdx === coverIdx,
          tour_id: id
        }).save();
        currentIdx++;
      }

      // Upload new images
      for (const file of tourImgsFiles) {
        const uploadResult = await uploadImage(file.buffer, `tour/${id}/tour_imgs`);
        await new TourImg({
          tour_img_id: new mongoose.Types.ObjectId().toString(),
          tour_img_url: uploadResult.secure_url,
          img_is_cover: currentIdx === coverIdx,
          tour_id: id
        }).save();
        currentIdx++;
      }
    } else if (req.body.cover_index !== undefined) {
      await TourImg.updateMany({ tour_id: id }, { img_is_cover: false });
      const coverIdx = parseInt(req.body.cover_index);
      const allImgs = await TourImg.find({ tour_id: id }).sort({ createdAt: 1 });
      if (allImgs[coverIdx]) {
        allImgs[coverIdx].img_is_cover = true;
        await allImgs[coverIdx].save();
      }
    }

    // 6. Cập nhật Schedules (Xóa cũ, thêm mới để đảm bảo tính nhất quán cao nhất)
    const parsedSchedules = typeof schedules === 'string' ? JSON.parse(schedules) : schedules;
    if (parsedSchedules && Array.isArray(parsedSchedules)) {
      // KHÔNG xóa folder sche_imgs cũ để tránh mất ảnh hiện có
      const oldSches = await TourSche.find({ tour_id: id });
      const oldScheIds = oldSches.map(s => s.tour_sche_id);
      
      await TourSche.deleteMany({ tour_id: id });
      await TourScheImg.deleteMany({ tour_sche_id: { $in: oldScheIds } });

      const tourTime = await TourTime.findOne({ tour_id: id });

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
          tour_id: id
        }).save();

        // Handle Schedule Images
        const fieldName = `sche_imgs_${i}`;
        const scheImgFiles = req.files ? req.files.filter(f => f.fieldname === fieldName) : [];
        
        if (scheImgFiles.length > 0 || (sche.existing_images && sche.existing_images.length > 0)) {
          const scheCoverIdx = parseInt(sche.cover_index) || 0;
          let currentScheIdx = 0;

          // Existing schedule images
          if (sche.existing_images && Array.isArray(sche.existing_images)) {
            for (const oldImgUrl of sche.existing_images) {
              await new TourScheImg({
                tour_sche_imgs_id: new mongoose.Types.ObjectId().toString(),
                tour_sche_img_url: oldImgUrl,
                img_is_cover: currentScheIdx === scheCoverIdx,
                tour_sche_id,
                tour_id: id
              }).save();
              currentScheIdx++;
            }
          }

          // New schedule images
          for (let j = 0; j < scheImgFiles.length; j++) {
            const file = scheImgFiles[j];
            const uploadResult = await uploadImage(file.buffer, `tour/${id}/tour_sche_imgs/Ngay ${dayNum}`);
            await new TourScheImg({
              tour_sche_imgs_id: new mongoose.Types.ObjectId().toString(),
              tour_sche_img_url: uploadResult.secure_url,
              img_is_cover: currentScheIdx === scheCoverIdx,
              tour_sche_id,
              tour_id: id
            }).save();
            currentScheIdx++;
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật tour thành công'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật tour'
    });
  }
};

exports.get_tour_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findOne({ tour_id: id });
    
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });
    }

    const [price, time, images, tourGuides, schedules] = await Promise.all([
      TourPrice.findOne({ tour_id: id }),
      TourTime.findOne({ tour_id: id }),
      TourImg.find({ tour_id: id }),
      TourGuide.find({ tour_id: id }),
      TourSche.find({ tour_id: id }).sort({ day_number: 1, time_sche_start: 1 })
    ]);

    // Fetch guide details
    const guideIds = tourGuides.map(tg => tg.user_id);
    const baseGuides = await UserInfo.find({ user_id: { $in: guideIds } });

    const guides = await Promise.all(baseGuides.map(async (guide) => {
      // Find languages
      const userLangs = await GuideUserLanguage.find({ user_id: guide.user_id.toString() });
      const lanIds = userLangs.map(ul => ul.guide_lan_id);
      const languages = await GuideLanguage.find({ guide_lan_id: { $in: lanIds } });

      // Find fields
      const userFields = await GuideUserField.find({ user_id: guide.user_id.toString() });
      const fieldIds = userFields.map(uf => uf.guide_fie_id);
      const fields = await GuideField.find({ guide_fie_id: { $in: fieldIds } });

      return {
        ...guide._doc,
        languages: languages.map(l => l.guide_lan_name).filter(n => n),
        fields: fields.map(f => f.guide_fie_name).filter(n => n)
      };
    }));

    // Fetch schedule images
    const detailedSchedules = await Promise.all(schedules.map(async (sche) => {
      const scheImgs = await TourScheImg.find({ tour_sche_id: sche.tour_sche_id });
      return {
        ...sche._doc,
        images: scheImgs
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        ...tour._doc,
        price: price || {},
        time: time || {},
        images: images || [],
        guides: guides || [],
        schedules: detailedSchedules || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin chi tiết tour'
    });
  }
};

exports.view_tour = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    
    const detailedTours = await Promise.all(tours.map(async (tour) => {
      const price = await TourPrice.findOne({ tour_id: tour.tour_id });
      const time = await TourTime.findOne({ tour_id: tour.tour_id });
      const coverImg = await TourImg.findOne({ tour_id: tour.tour_id, img_is_cover: true });
      
      const tourGuides = await TourGuide.find({ tour_id: tour.tour_id });
      const guideIds = tourGuides.map(tg => tg.user_id);
      const guides = await UserInfo.find({ user_id: { $in: guideIds } });
      
      return {
        ...tour._doc,
        price: price || {},
        time: time || {},
        guides: guides || [],
        cover_img: coverImg ? coverImg.tour_img_url : null
      };
    }));

    res.status(200).json({
      success: true,
      data: detailedTours
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách tour'
    });
  }
};

exports.create_tour = async (req, res) => {
  try {
    const {
      tour_name, tour_desc, tour_type, tour_add,
      tour_longit, tour_latit, tour_status,
      tour_duration, date_start, date_end,
      tour_capacity, price_child, price_adult,
      schedules, // Array: [{ tour_sche_name, tour_sche_desc, time_sche_start, time_sche_end, tour_sche_add, tour_sche_longit, tour_sche_latit }]
      guides // Array of user_id
    } = req.body;

    const tour_id = new mongoose.Types.ObjectId().toString();

    // 1. Create Tour
    const newTour = new Tour({
      tour_id,
      tour_name,
      tour_desc: tour_desc || '',
      tour_type,
      tour_add: tour_add || '',
      tour_longit: tour_longit || null,
      tour_latit: tour_latit || null,
      tour_status: tour_status || 'Bản nháp'
    });
    await newTour.save();

    // 2. Upload Tour Images -> tour/tour_id/tour_imgs/
    const savedTourImgs = [];
    const coverIdx = parseInt(req.body.cover_index) || 0;

    if (req.files) {
      const tourImgsFiles = req.files.filter(f => f.fieldname === 'tour_imgs');
      for (let i = 0; i < tourImgsFiles.length; i++) {
        const file = tourImgsFiles[i];
        const folderPath = `tour/${tour_id}/tour_imgs`;
        const uploadResult = await uploadImage(file.buffer, folderPath);

        const tourImg = new TourImg({
          tour_img_id: new mongoose.Types.ObjectId().toString(),
          tour_img_url: uploadResult.secure_url,
          img_is_cover: i === coverIdx, 
          tour_id
        });
        await tourImg.save();
        savedTourImgs.push(tourImg);
      }
    }

    // 3. Create Tour Time
    const tour_times_id = new mongoose.Types.ObjectId().toString();
    const newTourTime = new TourTime({
      tour_times_id,
      tour_duration: parseInt(tour_duration),
      date_start: new Date(date_start),
      date_end: new Date(date_end),
      tour_id
    });
    await newTourTime.save();

    // 4. Create Tour Price
    const newTourPrice = new TourPrice({
      tour_price_id: new mongoose.Types.ObjectId().toString(),
      tour_capacity: parseInt(tour_capacity),
      price_child: parseFloat(price_child),
      price_adult: parseFloat(price_adult),
      tour_id
    });
    await newTourPrice.save();

    // 5. Create Schedules + Schedule Images
    const savedSchedules = [];
    const parsedSchedules = typeof schedules === 'string' ? JSON.parse(schedules) : schedules;

    if (parsedSchedules && Array.isArray(parsedSchedules)) {
      for (let i = 0; i < parsedSchedules.length; i++) {
        const sche = parsedSchedules[i];
        const tour_sche_id = new mongoose.Types.ObjectId().toString();

        const newSche = new TourSche({
          tour_sche_id,
          tour_sche_name: sche.tour_sche_name,
          tour_sche_desc: sche.tour_sche_desc || '',
          time_sche_start: sche.time_sche_start,
          time_sche_end: sche.time_sche_end || '',
          tour_sche_add: sche.tour_sche_add || '',
          tour_sche_longit: sche.tour_sche_longit || null,
          tour_sche_latit: sche.tour_sche_latit || null,
          day_number: sche.day_number || (i + 1),
          tour_times_id,
          tour_id
        });
        await newSche.save();

        // Upload Schedule Images -> tour/tour_id/tour_sche_imgs/Ngay X/
        const fieldName = `sche_imgs_${i}`;
        const scheCoverIdx = parseInt(sche.cover_index) || 0;
        const dayNum = sche.day_number || (i + 1); // Fallback to index if day_number not provided

        if (req.files) {
          const scheImgFiles = req.files.filter(f => f.fieldname === fieldName);
          for (let j = 0; j < scheImgFiles.length; j++) {
            const file = scheImgFiles[j];
            const folderPath = `tour/${tour_id}/tour_sche_imgs/Ngay ${dayNum}`;
            const uploadResult = await uploadImage(file.buffer, folderPath);

            const scheImg = new TourScheImg({
              tour_sche_imgs_id: new mongoose.Types.ObjectId().toString(),
              tour_sche_img_url: uploadResult.secure_url,
              img_is_cover: j === scheCoverIdx,
              tour_sche_id,
              tour_id
            });
            await scheImg.save();
          }
        }

        savedSchedules.push(newSche);
      }
    }

    // 6. Assign Guides
    const savedGuides = [];
    const parsedGuides = typeof guides === 'string' ? JSON.parse(guides) : guides;
    if (parsedGuides && Array.isArray(parsedGuides)) {
      for (const userId of parsedGuides) {
        const tourGuide = new TourGuide({
          tour_guide_id: new mongoose.Types.ObjectId().toString(),
          tour_id,
          user_id: userId
        });
        await tourGuide.save();
        savedGuides.push(tourGuide);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tạo tour thành công',
      data: {
        tour: newTour,
        images: savedTourImgs,
        time: newTourTime,
        price: newTourPrice,
        schedules: savedSchedules,
        guides: savedGuides
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo tour'
    });
  }
};
