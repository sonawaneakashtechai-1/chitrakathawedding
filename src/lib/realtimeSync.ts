import { supabase, isSupabaseConfigured } from './supabase';

export type RealtimeTable = 'site_settings' | 'categories' | 'portfolio_items' | 'services' | 'faqs' | 'enquiries' | 'films' | 'all';
export type RealtimeAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC';

export interface RealtimeSyncPayload {
  table: RealtimeTable;
  action: RealtimeAction;
  data?: any;
  timestamp: string;
}

// Single persistent BroadcastChannel for cross-tab in same browser
const crossTabChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('chitrakatha_realtime_bus')
  : null;

// Single shared Supabase Realtime channel instance
let sharedSupabaseChannel: any = null;

function getOrCreateSupabaseChannel() {
  if (!sharedSupabaseChannel && isSupabaseConfigured && supabase) {
    sharedSupabaseChannel = supabase.channel('chitrakatha_live_sync', {
      config: {
        broadcast: { self: false },
      },
    });
    sharedSupabaseChannel.subscribe();
  }
  return sharedSupabaseChannel;
}

/**
 * Broadcasts a change from Admin to all open browsers/devices via:
 * 1. Local DOM CustomEvent (same window)
 * 2. HTML5 BroadcastChannel (all tabs in same browser)
 * 3. Supabase Realtime WebSocket Broadcast (all remote devices/browsers)
 */
export async function broadcastRealtimeChange(
  table: RealtimeTable,
  action: RealtimeAction = 'UPDATE',
  data?: any
) {
  const payload: RealtimeSyncPayload = {
    table,
    action,
    data,
    timestamp: new Date().toISOString(),
  };

  // 1. Same-window CustomEvent
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chitrakatha_data_updated', { detail: payload }));
  }

  // 2. Cross-tab BroadcastChannel for same browser
  if (crossTabChannel) {
    try {
      crossTabChannel.postMessage(payload);
    } catch (e) {
      console.warn('Cross-tab broadcast notice:', e);
    }
  }

  // 3. Supabase Realtime WebSocket across different browsers/devices
  if (isSupabaseConfigured && supabase) {
    try {
      const channel = getOrCreateSupabaseChannel();
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'data_updated',
          payload,
        });
      }
    } catch (err) {
      console.warn('Supabase Realtime broadcast notice:', err);
    }
  }
}

/**
 * Subscribes to real-time changes across Supabase Realtime WebSockets, Postgres Changes, and Cross-Tab bus.
 */
export function subscribeToRealtimeChanges(
  onUpdate: (payload: RealtimeSyncPayload) => void
): () => void {
  // 1. Listen for local window events
  const handleLocalEvent = (e: any) => {
    if (e.detail) {
      onUpdate(e.detail);
    } else {
      onUpdate({ table: 'all', action: 'SYNC', timestamp: new Date().toISOString() });
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('chitrakatha_data_updated', handleLocalEvent);
  }

  // 2. Listen for cross-tab messages
  const handleCrossTab = (e: MessageEvent) => {
    if (e.data) {
      onUpdate(e.data);
    }
  };
  if (crossTabChannel) {
    crossTabChannel.addEventListener('message', handleCrossTab);
  }

  // 3. Listen for Supabase Realtime WebSocket changes & Postgres WAL changes
  let realtimeSub: any = null;
  if (isSupabaseConfigured && supabase) {
    realtimeSub = supabase
      .channel('chitrakatha_sub_' + Math.random().toString(36).substring(2, 7))
      .on('broadcast', { event: 'data_updated' }, (res: any) => {
        if (res.payload) {
          onUpdate(res.payload);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (p: any) => {
        onUpdate({ table: 'site_settings', action: p.eventType || 'UPDATE', data: p.new, timestamp: new Date().toISOString() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (p: any) => {
        onUpdate({ table: 'categories', action: p.eventType || 'UPDATE', data: p.new, timestamp: new Date().toISOString() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_items' }, (p: any) => {
        onUpdate({ table: 'portfolio_items', action: p.eventType || 'UPDATE', data: p.new, timestamp: new Date().toISOString() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (p: any) => {
        onUpdate({ table: 'services', action: p.eventType || 'UPDATE', data: p.new, timestamp: new Date().toISOString() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'films' }, (p: any) => {
        onUpdate({ table: 'films', action: p.eventType || 'UPDATE', data: p.new, timestamp: new Date().toISOString() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, (p: any) => {
        onUpdate({ table: 'faqs', action: p.eventType || 'UPDATE', data: p.new, timestamp: new Date().toISOString() });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, (p: any) => {
        onUpdate({ table: 'enquiries', action: p.eventType || 'UPDATE', data: p.new, timestamp: new Date().toISOString() });
      })
      .subscribe();
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('chitrakatha_data_updated', handleLocalEvent);
    }
    if (crossTabChannel) {
      crossTabChannel.removeEventListener('message', handleCrossTab);
    }
    if (realtimeSub && supabase) {
      supabase.removeChannel(realtimeSub);
    }
  };
}
