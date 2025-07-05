"use client";

import { Colors } from "@/constants/Colors";
import { appStyles } from "@/styles/appStyles";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";

interface StarRatingTypes {
    rating: number;
}

export const StarRating: React.FC<StarRatingTypes> = ({rating}) => {
    return (
        <View style={appStyles.ratingContainer}>
            {Array.from({ length: 5 }).map((_, index) => {
                const isFullStar = index < Math.floor(rating); // Full star if index is less than integer part of rating
                const isHalfStar = index >= Math.floor(rating) && index < rating; // Half star if index is fractional

                return (
                    <MaterialIcons
                        key={index}
                        name={isFullStar ? 'star' : isHalfStar ? 'star-half' : 'star-border'}
                        size={16}
                        color={Colors.goldColor}
                        style={appStyles.shadow}
                    />
                );
            })}
        </View>
    )
};

export default {};