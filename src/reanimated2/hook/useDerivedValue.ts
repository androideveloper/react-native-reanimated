import { useEffect, useRef } from 'react';
import { initialUpdaterRun } from '../animation';
import { InferAnimationReturnType } from '../animation/commonTypes';
import { Animation, BasicWorkletFunction, SharedValue } from '../commonTypes';
import { makeMutable, startMapper, stopMapper } from '../core';
import { DependencyList } from './commonTypes';
import { shouldBeUseWeb } from '../PlatformChecker';

export type DerivedValue<T> = Readonly<SharedValue<T>>;

function useDerivedValue<T extends Animation<T>>(
  processor: BasicWorkletFunction<Animation<T>>,
  dependencies?: DependencyList
): DerivedValue<InferAnimationReturnType<T>>;

function useDerivedValue<T>(
  processor: BasicWorkletFunction<T>,
  dependencies?: DependencyList
): DerivedValue<T>;

function useDerivedValue<T>(
  processor: BasicWorkletFunction<T>,
  dependencies?: DependencyList
): DerivedValue<T> {
  const initRef = useRef<SharedValue<T> | null>(null);
  let inputs = Object.values(processor._closure ?? {});
  if (shouldBeUseWeb()) {
    if (!inputs.length && dependencies?.length) {
      // let web work without a Babel/SWC plugin
      inputs = dependencies;
    }
  }

  // build dependencies
  if (dependencies === undefined) {
    dependencies = [...inputs, processor.__workletHash];
  } else {
    dependencies.push(processor.__workletHash);
  }

  if (initRef.current === null) {
    initRef.current = makeMutable(initialUpdaterRun(processor));
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sharedValue: SharedValue<T> = initRef.current!;

  useEffect(() => {
    const fun = () => {
      'worklet';
      sharedValue.value = processor();
    };
    const mapperId = startMapper(fun, inputs, [sharedValue]);
    return () => {
      stopMapper(mapperId);
    };
  }, dependencies);

  useEffect(() => {
    return () => {
      initRef.current = null;
    };
  }, []);

  return sharedValue;
}

export { useDerivedValue };
