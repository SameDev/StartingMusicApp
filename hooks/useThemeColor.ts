import { DefaultTheme } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';  // Aqui vai a importação das cores que você definir

export const useThemeColor = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background, 
    primary: Colors.primary,       
    card: Colors.card,             
    text: Colors.text,
    iconSelect: Colors.tabIconSelected,
    iconDefault: Colors.tabIconDefault,
    accent: Colors.accent,
    secondary: Colors.secondary         
  },
};
