/**
 * EventWriteMessagePage - Page wrapper for step 2 screen
 */
import WriteMessageScreenNew from '@/components/event/screens/WriteMessageScreenNew';
import EventProgressBar from '@/components/event/EventProgressBar';
import '@/styles/event.css';
import './your-melody.css';

const EventWriteMessagePage = () => {
  return (
    <>
      <EventProgressBar />
      <WriteMessageScreenNew />
    </>
  );
};

export default EventWriteMessagePage;
