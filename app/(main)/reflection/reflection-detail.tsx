import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useJournalEntry } from "@/hooks/api/useJournalEntries";
import { useColor } from "@/hooks/useColor";
import { getBackImageUrl } from "@/services/hexagramService";
import { BORDER_RADIUS } from "@/theme/globals";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  CircleQuestionMark,
  Megaphone,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import { BackHandler, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const emptyStateBox = {
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  padding: 24,
  gap: 16,
};

const ReflectionDetailScreen = () => {
  const router = useRouter();
  const { isVisible, open, close } = useAlertDialog();
  const primaryColor = useColor("primary");
  const dialogCardBg = useColor("secondary");
  const params = useLocalSearchParams<{ journalId?: string | string[] }>();

  const journalId = Array.isArray(params.journalId)
    ? params.journalId[0]
    : params.journalId;

  const journalQuery = useJournalEntry(journalId);
  const entry = journalQuery.data;

  const isLoading = !!journalId && journalQuery.isPending;
  const loadFailed = !!journalId && journalQuery.isError;
  const notFound =
    !!journalId && !journalQuery.isPending && !journalQuery.isError && !entry;

  const display = React.useMemo(() => {
    if (!entry) {
      return {
        question: "—",
        title: "Hexagram",
        answerType: "Guidance",
        answerText: "",
        season: "",
      };
    }
    const n = entry.hexagram_number ?? 0;
    return {
      question: entry.question?.trim() ? entry.question : "—",
      title: entry.hexagram_name ?? (n > 0 ? `Hexagram ${n}` : "Hexagram"),
      answerType: entry.answer_type ?? "Guidance",
      answerText: entry.response ?? entry.description ?? "",
      season: entry.season?.trim() ?? "",
    };
  }, [entry]);

  const imageSource = React.useMemo(() => {
    const n = entry?.hexagram_number;
    if (n && n > 0) {
      return { uri: String(getBackImageUrl(n)) };
    }
    return require("@/assets/background/bg-card.png");
  }, [entry?.hexagram_number]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        open();
        return true;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => sub.remove();
    }, [open]),
  );
  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1  px-5 pt-16">
      {/* HEADER */}
      <View className="w-full flex-row items-center gap-1">
        <Button size="icon" variant="ghost" onPress={() => open()}>
          <Icon name={ArrowLeftIcon} size={20} lightColor="white" />
        </Button>

        <Text variant="subtitle" lightColor="white">
          Reflection Detail
        </Text>
      </View>
      {!journalId ? (
        <View style={emptyStateBox}>
          <Text
            variant="body"
            lightColor="white"
            style={{ textAlign: "center" }}
          >
            No journal entry was opened. Go back and try again.
          </Text>
          <Button onPress={() => router.back()}>Go back</Button>
        </View>
      ) : loadFailed ? (
        <View style={emptyStateBox}>
          <Text
            variant="body"
            lightColor="white"
            style={{ textAlign: "center" }}
          >
            Could not load this reflection. Check your connection and try again.
          </Text>
          <Button onPress={() => void journalQuery.refetch()}>Try again</Button>
          <Button variant="outline" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      ) : notFound ? (
        <View style={emptyStateBox}>
          <Text
            variant="body"
            lightColor="white"
            style={{ textAlign: "center" }}
          >
            This journal entry could not be found.
          </Text>
          <Button onPress={() => router.replace("/reflection")}>
            Back to Reflection
          </Button>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={journalQuery.isRefetching}
              onRefresh={() => void journalQuery.refetch()}
            />
          }
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
              style={{ borderWidth: 1, borderColor: primaryColor }}
              source={imageSource}
              height={250}
              width={150}
              contentFit="fill"
            />
            {isLoading ? (
              <Skeleton width={140} height={36} variant="rounded" />
            ) : (
              <Button variant="outline">{display.answerType}</Button>
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
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
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
                      {display.question}
                    </Text>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="guidance">
                <AccordionTrigger>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
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
                        {display.title}
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
                      {display.answerText || "—"}
                    </Text>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="seasonal">
                <AccordionTrigger>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
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
                      {display.season
                        ? `Season: ${display.season}`
                        : "Seasonal guidance will appear when available."}
                    </Text>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              alignSelf: "center",
              maxWidth: 400,
              marginTop: 16,
            }}
          >
            <Button onPress={() => open()} disabled={isLoading}>
              Ask Another Question
            </Button>
          </View>
        </ScrollView>
      )}

      <AlertDialog
        isVisible={isVisible}
        onClose={close}
        title="Back to Reflection?"
        description="Your current result will be closed."
        confirmText="Yes"
        style={{ backgroundColor: dialogCardBg }}
        cancelText="Cancel"
        onConfirm={() => router.replace("/reflection")}
      />
    </SafeAreaView>
  );
};

export default ReflectionDetailScreen;
