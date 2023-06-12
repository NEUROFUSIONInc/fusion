import RNBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { BackdropPressBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { forwardRef, useCallback } from "react";
import { View } from "react-native";

import { Button, ButtonProps } from "../button";

import colors from "~/theme/colors";

export interface IBottomSheetProps extends BottomSheetProps {
  footerButtonTitle?: string;
  primaryButtonProps?: ButtonProps;
  onHandlePrimaryButtonPress?: () => void;
  renderFooter?: boolean;
  footer?: JSX.Element;
  renderBackdrop?: boolean;
  backdropPressBehavior?: BackdropPressBehavior;
}

export const BottomSheet = forwardRef<BottomSheetMethods, IBottomSheetProps>(
  (
    {
      snapPoints,
      children,
      renderBackdrop = true,
      backdropPressBehavior,
      renderFooter = false,
      footerButtonTitle,
      onHandlePrimaryButtonPress,
      primaryButtonProps,
      enablePanDownToClose = true,
      ...props
    },
    ref
  ) => {
    const renderBackdropComponent = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          opacity={0.74}
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={backdropPressBehavior}
        />
      ),
      []
    );

    const renderFooterComponent = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props}>
          <View className="fixed bottom-0 bg-secondary-800 border-tint border-t py-6 px-6">
            <Button
              title={footerButtonTitle}
              onPress={onHandlePrimaryButtonPress}
              fullWidth
              {...primaryButtonProps}
            />
          </View>
        </BottomSheetFooter>
      ),
      [primaryButtonProps]
    );

    return (
      <RNBottomSheet
        ref={ref}
        snapPoints={snapPoints}
        index={-1}
        animateOnMount
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop ? renderBackdropComponent : null}
        footerComponent={renderFooter ? renderFooterComponent : undefined}
        backgroundStyle={{
          backgroundColor: colors.secondary[800],
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.white,
          opacity: 0.35,
          width: 40,
        }}
        {...props}
      >
        {children}
      </RNBottomSheet>
    );
  }
);
