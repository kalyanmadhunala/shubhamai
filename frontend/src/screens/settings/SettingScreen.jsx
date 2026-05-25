// src/screens/settings/SettingsScreen.jsx
// Settings screen with matching design language —
// profile summary card at top, grouped setting rows with icons,
// version info at bottom.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {
  ChevronRight,
  Sparkles,
  CalendarDays,
  CalendarClock,
  CalendarX,
  User,
  Building2,
  Trash2,
  Star,
  Share2,
  Info,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { PROFILE_KEY } from '../main/HomeScreen';
import { toast, Toaster } from 'sonner-native';
import Modal from 'react-native-modal';

// Helper
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function SettingsSection({ title, children }) {
  return (
    <View style={{ marginBottom: verticalScale(16) }}>
      {title ? (
        <Text
          style={{
            color: '#9E9E9E',
            fontSize: moderateScale(11),
            fontFamily: 'Inter-SemiBold',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: verticalScale(8),
            marginLeft: scale(4),
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: moderateScale(20),
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        {children}
      </View>
    </View>
  );
}

// ── Single row ───────────────────────────────────────────────────────────────
function SettingsRow({
  icon,
  iconBg,
  label,
  sublabel,
  onPress,
  rightElement,
  isLast,
  danger,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(13),
        paddingHorizontal: scale(16),
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F0F0F5',
        gap: scale(14),
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: scale(38),
          height: scale(38),
          borderRadius: scale(19),
          backgroundColor: iconBg || '#F0F4FF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: scale(18) }}>{icon}</Text>
      </View>

      {/* Label area */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: danger ? '#E53935' : '#1A1A2E',
            fontSize: moderateScale(14),
            fontFamily: 'Inter-SemiBold',
          }}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            style={{
              color: '#9E9E9E',
              fontSize: moderateScale(11),
              fontFamily: 'Inter-Regular',
              marginTop: 2,
            }}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>

      {/* Right element */}
      {rightElement ||
        (onPress ? <ChevronRight size={18} color="#BDBDBD" /> : null)}
    </TouchableOpacity>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState({
    fullName: '',
    businessName: '',
    phone: '',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(raw => {
        if (raw) {
          const p = JSON.parse(raw);
          setProfile({
            fullName: p.fullName || '',
            businessName: p.businessName || '',
            phone: p.phone || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const initials = profile.fullName ? getInitials(profile.fullName) : 'SM';

  const handleClearData = () => {
    setDeleteModal(true);
  };

  const confirmClearData = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);

      setProfile({
        fullName: '',
        businessName: '',
        phone: '',
      });

      setDeleteModal(false);

      toast.success('All data has been removed.');
    } catch (error) {
      toast.error('Failed to clear data.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          elevation: 9999,
          pointerEvents: 'box-none',
        }}
      >
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
      </View>
      {/* ── Page Title ── */}
      <View
        style={{
          paddingTop: verticalScale(52),
          paddingBottom: verticalScale(12),
          paddingHorizontal: scale(20),
          backgroundColor: '#F5F7FA',
        }}
      >
        <Text
          style={{
            fontSize: moderateScale(20),
            fontFamily: 'Inter-Bold',
            color: '#1A1A2E',
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scale(16),
          paddingBottom: verticalScale(100),
        }}
      >
        {/* ── Profile Summary Card ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            marginBottom: verticalScale(20),
            marginTop: verticalScale(4),
          }}
        >
          <LinearGradient
            colors={['#1565C0', '#00BCD4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: moderateScale(20),
              paddingVertical: verticalScale(20),
              paddingHorizontal: scale(20),
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(16),
              overflow: 'hidden',
            }}
          >
            {/* Decorative circle */}
            <View
              style={{
                position: 'absolute',
                width: scale(120),
                height: scale(120),
                borderRadius: scale(60),
                backgroundColor: 'rgba(255,255,255,0.08)',
                top: -scale(30),
                right: -scale(20),
              }}
            />

            {/* Avatar */}
            <View
              style={{
                width: scale(52),
                height: scale(52),
                borderRadius: scale(26),
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: moderateScale(20),
                  fontFamily: 'Inter-Bold',
                }}
              >
                {initials}
              </Text>
            </View>

            {/* Name + Business */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: moderateScale(16),
                  fontFamily: 'Inter-Bold',
                }}
              >
                {profile.fullName || 'Set Up Your Profile'}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: moderateScale(12),
                  fontFamily: 'Inter-Regular',
                  marginTop: 2,
                }}
              >
                {profile.businessName || 'Promote your name and business.'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Account Section ── */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={<User size={22} color="#00BCD4" />}
            iconBg="#E3F2FD"
            label="My Profile"
            sublabel="Name, account details"
            onPress={() => navigation.navigate('Profile')}
          />
          <SettingsRow
            icon={<Building2 size={22} color="#0A8114" />}
            iconBg="#E8F5E9"
            label="Business Profile"
            sublabel="Business name, address, phone"
            onPress={() => navigation.navigate('BusinessProfile')}
            isLast
          />
        </SettingsSection>

        {/* ── Events Section ── */}
        <SettingsSection title="Manage Events">
          <SettingsRow
            icon={<User size={22} color="#00BCD4" />}
            iconBg="#E3F2FD"
            label="Today's Events"
            sublabel="Manage today's events"
            onPress={() =>
              navigation.navigate('ManageEvents', {
                type: 'today',
              })
            }
          />
          <SettingsRow
            icon={<Building2 size={22} color="#0A8114" />}
            iconBg="#E8F5E9"
            label="All Events"
            sublabel="Manage all events"
            onPress={() =>
              navigation.navigate('ManageEvents', {
                type: 'year',
              })
            }
            isLast
          />
        </SettingsSection>

        {/* ── About Section ── */}
        <SettingsSection title="About">
          <SettingsRow
            icon={<Star size={22} color="#FFD700" />}
            iconBg="#FFFDE7"
            label="Rate the App"
            sublabel="Share your feedback"
            onPress={() => toast.info('Thank you for your support!')}
          />
          <SettingsRow
            icon={<Share2 size={22} color="#0D47A1" />}
            iconBg="#E8F5E9"
            label="Share App"
            sublabel="Invite friends & family"
            onPress={() => toast.info('Share link coming soon!')}
          />
          <SettingsRow
            icon={<Info size={22} color="#0D47A1" />}
            iconBg="#E3F2FD"
            label="About"
            sublabel="Version 1.0.0"
            onPress={() =>
              toast.info('Poster Maker v1.0.0\nMade with ❤️ in India')
            }
            isLast
          />
        </SettingsSection>

        {/* ── Danger Zone ── */}
        <SettingsSection title="Data">
          <SettingsRow
            icon={<Trash2 size={18} color="#FF0000" strokeWidth={2} />}
            iconBg="#FFEBEE"
            label="Clear All Data"
            sublabel="Remove profile from this device"
            onPress={handleClearData}
            danger
            isLast
          />
        </SettingsSection>

        {/* ── Footer ── */}
        <View style={{ alignItems: 'center', paddingTop: verticalScale(8) }}>
          <Text
            style={{
              color: '#BDBDBD',
              fontSize: moderateScale(11),
              fontFamily: 'Inter-Regular',
            }}
          >
            ShubhaM.Ai • v1.0.0 • Made in India 🇮🇳
          </Text>
        </View>
      </ScrollView>
      <Modal
        isVisible={deleteModal}
        onBackdropPress={() => setDeleteModal(false)}
        onBackButtonPress={() => setDeleteModal(false)}
        backdropOpacity={0.45}
        style={{
          margin: 0,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: scale(24),
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: scale(28),
            padding: scale(24),
            alignItems: 'center',

            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 24,

            elevation: 20,
          }}
        >
          {/* Icon */}
          <LinearGradient
            colors={['rgba(239,68,68,0.15)', 'rgba(220,38,38,0.08)']}
            style={{
              width: scale(72),
              height: scale(72),
              borderRadius: scale(36),
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: scale(18),
            }}
          >
            <Trash2 size={32} color="#EF4444" strokeWidth={2.3} />
          </LinearGradient>

          {/* Title */}
          <Text
            style={{
              fontSize: moderateScale(20),
              fontFamily: 'Inter-Bold',
              color: '#111827',
              marginBottom: scale(8),
            }}
          >
            Clear All Data?
          </Text>

          {/* Description */}
          <Text
            style={{
              fontSize: moderateScale(13),
              fontFamily: 'Inter-Regular',
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: scale(24),
            }}
          >
            This will permanently remove your profile and saved data from this
            device.
          </Text>

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: scale(10),
              width: '100%',
            }}
          >
            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setDeleteModal(false)}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: scale(52),
                borderRadius: scale(16),
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#6B7280',
                  fontSize: moderateScale(14),
                  fontFamily: 'Inter-SemiBold',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Clear */}
            <TouchableOpacity
              onPress={confirmClearData}
              activeOpacity={0.9}
              style={{
                flex: 1,
                borderRadius: scale(16),
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: scale(52),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: moderateScale(14),
                    fontFamily: 'Inter-Bold',
                  }}
                >
                  Clear
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
