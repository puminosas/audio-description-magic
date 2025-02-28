
import { supabase } from '@/integrations/supabase/client';

/**
 * Siunčia el. laišką naudojant Supabase edge function
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  from,
  text
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, from, text },
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Siunčia pasveikinimo laišką naujam vartotojui
 */
export const sendWelcomeEmail = async (email: string, name: string = '') => {
  const displayName = name || email;
  
  return sendEmail({
    to: email,
    subject: 'Sveiki atvykę į AudioDescriptions!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4c1d95;">Sveiki atvykę į AudioDescriptions, ${displayName}!</h1>
        <p>Dėkojame, kad prisijungėte prie mūsų platformos. Su AudioDescriptions galėsite:</p>
        <ul>
          <li>Sukurti aukštos kokybės audio aprašymus savo produktams</li>
          <li>Pasiekti savo klientus įvairiomis kalbomis</li>
          <li>Pagerinti savo el. prekybos svetainės prieinamumą</li>
        </ul>
        <p>Kviečiame išbandyti mūsų <a href="${window.location.origin}/generator" style="color: #4c1d95; text-decoration: underline;">audio generatorių</a> jau dabar!</p>
        <p>Jei turite klausimų, drąsiai susisiekite su mumis.</p>
        <p>Sėkmės,<br>AudioDescriptions komanda</p>
      </div>
    `,
  });
};

/**
 * Siunčia pranešimą apie naują sugeneruotą audio failą
 */
export const sendAudioGeneratedEmail = async (
  email: string, 
  productName: string, 
  audioUrl: string
) => {
  return sendEmail({
    to: email,
    subject: 'Jūsų audio aprašymas buvo sugeneruotas',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4c1d95;">Jūsų audio aprašymas paruoštas!</h1>
        <p>Sveikiname! Jūsų audio aprašymas produktui "${productName}" buvo sėkmingai sugeneruotas.</p>
        <p>Galite peržiūrėti ir atsisiųsti savo audio failą čia:</p>
        <p><a href="${audioUrl}" style="display: inline-block; background-color: #4c1d95; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Klausyti audio</a></p>
        <p>Arba prisijunkite prie savo <a href="${window.location.origin}/dashboard" style="color: #4c1d95; text-decoration: underline;">valdymo skydelio</a>, kad pamatytumėte visus savo audio aprašymus.</p>
        <p>Ačiū, kad naudojatės AudioDescriptions!</p>
      </div>
    `,
  });
};

/**
 * Siunčia mėnesinę ataskaitą vartotojui
 */
export const sendMonthlyReport = async (
  email: string,
  stats: {
    totalAudios: number;
    newAudios: number;
    totalListens: number;
    mostPopular: string;
  }
) => {
  return sendEmail({
    to: email,
    subject: 'Jūsų mėnesinė AudioDescriptions ataskaita',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4c1d95;">Jūsų mėnesinė veiklos ataskaita</h1>
        <p>Štai jūsų audio aprašymų statistika už šį mėnesį:</p>
        <ul>
          <li>Viso audio aprašymų: <strong>${stats.totalAudios}</strong></li>
          <li>Nauji audio aprašymai šį mėnesį: <strong>${stats.newAudios}</strong></li>
          <li>Viso perklausų: <strong>${stats.totalListens}</strong></li>
          <li>Populiariausias audio aprašymas: <strong>${stats.mostPopular}</strong></li>
        </ul>
        <p>Prisijunkite prie <a href="${window.location.origin}/dashboard" style="color: #4c1d95; text-decoration: underline;">valdymo skydelio</a>, kad pamatytumėte išsamią statistiką.</p>
        <p>Ačiū, kad naudojatės AudioDescriptions!</p>
      </div>
    `,
  });
};
