// src/screens/settings/ManageEventScreen.jsx

import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { Trash2, CalendarDays, Search, X } from 'lucide-react-native';

import LinearGradient from 'react-native-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

import Loader from '../../components/common/Loader';

import { scale, verticalScale, moderateScale } from '../../utils/responsive';

import { toast, Toaster } from 'sonner-native';

import eventsService from '../../services/api/eventsService';

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

export default function ManageEventScreen({ route }) {
  const type = route?.params?.type || 'today';
  const isToday = type === 'today';
  const PAGE_SIZE = 10;
  const insets = useSafeAreaInsets();
  const [dates, setDates] = useState([]);
  const [filteredDates, setFilteredDates] = useState([]);
  const [paginatedDates, setPaginatedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ─────────────────────────────
  // FETCH EVENTS
  // ─────────────────────────────

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = isToday
        ? await eventsService.getTodayEvents()
        : await eventsService.getAllYearEvents();

      const events = response?.events || [];

      setDates(events);

      setFilteredDates(events);

      paginateDates(events, 1);

      setPage(1);
    } catch (err) {
      toast.error(err?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ─────────────────────────────
  // HELPERS
  // ─────────────────────────────

  const paginateDates = (eventsList, pageNumber = 1) => {
    const sliced = eventsList.slice(0, pageNumber * PAGE_SIZE);

    setPaginatedDates(sliced);
  };

  const handleLoadMore = () => {
    if (paginatedDates.length >= filteredDates.length) {
      return;
    }

    const nextPage = page + 1;

    setPage(nextPage);

    paginateDates(filteredDates, nextPage);
  };

  const handleSearch = text => {
    setSearchQuery(text);

    if (!text.trim()) {
      setFilteredDates(dates);

      paginateDates(dates, 1);

      setPage(1);

      return;
    }

    const search = text.toLowerCase();

    const filtered = dates.filter(item => {
      return (
        item.name?.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.region?.toLowerCase().includes(search) ||
        item.date?.toLowerCase().includes(search)
      );
    });

    setFilteredDates(filtered);

    paginateDates(filtered, 1);

    setPage(1);
  };

  const getMonthDay = dateStr => {
    if (!dateStr) {
      return {
        month: '---',
        day: '00',
      };
    }

    const d = new Date(dateStr);

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

  // ─────────────────────────────
  // DELETE
  // ─────────────────────────────

  const handleDelete = id => {
    setSelectedDeleteId(id);

    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);

      const response = isToday
        ? await eventsService.deleteTodayEvent(selectedDeleteId)
        : await eventsService.deleteYearEvent(selectedDeleteId);

      if (!response?.success) {
        toast.error(response?.message || 'Delete failed');
        return;
      }

      toast.success('Event deleted successfully');

      setDeleteModal(false);
      fetchEvents();
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────
  // LOADER
  // ─────────────────────────────

  if (loading) {
    return <Loader message="Loading events..." />;
  }

  // ─────────────────────────────
  // CARD
  // ─────────────────────────────

  const renderItem = ({ item }) => {
    const { month, day } = getMonthDay(item.date);

    const regionStyle = getRegionStyle(item);

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

      <Toaster richColors />

      {/* HEADER */}

      <View
        style={{
          paddingTop: insets.top + 12,

          paddingBottom: verticalScale(16),

          paddingHorizontal: scale(20),

          backgroundColor: '#FFFFFF',

          borderBottomWidth: 1,

          borderBottomColor: '#F0F0F0',
        }}
      >
        <Text
          style={{
            fontSize: moderateScale(22),

            fontFamily: 'Inter-Bold',

            color: '#111827',
          }}
        >
          {isToday ? "Today's Events" : 'All Events'}
        </Text>

        <Text
          style={{
            fontSize: moderateScale(12),

            fontFamily: 'Inter-Regular',

            color: '#9CA3AF',

            marginTop: 2,
          }}
        >
          {filteredDates.length} event
          {filteredDates.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* SEARCH */}

      <View
        style={{
          paddingHorizontal: scale(16),

          paddingTop: verticalScale(14),

          paddingBottom: verticalScale(8),

          backgroundColor: '#FFFFFF',
        }}
      >
        <View
          style={{
            flexDirection: 'row',

            alignItems: 'center',

            backgroundColor: '#FFFFFF',

            borderRadius: moderateScale(16),

            height: verticalScale(50),

            paddingHorizontal: scale(16),

            shadowColor: '#000',

            shadowOffset: {
              width: 0,
              height: 6,
            },

            shadowOpacity: 0.12,

            shadowRadius: 16,

            elevation: 8,

            gap: scale(10),
          }}
        >
          <Search size={20} color={COLORS.primary} strokeWidth={2} />

          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search events..."
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,

              color: '#111827',

              fontSize: moderateScale(14),

              fontFamily: 'Inter-Regular',

              paddingVertical: 0,
            }}
          />

          {!!searchQuery && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <View
                style={{
                  width: 22,

                  height: 22,

                  borderRadius: 11,

                  backgroundColor: '#F3F4F6',

                  alignItems: 'center',

                  justifyContent: 'center',
                }}
              >
                <X size={13} color="#6B7280" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* LIST */}

      <FlatList
        data={paginatedDates}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        keyExtractor={item => item._id?.toString()}
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
            <Image
              source={require('../../assets/images/importantdates.png')}
              style={{
                width: scale(240),

                height: verticalScale(310),

                resizeMode: 'contain',
              }}
            />

            <Text
              style={{
                fontSize: moderateScale(24),

                fontFamily: 'Inter-Bold',

                color: '#111827',

                marginBottom: 8,

                textAlign: 'center',
              }}
            >
              No events found
            </Text>
          </View>
        }
        ListFooterComponent={
          paginatedDates.length < filteredDates.length ? (
            <View
              style={{
                paddingVertical: 12,

                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
      />

      {/* DELETE MODAL */}

      <Modal visible={deleteModal} transparent animationType="fade">
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
            }}
          >
            <Trash2 size={42} color="#EF4444" />

            <Text
              style={{
                fontSize: moderateScale(20),

                fontFamily: 'Inter-Bold',

                color: '#111827',

                marginTop: 16,
              }}
            >
              Delete Event?
            </Text>

            <Text
              style={{
                fontSize: moderateScale(13),

                fontFamily: 'Inter-Regular',

                color: '#6B7280',

                textAlign: 'center',

                marginTop: 8,
              }}
            >
              This action cannot be undone.
            </Text>

            <View
              style={{
                flexDirection: 'row',

                gap: scale(10),

                marginTop: scale(24),

                width: '100%',
              }}
            >
              <TouchableOpacity
                onPress={() => setDeleteModal(false)}
                style={{
                  flex: 1,

                  height: scale(50),

                  borderRadius: scale(16),

                  backgroundColor: '#F3F4F6',

                  alignItems: 'center',

                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#6B7280',

                    fontFamily: 'Inter-SemiBold',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                }}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={{
                    height: scale(50),

                    borderRadius: scale(16),

                    alignItems: 'center',

                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',

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
