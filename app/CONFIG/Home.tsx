import { View, TextInput, Text, TouchableOpacity, Image } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { addLocation, db } from "@/app/CONFIG/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { router } from "expo-router";
import style from "@/style/style";
 
export default function HomeScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [dropResult, setDropResult] = useState<any[]>([]);
    const [pickupLocation, setPickupLocation] = useState<any | null>(null);
    const [dropOffLocation, setDropOffLocation] = useState<any | null>(null);
    const [pickupInput, setPickupInput] = useState<string>("");
    const [dropOffInput, setDropOffInput] = useState<string>("");
    const [fare, setFare] = useState<number>(0);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [acceptedRides, setAcceptedRides] = useState<string[]>([]);

    const rates = {
        FleetPremium: 120,
        FleetMini: 89.23,
        Rickshaw: 59.9956,
        Bike: 50,
    };

    useEffect(() => {
        locationPermit();
        realTimeRide();
    }, [pickupLocation, dropOffLocation, fare, selectedVehicle]);

    const locationPermit = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setErrorMsg("Permission to access location was denied");
            return;
        }
        const options = { accuracy: Location.Accuracy.High, distanceInterval: 1 };
        Location.watchPositionAsync(options, (loc) => setLocation(loc));
    };

    const findingPickupLocation = async (picklocation: string) => {
        setPickupInput(picklocation);
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: "fsq3gGfP49aMQlZ7kjUY/iVAkWpRdOiW6FJ3IoyTXRS2SP4=",
            },
        };

        try {
            const response = await fetch(
                `https://api.foursquare.com/v3/places/search?query=${picklocation}&ll=${location?.coords.latitude},${location?.coords.longitude}&radius=8000`,
                options
            );
            const data = await response.json();
            setSearchResult(data.results);
        } catch (err) {
            console.error(err);
        }
    };

    const findingDropOffLocation = async (dropLocation: string) => {
        setDropOffInput(dropLocation);
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: "fsq3gGfP49aMQlZ7kjUY/iVAkWpRdOiW6FJ3IoyTXRS2SP4=",
            },
        };

        try {
            const response = await fetch(
                `https://api.foursquare.com/v3/places/search?query=${dropLocation}&ll=${location?.coords.latitude},${location?.coords.longitude}&radius=8000`,
                options
            );
            const data = await response.json();
            setDropResult(data.results);
        } catch (err) {
            console.error(err);
        }
    };

    const removePickup = () => {
        setPickupLocation(null);
        setPickupInput("");
    };

    const removeDropOff = () => {
        setDropOffLocation(null);
        setDropOffInput("");
    };

    const vehicles = (vehicle: string) => {
        setSelectedVehicle(vehicle);
        const baseFare = rates[vehicle];
        if (pickupLocation && dropOffLocation) {
            const distance = calcCrow(
                pickupLocation.geocodes.main.latitude,
                pickupLocation.geocodes.main.longitude,
                dropOffLocation.geocodes.main.latitude,
                dropOffLocation.geocodes.main.longitude
            );
            const fareMade = baseFare * distance;
            setFare(Math.floor(fareMade));
        }
    };

    const calcCrow = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        lat1 = toRad(lat1);
        lat2 = toRad(lat2);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const toRad = (Value: number) => (Value * Math.PI) / 180;

    const addLoc = () => {
        if (pickupLocation && dropOffLocation) {
            addLocation({
                Pickuplatitude: pickupLocation.geocodes.main.latitude,
                Pickuplongitude: pickupLocation.geocodes.main.longitude,
                Dropofflatitude: dropOffLocation.geocodes.main.latitude,
                Dropofflongitude: dropOffLocation.geocodes.main.longitude,
                pickupLocationName: pickupLocation.name,
                dropoffLocationName: dropOffLocation.name,
                fare: fare,
                vehicle: selectedVehicle,
                distance: calcCrow(
                    pickupLocation.geocodes.main.latitude,
                    pickupLocation.geocodes.main.longitude,
                    dropOffLocation.geocodes.main.latitude,
                    dropOffLocation.geocodes.main.longitude
                ),
                status: "Pending",
            });
        }
    };

    const realTimeRide = () => {
        const q = query(collection(db, "RidesInfo"));
        onSnapshot(q, (querySnapshot) => {
            const acceptRides: string[] = [];
            querySnapshot.forEach((doc) => {
                acceptRides.push(doc.data().status);
            });
            setAcceptedRides(acceptRides);
            if (acceptRides[0] === "Accepted" && pickupLocation && dropOffLocation) {
                router.push({
                    pathname: "/success",
                    params: {
                        pickupLocationLatitude: pickupLocation.geocodes.main.latitude,
                        pickupLocationLongitude: pickupLocation.geocodes.main.longitude,
                        dropoffLocationLatitude: dropOffLocation.geocodes.main.latitude,
                        dropoffLocationLongitude: dropOffLocation.geocodes.main.longitude,
                        pickupLocationName: pickupLocation.name,
                        dropoffLocationName: dropOffLocation.name,
                        fare: fare,
                        vehicle: selectedVehicle,
                        distance: calcCrow(
                            pickupLocation.geocodes.main.latitude,
                            pickupLocation.geocodes.main.longitude,
                            dropOffLocation.geocodes.main.latitude,
                            dropOffLocation.geocodes.main.longitude
                        ),
                    },
                });
            }
        });
    };

    const getButtonStyle = () => {
        if (acceptedRides[0] === "Accepted") {
            return "bg-green-500"; // Tailwind green for accepted rides
        } else if (acceptedRides[0] === "Pending") {
            return "bg-gray-500"; // Tailwind gray for pending rides
        } else if (acceptedRides[0] === "Rejected") {
            return "bg-red-500"; // Tailwind red for rejected rides
        }
        return "bg-blue-500"; // Default button style
    };

    const getButtonText = () => {
        if (acceptedRides[0] === "Accepted") return "Ride Accepted";
        if (acceptedRides[0] === "Pending") return "Processing...";
        if (acceptedRides[0] === "Rejected") return "Cancelled";
        return "Find Ride"; // Default text
    };
    return (
        // Main container view for the HomeScreen component
        <View style={style.container}>
            {/* Render the MapView only if the location state is available */}
            {location && (
                <MapView
                    style={style.map} // Apply styling to the MapView
                    region={{
                        // Set the region of the map based on the pickup location or current location
                        latitude: pickupLocation
                            ? pickupLocation.geocodes.main.latitude // Use pickup location latitude if available
                            : location.coords.latitude, // Otherwise, use the current location latitude
                        longitude: pickupLocation
                            ? pickupLocation.geocodes.main.longitude // Use pickup location longitude if available
                            : location.coords.longitude, // Otherwise, use the current location longitude
                        latitudeDelta: pickupLocation ? 0.01 : 0.0032, // Adjust zoom level based on pickup location
                        longitudeDelta: pickupLocation ? 0.05 : 0.0001, // Adjust zoom level based on pickup location
                    }}
                >
                    {pickupLocation && (
                        <Marker
                            coordinate={{
                                latitude: pickupLocation.geocodes.main.latitude, // Latitude of the pickup location
                                longitude: pickupLocation.geocodes.main.longitude, // Longitude of the pickup location
                            }}
                            title="Pickup Location" // Title for the pickup location marker
                            pinColor="green"
                        />
                    )}

                    {/* Render the drop-off location marker if available */}
                    {dropOffLocation && (
                        <Marker
                            coordinate={{
                                latitude: dropOffLocation.geocodes.main.latitude, // Latitude of the drop-off location
                                longitude: dropOffLocation.geocodes.main.longitude, // Longitude of the drop-off location
                            }}
                            title="Drop-Off Location" // Title for the drop-off location marker
                            description={dropOffLocation.location.formatted_address} // Description of the drop-off location
                        />
                    )}

                    {/* Add a Polyline between the pickup and drop-off locations if both are available */}
                    {pickupLocation && dropOffLocation && (
                        <Polyline
                            coordinates={[
                                {
                                    latitude: pickupLocation.geocodes.main.latitude,
                                    longitude: pickupLocation.geocodes.main.longitude,
                                },
                                {
                                    latitude: dropOffLocation.geocodes.main.latitude,
                                    longitude: dropOffLocation.geocodes.main.longitude,
                                },
                            ]}
                            strokeColor="#23B5D3" // Blue color for the polyline
                            strokeWidth={4} // Width of the polyline
                        />
                    )}
                </MapView>
            )}
            {/* Container for input fields and vehicle selection buttons */}
            <View style={style.inputContainer}>
                {/* Container for vehicle selection buttons */}
                <Image
                    source={require("../../assets/images/fleet/Go_fleet-removebg-preview.png")} // Path to the logo image
                    style={style.Logo} // Apply styling to the logo
                />
                <View style={style.vehicleButtonContainer}>
                    {/* Button for Fleet Premium vehicle */}
                    <TouchableOpacity
                        style={[
                            style.vehicleButton, // Default button styling
                            selectedVehicle === "FleetPremium" && style.selectedVehicleButton, // Apply selected styling if Fleet Premium is selected
                            (!pickupLocation || !dropOffLocation) && style.disabledButton, // Apply disabled styling if either location is not selected
                        ]}
                        onPress={() => {
                            vehicles("FleetPremium"); // Call vehicles function with Fleet Premium as argument
                        }}
                        disabled={!pickupLocation || !dropOffLocation} // Disable button if locations are not selected
                    >
                        <Image
                            style={style.vehicleImage} // Apply styling to vehicle image
                            source={require("../../assets/images/fleet/FleetPremium.png")} // Path to the Fleet Premium image
                        />
                        <Text
                            style={[
                                style.vehicleButtonText, // Default button text styling
                                selectedVehicle === "FleetPremium" &&
                                style.vehicleButtonTextSelected, // Apply selected text styling if Fleet Premium is selected
                            ]}
                        >
                            Fleet Premium
                        </Text>
                    </TouchableOpacity>

                    {/* Button for Fleet Mini vehicle */}
                    <TouchableOpacity
                        style={[
                            style.vehicleButton, // Default button styling
                            selectedVehicle === "FleetMini" && style.selectedVehicleButton, // Apply selected styling if Fleet Mini is selected
                            (!pickupLocation || !dropOffLocation) && style.disabledButton, // Apply disabled styling if either location is not selected
                        ]}
                        onPress={() => {
                            vehicles("FleetMini"); // Call vehicles function with Fleet Mini as argument
                        }}
                        disabled={!pickupLocation || !dropOffLocation} // Disable button if locations are not selected
                    >
                        <Image
                            style={style.vehicleImage} // Apply styling to vehicle image
                            source={require("../../assets/images/fleet/FleetMini.png")} // Path to the Fleet Mini image
                        />
                        <Text
                            style={[
                                style.vehicleButtonText, // Default button text styling
                                selectedVehicle === "FleetMini" &&
                                style.vehicleButtonTextSelected, // Apply selected text styling if Fleet Mini is selected
                            ]}
                        >
                            Fleet Mini
                        </Text>
                    </TouchableOpacity>

                    {/* Button for Rickshaw vehicle */}
                    <TouchableOpacity
                        style={[
                            style.vehicleButton, // Default button styling
                            selectedVehicle === "Rickshaw" && style.selectedVehicleButton, // Apply selected styling if Rickshaw is selected
                            (!pickupLocation || !dropOffLocation) && style.disabledButton, // Apply disabled styling if either location is not selected
                        ]}
                        onPress={() => {
                            vehicles("Rickshaw"); // Call vehicles function with Rickshaw as argument
                        }}
                        disabled={!pickupLocation || !dropOffLocation} // Disable button if locations are not selected
                    >
                        <Image
                            style={style.vehicleImage} // Apply styling to vehicle image
                            source={require("../../assets/images/fleet/Rickshaw.png")} // Path to the Rickshaw image
                        />
                        <Text
                            style={[
                                style.vehicleButtonText, // Default button text styling
                                selectedVehicle === "Rickshaw" &&
                                style.vehicleButtonTextSelected, // Apply selected text styling if Rickshaw is selected
                            ]}
                        >
                            Rickshaw
                        </Text>
                    </TouchableOpacity>

                    {/* Button for Bike vehicle */}
                    <TouchableOpacity
                        style={[
                            style.vehicleButton, // Default button styling
                            selectedVehicle === "Bike" && style.selectedVehicleButton, // Apply selected styling if Bike is selected
                            (!pickupLocation || !dropOffLocation) && style.disabledButton, // Apply disabled styling if either location is not selected
                        ]}
                        onPress={() => {
                            vehicles("Bike"); // Call vehicles function with Bike as argument
                        }}
                        disabled={!pickupLocation || !dropOffLocation} // Disable button if locations are not selected
                    >
                        <Image
                            style={style.vehicleImage} // Apply styling to vehicle image
                            source={require("../../assets/images/fleet/Bike.png")} // Path to the Bike image
                        />
                        <Text
                            style={[
                                style.vehicleButtonText, // Default button text styling
                                selectedVehicle === "Bike" && style.vehicleButtonTextSelected, // Apply selected text styling if Bike is selected
                            ]}
                        >
                            Bike
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Render pickup location input field if no pickup location is selected */}
                {!pickupLocation && (
                    <TextInput
                        placeholder="Search Pickup location" // Placeholder text for the input field
                        onChangeText={findingPickupLocation} // Function to call when text changes
                        value={pickupInput} // Value of the input field
                        style={style.input} // Apply styling to the input field
                    />
                )}
                {/* Render search results for pickup location if available and no pickup location is selected */}
                {searchResult && !pickupLocation && (
                    <View style={style.searchResultContainer}>
                        {searchResult.map((item, index) => (
                            <TouchableOpacity
                                key={index} // Unique key for each item
                                onPress={() => {
                                    setPickupLocation(item); // Set the selected pickup location
                                    setPickupInput(""); // Clear the input field
                                }}
                            >
                                <Text style={style.searchResultText}>
                                    {item.name} | {item.location.formatted_address}{" "}
                                    {/*Display name and address of the search result */}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Render selected pickup location details if a pickup location is selected */}
                {pickupLocation && (
                    <View style={style.selectedLocationContainer}>
                        <Text style={style.selectedLocationText}>
                            Pickup Location:{" "}
                            {pickupLocation.name.split(" ").slice(0, 2).join(" ")}
                            {/*Displaythe first two words of the pickup location name */}
                        </Text>
                        <TouchableOpacity onPress={removePickup} style={style.removeButton}>
                            <Text style={style.removeButtonText}>Remove</Text>
                            {/* Button toremove the pickup location */}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Render drop-off location input field if no drop-off location is selected */}
                {!dropOffLocation && (
                    <TextInput
                        placeholder="Search DropOff location" // Placeholder text for the input field
                        onChangeText={findingDropOffLocation} // Function to call when text changes
                        value={dropOffInput} // Value of the input field
                        style={style.input} // Apply styling to the input field
                    />
                )}
                {/* Render search results for drop-off location if available and no drop-off location is selected */}
                {dropResult && !dropOffLocation && (
                    <View style={style.searchResultContainer}>
                        {dropResult.map((item, index) => (
                            <TouchableOpacity
                                key={index} // Unique key for each item
                                onPress={() => {
                                    setDropOffLocation(item); // Set the selected drop-off location
                                    setDropOffInput(""); // Clear the input field
                                }}
                            >
                                <Text style={style.searchResultText}>
                                    {item.name} | {item.location.formatted_address}
                                    {/* // Display name and address of the search result */}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Render selected drop-off location details if a drop-off location is selected */}
                {dropOffLocation && (
                    <View style={style.selectedLocationContainer}>
                        <Text style={style.selectedLocationText}>
                            DropOff Location:
                            {dropOffLocation.name.split(" ").slice(0, 2).join(" ")}
                            {/*  Display the first two words of the drop-off location name */}
                        </Text>
                        <TouchableOpacity
                            onPress={removeDropOff} // Function to call when the remove button is pressed
                            style={style.removeButton} // Apply styling to the remove button
                        >
                            <Text style={style.removeButtonText}>Remove</Text>
                            {/* // Button to remove the drop-off location */}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Display the fare */}
                <Text style={style.fareText}>Your Fare is PKR:{fare}</Text>
                {/* Button to find a ride */}
                <TouchableOpacity style={getButtonStyle()} onPress={addLoc}>
                    <Text style={style.findingRideText}>{getButtonText()}</Text>
                    {/* // Text on the button */}
                </TouchableOpacity>
            </View>
        </View>
    );
}

//
//
//
// return (
//     <View style={tailwind('flex-1')}>
//         {location && (
//             <MapView
//                 style={tailwind('flex-1')}
//                 region={{
//                     latitude: pickupLocation
//                         ? pickupLocation.geocodes.main.latitude
//                         : location.coords.latitude,
//                     longitude: pickupLocation
//                         ? pickupLocation.geocodes.main.longitude
//                         : location.coords.longitude,
//                     latitudeDelta: pickupLocation ? 0.01 : 0.0032,
//                     longitudeDelta: pickupLocation ? 0.05 : 0.0001,
//                 }}
//             >
//                 {pickupLocation && (
//                     <Marker
//                         coordinate={{
//                             latitude: pickupLocation.geocodes.main.latitude,
//                             longitude: pickupLocation.geocodes.main.longitude,
//                         }}
//                         title="Pickup Location"
//                         pinColor="green"
//                     />
//                 )}

//                 {dropOffLocation && (
//                     <Marker
//                         coordinate={{
//                             latitude: dropOffLocation.geocodes.main.latitude,
//                             longitude: dropOffLocation.geocodes.main.longitude,
//                         }}
//                         title="Drop-Off Location"
//                         description={dropOffLocation.location.formatted_address}
//                     />
//                 )}

//                 {pickupLocation && dropOffLocation && (
//                     <Polyline
//                         coordinates={[
//                             {
//                                 latitude: pickupLocation.geocodes.main.latitude,
//                                 longitude: pickupLocation.geocodes.main.longitude,
//                             },
//                             {
//                                 latitude: dropOffLocation.geocodes.main.latitude,
//                                 longitude: dropOffLocation.geocodes.main.longitude,
//                             },
//                         ]}
//                         strokeColor="#23B5D3"
//                         strokeWidth={4}
//                     />
//                 )}
//             </MapView>
//         )}
//         <View style={tailwind('p-4 bg-white')}>
//             <Image
//                 source={require('../../assets/images/fleet/Go_fleet-removebg-preview.png')}
//                 style={tailwind('h-16 w-auto')}
//             />
//             <View style={tailwind('flex-row justify-between')}>
//                 {['FleetPremium', 'FleetMini', 'Rickshaw', 'Bike'].map((vehicle) => (
//                     <TouchableOpacity
//                         key={vehicle}
//                         style={[
//                             tailwind('bg-gray-200 p-2 m-1 rounded'),
//                             selectedVehicle === vehicle && tailwind('bg-blue-500'),
//                             (!pickupLocation || !dropOffLocation) && tailwind('opacity-50'),
//                         ]}
//                         onPress={() => vehicles(vehicle)}
//                         disabled={!pickupLocation || !dropOffLocation}
//                     >
//                         <Image
//                             style={tailwind('h-12 w-auto')}
//                             source={require(`../../assets/images/fleet/${vehicle}.png`)}
//                         />
//                         <Text style={tailwind('text-center')}>
//                             {vehicle.replace('Fleet', '')}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//             {!pickupLocation && (
//                 <TextInput
//                     placeholder="Search Pickup location"
//                     onChangeText={findingPickupLocation}
//                     value={pickupInput}
//                     style={tailwind('border p-2 mt-2')}
//                 />
//             )}
//             {searchResult && !pickupLocation && (
//                 <View style={tailwind('bg-gray-100 mt-1')}>
//                     {searchResult.map((item, index) => (
//                         <TouchableOpacity
//                             key={index}
//                             onPress={() => {
//                                 setPickupLocation(item);
//                                 setPickupInput('');
//                             }}
//                         >
//                             <Text style={tailwind('p-2')}>
//                                 {item.name} | {item.location.formatted_address}
//                             </Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//             )}
//             {pickupLocation && (
//                 <View style={tailwind('flex-row justify-between mt-2')}>
//                     <Text>
//                         Pickup Location: {pickupLocation.name.split(' ').slice(0, 2).join(' ')}
//                     </Text>
//                     <TouchableOpacity onPress={removePickup}>
//                         <Text style={tailwind('text-red-500')}>Remove</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}
//             {!dropOffLocation && (
//                 <TextInput
//                     placeholder="Search DropOff location"
//                     onChangeText={findingDropOffLocation}
//                     value={dropOffInput}
//                     style={tailwind('border p-2 mt-2')}
//                 />
//             )}
//             {dropResult && !dropOffLocation && (
//                 <View style={tailwind('bg-gray-100 mt-1')}>
//                     {dropResult.map((item, index) => (
//                         <TouchableOpacity
//                             key={index}
//                             onPress={() => {
//                                 setDropOffLocation(item);
//                                 setDropOffInput('');
//                             }}
//                         >
//                             <Text style={tailwind('p-2')}>
//                                 {item.name} | {item.location.formatted_address}
//                             </Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//             )}
//             {dropOffLocation && (
//                 <View style={tailwind('flex-row justify-between mt-2')}>
//                     <Text>
//                         DropOff Location: {dropOffLocation.name.split(' ').slice(0, 2).join(' ')}
//                     </Text>
//                     <TouchableOpacity onPress={removeDropOff}>
//                         <Text style={tailwind('text-red-500')}>Remove</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}
//             <Text style={tailwind('mt-2')}>Your Fare is PKR: {fare}</Text>
//             <TouchableOpacity style={getButtonStyle()} onPress={addLoc}>
//                 <Text style={tailwind('text-white')}>{getButtonText()}</Text>
//             </TouchableOpacity>
//         </View>
//     </View>
// );
// };

// export default HomeScreen;