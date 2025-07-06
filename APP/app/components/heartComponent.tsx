"use client";

import { Pressable, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { Colors } from "@/constants/Colors";
import { appStyles } from "@/styles/appStyles";

interface HeartTypes {
    isSelected?: () => boolean;
    size?: number;
    onPress?: (any) => void;
}

const Heart: React.FC<HeartTypes> = ({isSelected = () => true, size = 40, onPress = () => {}}) => {
    return (
        <Pressable 
            onPress={onPress}
            style={({ pressed }) => [
                pressed && appStyles.pressed,
            ]}
        >
            <Icon 
                name={isSelected() ? "heart" : "heart-o"}
                size={size} 
                color={isSelected() ? Colors.selectedHeartColor : Colors.unselectedHeartColor} 
                style={appStyles.shadow}
            />
        </Pressable>
    )
};

export default Heart;