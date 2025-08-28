import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    card: {
        width: "90%",
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    successText: {
        color: "green",
        textAlign: "center",
        marginTop: 10,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 10,
    },
});
