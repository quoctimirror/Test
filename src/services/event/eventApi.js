/**
 * Event API Service
 * Handles all database operations for the event system via Supabase
 * Matching mirror-dmm-mvp structure
 */
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { calculateNotePositionByOrder } from '@/constants/eventConstants';

// Database table/view names (matching mirror-dmm-mvp)
const TABLES = {
  tickets: 'tickets',
  users: 'users',
  notes: 'notes',
  luckyDrawEntries: 'lucky_draw_entries',
};

const VIEWS = {
  notesWithUsers: 'notes_with_users',
  statsSummary: 'stats_summary',
};

// ============================================================
// TICKET OPERATIONS
// ============================================================

/**
 * Validate a ticket code
 * @param {string} code - Ticket code (e.g., "DMM-00001")
 * @returns {Object} { valid: boolean, ticket?: object, error?: string }
 */
export async function validateTicket(code) {
  // Demo mode
  if (!isSupabaseConfigured()) {
    return handleDemoTicketValidation(code);
  }

  try {
    const supabase = getSupabaseClient();

    const { data: ticket, error } = await supabase
      .from(TABLES.tickets)
      .select('id, code, is_used')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !ticket) {
      console.error('Ticket query error:', error);
      return { valid: false, error: 'Mã vé không hợp lệ' };
    }

    if (ticket.is_used) {
      return { valid: false, error: 'Mã vé đã được sử dụng' };
    }

    return { valid: true, ticket };
  } catch (error) {
    console.error('Ticket validation error:', error);
    return { valid: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
  }
}

/**
 * Demo mode ticket validation
 */
function handleDemoTicketValidation(code) {
  const upperCode = code.toUpperCase();
  // Accept codes starting with DMM- or MFD- in demo mode
  if ((upperCode.startsWith('DMM-') || upperCode.startsWith('MFD-')) && upperCode.length >= 6) {
    return {
      valid: true,
      ticket: {
        id: uuidv4(),
        code: upperCode,
        is_used: false,
      },
      isDemo: true,
    };
  }
  return { valid: false, error: 'Mã vé không hợp lệ (Demo: dùng DMM-xxxxx)' };
}

// ============================================================
// USER OPERATIONS
// ============================================================

/**
 * Register a Google user for the event
 * @param {Object} userData - Google user data
 * @param {string} userData.googleId - Google user ID (Supabase auth user id)
 * @param {string} userData.email - User's email
 * @param {string} userData.displayName - User's display name from Google
 * @returns {Object} { success: boolean, user?: object, error?: string }
 */
