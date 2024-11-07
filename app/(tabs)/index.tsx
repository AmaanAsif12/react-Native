import { Image, StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import React from 'react';
import tw from 'twrnc';
import { Icon } from 'react-native-elements';
import { useRouter } from 'expo-router';

const data = [
  {
    id: "123",
    title: "Get a ride",
    image: "https://links.papareact.com/3pn",
    screen: "MapScreen"
  },
  {
    id: "456",
    title: "Order food",
    image: "https://links.papareact.com/28w",
    screen: "EatScreen"
  },
];

const NavOption = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={tw`bg-white h-full`}>
      <View style={tw`p-6`}>
        <Image
          style={{
            width: 100,
            height: 100,
            resizeMode: 'contain'
          }}
          source={{
            uri: 'https://links.papareact.com/gzs'
          }}
        />
        <FlatList
          data={data}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push('/CONFIG/Home')} // Use the screen property from item
              style={tw`p-2 pl-6 pb-8 pt-4 bg-gray-200 m-1 w-40`} // Adjusted width here
              accessibilityLabel={item.title} // Added accessibility label
            >
              <View>
                <Image
                  style={{ width: 120, height: 120, resizeMode: 'contain' }}
                  source={{ uri: item.image }}
                />
                <Text style={tw`mt-2 text-lg font-semibold`}>{item.title}</Text>
                <Icon
                  style={tw`p-2 bg-black rounded-full w-10 mt-4`}
                  name="arrowright"
                  color="white"
                  type="antdesign"
                />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default NavOption;
