import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getPendingGamificationSummaryAPI } from '../../redux/callapis/CommonService';
import { navigationRef } from '../../checkpurpose/NavigationService';

const GamificationGate = () => {
  const checkedRef = useRef(false);
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
  const loginToken = useSelector((state) => state.user.loginToken);

  useEffect(() => {
    if (!loginToken || isSkippedLogin || checkedRef.current) {
      return;
    }

    let cancelled = false;
    let retryTimer;
    let navigationAttempts = 0;

    const checkPendingSummary = async () => {
      if (cancelled || checkedRef.current) {
        return;
      }

      if (!navigationRef.isReady()) {
        navigationAttempts += 1;
        if (navigationAttempts < 20) {
          retryTimer = setTimeout(checkPendingSummary, 250);
        }
        return;
      }

      checkedRef.current = true;
      try {
        const response = await getPendingGamificationSummaryAPI();
        const summary = response?.response?.summary;
        if (!cancelled && summary) {
          navigationRef.navigate('GamificationSummary', { summary });
        }
      } catch (error) {
        checkedRef.current = false;
      }
    };

    retryTimer = setTimeout(checkPendingSummary, 700);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [isSkippedLogin, loginToken]);

  return null;
};

export default GamificationGate;
