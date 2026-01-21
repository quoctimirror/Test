/**
 * EventPlaceNotePage - Page wrapper for new place note screen
 */
import PlaceNoteScreenNew from '@/components/event/screens/PlaceNoteScreenNew';
import EventProgressBar from '@/components/event/EventProgressBar';
import '@/styles/event.css';
import './your-note.css';

const EventPlaceNotePage = () => {
  return (
    <>
      <EventProgressBar />
      <PlaceNoteScreenNew />
    </>
  );
};

export default EventPlaceNotePage;
