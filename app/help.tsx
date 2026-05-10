import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  Globe, 
  HelpCircle,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react-native';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

const FAQs = [
  {
    question: "How do I post an ad on SellAdv.com?",
    answer: "Tap on the yellow '+' Sell button in the bottom navigation bar. Choose a category, add photos, description, and price, then tap 'Post Listing'."
  },
  {
    question: "Is it free to sell on SellAdv.com?",
    answer: "Yes! Posting regular ads is completely free. We only charge for premium ad boosts which help your items sell 10x faster."
  },
  {
    question: "How do I contact a seller?",
    answer: "Open the product you're interested in and tap the 'Contact Seller' button to start a real-time chat."
  },
  {
    question: "How do I report a scam or fraud?",
    answer: "If you encounter a suspicious listing, scroll to the bottom of the product detail page and tap 'Report Listing'. Our moderation team will review it within 24 hours."
  }
];

export default function HelpScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const ContactOption = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.contactCard} onPress={onPress}>
      <View style={styles.contactIconContainer}>
        <Icon size={24} color={COLORS.primary} strokeWidth={2} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={COLORS.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={[width > 800 && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.heroSection}>
          <HelpCircle size={48} color={COLORS.primary} strokeWidth={1.5} />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.textLight} />
            <TextInput 
              placeholder="Search help topics..." 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactSection}>
          <ContactOption 
            icon={MessageCircle} 
            title="Chat Support" 
            subtitle="Response time: ~5 mins" 
          />
          <ContactOption 
            icon={Mail} 
            title="Email Support" 
            subtitle="support@itclearning.com" 
          />
          <ContactOption 
            icon={ShieldAlert} 
            title="Report a Safety Issue" 
            subtitle="Immediate safety concerns" 
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqSection}>
          {FAQs.map((faq, index) => (
            <TouchableOpacity key={index} style={styles.faqItem} activeOpacity={0.7}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <ChevronRight size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.legalSection}>
          <Text style={styles.legalText}>Privacy Policy</Text>
          <ExternalLink size={16} color={COLORS.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.legalSection}>
          <Text style={styles.legalText}>Terms of Service</Text>
          <ExternalLink size={16} color={COLORS.textLight} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 SellAdv.com Marketplace</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...FONTS.h3,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  heroTitle: {
    ...FONTS.h2,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    fontSize: 22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: RADIUS.md,
    width: '100%',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  contactSection: {
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  contactSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  faqSection: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: COLORS.borderLight,
    borderBottomColor: COLORS.borderLight,
  },
  faqItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  legalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  legalText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
