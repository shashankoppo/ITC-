import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ViewStyle,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  initialFilters?: any;
}

const conditions = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
];

export function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || '');
  const [condition, setCondition] = useState(initialFilters?.condition || 'all');
  const [negotiable, setNegotiable] = useState(initialFilters?.negotiable || false);

  const handleApply = () => {
    onApply({
      minPrice,
      maxPrice,
      condition,
      negotiable,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setCondition('all');
    setNegotiable(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range (₹)</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <View style={styles.priceSeparator} />
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>

            {/* Condition */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Item Condition</Text>
              <View style={styles.chipRow}>
                {conditions.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[
                      styles.chip,
                      condition === c.value && styles.chipActive,
                    ]}
                    onPress={() => setCondition(c.value)}>
                    <Text
                      style={[
                        styles.chipText,
                        condition === c.value && styles.chipTextActive,
                      ]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Negotiable */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setNegotiable(!negotiable)}>
                <View>
                  <Text style={styles.toggleLabel}>Show only negotiable</Text>
                  <Text style={styles.toggleDesc}>Items where price can be discussed</Text>
                </View>
                <View style={[styles.checkbox, negotiable && styles.checkboxActive]}>
                  {negotiable && <Check size={14} color={COLORS.white} strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  closeBtn: { padding: 4 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  body: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
  },
  priceSeparator: {
    width: 12,
    height: 2,
    backgroundColor: COLORS.border,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  toggleDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: 34, // Safe area
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
