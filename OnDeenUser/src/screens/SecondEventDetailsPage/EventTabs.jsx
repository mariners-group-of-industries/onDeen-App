import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './styles'

export default function EventTabs({activeTab, setActiveTab}) {
  return (
    <View style={styles.bookingContainer}>
              <TouchableOpacity
                activeOpacity={0.6}
                style={[
                  styles.tabButton,
                  activeTab == 'details' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('details')}>
                <Text
                  style={
                    activeTab == 'details' ? styles.activeText : styles.inactiveText
                  }>
                  Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.6}
                style={[
                  styles.tabButton,
                  activeTab == 'material' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('material')}>
                <Text
                  style={
                    activeTab == 'material' ? styles.activeText : styles.inactiveText
                  }>
                  Event Material
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.6}
                style={[styles.tabButton, activeTab == 'qa' && styles.activeTab]}
                onPress={() => setActiveTab('qa')}>
                <Text
                  style={
                    activeTab == 'qa' ? styles.activeText : styles.inactiveText
                  }>
                  Q&A
                </Text>
              </TouchableOpacity>
            </View>
  )
}