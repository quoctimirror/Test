/**
 * EventChooseNotePageV2 - Page wrapper for choose note shape screen v2 (simplified)
 * Uses the new card flip implementation that works better on Safari
 */
import ChooseNoteShapeScreenV2 from '@/components/event/screens/ChooseNoteShapeScreenV2';
import EventProgressBar from '@/components/event/EventProgressBar';
import '@/styles/event.css';
import './your-wallpaper.css';

const EventChooseNotePageV2 = () => {
  return (
    <>
      <EventProgressBar />
      <ChooseNoteShapeScreenV2 />
    </>
  );
};

export default EventChooseNotePageV2;
