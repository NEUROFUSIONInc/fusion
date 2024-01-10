import React from "react";
import { Image, View, Text } from "react-native";

export const Logo = () => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Image
        source={require("../../../assets/icon.png")}
        style={{ width: 35, height: 35 }}
      />
      <Text style={{ fontSize: 25, marginLeft: 10, fontWeight: "700" }}>
        FUSION
      </Text>
    </View>
  );
};
