// src/screens/settings/ImportantDatesScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  useWindowDimensions,
  StatusBar,
  Animated,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';

import AnimatedReanimated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  Trash2,
  Import,
  Plus,
  CircleX,
  CircleCheck,
  CalendarDays,
} from 'lucide-react-native';

import LinearGradient from 'react-native-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, GRADIENTS } from '../../constants/colors';

import Loader from '../../components/common/Loader';

import { scale, verticalScale, moderateScale } from '../../utils/responsive';

import { toast, Toaster } from 'sonner-native';

import eventsService from '../../services/api/eventsService';

const TYPE_OPTIONS = ['annual', 'one-time'];

const CATEGORY_OPTIONS = ['Festival', 'Personal', 'Business', 'Family'];

const EMPTY_FORM = {
  title: '',
  date: '',
  type: 'annual',
  category: 'Personal',
  description: '',
};

const REGION_COLORS = {
  telangana: {
    bg: 'rgba(0,188,212,0.12)',
    text: '#00BCD4',
  },

  national: {
    bg: 'rgba(107,114,128,0.12)',
    text: '#6B7280',
  },

  international: {
    bg: 'rgba(16,185,129,0.12)',
    text: '#059669',
  },

  default: {
    bg: 'rgba(107,114,128,0.10)',
    text: '#6B7280',
  },
};

