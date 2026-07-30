import { createClient } from 'npm:@supabase/supabase-js@2.110.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
const cronSecret = Deno.env.get('DEBT_REMINDER_CRON_SECRET') ?? '';
const fromEmail = Deno.env.get('REMINDER_FROM_EMAIL') ?? 'Debt Tracker <onboarding@resend.dev>';
const supabase = createClient(supabaseUrl, serviceRoleKey);

interface DebtReminder {
  id: string;
  user_id: string;
  person_name: string;
  item_name: string;
}

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character] ?? character);
}

function targetDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 3);
  return date.toISOString().slice(0, 10);
}

async function sendEmail(to: string, debt: DebtReminder) {
  const person = escapeHtml(debt.person_name);
  const item = escapeHtml(debt.item_name);
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: `Напоминание: ${debt.person_name} должен вернуть ${debt.item_name}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px">
        <h1 style="font-size:24px">До срока осталось 3 дня</h1>
        <p style="font-size:17px;line-height:1.6"><strong>${person}</strong> ещё не вернул вам <strong>${item}</strong>.</p>
        <p style="color:#6b6578">Откройте приложение «Долги», чтобы посмотреть запись или изменить срок.</p>
      </div>`,
    }),
  });
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!cronSecret || request.headers.get('x-cron-secret') !== cronSecret) {
    return json({ error: 'Unauthorized' }, 401);
  }
  if (!resendKey || !supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Reminder service is not configured' }, 503);
  }

  const { data, error } = await supabase
    .from('debts')
    .select('id,user_id,person_name,item_name')
    .eq('status', 'active')
    .eq('due_at', targetDate())
    .is('reminder_3d_sent_at', null);
  if (error) return json({ error: 'Could not load reminders' }, 500);

  let sent = 0;
  for (const debt of (data ?? []) as DebtReminder[]) {
    const { data: userData } = await supabase.auth.admin.getUserById(debt.user_id);
    if (!userData.user?.email) continue;
    const response = await sendEmail(userData.user.email, debt);
    if (!response.ok) continue;
    await supabase.from('debts').update({ reminder_3d_sent_at: new Date().toISOString() }).eq('id', debt.id);
    sent += 1;
  }

  return json({ checked: data?.length ?? 0, sent });
});
