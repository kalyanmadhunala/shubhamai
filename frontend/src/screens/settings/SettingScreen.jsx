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
  Calendar1,
  CalendarClock,
  CalendarX,
  User,
  Building2,
  Trash2,
  Star,
  Share2,
  UserKey,
  Info,
  Key,
  Lock,
  BadgeCheck,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Image from 'react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { PROFILE_KEY } from '../main/HomeScreen';
import { toast, Toaster } from 'sonner-native';
import Modal from 'react-native-modal';
import InputField from '../../components/common/InputField';
import eventsService from '../../services/api/eventsService';
import { getProfileImage } from '../../utils/profileImage';

const ADMIN_CODE_KEY = 'ADMIN_CODE_KEY';

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
  const [adminCodeModal, setadminCodeModal] = useState(false);
  const [admincode, setadmincode] = useState('');
  const [isAdminActivated, setIsAdminActivated] = useState(false);
  const [activatingAdmin, setActivatingAdmin] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const loadImage = async () => {
        const savedImage = await getProfileImage();

        if (savedImage) {
          setSelectedImage(savedImage);
        }
      };

      loadImage();
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          // ─────────────────────────────
          // PROFILE
          // ─────────────────────────────

          const raw = await AsyncStorage.getItem(PROFILE_KEY);

          if (raw) {
            const p = JSON.parse(raw);

            setProfile({
              fullName: p.fullName || '',
              businessName: p.businessName || '',
              phone: p.phone || '',
            });
          } else {
            setProfile({
              fullName: '',
              businessName: '',
              phone: '',
            });
          }

          // ─────────────────────────────
          // ADMIN STATUS
          // ─────────────────────────────

          const savedCode = await AsyncStorage.getItem(ADMIN_CODE_KEY);

          setIsAdminActivated(!!savedCode);
          const savedImage = await getProfileImage();

          if (savedImage) {
            setSelectedImage(savedImage);
          }
        } catch (err) {
          setIsAdminActivated(false);
        }
      };
      loadData();
    }, []),
  );

  const initials = profile.fullName ? getInitials(profile.fullName) : 'SM';

  const handleClearData = () => {
    setDeleteModal(true);
  };

  const handleAdminCode = () => {
    // Check profile completion

    if (!profile?.fullName?.trim()) {
      toast.error(
        'Complete Profile & Business details to access Admin settings.',
      );

      return;
    }

    setadminCodeModal(true);
  };

  const confirmAddAdminCode = async () => {
    try {
      if (!profile?.fullName?.trim()) {
        toast.error('Please complete your profile first.');

        return;
      }

      if (!admincode.trim()) {
        setErrorText('Please enter admin code');

        return;
      }

      setActivatingAdmin(true);

      const response = await eventsService.adminCodeCheck(admincode.trim());

      if (!response?.success) {
        setErrorText(response?.message || 'Invalid admin code');
        return;
      }

      // Save locally
      await AsyncStorage.setItem(ADMIN_CODE_KEY, admincode.trim());

      // Activate
      setIsAdminActivated(true);
      // Cleanup
      setadminCodeModal(false);
      setadmincode('');
      setErrorText('');

      toast.success('Admin mode activated');
    } catch (error) {
      setadminCodeModal(false);
      setErrorText('');
      toast.error(error?.message || 'Failed to activate admin mode.');
    } finally {
      setActivatingAdmin(false);
    }
  };

  const confirmClearData = async () => {
    try {
      // Remove both profile + admin access

      await AsyncStorage.multiRemove([PROFILE_KEY, ADMIN_CODE_KEY]);

      // Reset profile

      setProfile({
        fullName: '',
        businessName: '',
        phone: '',
      });

      // Disable admin mode
      setIsAdminActivated(false);
      // Close modal
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
          onPress={() =>
            navigation.navigate('Profile', {
              editMode: true,
            })
          }
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
                width: scale(58),
                height: scale(58),
                borderRadius: scale(29),
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              ) : (
                <Text
                  style={{
                    color: '#fff',
                    fontSize: moderateScale(20),
                    fontFamily: 'Inter-Bold',
                  }}
                >
                  {initials}
                </Text>
              )}
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
        {isAdminActivated && (
          <SettingsSection title="Manage Events">
            <SettingsRow
              icon={<Calendar1 size={22} color="#B12D4F" />}
              iconBg="#EFCCB9"
              label="Today's Events"
              sublabel="Manage today's events"
              onPress={() =>
                navigation.navigate('ManageEvents', {
                  type: 'today',
                })
              }
            />
            <SettingsRow
              icon={<CalendarDays size={22} color="#E68D20" />}
              iconBg="#F6E6C9"
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
        )}

        <SettingsSection title="Admin">
          <SettingsRow
            icon={
              <UserKey
                size={22}
                color={isAdminActivated ? '#10B981' : '#E68D20'}
              />
            }
            iconBg={
              isAdminActivated
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(230,141,32,0.14)'
            }
            label="Admin Code"
            sublabel={
              isAdminActivated
                ? 'Admin mode activated'
                : 'Add admin code to manage events'
            }
            onPress={handleAdminCode}
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
            sublabel="Version 5.4.3"
            onPress={() =>
              toast.info('ShubhaM.Ai 5.4.3\nMade with ❤️ in India')
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
            ShubhaM.Ai • 5.4.3 • Made in India 🇮🇳
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
      <Modal
        isVisible={adminCodeModal}
        onBackdropPress={() => {
          setadminCodeModal(false);
          setadmincode('');
          setErrorText('');
        }}
        onBackButtonPress={() => {
          setadminCodeModal(false);
          setadmincode('');
          setErrorText('');
        }}
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
            colors={
              isAdminActivated
                ? ['rgba(16,185,129,0.18)', 'rgba(34,197,94,0.10)']
                : ['rgba(239,68,68,0.15)', 'rgba(220,38,38,0.08)']
            }
            style={{
              width: scale(72),
              height: scale(72),
              borderRadius: scale(36),
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: scale(18),
            }}
          >
            {isAdminActivated ? (
              <BadgeCheck size={34} color="#10B981" strokeWidth={2.3} />
            ) : (
              <UserKey size={32} color="#EF4444" strokeWidth={2.3} />
            )}
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
            {isAdminActivated ? 'Admin Mode Activated' : 'Admin Code'}
          </Text>

          {/* Description */}

          <Text
            style={{
              fontSize: moderateScale(13),
              fontFamily: 'Inter-Regular',
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: scale(18),
            }}
          >
            {isAdminActivated
              ? 'You already have administrator access enabled for managing events and controls.'
              : 'Please enter the admin access code to manage event settings and controls.'}
          </Text>

          {/* Success Badge */}

          {isAdminActivated && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: scale(6),

                backgroundColor: 'rgba(16,185,129,0.12)',

                paddingHorizontal: scale(14),
                paddingVertical: scale(10),

                borderRadius: scale(14),

                marginBottom: scale(8),
              }}
            >
              <BadgeCheck size={18} color="#10B981" strokeWidth={2.4} />

              <Text
                style={{
                  color: '#10B981',
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-Bold',
                }}
              >
                Admin mode activated
              </Text>
            </View>
          )}

          {/* Input + Buttons */}

          {!isAdminActivated && (
            <>
              <View
                style={{
                  width: '100%',
                  marginVertical: scale(6),
                }}
              >
                <InputField
                  placeholder="Activation code"
                  value={admincode}
                  onChangeText={text => {
                    setadmincode(text);

                    if (errorText) {
                      setErrorText('');
                    }
                  }}
                  icon={<Lock size={22} color="#0D47A1" />}
                />

                {errorText ? (
                  <Text
                    style={{
                      color: '#EF4444',
                      fontSize: moderateScale(12),
                      fontFamily: 'Inter-Regular',
                      paddingHorizontal: scale(6),
                    }}
                  >
                    * {errorText}
                  </Text>
                ) : null}
              </View>

              {/* Buttons */}

              <View
                style={{
                  flexDirection: 'row',
                  gap: scale(10),
                  width: '100%',
                  marginTop: scale(6),
                }}
              >
                {/* Cancel */}

                <TouchableOpacity
                  onPress={() => {
                    setadminCodeModal(false);
                    setadmincode('');
                    setErrorText('');
                  }}
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

                {/* Activate */}

                <TouchableOpacity
                  onPress={confirmAddAdminCode}
                  disabled={activatingAdmin}
                  activeOpacity={0.9}
                  style={{
                    flex: 1,
                    borderRadius: scale(16),
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#00C853', '#B2FF59']}
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
                      {activatingAdmin ? 'Activating...' : 'Activate'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Close Button When Activated */}

          {isAdminActivated && (
            <TouchableOpacity
              onPress={() => {
                setadminCodeModal(false);
              }}
              activeOpacity={0.9}
              style={{
                width: '100%',
                marginTop: scale(18),
                borderRadius: scale(16),
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['#10B981', '#34D399']}
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
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}
