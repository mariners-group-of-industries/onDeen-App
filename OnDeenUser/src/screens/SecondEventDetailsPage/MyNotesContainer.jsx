import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { fontFamilies } from '../../assets/fonts/fonts';
import TouchableLabel from '../../components/customLabels';
import EditIcon from '../../../src/assets/svg/edit.svg';
import styles from './styles';
import RightArrow from '../../../src/assets/svg/rightArrow.svg';

export default function MyNotesContainer({ eventDetail, notes, handleCreateNewNote }) {
    const navigation = useNavigation()
    return (
        <View
            style={{
                marginTop: 16,
                paddingHorizontal: 24,
            }}>
            <View>
                <Text
                    style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#0E0D0E',
                    }}>
                    MY NOTES
                </Text>
                <Pressable
                    accessibilityLabel="Open My Notes"
                    accessibilityRole="button"
                    onPress={() => {
                        navigation.navigate('NotesScreen', {
                            id: eventDetail?.id,
                        });
                    }}
                    style={{
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: '#E2E2E2',
                        gap: 8,
                        padding: 16,
                        borderRadius: 20,
                    }}>
                    <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
                        <View style={{ flexDirection: 'row', gap: 8, width: '85%' }}>
                            <TouchableLabel
                                onPress={handleCreateNewNote}
                                containerStyle={{
                                    backgroundColor: '#FFE8F1',
                                    borderRadius: 32,
                                    padding: 4,
                                    height: 32,
                                    width: 32,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                labelStyle={{}}
                                leftImage={<EditIcon />}
                                leftImageStyle={{
                                    right: 0,
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('NotesScreen', {
                                        id: eventDetail?.id,
                                    });
                                }}>
                                <Text
                                    style={{
                                        fontSize: 12,

                                        color: '#000000',
                                        fontFamily: fontFamilies.SFProRoundedBlackMedium,
                                        lineHeight: 16,
                                    }}>
                                    You have {notes.length} notes
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontFamily: fontFamilies.SFProRoundedBlackRegular,
                                        lineHeight: 12,
                                        color: '#3A3A3A',
                                    }}>
                                    Open to view and edit notes
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('NotesScreen', {
                                    id: eventDetail?.id,
                                });
                            }}
                            activeOpacity={0.7}>
                            <RightArrow
                                style={[
                                    styles.arrowImage,
                                ]}
                            />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}
