// src/screens/settings/BusinessProfileScreen.jsx
// UI updated to match design spec — gradient header card with business name,
// info rows for Business Type, Phone Number, Business Address, info note at bottom.

import React, { useState, useEffect } from 'react';
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
  Settings,
  Trash2,
  Phone,
  MapPin,
  Star,
  Share2,
  Info,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import BackButton from '../../components/common/BackButton';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { PROFILE_KEY } from '../main/HomeScreen';
import { toast, Toaster } from 'sonner-native';

export default function BusinessProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState({
    businessName: '',
    phone: '',
    businessAddress: '',
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    businessAddress: '',
  });
  const [saving, setSaving] = useState(false);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(raw => {
        if (raw) {
          const p = JSON.parse(raw);
          const biz = {
            businessName: p.businessName || '',
            phone: p.phone || '',
            businessAddress: p.businessAddress || '',
          };
          setProfile(biz);
          setForm(biz);
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
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      const updated = {
        ...existing,
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
        businessAddress: form.businessAddress.trim(),
      };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfile({
        businessName: updated.businessName,
        phone: updated.phone,
        businessAddress: updated.businessAddress,
      });
      setEditing(false);
      toast.success('Business profile updated!');
    } catch {
      toast.error('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          Business Profile
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
                paddingHorizontal: scale(14),
                paddingVertical: scale(6),
              }}
            >
              <Text
                style={{
                  color: '#00BCD4',
                  fontSize: moderateScale(13),
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
            }}
            className="border border-black/10"
          >
            <Text
              style={{
                color: '#1A1A2E',
                fontSize: moderateScale(16),
                fontFamily: 'Inter-Bold',
                marginBottom: scale(16),
              }}
            >
              Edit Business Profile
            </Text>
            <InputField
              label="Business Name"
              placeholder="e.g. Sri Balaji Enterprises"
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
            {/* ── Gradient Business Name Card ── */}
            <LinearGradient
              colors={['#1565C0', '#00BCD4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: moderateScale(20),
                paddingVertical: verticalScale(34),
                paddingHorizontal: scale(20),
                marginTop: verticalScale(8),
                marginBottom: verticalScale(16),
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
                  width: scale(140),
                  height: scale(140),
                  borderRadius: scale(70),
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  top: -scale(40),
                  right: -scale(30),
                }}
              />

              {/* Building icon */}
              <View
                style={{
                  width: scale(52),
                  height: scale(52),
                  borderRadius: moderateScale(14),
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={28} color="#FFFFFF" />
              </View>

              {/* Business Name */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: moderateScale(18),
                    fontFamily: 'Inter-Bold',
                    lineHeight: moderateScale(26),
                  }}
                >
                  {profile.businessName || 'Your Business Name'}
                </Text>
              </View>
            </LinearGradient>

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
                marginBottom: verticalScale(16),
              }}
            >
              {[
                {
                  label: 'Business Type',
                  value: profile.businessName || '—',
                  iconBg: '#E3F2FD',
                  icon: <Settings size={22} color="#0D47A1"/>,
                },
                {
                  label: 'Phone Number',
                  value: profile.phone || '—',
                  iconBg: '#E8F5E9',
                  icon: <Phone size={22} color="#0A8114" />,
                },
                {
                  label: 'Business Address',
                  value: profile.businessAddress || '—',
                  iconBg: '#FFF3E0',
                  icon: <MapPin size={22} color="#E69513" />,
                  isLast: true,
                },
              ].map((row, index, arr) => (
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
                This business profile will be used automatically in poster
                prompts.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
