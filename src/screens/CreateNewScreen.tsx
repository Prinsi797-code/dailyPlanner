import React from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type Nav = StackNavigationProp<RootStackParamList>;

export default function CreateNewScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    navigation.navigate('StartOptions');
  }, []);

  return <View />;
}