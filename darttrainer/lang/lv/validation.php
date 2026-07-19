<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validācijas valodas rindas
    |--------------------------------------------------------------------------
    |
    | Šīs rindas satur noklusējuma kļūdu ziņojumus, ko izmanto validatora
    | klase. Dažiem noteikumiem, piem., "size", ir vairākas versijas atkarībā
    | no validējamā atribūta tipa (string/numeric/file/array).
    |
    */

    'accepted' => ':attribute lauks jāapstiprina.',
    'accepted_if' => ':attribute lauks jāapstiprina, kad :other ir :value.',
    'active_url' => ':attribute nav derīgs URL.',
    'after' => ':attribute laukam jābūt datumam pēc :date.',
    'after_or_equal' => ':attribute laukam jābūt datumam pēc vai vienādam ar :date.',
    'alpha' => ':attribute drīkst saturēt tikai burtus.',
    'alpha_dash' => ':attribute drīkst saturēt tikai burtus, ciparus, defises un pasvītrojumus.',
    'alpha_num' => ':attribute drīkst saturēt tikai burtus un ciparus.',
    'array' => ':attribute laukam jābūt sarakstam.',
    'ascii' => ':attribute drīkst saturēt tikai vienbaita alfanumēriskās rakstzīmes un simbolus.',
    'before' => ':attribute laukam jābūt datumam pirms :date.',
    'before_or_equal' => ':attribute laukam jābūt datumam pirms vai vienādam ar :date.',
    'between' => [
        'array' => ':attribute laukā jābūt no :min līdz :max ierakstiem.',
        'file' => ':attribute laukam jābūt no :min līdz :max kilobaitiem.',
        'numeric' => ':attribute vērtībai jābūt no :min līdz :max.',
        'string' => ':attribute garumam jābūt no :min līdz :max rakstzīmēm.',
    ],
    'boolean' => ':attribute laukam jābūt true vai false.',
    'can' => ':attribute laukā ir nederīga vērtība.',
    'confirmed' => ':attribute apstiprinājums nesakrīt.',
    'contains' => ':attribute laukā trūkst nepieciešamās vērtības.',
    'current_password' => 'Parole nav pareiza.',
    'date' => ':attribute nav derīgs datums.',
    'date_equals' => ':attribute laukam jābūt datumam, kas vienāds ar :date.',
    'date_format' => ':attribute nesakrīt ar formātu :format.',
    'decimal' => ':attribute laukam jābūt ar :decimal decimālzīmēm.',
    'declined' => ':attribute jānoraida.',
    'declined_if' => ':attribute jānoraida, kad :other ir :value.',
    'different' => ':attribute un :other laukiem jābūt atšķirīgiem.',
    'digits' => ':attribute laukam jāsatur :digits cipari.',
    'digits_between' => ':attribute laukam jāsatur no :min līdz :max cipariem.',
    'dimensions' => ':attribute laukam ir nederīgas attēla dimensijas.',
    'distinct' => ':attribute laukam ir dublēta vērtība.',
    'doesnt_end_with' => ':attribute nedrīkst beigties ar kādu no: :values.',
    'doesnt_start_with' => ':attribute nedrīkst sākties ar kādu no: :values.',
    'email' => ':attribute laukam jābūt derīgai e-pasta adresei.',
    'ends_with' => ':attribute jābeidzas ar kādu no: :values.',
    'enum' => 'Izvēlētā :attribute vērtība nav derīga.',
    'exists' => 'Izvēlētā :attribute vērtība nav derīga.',
    'extensions' => ':attribute laukam jābūt ar kādu no failu paplašinājumiem: :values.',
    'failed' => 'Akreditācijas dati neatbilst mūsu ierakstiem.',
    'file' => ':attribute laukam jābūt failam.',
    'filled' => ':attribute laukam jābūt vērtībai.',
    'gt' => [
        'array' => ':attribute laukā jābūt vairāk par :value ierakstiem.',
        'file' => ':attribute laukam jābūt lielākam par :value kilobaitiem.',
        'numeric' => ':attribute vērtībai jābūt lielākai par :value.',
        'string' => ':attribute garumam jābūt lielākam par :value rakstzīmēm.',
    ],
    'gte' => [
        'array' => ':attribute laukā jābūt :value vai vairāk ierakstiem.',
        'file' => ':attribute laukam jābūt lielākam vai vienādam ar :value kilobaitiem.',
        'numeric' => ':attribute vērtībai jābūt lielākai vai vienādai ar :value.',
        'string' => ':attribute garumam jābūt lielākam vai vienādam ar :value rakstzīmēm.',
    ],
    'hex_color' => ':attribute laukam jābūt derīgai heksadecimālajai krāsai.',
    'image' => ':attribute laukam jābūt attēlam.',
    'in' => 'Izvēlētā :attribute vērtība nav derīga.',
    'in_array' => ':attribute laukam jāeksistē :other vērtībā.',
    'integer' => ':attribute laukam jābūt veselam skaitlim.',
    'ip' => ':attribute laukam jābūt derīgai IP adresei.',
    'ipv4' => ':attribute laukam jābūt derīgai IPv4 adresei.',
    'ipv6' => ':attribute laukam jābūt derīgai IPv6 adresei.',
    'json' => ':attribute laukam jābūt derīgai JSON virknei.',
    'list' => ':attribute laukam jābūt sarakstam.',
    'lowercase' => ':attribute laukam jābūt mazajiem burtiem.',
    'lt' => [
        'array' => ':attribute laukā jābūt mazāk par :value ierakstiem.',
        'file' => ':attribute laukam jābūt mazākam par :value kilobaitiem.',
        'numeric' => ':attribute vērtībai jābūt mazākai par :value.',
        'string' => ':attribute garumam jābūt mazākam par :value rakstzīmēm.',
    ],
    'lte' => [
        'array' => ':attribute laukā nedrīkst būt vairāk par :value ierakstiem.',
        'file' => ':attribute laukam jābūt mazākam vai vienādam ar :value kilobaitiem.',
        'numeric' => ':attribute vērtībai jābūt mazākai vai vienādai ar :value.',
        'string' => ':attribute garumam jābūt mazākam vai vienādam ar :value rakstzīmēm.',
    ],
    'mac_address' => ':attribute laukam jābūt derīgai MAC adresei.',
    'max' => [
        'array' => ':attribute laukā nedrīkst būt vairāk par :max ierakstiem.',
        'file' => ':attribute nedrīkst būt lielāks par :max kilobaitiem.',
        'numeric' => ':attribute vērtība nedrīkst būt lielāka par :max.',
        'string' => ':attribute garums nedrīkst pārsniegt :max rakstzīmes.',
    ],
    'max_digits' => ':attribute laukam nedrīkst būt vairāk par :max cipariem.',
    'mimes' => ':attribute laukam jābūt failam ar tipu: :values.',
    'mimetypes' => ':attribute laukam jābūt failam ar tipu: :values.',
    'min' => [
        'array' => ':attribute laukā jābūt vismaz :min ierakstiem.',
        'file' => ':attribute jābūt vismaz :min kilobaitiem.',
        'numeric' => ':attribute vērtībai jābūt vismaz :min.',
        'string' => ':attribute garumam jābūt vismaz :min rakstzīmēm.',
    ],
    'min_digits' => ':attribute laukam jābūt vismaz :min cipariem.',
    'missing' => ':attribute laukam jātrūkst.',
    'missing_if' => ':attribute laukam jātrūkst, kad :other ir :value.',
    'missing_unless' => ':attribute laukam jātrūkst, ja vien :other nav :value.',
    'missing_with' => ':attribute laukam jātrūkst, kad ir :values.',
    'missing_with_all' => ':attribute laukam jātrūkst, kad ir :values.',
    'multiple_of' => ':attribute laukam jābūt :value daudzkārtnim.',
    'not_in' => 'Izvēlētā :attribute vērtība nav derīga.',
    'not_regex' => ':attribute formāts nav derīgs.',
    'numeric' => ':attribute laukam jābūt skaitlim.',
    'password' => [
        'letters' => ':attribute laukam jāsatur vismaz viens burts.',
        'mixed' => ':attribute laukam jāsatur vismaz viens lielais un viens mazais burts.',
        'numbers' => ':attribute laukam jāsatur vismaz viens cipars.',
        'symbols' => ':attribute laukam jāsatur vismaz viens simbols.',
        'uncompromised' => 'Norādītā :attribute vērtība parādās datu noplūdē. Lūdzu, izvēlies citu :attribute.',
    ],
    'present' => ':attribute laukam jābūt klāt.',
    'present_if' => ':attribute laukam jābūt klāt, kad :other ir :value.',
    'present_unless' => ':attribute laukam jābūt klāt, ja vien :other nav :value.',
    'present_with' => ':attribute laukam jābūt klāt, kad ir :values.',
    'present_with_all' => ':attribute laukam jābūt klāt, kad ir :values.',
    'prohibited' => ':attribute lauks ir aizliegts.',
    'prohibited_if' => ':attribute lauks ir aizliegts, kad :other ir :value.',
    'prohibited_unless' => ':attribute lauks ir aizliegts, ja vien :other nav :values.',
    'prohibits' => ':attribute laukam ir aizliegts, ka klāt ir :other.',
    'regex' => ':attribute formāts nav derīgs.',
    'required' => ':attribute lauks ir obligāts.',
    'required_array_keys' => ':attribute laukam jāsatur ieraksti: :values.',
    'required_if' => ':attribute lauks ir obligāts, kad :other ir :value.',
    'required_if_accepted' => ':attribute lauks ir obligāts, kad :other ir apstiprināts.',
    'required_if_declined' => ':attribute lauks ir obligāts, kad :other ir noraidīts.',
    'required_unless' => ':attribute lauks ir obligāts, ja vien :other nav :values.',
    'required_with' => ':attribute lauks ir obligāts, kad ir :values.',
    'required_with_all' => ':attribute lauks ir obligāts, kad ir :values.',
    'required_without' => ':attribute lauks ir obligāts, kad nav :values.',
    'required_without_all' => ':attribute lauks ir obligāts, kad nav neviena no: :values.',
    'same' => ':attribute un :other laukiem jāsakrīt.',
    'size' => [
        'array' => ':attribute laukā jābūt :size ierakstiem.',
        'file' => ':attribute jābūt :size kilobaitiem.',
        'numeric' => ':attribute vērtībai jābūt :size.',
        'string' => ':attribute garumam jābūt :size rakstzīmēm.',
    ],
    'starts_with' => ':attribute jāsākas ar kādu no: :values.',
    'string' => ':attribute laukam jābūt tekstam.',
    'timezone' => ':attribute laukam jābūt derīgai laika zonai.',
    'unique' => 'Šāda :attribute vērtība jau ir aizņemta.',
    'uploaded' => ':attribute augšupielāde neizdevās.',
    'uppercase' => ':attribute laukam jābūt lielajiem burtiem.',
    'url' => ':attribute laukam jābūt derīgam URL.',
    'ulid' => ':attribute laukam jābūt derīgam ULID.',
    'uuid' => ':attribute laukam jābūt derīgam UUID.',

    /*
    |--------------------------------------------------------------------------
    | Pielāgotas validācijas valodas rindas
    |--------------------------------------------------------------------------
    |
    | Šeit var norādīt pielāgotus ziņojumus konkrētiem atribūts.noteikums
    | kombinācijām, lai precīzāk formulētu ziņojumu konkrētam laukam.
    |
    */

    'custom' => [
        'email' => [
            'unique' => 'Ar šo e-pasta adresi jau ir reģistrēts konts.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Pielāgoti atribūtu nosaukumi
    |--------------------------------------------------------------------------
    |
    | Šeit var pārdefinēt lauku nosaukumus (piem., "email" → "e-pasts"), lai
    | tie tiktu izmantoti :attribute vietturī un ziņojumi izklausītos dabiski.
    |
    */

    'attributes' => [
        'name' => 'vārds',
        'email' => 'e-pasts',
        'password' => 'parole',
        'password_confirmation' => 'paroles apstiprinājums',
        'current_password' => 'pašreizējā parole',
        'token' => 'žetons',
        'club_name' => 'kluba nosaukums',
        'account_type' => 'konta tips',
    ],

];
