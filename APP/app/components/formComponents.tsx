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
const toggleSelection = (attribute: any, setState: Dispatch<SetStateAction<any>>) => {
    setState((prevSelected: any) => {
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
    services?: StreamingServiceData[] | null;
    serviceLogoSize?: number;
}

export const PressableBubblesGroup: React.FC<PressableBubbleGroupProps> = ({ labels, selectedLabels, setLabelState, styles, services, serviceLogoSize = 45 }) => (
    labels && labels.length > 0 ? labels.map((label) =>
        <Pressable key={label} onPress={() => toggleSelection(label, setLabelState)} style={[styles.pressableBubble, selectedLabels.has(label) && styles.selectedBubble]}>
            <Text style={[styles.pressableText, selectedLabels.has(label) && styles.selectedBubbleText]}>{label}</Text>
        </Pressable>
    ) : 
    services && services.length > 0 ? services.map((service) =>
        <Pressable
            key={service.name}
            onPress={() => toggleSelection(service, setLabelState)}
            style={[
                {height: serviceLogoSize},
                styles.pressableBubble,
                selectedLabels.has(service.name) && styles.selectedBubble
            ]}
        >
            <SvgUri
                uri={service.logo}
                width={serviceLogoSize}
                height={serviceLogoSize}
                style={{marginBottom: 5}}
            />
        </Pressable>
    ) : <></>
);

export default {};