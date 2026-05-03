<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:50',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8|confirmed',
            'account_type'  => ['required', 'string', Rule::in([User::ACCOUNT_PLAYER, User::ACCOUNT_CLUB])],
            'club_name'     => [
                'nullable',
                'string',
                'max:120',
                Rule::requiredIf(fn () => $this->input('account_type') === User::ACCOUNT_CLUB),
            ],
        ];
    }
}
