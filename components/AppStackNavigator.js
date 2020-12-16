import React, { Component } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert} from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import BookDonateScreen from '../screens/BookDonateScreen';
import ReceiverDetailsScreen from '../screens/ReceiverDetailsScreen';

  export const AppStackNavigator = createStackNavigator({
      BookDonateList: {
       screen: BookDonateScreen,
       navigationOptions: {
           headerShown: false
       }
      },
      ReceiverDetails: {
       screen: ReceiverDetailsScreen,
       navigationOptions: {
          headerShown: false
        }
      }
  },
  
  {
      initialRouteName: "BookDonateList"
  }
  
  )