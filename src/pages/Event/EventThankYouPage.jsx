/**
 * EventThankYouPage - Page wrapper for thank you screen (final step)
 */
import ThankYouScreen from '@/components/event/screens/ThankYouScreen';
import EventProgressBar from '@/components/event/EventProgressBar';
import '@/styles/event.css';
import './mirror-thankyou.css';

const EventThankYouPage = () => {
  return (
    <>
      <EventProgressBar />
      <ThankYouScreen />
    </>
  );
};

export default EventThankYouPage;
