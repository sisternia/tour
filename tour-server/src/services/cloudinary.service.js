const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (fileBuffer, folderPath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: folderPath },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(fileBuffer);
  });
};

const deleteImage = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

const deleteFolder = async (folderPath) => {
  return new Promise((resolve, reject) => {
    // 1. Xóa tất cả tài nguyên (ảnh) có prefix là folderPath
    const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    
    cloudinary.api.delete_resources_by_prefix(prefix, (error, result) => {
      if (error) {
        return reject(error);
      }
      
      // 2. Xóa folder (folder phải trống mới xóa được)
      const cleanFolderPath = folderPath.endsWith('/') ? folderPath.slice(0, -1) : folderPath;
      
      cloudinary.api.delete_folder(cleanFolderPath, (error2, result2) => {
        if (error2) {
          resolve(result); 
        } else {
          resolve(result2);
        }
      });
    });
  });
};

module.exports = { cloudinary, uploadImage, deleteImage, deleteFolder };
