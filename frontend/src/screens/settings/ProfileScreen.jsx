// src/screens/settings/ProfileScreen.jsx
// UI updated to match design spec — "My Profile" header, avatar with initials,
// personal account badge, info rows for Business Name, Phone, Address, info note.

import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { ROUTES } from '../../navigation/routes';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import {
  ChevronRight,
  User,
  Building2,
  Trash2,
  Phone,
  MapPin,
  Star,
  Share2,
  Info,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { PROFILE_KEY } from '../main/HomeScreen';
import { toast, Toaster } from 'sonner-native';

// Helper: get initials from full name
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const [profile, setProfile] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    businessAddress: '',
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    businessAddress: '',
  });
  const [saving, setSaving] = useState(false);

  const editMode = route?.params?.editMode || false;

  const fromEventRedirect = route?.params?.fromEventRedirect || false;

  const pendingEvent = route?.params?.pendingEvent || null;
  const isToast = route?.params?.isToast || null;

  useEffect(() => {
    setEditing(editMode);
  }, [editMode]);

  useEffect(() => {
    if (fromEventRedirect && pendingEvent) {
      if (isToast) {
        setTimeout(() => {
          toast.warning('Setup your profile first');
        }, 300);
      }
    }
  }, [isToast]);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(raw => {
        if (raw) {
          const p = JSON.parse(raw);
          const data = {
            fullName: p.fullName || '',
            businessName: p.businessName || '',
            phone: p.phone || '',
            businessAddress: p.businessAddress || '',
          };
          setProfile(data);
          setForm(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleEdit = () => {
    setForm({ ...profile });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (!form.fullName) {
      toast.warning('Enter the atleast full name');
      setSaving(false);
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      const updated = {
        ...existing,
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
        businessAddress: form.businessAddress.trim(),
      };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfile({
        fullName: updated.fullName,
        businessName: updated.businessName,
        phone: updated.phone,
        businessAddress: updated.businessAddress,
      });
      setEditing(false);
      if (fromEventRedirect && pendingEvent) {
        navigation.navigate('HomeTab', {
          screen: ROUTES.POSTER,
          params: {
            event: pendingEvent,
          },
        });

        return;
      }
      toast.success('Profile updated!');
    } catch {
      toast.error('Error', 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.fullName ? getInitials(profile.fullName) : 'SM';

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
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
      {/* ── Top Bar ── */}
      <View
        style={{
          paddingTop: verticalScale(52),
          paddingBottom: verticalScale(12),
          paddingHorizontal: scale(20),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          My Profile
        </Text>

        {!editing && (
          <TouchableOpacity onPress={handleEdit} activeOpacity={0.8}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: scale(4),
                borderWidth: 1.5,
                borderColor: '#00BCD4',
                borderRadius: moderateScale(20),
                paddingHorizontal: scale(22),
                paddingVertical: scale(6),
              }}
            >
              <Text
                style={{
                  color: '#00BCD4',
                  fontSize: moderateScale(14),
                  fontFamily: 'Inter-SemiBold',
                }}
              >
                Edit
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: scale(16),
          paddingBottom: verticalScale(100),
        }}
      >
        {editing ? (
          /* ── Edit Mode ── */
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: moderateScale(20),
              padding: scale(20),
              marginTop: verticalScale(8),
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 12,
            }}
          >
            <Text
              style={{
                color: '#1A1A2E',
                fontSize: moderateScale(16),
                fontFamily: 'Inter-Bold',
                marginBottom: scale(16),
              }}
            >
              Edit Profile
            </Text>
            <InputField
              label="Full Name"
              placeholder="e.g. Ravinder Madhunala"
              value={form.fullName}
              onChangeText={t => setForm(p => ({ ...p, fullName: t }))}
              icon={<User size={22} color="#0D47A1" />}
            />
            <InputField
              label="Business Name"
              placeholder="e.g. Shri Manjunatha Marble & Granites"
              value={form.businessName}
              onChangeText={t => setForm(p => ({ ...p, businessName: t }))}
              icon={<Building2 size={22} color="#0D47A1" />}
            />
            <InputField
              label="Phone Number"
              placeholder="10-digit phone"
              value={form.phone}
              onChangeText={t => setForm(p => ({ ...p, phone: t }))}
              keyboardType="phone-pad"
              icon={<Phone size={22} color="#0D47A1" />}
            />
            <InputField
              label="Business Address"
              placeholder="Enter your business address"
              value={form.businessAddress}
              onChangeText={t => setForm(p => ({ ...p, businessAddress: t }))}
              icon={<MapPin size={22} color="#0D47A1" />}
            />
            <View
              className="flex flex-row gap-5 justify-center items-center"
              style={{ marginTop: scale(8) }}
            >
              <PrimaryButton
                title="Save"
                onPress={handleSave}
                loading={saving}
                style={{ width: 140 }}
              />
              <SecondaryButton
                title="Cancel"
                onPress={() => setEditing(false)}
                style={{ width: 140 }}
              />
            </View>
          </View>
        ) : (
          <>
            {/* ── Avatar + Name Card ── */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: moderateScale(20),
                paddingVertical: verticalScale(20),
                paddingHorizontal: scale(20),
                marginTop: verticalScale(8),
                marginBottom: verticalScale(14),
                flexDirection: 'row',
                alignItems: 'center',
                gap: scale(16),
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              {/* Avatar Circle */}
              <LinearGradient
                colors={['#1565C0', '#00BCD4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: scale(54),
                  height: scale(54),
                  borderRadius: scale(27),
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
              </LinearGradient>

              {/* Name + Account Type */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#1A1A2E',
                    fontSize: moderateScale(16),
                    fontFamily: 'Inter-Bold',
                  }}
                >
                  {profile.fullName || 'Your Name'}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scale(5),
                    marginTop: 3,
                  }}
                >
                  <Text
                    style={{
                      color: '#6B7A8D',
                      fontSize: moderateScale(12),
                      fontFamily: 'Inter-Regular',
                    }}
                  >
                    {initials === 'SM'
                      ? 'Create your personal account'
                      : 'Personal Account'}
                  </Text>
                  {/* Verified Badge */}
                  {initials !== 'SM' && (
                    <View
                      style={{
                        width: scale(16),
                        height: scale(16),
                        borderRadius: scale(8),
                        backgroundColor: '#00BCD4',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: moderateScale(9),
                          fontFamily: 'Inter-Bold',
                        }}
                      >
                        ✓
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ── Info Rows Card ── */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: moderateScale(20),
                paddingVertical: verticalScale(4),
                paddingHorizontal: scale(16),
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
                marginBottom: verticalScale(14),
              }}
            >
              {[
                {
                  label: 'Business Name',
                  value: profile.businessName || 'Your Business Name',
                  iconBg: '#E3F2FD',
                  icon: <Building2 size={22} color="#0D47A1" />,
                },
                {
                  label: 'Phone Number',
                  value: profile.phone || 'Your Phone Number',
                  iconBg: '#E8F5E9',
                  icon: <Phone size={22} color="#0A8114" />,
                },
                {
                  label: 'Business Address',
                  value: profile.businessAddress || 'Your Business Address',
                  iconBg: '#FFF3E0',
                  icon: <MapPin size={22} color="#E69513" />,
                  isLast: true,
                },
              ].map(row => (
                <View
                  key={row.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingVertical: verticalScale(14),
                    borderBottomWidth: row.isLast ? 0 : 1,
                    borderBottomColor: '#F0F0F5',
                    gap: scale(14),
                  }}
                >
                  {/* Icon Circle */}
                  <View
                    style={{
                      width: scale(40),
                      height: scale(40),
                      borderRadius: scale(20),
                      backgroundColor: row.iconBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: verticalScale(2),
                    }}
                  >
                    <Text style={{ fontSize: scale(18) }}>{row.icon}</Text>
                  </View>

                  {/* Label + Value */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: '#9E9E9E',
                        fontSize: moderateScale(11),
                        fontFamily: 'Inter-Regular',
                        marginBottom: 3,
                      }}
                    >
                      {row.label}
                    </Text>
                    <Text
                      style={{
                        color: '#1A1A2E',
                        fontSize: moderateScale(14),
                        fontFamily: 'Inter-SemiBold',
                      }}
                    >
                      {row.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Info Note ── */}
            <View
              style={{
                backgroundColor: '#EDF6FB',
              }}
              className="mx-2 mt-2 bg-cyan-50 rounded-[18px] p-4 flex-row items-center justify-center gap-2"
            >
              <Info size={22} color="#2EACF1" />
              <Text
                className="flex-1 text-[11px] text-gray-600 leading-[18px]"
                style={{
                  fontFamily: 'Inter-Regular',
                }}
              >
                Your profile is saved on this device only. Business name and
                your name will be auto-filled in poster prompts.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
