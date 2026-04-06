import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category } from '@/types/database';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Smartphone, Car, Home, Shirt, Sofa, Dumbbell, Briefcase, 
  Wrench, Dog, Book, Gamepad2, ShoppingBag, Bike, Building2, 
  Laptop, Heart, Zap, Sparkles 
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

interface CategoryCardProps {
  category: Category;
}

const iconMap: { [key: string]: any } = {
  smartphone: Smartphone,
  mobiles: Smartphone,
  car: Car,
  cars: Car,
  home: Home,
  properties: Home,
  shirt: Shirt,
  fashion: Shirt,
  sofa: Sofa,
  furniture: Sofa,
  dumbbell: Dumbbell,
  sports: Dumbbell,
  briefcase: Briefcase,
  jobs: Briefcase,
  wrench: Wrench,
  services: Wrench,
  bikes: Bike,
  dog: Dog,
  pets: Dog,
  book: Book,
  books: Book,
  hobbies: Book,
  gamepad: Gamepad2,
  gaming: Gamepad2,
  shopping: ShoppingBag,
  electronics: Laptop,
  building: Building2,
  laptop: Laptop,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();
  const Icon = iconMap[category.icon || category.slug || 'shopping'] || ShoppingBag;

  const handlePress = () => {
    router.push(`/category/${category.slug}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.75}>
      <LinearGradient
        colors={[COLORS.white, COLORS.surface]}
        style={styles.iconWrapper}
      >
        <LinearGradient
          colors={['rgba(35, 229, 219, 0.15)', 'rgba(0, 47, 52, 0.05)']}
          style={styles.iconContainer}
        >
          <Icon size={24} color={COLORS.primary} strokeWidth={2.2} />
        </LinearGradient>
      </LinearGradient>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
    marginRight: 4,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 20,
    padding: 1.5,
    backgroundColor: COLORS.white,
    marginBottom: 8,
    elevation: 4,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  iconContainer: {
    flex: 1,
    borderRadius: 18.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  name: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});