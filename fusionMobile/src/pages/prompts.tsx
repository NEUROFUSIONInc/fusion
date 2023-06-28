import RNBottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useEffect, useRef } from "react";
import { Image, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import {
  Button,
  CreatePromptSheet,
  Plus,
  PromptDetails,
  Screen,
} from "~/components";
import { usePrompts } from "~/hooks";
import colors from "~/theme/colors";
import { appInsights } from "~/utils";

export const PromptsScreen = () => {
  const { savedPrompts, loading } = usePrompts();
  const promptSheetRef = useRef<RNBottomSheet>(null);

  useEffect(() => {
    appInsights.trackPageView({
      name: "Prompts",
      properties: {
        prompt_count: savedPrompts?.length,
      },
    });
  }, [savedPrompts]);

  return (
    <Screen>
      {loading && <Text>Loading...</Text>}
      {!loading && savedPrompts?.length === 0 && (
        <View className="flex flex-1 flex-col gap-7 items-center justify-center">
          <Image source={require("../../assets/sticky-note.png")} />
          <Text className="font-sans-light max-w-xs text-center text-white text-base">
            Looks like you haven’t created any prompt. Click the button below to
            get started.
          </Text>
          <Button
            title="Create your first prompt"
            leftIcon={<Plus color={colors.dark} width={16} height={16} />}
            onPress={() => promptSheetRef.current?.expand()}
            className="self-center"
          />
        </View>
      )}
      {!loading && savedPrompts?.length > 0 && (
        <ScrollView className="flex mt-4 flex-col">
          {savedPrompts.map((prompt) => (
            <View key={prompt.uuid} className="my-2">
              <PromptDetails prompt={prompt} />
            </View>
          ))}
        </ScrollView>
      )}

      <Portal>
        <CreatePromptSheet promptSheetRef={promptSheetRef} />
      </Portal>
    </Screen>
  );
};
