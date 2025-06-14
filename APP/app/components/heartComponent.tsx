import { Pressable, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { Colors } from "@/constants/Colors";

interface HeartTypes {
    heartColor?: string;
    size?: number;
    onPress?: (any) => void;
}

const Heart: React.FC<HeartTypes> = ({heartColor = Colors.selectedHeartColor, size = 40, onPress = () => {}}) => {
    return (
        <Pressable 
            onPress={onPress} 
        >
            <Icon 
                name="heart" 
                size={size} 
                color={heartColor ? heartColor : Colors.selectedHeartColor} />
        </Pressable>
    )
};

export default Heart;