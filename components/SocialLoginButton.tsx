import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";

const SocialLoginButton = ({
  strategy,
  disabled = false,
}: {
  strategy: "facebook" | "google" | "apple";
  disabled?: boolean;
}) => {
  const getStrategy = () => {
    if (strategy === "facebook") {
      return "oauth_facebook";
    } else if (strategy === "google") {
      return "oauth_google";
    } else if (strategy === "apple") {
      return "oauth_apple";
    }
    return "oauth_facebook";
  };

  const { startOAuthFlow } = useOAuth({ strategy: getStrategy() });
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const buttonText = () => {
    if (isLoading) {
      return "Loading...";
    }

    if (strategy === "facebook") {
      return "Continue with Facebook";
    } else if (strategy === "google") {
      return "Continue with Google";
    } else if (strategy === "apple") {
      return "Continue with Apple";
    }
  };

  const buttonIcon = () => {
    if (strategy === "facebook") {
      return <Ionicons name="logo-facebook" size={24} color="#1977F3" />;
    } else if (strategy === "google") {
      return <Ionicons name="logo-google" size={24} color="#DB4437" />;
    } else if (strategy === "apple") {
      return <Ionicons name="logo-apple" size={24} color="black" />;
    }
  };

  const onSocialLoginPress = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/sso-callback", {
          scheme: "humancompass",
        }),
      });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        await user?.reload();
      } else {
        // Use signIn or signUp returned from startOAuthFlow
        // for next steps, such as MFA
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow, user]);

  return (
    <Button
      variant="secondary"
      onPress={onSocialLoginPress}
      disabled={isLoading || disabled}
      size="lg"
      style={{ borderRadius: 10 }}
    >
      {isLoading ? <Spinner /> : buttonIcon()}
      <Text variant="body" darkColor="black">
        {buttonText()}
      </Text>
      <View />
    </Button>
  );
};

export default SocialLoginButton;
