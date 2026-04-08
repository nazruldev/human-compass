import SocialLoginButton from "@/components/SocialLoginButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Image } from "@/components/ui/image";
import { ParallaxScrollView } from "@/components/ui/parallax-scrollview";
import { Text } from "@/components/ui/text";
import { env } from "@/config";
import { useColor } from "@/hooks/useColor";

import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Alert, Linking, View } from "react-native";
export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  useWarmUpBrowser();
  const [checked, setChecked] = useState(false);
  const termsUrl = env.termsOfServiceUrl;
  const primaryColor = useColor("primary");

  const openTerms = async () => {
    if (!termsUrl) {
      Alert.alert("Terms unavailable", "Terms URL is not configured.");
      return;
    }
    const supported = await Linking.canOpenURL(termsUrl);
    if (!supported) {
      Alert.alert("Cannot open link", "Please try again later.");
      return;
    }
    await Linking.openURL(termsUrl);
  };

  return (
    <View className="flex-1">
      <ParallaxScrollView
        headerHeight={500}
        contentBackgroundColor="black"
        headerImage={
          <View style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              source={require("@/assets/background/main.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "black"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "50%",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                right: 20,
              }}
            >
              <Text
                variant="title"
                style={{
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 1, height: 1 },
                  lineHeight: 32,
                  textShadowRadius: 2,
                }}
              >
                Login on Human Compass
              </Text>
              <Text variant="body" lightColor="white">
                Welcome back! Please login to your account.
              </Text>
            </View>
          </View>
        }
      >
        <View className="flex-col gap-5">
          <View className="flex-row items-start gap-2">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <Text variant="caption" lightColor={primaryColor}>
              I have read and agree to the{" "}
              <Text
                variant="caption"
                style={{ textDecorationLine: "underline", color: primaryColor }}
                onPress={() => void openTerms()}
              >
                Terms and Conditions
              </Text>
              .
            </Text>
          </View>
          <View className="flex-col gap-2">
            <SocialLoginButton strategy="facebook" disabled={!checked} />
            <SocialLoginButton strategy="google" disabled={!checked} />
            <SocialLoginButton strategy="apple" disabled={!checked} />
          </View>
        </View>
      </ParallaxScrollView>
    </View>
  );
};

export default AuthScreen;
