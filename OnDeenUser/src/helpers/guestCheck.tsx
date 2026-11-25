// helpers/navigationWithGuestCheck.ts
export const navigateWithGuestCheck = (
  isSkippedLogin: boolean,
  navigation: any,
  targetScreen: string,
  setModalVisible: (val: boolean) => void,
  setPendingScreen: (val: string | null) => void
) => {
  if (isSkippedLogin) {
    setModalVisible(true);
    setPendingScreen(targetScreen);
  } else {
    navigation.navigate(targetScreen);
  }
};
