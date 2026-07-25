<script setup lang="ts">
import { useLobbyInvites } from '@/composables/useLobbyInvites';
import { useLocale } from '@/composables/useLocale';
import { Mail, UserPlus, X } from 'lucide-vue-next';

const { t } = useLocale();
const { visibleInvites, acceptInvite, declineInvite, loadingInviteId } = useLobbyInvites();
</script>

<template>
    <div v-for="invite in visibleInvites" :key="invite.id" class="lib" role="status">
        <div class="lib-inner">
            <span class="lib-badge" aria-hidden="true">
                <Mail :size="14" :stroke-width="2.4" />
                {{ t('games.lobby.inviteReceived') }}
            </span>

            <p class="lib-text">
                {{ t('games.lobby.inviteReceivedBody', { name: invite.host_name }) }}
                <span v-if="invite.lobby_code" class="lib-code">
                    {{ t('games.lobby.activeLobbyCode', { code: invite.lobby_code }) }}
                </span>
            </p>

            <div class="lib-actions">
                <button type="button" class="lib-action lib-action--join" :disabled="loadingInviteId === invite.id" @click="acceptInvite(invite)">
                    <UserPlus :size="15" :stroke-width="2.2" />
                    {{ t('games.lobby.inviteJoin') }}
                </button>
                <button type="button" class="lib-action lib-action--decline" :disabled="loadingInviteId === invite.id" @click="declineInvite(invite)">
                    <X :size="15" :stroke-width="2.2" />
                    {{ t('games.lobby.inviteDecline') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.lib {
    border-bottom: 1px solid rgba(34, 211, 238, 0.28);
    background:
        radial-gradient(ellipse at left, rgba(34, 211, 238, 0.1), transparent 55%),
        linear-gradient(90deg, rgba(19, 26, 38, 0.98), rgba(13, 18, 32, 0.98));
}

.lib-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 20px;
}

.lib-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.45);
    background: rgba(34, 211, 238, 0.1);
    color: #22d3ee;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
}

.lib-text {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    color: #cbd5e1;
    font-size: 13px;
    line-height: 1.45;
}

.lib-code {
    display: inline-block;
    margin-left: 8px;
    color: #39ff14;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.lib-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.lib-action {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
    white-space: nowrap;
}

.lib-action:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.lib-action--join {
    border: 1px solid rgba(57, 255, 20, 0.45);
    background: rgba(57, 255, 20, 0.08);
    color: #39ff14;
}

.lib-action--join:hover:not(:disabled) {
    transform: translateY(-1px);
    background: rgba(57, 255, 20, 0.14);
    box-shadow: 0 8px 24px rgba(57, 255, 20, 0.12);
}

.lib-action--decline {
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(148, 163, 184, 0.06);
    color: #94a3b8;
}

.lib-action--decline:hover:not(:disabled) {
    transform: translateY(-1px);
    background: rgba(148, 163, 184, 0.1);
}

@media (max-width: 640px) {
    .lib-inner {
        padding: 10px 12px;
        gap: 8px;
    }

    .lib-badge {
        display: none;
    }

    .lib-code {
        display: block;
        margin: 4px 0 0;
    }

    .lib-actions {
        width: 100%;
    }

    .lib-action {
        flex: 1 1 0;
        justify-content: center;
    }
}

@media (prefers-reduced-motion: reduce) {
    .lib-action {
        transition: none;
    }

    .lib-action:hover:not(:disabled) {
        transform: none;
    }
}
</style>
