/**
 * EventChooseNotePage - Page wrapper for choose note shape screen (step 3)
 */
import ChooseNoteShapeScreenNew from '@/components/event/screens/ChooseNoteShapeScreenNew';
import EventProgressBar from '@/components/event/EventProgressBar';
import '@/styles/event.css';
import './your-wallpaper.css';

const EventChooseNotePage = () => {
  return (
    <>
      <EventProgressBar />
      <ChooseNoteShapeScreenNew />
    </>
  );
};

export default EventChooseNotePage;
