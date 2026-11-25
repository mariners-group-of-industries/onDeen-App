// utils/useTopInset.js
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const useTopInset = () => {
  const insets = useSafeAreaInsets();
  return insets.top;
};

export default useTopInset;
