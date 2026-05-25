// src/screens/auth/SplashScreen.jsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import { toast, Toaster } from 'sonner-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GRADIENTS } from '../../constants/colors';
import { scale, moderateScale } from '../../utils/responsive';
import { CONFIG } from '../../constants/config';

export default function SplashScreen({ navigation }) {
  const { height } = useWindowDimensions();

  const insets = useSafeAreaInsets();

  const [loadingText, setLoadingText] = useState('Waking up server...');

  useEffect(() => {
    let isMounted = true;

    const wakeUpServer = async () => {
      try {
        // ─────────────────────────────────────
        // 1. Check internet connection
        // ─────────────────────────────────────

        const state = await NetInfo.fetch();

        if (!state.isConnected) {
          toast.error('Check your internet connection');

          setLoadingText('No Internet Connection');

          setTimeout(() => {
            navigation.replace('Main');
          }, 1500);

          return;
        }

        // ─────────────────────────────────────
        // 2. Minimum splash delay
        // ─────────────────────────────────────

        const minDelay = new Promise(resolve => setTimeout(resolve, 1800));

        // ─────────────────────────────────────
        // 3. Fetch timeout for Render cold start
        // ─────────────────────────────────────

        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 45000);

        // ─────────────────────────────────────
        // 4. Wake backend server
        // ─────────────────────────────────────

        const serverRequest = fetch(`${CONFIG.API_BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        // ─────────────────────────────────────
        // 5. Wait for BOTH:
        //    - Minimum splash time
        //    - Server wakeup
        // ─────────────────────────────────────

        const [response] = await Promise.all([serverRequest, minDelay]);

        // ─────────────────────────────────────
        // 6. Validate response
        // ─────────────────────────────────────

        if (!response.ok) {
          toast.error("Couldn't reach server. Contact Kalyan Madhunala");

          setLoadingText('Opening app in offline mode...');

          // Allow app access anyway
          setTimeout(() => {
            navigation.replace('Main');
          }, 1200);

          return;
        }

        // ─────────────────────────────────────
        // 7. Launch app
        // ─────────────────────────────────────

        if (isMounted) {
          setLoadingText('Launching App...');

          setTimeout(() => {
            navigation.replace('Main');
          }, 500);
        }
      } catch (error) {
        if (isMounted) {
          // Abort timeout / network / offline
          toast.error('Server is taking longer to respond');

          setLoadingText('Opening App...');

          // Allow app access anyway
          setTimeout(() => {
            navigation.replace('Main');
          }, 1200);
        }
      }
    };

    wakeUpServer();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Toast */}
        <Toaster
          position="bottom-center"
          richColors
          offset={insets.top + 12}
          visibleToastCount={2}
          toastOptions={{
            style: {
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 9999,
            },

            titleStyle: {
              fontFamily: 'Inter-Bold',
              fontSize: 14,
              color: '#111827',
            },

            descriptionStyle: {
              fontFamily: 'Inter-Regular',
              fontSize: 12,
              color: '#6B7280',
              lineHeight: 17,
            },

            successStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            },

            errorStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#EF4444',
            },

            infoStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6',
            },
          }}
        />

        {/* Logo */}
        <View
          style={{
            width: scale(110),
            height: scale(110),
            borderRadius: scale(55),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: scale(20),
          }}
        >
          <Image
            source={require('../../assets/images/shubham_logo.png')}
            resizeMode="contain"
            style={{
              width: scale(112),
              height: scale(112),
            }}
          />
        </View>

        {/* App Name */}
        <Text
          style={{
            fontSize: moderateScale(34),
            color: '#fff',
            fontFamily: 'Inter-ExtraBold',
            letterSpacing: 1,
          }}
        >
          ShubhaM.Ai
        </Text>

        {/* Tagline */}
        <Text
          style={{
            fontSize: moderateScale(14),
            color: 'rgba(255,255,255,0.8)',
            fontFamily: 'Inter-Regular',
            marginTop: scale(8),
            letterSpacing: 0.5,
          }}
        >
          Your Daily Festival Poster Companion
        </Text>

        {/* Loader */}
        <View
          style={{
            marginTop: scale(40),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />

          <Text
            style={{
              marginTop: scale(14),
              fontSize: moderateScale(13),
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Inter-Medium',
              letterSpacing: 0.4,
            }}
          >
            {loadingText}
          </Text>
        </View>

        {/* Bottom Note */}
        <Text
          style={{
            position: 'absolute',
            bottom: height * 0.08,
            fontSize: moderateScale(12),
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'Inter-Regular',
          }}
        >
          Developed by Kalyan Madhunala ✨
        </Text>
      </LinearGradient>
    </View>
  );
}
