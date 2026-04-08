import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useHexagrams } from "@/hooks/api/useHexagrams";
import type { ImageSource } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryCardDetailScreen() {
  const router = useRouter();
  const { id, number: numParam } = useLocalSearchParams<{
    id: string;
    number?: string;
  }>();
  const { data } = useHexagrams();

  const hexagram = React.useMemo(() => {
    if (!data) return undefined;
    const byId = data.find((h) => h.id === id);
    if (byId) return byId;
    const num = numParam ? parseInt(numParam, 10) : NaN;
    return !isNaN(num) ? data.find((h) => h.number === num) : undefined;
  }, [data, id, numParam]);

  if (!hexagram) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-5">
          <Text className="">Hexagram not found</Text>
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="mt-4"
          >
            Go back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 relative">
      <View className="flex-row items-center justify-between  border-border px-5 py-4">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon name={ArrowLeft} size={24} lightColor="white" />
        </Button>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <Image
            cachePolicy="memory-disk"
            source={(hexagram.imageUrlBack ?? hexagram.imageUrl) as ImageSource}
            variant="rounded"
            width={150}
            aspectRatio={0.65}
            contentFit="fill"
          />
          <Text variant="caption" className="mt-2 " lightColor="white">
            {hexagram.chinese_name ? `${hexagram.chinese_name}` : ""}
          </Text>
          <Text variant="body" style={{ fontSize: 18 }} lightColor="white">
            {hexagram.name}
          </Text>
        </View>

        {hexagram.description ? (
          <View className="mb-4">
            <Text variant="caption" className="mb-1 " lightColor="white">
              Meaning
            </Text>
            <Text variant="body" lightColor="white">
              {hexagram.description}
            </Text>
          </View>
        ) : null}

        {hexagram.affirmation ? (
          <View className="mb-4">
            <Text variant="caption" className="mb-1 " lightColor="white">
              Affirmation
            </Text>
            <Text variant="body" lightColor="white">
              {hexagram.affirmation}
            </Text>
          </View>
        ) : null}

        {hexagram.movement_guidance ? (
          <View className="mb-4">
            <Text variant="caption" className="mb-1 " lightColor="white">
              Guidance
            </Text>
            <Text variant="body" lightColor="white">
              {hexagram.movement_guidance}
            </Text>
          </View>
        ) : null}

        {hexagram.asker_archetype ? (
          <View className="mb-4">
            <Text variant="caption" className="mb-1 " lightColor="white">
              Your Energy
            </Text>
            <Text variant="body" lightColor="white">
              {hexagram.asker_archetype}
            </Text>
          </View>
        ) : null}

        {hexagram.mythic_metaphor ? (
          <View className="mb-4">
            <Text variant="caption" className="mb-1 " lightColor="white">
              Mythic Metaphor
            </Text>
            <Text variant="body" lightColor="white">
              {hexagram.mythic_metaphor}
            </Text>
          </View>
        ) : null}

        {hexagram.archetype ? (
          <View className="mb-4">
            <Text variant="caption" lightColor="white" className="mb-1 ">
              Archetype
            </Text>
            <Text variant="body" lightColor="white">
              {hexagram.archetype}
            </Text>
          </View>
        ) : null}

        <Pressable
          className="flex justify-center items-center my-20"
          onPress={() => router.back()}
        >
          <Text variant="caption" className="text-muted-foreground">
            Tap here to close
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
