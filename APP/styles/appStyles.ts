import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

export const RalewayFont = 'Raleway_800ExtraBold';
// export const KuraleFont = "Kurale_400Regular";


const shadow = {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
};

export const appStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // dark tint
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    shadow: {
        ...shadow
    },
    movieCard: {
        width: 11*7,
        marginRight: 15,
        overflow: "hidden"
    },
    movieImage: {
        height: 16*7,
        aspectRatio: 11 / 16,
        borderRadius: 8,
    },
    movieTitle: {
        color: Colors.selectedTextColor,
        fontSize: 14,
        marginTop: 5,
        textAlign: "center",
    },

    inputContainer: {
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 15,
        ...shadow
    },
    textInput: {
        height: 50,
        borderRadius: 10,
        backgroundColor: Colors.grayCell,
       
        fontSize: 16,
        color: Colors.altBackgroundColor,

        paddingHorizontal: 15,
        marginBottom: 15,
    },

    buttonContainer: {
        alignItems: "center",
    },
    button: {
        backgroundColor: Colors.selectedColor,
        width: 140,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        ...shadow
    },
    buttonText: {
        color: Colors.selectedTextColor,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    secondaryButton: {
        backgroundColor: Colors.altBackgroundColor,
        borderWidth: 1,
        borderColor: Colors.selectedColor,
    },
    secondaryButtonText: {
        color: Colors.selectedColor
    },

    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 10,
        marginBottom: 15,
        padding: 10,
        ...shadow
    },
    cardPoster: {
        height: 80,
        width: 60,
        borderRadius: 5,
        marginRight: 10,
         ...shadow
    },
    cardContent: {
        flex: 1,
        paddingHorizontal: 10
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.selectedTextColor,
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: 14,
        color: '#AAAAAA',
        marginBottom: 5,
    },
    cardRating: {
        fontSize: 14,
        color: Colors.goldColor,
    },

    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 10,
        padding: 20,
        width: "67%",
        alignItems: "center",
        ...shadow
    },
    modalTitle: {
        color: Colors.selectedTextColor,
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    optionPressable: {
        backgroundColor: Colors.selectedColor,
        width: "90%",
        borderRadius: 10,
        margin: 5,
    },
    selectedOptionPressable: {
        backgroundColor: Colors.selectedColor,
    },
    optionText: {
        fontSize: 16,
        color: Colors.selectedTextColor,
        paddingVertical: 10,
        textAlign: "center",
        width: "100%",
    },
    modalButton: {
        backgroundColor: Colors.grayCell,
        padding: 10,
        borderRadius: 5,
        margin: 5,
        width: '100%',
        height: 40,
        alignItems: 'center',
    },
    selectedModalButton: {
        backgroundColor: Colors.selectedColor,
    },
    modalButtonText: {
        color: Colors.altBackgroundColor,
        fontSize: 16,
    },
    selectedModalButtonText: {
        color: Colors.selectedTextColor,
        fontWeight: "600",
        fontSize: 16,
    },
    


    // OLD but can't delete just yet
    reviewCard: {
        flexDirection: "row",
        backgroundColor: Colors.altBackgroundColor,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    reviewTextContainer: {
        flex: 1,
    },
    reviewUser: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    reviewText: {
        fontSize: 14,
        color: Colors.reviewTextColor,
        marginVertical: 5,
    },
    reviewMovie: {
        fontSize: 14,
        color: Colors.italicTextColor,
        marginBottom: 5,
        fontStyle: "italic",
    },
});