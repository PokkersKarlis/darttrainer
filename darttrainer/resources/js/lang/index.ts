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
import lvLegal from './lv/legal.json';
import lvCookies from './lv/cookies.json';
import lvHeader from './lv/header.json';

import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enGuest from './en/guest.json';
import enDashboard from './en/dashboard.json';
import enSettings from './en/settings.json';
import enLegal from './en/legal.json';
import enCookies from './en/cookies.json';
import enHeader from './en/header.json';

export const messages = {
    lv: { ...lvCommon, ...lvAuth, ...lvGuest, ...lvDashboard, ...lvSettings, ...lvLegal, ...lvCookies, ...lvHeader },
    en: { ...enCommon, ...enAuth, ...enGuest, ...enDashboard, ...enSettings, ...enLegal, ...enCookies, ...enHeader },
};
