"use client";

import type { ReactElement, ReactNode } from "react";
import { Pressable } from "react-native";
import type { NativeStackHeaderItem } from "@react-navigation/native-stack";

interface HeaderButtonProps {
    accessibilityLabel: string;
    children: ReactNode;
    onPress: () => void;
}

export function HeaderButton({ accessibilityLabel, children, onPress }: HeaderButtonProps) {
    return (
        <Pressable
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            hitSlop={10}
            onPress={onPress}
            style={({ pressed }) => ({
                opacity: pressed ? 0.45 : 1,
                padding: 4,
            })}
        >
            {children}
        </Pressable>
    );
}

export function hiddenGlassHeaderItem(element: ReactElement): NativeStackHeaderItem {
    return {
        type: "custom",
        element,
        hidesSharedBackground: true,
    };
}

export default function HeaderButtonComponentRoute(): null {
    return null;
}
