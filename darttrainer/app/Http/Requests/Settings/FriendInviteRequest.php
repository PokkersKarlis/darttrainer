<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FriendInviteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['nullable', 'string', 'email', 'max:255', 'required_without:user_id'],
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id'),
                'required_without:email',
            ],
        ];
    }
}
