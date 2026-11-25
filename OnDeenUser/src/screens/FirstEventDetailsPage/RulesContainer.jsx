import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'
import RenderHtmlCustome from '../../components/RenderHtmlCustome';

// Helper function to check if HTML content is effectively empty
const isContentEmpty = (htmlContent) => {
  if (!htmlContent) return true;
  
  // Remove all HTML tags and trim whitespace
  const textOnly = htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular space
    .trim();
    
  return textOnly === '';
};

export default function RulesContainer({ eventDetail }) {
    // Check which sections have real content
    const sections = [
        {
            key: 'eligibility',
            title: 'ELIGIBILITY',
            content: eventDetail?.eligibility
        },
        {
            key: 'rule',
            title: "WHAT'S INCLUDED",
            content: eventDetail?.rule
        },
        {
            key: 'cancellation_policy',
            title: 'CANCELLATION POLICY',
            content: eventDetail?.cancellation_policy
        },
        {
            key: 'terms_condition',
            title: 'Terms & Condition',
            content: eventDetail?.terms_condition
        }
    ].filter(section => !isContentEmpty(section.content));

    const hasAnyTermsData = sections.length > 0;

    return (
        <View>
            {hasAnyTermsData && (
                <View style={styles.rulesContainer}>
                    <View style={styles.courseDropdownContainer}>
                        <Text style={styles.breakdownText}>
                            Important Information
                        </Text>
                    </View>

                    <View>
                            {sections.map((section, index) => (
                                <View 
                                    key={section.key}
                                    style={[
                                        styles.itineraryContainer, 
                                        index !== sections.length - 1 && { paddingBottom: 18 }
                                    ]}
                                >
                                    <Text style={styles.subHeadingLabel}>
                                        {section.title}
                                    </Text>
                                    <View style={[styles.renderHtmlContainer, { gap: 0 }]}>
                                        <RenderHtmlCustome text={section.content} compact />
                                    </View>
                                </View>
                            ))}
                    </View>
                </View>
            )}
        </View>
    )
}