export async function registerGoogleUser(userData) {
  const { googleId, email, displayName } = userData;

  // Demo mode
  if (!isSupabaseConfigured()) {
    return handleDemoGoogleRegistration(userData);
  }

  try {
    const supabase = getSupabaseClient();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from(TABLES.users)
      .select('id, display_name, light_number, email, google_id')
      .eq('google_id', googleId)
      .single();

    if (existingUser && !checkError) {
      // User already exists, return existing data
      return {
        success: true,
        user: {
          id: existingUser.id,
          googleId: existingUser.google_id,
          email: existingUser.email,
          displayName: existingUser.display_name,
          lightNumber: existingUser.light_number,
          createdAt: new Date(),
        },
      };
    }

    // Get next light number
    const { count } = await supabase
      .from(TABLES.users)
      .select('*', { count: 'exact', head: true });

    const lightNumber = (count || 0) + 1;

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from(TABLES.users)
      .insert({
        google_id: googleId,
        email: email,
        display_name: displayName.trim(),
        light_number: lightNumber,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert user error:', insertError);
      return { success: false, error: 'Không thể đăng ký. Vui lòng thử lại.' };
    }

    return {
      success: true,
      user: {
        id: newUser.id,
        googleId: newUser.google_id,
        email: newUser.email,
        displayName: newUser.display_name,
        lightNumber: newUser.light_number,
        createdAt: new Date(newUser.created_at),
      },
    };
  } catch (error) {
    console.error('Google registration error:', error);
    return { success: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
  }
}

/**
 * Demo mode Google registration
 */
function handleDemoGoogleRegistration(userData) {
  const lightNumber = Math.floor(Math.random() * 1000) + 1;
  return {
    success: true,
    user: {
      id: uuidv4(),
      googleId: userData.googleId,
      email: userData.email,
      displayName: userData.displayName.trim(),
      lightNumber,
      createdAt: new Date(),
    },
    isDemo: true,
  };
}

/**
 * Get user's existing note from Supabase
 * Used to restore state when user logs in again
 * @param {string} userId - User ID (from users table)
 * @returns {Object} { hasNote: boolean, note?: object, user?: object }
 */
export async function getUserExistingNote(userId) {
  if (!isSupabaseConfigured()) {
    return { hasNote: false };
  }

  try {
    const supabase = getSupabaseClient();

    // Get user's note from notes_with_users view
    const { data: note, error } = await supabase
      .from(VIEWS.notesWithUsers)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !note) {
      return { hasNote: false };
    }

    return {
      hasNote: true,
      note: {
        id: note.id,
        diamondShape: note.diamond_shape,
        pitch: note.pitch,
        positionX: note.position_x,
        positionY: note.position_y,
        createdAt: new Date(note.created_at),
      },
      user: {
        displayName: note.display_name,
        lightNumber: note.light_number,
      },
    };
  } catch (error) {
    console.error('Get existing note error:', error);
    return { hasNote: false };
  }
}

/**
 * Get user by Google ID to check if already registered
 * @param {string} googleId - Google/Supabase auth user ID
 * @returns {Object} { exists: boolean, user?: object, hasNote?: boolean, note?: object }
 */
export async function checkExistingGoogleUser(googleId) {
  if (!isSupabaseConfigured()) {
    return { exists: false };
  }

  try {
    const supabase = getSupabaseClient();

    // Get user by google_id
    const { data: user, error } = await supabase
      .from(TABLES.users)
      .select('id, display_name, light_number, email, google_id')
      .eq('google_id', googleId)
      .single();

    if (error || !user) {
      return { exists: false };
    }

    // Check if user has a note
    const noteResult = await getUserExistingNote(user.id);

    return {
      exists: true,
      user: {
        id: user.id,
        googleId: user.google_id,
        email: user.email,
        displayName: user.display_name,
        lightNumber: user.light_number,
      },
      hasNote: noteResult.hasNote,
      note: noteResult.note,
    };
  } catch (error) {
    console.error('Check existing user error:', error);
    return { exists: false };
  }
}

/**
 * Register a new user for the event (legacy - ticket-based)
 * Uses the claim_ticket RPC function (matching mirror-dmm-mvp)
 * @param {string} ticketCode - The validated ticket code
 * @param {string} displayName - User's display name
 * @returns {Object} { success: boolean, user?: object, error?: string }
 */
export async function registerUser(ticketCode, displayName) {
  // Demo mode
  if (!isSupabaseConfigured()) {
    return handleDemoUserRegistration(ticketCode, displayName);
  }

  try {
    const supabase = getSupabaseClient();

    // Call the claim_ticket RPC function (same as mirror-dmm-mvp)
    const { data, error } = await supabase.rpc('claim_ticket', {
      ticket_code: ticketCode.toUpperCase(),
      user_display_name: displayName.trim(),
    });

    if (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Không thể đăng ký. Vui lòng thử lại.' };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Đăng ký thất bại' };
    }

    return {
      success: true,
      user: {
        id: data.user_id,
        ticketId: ticketCode,
        displayName: displayName.trim(),
        lightNumber: data.light_number,
        createdAt: new Date(),
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
  }
}

/**
 * Demo mode user registration
 */
function handleDemoUserRegistration(ticketCode, displayName) {
  const lightNumber = Math.floor(Math.random() * 1000) + 1;
  return {
    success: true,
    user: {
      id: uuidv4(),
      ticketId: ticketCode,
      displayName: displayName.trim(),
      lightNumber,
      createdAt: new Date(),
    },
    isDemo: true,
  };
}

// ============================================================
// NOTE OPERATIONS
// ============================================================

/**
 * Place a note on the music staff
 * Uses the place_note RPC function (matching mirror-dmm-mvp)
 * @param {Object} noteData - Note data
 * @returns {Object} { success: boolean, note?: object, error?: string }
 */
export async function placeNote(noteData) {
  const { userId, userDisplayName, diamondShape, pitch, positionX, positionY } = noteData;

  // Demo mode
  if (!isSupabaseConfigured()) {
    return handleDemoPlaceNote(noteData);
  }

  try {
    const supabase = getSupabaseClient();

    // Call the place_note RPC function (same as mirror-dmm-mvp)
    const { data, error } = await supabase.rpc('place_note', {
      p_user_id: userId,
      p_diamond_shape: diamondShape,
      p_pitch: pitch,
      p_position_x: positionX,
      p_position_y: positionY,
    });

    if (error) {
      console.error('Place note error:', error);
      return { success: false, error: 'Không thể đặt nốt. Vui lòng thử lại.' };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Đặt nốt thất bại' };
    }

    return {
      success: true,
      note: {
        id: data.note_id,
        userId,
        userDisplayName,
        diamondShape,
        pitch,
        positionX,
        positionY,
        createdAt: new Date(),
      },
    };
  } catch (error) {
    console.error('Place note error:', error);
    return { success: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
  }
}

/**
 * Demo mode place note
 */
function handleDemoPlaceNote(noteData) {
  return {
    success: true,
    note: {
      id: uuidv4(),
      ...noteData,
      createdAt: new Date(),
    },
    isDemo: true,
  };
}

/**
 * Fetch all notes
 * Uses the notes_with_users view (matching mirror-dmm-mvp)
 * Position X is recalculated based on order (created_at) to ensure left-to-right placement
 * @returns {Array} Array of notes
 */
export async function fetchAllNotes() {
  // Demo mode
  if (!isSupabaseConfigured()) {
    return getDemoNotes();
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from(VIEWS.notesWithUsers)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch notes error:', error);
      return [];
    }

    // Recalculate positionX based on order (index) - from left to right
    return (data || []).map((row, index) => ({
      id: row.id,
      userId: row.user_id,
      userDisplayName: row.display_name,
      diamondShape: row.diamond_shape,
      pitch: row.pitch,
      positionX: calculateNotePositionByOrder(index + 1), // Recalculate based on order
      positionY: row.position_y,
      createdAt: new Date(row.created_at),
    }));
  } catch (error) {
    console.error('Fetch notes error:', error);
    return [];
  }
}

/**
 * Demo notes for testing
 */
function getDemoNotes() {
  return [
    {
      id: '1',
      userId: 'demo-1',
      userDisplayName: 'Demo User 1',
      diamondShape: 'round',
      pitch: 'C4',
      positionX: 10,
      positionY: 0,
      createdAt: new Date(),
    },
    {
      id: '2',
      userId: 'demo-2',
      userDisplayName: 'Demo User 2',
      diamondShape: 'heart',
      pitch: 'F4',
      positionX: 25,
      positionY: 3,
      createdAt: new Date(),
    },
    {
      id: '3',
      userId: 'demo-3',
      userDisplayName: 'Demo User 3',
      diamondShape: 'oval',
      pitch: 'D4',
      positionX: 40,
      positionY: 1,
      createdAt: new Date(),
    },
  ];
}

// ============================================================
// STATS OPERATIONS
// ============================================================

/**
 * Fetch event statistics
 * Uses the stats_summary view (matching mirror-dmm-mvp)
 * @returns {Object} { totalTickets, usedTickets, totalNotes, participationRate }
 */
export async function fetchStats() {
  // Demo mode
  if (!isSupabaseConfigured()) {
    return {
      totalTickets: 100,
      usedTickets: 15,
      totalNotes: 12,
      totalParticipants: 15,
      participationRate: 15,
      isDemo: true,
    };
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from(VIEWS.statsSummary)
      .select('*')
      .single();

    if (error) {
      console.error('Fetch stats error:', error);
      return null;
    }

    return {
      totalTickets: data.total_tickets || 0,
      usedTickets: data.used_tickets || 0,
      totalNotes: data.total_notes || 0,
      totalParticipants: data.used_tickets || 0,
      participationRate: data.participation_rate || 0,
    };
  } catch (error) {
    console.error('Fetch stats error:', error);
    return null;
  }
}

// ============================================================
// ADMIN OPERATIONS
// ============================================================

/**
 * Import tickets from CSV data
 * @param {Array} ticketCodes - Array of ticket codes
 * @returns {Object} { success: boolean, imported: number, duplicates: number }
 */
export async function importTickets(ticketCodes) {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      imported: ticketCodes.length,
      duplicates: 0,
      isDemo: true,
    };
  }

  try {
    const supabase = getSupabaseClient();

    const tickets = ticketCodes
      .filter((code) => code && code.trim())
      .map((code) => ({ code: code.trim().toUpperCase() }));

    const { data, error } = await supabase
      .from(TABLES.tickets)
      .upsert(tickets, { onConflict: 'code', ignoreDuplicates: true })
      .select();

    if (error) {
      console.error('Import tickets error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      imported: data?.length || 0,
      duplicates: tickets.length - (data?.length || 0),
    };
  } catch (error) {
    console.error('Import tickets error:', error);
    return { success: false, error: 'Import thất bại' };
  }
}

/**
 * Pick a random lucky draw winner
 * Uses the pick_lucky_winner RPC function (matching mirror-dmm-mvp)
 * @param {number} round - Draw round number
 * @returns {Object} Winner data
 */
export async function pickLuckyWinner(round = 1) {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      winner: {
        userId: 'demo-winner',
        lightNumber: Math.floor(Math.random() * 100) + 1,
        displayName: 'Demo Winner',
        diamondShape: 'heart',
      },
      isDemo: true,
    };
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('pick_lucky_winner', {
      p_draw_round: round,
    });

    if (error) {
      console.error('Pick winner error:', error);
      return { success: false, error: 'Không thể quay thưởng' };
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Không có người tham gia' };
    }

    return {
      success: true,
      winner: {
        userId: data.winner.user_id,
        lightNumber: data.winner.light_number,
        displayName: data.winner.display_name,
        diamondShape: data.winner.diamond_shape || 'heart',
      },
    };
  } catch (error) {
    console.error('Pick winner error:', error);
    return { success: false, error: 'Lỗi kết nối' };
  }
}

