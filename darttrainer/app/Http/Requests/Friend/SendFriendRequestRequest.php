<?php

namespace App\Http\Requests\Friend;

use Illuminate\Foundation\Http\FormRequest;

class SendFriendRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'userId' => 'required|integer|exists:users,id',
        ];
    }
}
