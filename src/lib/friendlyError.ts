// =============================================================================
// Translate raw errors (Supabase / network / JS) into user-friendly messages.
// Falls back to the original message if no pattern matches, so we never hide
// information from technical users.
// =============================================================================

export function friendlyError(err: unknown): string {
  const raw = extractMessage(err);
  if (!raw) return 'Something went wrong. Please try again.';

  const lower = raw.toLowerCase();

  // Auth / session
  if (lower.includes('jwt') && (lower.includes('expired') || lower.includes('invalid'))) {
    return 'Your session expired. Sign in again to continue.';
  }
  if (lower.includes('email not confirmed')) {
    return 'You haven\'t confirmed your email yet. Check your inbox for the link.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid password')) {
    return 'That email and password don\'t match. Double-check and try again.';
  }

  // Network
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return 'Couldn\'t reach the server. Check your connection and try again.';
  }

  // Storage / upload
  if (lower.includes('payload too large') || lower.includes('exceeds')) {
    return 'That file is too large to upload.';
  }
  if (lower.includes('not allowed') && lower.includes('mime')) {
    return 'That file type isn\'t supported.';
  }

  // RLS / permissions
  if (lower.includes('row-level security') || lower.includes('row level security') || lower.includes('permission denied')) {
    return 'You don\'t have permission to do that.';
  }

  // Postgres uniqueness
  if (lower.includes('duplicate key') || lower.includes('unique constraint')) {
    return 'That already exists.';
  }

  // FK violation
  if (lower.includes('foreign key') || lower.includes('violates foreign key constraint')) {
    return 'That action would leave something in a broken state. Refresh and try again.';
  }

  // Rate limits
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many requests in a short time. Wait a moment, then try again.';
  }

  // Strip noisy prefixes ("Error: ", supabase codes, etc.) and capitalize.
  return prettify(raw);
}

function extractMessage(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { message?: string; error_description?: string; details?: string };
    return anyErr.message || anyErr.error_description || anyErr.details || JSON.stringify(err);
  }
  return String(err);
}

function prettify(s: string): string {
  let out = s.replace(/^Error:\s*/i, '').trim();
  // Drop bracketed Postgres codes like "[42501]"
  out = out.replace(/^\[[A-Z0-9]+\]\s*/i, '');
  if (!out) return 'Something went wrong. Please try again.';
  return out.charAt(0).toUpperCase() + out.slice(1);
}
