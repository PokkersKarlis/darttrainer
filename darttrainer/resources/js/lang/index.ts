/**
 * Apvieno visus pa moduļiem sadalītos tulkojumu failus vienā ziņojumu kokā
 * katrai valodai. Katra faila augšējā līmeņa atslēgas ir savstarpēji unikālas
 * (auth/guest/seo/features/closing/tournamentBlock/reportsBlock/header/nav/...)
 */
import lvCommon from './lv/common.json';
import lvAuth from './lv/auth.json';
import lvGuest from './lv/guest.json';
import lvDashboard from './lv/dashboard.json';
import lvSettings from './lv/settings.json';

import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enGuest from './en/guest.json';
import enDashboard from './en/dashboard.json';
import enSettings from './en/settings.json';

export const messages = {
    lv: { ...lvCommon, ...lvAuth, ...lvGuest, ...lvDashboard, ...lvSettings },
    en: { ...enCommon, ...enAuth, ...enGuest, ...enDashboard, ...enSettings },
};
