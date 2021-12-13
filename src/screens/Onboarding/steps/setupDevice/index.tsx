import React, { useCallback, } from "react";
import { StyleSheet, Animated, SafeAreaView, View } from 'react-native';
import { useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import { Flex, Text, FlowStepper, Button, Icons, Transitions } from "@ledgerhq/native-ui";
import { RenderTransitionProps } from '@ledgerhq/native-ui/components/Navigation/FlowStepper';

import { ScreenName } from "../../../../const";
import { getSetupDeviceScenes } from "../../shared/infoPagesData";
import type { DeviceNames } from "../../types";
import {PlaceholderIllustrationTiny} from "../PlaceholderIllustration";
import { Intro } from './scenes';

const illustrations: Record<number, React.ReactNode> = {
  0: <PlaceholderIllustrationTiny />,
  1: <PlaceholderIllustrationTiny />,
  2: <PlaceholderIllustrationTiny />,
  3: <PlaceholderIllustrationTiny />,
  4: <PlaceholderIllustrationTiny />,
  5: <PlaceholderIllustrationTiny />,
};
const transitionDuration = 500;

const ImageHeader = ({
  activeIndex,
  onBack,
}: {
  activeIndex: number;
  onBack: (() => void);
}) => {
  const firstRender = React.useRef(true);
  const [Source, setSource] = React.useState(illustrations[activeIndex]);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const fadeIn = React.useMemo(
    () =>
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: transitionDuration,
        useNativeDriver: true,
      }),
    [fadeAnim]
  );
  const fadeOut = React.useMemo(
    () =>
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: transitionDuration,
        useNativeDriver: true,
      }),
    [fadeAnim]
  );

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    fadeOut.start(({ finished }) => {
      if (!finished) return;
      setSource(illustrations[activeIndex]);
      fadeIn.start();
    });

    return () => {
      fadeAnim.stopAnimation();
    };

  }, [fadeAnim, fadeIn, fadeOut, activeIndex]);

  return (
    <SafeAreaView style={[{ flex: 0.3 }, { backgroundColor: "hsla(248, 100%, 85%, 1)"}]}>
      <Flex flex={1} backgroundColor="primary.c60">
        <Flex alignItems="flex-start" width="100%" height={20}>
          <Button Icon={Icons.ArrowLeftMedium} onPress={onBack} />
        </Flex>
        <Flex
            flex={1}
            mb={30}
            mx={8}
            justifyContent="center"
            alignItems="center"
        >
            {Source}
        </Flex>
      </Flex>
    </SafeAreaView>
  );
};

const renderTransitionSlide = ({
  activeIndex,
  previousActiveIndex,
  status,
  duration,
  children,
}: RenderTransitionProps) => (
  <Transitions.Slide
    status={status}
    duration={duration}
    direction={(previousActiveIndex || 0) < activeIndex ? "left" : "right"}
    style={[StyleSheet.absoluteFill, { flex: 1 }]}
  >
    {children}
  </Transitions.Slide>
);

type CurrentRouteType = RouteProp<
  { params: { deviceModelId: DeviceNames } },
  "params"
>;

type SceneType = {
  title?: string,
  ctaLabel: string,
  onNext: () => void,
}
const Scene = ({title, ctaLabel, onNext}: SceneType) => {
  return (
    <Flex flex={1} justifyContent="space-between">
      <Text variant="h2">{title}</Text>
      <Button onPress={onNext}>{ctaLabel}</Button>
    </Flex>
  )
};

// TODO: Make the scene component reusable
function OnboardingStepNewDevice() {
  const [index, setIndex] = React.useState(0);
  const navigation = useNavigation();
  const route = useRoute<CurrentRouteType>();

  const { deviceModelId } = route.params;

  const nextPage = useCallback(
    () => {
      // TODO: FIX @react-navigation/native using Typescript
      // @ts-ignore next-line
      navigation.navigate(ScreenName.OnboardingQuiz, {
        ...route.params,
      })
    },
    [navigation, route.params],
  );

  // const scenes = useMemo(() => getSetupDeviceScenes(deviceModelId), [
  //   deviceModelId,
  // ]);
  
  // TODO: import correct color for ui package
  return (
      <Flex flex={1} width="100%" backgroundColor="background.main">
        <FlowStepper
          activeIndex={index}
          header={ImageHeader}
          renderTransition={renderTransitionSlide}
          transitionDuration={transitionDuration}
          progressBarProps={{ backgroundColor: "neutral.c40" }}
          extraProps={{
            onBack: index === 0 ? navigation.goBack : () => setIndex((index) => index - 1),
          }}
        >
          <Intro />
        </FlowStepper>
      </Flex>
  );
}

export default OnboardingStepNewDevice;
