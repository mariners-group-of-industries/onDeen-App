import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Dropup from '../../../assets/svg/dropup.svg';
import styles from './styles';
import RenderHtmlCustome from '../../../common/RenderHtmlCustome';
import { heightScale, widthScale } from '../../../helpers/scale';

export default function RulesandEligibility({ eventbyid }) {
    const [isItineraries, setItineraries] = useState(true);
    const [isRuleRegulationExpanded, setIsRuleRegulationExpanded] = useState(false);
    const [isEligibilityExpanded, setIsEligibilityExpanded] = useState(false);
    const [isCancellationExpanded, setIsCancellationExpanded] = useState(false);


    const rule = eventbyid?.rule || 'No rules defined';
    const eligibility = eventbyid?.eligibility || 'No eligibility criteria';
    const cancellationPolicy = eventbyid?.cancellation_policy || 'No cancellation policy available';

    const toggleItenariesDetails = () => {
        setItineraries(prev => !prev);
    };

    const toggleRulesExpansion = () => {
        setIsRuleRegulationExpanded(prev => !prev);
    };

    const toggleEligibilityExpansion = () => {
        setIsEligibilityExpanded(prev => !prev);
    };

    const toggleCancellationExpansion = () => {
        setIsCancellationExpanded(prev => !prev);
    };

    const renderContentWithToggle = (content, isExpanded, toggleExpansion) => {
        const MIN_LENGTH = 200;
        return (
            <>
                <View style={{
                    paddingBottom: 16,
                    marginBottom: 16,
                    borderBlockColor: '#F2DFE6',
                    borderBottomWidth: 1,
                }}>
                    <RenderHtmlCustome text={isExpanded || content.length <= MIN_LENGTH ? content : content.slice(0, MIN_LENGTH)} />
                </View>
            </>
        );
    };

    return (
        <View style={styles.rulesContainer}>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={toggleItenariesDetails}
                style={styles.courseDropdownContainer}
            >
                <Text style={styles.breakdownText}>Rules and Eligibility</Text>
                <Dropup style={{ transform: [{ rotate: isItineraries ? '180deg' : '0deg' }] }} />
            </TouchableOpacity>

            {isItineraries && (
                <View>
                    <Text style={[styles.classHeading, { paddingTop: 6, }]}>RULES & REGULATIONS</Text>
                    {renderContentWithToggle(rule, isRuleRegulationExpanded, toggleRulesExpansion)}

                    <Text style={[styles.classHeading, { paddingTop: 6 }]}>ELIGIBILITY</Text>
                    {renderContentWithToggle(eligibility, isEligibilityExpanded, toggleEligibilityExpansion)}

                    <Text style={[styles.classHeading, { paddingTop: 6 }]}>CANCELLATION POLICY</Text>
                    {renderContentWithToggle(cancellationPolicy, isCancellationExpanded, toggleCancellationExpansion)}
                </View>
            )}
        </View>
    );
}
