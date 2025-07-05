"use client";

import React, { Dispatch, SetStateAction } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import { StreamingServiceData } from "../types/dataTypes";

interface EyeToggleProps {
    icon: React.ComponentProps<typeof Feather>['name'];
    onPress: () => void;
    styles: any;
}

export const EyeToggle: React.FC<EyeToggleProps> = ({ icon, onPress, styles }) => (
    <View key={icon} style={styles.eyeContainer}>
        <Pressable onPress={onPress} style={styles.headerButtons }>
            <Feather name={icon} size={28} color="black"/>
        </Pressable>
    </View>
);


// function to toggle selecting an attribute or bubble
const toggleSelection = (attribute: string, setState: Dispatch<SetStateAction<Set<string>>>) => {
    setState((prevSelected: Set<string>) => {
        const updatedSelected = new Set(prevSelected);
        if (updatedSelected.has(attribute)) {
            updatedSelected.delete(attribute); // Unselect
        } else {
            updatedSelected.add(attribute); // Select
        }
        return updatedSelected;
    });
};

interface PressableBubbleGroupProps {
    labels?: string[] | null;
    selectedLabels: Set<string>;
    setLabelState: Dispatch<SetStateAction<Set<string>>>;
    styles: any;
    onChange: React.Dispatch<React.SetStateAction<boolean>>;
    services?: StreamingServiceData[] | null;
}

export const PressableBubblesGroup: React.FC<PressableBubbleGroupProps> = ({ labels, selectedLabels, setLabelState, styles, onChange, services}) => (
    labels && labels.length > 0 ? labels.map((label) =>
        <Pressable 
            key={label} 
            onPress={() => {toggleSelection(label, setLabelState); onChange(true);}} 
            style={[styles.pressableBubble, selectedLabels.has(label) ? styles.selectedBubble : {paddingHorizontal: "4.33%",}]}
        >
            <Text style={[styles.pressableText, selectedLabels.has(label) && styles.selectedBubbleText]}>
                {label === "Science Fiction" ? "Sci-Fi" : label}
            </Text>
        </Pressable>
    ) : 
    services && services.length > 0 ? services.map((service) =>
        <Pressable
            key={service.name}
            onPress={() => {toggleSelection(service.name, setLabelState); onChange(true);}}
            style={[
                styles.pressableBubble,
                selectedLabels.has(service.name) && styles.selectedBubble
            ]}
        >
            <SvgUri
                uri={selectedLabels.has(service.name) ? service.darkLogo : service.lightLogo}
                width={45}
                height={45}
                style={{marginBottom: 5}}
            />
        </Pressable>
    ) : <></>
);

export default {};