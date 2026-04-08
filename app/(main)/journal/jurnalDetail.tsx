import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useColor } from "@/hooks/useColor";
import { getBackImageUrl } from "@/services/hexagramService";
import { getJournalEntry } from "@/services/journalService";
import { BORDER_RADIUS } from "@/theme/globals";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CircleQuestionMark,
  Megaphone,
  Sparkles,
} from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JurnalDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const detailQuery = useQuery({
    queryKey: ["journal-entry", id],
    queryFn: () => getJournalEntry(id as string),
    enabled: !!id,
  });

  const entry = detailQuery.data;
  const isLoading = detailQuery.isLoading;
  const primary = useColor("primary");
  const imageSource =
    entry?.hexagram_number && entry.hexagram_number > 0
      ? { uri: String(getBackImageUrl(entry.hexagram_number)) }
      : require("@/assets/background/bg-card.png");

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 px-5 pt-16">
      <View className="w-full flex-row items-center gap-2">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon name={ArrowLeft} size={20} lightColor="white" />
        </Button>
        <Text variant="subtitle" lightColor="white">
          Journal Detail
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            paddingTop: 40,
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            style={{ borderWidth: 1, borderColor: primary }}
            source={imageSource}
            height={250}
            width={150}
            contentFit="fill"
          />
          {isLoading ? (
            <Skeleton width={140} height={36} variant="rounded" />
          ) : (
            <Button variant="outline">
              {entry?.answer_type ?? "Guidance"}
            </Button>
          )}
        </View>

        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "rgba(0,0,0,0.35)",
            borderRadius: BORDER_RADIUS,
          }}
        >
          <Accordion
            type="multiple"
            collapsible
            defaultValue={["question", "guidance", "seasonal"]}
          >
            <AccordionItem value="question">
              <AccordionTrigger>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#FF9500",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={CircleQuestionMark} size={16} color="#fff" />
                  </View>
                  <Text variant="subtitle" lightColor="white">
                    Your Question
                  </Text>
                </View>
              </AccordionTrigger>
              <AccordionContent style={{ paddingLeft: 0, paddingTop: 8 }}>
                {isLoading ? (
                  <View style={{ gap: 10, paddingTop: 2 }}>
                    <Skeleton height={14} />
                    <Skeleton height={14} width="92%" />
                  </View>
                ) : (
                  <Text variant="body" lightColor="white">
                    {entry?.question?.trim() || "—"}
                  </Text>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="guidance">
              <AccordionTrigger>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#FF9500",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={Megaphone} size={16} color="#fff" />
                  </View>
                  <Text variant="subtitle" lightColor="white">
                    Your Answer
                  </Text>
                </View>
              </AccordionTrigger>
              <AccordionContent style={{ paddingLeft: 0, paddingTop: 8 }}>
                <View style={{ maxWidth: 400, alignSelf: "center" }}>
                  {isLoading ? (
                    <Skeleton
                      height={38}
                      width={220}
                      variant="rounded"
                      style={{ alignSelf: "center", marginBottom: 8 }}
                    />
                  ) : (
                    <Button variant="secondary" style={{ marginBottom: 8 }}>
                      {entry?.hexagram_name ?? "Hexagram"}
                    </Button>
                  )}
                </View>
                {isLoading ? (
                  <View style={{ gap: 10, paddingTop: 4 }}>
                    <Skeleton height={14} />
                    <Skeleton height={14} width="94%" />
                    <Skeleton height={14} width="90%" />
                    <Skeleton height={14} width="86%" />
                  </View>
                ) : (
                  <Text
                    lightColor="white"
                    style={{ opacity: 0.9, lineHeight: 22 }}
                  >
                    {entry?.response ||
                      entry?.description ||
                      "No response available."}
                  </Text>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="seasonal">
              <AccordionTrigger>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#FF9500",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={Sparkles} size={16} color="#fff" />
                  </View>
                  <Text variant="subtitle" lightColor="white">
                    Seasonal Guidance
                  </Text>
                </View>
              </AccordionTrigger>
              <AccordionContent style={{ paddingLeft: 0, paddingTop: 8 }}>
                {isLoading ? (
                  <View style={{ gap: 10, paddingTop: 4 }}>
                    <Skeleton height={14} width="70%" />
                    <Skeleton height={14} width="88%" />
                  </View>
                ) : (
                  <Text
                    lightColor="white"
                    style={{ opacity: 0.9, lineHeight: 22 }}
                  >
                    {entry?.season
                      ? `Season: ${entry.season}`
                      : "Seasonal guidance will appear when available."}
                  </Text>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
