// LoadingScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
// hi
const logo = require('./assets/logo.png'); // Replace with the path to your car image

const LoadingScreen = ({ onFinishLoading }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2500, // Adjust the duration for the fade-in
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000, // Adjust the duration for the fade-out
      easing: Easing.linear,
      useNativeDriver: true,
    });

    fadeIn.start();

    const loadingTimer = setTimeout(() => {
      fadeOut.start(() => {
        onFinishLoading && onFinishLoading();
        fadeAnim.setValue(1); // Reset the opacity for future use
      });
    }, 3000);

    return () => {
      clearTimeout(loadingTimer);
      fadeAnim.setValue(1);
    };
  }, [fadeAnim, onFinishLoading]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image source={logo} style={styles.image} />
      
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Dark background color
  },
  
  image: {
    width: '99%',
    height: '99%',
    resizeMode: 'contain',
    marginBottom: 32,
  },
});

export default LoadingScreen;