export default function ImportantDatesScreen() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [jsonText, setJsonText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [copied, setCopied] = useState(false);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const dateRef = useRef(null);

  const descriptionRef = useRef(null);

  const setF = (key, val) =>
    setForm(prev => ({
      ...prev,
      [key]: val,
    }));

  const sampleJSON = `
Generate all present-year Telangana daily events in the exact JSON array format below without modifying the structure.  
List each event as a separate object, even if multiple events occur on the same date.

[
  {
    name: 'Bathukamma Festival',
    date: 'YYYY-MM-DD',
    description: "Wishes reletad to event name (Ex. Happy Bathukamma)",
    category: "Personal/Festival/Business/Family/Custom"
    region: 'Telangana',
  },
]`;

  // ─────────────────────────────────────
  // FETCH EVENTS
  // ─────────────────────────────────────

  const fetchCustomEvents = async () => {
    try {
      const response = await eventsService.getCustomEvents();

      setDates(response?.events || []);
    } catch (err) {
      toast.error(err?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomEvents();
  }, []);

  // ─────────────────────────────────────
  // REFRESH
  // ─────────────────────────────────────

  const handleRefresh = () => {
    setRefreshing(true);

    fetchCustomEvents();
  };

  // ─────────────────────────────────────
  // COPY
  // ─────────────────────────────────────

  const handleCopyJSON = () => {
    Clipboard.setString(sampleJSON);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  // ─────────────────────────────────────
  // OPEN MODAL
  // ─────────────────────────────────────

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setJsonText('');
    setParsedPreview(null);
    setActiveTab('single');
    setModalVisible(true);
  };

  // ─────────────────────────────────────
  // SAVE EVENT
  // ─────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Event title required');

      return;
    }

    if (!form.date.trim()) {
      toast.error('Event date required');

      return;
    }

    try {
      setSaving(true);

      await eventsService.addEvent({
        name: form.title.trim(),
        date: form.date.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        region: 'telangana',
      });

      toast.success('Event added successfully');

      setModalVisible(false);

      fetchCustomEvents();
    } catch (err) {
      toast.error(err?.message || 'Failed to add event');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────
  // PARSE JSON
  // ─────────────────────────────────────

  const handleParseJSON = async () => {
    try {
      setParsing(true);

      let parsed;

      // Try strict JSON first
      try {
        parsed = JSON.parse(jsonText.trim());
      } catch {
        // Fallback for JS object arrays
        parsed = eval(`(${jsonText})`);
      }

      const arr = Array.isArray(parsed) ? parsed : [parsed];

      setParsedPreview(arr);

      toast.success(`${arr.length} events parsed successfully`);
    } catch (err) {
      console.log(err);

      toast.error('Invalid JSON format');
    } finally {
      setParsing(false);
    }
  };

  // ─────────────────────────────────────
  // BULK IMPORT
  // ─────────────────────────────────────

  const handleBulkImport = async () => {
    try {
      setImporting(true);

      await eventsService.bulkAddEvents(parsedPreview);

      toast.success('Events imported successfully');

      setModalVisible(false);

      fetchCustomEvents();
    } catch (err) {
      toast.error(err?.message || 'Bulk import failed');
    } finally {
      setImporting(false);
    }
  };

  // ─────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await eventsService.deleteCustomEvent(selectedDeleteId);
      toast.success('Event deleted successfully');
      setDeleteModal(false);
      fetchCustomEvents();
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = id => {
    setSelectedDeleteId(id);

    setDeleteModal(true);
  };

  // ─────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────

  const getMonthDay = dateStr => {
    if (!dateStr)
      return {
        month: '---',
        day: '00',
      };

    let d;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      d = new Date(dateStr);
    } else if (/^\d{2}-\d{2}$/.test(dateStr)) {
      d = new Date(`2000-${dateStr}`);
    }

    return {
      month: d
        .toLocaleString('en-US', {
          month: 'short',
        })
        .toUpperCase(),

      day: String(d.getDate()).padStart(2, '0'),
    };
  };

  const getRegionStyle = item => {
    if (item.region) {
      return REGION_COLORS[item.region] || REGION_COLORS.default;
    }

    return REGION_COLORS.default;
  };

  const getRegionLabel = item => {
    if (item.region === 'national') return 'India';

    return item.region || 'Custom';
  };

  if (loading) {
    return <Loader message="Loading important dates..." />;
  }

  // ─────────────────────────────────────
  // CARD
  // ─────────────────────────────────────

  const renderItem = ({ item }) => {
    const { month, day } = getMonthDay(item.date);

    const regionStyle = getRegionStyle(item);

    const regionLabel = getRegionLabel(item);

    return (
      <View className="mb-2">
        <View
          className="border border-black/10 mx-1"
          style={{
            flexDirection: 'row',
            alignItems: 'center',

            backgroundColor: '#FFFFFF',

            borderRadius: moderateScale(22),

            paddingHorizontal: scale(14),

            paddingVertical: scale(13),
          }}
        >
          <View
            style={{
              width: scale(58),
              height: scale(64),

              borderRadius: scale(12),

              backgroundColor: '#F9F8FF',

              borderWidth: 1,
              borderColor: 'rgba(13,71,161,0.08)',

              alignItems: 'center',

              overflow: 'hidden',

              marginRight: scale(12),
            }}
          >
            <View
              style={{
                backgroundColor: '#0D47A1',

                paddingVertical: verticalScale(4),

                alignItems: 'center',

                justifyContent: 'center',
              }}
              className="mt-1 w-[45px] rounded-lg"
            >
              <Text
                style={{
                  color: '#FFFFFF',

                  fontSize: moderateScale(10),

                  fontFamily: 'Inter-Bold',
                }}
              >
                {month}
              </Text>
            </View>

            <View
              style={{
                flex: 1,

                alignItems: 'center',

                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#0D47A1',

                  fontSize: moderateScale(22),

                  fontFamily: 'Inter-Bold',
                }}
              >
                {day}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }} className="flex flex-col gap-2">
            <Text
              style={{
                fontSize: moderateScale(14),

                fontFamily: 'Inter-Bold',

                color: '#111827',
              }}
            >
              {item.name}
            </Text>

            <View
              style={{
                flexDirection: 'row',

                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: scale(5),
                  flexWrap: 'wrap',
                }}
              >
                <CalendarDays
                  size={11}
                  color={COLORS.primary}
                  strokeWidth={2}
                />

                <Text
                  style={{
                    fontSize: moderateScale(11),
                    fontFamily: 'Inter-Regular',
                    color: '#6B7280',
                  }}
                >
                  {item.date}
                </Text>

                {!!item.category && (
                  <View
                    style={{
                      backgroundColor: regionStyle.bg,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: regionStyle.text,
                        fontSize: moderateScale(9),
                        fontFamily: 'Inter-SemiBold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.category}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            activeOpacity={0.8}
            className="w-[34px] h-[34px] rounded-full bg-gray-100 items-center justify-center"
          >
            <Trash2 size={18} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
      }}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 60,
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
      {/* HEADER */}

      <View
        style={{
          paddingTop: insets.top + 12,

          paddingBottom: verticalScale(16),

          paddingHorizontal: scale(20),

          backgroundColor: '#FFFFFF',

          flexDirection: 'row',

          alignItems: 'center',

          justifyContent: 'space-between',

          borderBottomWidth: 1,

          borderBottomColor: '#F0F0F0',
        }}
      >
        <View>
          <Text
            style={{
              fontSize: moderateScale(22),

              fontFamily: 'Inter-Bold',

              color: '#111827',
            }}
          >
            Important Dates
          </Text>

          <Text
            style={{
              fontSize: moderateScale(12),

              fontFamily: 'Inter-Regular',

              color: '#9CA3AF',

              marginTop: 2,
            }}
          >
            {dates.length} event
            {dates.length !== 1 ? 's' : ''} in dataset
          </Text>
        </View>

        <TouchableOpacity onPress={openAdd} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row',

              alignItems: 'center',

              paddingHorizontal: scale(18),

              paddingVertical: scale(10),

              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',

                fontSize: moderateScale(14),

                fontFamily: 'Inter-SemiBold',
              }}
            >
              + Add
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* LIST */}

      {/* ── List ── */}
      <FlatList
        data={dates}
        keyExtractor={item => item._id?.toString() || item.id?.toString()}
        contentContainerStyle={{
          padding: scale(16),
          paddingBottom: verticalScale(110),
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: verticalScale(80),
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={require('../../assets/images/importantdates.png')} // change path if needed
                style={{
                  width: scale(240),
                  height: verticalScale(310),
                  resizeMode: 'contain',
                }}
              />
            </View>
            <Text
              style={{
                fontSize: moderateScale(24),
                fontFamily: 'Inter-Bold',
                color: '#111827',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              No dates added yet
            </Text>
            <Text
              style={{
                fontSize: moderateScale(16),
                fontFamily: 'Inter-Regular',
                color: '#9CA3AF',
                textAlign: 'center',
              }}
            >
              Tap "+ Add" to add custom events
            </Text>
          </View>
        }
        renderItem={renderItem}
      />

      {/* ── Add Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 60,
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
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: scale(20),
              paddingTop: scale(20),
              paddingBottom: Math.max(scale(24), 16),
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: '92%',
            }}
          >
            {/* Handle */}

            {/* Title row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: scale(16),
                marginTop: scale(16),
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(17),
                  fontFamily: 'Inter-Bold',
                  color: '#111827',
                }}
              >
                Add Event Date
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ color: '#9CA3AF', fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* ── Tabs — matches Image 2 exactly ── */}
            <View
              style={{
                flexDirection: 'row',
                borderRadius: 22,
                backgroundColor: '#F3F4F6',
                padding: 4,
                marginBottom: scale(20),
              }}
            >
              {[
                {
                  key: 'single',
                  label: 'Add One',
                  icon: <Plus size={16} color="#FFFFFF" />,
                },
                {
                  key: 'import',
                  label: 'Import JSON',
                  icon: <Import size={16} color="#FFFFFF" />,
                },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                >
                  {activeTab === tab.key ? (
                    <LinearGradient
                      colors={GRADIENTS.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: scale(10),
                        alignItems: 'center',
                        borderRadius: 22,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: scale(6),
                        }}
                      >
                        {tab.icon}

                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontFamily: 'Inter-Bold',
                            fontSize: moderateScale(13),
                          }}
                        >
                          {tab.label}
                        </Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View
                      style={{
                        paddingVertical: scale(10),
                        alignItems: 'center',
                        borderRadius: 9,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: scale(6),
                        }}
                      >
                        {tab.icon && <Import size={16} color="#9CA3AF" />}

                        <Text
                          style={{
                            fontFamily: 'Inter-Medium',
                            fontSize: moderateScale(13),
                            color: '#9CA3AF',
                          }}
                        >
                          {tab.label}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* ── Add One tab — matches Image 2 ── */}
              {activeTab === 'single' && (
                <>
                  {/* Event Title */}
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontFamily: 'Inter-SemiBold',
                      color: '#111827',
                      marginBottom: scale(6),
                    }}
                  >
                    Event Title <Text className="text-red-600">*</Text>
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#F3F4F6',
                      borderRadius: scale(10),
                      paddingHorizontal: scale(14),
                      paddingVertical: scale(13),
                      marginBottom: scale(14),
                    }}
                  >
                    <TextInput
                      value={form.title}
                      onChangeText={v => setF('title', v)}
                      placeholder="e.g. Bathukamma Festival"
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        dateRef.current?.focus();
                      }}
                      style={{
                        fontSize: moderateScale(13),
                        fontFamily: 'Inter-Regular',
                        color: '#111827',
                        padding: 0,
                      }}
                    />
                  </View>

                  {/* Date */}
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontFamily: 'Inter-SemiBold',
                      color: '#111827',
                      marginBottom: scale(6),
                    }}
                  >
                    Date <Text className="text-red-600">*</Text>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        color: '#9CA3AF',
                        fontSize: moderateScale(12),
                      }}
                    >
                      (
                      {form.type === 'annual'
                        ? 'MM-DD for annual'
                        : 'YYYY-MM-DD for one-time'}
                      )
                    </Text>
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#F3F4F6',
                      borderRadius: scale(10),
                      paddingHorizontal: scale(14),
                      paddingVertical: scale(13),
                      marginBottom: scale(14),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TextInput
                      value={form.date}
                      onChangeText={v => setF('date', v)}
                      placeholder={
                        form.type === 'annual'
                          ? 'e.g. 10-02'
                          : 'e.g. 2025-10-02'
                      }
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      style={{
                        flex: 1,
                        fontSize: moderateScale(13),
                        fontFamily: 'Inter-Regular',
                        color: '#111827',
                        padding: 0,
                      }}
                      ref={dateRef}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        descriptionRef.current?.focus();
                      }}
                    />

                    <CalendarDays size={18} color="#9CA3AF" strokeWidth={1.8} />
                  </View>

                  {/* Description */}
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontFamily: 'Inter-SemiBold',
                      color: '#111827',
                      marginBottom: scale(6),
                    }}
                  >
                    Description{' '}
                    <Text className="text-gray-400">(optional)</Text>
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#F3F4F6',
                      borderRadius: scale(10),
                      paddingHorizontal: scale(14),
                      paddingVertical: scale(13),
                      marginBottom: scale(18),
                    }}
                  >
                    <TextInput
                      value={form.description}
                      onChangeText={v => setF('description', v)}
                      placeholder="Short description..."
                      placeholderTextColor="#9CA3AF"
                      style={{
                        fontSize: moderateScale(13),
                        fontFamily: 'Inter-Regular',
                        color: '#111827',
                        padding: 0,
                      }}
                      ref={descriptionRef}
                      value={form.description}
                      returnKeyType="done"
                    />
                  </View>

                  {/* Recurrence Type */}
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontFamily: 'Inter-SemiBold',
                      color: '#111827',
                      marginBottom: scale(10),
                    }}
                  >
                    Recurrence Type <Text className="text-red-600">*</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: scale(8),
                      marginBottom: scale(18),
                    }}
                  >
                    {TYPE_OPTIONS.map(t => {
                      const isActive = form.type === t;
                      const label = t === 'annual' ? 'Annual' : 'One-Time';
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setF('type', t)}
                          activeOpacity={0.8}
                        >
                          {isActive ? (
                            <LinearGradient
                              colors={GRADIENTS.primary}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={{
                                borderRadius: 999,
                                paddingHorizontal: scale(20),
                                paddingVertical: scale(9),
                              }}
                            >
                              <Text
                                style={{
                                  color: '#FFFFFF',
                                  fontSize: moderateScale(13),
                                  fontFamily: 'Inter-SemiBold',
                                }}
                              >
                                {label}
                              </Text>
                            </LinearGradient>
                          ) : (
                            <View
                              style={{
                                borderRadius: 999,
                                paddingHorizontal: scale(20),
                                paddingVertical: scale(9),
                                backgroundColor: '#FFFFFF',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: moderateScale(13),
                                  fontFamily: 'Inter-SemiBold',
                                  color: '#6B7280',
                                }}
                              >
                                {label}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Category */}
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontFamily: 'Inter-SemiBold',
                      color: '#111827',
                      marginBottom: scale(10),
                    }}
                  >
                    Category <Text className="text-red-600">*</Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: scale(8),
                      marginBottom: scale(24),
                    }}
                  >
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        gap: scale(8),
                        paddingRight: scale(8),
                      }}
                      style={{
                        marginBottom: scale(8),
                      }}
                    >
                      {CATEGORY_OPTIONS.map(cat => {
                        const isActive = form.category === cat;

                        return (
                          <TouchableOpacity
                            key={cat}
                            onPress={() => setF('category', cat)}
                            activeOpacity={0.8}
                          >
                            {isActive ? (
                              <LinearGradient
                                colors={GRADIENTS.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                  borderRadius: 999,
                                  paddingHorizontal: scale(18),
                                  paddingVertical: scale(9),
                                }}
                              >
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: moderateScale(13),
                                    fontFamily: 'Inter-SemiBold',
                                  }}
                                >
                                  {cat}
                                </Text>
                              </LinearGradient>
                            ) : (
                              <View
                                style={{
                                  borderRadius: 999,
                                  paddingHorizontal: scale(18),
                                  paddingVertical: scale(9),
                                  backgroundColor: '#FFFFFF',
                                  borderWidth: 1,
                                  borderColor: '#E5E7EB',
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: moderateScale(13),
                                    fontFamily: 'Inter-SemiBold',
                                    color: '#6B7280',
                                  }}
                                >
                                  {cat}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Save button — full-width gradient, matches Image 2 */}
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.88}
                    style={{
                      borderRadius: scale(14),
                      overflow: 'hidden',
                      marginBottom: scale(10),
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <LinearGradient
                      colors={GRADIENTS.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: scale(16),
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: scale(8),
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: moderateScale(15),
                          fontFamily: 'Inter-Bold',
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Event'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.75}
                    style={{
                      paddingVertical: scale(14),
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(14),
                        fontFamily: 'Inter-SemiBold',
                        color: '#6B7280',
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ── Import JSON tab ── */}
              {activeTab === 'import' && (
                <>
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontFamily: 'Inter-Regular',
                      color: '#6B7280',
                      lineHeight: 20,
                      marginBottom: 12,
                    }}
                  >
                    Paste a JSON array of events. Use the prompt below to
                    generate daily events and keep the same JSON structure.
                  </Text>

                  <View
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 12,
                      backgroundColor: 'rgba(0,188,212,0.06)',
                    }}
                  >
                    {/* Header */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Inter-Bold',
                          color: '#0891B2',
                        }}
                      >
                        Event Prompt
                      </Text>

                      <Animated.View
                        style={{
                          transform: [{ scale: fadeAnim }],
                        }}
                      >
                        <TouchableOpacity
                          onPress={handleCopyJSON}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={
                              copied
                                ? ['#10B981', '#059669']
                                : GRADIENTS.primary
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              borderRadius: 20,
                              paddingHorizontal: 14,
                              paddingVertical: 6,
                            }}
                          >
                            <Text
                              style={{
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontFamily: 'Inter-SemiBold',
                              }}
                            >
                              {copied ? '✓ Copied' : '📋 Copy'}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>

                    {/* JSON */}
                    <Text
                      selectable
                      style={{
                        color: '#6B7280',
                        fontSize: 11,
                        fontFamily: 'monospace',
                        lineHeight: 18,
                      }}
                    >
                      {sampleJSON}
                    </Text>
                  </View>

                  <View
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      minHeight: 140,
                      backgroundColor: '#FAFAFA',
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <TextInput
                      value={jsonText}
                      onChangeText={v => {
                        setJsonText(v);
                        setParsedPreview(null);
                      }}
                      multiline
                      placeholder="Paste your JSON array here..."
                      placeholderTextColor="#9CA3AF"
                      style={{
                        fontSize: 13,
                        color: '#111827',
                        lineHeight: 20,
                        fontFamily: 'Inter-Regular',
                      }}
                      textAlignVertical="top"
                    />
                  </View>

                  {!parsedPreview ? (
                    <TouchableOpacity
                      onPress={handleParseJSON}
                      disabled={parsing}
                      activeOpacity={0.88}
                      style={{
                        borderRadius: scale(14),
                        overflow: 'hidden',
                        opacity: parsing ? 0.7 : 1,
                      }}
                    >
                      <LinearGradient
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          paddingVertical: scale(16),
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: moderateScale(15),
                            fontFamily: 'Inter-Bold',
                          }}
                        >
                          {parsing ? 'Parsing...' : 'Parse & Preview'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <View
                        style={{
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 12,
                          backgroundColor: 'rgba(0,188,212,0.06)',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: moderateScale(13),
                            color: COLORS.primary,
                            marginBottom: 8,
                          }}
                        >
                          <CircleCheck size={16} className="text-green-500" />{' '}
                          {parsedPreview.length} event(s) parsed — preview:
                        </Text>
                        {parsedPreview.slice(0, 3).map((e, i) => (
                          <Text
                            key={i}
                            style={{
                              color: '#374151',
                              fontSize: 12,
                              fontFamily: 'Inter-Regular',
                              marginBottom: 2,
                            }}
                          >
                            • {e.title} ({e.date})
                            {e.category ? ` — ${e.category}` : ''}
                          </Text>
                        ))}
                        {parsedPreview.length > 3 && (
                          <Text
                            style={{
                              color: '#9CA3AF',
                              fontSize: 11,
                              fontFamily: 'Inter-Regular',
                            }}
                          >
                            ...and {parsedPreview.length - 3} more
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={handleBulkImport}
                        disabled={importing}
                        activeOpacity={0.88}
                        style={{
                          borderRadius: scale(14),
                          overflow: 'hidden',
                          marginBottom: scale(10),
                          opacity: importing ? 0.7 : 1,
                        }}
                      >
                        <LinearGradient
                          colors={GRADIENTS.primary}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            paddingVertical: scale(16),
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: moderateScale(15),
                              fontFamily: 'Inter-Bold',
                            }}
                          >
                            {importing
                              ? 'Importing...'
                              : `Import ${parsedPreview.length} Events`}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setParsedPreview(null);
                        }}
                        activeOpacity={0.75}
                        style={{
                          paddingVertical: scale(14),
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(14),
                            fontFamily: 'Inter-SemiBold',
                            color: '#6B7280',
                          }}
                        >
                          ← Re-paste
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={deleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',

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
              Delete Entry?
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
              This action cannot be undone. The important date will be
              permanently removed.
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
                disabled={deleting}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  height: scale(52),
                  borderRadius: scale(16),
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: deleting ? 0.6 : 1,
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

              {/* Delete */}
              <TouchableOpacity
                onPress={confirmDelete}
                disabled={deleting}
                activeOpacity={0.9}
                style={{
                  flex: 1,
                  borderRadius: scale(16),
                  overflow: 'hidden',
                  opacity: deleting ? 0.7 : 1,
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
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