/**
 * Get recent notes for admin dashboard
 * @param {number} limit - Number of notes to fetch
 * @returns {Array} Recent notes
 */
export async function getRecentNotes(limit = 50) {
  if (!isSupabaseConfigured()) {
    return getDemoNotes();
  }

  try {
    const supabase = getSupabaseClient();

    // First get total count to calculate order
    const { count } = await supabase
      .from(VIEWS.notesWithUsers)
      .select('*', { count: 'exact', head: true });

    const { data, error } = await supabase
      .from(VIEWS.notesWithUsers)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Fetch recent notes error:', error);
      return [];
    }

    // For recent notes (descending), calculate order from total count
    return (data || []).map((row, index) => ({
      id: row.id,
      userId: row.user_id,
      userDisplayName: row.display_name,
      lightNumber: row.light_number,
      diamondShape: row.diamond_shape,
      pitch: row.pitch,
      positionX: calculateNotePositionByOrder(count - index), // Order based on total count
      positionY: row.position_y,
      createdAt: new Date(row.created_at),
    }));
  } catch (error) {
    console.error('Fetch recent notes error:', error);
    return [];
  }
}

// ============================================================
// REALTIME SUBSCRIPTION (via Supabase Realtime)
// ============================================================

/**
 * Subscribe to notes changes via Supabase Realtime
 * (Alternative to Ably for simpler setup)
 * @param {Function} callback - Called with new note data
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotesRealtime(callback) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel('notes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
        },
        async (payload) => {
          // Fetch the full note with user info
          const { data } = await supabase
            .from(VIEWS.notesWithUsers)
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback({
              id: data.id,
              userId: data.user_id,
              userDisplayName: data.display_name,
              diamondShape: data.diamond_shape,
              pitch: data.pitch,
              positionX: data.position_x,
              positionY: data.position_y,
              createdAt: new Date(data.created_at),
            });
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Subscribe to notes error:', error);
    return () => {};
  }
}
