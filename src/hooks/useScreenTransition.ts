import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

export const useScreenTransition = (loadingDuration: number = 600) => {
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, loadingDuration);

      return () => clearTimeout(timer);
    }, [loadingDuration])
  );

  return isLoading;
};

export default useScreenTransition;
