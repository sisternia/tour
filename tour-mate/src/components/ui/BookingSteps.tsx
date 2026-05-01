import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingStepsProps {
  currentStep: 1 | 2 | 3;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep }) => {
  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) {
        if (currentStep === 3) return 'completed'; // Special case for final step success
        return 'active';
    }
    return 'inactive';
  };

  const renderStep = (step: number, title: string, icon: string, last?: boolean) => {
    const status = getStepStatus(step);
    
    let circleStyle: any = styles.stepCircle;
    let textStyle: any = styles.stepText;
    let iconName: any = icon;
    let iconColor = '#999';

    if (status === 'completed') {
      circleStyle = [styles.stepCircle, styles.stepCompleted];
      textStyle = [styles.stepText, styles.stepTextCompleted];
      iconName = step === 3 ? 'checkmark-done' : 'checkmark';
      iconColor = '#fff';
    } else if (status === 'active') {
      circleStyle = [styles.stepCircle, styles.stepActive];
      textStyle = [styles.stepText, styles.stepTextActive];
      iconColor = '#fff';
    }

    return (
      <React.Fragment key={step}>
        <View style={styles.stepItem}>
          <View style={circleStyle}>
            <Ionicons name={iconName} size={16} color={iconColor} />
          </View>
          <Text style={textStyle}>{title}</Text>
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
    marginHorizontal: 2,
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
});

export default BookingSteps;
