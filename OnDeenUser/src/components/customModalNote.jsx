import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';

const { width, height } = Dimensions.get('window');

const CustomModalNote = ({
  isVisible,
  onClose,
  children,
  animationIn = 'slideInUp',
  animationOut = 'slideOutDown',
  backdropOpacity = 0.7,
  disableSwipeToClose = false,
  modalStyle = {},
  containerStyle = {},
  backdropColor = 'black',
  headerComponent,
}) => {
  
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
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
      deviceHeight={1200}
      propagateSwipe={true}>
      <View style={[styles.container, containerStyle]} pointerEvents="box-none">

        {/* Fixed Header */}
        <View>
          {headerComponent && <View>{headerComponent}</View>}
        </View>
        {/* Scrollable Content */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    maxHeight: height * 0.9,
    width: width * 0.9,
    zIndex: 1000, // Ensures it's above other elements
    elevation: 10, // Android shadow elevation
    justifyContent: 'flex-end',
    margin: 0,
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

  scrollContainer: {
    flex: 1,
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
});

export default CustomModalNote;
