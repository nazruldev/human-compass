import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Check, Circle } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

type Plan = "monthly" | "yearly";

type PremiumSubscriptionSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubscribe: (plan: Plan) => void;
  isSubscribing?: boolean;
  snapPoints?: number[];
  title?: string;
  description?: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  benefits?: readonly string[];
};

const DEFAULT_BENEFITS = [
  "Unlimited readings",
  "In-depth interpretation for each hexagram",
  "Personalized guidance based on your questions",
  "Save and revisit your past readings",
] as const;

export function PremiumSubscriptionSheet({
  isVisible,
  onClose,
  onSubscribe,
  isSubscribing = false,
  snapPoints = [0.8, 1],
  title = "You've completed 10 free readings",
  description = "Unlock unlimited questions and deeper interpretations with Premium access.",
  monthlyPrice = "Rp 100.000",
  yearlyPrice = "Rp 1.000.000",
  benefits = DEFAULT_BENEFITS,
}: PremiumSubscriptionSheetProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<Plan>("monthly");

  return (
    <BottomSheet
      style={{ backgroundColor: "#E8D7D0" }}
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={snapPoints}
    >
      <View className="gap-3">
        <Text variant="subtitle" className="text-center" darkColor="black">
          {title}
        </Text>
        <Text className="text-center" darkColor="black" variant="caption">
          {description}
        </Text>
        <View className="px-5 gap-2">
          <Pressable
            onPress={() => setSelectedPlan("monthly")}
            style={{
              borderWidth: selectedPlan === "monthly" ? 2 : 1,
              borderColor: "#171717",
              borderRadius: 14,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text darkColor="black" style={{ fontSize: 18 }}>
                Monthly
              </Text>
              <View className="flex-row items-end gap-1">
                <Text
                  darkColor="black"
                  style={{ fontSize: 20, fontFamily: "Poppins_700Bold" }}
                >
                  {monthlyPrice}
                </Text>
                <Text darkColor="black" style={{ marginBottom: 3 }}>
                  /month
                </Text>
              </View>
            </View>
            {selectedPlan === "monthly" ? (
              <Check size={18} color="#000" />
            ) : (
              <Circle size={18} color="#000" />
            )}
          </Pressable>

          <Pressable
            onPress={() => setSelectedPlan("yearly")}
            style={{
              borderWidth: selectedPlan === "yearly" ? 2 : 1,
              borderColor: "#171717",
              borderRadius: 14,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text darkColor="black" style={{ fontSize: 18 }}>
                Yearly
              </Text>
              <View className="flex-row items-end gap-1">
                <Text
                  darkColor="black"
                  style={{ fontSize: 20, fontFamily: "Poppins_700Bold" }}
                >
                  {yearlyPrice}
                </Text>
                <Text darkColor="black" style={{ marginBottom: 3 }}>
                  /year
                </Text>
              </View>
            </View>
            {selectedPlan === "yearly" ? (
              <Check size={18} color="#000" />
            ) : (
              <Circle size={18} color="#000" />
            )}
          </Pressable>

          <View
            style={{
              borderWidth: 1,
              borderColor: "#171717",
              borderRadius: 14,
              padding: 12,
              gap: 8,
            }}
          >
            {benefits.map((item) => (
              <View key={item} className="flex-row items-start gap-3">
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#000",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <Check size={12} color="#fff" />
                </View>
                <Text darkColor="black" style={{ flex: 1 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ marginTop: 14 }} className="flex-row justify-center">
        <Button
          onPress={() => onSubscribe(selectedPlan)}
          loading={isSubscribing}
          disabled={isSubscribing}
        >
          Subscribe Now
        </Button>
      </View>
    </BottomSheet>
  );
}
