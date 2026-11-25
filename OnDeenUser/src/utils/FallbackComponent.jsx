import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import GradientButton from '../components/gradientButton';
import { fontScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';

const { height } = Dimensions.get('window');

function FallbackComponent({ error, resetErrorBoundary, componentStack }) {
    // Extract file and line number from error stack (works for development mode)
    const parseErrorStack = (stack) => {
        if (!stack) return null;
        
        // Try to match Chrome/React Native stack traces
        const chromeMatch = stack.match(/at (.+) \((.+):(\d+):(\d+)\)/);
        if (chromeMatch) {
            return {
                method: chromeMatch[1],
                file: chromeMatch[2],
                line: chromeMatch[3],
                column: chromeMatch[4]
            };
        }
        
        // Try to match Safari/Firefox stack traces
        const safariMatch = stack.match(/(.+@)(.+):(\d+):(\d+)/);
        if (safariMatch) {
            return {
                file: safariMatch[2],
                line: safariMatch[3],
                column: safariMatch[4]
            };
        }
        
        return null;
    };

    const errorDetails = parseErrorStack(error.stack);
    const componentStackDetails = componentStack || 'No component stack available';

    return (
        <View style={styles.container}>
            <Text style={styles.errorMessage}>Oops! Something went wrong.</Text>
            
            {errorDetails && (
                <View style={styles.errorLocation}>
                    <Text style={styles.errorDetails}>
                        Error in file: {errorDetails.file}
                    </Text>
                    <Text style={styles.errorDetails}>
                        At line: {errorDetails.line}, column: {errorDetails.column}
                    </Text>
                    {errorDetails.method && (
                        <Text style={styles.errorDetails}>
                            In method: {errorDetails.method}
                        </Text>
                    )}
                </View>
            )}
            
            <Text style={styles.errorDetails}>Error Message: {error.message}</Text>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Component Stack:</Text>
                <Text style={styles.errorDetails1}>{componentStackDetails}</Text>
                
                {error.stack && (
                    <>
                        <Text style={styles.sectionTitle}>Full Stack Trace:</Text>
                        <Text style={styles.errorDetails1}>{error.stack}</Text>
                    </>
                )}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <GradientButton
                    onPress={resetErrorBoundary}
                    title={'Try Again'}
                    containerStyle={[styles.customButtonContainer]}
                    textStyle={[styles.customButtonText, { fontSize: 16 }]}
                    gradientstyles={styles?.gradientstyles}
                    colors={['#DB3171', '#FFCC33']}
                    end={{ x: 0.5, y: 1 }}
                    start={{ x: 1, y: 0.1 }}
                />
            </View>
        </View>
    );
}

const ErrorBoundaryComponent = ({ children }) => {
    return (
        <ErrorBoundary
            FallbackComponent={FallbackComponent}
            onError={(error, info) => {
                console.error('Error Boundary Caught:', error, info);
                // You can log this to an error tracking service here
                // e.g., Sentry, Bugsnag, or your own backend
            }}
            onReset={() => {
                // Optional: Add any reset logic here
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        height: '100%',
        paddingTop: 70
    },
    errorMessage: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
        color: "#DB3171",
        fontSize: fontScale(24),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    errorLocation: {
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: height * 0.7,
    },
    errorDetails: {
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
        fontSize: fontScale(16),
        fontFamily: fontFamilies.SFProRoundedBlackBold,
    },
    sectionTitle: {
        color: '#DB3171',
        marginTop: 15,
        marginBottom: 5,
        fontSize: fontScale(16),
        fontFamily: fontFamilies.SFProRoundedBlackBold,
    },
    errorDetails1: {
        color: '#333',
        marginBottom: 8,
        fontSize: fontScale(14),
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    buttonContainer: {
        height: height * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
        paddingHorizontal: 40,
    },
});

export default ErrorBoundaryComponent;