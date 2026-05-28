import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';

export const SETTINGS_IMAGE_KEY = 'SETTINGS_IMAGE_KEY';

// Pick image ONLY
export const pickProfileImage = async () => {
  try {
    const image = await ImagePicker.openPicker({
      width: 600,
      height: 600,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 1,
      mediaType: 'photo',
    });

    return image.path;
  } catch (error) {
    return null;
  }
};

// Save image permanently
export const saveProfileImage = async tempImagePath => {
  try {
    if (!tempImagePath) return null;

    // Delete old image
    const oldImagePath = await AsyncStorage.getItem(SETTINGS_IMAGE_KEY);

    if (oldImagePath) {
      const cleanOldPath = oldImagePath.replace('file://', '');

      const exists = await RNFS.exists(cleanOldPath);

      if (exists) {
        await RNFS.unlink(cleanOldPath);
      }
    }

    // Create new image
    const permanentPath = `${
      RNFS.DocumentDirectoryPath
    }/profile_${Date.now()}.jpg`;

    // Copy file
    await RNFS.copyFile(tempImagePath, permanentPath);

    const finalPath = `file://${permanentPath}`;
    

    // Save path
    await AsyncStorage.setItem(SETTINGS_IMAGE_KEY, finalPath);

    return finalPath;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Load image
export const getProfileImage = async () => {
  return await AsyncStorage.getItem(SETTINGS_IMAGE_KEY);
};
