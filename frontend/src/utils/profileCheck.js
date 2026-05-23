import AsyncStorage from '@react-native-async-storage/async-storage';

import { PROFILE_KEY } from '../screens/main/HomeScreen';
import { ROUTES } from '../navigation/routes';

export async function checkProfileAndNavigate({ navigation, event }) {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);

    const profile = raw ? JSON.parse(raw) : null;

    const hasProfile = profile?.fullName && profile?.phone && profile?.businessName;

    // PROFILE NOT SETUP
    if (!hasProfile) {
      navigation.navigate('SettingsTab', {
        screen: ROUTES.PROFILE,
        params: {
          editMode: true,
          isToast: true,
          fromEventRedirect: true,
          pendingEvent: event,
        },
      });

      return;
    }

    // PROFILE EXISTS
    navigation.navigate(ROUTES.POSTER, {
      event,
    });
  } catch (error) {
    console.log('Profile Check Error:', error);

    navigation.navigate('SettingsTab', {
      screen: ROUTES.PROFILE,
      params: {
        editMode: true,
      },
    });
  }
}
