/**
 * Ably Real-time WebSocket Service
 * Provides real-time messaging for the Mirror Diamond Event
 */
import Ably from 'ably';

let ablyClient = null;

/**
 * Get or create the Ably client instance (singleton)
 */
export function getAblyClient() {
  if (!ablyClient && typeof window !== 'undefined') {
    const apiKey = import.meta.env.VITE_ABLY_API_KEY;

    if (!apiKey || apiKey === 'your-ably-api-key') {
      console.warn('Ably API key not configured. Real-time features will be disabled.');
      return null;
    }

    ablyClient = new Ably.Realtime({
      key: apiKey,
      clientId: `user-${Math.random().toString(36).substr(2, 9)}`,
    });
  }
  return ablyClient;
}

/**
 * Check if Ably is configured
 */
export function isAblyConfigured() {
  const apiKey = import.meta.env.VITE_ABLY_API_KEY;
  return apiKey && apiKey !== 'your-ably-api-key';
}

// Channel names
const CHANNELS = {
  notes: 'mirror-diamond:notes',
  stats: 'mirror-diamond:stats',
  luckyDraw: 'mirror-diamond:lucky-draw',
};

// ============================================================
// BROADCAST FUNCTIONS (Publishing)
// ============================================================

/**
 * Broadcast when a new note is added
 */
export async function broadcastNoteAdded(note) {
  try {
    const client = getAblyClient();
    if (!client) {
      console.warn('Ably client not available, cannot broadcast note');
      return;
    }

    // Wait for connection to be ready
    if (client.connection.state !== 'connected') {
      console.log('Ably: Waiting for connection...');
      await new Promise((resolve) => {
        client.connection.once('connected', resolve);
        // Timeout after 5 seconds
        setTimeout(resolve, 5000);
      });
    }

    const channel = client.channels.get(CHANNELS.notes);
    await channel.publish('note:added', {
      note,
      timestamp: Date.now(),
    });
    console.log('Ably: Note broadcast successful', note.id);
  } catch (error) {
    console.error('Failed to broadcast note:', error);
  }
}

/**
 * Broadcast stats update
 */
export function broadcastStatsUpdate(stats) {
  try {
    const client = getAblyClient();
    if (!client) return;

    const channel = client.channels.get(CHANNELS.stats);
    channel.publish('stats:updated', {
      ...stats,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to broadcast stats:', error);
  }
}

/**
 * Broadcast lucky draw start
 */
export function broadcastLuckyDrawStart() {
  try {
    const client = getAblyClient();
    if (!client) return;

    const channel = client.channels.get(CHANNELS.luckyDraw);
    channel.publish('draw:started', {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to broadcast draw start:', error);
  }
}

/**
 * Broadcast lucky draw winner
 */
export function broadcastWinner(winner) {
  try {
    const client = getAblyClient();
    if (!client) return;

    const channel = client.channels.get(CHANNELS.luckyDraw);
    channel.publish('draw:winner', {
      ...winner,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to broadcast winner:', error);
  }
}

// ============================================================
// SUBSCRIPTION FUNCTIONS (Receiving)
// ============================================================

/**
 * Subscribe to notes channel
 * @param {Function} callback - Called with new note data
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotesChannel(callback) {
  try {
    const client = getAblyClient();
    if (!client) {
      console.warn('Ably client not available, cannot subscribe to notes');
      return () => {};
    }

    const channel = client.channels.get(CHANNELS.notes);

    const listener = (message) => {
      console.log('Ably: Received note:added event', message.data);
      if (message.data?.note) {
        callback(message.data.note);
      }
    };

    channel.subscribe('note:added', listener);
    console.log('Ably: Subscribed to notes channel');

    return () => {
      channel.unsubscribe('note:added', listener);
      console.log('Ably: Unsubscribed from notes channel');
    };
  } catch (error) {
    console.error('Failed to subscribe to notes:', error);
    return () => {};
  }
}

/**
 * Subscribe to stats channel
 * @param {Function} callback - Called with stats data
 * @returns {Function} Unsubscribe function
 */
export function subscribeToStatsChannel(callback) {
  try {
    const client = getAblyClient();
    if (!client) return () => {};

    const channel = client.channels.get(CHANNELS.stats);

    const listener = (message) => {
      callback(message.data);
    };

    channel.subscribe('stats:updated', listener);

    return () => {
      channel.unsubscribe('stats:updated', listener);
    };
  } catch (error) {
    console.error('Failed to subscribe to stats:', error);
    return () => {};
  }
}

/**
 * Subscribe to lucky draw channel
 * @param {Object} callbacks - Object with onDrawStart and onWinnerSelected callbacks
 * @returns {Function} Unsubscribe function
 */
export function subscribeToLuckyDrawChannel({ onDrawStart, onWinnerSelected }) {
  try {
    const client = getAblyClient();
    if (!client) return () => {};

    const channel = client.channels.get(CHANNELS.luckyDraw);

    const startListener = () => {
      onDrawStart?.();
    };

    const winnerListener = (message) => {
      onWinnerSelected?.(message.data);
    };

    channel.subscribe('draw:started', startListener);
    channel.subscribe('draw:winner', winnerListener);

    return () => {
      channel.unsubscribe('draw:started', startListener);
      channel.unsubscribe('draw:winner', winnerListener);
    };
  } catch (error) {
    console.error('Failed to subscribe to lucky draw:', error);
    return () => {};
  }
}

// ============================================================
// CONNECTION MANAGEMENT
// ============================================================

/**
 * Listen to connection state changes
 * @param {Function} callback - Called with connection state
 * @returns {Function} Unsubscribe function
 */
export function onConnectionStateChange(callback) {
  try {
    const client = getAblyClient();
    if (!client) {
      callback('disconnected');
      return () => {};
    }

    const listener = (stateChange) => {
      callback(stateChange.current);
    };

    client.connection.on(listener);

    // Call immediately with current state
    callback(client.connection.state);

    return () => {
      client.connection.off(listener);
    };
  } catch (error) {
    console.error('Failed to setup connection listener:', error);
    return () => {};
  }
}

/**
 * Get current connection state
 */
export function getConnectionState() {
  const client = getAblyClient();
  return client?.connection?.state || 'disconnected';
}

/**
 * Close the Ably connection
 */
export function closeConnection() {
  if (ablyClient) {
    ablyClient.close();
    ablyClient = null;
  }
}
