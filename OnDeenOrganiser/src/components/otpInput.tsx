import React, {useState, useRef, useEffect} from 'react';
import {View, TextInput, StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../helpers/scale';

const {width} = Dimensions.get('window');
const OTP_LENGTH = 6;

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
  onFocus?: () => void;
}

const OTPInput: React.FC<OTPInputProps> = ({value, onChange, onFocus}) => {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [otp, setOtp] = useState(value);

  useEffect(() => {
    setOtp(value);
  }, [value]);

  const handleChangeText = (text: string, index: number) => {
    let newOtp = otp.split('');
    newOtp[index] = text;
    newOtp = newOtp.join('');
    setOtp(newOtp);
    onChange(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else if (index > 0 && !text) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (
    {nativeEvent}: {nativeEvent: {key: string}},
    index: number,
  ) => {
    if (nativeEvent.key === 'Backspace' && index > 0) {
      let newOtp = otp.split('');
      newOtp[index] = '';
      newOtp = newOtp.join('');
      setOtp(newOtp);
      onChange(newOtp);
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onTouchStart={onFocus}>
      {Array.from({length: OTP_LENGTH}).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => (inputs.current[index] = ref)}
          style={styles.input}
          maxLength={1}
          keyboardType="numeric"
          value={otp[index]}
          onChangeText={text => handleChangeText(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          onFocus={onFocus}
          blurOnSubmit={false}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    alignSelf: 'center',
  },
  input: {
    width: widthScale(40),
    height: heightScale(50),
    borderWidth: 1,
    borderColor: '#BEBEBE',
    borderRadius: widthScale(16),
    textAlign: 'center',
    fontSize: fontScale(20),
    color: '#161616',
    backgroundColor: '#F3F0F7',
    margin: heightScale(4),
  },
});

export default OTPInput;
