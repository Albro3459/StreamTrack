"use client";

import { Pressable, StyleSheet, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { Colors } from "../../constants/Colors";
import { appStyles } from "../../styles/appStyles";

interface HeartTypes {
    isSelected?: () => boolean;
    size?: number;
    solid?: boolean;
    background?: boolean;

    onPress?: (any) => void;
    disabled?: boolean;
}

const Heart: React.FC<HeartTypes> = ({isSelected = () => true, size = 40, solid = false, background = false, onPress = () => {}, disabled = false}) => {
    return (
        <Pressable 
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                pressed && appStyles.pressed,
            ]}
        >
            {background ? (
                <View style={appStyles.heartBackground}>
                    <Icon 
                        name={"heart"}
                        size={size} 
                        color={'rgba(0,0,0,0.5)'} 
                        style={[appStyles.shadow, { position: 'absolute', zIndex: 1 }]}
                    />
                    <Icon 
                        name={solid ? "heart" : (isSelected() ? "heart" : "heart-o")}
                        size={size} 
                        color={isSelected() ? Colors.selectedHeartColor : Colors.unselectedHeartColor} 
                        style={[appStyles.shadow, {zIndex: 2}]}
                    />
                </View>
            ) : (
                <>
                    <Icon 
                        name={solid ? "heart" : (isSelected() ? "heart" : "heart-o")}
                        size={size} 
                        color={isSelected() ? Colors.selectedHeartColor : Colors.unselectedHeartColor} 
                        style={[appStyles.shadow, {zIndex: 2}]}
                    />
                </>
            )}
        </Pressable>
    )
};

export default Heart;