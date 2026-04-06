import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck, Camera, Upload, CheckCircle2, AlertCircle, User } from 'lucide-react-native';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function VerificationScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      Alert.alert('Verification Submitted', 'Your documents are being reviewed. This usually takes 24-48 hours.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepRow}>
              <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
                {step > s ? <CheckCircle2 size={16} color={COLORS.white} /> : <Text style={[styles.stepText, step >= s && styles.stepTextActive]}>{s}</Text>}
              </View>
              {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        {step === 1 && (
          <View style={styles.stepContent}>
            <ShieldCheck size={64} color={COLORS.primary} strokeWidth={1.5} />
            <Text style={styles.stepTitle}>Get Verified Badge</Text>
            <Text style={styles.stepDescription}>Verify your identity to build trust with buyers and sell items up to 5x faster.</Text>
            
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Benefits of Verification:</Text>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={styles.benefitText}>Blue Checkmark Badge on Profile</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={styles.benefitText}>Higher Ranking in Search Results</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={styles.benefitText}>Unlimited Listings per Month</Text>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Upload ID Document</Text>
            <Text style={styles.stepDescription}>Please upload a clear photo of your Aadhaar, PAN, or Voter ID card.</Text>
            
            <TouchableOpacity style={styles.uploadArea}>
              <Camera size={32} color={COLORS.textLight} />
              <Text style={styles.uploadText}>Capture Front Side</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadArea}>
              <Upload size={32} color={COLORS.textLight} />
              <Text style={styles.uploadText}>Upload Back Side (Optional)</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <AlertCircle size={20} color={COLORS.textLight} />
              <Text style={styles.infoText}>Make sure all details are clearly visible and not blurred.</Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Take a Selfie</Text>
            <Text style={styles.stepDescription}>We need to match your face with the photo on your ID document.</Text>
            
            <View style={styles.selfieCircle}>
              <User size={64} color={COLORS.border} />
            </View>

            <TouchableOpacity style={styles.cameraBtn}>
              <Camera size={24} color={COLORS.white} />
              <Text style={styles.cameraBtnText}>Open Camera</Text>
            </TouchableOpacity>

            <Text style={styles.privacyNotice}>
              Your data is encrypted and used only for verification purposes.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{step === 3 ? 'Submit for Review' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
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
    padding: SPACING.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepText: {
    color: COLORS.textLight,
    fontWeight: '700',
  },
  stepTextActive: {
    color: COLORS.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepTitle: {
    ...FONTS.h2,
    marginTop: SPACING.lg,
    fontSize: 22,
  },
  stepDescription: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  benefitsCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    width: '100%',
    marginTop: 30,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  benefitsTitle: {
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.text,
  },
  uploadArea: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.white,
    marginTop: 20,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: RADIUS.sm,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textLight,
  },
  selfieCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    marginTop: 30,
    gap: 10,
  },
  cameraBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  privacyNotice: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 40,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
