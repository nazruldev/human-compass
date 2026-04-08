import { PremiumSubscriptionSheet } from "@/components/premium/premium-subscription-sheet";
import CongratulationIcon from "@/components/svgIcons/congratsIcon";
import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import { useUser } from "@clerk/clerk-expo";
import React from "react";
import { Alert, View } from "react-native";

type Plan = "monthly" | "yearly";

type PremiumFlowContextValue = {
  openPremiumSheet: () => void;
  closePremiumSheet: () => void;
};

const PremiumFlowContext = React.createContext<PremiumFlowContextValue | null>(
  null,
);

export function usePremiumFlow() {
  const ctx = React.useContext(PremiumFlowContext);
  if (!ctx) {
    throw new Error("usePremiumFlow must be used inside PremiumFlowProvider");
  }
  return ctx;
}

export function PremiumFlowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [isPremiumSheetVisible, setPremiumSheetVisible] = React.useState(false);
  const [isSubscribingPremium, setIsSubscribingPremium] = React.useState(false);
  const subscribeSuccessDialog = useAlertDialog();

  const openPremiumSheet = React.useCallback(() => {
    setPremiumSheetVisible(true);
  }, []);

  const closePremiumSheet = React.useCallback(() => {
    setPremiumSheetVisible(false);
  }, []);

  const handleSubscribePremium = React.useCallback(
    (plan: Plan) => {
      if (isSubscribingPremium) return;
      setIsSubscribingPremium(true);
      void (async () => {
        try {
          // Placeholder behavior while subscription endpoint is not ready.
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const grantedLimit = plan === "yearly" ? 1000 : 100;

          if (!user) {
            throw new Error("User not found.");
          }

          const existingMeta =
            (user.unsafeMetadata as Record<string, unknown> | undefined) ?? {};
          await user.update({
            unsafeMetadata: {
              ...existingMeta,
              reflection_limit: grantedLimit,
            },
          });

          closePremiumSheet();
          subscribeSuccessDialog.open();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to activate premium.";
          Alert.alert("Subscription failed", message);
        } finally {
          setIsSubscribingPremium(false);
        }
      })();
    },
    [closePremiumSheet, isSubscribingPremium, subscribeSuccessDialog, user],
  );

  return (
    <PremiumFlowContext.Provider
      value={{ openPremiumSheet, closePremiumSheet }}
    >
      {children}
      <PremiumSubscriptionSheet
        isVisible={isPremiumSheetVisible}
        onClose={closePremiumSheet}
        onSubscribe={handleSubscribePremium}
        isSubscribing={isSubscribingPremium}
      />
      <AlertDialog
        isVisible={subscribeSuccessDialog.isVisible}
        onClose={subscribeSuccessDialog.close}
        showCancelButton={false}
        showConfirmButton={false}
        onConfirm={subscribeSuccessDialog.close}
      >
        <View style={{ alignItems: "center", paddingTop: 4 }}>
          <Text
            variant="subtitle-semibold"
            className="text-center"
            darkColor="black"
          >
            Welcome to Premium!
          </Text>
          <View className="py-5">
            <CongratulationIcon />
          </View>
          <Text
            variant="caption-small"
            className="text-center"
            darkColor="black"
          >
            Your monthly subscription is active - enjoy the full experience!
          </Text>
        </View>
      </AlertDialog>
    </PremiumFlowContext.Provider>
  );
}
