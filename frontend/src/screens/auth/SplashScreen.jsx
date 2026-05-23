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

import { GRADIENTS } from '../../constants/colors';
import { scale, moderateScale } from '../../utils/responsive';
import { CONFIG } from '../../constants/config';

export default function SplashScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const [loadingText, setLoadingText] = useState('Starting Server...');

  useEffect(() => {
    let isMounted = true;

    const wakeUpServer = async () => {
      try {
        // Optional minimum splash duration
        const minDelay = new Promise(resolve => setTimeout(resolve, 1800));

        // Wake backend server
        const serverRequest = fetch(`${CONFIG.API_BASE_URL}/health`);

        const [response] = await Promise.all([serverRequest, minDelay]);

        const data = await response.json();

        if (isMounted) {
          setLoadingText('Launching App...');

          setTimeout(() => {
            navigation.replace('Main');
          }, 500);
        }
      } catch (error) {

        // Even if server fails, continue app
        if (isMounted) {
          setLoadingText('Offline Mode...');

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
          ShubhaM.AI
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
          Powered by ChatGPT & Gemini ✨
        </Text>
      </LinearGradient>
    </View>
  );
}
