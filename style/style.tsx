import { StyleSheet } from "react-native";

const style = StyleSheet.create({
  Logo: {
    width: 100,
    height: 40,
    opacity: 0.85,
    marginLeft: "auto",
    marginRight: "auto",
  },
  container: {
    flex: 1,
    // borderColor: "red",
    // borderWidth: 2,
    boxsizing: "border-box"
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    color: "black",
  },
  vehicleImage: {
    width: 50,
    height: 35,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 8,
  },
  vehicleButtonContainer: {
    flexDirection: "row",
    gap: 5,
    marginLeft: 0,
    marginRight: 10,
    marginBottom: 10,
  },
  vehicleButton: {
    width: "25%",
    height: 80,
    // borderColor: "black",
    // borderWidth: 1,
  },
  vehicleButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 10,
    color: "black",
  },
  searchResultContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
  },
  searchResultText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: "#A0B9C6",
    borderRadius: 15,
    borderWidth: 1,
    fontSize: 16,
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    
    backgroundColor: "white",
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedLocationText: {
    fontSize: 16,
    textAlign: "left",
  },
  removeButton: {
    marginLeft: 10,
  },
  removeButtonText: {
    color: "red",
    fontWeight: "bold",
  },
  findingRideButton: {
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#726E60",

    // borderColor: "black",
    // borderWidth: 1,
    borderRadius: 15,
  },
  findingRideText: {
    textAlign: "center",
    color: "white",
    fontSize: 28.5,
    // fontWeight: "bold",
  },
  selectedVehicleButton: {
    backgroundColor: "#726E60",
    borderRadius: 15,
  },
  vehicleButtonTextSelected: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  fareText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  acceptedButton: {
    backgroundColor: "#32E875", // Green for accepted
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 15,
  },
  pendingButton: {
    backgroundColor: "#A0B9C6", // Gray for pending
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 15,
  },
  rejectedButton: {
    backgroundColor: "#C42021", // Red for rejected
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 15,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 28.5,
  },
  LocationMarkImage: {
    width: 20,
    height: 20,
    // marginLeft: 10,
    marginRight: 10,
  },
});

export default style;