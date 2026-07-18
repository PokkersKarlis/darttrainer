<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lietotāja dati front-end pusei. Tilts starp DB snake_case un Vue camelCase.
 *
 * @property-read User $resource
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->resource->id,
            'name'            => $this->resource->name,
            'email'           => $this->resource->email,
            'accountType'     => $this->resource->account_type ?? User::ACCOUNT_PLAYER,
            'clubName'        => $this->resource->club_name,
            'emailVerifiedAt' => $this->resource->email_verified_at?->toIso8601String(),
            'isAdmin'         => (bool) $this->resource->is_admin,
            'isBanned'        => (bool) $this->resource->is_banned,
            'banReason'       => $this->resource->is_banned ? $this->resource->ban_reason : null,
        ];
    }
}
