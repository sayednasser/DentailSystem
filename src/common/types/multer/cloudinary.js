import { v2 as cloudinary } from'cloudinary';
import { API_KEY, API_SECRET, CLOUD_NAME } from '../../../../config/config.js';

cloudinary.config({
  secure: true,
  api_key:API_KEY,
  api_secret:API_SECRET,
  cloud_name: CLOUD_NAME
});
export default cloudinary

