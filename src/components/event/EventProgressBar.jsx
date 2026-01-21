/**
 * EventProgressBar - Progress bar for event flow
 * Shows progress from Login to ThankYou page with smooth animation
 * Persists progress between page navigations using sessionStorage
 *
 * Steps:
 * 1. Login
 * 2. Name
 * 3. Choose Shape
 * 4. Your Note
 * 5. Your Melody
 * 6. Your Wallpaper
 * 7. Thank You
 */
import { useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import './EventProgressBar.css';

// SessionStorage key for persisting progress
const PROGRESS_STORAGE_KEY = 'event_progress_percent';

// Define the steps in order
const EVENT_STEPS = [
  { route: ROUTES.EVENT_LOGIN, step: 1 },
  { route: ROUTES.EVENT_NAME, step: 2 },
  { route: ROUTES.EVENT_CHOOSE_SHAPE, step: 3 },
  { route: ROUTES.EVENT_PLACE_NOTE, step: 4 },
  { route: ROUTES.EVENT_WRITE_MESSAGE, step: 5 },
  { route: ROUTES.EVENT_CHOOSE_NOTE, step: 6 },
  { route: ROUTES.EVENT_CHOOSE_NOTE_V2, step: 6 }, // Same step as choose note
  { route: ROUTES.EVENT_THANKYOU, step: 7 },
];

const TOTAL_STEPS = 7;

// Get saved progress from sessionStorage
const getSavedProgress = () => {
  try {
    const saved = sessionStorage.getItem(PROGRESS_STORAGE_KEY);
    return saved ? parseFloat(saved) : 0;
  } catch {
    return 0;
  }
};

// Save progress to sessionStorage
const saveProgress = (percent) => {
  try {
    sessionStorage.setItem(PROGRESS_STORAGE_KEY, percent.toString());
  } catch {
    // Ignore storage errors
  }
};

const EventProgressBar = () => {
  const location = useLocation();
  const hasAnimated = useRef(false);

  // Calculate current step based on route
  const currentStep = useMemo(() => {
    const currentRoute = EVENT_STEPS.find(
      (item) => item.route === location.pathname
    );
    return currentRoute ? currentRoute.step : 1;
  }, [location.pathname]);

  // Calculate progress percentage
  const targetPercent = useMemo(() => {
    return (currentStep / TOTAL_STEPS) * 100;
  }, [currentStep]);

  // Get initial value from sessionStorage (previous page's progress)
  const initialPercent = useMemo(() => {
    return getSavedProgress();
  }, []);

  // Use spring animation for smooth progress - start from saved position
  const springConfig = { stiffness: 80, damping: 20, mass: 0.8 };
  const progressSpring = useSpring(initialPercent, springConfig);

  // Animate to target on mount and when target changes
  useEffect(() => {
    // Small delay to ensure DOM is ready, then animate to target
    const timer = setTimeout(() => {
      progressSpring.set(targetPercent);
      hasAnimated.current = true;
    }, 50);

    return () => clearTimeout(timer);
  }, [targetPercent, progressSpring]);

  // Save progress when it changes (for next page)
  useEffect(() => {
    saveProgress(targetPercent);
  }, [targetPercent]);

  // Transform spring value to width percentage
  const width = useTransform(progressSpring, (value) => `${value}%`);

  return (
    <div className="event-progress-bar">
      <motion.div
        className="event-progress-bar__fill"
        style={{ width }}
      />
    </div>
  );
};

export default EventProgressBar;
