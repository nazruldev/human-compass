import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio";
import { Text } from "@/components/ui/text";
import { useColor } from "@/hooks/useColor";
import { CORNERS, FONT_SIZE, HEIGHT } from "@/theme/globals";
import { getAstrologicalInfo, toAstrologyMetadata } from "@/utils/astrology";
import {
  isValidYyyyMmDd,
  isoDateToDdMmYyyyDisplay,
  maskTime24,
} from "@/utils/birthMaskInput";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import MaskInput, { Masks } from "react-native-mask-input";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const primaryColor = useColor("primary");
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
  });
  const [birthDateMasked, setBirthDateMasked] = useState("");
  const [birthDateRaw, setBirthDateRaw] = useState("");
  const [birthTimeMasked, setBirthTimeMasked] = useState("");
  const [birthTimeRaw, setBirthTimeRaw] = useState("");
  const [birthDateFocused, setBirthDateFocused] = useState(false);
  const [birthTimeFocused, setBirthTimeFocused] = useState(false);
  const birthDateInputRef = useRef<React.ComponentRef<typeof MaskInput>>(null);
  const birthTimeInputRef = useRef<React.ComponentRef<typeof MaskInput>>(null);

  const muted = useColor("textMuted");
  const borderColor = useColor("border");
  const primary = useColor("primary");
  const danger = useColor("red");

  useEffect(() => {
    if (!isLoaded || !user) return;
    const meta = user.unsafeMetadata as Record<string, unknown> | undefined;
    const genderVal = String(meta?.gender ?? "");
    const bd = meta?.birthDate as string | undefined;
    const bt = meta?.birthTime as string | undefined;

    if (bd) {
      const { masked, raw } = isoDateToDdMmYyyyDisplay(bd);
      setBirthDateMasked(masked);
      setBirthDateRaw(raw);
    } else {
      setBirthDateMasked("");
      setBirthDateRaw("");
    }
    if (bt) {
      setBirthTimeMasked(bt);
      setBirthTimeRaw(bt.replace(/\D/g, ""));
    } else {
      setBirthTimeMasked("");
      setBirthTimeRaw("");
    }

    setFormData((prev) => ({
      ...prev,
      name: user.fullName || prev.name,
      gender: genderVal || prev.gender,
    }));
  }, [isLoaded, user]);

  const onSubmit = async () => {
    setErrors({});
    if (!user) {
      setErrors((e) => ({
        ...e,
        name: "You must be signed in to save.",
      }));
      return;
    }
    if (!formData.name.trim()) {
      setErrors((e) => ({ ...e, name: "Full name is required" }));
      return;
    }
    if (!formData.gender) {
      setErrors((e) => ({ ...e, gender: "Please select gender" }));
      return;
    }
    if (birthDateRaw.length !== 8) {
      setErrors((e) => ({
        ...e,
        birthDate: "Enter a complete birth date (DD/MM/YYYY)",
      }));
      return;
    }
    const dd = birthDateRaw.slice(0, 2);
    const mm = birthDateRaw.slice(2, 4);
    const yyyy = birthDateRaw.slice(4, 8);
    const yi = parseInt(yyyy, 10);
    const mi = parseInt(mm, 10);
    const di = parseInt(dd, 10);
    if (!isValidYyyyMmDd(yi, mi, di)) {
      setErrors((e) => ({
        ...e,
        birthDate: "Please enter a valid date",
      }));
      return;
    }
    const birthDateStr = `${yyyy}-${mm}-${dd}`;
    let birthTimeStr: string | null = null;
    if (birthTimeRaw.length > 0) {
      if (birthTimeRaw.length !== 4) {
        setErrors((e) => ({
          ...e,
          birthTime: "Enter time as HH:mm or leave empty",
        }));
        return;
      }
      const hh = birthTimeRaw.slice(0, 2);
      const min = birthTimeRaw.slice(2, 4);
      const hi = parseInt(hh, 10);
      const mini = parseInt(min, 10);
      if (hi > 23 || mini > 59) {
        setErrors((e) => ({ ...e, birthTime: "Invalid time" }));
        return;
      }
      birthTimeStr = `${hh}:${min}`;
    }

    const astrologyInfo = getAstrologicalInfo(birthDateStr, birthTimeStr);
    const astrology = astrologyInfo ? toAstrologyMetadata(astrologyInfo) : null;

    try {
      setIsLoading(true);
      const parts = formData.name.trim().split(" ");
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ") ?? "";
      const existingMeta =
        (user.unsafeMetadata as Record<string, unknown>) ?? {};
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...existingMeta,
          gender: formData.gender,
          birthDate: birthDateStr,
          birthTime: birthTimeStr,
          ...(astrology && {
            astrology: {
              animalSign: astrology.animalSign,
              element: astrology.element,
              polarity: astrology.polarity,
              hexagramId: astrology.hexagramId,
            },
          }),
        },
      });
      await user.reload();
      router.back();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      setErrors((e) => ({ ...e, name: msg || "An error occurred" }));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (birthDateRaw.length !== 8) {
      newErrors.birthDate = "Birth date is required";
    } else {
      const yi = parseInt(birthDateRaw.slice(4, 8), 10);
      const mi = parseInt(birthDateRaw.slice(2, 4), 10);
      const di = parseInt(birthDateRaw.slice(0, 2), 10);
      if (!isValidYyyyMmDd(yi, mi, di)) {
        newErrors.birthDate = "Please enter a valid date";
      }
    }
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (birthTimeRaw.length > 0 && birthTimeRaw.length !== 4) {
      newErrors.birthTime = "Complete time as HH:mm or clear the field";
    }
    if (birthTimeRaw.length === 4) {
      const hh = parseInt(birthTimeRaw.slice(0, 2), 10);
      const mini = parseInt(birthTimeRaw.slice(2, 4), 10);
      if (hh > 23 || mini > 59) {
        newErrors.birthTime = "Invalid time";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    void onSubmit();
  };

  const clearError = (field: string) =>
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });

  const handlePickAvatar = async () => {
    if (!user || isUploadingAvatar) return;
    try {
      setIsUploadingAvatar(true);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow photo access to update your profile avatar.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      };

      await (user as any).setProfileImage({ file });
      await user.reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Could not update avatar", msg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center ">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const birthDateBorder =
    errors.birthDate || birthDateFocused ? primary : borderColor;
  const birthTimeBorder =
    errors.birthTime || birthTimeFocused ? primary : borderColor;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 ">
      <View className="flex-row items-center gap-2  px-5 py-4">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon name={ArrowLeft} lightColor="white" />
        </Button>
        <Text variant="subtitle" lightColor="white">
          Edit Your Account
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 mt-10 flex-col gap-2 items-center relative">
          <Avatar
            style={{ borderWidth: 3, borderColor: primaryColor }}
            size={150}
          >
            {user?.imageUrl ? (
              <AvatarImage source={{ uri: user.imageUrl }} />
            ) : (
              <AvatarFallback>
                {user?.firstName?.[0] ??
                  user?.emailAddresses?.[0]?.emailAddress?.[0] ??
                  "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <Pressable
            onPress={() => void handlePickAvatar()}
            disabled={isUploadingAvatar}
            style={{
              position: "absolute",
              right: "30%",
              bottom: 6,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: primaryColor,
              alignItems: "center",
              justifyContent: "center",
              opacity: isUploadingAvatar ? 0.7 : 1,
            }}
          >
            {isUploadingAvatar ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={16} color="#fff" />
            )}
          </Pressable>
        </View>
        <Input
          label="Full name"
          placeholder="Enter your full name"
          value={formData.name}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, name: text }));
            clearError("name");
          }}
          error={errors.name}
          inputStyle={{ color: "white" }}
          labelStyle={{ color: "white" }}
          errorStyle={{ color: "red" }}
          placeholderTextColor="rgba(255,255,255,0.5)"
          variant="outline"
          containerStyle={{ marginBottom: 16 }}
        />

        <RadioGroup
          orientation="horizontal"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
          value={formData.gender}
          onValueChange={(v) => {
            setFormData((prev) => ({ ...prev, gender: v }));
            clearError("gender");
          }}
          optionStyle={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: errors.gender ? "red" : "rgba(255,255,255,0.5)",
            borderRadius: 999,
            justifyContent: "center",
          }}
          labelStyle={{
            fontSize: 14,
            fontWeight: "500",
            color: "white",
          }}
        />
        {errors.gender ? (
          <Text variant="caption" style={{ color: "red", marginTop: 4 }}>
            {errors.gender}
          </Text>
        ) : null}

        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <Pressable
            onPress={() => birthDateInputRef.current?.focus()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              minHeight: HEIGHT,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderRadius: CORNERS,
              borderColor: errors.birthDate ? danger : birthDateBorder,
              backgroundColor: "transparent",
            }}
          >
            <View
              style={{
                width: 120,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                padding: 8,
              }}
              pointerEvents="none"
            >
              <Icon
                name={Calendar}
                size={16}
                color={errors.birthDate ? danger : muted}
              />
              <Text
                variant="caption"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: errors.birthDate ? danger : muted }}
              >
                Birth date
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <MaskInput
                ref={birthDateInputRef}
                value={birthDateMasked}
                onChangeText={(masked, raw) => {
                  setBirthDateMasked(masked);
                  setBirthDateRaw(raw);
                  clearError("birthDate");
                }}
                mask={Masks.DATE_DDMMYYYY}
                keyboardType="number-pad"
                placeholder="DD/MM/YYYY"
                placeholderTextColor="rgba(255,255,255,0.5)"
                selectionColor={primary}
                onFocus={() => setBirthDateFocused(true)}
                onBlur={() => setBirthDateFocused(false)}
                style={{
                  flex: 1,
                  fontFamily: "Poppins_400Regular",
                  fontSize: FONT_SIZE,
                  color: "#ffffff",
                  paddingVertical: 0,
                  textAlignVertical: "center",
                }}
              />
            </View>
          </Pressable>
        </View>
        {errors.birthDate ? (
          <Text
            variant="caption"
            style={{
              marginLeft: 14,
              marginTop: 4,
              marginBottom: 8,
              color: danger,
            }}
          >
            {errors.birthDate}
          </Text>
        ) : null}

        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <Pressable
            onPress={() => birthTimeInputRef.current?.focus()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              minHeight: HEIGHT,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderRadius: CORNERS,
              borderColor: errors.birthTime ? danger : birthTimeBorder,
              backgroundColor: "transparent",
            }}
          >
            <View
              style={{
                width: 120,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                padding: 8,
              }}
              pointerEvents="none"
            >
              <Icon
                name={Clock}
                size={16}
                color={errors.birthTime ? danger : muted}
              />
              <Text
                variant="caption"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: errors.birthTime ? danger : muted }}
              >
                Birth time
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <MaskInput
                ref={birthTimeInputRef}
                value={birthTimeMasked}
                onChangeText={(masked, raw) => {
                  setBirthTimeMasked(masked);
                  setBirthTimeRaw(raw);
                  clearError("birthTime");
                }}
                mask={maskTime24}
                keyboardType="number-pad"
                placeholder="HH:mm · optional"
                placeholderTextColor="rgba(255,255,255,0.5)"
                selectionColor={primary}
                onFocus={() => setBirthTimeFocused(true)}
                onBlur={() => setBirthTimeFocused(false)}
                style={{
                  flex: 1,
                  fontFamily: "Poppins_400Regular",
                  fontSize: FONT_SIZE,
                  color: "#ffffff",
                  paddingVertical: 0,
                  textAlignVertical: "center",
                }}
              />
            </View>
          </Pressable>
        </View>
        {errors.birthTime ? (
          <Text
            variant="caption"
            style={{ marginLeft: 14, marginTop: 4, color: danger }}
          >
            {errors.birthTime}
          </Text>
        ) : null}

        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          style={{ marginTop: 8 }}
        >
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
