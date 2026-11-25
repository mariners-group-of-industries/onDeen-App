import React, {ReactNode} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Modal from 'react-native-modal';

const {width, height} = Dimensions.get('window');

interface CustomModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  title?: string;
  children?: ReactNode;
  closeOnBackdropPress?: boolean;
  animationIn?: 'slideInUp' | 'slideInDown' | 'fadeIn' | 'zoomIn' | 'bounceIn';
  animationOut?:
    | 'slideOutDown'
    | 'slideOutUp'
    | 'fadeOut'
    | 'zoomOut'
    | 'bounceOut';
  backdropOpacity?: number;
  disableSwipeToClose?: boolean;
  modalStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  closeButtonStyle?: StyleProp<ViewStyle>;
  closeButtonText?: StyleProp<TextStyle>;
  closeButtonTextStyle?: StyleProp<TextStyle>;
  backdropColor?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  closeOnBackdropPress = true,
  animationIn = 'slideInUp',
  animationOut = 'slideOutDown',
  backdropOpacity = 0.7,
  disableSwipeToClose = false,
  modalStyle = {},
  containerStyle = {},
  titleStyle = {},
  closeButtonStyle = {},
  closeButtonText = 'Close',
  closeButtonTextStyle = {},
  backdropColor = 'black',
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={closeOnBackdropPress ? onClose : undefined}
      animationIn={animationIn}
      animationOut={animationOut}
      backdropOpacity={backdropOpacity}
      backdropColor={backdropColor}
      swipeDirection={disableSwipeToClose ? undefined : ['down']}
      onSwipeComplete={disableSwipeToClose ? undefined : onClose}
      style={[styles.modal, modalStyle]}
      useNativeDriver={true}
      statusBarTranslucent={true}
      hideModalContentWhileAnimating={true}
      deviceHeight={1900}
      propagateSwipe={true}>
      <View style={[styles.container, containerStyle]}>
        {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
        <ScrollView 
        contentContainerStyle={styles.scrollContent}
          style={{ flexGrow: 0, maxHeight: height * 0.85 }}
          bounces={false}
        showsVerticalScrollIndicator={false}>
          <View style={styles.content}>{children}</View>
        </ScrollView>
        {/* <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, closeButtonStyle]}>
          <Text style={[styles.closeButtonText, closeButtonTextStyle]}>
            {closeButtonText}
          </Text>
        </TouchableOpacity> */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    maxHeight: height * 1,
    width: width * 0.9,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 0,
    width: width,
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
   scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});

export default CustomModal;
