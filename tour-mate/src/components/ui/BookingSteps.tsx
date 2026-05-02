import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingStepsProps {
  currentStep: 1 | 2 | 3;
  isWeb?: boolean;
  title?: string;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep, isWeb = false, title }) => {
  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) {
        if (currentStep === 3) return 'completed'; // Special case for final step success
        return 'active';
    }
    return 'inactive';
  };

  const renderStep = (step: number, stepTitle: string, icon: string, last?: boolean) => {
    const status = getStepStatus(step);
    
    let circleStyle: any = styles.stepCircle;
    let textStyle: any = styles.stepText;
    let iconName: any = icon;
    let iconColor = '#999';
    let iconSize = 16;

    if (status === 'completed') {
      circleStyle = [circleStyle, styles.stepCompleted];
      textStyle = [textStyle, styles.stepTextCompleted];
      iconName = step === 3 ? 'checkmark-done' : 'checkmark';
      iconColor = '#fff';
    } else if (status === 'active') {
      circleStyle = [circleStyle, styles.stepActive];
      textStyle = [textStyle, styles.stepTextActive];
      iconColor = '#fff';
    }

    return (
      <React.Fragment key={step}>
        <View style={styles.stepItem}>
          <View style={circleStyle}>
            <Ionicons name={iconName} size={iconSize} color={iconColor} />
          </View>
          <Text style={textStyle}>{stepTitle}</Text>
        </View>
        {!last && (
          <Ionicons 
            name="arrow-forward" 
            size={12} 
            color={status === 'completed' ? '#28a745' : '#ccc'} 
            style={styles.stepArrow} 
          />
        )}
      </React.Fragment>
    );
  };

  if (isWeb) {
    const webTitle = title || (
      currentStep === 1 ? 'NHẬP THÔNG TIN' :
      currentStep === 2 ? 'THANH TOÁN' :
      'HOÀN TẤT'
    );

    return (
      <View style={styles.webHeaderContainer}>
        <Text style={styles.webLargeTitle}>{webTitle}</Text>
        <View style={styles.webTitleUnderline} />
      </View>
    );
  }

  return (
    <View style={styles.mobileStepsContainer}>
      <View style={styles.stepsRow}>
        {renderStep(1, 'THÔNG TIN', 'person-outline')}
        {renderStep(2, 'THANH TOÁN', 'card-outline')}
        {renderStep(3, 'HOÀN TẤT', 'checkmark-done-outline', true)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Mobile Styles
  mobileStepsContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepActive: {
    backgroundColor: '#007BFF', // Blue
  },
  stepCompleted: {
    backgroundColor: '#28a745', // Green
  },
  stepArrow: {
    marginHorizontal: 5,
  },
  stepText: {
    fontSize: 9,
    color: '#999',
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: '#007BFF',
  },
  stepTextCompleted: {
    color: '#28a745',
  },

  // Web Styles
  webHeaderContainer: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 20,
  },
  webLargeTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#005bb2',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  webTitleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#fb7800',
    marginTop: 15,
    borderRadius: 2,
  },
});

export default BookingSteps;
